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
    preferredCommodities: [{ type: String, trim: true }],
    registrationNumber: { type: String, trim: true },
    memberCount: Number,
    fpoLeaderDesignation: { type: String, trim: true, default: "Chairman & Managing Director" },
    fpoEstablishmentYear: { type: Number, default: 2021 },
    fpoIncorporationType: { type: String, trim: true, default: "Farmer Producer Company (Companies Act)" },
    fpoAggregationCapacity: { type: String, trim: true, default: "1,500 MT / Season" },
    buyerCapacity: { type: String, trim: true, default: "500 MT / Month" },
    crops: [{ type: String, trim: true }],
    availableQuantity: Number,
    cropQuality: { type: String, trim: true, default: "Grade A" },
    fpoAssociation: { type: String, trim: true },
    requiredCrops: [{ type: String, trim: true }],
    requiredQuantity: Number,
    qualityRequirements: { type: String, trim: true },
    qualitySpecs: {
      crop: { type: String, trim: true },
      grade: { type: String, trim: true },
      variety: { type: String, trim: true },
      colorAppearance: { type: String, trim: true },
      sizeType: { type: String, trim: true },
      moisturePercent: Number,
      foreignMatterPercent: Number,
      damagedGrainsPercent: Number,
      brokenGrainsPercent: Number,
      oilContentPercent: Number,
      otherRequirements: { type: String, trim: true },
    },
    profilePhoto: { type: String, trim: true },
    kycVerified: { type: Boolean, default: false },
    kycVerifiedAt: Date,
    aadhaarLast4: { type: String, trim: true },
    businessVerified: { type: Boolean, default: false },
    verificationBadge: { type: String, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    geo: loc,
    verification: {
      type: String,
      enum: ["VERIFIED", "PENDING", "UNVERIFIED"],
      default: "UNVERIFIED",
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || model("User", userSchema);
export default User;
