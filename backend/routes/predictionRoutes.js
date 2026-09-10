import { Router } from "express";
import {
  getCropPrediction,
  getPredictionsOverview,
} from "../controllers/predictionController.js";

const router = Router();

router.get("/overview", getPredictionsOverview);
router.get("/:crop", getCropPrediction);
router.get("/", getCropPrediction);
router.post("/", getCropPrediction);

export default router;

