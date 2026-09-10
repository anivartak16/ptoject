import { MarketPrice, Demand, Lot } from "../models/index.js";
import {
  computeMarketPrediction,
  COMMODITY_PROFILES,
} from "../utils/predictionModel.js";
import { ok, fail } from "../utils/response.js";

/**
 * GET /api/predictions/:crop?
 * Computes live multi-factor market prediction for a commodity
 */
export async function getCropPrediction(req, res) {
  try {
    const commodity = req.params.crop || req.query.commodity || req.query.crop || "Wheat";
    const location = req.query.location || "Indore";
    const horizonDays = Number(req.query.horizon || req.query.horizonDays || 14);
    const role = (req.query.role || req.user?.role || "FARMER").toUpperCase();

    // Query historical prices for this commodity from DB
    const historicalPrices = await MarketPrice.find({ commodity })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    // Query current demand volume from DB
    const activeDemands = await Demand.find({ commodity, status: "OPEN" }).lean();
    const demandVolume = activeDemands.reduce((sum, d) => sum + (d.requiredQuantity || 0), 0);

    // Query current available lots volume from DB
    const availableLots = await Lot.find({ commodity, status: "AVAILABLE" }).lean();
    const lotsVolume = availableLots.reduce((sum, l) => sum + (l.remainingQuantity || l.quantity || 0), 0);

    // Format historical series for Recharts
    const historicalSeries = historicalPrices
      .reverse()
      .map((p) => ({
        date: new Date(p.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        modalPrice: p.modalPrice,
        minPrice: p.minPrice,
        maxPrice: p.maxPrice,
        arrivalVolume: p.arrivalVolume || 0,
      }));

    const prediction = computeMarketPrediction({
      commodity,
      location,
      role,
      horizonDays,
      historicalPrices,
      currentDemandCount: activeDemands.length,
      currentDemandVolume: demandVolume,
      availableLotsCount: availableLots.length,
      availableLotsVolume: lotsVolume,
    });

    return ok(res, {
      ...prediction,
      historicalSeries,
      availableCommodities: Object.keys(COMMODITY_PROFILES),
    });
  } catch (error) {
    console.error("Prediction computation error:", error);
    return fail(res, 500, "Failed to compute market intelligence prediction");
  }
}

/**
 * GET /api/predictions/overview
 * Overview predictions for key staple crops (Wheat, Soybean, Onion, Potato)
 */
export async function getPredictionsOverview(req, res) {
  try {
    const role = (req.query.role || req.user?.role || "FARMER").toUpperCase();
    const keyCrops = ["Wheat", "Soybean", "Onion", "Potato", "Mustard"];

    const overview = await Promise.all(
      keyCrops.map(async (commodity) => {
        const latestPrice = await MarketPrice.findOne({ commodity })
          .sort({ date: -1 })
          .lean();

        return computeMarketPrediction({
          commodity,
          role,
          horizonDays: 14,
          historicalPrices: latestPrice ? [latestPrice] : [],
        });
      })
    );

    return ok(res, overview);
  } catch (error) {
    console.error("Prediction overview error:", error);
    return fail(res, 500, "Failed to load market prediction overview");
  }
}
