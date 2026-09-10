import mongoose from "mongoose";

const { Schema, model } = mongoose;

const marketPriceSchema = new Schema({
  market: { type: Schema.Types.ObjectId, ref: "Market" },
  commodity: { type: String, index: true },
  date: { type: Date, index: true },
  minPrice: Number,
  maxPrice: Number,
  modalPrice: Number,
  arrivalVolume: Number,
  unit: { type: String, default: "KG" },
});

export const MarketPrice =
  mongoose.models.MarketPrice || model("MarketPrice", marketPriceSchema);
export default MarketPrice;
