import express from "express";

import {
  getPrices,
  getCommodityAcrossStates,
  getStateCommodities,
  getStateCommodityAllDistricts,
  syncToDb,
} from "../controllers/marketPrice.controller.js";

// Optional: wire in your existing auth middleware if these should be protected
// import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/prices",
  getPrices
);

router.get(
  "/prices/state-commodity",
  getStateCommodityAllDistricts
);

router.get(
  "/prices/by-commodity/:commodity",
  getCommodityAcrossStates
);

router.get(
  "/prices/by-state/:state",
  getStateCommodities
);

router.post(
  "/prices/sync",
  syncToDb
);

export default router;