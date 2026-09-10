import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMarkets,
  getNearbyMarkets,
} from "../controllers/marketController.js";

const router = Router();

router.get("/", getMarkets);
router.get("/nearby", requireAuth, getNearbyMarkets);

export default router;
