import { User, Transaction } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getBuyerReliability(req, res, next) {
  try {
    const buyer = await User.findOne({ _id: req.params.id, role: "BUYER" });
    if (!buyer) return fail(res, 404, "Buyer not found", "NOT_FOUND");

    const tx = await Transaction.find({ buyer: buyer._id });
    const completed = tx.filter((x) => x.status === "COMPLETED").length;
    const cancelled = tx.filter((x) => x.status === "CANCELLED").length;
    const disputed = tx.filter((x) => x.status === "DISPUTED").length;

    const score = Math.max(
      0,
      Math.min(100, 85 + completed * 3 - cancelled * 10 - disputed * 12),
    );

    return ok(res, {
      buyer: { id: buyer._id, name: buyer.name },
      score,
      completed,
      cancelled,
      disputed,
      label: score >= 85 ? "Excellent" : score >= 65 ? "Good" : "Needs review",
    });
  } catch (error) {
    next(error);
  }
}
