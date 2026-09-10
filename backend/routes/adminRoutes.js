import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getUsers,
  updateUserStatus,
  getSummary,
  getAnalytics,
} from "../controllers/adminController.js";

const router = Router();

router.get("/users", requireAuth, requireRole("ADMIN"), getUsers);
router.patch("/users/:id", requireAuth, requireRole("ADMIN"), updateUserStatus);
router.get("/summary", requireAuth, requireRole("ADMIN"), getSummary);
router.get("/analytics", requireAuth, requireRole("ADMIN"), getAnalytics);

export default router;
