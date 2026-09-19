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
      "registrationNumber",
      "memberCount",
      "fpoLeaderDesignation",
      "fpoEstablishmentYear",
      "fpoIncorporationType",
      "fpoAggregationCapacity",
      "primaryCrop",
      "farmName",
      "landSize",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

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
