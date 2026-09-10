import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getDisputes,
  createDispute,
  updateDispute,
} from "../controllers/disputeController.js";

const router = Router();

router.get("/", requireAuth, getDisputes);
router.post("/", requireAuth, createDispute);
router.patch("/:id", requireAuth, requireRole("ADMIN"), updateDispute);

export default router;
