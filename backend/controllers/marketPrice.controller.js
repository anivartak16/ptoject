import {
  fetchMandiPrices,
  fetchMandiPricesDateRange,
  fetchCommodityAcrossStates,
  fetchStateCommodities,
  fetchStateCommodityAllDistricts,
  syncStateCommodityToDb,
  fetchActiveOptions,
  toAgmarknetDate,
  getSyncEngineStatus,
  runLiveNationalSync,
} from "../services/agmarknetService.js";

// GET /api/marketPrice/prices?state=...&commodity=...&district=...&date=...&fromDate=...&toDate=...&limit=100&offset=0
async function getPrices(req, res) {
  try {
    const {
      state,
      commodity,
      district,
      market,
      date,
      arrivalDate,
      fromDate,
      toDate,
      limit,
      offset,
    } = req.query;

    if (fromDate || toDate) {
      const data = await fetchMandiPricesDateRange({
        state,
        commodity,
        district,
        market,
        fromDate,
        toDate,
        date: arrivalDate || date,
        limit: limit ? Number(limit) : undefined,
        persist: false,
      });

      return res.json({
        success: true,
        data,
      });
    }

    const data = await fetchMandiPrices({
      state,
      commodity,
      district,
      market,
      date: arrivalDate || date,
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

import MandiPrice from "../models/mandiPriceSchema.js";

// POST /api/marketPrice/prices/sync
// Body: { state, commodity, limit, fromDate, toDate, date }
//
// Fetches from AGMARKNET and saves every record
// to MongoDB using bulk upsert.
async function syncToDb(req, res) {
  try {
    const {
      state,
      commodity,
      limit = 100,
      date,
      arrivalDate,
      fromDate,
      toDate,
    } = req.body || {};

    const targetDate = arrivalDate || date;

    // If both state and commodity are given, fetch all district records recursively
    if (state && commodity) {
      const result = await syncStateCommodityToDb(
        state.trim(),
        commodity.trim(),
        {
          date: targetDate,
          fromDate,
          toDate,
        }
      );

      // If 0 records were returned for this state + commodity combination
      if (result.fetched === 0) {
        const activeStatesMsg = result.commodityActiveStates?.length > 0
          ? ` Note: "${commodity}" currently has active arrivals in: ${result.commodityActiveStates.slice(0, 6).join(", ")}.`
          : "";
        const activeCropsMsg = result.stateActiveCommodities?.length > 0
          ? ` Active crops reported in ${state} include: ${result.stateActiveCommodities.slice(0, 6).join(", ")}.`
          : "";

        return res.json({
          success: true,
          warning: true,
          message: `0 records found for ${commodity} in ${state} in the AGMARKNET feed.${activeStatesMsg}${activeCropsMsg}`,
          data: result,
        });
      }

      return res.json({
        success: true,
        message: `Successfully synced ${result.fetched} records for ${commodity} in ${state}.`,
        data: result,
      });
    }

    // Flexible sync: date range, state-only, commodity-only, or general latest mandi prices nationwide
    const data = await fetchMandiPricesDateRange({
      state: state ? state.trim() : undefined,
      commodity: commodity ? commodity.trim() : undefined,
      date: targetDate,
      fromDate,
      toDate,
      limit: Math.min(Number(limit) || 100, 1000),
      persist: true,
    });

    if (data.count === 0) {
      return res.json({
        success: true,
        warning: true,
        message: `0 records found for the specified filters in the AGMARKNET feed. Try expanding your date range or selecting another state/commodity.`,
        data,
      });
    }

    return res.json({
      success: true,
      message: `Successfully synced ${data.count} mandi records to database.`,
      data: {
        total: data.total,
        fetched: data.count,
        db: data.db,
        records: data.records,
        dates: data.dates,
      },
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: "Sync failed: " + error.message,
      error: error.message,
    });
  }
}

// GET /api/marketPrice/prices/stats
// Summary of records stored in MongoDB MandiPrice collection
async function getDbStats(req, res) {
  try {
    const totalRecords = await MandiPrice.countDocuments();
    const latestRecord = await MandiPrice.findOne().sort({ arrivalDate: -1, createdAt: -1 });
    const lastSyncRecord = await MandiPrice.findOne().sort({ fetchedAt: -1, updatedAt: -1 });
    const distinctCommodities = await MandiPrice.distinct("commodity");
    const distinctStates = await MandiPrice.distinct("state");
    const recentRecords = await MandiPrice.find()
      .sort({ fetchedAt: -1, createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalRecords,
        latestArrivalDate: latestRecord?.arrivalDate || null,
        lastSyncedAt: lastSyncRecord?.fetchedAt || lastSyncRecord?.updatedAt || null,
        commoditiesCount: distinctCommodities.length,
        statesCount: distinctStates.length,
        commodities: distinctCommodities.sort().slice(0, 30),
        states: distinctStates.sort(),
        recentRecords,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch database stats: " + error.message,
      error: error.message,
    });
  }
}

// GET /api/marketPrice/prices/db
// Fetch synced records from MongoDB with filtering & pagination
async function getDbRecords(req, res) {
  try {
    const {
      state,
      commodity,
      district,
      fromDate,
      toDate,
      limit = 50,
      page = 1,
    } = req.query;

    const query = {};
    if (state) query.state = new RegExp(state.trim(), "i");
    if (commodity) query.commodity = new RegExp(commodity.trim(), "i");
    if (district) query.district = new RegExp(district.trim(), "i");

    if (fromDate || toDate) {
      query.arrivalDate = {};
      if (fromDate) query.arrivalDate.$gte = new Date(fromDate);
      if (toDate) {
        const toD = new Date(toDate);
        toD.setUTCHours(23, 59, 59, 999);
        query.arrivalDate.$lte = toD;
      }
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [total, records] = await Promise.all([
      MandiPrice.countDocuments(query),
      MandiPrice.find(query)
        .sort({ arrivalDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({
      success: true,
      data: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        records,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch DB records: " + error.message,
      error: error.message,
    });
  }
}

// GET /api/marketPrice/active-options
async function getActiveOptions(req, res) {
  try {
    const data = await fetchActiveOptions();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch active options: " + error.message,
      error: error.message,
    });
  }
}

// GET /api/marketPrice/sync/status
// Returns live status of the auto-sync daemon and DB health
async function getSyncStatus(_req, res) {
  try {
    const status = await getSyncEngineStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch sync daemon status: " + error.message,
      error: error.message,
    });
  }
}

// POST /api/marketPrice/sync/trigger
// Manually triggers an instant live sync run
async function triggerLiveSync(req, res) {
  try {
    const { limit = 250 } = req.body || {};
    const result = await runLiveNationalSync({ force: true, limit: Number(limit) || 250 });

    res.json({
      success: result.success,
      message: result.message,
      data: result,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: "Live sync failed: " + error.message,
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
  getDbStats,
  getDbRecords,
  getActiveOptions,
  getSyncStatus,
  triggerLiveSync,
};