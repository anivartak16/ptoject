import mongoose from "mongoose";

const { Schema, model } = mongoose;

const loc = {
  type: { type: String, default: "Point" },
  coordinates: { type: [Number], default: [75.86, 22.72] },
};

const marketSchema = new Schema({
  name: String,
  location: String,
  district: String,
  state: String,
  commodities: [String],
  geo: loc,
  transportCostPerKm: { type: Number, default: 8 },
  reviewAverage: { type: Number, default: 4.2, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
});

marketSchema.index({ geo: "2dsphere" });

export const Market = mongoose.models.Market || model("Market", marketSchema);
export default Market;
