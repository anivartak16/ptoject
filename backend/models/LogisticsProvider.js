import mongoose from "mongoose";

const { Schema, model } = mongoose;

const logisticsProviderSchema = new Schema({
  name: String,
  phone: String,
  vehicleType: String,
  capacity: Number,
  serviceAreas: [String],
  pricePerKm: Number,
  availability: { type: Boolean, default: true },
});

export const LogisticsProvider =
  mongoose.models.LogisticsProvider ||
  model("LogisticsProvider", logisticsProviderSchema);
export default LogisticsProvider;
