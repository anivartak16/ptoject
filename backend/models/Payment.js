import mongoose from "mongoose";

const { Schema, model } = mongoose;

const paymentSchema = new Schema(
  {
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      unique: true,
    },
    amount: Number,
    paymentMethod: { type: String, default: "Bank Transfer" },
    referenceId: String,
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paidAt: Date,
    remarks: String,
  },
  { timestamps: true },
);

export const Payment =
  mongoose.models.Payment || model("Payment", paymentSchema);
export default Payment;
