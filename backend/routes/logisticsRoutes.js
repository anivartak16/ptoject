import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getLogisticsProviders,
  bookLogistics,
  getLogisticsBookings,
} from "../controllers/logisticsController.js";

const router = Router();

router.get("/providers", requireAuth, getLogisticsProviders);
router.post("/book", requireAuth, bookLogistics);
router.get("/bookings", requireAuth, getLogisticsBookings);

export default router;
