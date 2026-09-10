import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getBuyerReliability } from "../controllers/buyerController.js";

const router = Router();

router.get("/:id/reliability", requireAuth, getBuyerReliability);

export default router;
