import { Offer, Lot, Notification } from "../models/index.js";
import { acceptOffer as processAcceptOffer } from "../services/transaction.js";
import { ok, fail } from "../utils/response.js";

function assessOfferRisk(offer) {
  const buyer = offer.buyer || {};
  const lot = offer.lot || {};
  const isVerifiedBuyer =
    buyer.verification === "VERIFIED" || Boolean(buyer.gstNumber);
  const expectedPrice = lot.expectedPrice || offer.pricePerUnit;
  const priceRatio = offer.pricePerUnit / (expectedPrice || 1);

  const warnings = [];
  let riskLevel = "LOW";
  let riskScore = 15;

  if (priceRatio >= 1.4) {
    riskScore += 45;
    warnings.push(
      `Price is ${Math.round(
        (priceRatio - 1) * 100
      )}% above expected farmer rate. Unusually high prices can indicate fake buyer lures to hijack produce without paying.`
    );
  } else if (priceRatio <= 0.6) {
    riskScore += 25;
    warnings.push(
      `Price is ${Math.round(
        (1 - priceRatio) * 100
      )}% below market standard rate.`
    );
  }

  if (!isVerifiedBuyer) {
    riskScore += 30;
    warnings.push(
      "Buyer has not completed GST/Mandi license verification. Escrow deposit mandatory."
    );
  }

  if (riskScore >= 60) {
    riskLevel = "HIGH";
  } else if (riskScore >= 35) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "LOW";
  }

  return {
    riskLevel,
    riskScore,
    isSuspicious: riskLevel === "HIGH",
    warnings,
    isVerifiedBuyer,
    recommendation:
      riskLevel === "HIGH"
        ? "🚨 CAUTION: High Risk / Suspicious Offer! Do not dispatch produce without full Escrow locking."
        : riskLevel === "MEDIUM"
        ? "⚠️ Notice: Check payment lock in Escrow before dispatch."
        : "🛡️ Verified safe offer with Escrow assurance.",
  };
}

function calculateNetRealisation(pricePerUnit, quantity, distanceKm = 25) {
  const gross = (pricePerUnit || 0) * (quantity || 0);
  const mandiFee = Math.round(gross * 0.015);
  const estimatedTransport = Math.round(distanceKm * 0.08 * (quantity || 0));
  const handling = Math.round((quantity || 0) * 0.2);
  const netEarnings = Math.max(
    0,
    gross - mandiFee - estimatedTransport - handling
  );
  const netPerKg = +(netEarnings / (quantity || 1)).toFixed(2);

  return {
    grossAmount: gross,
    mandiFee,
    estimatedTransport,
    handling,
    netEarnings,
    netPerKg,
  };
}

export async function getOffers(req, res, next) {
  try {
    const offers = await Offer.find()
      .populate({ path: "lot", populate: ["owner", "quality"] })
      .populate({
        path: "buyer",
        select:
          "name email phone organizationName location district state verification verificationBadge gstNumber panNumber buyerType tradeRating",
      })
      .sort({ createdAt: -1 });

    const visible = offers.filter(
      (o) =>
        req.user.role === "ADMIN" ||
        String(o.buyer?._id) === String(req.user._id) ||
        String(o.lot?.owner?._id) === String(req.user._id)
    );

    const enriched = visible.map((o) => {
      const obj = o.toObject();
      obj.riskAssessment = assessOfferRisk(o);
      obj.netRealisation = calculateNetRealisation(o.pricePerUnit, o.quantity);
      return obj;
    });

    return ok(res, enriched);
  } catch (error) {
    next(error);
  }
}

export async function createOffer(req, res, next) {
  try {
    const { lotId, quantity, pricePerUnit, message, validUntil } = req.body;
    const lot = await Lot.findById(lotId);
    if (!lot || lot.status === "SOLD") {
      return fail(res, 404, "Available lot not found", "NOT_FOUND");
    }
    if (quantity > lot.remainingQuantity) {
      return fail(res, 409, "Offer exceeds remaining quantity", "OVERSALE");
    }

    const offer = await Offer.create({
      lot: lotId,
      buyer: req.user._id,
      quantity,
      pricePerUnit,
      totalAmount: quantity * pricePerUnit,
      message,
      validUntil,
    });

    await Notification.create({
      user: lot.owner,
      message: `New offer for ${lot.commodity}: ₹${pricePerUnit}/kg`,
      type: "NEW_OFFER",
    });

    return ok(res, offer, "Offer created successfully");
  } catch (error) {
    next(error);
  }
}

export async function acceptOffer(req, res, _next) {
  try {
    const transaction = await processAcceptOffer(req.params.id, req.user);
    return ok(res, transaction, "Offer accepted and transaction created");
  } catch (e) {
    return fail(
      res,
      e.message.includes("quantity") ? 409 : 403,
      e.message,
      "OFFER_ACCEPT_FAILED",
    );
  }
}

export async function rejectOffer(req, res, next) {
  try {
    const offer = await Offer.findById(req.params.id).populate("lot");
    if (!offer || String(offer.lot?.owner) !== String(req.user._id)) {
      return fail(res, 403, "Only lot owner can reject");
    }

    offer.status = "REJECTED";
    await offer.save();
    return ok(res, offer, "Offer rejected");
  } catch (error) {
    next(error);
  }
}
