import { Market, MarketPrice, Demand } from "../models/index.js";
import MandiPrice from "../models/mandiPriceSchema.js";
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
    if (req.query.commodity) {
      filter.commodity = new RegExp(req.query.commodity.trim(), "i");
    }
    if (req.query.state) {
      filter.state = new RegExp(req.query.state.trim(), "i");
    }

    // 1. Query live MandiPrice records first for real-time rates
    const mandiRows = await MandiPrice.find(filter)
      .sort({ arrivalDate: -1, createdAt: -1 })
      .limit(100)
      .lean();

    if (mandiRows && mandiRows.length > 0) {
      const rows = mandiRows.map((r) => ({
        _id: r._id,
        commodity: r.commodity,
        variety: r.variety || "",
        grade: r.grade || "FAQ",
        date: r.arrivalDate,
        arrivalDate: r.arrivalDate,
        // Keep genuine ₹/quintal prices from AGMARKNET
        minPrice: r.minPrice,
        maxPrice: r.maxPrice,
        modalPrice: r.modalPrice,
        // Also provide ₹/kg for reference
        minPriceKg: Math.round((r.minPrice / 100) * 100) / 100,
        maxPriceKg: Math.round((r.maxPrice / 100) * 100) / 100,
        modalPriceKg: Math.round((r.modalPrice / 100) * 100) / 100,
        unit: "QUINTAL",
        source: r.source || "AGMARKNET (Real-Time)",
        market: {
          _id: r.marketRef || r._id,
          name: r.market,
          district: r.district,
          state: r.state,
          location: `${r.district}, ${r.state}`,
        },
      }));
      return ok(res, rows);
    }

    // 2. Fallback to MarketPrice if MandiPrice has no matching records
    const legacyFilter = {};
    if (req.query.commodity) {
      legacyFilter.commodity = new RegExp(req.query.commodity.trim(), "i");
    }

    const rows = await MarketPrice.find(legacyFilter)
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
