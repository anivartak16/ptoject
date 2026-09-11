import { Transaction, Payment, Lot, Notification } from "../models/index.js";
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
    const transaction = await Transaction.findById(req.params.id).populate("lot buyer seller");
    if (!transaction) return fail(res, 404, "Transaction not found", "NOT_FOUND");

    const isBuyer = String(transaction.buyer?._id || transaction.buyer) === String(req.user._id);
    const isSeller = String(transaction.seller?._id || transaction.seller) === String(req.user._id);
    const isAdmin = req.user.role === "ADMIN";

    if (!isAdmin && !isBuyer && !isSeller) {
      return fail(res, 403, "Not a participant in this transaction");
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

    if (!isAdmin && req.body.status === "DISPUTED") {
      return fail(res, 403, "Only an administrator can mark a formal dispute status");
    }

    const prevStatus = transaction.status;
    const nextStatus = req.body.status;

    transaction.status = nextStatus;
    transaction.events.push({
      status: nextStatus,
      note: req.body.note || `Status transitioned from ${prevStatus} to ${nextStatus}`,
      at: new Date(),
    });

    // If deal is completed, ensure escrow payment is settled
    if (nextStatus === "COMPLETED") {
      const payment = await Payment.findOne({ transaction: transaction._id });
      if (payment && payment.status !== "PAID") {
        payment.status = "PAID";
        payment.paidAt = new Date();
        await payment.save();
      }
    }

    // If deal is cancelled, return produce quantity to the lot
    if (nextStatus === "CANCELLED" && prevStatus !== "CANCELLED" && transaction.lot) {
      const lot = await Lot.findById(transaction.lot._id || transaction.lot);
      if (lot) {
        lot.remainingQuantity = Math.min(lot.quantity, lot.remainingQuantity + transaction.quantity);
        if (lot.status === "SOLD") lot.status = "AVAILABLE";
        await lot.save();
      }
    }

    await transaction.save();

    // Notify other party
    const targetUserId = isBuyer ? transaction.seller?._id : transaction.buyer?._id;
    if (targetUserId) {
      await Notification.create({
        user: targetUserId,
        message: `Transaction for ${transaction.lot?.commodity || "order"} updated to ${nextStatus}.`,
        type: "TRANSACTION_UPDATE",
      });
    }

    return ok(res, transaction, "Transaction updated successfully");
  } catch (error) {
    next(error);
  }
}

