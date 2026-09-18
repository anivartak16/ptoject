import mongoose from "mongoose";

const { Schema, model } = mongoose;

const loc = {
  type: { type: String, default: "Point" },
  coordinates: { type: [Number] },
};

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, lowercase: true, required: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "FARMER", "FPO", "BUYER", "KRISHI_KENDRA"],
      default: "FARMER",
    },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    address: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    organizationName: { type: String, trim: true },
    buyerType: { type: String, trim: true },
    farmName: { type: String, trim: true },
    landSize: Number,
    primaryCrop: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    memberCount: Number,
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    geo: loc,
    verification: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    gstNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    mandiLicenseNumber: { type: String, trim: true },
    verificationBadge: { type: String, default: "STANDARD" },
    tradeRating: { type: Number, default: 4.5 },
    verifiedAt: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || model("User", userSchema);
export default User;
