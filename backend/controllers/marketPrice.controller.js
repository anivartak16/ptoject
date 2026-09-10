import {
  fetchMandiPrices,
  fetchCommodityAcrossStates,
  fetchStateCommodities,
  fetchStateCommodityAllDistricts,
  syncStateCommodityToDb,
} from "../services/agmarknetService.js";

// GET /api/market-data/prices?state=Madhya Pradesh&commodity=Wheat&district=Indore&market=&limit=100&offset=0
async function getPrices(req, res) {
  try {
    const {
      state,
      commodity,
      district,
      market,
      limit,
      offset,
    } = req.query;

    const data = await fetchMandiPrices({
      state,
      commodity,
      district,
      market,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message:
        "Could not fetch mandi price data from AGMARKNET.",
      error: error.message,
    });
  }
}

// GET /api/market-data/prices/by-commodity/:commodity
// Returns one representative row per state.
async function getCommodityAcrossStates(req, res) {
  try {
    const { commodity } = req.params;

    const rows =
      await fetchCommodityAcrossStates(commodity);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message:
        "Could not fetch commodity price comparison across states.",
      error: error.message,
    });
  }
}

// GET /api/market-data/prices/by-state/:state
// Returns every commodity traded in that state.
async function getStateCommodities(req, res) {
  try {
    const { state } = req.params;

    const rows =
      await fetchStateCommodities(state);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message:
        "Could not fetch commodity list for this state.",
      error: error.message,
    });
  }
}

// GET /api/market-data/prices/state-commodity?state=Madhya Pradesh&commodity=Wheat
// Returns every record for this state + commodity,
// across all districts (auto-paginated).
async function getStateCommodityAllDistricts(req, res) {
  try {
    const {
      state,
      commodity,
    } = req.query;

    if (!state || !commodity) {
      return res.status(400).json({
        success: false,
        message:
          "Both 'state' and 'commodity' query params are required.",
      });
    }

    const data =
      await fetchStateCommodityAllDistricts(
        state,
        commodity
      );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message:
        "Could not fetch district-wise price data.",
      error: error.message,
    });
  }
}

// POST /api/market-data/prices/sync
// Body: { state, commodity }
//
// Fetches from AGMARKNET and saves every record
// to MongoDB using upsert.
async function syncToDb(req, res) {
  try {
    const {
      state,
      commodity,
    } = req.body;

    if (!state || !commodity) {
      return res.status(400).json({
        success: false,
        message:
          "Both 'state' and 'commodity' are required in the request body.",
      });
    }

    const result =
      await syncStateCommodityToDb(
        state,
        commodity
      );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: "Sync failed.",
      error: error.message,
    });
  }
}

export {
  getPrices,
  getCommodityAcrossStates,
  getStateCommodities,
  getStateCommodityAllDistricts,
  syncToDb,
};