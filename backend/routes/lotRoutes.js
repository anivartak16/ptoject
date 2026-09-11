import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getLots,
  createLot,
  updateLot,
  publishLot,
  sendForVerification,
} from "../controllers/lotController.js";

const router = Router();

router.get("/", requireAuth, getLots);
router.post("/", requireAuth, requireRole("FARMER", "FPO"), createLot);
router.put("/:id", requireAuth, updateLot);
router.post("/:id/publish", requireAuth, requireRole("FARMER", "FPO"), publishLot);
router.post("/:id/verify-request", requireAuth, requireRole("FARMER", "FPO"), sendForVerification);

export default router;

