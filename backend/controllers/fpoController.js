import { User, Lot, Demand, Notification, Offer } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getFpoFarmers(req, res, next) {
  try {
    const search = (req.query.search || "").trim();
    const filter = {
      role: "FARMER",
      active: true,
      ...(search
        ? {
            $or: [
              { name: new RegExp(search, "i") },
              { email: new RegExp(search, "i") },
              { location: new RegExp(search, "i") },
            ],
          }
        : {}),
    };

    const farmers = await User.find(filter)
      .select("-password")
      .sort({ name: 1 })
      .limit(30);

    return ok(res, farmers);
  } catch (error) {
    next(error);
  }
}

export async function getFpoMembers(req, res, next) {
  try {
    const fpo = await User.findById(req.user._id).populate({
      path: "members",
      select: "name email phone location farmName primaryCrop verification",
    });

    return ok(res, fpo?.members || []);
  } catch (error) {
    next(error);
  }
}

export async function addFpoMember(req, res, next) {
  try {
    const farmer = await User.findOne({
      _id: req.body.farmerId,
      role: "FARMER",
      active: true,
    });

    if (!farmer) return fail(res, 404, "Farmer not found", "NOT_FOUND");

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { members: farmer._id },
    });

    return ok(res, farmer, "Farmer added to FPO");
  } catch (error) {
    next(error);
  }
}

export async function removeFpoMember(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { members: req.params.farmerId },
    });

    return ok(res, {}, "Farmer removed from FPO");
  } catch (error) {
    next(error);
  }
}

export async function getFpoLots(req, res, next) {
  try {
    const fpo = await User.findById(req.user._id).select("members");
    const lots = await Lot.find({
      owner: { $in: [...(fpo?.members || []), req.user._id] },
      status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
    })
      .populate("owner quality")
      .sort({ createdAt: -1 });

    return ok(res, lots);
  } catch (error) {
    next(error);
  }
}

export async function aggregateLots(req, res, next) {
  try {
    const ids = req.body.lotIds || [];
    const fpo = await User.findById(req.user._id).select("members location");
    const source = await Lot.find({
      _id: { $in: ids },
      owner: { $in: fpo?.members || [] },
      status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
    });

    if (!source.length) {
      return fail(res, 422, "Select at least one available lot");
    }

    const commodity = source[0].commodity;
    if (source.some((x) => x.commodity !== commodity)) {
      return fail(res, 422, "Only one commodity can be aggregated at a time");
    }

    const quantity = source.reduce((a, x) => a + x.remainingQuantity, 0);
    const lot = await Lot.create({
      owner: req.user._id,
      ownerType: "FPO",
      sourceLots: source.map((x) => x._id),
      commodity,
      quantity,
      remainingQuantity: quantity,
      unit: source[0].unit,
      location: req.user.location,
      expectedPrice:
        req.body.expectedPrice ||
        source.reduce((a, x) => a + x.expectedPrice, 0) / source.length,
      quality: source[0].quality,
      availableUntil:
        req.body.availableUntil || new Date(Date.now() + 14 * 86400000),
    });

    await Lot.updateMany(
      { _id: { $in: source.map((x) => x._id) } },
      { status: "CANCELLED" },
    );

    return ok(res, lot, "FPO aggregated lot created");
  } catch (error) {
    next(error);
  }
}

export async function getFpoMatches(req, res, next) {
  try {
    const fpo = await User.findById(req.user._id).select("members location");
    const memberIds = fpo?.members || [];

    // 1. Get all available FPO lots and member lots
    const lots = await Lot.find({
      owner: { $in: [req.user._id, ...memberIds] },
      status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
    }).populate("quality owner");

    // 2. Get active buyer demands with populated buyer credentials
    const demands = await Demand.find({ status: "ACTIVE" })
      .populate({
        path: "buyer",
        select:
          "name email phone organizationName location district state verification verificationBadge gstNumber panNumber buyerType tradeRating",
      })
      .sort({ createdAt: -1 });

    // 3. For each active demand, calculate matching score against FPO lots
    const matches = [];

    for (const demand of demands) {
      const demandCommodity = (demand.commodity || "").toLowerCase().trim();

      // Find candidate lots matching commodity (or alias)
      const matchingLots = lots.filter((l) => {
        const lotCommodity = (l.commodity || "").toLowerCase().trim();
        return (
          lotCommodity === demandCommodity ||
          lotCommodity.includes(demandCommodity) ||
          demandCommodity.includes(lotCommodity)
        );
      });

      for (const lot of matchingLots) {
        const quantityRatio = Math.min(
          (lot.remainingQuantity || 0) / (demand.requiredQuantity || 1),
          1
        );
        const quantityScore = Math.round(quantityRatio * 25);

        const gradeMatch =
          !demand.requiredQuality ||
          (lot.quality?.grade || "").toLowerCase() ===
            (demand.requiredQuality || "").toLowerCase();
        const qualityScore = gradeMatch ? 25 : 12;

        const priceScore =
          lot.expectedPrice <= demand.maxPrice
            ? 25
            : Math.max(
                0,
                Math.round(
                  25 -
                    ((lot.expectedPrice - demand.maxPrice) /
                      Math.max(demand.maxPrice, 1)) *
                      25
                )
              );

        const locationMatch =
          !demand.preferredLocation ||
          (lot.location || "")
            .toLowerCase()
            .includes((demand.preferredLocation || "").toLowerCase()) ||
          (demand.preferredLocation || "")
            .toLowerCase()
            .includes((lot.location || "").toLowerCase());
        const locationScore = locationMatch ? 15 : 8;

        const freshnessScore = 10;
        const totalScore = Math.min(
          100,
          quantityScore + qualityScore + priceScore + locationScore + freshnessScore
        );

        matches.push({
          demand,
          lot,
          matchScore: totalScore,
          isFpoAggregate: String(lot.owner?._id) === String(req.user._id),
          breakdown: {
            quantity: quantityScore,
            quality: qualityScore,
            price: priceScore,
            location: locationScore,
            availability: freshnessScore,
          },
          reasons: [
            `${quantityScore}/25 volume fit (${lot.remainingQuantity} kg / ${demand.requiredQuantity} kg)`,
            `${qualityScore}/25 quality fit (${lot.quality?.grade || "FAQ"} vs ${demand.requiredQuality || "Grade A"})`,
            `${priceScore}/25 price alignment (₹${lot.expectedPrice}/kg vs max ₹${demand.maxPrice}/kg)`,
            `${locationScore}/15 location fit (${lot.location || "Local"} -> ${demand.preferredLocation || "Pan-India"})`,
          ],
        });
      }
    }

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return ok(res, {
      fpoLotsCount: lots.length,
      activeDemandsCount: demands.length,
      matches,
      demands,
      fpoLots: lots,
    });
  } catch (error) {
    next(error);
  }
}

export async function connectFpoWithBuyer(req, res, next) {
  try {
    const { demandId, lotId, proposedPrice, proposedQuantity, message } =
      req.body;
    const demand = await Demand.findById(demandId).populate("buyer");
    if (!demand) return fail(res, 404, "Buyer demand not found");

    let lot = null;
    if (lotId) {
      lot = await Lot.findById(lotId);
    }

    const price = Number(proposedPrice) || demand.maxPrice;
    const qty = Number(proposedQuantity) || demand.requiredQuantity;

    // Create formal offer / supply proposal for the buyer
    const offer = await Offer.create({
      lot: lot ? lot._id : undefined,
      buyer: demand.buyer._id,
      quantity: qty,
      pricePerUnit: price,
      totalAmount: qty * price,
      message:
        message ||
        `FPO Supply Proposal from ${
          req.user.organizationName || req.user.name
        } for your ${demand.commodity} demand.`,
      status: "PENDING",
      validUntil: new Date(Date.now() + 7 * 86400000),
    });

    // Notify buyer immediately
    await Notification.create({
      user: demand.buyer._id,
      message: `Direct FPO Supply Proposal: ${
        req.user.organizationName || req.user.name
      } offered ${qty} kg ${demand.commodity} at ₹${price}/kg.`,
      type: "NEW_OFFER",
    });

    return ok(res, offer, "Supply proposal sent to buyer successfully");
  } catch (error) {
    next(error);
  }
}
