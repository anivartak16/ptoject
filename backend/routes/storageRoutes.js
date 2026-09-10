import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getWarehouses,
  bookStorage,
  getStorageBookings,
} from "../controllers/storageController.js";

const router = Router();

router.get("/", requireAuth, getWarehouses);
router.post("/book", requireAuth, bookStorage);
router.get("/bookings", requireAuth, getStorageBookings);

export default router;
