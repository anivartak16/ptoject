import { Dispute, Transaction } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getDisputes(req, res, next) {
  try {
    const filter =
      req.user.role === "ADMIN"
        ? {}
        : { $or: [{ raisedBy: req.user._id }, { against: req.user._id }] };

    const disputes = await Dispute.find(filter)
      .populate("transaction raisedBy against resolvedBy")
      .sort({ createdAt: -1 });

    return ok(res, disputes);
  } catch (error) {
    next(error);
  }
}

export async function createDispute(req, res, next) {
  try {
    const { transactionId, reason, description } = req.body;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return fail(res, 404, "Transaction not found", "NOT_FOUND");
    }

    if (
      String(transaction.buyer) !== String(req.user._id) &&
      String(transaction.seller) !== String(req.user._id)
    ) {
      return fail(
        res,
        403,
        "Only transaction participants can raise a dispute",
        "FORBIDDEN",
      );
    }

    if (!reason || !description) {
      return fail(res, 422, "Reason and description are required");
    }

    const against =
      String(transaction.buyer) === String(req.user._id)
        ? transaction.seller
        : transaction.buyer;

    transaction.status = "DISPUTED";
    transaction.events.push({
      status: "DISPUTED",
      note: `Dispute raised: ${reason}`,
    });
    await transaction.save();

    const dispute = await Dispute.create({
      transaction: transaction._id,
      raisedBy: req.user._id,
      against,
      reason,
      description,
    });

    return ok(res, dispute, "Dispute raised");
  } catch (error) {
    next(error);
  }
}

export async function updateDispute(req, res, next) {
  try {
    if (!["UNDER_REVIEW", "RESOLVED", "REJECTED"].includes(req.body.status)) {
      return fail(res, 422, "Invalid dispute status");
    }

    const isClosed =
      req.body.status === "RESOLVED" || req.body.status === "REJECTED";

    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        resolution: req.body.resolution,
        resolvedBy: isClosed ? req.user._id : undefined,
        resolvedAt: isClosed ? new Date() : undefined,
      },
      { new: true },
    ).populate("transaction raisedBy against resolvedBy");

    if (!dispute) return fail(res, 404, "Dispute not found", "NOT_FOUND");

    if (dispute.transaction && isClosed) {
      await Transaction.findByIdAndUpdate(dispute.transaction._id, {
        status: req.body.status === "RESOLVED" ? "COMPLETED" : "CONFIRMED",
      });
    }

    return ok(res, dispute, "Dispute updated");
  } catch (error) {
    next(error);
  }
}
