import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { fail } from "../utils/response.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return fail(res, 401, "Authentication required", "UNAUTHORIZED");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (!user || !user.active) {
      return fail(res, 401, "Authentication required", "UNAUTHORIZED");
    }

    req.user = user;
    next();
  } catch (_err) {
    return fail(res, 401, "Authentication required", "UNAUTHORIZED");
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return fail(res, 403, "Insufficient permission", "FORBIDDEN");
  }
  next();
};
