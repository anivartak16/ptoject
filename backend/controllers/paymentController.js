import { Payment, Transaction } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getPayments(req, res, next) {
  try {
    const txFilter =
      req.user.role === "ADMIN"
        ? {}
        : { $or: [{ buyer: req.user._id }, { seller: req.user._id }] };

    const transactions = await Transaction.find(txFilter).select("_id");

    const payments = await Payment.find({
      transaction: { $in: transactions.map((x) => x._id) },
    }).populate({
      path: "transaction",
      populate: ["buyer", "seller", "lot"],
    });

    return ok(res, payments);
  } catch (error) {
    next(error);
  }
}

export async function getPaymentByTransaction(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) {
      return fail(res, 404, "Transaction not found", "NOT_FOUND");
    }

    if (
      req.user.role !== "ADMIN" &&
      String(transaction.buyer) !== String(req.user._id) &&
      String(transaction.seller) !== String(req.user._id)
    ) {
      return fail(res, 403, "Not a transaction participant", "FORBIDDEN");
    }

    const payment = await Payment.findOne({ transaction: transaction._id });
    return ok(res, payment);
  } catch (error) {
    next(error);
  }
}

export async function updatePaymentStatus(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) {
      return fail(res, 404, "Transaction not found", "NOT_FOUND");
    }

    if (
      req.user.role !== "ADMIN" &&
      String(transaction.buyer) !== String(req.user._id) &&
      String(transaction.seller) !== String(req.user._id)
    ) {
      return fail(res, 403, "Not a transaction participant", "FORBIDDEN");
    }

    if (
      !["PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED"].includes(
        req.body.status,
      )
    ) {
      return fail(res, 422, "Invalid payment status");
    }

    const payment = await Payment.findOne({ transaction: transaction._id });
    if (!payment) return fail(res, 404, "Payment not found");

    payment.status = req.body.status;
    if (req.body.status === "PAID") payment.paidAt = new Date();
    await payment.save();

    return ok(res, payment, "Payment updated");
  } catch (error) {
    next(error);
  }
}
