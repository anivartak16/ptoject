import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import {
  login,
  logout,
  me,
  register,
  updateProfile,
  getProfile,
  sendKycOtp,
  resendKycOtp,
  verifyKycOtp,
} from "../controllers/authController.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, updateProfile);
router.get("/profile/:id", optionalAuth, getProfile);
router.post("/kyc/send-otp", optionalAuth, sendKycOtp);
router.post("/kyc/resend-otp", optionalAuth, resendKycOtp);
router.post("/kyc/verify-otp", optionalAuth, verifyKycOtp);

export default router;

