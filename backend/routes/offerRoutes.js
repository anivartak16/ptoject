import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getOffers,
  createOffer,
  acceptOffer,
  rejectOffer,
} from "../controllers/offerController.js";

const router = Router();

router.get("/", requireAuth, getOffers);
router.post("/", requireAuth, requireRole("BUYER"), createOffer);
router.patch("/:id/accept", requireAuth, acceptOffer);
router.patch("/:id/reject", requireAuth, rejectOffer);

export default router;
