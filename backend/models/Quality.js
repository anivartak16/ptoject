import mongoose from "mongoose";

const { Schema, model } = mongoose;

const qualitySchema = new Schema({
  grade: { type: String, default: "Grade A" },
  moisture: Number,
  foreignMatter: Number,
  damagedPercentage: Number,
  defects: String,
  grainImage: String,
  certification: String,
  inspectionDate: Date,
  inspectedBy: { type: Schema.Types.ObjectId, ref: "User" },
  inspectionStatus: {
    type: String,
    enum: ["PENDING", "VERIFIED", "REJECTED"],
    default: "PENDING",
  },
  inspectionNotes: String,
});

export const Quality = mongoose.models.Quality || model("Quality", qualitySchema);
export default Quality;
