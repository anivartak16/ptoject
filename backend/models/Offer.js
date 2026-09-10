import mongoose from "mongoose";

const { Schema, model } = mongoose;

const offerSchema = new Schema(
  {
    lot: { type: Schema.Types.ObjectId, ref: "Lot", required: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    totalAmount: Number,
    message: String,
    validUntil: Date,
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Offer = mongoose.models.Offer || model("Offer", offerSchema);
export default Offer;
