import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Transaction, Lot, Demand } from "../models/index.js";
import { ok, fail } from "../utils/response.js";
import { resolveCoordinates } from "../utils/geoCoordinates.js";

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      location,
      address,
      district,
      state,
      pincode,
      organizationName,
      buyerType,
      farmName,
      landSize,
      primaryCrop,
      registrationNumber,
      memberCount,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !location ||
      !["FARMER", "FPO", "BUYER", "KRISHI_KENDRA"].includes(role)
    ) {
      return fail(
        res,
        422,
        "Name, email, phone, location, password and valid role are required",
      );
    }

    if (
      role === "FARMER" &&
      (!farmName || !(Number(landSize) > 0) || !primaryCrop)
    ) {
      return fail(
        res,
        422,
        "Farm name, land size and primary crop are required for farmers",
      );
    }

    if (role === "BUYER" && (!organizationName || !buyerType)) {
      return fail(
        res,
        422,
        "Organisation name and buyer type are required for buyers",
      );
    }

    if (
      role === "FPO" &&
      (!organizationName || !registrationNumber || !(Number(memberCount) > 0))
    ) {
      return fail(
        res,
        422,
        "FPO name, registration number and member count are required",
      );
    }

    if (role === "KRISHI_KENDRA" && (!organizationName || !registrationNumber)) {
      return fail(
        res,
        422,
        "Krishi Kendra name and registration number are required",
      );
    }

    if (await User.findOne({ email: email.toLowerCase() })) {
      return fail(res, 409, "Email already registered", "CONFLICT");
    }

    const resolvedCoords = resolveCoordinates({
      coordinates:
        Number.isFinite(Number(req.body.longitude)) && Number.isFinite(Number(req.body.latitude))
          ? [Number(req.body.longitude), Number(req.body.latitude)]
          : undefined,
      district,
      state,
      location,
      address,
    });

    const isKycDone = Boolean(kycVerified);

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
      phone,
      location,
      address,
      district,
      state,
      pincode,
      organizationName,
      buyerType,
      farmName,
      landSize: landSize ? Number(landSize) : undefined,
      primaryCrop,
      crops: crops?.length ? crops : primaryCrop ? [primaryCrop] : [],
      availableQuantity: availableQuantity ? Number(availableQuantity) : undefined,
      cropQuality: cropQuality || "Grade A",
      fpoAssociation,
      requiredCrops: requiredCrops?.length ? requiredCrops : [],
      requiredQuantity: requiredQuantity ? Number(requiredQuantity) : undefined,
      qualityRequirements,
      registrationNumber,
      memberCount: memberCount ? Number(memberCount) : undefined,
      geo: {
        type: "Point",
        coordinates: resolvedCoords,
      },
    });

    return ok(
      res,
      {
        token: signToken(user),
        user: sanitizeUser(user),
      },
      "Registration successful",
    );
  } catch (error) {
    next(error);
  }
}

function sanitizeUser(user) {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    location: user.location,
    address: user.address,
    district: user.district,
    state: user.state,
    pincode: user.pincode,
    organizationName: user.organizationName,
    buyerType: user.buyerType,
    farmName: user.farmName,
    landSize: user.landSize,
    primaryCrop: user.primaryCrop,
    crops: user.crops?.length ? user.crops : user.primaryCrop ? [user.primaryCrop] : [],
    availableQuantity: user.availableQuantity,
    cropQuality: user.cropQuality || "Grade A",
    fpoAssociation: user.fpoAssociation,
    requiredCrops: user.requiredCrops || [],
    requiredQuantity: user.requiredQuantity,
    qualityRequirements: user.qualityRequirements || "Grade A / Moisture < 12%",
    registrationNumber: user.registrationNumber,
    memberCount: user.memberCount,
    fpoLeaderDesignation: user.fpoLeaderDesignation || "Chairman & Managing Director",
    fpoEstablishmentYear: user.fpoEstablishmentYear || 2021,
    fpoIncorporationType: user.fpoIncorporationType || "Farmer Producer Company (Companies Act)",
    fpoAggregationCapacity: user.fpoAggregationCapacity || "1,500 MT / Season",
    buyerCapacity: user.buyerCapacity || "500 MT / Month",
    preferredCommodities: user.preferredCommodities || ["Wheat", "Soyabean", "Gram"],
    verification: user.verification || "PENDING",
    gstNumber: user.gstNumber || "",
    panNumber: user.panNumber || "",
    mandiLicenseNumber: user.mandiLicenseNumber || "",
    verificationBadge:
      user.verificationBadge ||
      (user.verification === "VERIFIED"
        ? user.role === "BUYER"
          ? "VERIFIED_BUYER"
          : "EKYC_VERIFIED_FARMER"
        : "STANDARD"),
    tradeRating: user.tradeRating ?? 4.5,
    ekycStatus:
      user.ekycStatus ||
      (user.verification === "VERIFIED" && user.role === "FARMER"
        ? "VERIFIED"
        : "NOT_STARTED"),
    ekycType: user.ekycType || "",
    ekycIdNumber: user.ekycIdNumber || "",
    ekycVerifiedAt: user.ekycVerifiedAt,
    ekycDetails: user.ekycDetails || null,
    geo: user.geo,
    verification: user.verification || "UNVERIFIED",
    kycVerified: Boolean(user.kycVerified),
    kycVerifiedAt: user.kycVerifiedAt,
    aadhaarLast4: user.aadhaarLast4,
    profilePhoto: user.profilePhoto,
    businessVerified: Boolean(user.businessVerified),
    active: user.active !== false,
  };
}

export async function login(req, res, next) {
  try {
    const lookupEmail = req.body.email?.toLowerCase().trim();
    let user = await User.findOne({ email: lookupEmail });
    if (!user && lookupEmail) {
      if (lookupEmail.endsWith("@krishilink.com")) {
        user = await User.findOne({ email: lookupEmail.replace("@krishilink.com", "@agrilink.com") });
      } else if (lookupEmail.endsWith("@agrilink.com")) {
        user = await User.findOne({ email: lookupEmail.replace("@agrilink.com", "@krishilink.com") });
      }
    }
    if (
      !user ||
      !(await bcrypt.compare(req.body.password || "", user.password))
    ) {
      return fail(
        res,
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );
    }

    return ok(
      res,
      {
        token: signToken(user),
        user: sanitizeUser(user),
      },
      "Login successful",
    );
  } catch (error) {
    next(error);
  }
}

export const logout = (_req, res) => ok(res, {}, "Logged out");
export const me = (req, res) => ok(res, sanitizeUser(req.user));

export async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return fail(res, 404, "User not found");

    const allowed = [
      "name",
      "phone",
      "location",
      "address",
      "district",
      "state",
      "pincode",
      "organizationName",
      "buyerType",
      "registrationNumber",
      "memberCount",
      "fpoLeaderDesignation",
      "fpoEstablishmentYear",
      "fpoIncorporationType",
      "fpoAggregationCapacity",
      "buyerCapacity",
      "primaryCrop",
      "crops",
      "availableQuantity",
      "cropQuality",
      "fpoAssociation",
      "requiredCrops",
      "requiredQuantity",
      "qualityRequirements",
      "profilePhoto",
      "farmName",
      "landSize",
      "businessVerified",
      "gstNumber",
      "panNumber",
      "mandiLicenseNumber",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (typeof req.body.crops === "string") {
      user.crops = req.body.crops.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (Array.isArray(req.body.crops)) {
      user.crops = req.body.crops;
    }

    if (typeof req.body.requiredCrops === "string") {
      user.requiredCrops = req.body.requiredCrops.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (Array.isArray(req.body.requiredCrops)) {
      user.requiredCrops = req.body.requiredCrops;
    }

    if (user.role === "BUYER" && (user.gstNumber || user.mandiLicenseNumber)) {
      user.verification = "VERIFIED";
      user.verificationBadge = "VERIFIED_BUYER";
      if (!user.verifiedAt) user.verifiedAt = new Date();
    }

    if (req.body.location || req.body.district || req.body.state || req.body.address) {
      user.geo = {
        type: "Point",
        coordinates: resolveCoordinates({
          district: user.district,
          state: user.state,
          location: user.location,
          address: user.address,
        }),
      };
    }

    await user.save();
    return ok(res, sanitizeUser(user), "Profile updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const { id } = req.params;
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return fail(res, 404, "User not found");
    }

    // Count completed transactions
    const txCount = await Transaction.countDocuments({
      $or: [
        { buyer: targetUser._id },
        { farmer: targetUser._id },
        { seller: targetUser._id },
      ],
      status: "COMPLETED",
    });

    const sanitized = sanitizeUser(targetUser);
    sanitized.transactionCount = txCount;

    return ok(res, sanitized, "User profile retrieved");
  } catch (error) {
    next(error);
  }
}

export async function sendKycOtp(req, res, next) {
  try {
    const { aadhaarNumber, phone } = req.body;
    const cleanAadhaar = String(aadhaarNumber || "").replace(/\D/g, "");

    if (cleanAadhaar.length !== 12) {
      return fail(res, 422, "A valid 12-digit Aadhaar number is required");
    }

    const last4 = cleanAadhaar.slice(-4);
    const maskedAadhaar = `XXXX-XXXX-${last4}`;
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    const maskedPhone =
      cleanPhone.length >= 10
        ? `+91 ${cleanPhone.slice(0, 2)}******${cleanPhone.slice(-2)}`
        : "+91 98******10";

    return ok(
      res,
      {
        aadhaarLast4: maskedAadhaar,
        maskedTarget: maskedPhone,
        demoOtp: "123456",
      },
      "OTP sent successfully to mobile registered with Aadhaar"
    );
  } catch (error) {
    next(error);
  }
}

export async function verifyKycOtp(req, res, next) {
  try {
    const { otp, aadhaarLast4, aadhaarNumber } = req.body;
    const cleanOtp = String(otp || "").trim();

    // Prototype demo accepts 123456 or any 6-digit OTP
    if (!cleanOtp || (cleanOtp !== "123456" && cleanOtp.length !== 6)) {
      return fail(res, 400, "Invalid OTP. Use demo OTP: 123456");
    }

    const last4 = aadhaarLast4
      ? aadhaarLast4
      : aadhaarNumber
      ? `XXXX-XXXX-${String(aadhaarNumber).slice(-4)}`
      : "XXXX-XXXX-8921";

    let updatedUser = null;
    if (req.user?._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.kycVerified = true;
        user.kycVerifiedAt = new Date();
        user.aadhaarLast4 = last4;
        user.verification = "VERIFIED";
        user.verificationBadge =
          user.role === "BUYER" ? "VERIFIED_BUYER" : "EKYC_VERIFIED_FARMER";
        await user.save();
        updatedUser = sanitizeUser(user);
      }
    }

    return ok(
      res,
      {
        verified: true,
        aadhaarLast4: last4,
        user: updatedUser,
      },
      "KYC Verification Successful ✓"
    );
  } catch (error) {
    next(error);
  }
}
