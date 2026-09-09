import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });
const fail = (res, status, message, error = "VALIDATION_ERROR") =>
  res.status(status).json({ success: false, message, error });
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
    if (!name || !email || !password || !phone || !location || !["FARMER", "FPO", "BUYER"].includes(role))
      return fail(res, 422, "Name, email, phone, location, password and valid role are required");
    if (role === "FARMER" && (!farmName || !(Number(landSize) > 0) || !primaryCrop))
      return fail(res, 422, "Farm name, land size and primary crop are required for farmers");
    if (role === "BUYER" && (!organizationName || !buyerType))
      return fail(res, 422, "Organisation name and buyer type are required for buyers");
    if (role === "FPO" && (!organizationName || !registrationNumber || !(Number(memberCount) > 0)))
      return fail(res, 422, "FPO name, registration number and member count are required");
    if (await User.findOne({ email: email.toLowerCase() }))
      return fail(res, 409, "Email already registered", "CONFLICT");
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
      registrationNumber,
      memberCount: memberCount ? Number(memberCount) : undefined,
    });
    return ok(res, { token: signToken(user), user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone, location: user.location } }, "Registration successful");
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
      return fail(res, 401, "Invalid email or password", "INVALID_CREDENTIALS");
    return ok(res, { token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role, location: user.location } }, "Login successful");
  } catch (error) {
    next(error);
  }
}

export const logout = (_req, res) => ok(res, {}, "Logged out");
export const me = (req, res) => ok(res, req.user);
