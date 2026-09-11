import { Payment, Transaction, Notification } from "../models/index.js";
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
    })
      .populate({
        path: "transaction",
        populate: [
          { path: "buyer", select: "name email phone location district" },
          { path: "seller", select: "name email phone location district farmName" },
          { path: "lot", select: "commodity variety grade quality status expectedPricePerUnit" },
        ],
      })
      .sort({ createdAt: -1 });

    return ok(res, payments);
  } catch (error) {
    next(error);
  }
}

export async function getPaymentByTransaction(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.transactionId).populate([
      { path: "buyer", select: "name email phone location district" },
      { path: "seller", select: "name email phone location district farmName" },
      { path: "lot", select: "commodity variety grade quality status expectedPricePerUnit" },
    ]);
    if (!transaction) {
      return fail(res, 404, "Transaction not found", "NOT_FOUND");
    }

    if (
      req.user.role !== "ADMIN" &&
      String(transaction.buyer?._id || transaction.buyer) !== String(req.user._id) &&
      String(transaction.seller?._id || transaction.seller) !== String(req.user._id)
    ) {
      return fail(res, 403, "Not a transaction participant", "FORBIDDEN");
    }

    let payment = await Payment.findOne({ transaction: transaction._id });
    if (!payment) {
      payment = await Payment.create({
        transaction: transaction._id,
        amount: transaction.amount,
        status: "PENDING",
      });
    }

    return ok(res, { payment, transaction });
  } catch (error) {
    next(error);
  }
}

export async function processPayment(req, res, next) {
  try {
    const { transactionId } = req.params;
    const { paymentMethod = "UPI", remarks, simulateFailure = false } = req.body;

    const transaction = await Transaction.findById(transactionId).populate([
      { path: "buyer", select: "name email phone location district" },
      { path: "seller", select: "name email phone location district farmName" },
      { path: "lot", select: "commodity variety grade quality status expectedPricePerUnit" },
    ]);

    if (!transaction) {
      return fail(res, 404, "Transaction not found", "NOT_FOUND");
    }

    if (
      req.user.role !== "ADMIN" &&
      String(transaction.buyer?._id || transaction.buyer) !== String(req.user._id)
    ) {
      return fail(res, 403, "Only the buyer can make payment for this transaction", "FORBIDDEN");
    }

    if (transaction.status === "COMPLETED") {
      return fail(res, 400, "Transaction is already completed", "ALREADY_COMPLETED");
    }

    if (transaction.status === "CANCELLED") {
      return fail(res, 400, "Cannot pay for a cancelled transaction", "CANCELLED");
    }

    let payment = await Payment.findOne({ transaction: transaction._id });
    if (!payment) {
      payment = new Payment({
        transaction: transaction._id,
        amount: transaction.amount,
      });
    }

    if (simulateFailure) {
      payment.status = "FAILED";
      payment.paymentMethod = paymentMethod;
      payment.remarks = "Payment failed: Bank simulator rejected transaction.";
      await payment.save();
      return fail(res, 402, "Payment declined by issuing bank or gateway simulator.", "PAYMENT_FAILED");
    }

    const refId =
      "KL-PAY-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.floor(1000 + Math.random() * 9000);

    payment.amount = transaction.amount;
    payment.paymentMethod = paymentMethod;
    payment.referenceId = refId;
    payment.status = "PAID";
    payment.paidAt = new Date();
    payment.remarks = remarks || `Escrow settlement secured via ${paymentMethod}. Ref: ${refId}`;
    await payment.save();

    // Advance transaction status to CONFIRMED
    if (transaction.status === "CREATED") {
      transaction.status = "CONFIRMED";
    }
    transaction.events.push({
      status: transaction.status,
      note: `Escrow payment of ₹${transaction.amount?.toLocaleString("en-IN")} received via ${paymentMethod}. Ref: ${refId}`,
      at: new Date(),
    });
    await transaction.save();

    // Send notification to seller (farmer)
    const sellerId = transaction.seller?._id || transaction.seller;
    if (sellerId) {
      await Notification.create({
        user: sellerId,
        message: `₹${transaction.amount?.toLocaleString("en-IN")} secured in KrishiLink Escrow for ${transaction.lot?.commodity || "order"}. You can now arrange dispatch.`,
        type: "PAYMENT_RECEIVED",
      });
    }

    return ok(
      res,
      {
        payment,
        transaction,
      },
      "Payment processed and escrow locked successfully"
    );
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

