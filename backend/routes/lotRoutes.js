import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getLots,
  createLot,
  updateLot,
} from "../controllers/lotController.js";

const router = Router();

router.get("/", requireAuth, getLots);
router.post("/", requireAuth, requireRole("FARMER", "FPO"), createLot);
router.put("/:id", requireAuth, updateLot);

export default router;
