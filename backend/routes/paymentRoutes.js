import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getPayments,
  getPaymentByTransaction,
  updatePaymentStatus,
  processPayment,
} from "../controllers/paymentController.js";

const router = Router();

router.get("/", requireAuth, getPayments);
router.get("/:transactionId", requireAuth, getPaymentByTransaction);
router.post("/:transactionId/process", requireAuth, processPayment);
router.patch("/:transactionId", requireAuth, updatePaymentStatus);

export default router;

