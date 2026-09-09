import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { summary } from "../controllers/dashboardController.js";

const router = Router();
router.get("/summary", requireAuth, summary);

export default router;
