import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
} from "../controllers/notificationController.js";

const router = Router();

router.get("/", requireAuth, getNotifications);
router.patch("/:id/read", requireAuth, markAsRead);

export default router;
