import mongoose from "mongoose";

const { Schema, model } = mongoose;

const storageBookingSchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    quantity: Number,
    days: Number,
    estimatedCost: Number,
    status: { type: String, default: "BOOKED" },
  },
  { timestamps: true },
);

export const StorageBooking =
  mongoose.models.StorageBooking ||
  model("StorageBooking", storageBookingSchema);
export default StorageBooking;
