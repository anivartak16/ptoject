import { Demand, Lot, Offer, Transaction, User } from "../models/index.js";
import { ok } from "../utils/response.js";

export async function summary(req, res, next) {
  try {
    const userId = req.user._id;

    if (req.user.role === "BUYER") {
      const [
        activeDemands,
        pendingOffers,
        activeTransactions,
        lotsCount,
        volumeAgg,
        recentDemands,
      ] = await Promise.all([
        Demand.countDocuments({ buyer: userId, status: "ACTIVE" }),
        Offer.countDocuments({ buyer: userId, status: "PENDING" }),
        Transaction.countDocuments({
          buyer: userId,
          status: { $nin: ["COMPLETED", "CANCELLED"] },
        }),
        Lot.countDocuments({ status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] } }),
        Lot.aggregate([
          { $match: { status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] } } },
          { $group: { _id: null, total: { $sum: "$remainingQuantity" } } },
        ]),
        Demand.find({ buyer: userId })
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),
      ]);

      return ok(res, {
        role: "BUYER",
        activeDemands,
        pendingOffers,
        activeTransactions,
        availableLots: lotsCount,
        availableVolume: volumeAgg[0]?.total || 0,
        recentDemands,
      });
    }

    if (req.user.role === "FPO") {
      const fpo = await User.findById(userId).select("members");
      const members = fpo?.members || [];
      const owners = [...members, userId];
      const [memberCount, activeLots, volume, fpoLotIds] = await Promise.all([
        User.countDocuments({ _id: { $in: members } }),
        Lot.countDocuments({
          owner: { $in: owners },
          status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
        }),
        Lot.aggregate([
          {
            $match: {
              owner: { $in: owners },
              status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
            },
          },
          { $group: { _id: null, total: { $sum: "$remainingQuantity" } } },
        ]),
        Lot.find({ owner: userId }).distinct("_id"),
      ]);
      const pendingOffers = await Offer.countDocuments({
        lot: { $in: fpoLotIds },
        status: "PENDING",
      });
      return ok(res, {
        role: "FPO",
        members: memberCount,
        activeLots,
        pooledVolume: volume[0]?.total || 0,
        pendingOffers,
      });
    }

    if (req.user.role === "KRISHI_KENDRA") {
      const [
        pendingCount,
        verifiedCount,
        rejectedCount,
        recentLots,
        farmersServedAgg,
      ] = await Promise.all([
        Lot.countDocuments({ status: "PENDING_VERIFICATION" }),
        Lot.countDocuments({
          status: { $in: ["VERIFIED", "AVAILABLE", "PARTIALLY_SOLD", "SOLD"] },
        }),
        Lot.countDocuments({ status: "REJECTED" }),
        Lot.find({
          status: {
            $in: ["PENDING_VERIFICATION", "VERIFIED", "REJECTED"],
          },
        })
          .sort({ updatedAt: -1 })
          .limit(6)
          .populate("owner quality"),
        Lot.aggregate([
          {
            $match: {
              status: {
                $in: ["VERIFIED", "AVAILABLE", "PARTIALLY_SOLD", "SOLD"],
              },
            },
          },
          { $group: { _id: "$owner" } },
          { $count: "total" },
        ]),
      ]);

      return ok(res, {
        role: "KRISHI_KENDRA",
        pendingInspections: pendingCount,
        verifiedLots: verifiedCount,
        rejectedLots: rejectedCount,
        farmersServed: farmersServedAgg[0]?.total || 0,
        recentLots,
      });
    }

    const [
      activeLots,
      volume,
      farmerLotIds,
      activeTransactions,
      pendingVerificationLots,
      verifiedLotsReadyToPublish,
    ] = await Promise.all([
      Lot.countDocuments({
        owner: userId,
        status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
      }),
      Lot.aggregate([
        {
          $match: {
            owner: userId,
            status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$remainingQuantity" } } },
      ]),
      Lot.find({ owner: userId }).distinct("_id"),
      Transaction.countDocuments({
        seller: userId,
        status: { $nin: ["COMPLETED", "CANCELLED"] },
      }),
      Lot.countDocuments({ owner: userId, status: "PENDING_VERIFICATION" }),
      Lot.countDocuments({ owner: userId, status: "VERIFIED" }),
    ]);
    const pendingOffers = await Offer.countDocuments({
      lot: { $in: farmerLotIds },
      status: "PENDING",
    });
    return ok(res, {
      role: "FARMER",
      activeLots,
      availableVolume: volume[0]?.total || 0,
      pendingOffers,
      activeTransactions,
      pendingVerificationLots,
      verifiedLotsReadyToPublish,
    });
  } catch (error) {
    next(error);
  }
}
