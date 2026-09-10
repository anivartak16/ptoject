import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getDemands,
  createDemand,
} from "../controllers/demandController.js";

const router = Router();

router.get("/", requireAuth, getDemands);
router.post("/", requireAuth, requireRole("BUYER"), createDemand);

export default router;
