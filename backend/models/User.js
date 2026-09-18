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
    ekycStatus: {
      type: String,
      enum: ["NOT_STARTED", "PENDING", "VERIFIED", "REJECTED"],
      default: "NOT_STARTED",
    },
    ekycType: { type: String, trim: true },
    ekycIdNumber: { type: String, trim: true },
    ekycVerifiedAt: Date,
    ekycDetails: {
      fullName: String,
      docType: String,
      referenceId: String,
      landRecordNumber: String,
      village: String,
      state: String,
      verifiedDate: Date,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || model("User", userSchema);
export default User;
