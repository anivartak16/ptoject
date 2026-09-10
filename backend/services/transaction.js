import mongoose from "mongoose";
import {
  Offer,
  Lot,
  Transaction,
  Payment,
  Notification,
} from "../models/index.js";

/**
 * Atomically accepts an offer within a Mongoose session, updating lot inventory,
 * creating the transaction, creating the pending payment, and notifying the buyer.
 */
export async function acceptOffer(id, user) {
  const session = await mongoose.startSession();
  try {
    let transaction;
    await session.withTransaction(async () => {
      const offer = await Offer.findById(id).session(session);
      const lot = await Lot.findById(offer?.lot).session(session);

      if (!offer || !lot) throw new Error("Offer not found");
      if (String(lot.owner) !== String(user._id)) {
        throw new Error("Only lot owner can accept this offer");
      }
      if (offer.status !== "PENDING") {
        throw new Error("Offer already processed");
      }
      if (offer.validUntil && offer.validUntil <= new Date()) {
        offer.status = "EXPIRED";
        await offer.save({ session });
        throw new Error("Offer has expired");
      }
      if (lot.remainingQuantity < offer.quantity) {
        throw new Error("Insufficient available quantity");
      }

      lot.remainingQuantity -= offer.quantity;
      lot.status = lot.remainingQuantity === 0 ? "SOLD" : "PARTIALLY_SOLD";
      offer.status = "ACCEPTED";

      const createdTransactions = await Transaction.create(
        [
          {
            offer: offer._id,
            lot: lot._id,
            buyer: offer.buyer,
            seller: lot.owner,
            quantity: offer.quantity,
            amount: offer.totalAmount,
            status: "CREATED",
            events: [
              {
                status: "CREATED",
                note: "Offer accepted; transaction created",
              },
            ],
          },
        ],
        { session },
      );

      transaction = createdTransactions[0];

      await Payment.create(
        [
          {
            transaction: transaction._id,
            amount: offer.totalAmount,
          },
        ],
        { session },
      );

      await Notification.create(
        [
          {
            user: offer.buyer,
            message: "Your offer was accepted. Transaction created.",
            type: "OFFER_ACCEPTED",
          },
        ],
        { session },
      );

      await lot.save({ session });
      await offer.save({ session });
    });

    return transaction;
  } finally {
    session.endSession();
  }
}
