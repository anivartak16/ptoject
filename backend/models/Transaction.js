import mongoose from "mongoose";

const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    offer: { type: Schema.Types.ObjectId, ref: "Offer", unique: true },
    lot: { type: Schema.Types.ObjectId, ref: "Lot" },
    buyer: { type: Schema.Types.ObjectId, ref: "User" },
    seller: { type: Schema.Types.ObjectId, ref: "User" },
    quantity: Number,
    amount: Number,
    status: {
      type: String,
      enum: [
        "CREATED",
        "CONFIRMED",
        "IN_TRANSIT",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
      ],
      default: "CREATED",
    },
    events: [
      {
        status: String,
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export const Transaction =
  mongoose.models.Transaction || model("Transaction", transactionSchema);
export default Transaction;
