import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Transaction, Lot, Demand } from "../models/index.js";
import { ok, fail } from "../utils/response.js";
import { resolveCoordinates } from "../utils/geoCoordinates.js";
import aadhaarKycService from "../services/aadhaarKycService.js";

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
    qualitySpecs: user.qualitySpecs || null,
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
      "qualitySpecs",
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

    if (req.body.qualitySpecs && typeof req.body.qualitySpecs === "object") {
      user.qualitySpecs = {
        crop: String(req.body.qualitySpecs.crop || "").trim(),
        grade: String(req.body.qualitySpecs.grade || "").trim(),
        variety: String(req.body.qualitySpecs.variety || "").trim(),
        colorAppearance: String(req.body.qualitySpecs.colorAppearance || "").trim(),
        sizeType: String(req.body.qualitySpecs.sizeType || "").trim(),
        moisturePercent:
          req.body.qualitySpecs.moisturePercent !== undefined &&
          req.body.qualitySpecs.moisturePercent !== null &&
          req.body.qualitySpecs.moisturePercent !== ""
            ? Number(req.body.qualitySpecs.moisturePercent)
            : undefined,
        foreignMatterPercent:
          req.body.qualitySpecs.foreignMatterPercent !== undefined &&
          req.body.qualitySpecs.foreignMatterPercent !== null &&
          req.body.qualitySpecs.foreignMatterPercent !== ""
            ? Number(req.body.qualitySpecs.foreignMatterPercent)
            : undefined,
        damagedGrainsPercent:
          req.body.qualitySpecs.damagedGrainsPercent !== undefined &&
          req.body.qualitySpecs.damagedGrainsPercent !== null &&
          req.body.qualitySpecs.damagedGrainsPercent !== ""
            ? Number(req.body.qualitySpecs.damagedGrainsPercent)
            : undefined,
        brokenGrainsPercent:
          req.body.qualitySpecs.brokenGrainsPercent !== undefined &&
          req.body.qualitySpecs.brokenGrainsPercent !== null &&
          req.body.qualitySpecs.brokenGrainsPercent !== ""
            ? Number(req.body.qualitySpecs.brokenGrainsPercent)
            : undefined,
        oilContentPercent:
          req.body.qualitySpecs.oilContentPercent !== undefined &&
          req.body.qualitySpecs.oilContentPercent !== null &&
          req.body.qualitySpecs.oilContentPercent !== ""
            ? Number(req.body.qualitySpecs.oilContentPercent)
            : undefined,
        otherRequirements: String(req.body.qualitySpecs.otherRequirements || "").trim().slice(0, 200),
      };
    }

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
    const { aadhaarNumber } = req.body;
    const result = await aadhaarKycService.generateOtp(aadhaarNumber);

    return ok(
      res,
      {
        client_id: result.client_id,
        aadhaarLast4: result.aadhaarLast4,
        maskedTarget: result.maskedTarget,
        ...(result.sandboxOtpHint ? { sandboxOtpHint: result.sandboxOtpHint } : {}),
      },
      result.message || "OTP has been sent to the mobile number registered with your Aadhaar."
    );
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.statusCode, error.message);
    }
    next(error);
  }
}

export async function resendKycOtp(req, res, next) {
  try {
    const { client_id } = req.body;
    if (!client_id) {
      return fail(res, 400, "Client session ID is required");
    }

    const result = await aadhaarKycService.resendOtp(client_id);
    return ok(res, result, result.message);
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.statusCode, error.message);
    }
    next(error);
  }
}

export async function verifyKycOtp(req, res, next) {
  try {
    const { client_id, otp } = req.body;
    if (!client_id || !otp) {
      return fail(res, 400, "Session client_id and 6-digit OTP are required");
    }

    const verificationResult = await aadhaarKycService.verifyOtp(client_id, otp);

    let updatedUser = null;
    if (req.user?._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.kycVerified = true;
        user.kycVerifiedAt = verificationResult.verifiedAt;
        user.aadhaarLast4 = verificationResult.aadhaarLast4;
        user.verification = "VERIFIED";
        user.verificationBadge =
          user.role === "BUYER" ? "VERIFIED_BUYER" : "EKYC_VERIFIED_FARMER";
        if (verificationResult.ekycDetails) {
          user.ekycDetails = verificationResult.ekycDetails;
          user.ekycStatus = "VERIFIED";
          user.ekycVerifiedAt = verificationResult.verifiedAt;
        }
        await user.save();
        updatedUser = sanitizeUser(user);
      }
    }

    return ok(
      res,
      {
        verified: true,
        aadhaarLast4: verificationResult.aadhaarLast4,
        user: updatedUser,
      },
      "Aadhaar KYC Verified ✓"
    );
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.statusCode, error.message);
    }
    next(error);
  }
}
