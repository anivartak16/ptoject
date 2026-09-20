import mongoose from "mongoose";

const kycSessionSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
    },
    providerClientId: {
      type: mongoose.Schema.Types.Mixed, // string or number (reference_id)
      default: null,
    },
    maskedAadhaar: {
      type: String,
      required: true,
    },
    aadhaarHash: {
      type: String,
      required: true,
      index: true,
    },
    sandboxOtpHash: {
      type: String,
      default: null,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    verifyAttempts: {
      type: Number,
      default: 0,
    },
    lastRequestedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // 10 minutes TTL: MongoDB automatically deletes expired documents
    },
  },
  {
    timestamps: true,
  }
);

export const KycSession = mongoose.models.KycSession || mongoose.model("KycSession", kycSessionSchema);
export default KycSession;
