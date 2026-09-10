import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMatchesForDemand } from "../controllers/demandController.js";

const router = Router();

router.get("/:demandId", requireAuth, getMatchesForDemand);

export default router;
