import { Market, MarketPrice, Demand } from "../models/index.js";
import { marketsFor, priceInsight, sellAdvice } from "../services/intelligence.js";
import { ok, fail } from "../utils/response.js";

export async function getMarkets(req, res, next) {
  try {
    const filter = req.query.state ? { state: req.query.state } : {};
    const markets = await Market.find(filter);
    return ok(res, markets);
  } catch (error) {
    next(error);
  }
}

export async function getNearbyMarkets(req, res, next) {
  try {
    let origin;
    const longitude = Number(req.query.longitude);
    const latitude = Number(req.query.latitude);

    if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
      origin = [longitude, latitude];
    } else if (req.user?.geo?.coordinates?.length === 2) {
      origin = req.user.geo.coordinates;
    }

    const commodity = req.query.commodity || req.user?.primaryCrop || "Wheat";
    const district = req.query.district || req.user?.district || "";
    const state = req.query.state || req.user?.state || "";
    const location = req.query.location || req.user?.location || "";
    const address = req.query.address || req.user?.address || "";
    const role = req.query.role || req.user?.role || "FARMER";

    const rows = await marketsFor(commodity, {
      origin,
      district,
      state,
      location,
      address,
      role,
    });
    return ok(res, rows, "Nearest grain mandis");
  } catch (error) {
    next(error);
  }
}

export async function getPrices(req, res, next) {
  try {
    const filter = {};
    if (req.query.commodity) filter.commodity = req.query.commodity;

    const rows = await MarketPrice.find(filter)
      .populate("market")
      .sort({ date: -1 })
      .limit(100);

    return ok(res, rows);
  } catch (error) {
    next(error);
  }
}

export async function getPriceTrends(req, res, next) {
  try {
    const commodity = req.query.commodity || req.user?.primaryCrop || "Wheat";
    const insight = await priceInsight(commodity);
    if (!insight) return fail(res, 404, "No prices found", "NOT_FOUND");

    const demands = await Demand.countDocuments({
      commodity: new RegExp(`^${commodity}$`, "i"),
      status: "ACTIVE",
    });

    return ok(res, { ...insight, advice: sellAdvice(insight, demands) });
  } catch (error) {
    next(error);
  }
}
