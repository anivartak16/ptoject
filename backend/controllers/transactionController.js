import { Transaction } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getTransactions(req, res, next) {
  try {
    const filter =
      req.user.role === "ADMIN"
        ? {}
        : { $or: [{ buyer: req.user._id }, { seller: req.user._id }] };

    const transactions = await Transaction.find(filter)
      .populate("lot buyer seller")
      .sort({ createdAt: -1 });

    return ok(res, transactions);
  } catch (error) {
    next(error);
  }
}

export async function updateTransactionStatus(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return fail(res, 404, "Transaction not found", "NOT_FOUND");

    if (
      req.user.role !== "ADMIN" &&
      String(transaction.buyer) !== String(req.user._id) &&
      String(transaction.seller) !== String(req.user._id)
    ) {
      return fail(res, 403, "Not a participant");
    }

    const allowedStatuses = [
      "CREATED",
      "CONFIRMED",
      "IN_TRANSIT",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED",
      "DISPUTED",
    ];

    if (!allowedStatuses.includes(req.body.status)) {
      return fail(res, 422, "Invalid transaction status");
    }

    if (req.user.role !== "ADMIN" && req.body.status === "DISPUTED") {
      return fail(res, 403, "Only an administrator can mark a dispute");
    }

    transaction.status = req.body.status;
    transaction.events.push({
      status: req.body.status,
      note: req.body.note || "Status updated",
    });

    await transaction.save();
    return ok(res, transaction, "Transaction updated");
  } catch (error) {
    next(error);
  }
}
