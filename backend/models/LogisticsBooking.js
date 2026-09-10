import mongoose from "mongoose";

const { Schema, model } = mongoose;

const logisticsBookingSchema = new Schema(
  {
    requestedBy: { type: Schema.Types.ObjectId, ref: "User" },
    transaction: { type: Schema.Types.ObjectId, ref: "Transaction" },
    provider: { type: Schema.Types.ObjectId, ref: "LogisticsProvider" },
    pickupLocation: String,
    deliveryLocation: String,
    quantity: Number,
    estimatedCost: Number,
    status: { type: String, default: "REQUESTED" },
  },
  { timestamps: true },
);

export const LogisticsBooking =
  mongoose.models.LogisticsBooking ||
  model("LogisticsBooking", logisticsBookingSchema);
export default LogisticsBooking;
