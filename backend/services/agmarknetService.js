import axios from "axios";
import MandiPrice from "../models/mandiPriceSchema.js";

const BASE_URL = "https://api.data.gov.in/resource";

const RESOURCE_ID =
  process.env.AGMARKNET_RESOURCE_ID ||
  "9ef84268-d588-465a-a308-a864a43d0070";

const API_KEY = process.env.AGMARKNET_API_KEY;

// Simple in-memory cache.
// The government API can be slow/rate-limited, and mandi prices
// generally update once a day.
const cache = new Map();

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function cacheKey(params) {
  return JSON.stringify(params);
}

function getFromCache(key) {
  const hit = cache.get(key);

  if (!hit) {
    return null;
  }

  if (Date.now() - hit.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return hit.data;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Fetch mandi price records from AGMARKNET / data.gov.in.
 *
 * Supports:
 * - state-wise filtering
 * - commodity-wise filtering
 * - district-wise filtering
 * - market-wise filtering
 *
 * If persist = true, fetched records are also saved
 * into MongoDB using MandiPrice.bulkUpsert().
 */
async function fetchMandiPrices(
  {
    state,
    commodity,
    district,
    market,
    limit = 100,
    offset = 0,
    persist = false,
  } = {}
) {
  if (!API_KEY) {
    throw new Error(
      "AGMARKNET_API_KEY is not set in the environment."
    );
  }

  const params = {
    "api-key": API_KEY,
    format: "json",
    limit,
    offset,
  };

  if (state) {
    params["filters[state]"] = state;
  }

  if (commodity) {
    params["filters[commodity]"] = commodity;
  }

  if (district) {
    params["filters[district]"] = district;
  }

  if (market) {
    params["filters[market]"] = market;
  }

  // Check cache
  const key = cacheKey(params);
  const cached = getFromCache(key);

  if (cached) {
    // If persistence is requested, save cached records too.
    if (persist && cached.records.length > 0) {
      const dbResult = await MandiPrice.bulkUpsert(
        cached.records
      );

      return {
        ...cached,
        db: dbResult,
      };
    }

    return cached;
  }

  // Fetch data from AGMARKNET
  const response = await axios.get(
    `${BASE_URL}/${RESOURCE_ID}`,
    {
      params,
      timeout: 15000,
    }
  );

  // Normalize API records
  const records = (
    response.data?.records || []
  ).map(normalizeRecord);

  const result = {
    total: Number(
      response.data?.total || records.length
    ),
    count: records.length,
    records,
  };

  // Store in cache
  setCache(key, result);

  // Save records to MongoDB if requested
  if (persist && records.length > 0) {
    const dbResult = await MandiPrice.bulkUpsert(
      records
    );

    result.db = dbResult;
  }

  return result;
}

/**
 * Convert raw AGMARKNET record into a clean format.
 */
function normalizeRecord(row) {
  return {
    state: row.state,
    district: row.district,
    market: row.market,
    commodity: row.commodity,
    variety: row.variety,
    grade: row.grade,

    arrivalDate: row.arrival_date,

    minPrice:
      Number(row.min_price) || 0,

    maxPrice:
      Number(row.max_price) || 0,

    modalPrice:
      Number(row.modal_price) || 0,
  };
}

/**
 * Get modal-price rows for one commodity
 * across different states.
 *
 * Returns one representative record per state.
 */
async function fetchCommodityAcrossStates(
  commodity,
  limit = 500
) {
  const { records } = await fetchMandiPrices({
    commodity,
    limit,
  });

  const byState = new Map();

  for (const rec of records) {
    if (!byState.has(rec.state)) {
      byState.set(rec.state, rec);
    }
  }

  return Array.from(byState.values()).sort(
    (a, b) =>
      a.state.localeCompare(b.state)
  );
}

/**
 * Get all commodities and their prices
 * traded in one state.
 */
async function fetchStateCommodities(
  state,
  limit = 500
) {
  const { records } = await fetchMandiPrices({
    state,
    limit,
  });

  return records;
}

/**
 * Fetch every record for a state + commodity combination.
 *
 * Automatically handles pagination so that records
 * from different districts are not missed.
 *
 * If opts.persist = true, all records are saved
 * to MongoDB in one bulk operation.
 */
async function fetchStateCommodityAllDistricts(
  state,
  commodity,
  opts = {}
) {
  const pageSize =
    opts.pageSize || 100;

  const maxRecords =
    opts.maxRecords || 5000;

  let offset = 0;
  let total = Infinity;

  const allRecords = [];

  while (
    offset < total &&
    offset < maxRecords
  ) {
    const {
      total: pageTotal,
      records,
    } = await fetchMandiPrices({
      state,
      commodity,
      limit: pageSize,
      offset,
    });

    total = pageTotal;

    // Stop if API returns an empty page
    if (records.length === 0) {
      break;
    }

    allRecords.push(...records);

    offset += pageSize;
  }

  // Group records by district
  const districtMap = new Map();

  for (const rec of allRecords) {
    const key =
      rec.district || "Unknown";

    if (!districtMap.has(key)) {
      districtMap.set(key, []);
    }

    districtMap.get(key).push(rec);
  }

  // Convert map into an array
  const districts = Array.from(
    districtMap.entries()
  )
    .map(([district, rows]) => ({
      district,
      rows,
    }))
    .sort(
      (a, b) =>
        a.district.localeCompare(
          b.district
        )
    );

  const result = {
    total,
    fetched: allRecords.length,
    records: allRecords,
    districts,
  };

  // Save all records to MongoDB
  if (
    opts.persist &&
    allRecords.length > 0
  ) {
    result.db =
      await MandiPrice.bulkUpsert(
        allRecords
      );
  }

  return result;
}

/**
 * Fetch the complete state + commodity data
 * and save it into MongoDB.
 *
 * Example:
 *
 * await syncStateCommodityToDb(
 *   "Madhya Pradesh",
 *   "Wheat"
 * );
 */
async function syncStateCommodityToDb(
  state,
  commodity
) {
  const result =
    await fetchStateCommodityAllDistricts(
      state,
      commodity,
      {
        persist: true,
      }
    );

  return {
    total: result.total,
    fetched: result.fetched,
    db: result.db,
  };
}

/**
 * ESM exports
 */
export {
  fetchMandiPrices,
  fetchCommodityAcrossStates,
  fetchStateCommodities,
  fetchStateCommodityAllDistricts,
  syncStateCommodityToDb,
};