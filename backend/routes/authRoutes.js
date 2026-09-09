import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { login, logout, me, register } from "../controllers/authController.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

export default router;
