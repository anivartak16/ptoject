import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createInspection, inspectionLots } from "../controllers/inspectionController.js";

const router = Router();
router.get("/lots", requireAuth, requireRole("KRISHI_KENDRA"), inspectionLots);
router.post("/", requireAuth, requireRole("KRISHI_KENDRA"), createInspection);

export default router;
