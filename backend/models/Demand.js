import mongoose from "mongoose";

const { Schema, model } = mongoose;

const demandSchema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commodity: { type: String, required: true, index: true },
    requiredQuantity: { type: Number, required: true },
    unit: { type: String, default: "KG" },
    requiredQuality: { type: String, default: "Grade A" },
    preferredLocation: String,
    maxPrice: { type: Number, required: true },
    deadline: Date,
    status: { type: String, default: "ACTIVE" },
  },
  { timestamps: true },
);

export const Demand = mongoose.models.Demand || model("Demand", demandSchema);
export default Demand;
