import {
  User,
  Lot,
  Demand,
  Offer,
  Transaction,
  Payment,
} from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getUsers(_req, res, next) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return ok(res, users);
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const allowed = {};
    if (["PENDING", "VERIFIED", "REJECTED"].includes(req.body.verification)) {
      allowed.verification = req.body.verification;
    }
    if (typeof req.body.active === "boolean") {
      allowed.active = req.body.active;
    }

    const user = await User.findByIdAndUpdate(req.params.id, allowed, {
      new: true,
    }).select("-password");

    if (!user) return fail(res, 404, "User not found");
    return ok(res, user, "User status updated");
  } catch (error) {
    next(error);
  }
}

export async function getSummary(_req, res, next) {
  try {
    // Fetch dashboard summary data in parallel
    const [farmers, buyers, lots, demands, transactions] = await Promise.all([
      User.countDocuments({ role: "FARMER" }),
      User.countDocuments({ role: "BUYER" }),
      Lot.countDocuments({
        status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
      }),
      Demand.countDocuments({ status: "ACTIVE" }),
      Transaction.find(),
    ]);

    return ok(res, {
      farmers,
      buyers,
      activeLots: lots,
      activeDemands: demands,
      transactions: transactions.length,
      tradeValue: transactions.reduce((a, t) => a + t.amount, 0),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(_req, res, next) {
  try {
    const [users, lots, demands, offers, transactions, payments] =
      await Promise.all([
        User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
        Lot.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              volume: { $sum: "$remainingQuantity" },
            },
          },
        ]),
        Demand.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Offer.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              value: { $sum: "$totalAmount" },
            },
          },
        ]),
        Transaction.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              value: { $sum: "$amount" },
            },
          },
        ]),
        Payment.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              value: { $sum: "$amount" },
            },
          },
        ]),
      ]);

    return ok(res, { users, lots, demands, offers, transactions, payments });
  } catch (error) {
    next(error);
  }
}