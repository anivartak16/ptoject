import mongoose from "mongoose";

const { Schema, model } = mongoose;

const warehouseSchema = new Schema({
  name: String,
  location: String,
  availableCapacity: Number,
  storageType: String,
  pricePerUnitPerDay: Number,
  facilities: [String],
  verificationStatus: { type: String, default: "VERIFIED" },
});

export const Warehouse =
  mongoose.models.Warehouse || model("Warehouse", warehouseSchema);
export default Warehouse;
