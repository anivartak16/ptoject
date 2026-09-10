import mongoose from "mongoose";

const { Schema, model } = mongoose;

const loc = {
  type: { type: String, default: "Point" },
  coordinates: { type: [Number], default: [75.86, 22.72] },
};

const lotSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerType: { type: String, default: "FARMER" },
    sourceLots: [{ type: Schema.Types.ObjectId, ref: "Lot" }],
    commodity: { type: String, required: true, index: true },
    quantity: { type: Number, required: true },
    remainingQuantity: Number,
    unit: { type: String, default: "KG" },
    harvestDate: Date,
    location: String,
    geo: loc,
    expectedPrice: { type: Number, required: true },
    quality: { type: Schema.Types.ObjectId, ref: "Quality" },
    availableUntil: Date,
    status: {
      type: String,
      enum: ["AVAILABLE", "PARTIALLY_SOLD", "SOLD", "EXPIRED", "CANCELLED"],
      default: "AVAILABLE",
    },
  },
  { timestamps: true },
);

lotSchema.index({ geo: "2dsphere" });

export const Lot = mongoose.models.Lot || model("Lot", lotSchema);
export default Lot;
