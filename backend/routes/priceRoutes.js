import { Router } from "express";
import { getPrices, getPriceTrends } from "../controllers/marketController.js";

const router = Router();

router.get("/", getPrices);
router.get("/trends", getPriceTrends);

export default router;
