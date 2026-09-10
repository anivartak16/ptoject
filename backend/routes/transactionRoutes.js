import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getTransactions,
  updateTransactionStatus,
} from "../controllers/transactionController.js";

const router = Router();

router.get("/", requireAuth, getTransactions);
router.patch("/:id/status", requireAuth, updateTransactionStatus);

export default router;
