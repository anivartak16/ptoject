import { Demand, Lot, Offer, Transaction, User } from "../models/index.js";
import { ok } from "../utils/response.js";

export async function summary(req, res, next) {
  try {
    const userId = req.user._id;

    if (req.user.role === "BUYER") {
      const [activeDemands, pendingOffers, activeTransactions] =
        await Promise.all([
          Demand.countDocuments({ buyer: userId, status: "ACTIVE" }),
          Offer.countDocuments({ buyer: userId, status: "PENDING" }),
          Transaction.countDocuments({
            buyer: userId,
            status: { $nin: ["COMPLETED", "CANCELLED"] },
          }),
        ]);
      return ok(res, {
        role: "BUYER",
        activeDemands,
        pendingOffers,
        activeTransactions,
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

    const [activeLots, volume, farmerLotIds, activeTransactions] =
      await Promise.all([
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
    });
  } catch (error) {
    next(error);
  }
}
