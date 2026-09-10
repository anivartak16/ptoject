import { Offer, Lot, Notification } from "../models/index.js";
import { acceptOffer as processAcceptOffer } from "../services/transaction.js";
import { ok, fail } from "../utils/response.js";

export async function getOffers(req, res, next) {
  try {
    const offers = await Offer.find()
      .populate({ path: "lot", populate: ["owner", "quality"] })
      .populate("buyer")
      .sort({ createdAt: -1 });

    const visible = offers.filter(
      (o) =>
        req.user.role === "ADMIN" ||
        String(o.buyer?._id) === String(req.user._id) ||
        String(o.lot?.owner?._id) === String(req.user._id),
    );

    return ok(res, visible);
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
