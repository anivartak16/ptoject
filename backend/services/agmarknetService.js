import axios from "axios";
import MandiPrice from "../models/mandiPriceSchema.js";

const BASE_URL = "https://api.data.gov.in/resource";

function getResourceId() {
  return (
    process.env.AGMARKNET_RESOURCE_ID ||
    "9ef84268-d588-465a-a308-a864a43d0070"
  ).trim();
}

function getApiKey() {
  return (
    process.env.AGMARKNET_API_KEY ||
    "579b464db66ec23bdd0000014a643905f24d4215470591f5a4ffef2f"
  ).trim();
}

function toAgmarknetDate(input) {
  if (!input) return null;
  if (input instanceof Date) {
    const d = String(input.getUTCDate()).padStart(2, "0");
    const m = String(input.getUTCMonth() + 1).padStart(2, "0");
    const y = input.getUTCFullYear();
    return `${d}/${m}/${y}`;
  }
  const str = String(input).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-");
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [d, m, y] = str.split("-");
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return str;
}

const STATE_ALIASES = {
  kerala: "Keralam",
  chhattisgarh: "Chattisgarh",
  "andaman and nicobar islands": "Andaman and Nicobar",
  orissa: "Odisha",
  pondicherry: "Puducherry",
};

function normalizeState(st) {
  if (!st) return st;
  const key = st.trim().toLowerCase();
  return STATE_ALIASES[key] || st.trim();
}

function getDatesInRange(fromDateStr, toDateStr) {
  const dates = [];
  if (!fromDateStr && !toDateStr) return dates;
  if (!toDateStr) return [toAgmarknetDate(fromDateStr)];
  if (!fromDateStr) return [toAgmarknetDate(toDateStr)];

  const start = new Date(fromDateStr);
  const end = new Date(toDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    const single = toAgmarknetDate(fromDateStr || toDateStr);
    return single ? [single] : [];
  }

  // Cap at 31 days to prevent excessive API requests
  const cur = new Date(start);
  let count = 0;
  while (cur <= end && count < 31) {
    dates.push(toAgmarknetDate(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
    count++;
  }
  return dates.filter(Boolean);
}

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
    date,
    arrivalDate,
    limit = 100,
    offset = 0,
    persist = false,
  } = {}
) {
  const apiKey = getApiKey();
  const resourceId = getResourceId();

  if (!apiKey) {
    throw new Error(
      "AGMARKNET_API_KEY is not set in the environment."
    );
  }

  const params = {
    "api-key": apiKey,
    format: "json",
    limit,
    offset,
  };

  if (state) {
    params["filters[state]"] = normalizeState(state);
  }

  if (commodity) {
    params["filters[commodity]"] = commodity.trim();
  }

  if (district) {
    params["filters[district]"] = district.trim();
  }

  if (market) {
    params["filters[market]"] = market.trim();
  }

  const targetDate = toAgmarknetDate(arrivalDate || date);
  if (targetDate) {
    params["filters[arrival_date]"] = targetDate;
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

  // Fetch data from AGMARKNET with short timeout and resilient fallback to MongoDB
  let response = null;
  try {
    response = await axios.get(
      `${BASE_URL}/${resourceId}`,
      {
        params,
        timeout: 5000,
      }
    );
  } catch (apiErr) {
    console.warn("AGMARKNET live government API unreachable/timed out. Falling back to MongoDB records:", apiErr.message);
  }

  let records = [];
  let total = 0;

  if (response?.data?.records?.length) {
    records = response.data.records.map(normalizeRecord);
    total = Number(response.data?.total || records.length);
  } else {
    // FALLBACK TO MONGODB MandiPrice
    const query = {};
    if (state) {
      const normState = normalizeState(state);
      query.state = new RegExp(`^${normState.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i");
    }
    if (commodity) {
      query.commodity = new RegExp(commodity.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
    }
    if (district) {
      query.district = new RegExp(district.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
    }
    if (market) {
      query.market = new RegExp(market.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
    }

    try {
      const [dbCount, dbRecords] = await Promise.all([
        MandiPrice.countDocuments(query),
        MandiPrice.find(query)
          .sort({ arrivalDate: -1, createdAt: -1 })
          .skip(offset || 0)
          .limit(limit || 50)
          .lean(),
      ]);

      records = dbRecords.map((doc) => ({
        state: doc.state,
        district: doc.district,
        market: doc.market,
        commodity: doc.commodity,
        variety: doc.variety || "Normal",
        grade: doc.grade || "FAQ",
        arrivalDate: doc.arrivalDate
          ? new Date(doc.arrivalDate).toLocaleDateString("en-GB")
          : "",
        minPrice: doc.minPrice || 0,
        maxPrice: doc.maxPrice || 0,
        modalPrice: doc.modalPrice || 0,
      }));
      total = dbCount || records.length;
    } catch (_dbErr) {
      console.warn("MongoDB fallback query error:", _dbErr.message);
    }
  }

  const result = {
    total,
    count: records.length,
    records,
  };

  // Store in cache
  setCache(key, result);

  // Save records to MongoDB if requested
  if (persist && records.length > 0 && response?.data?.records?.length) {
    const dbResult = await MandiPrice.bulkUpsert(
      records
    );

    result.db = dbResult;
  }

  return result;
}

/**
 * Fetch mandi price records across a date range (fromDate to toDate).
 * If persist = true, bulk-upserts all combined records into MongoDB.
 */
async function fetchMandiPricesDateRange({
  state,
  commodity,
  district,
  market,
  date,
  fromDate,
  toDate,
  limit = 100,
  persist = false,
} = {}) {
  const dates = getDatesInRange(fromDate || date, toDate || date);

  if (dates.length <= 1) {
    const singleDate = dates[0] || toAgmarknetDate(date || fromDate || toDate);
    return fetchMandiPrices({
      state,
      commodity,
      district,
      market,
      arrivalDate: singleDate,
      limit,
      persist,
    });
  }

  // Fetch sequentially/in batches across the date range
  const allRecords = [];
  let totalAcrossDays = 0;

  for (const d of dates) {
    try {
      const res = await fetchMandiPrices({
        state,
        commodity,
        district,
        market,
        arrivalDate: d,
        limit,
        persist: false,
      });

      totalAcrossDays += res.total;
      if (res.records?.length > 0) {
        allRecords.push(...res.records);
      }
    } catch (err) {
      console.warn(`Date range fetch warning for ${d}:`, err.message);
    }
  }

  // Deduplicate records by unique compound index keys
  const uniqueMap = new Map();
  for (const rec of allRecords) {
    const key = `${rec.state}|${rec.district}|${rec.market}|${rec.commodity}|${rec.variety || ""}|${rec.arrivalDate}`;
    uniqueMap.set(key, rec);
  }
  const uniqueRecords = Array.from(uniqueMap.values());

  let dbResult = null;
  if (persist && uniqueRecords.length > 0) {
    dbResult = await MandiPrice.bulkUpsert(uniqueRecords);
  }

  return {
    total: totalAcrossDays,
    count: uniqueRecords.length,
    records: uniqueRecords,
    db: dbResult,
    dates,
  };
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
 * Supports optional arrivalDate or fromDate/toDate range.
 * If 0 records are found, auto-detects active states for that commodity
 * and active crops in that state to explain why.
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

  const dates = getDatesInRange(opts.fromDate || opts.date, opts.toDate || opts.date);
  const targetDates = dates.length > 0 ? dates : [opts.arrivalDate ? toAgmarknetDate(opts.arrivalDate) : null];

  let allRecords = [];
  let total = 0;

  for (const targetDate of targetDates) {
    let offset = 0;
    let pageTotal = Infinity;

    try {
      while (
        offset < pageTotal &&
        allRecords.length < maxRecords
      ) {
        const res = await fetchMandiPrices({
          state,
          commodity,
          arrivalDate: targetDate || undefined,
          limit: pageSize,
          offset,
        });

        pageTotal = res.total;
        total = Math.max(total, pageTotal);

        if (!res.records || res.records.length === 0) {
          break;
        }

        allRecords.push(...res.records);
        offset += pageSize;

        if (allRecords.length >= pageTotal) {
          break;
        }
      }
    } catch (err) {
      console.warn("Partial fetch error in fetchStateCommodityAllDistricts:", err.message);
      if (allRecords.length === 0 && targetDates.length === 1) {
        throw err;
      }
    }
  }

  // Deduplicate
  const uniqueMap = new Map();
  for (const rec of allRecords) {
    const key = `${rec.state}|${rec.district}|${rec.market}|${rec.commodity}|${rec.variety || ""}|${rec.arrivalDate}`;
    uniqueMap.set(key, rec);
  }
  allRecords = Array.from(uniqueMap.values());

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

  // If 0 records were returned, check why: find active states for commodity and active crops for state
  if (allRecords.length === 0) {
    try {
      const [otherStates, otherCommodities] = await Promise.all([
        fetchCommodityAcrossStates(commodity, 100).catch(() => []),
        fetchStateCommodities(state, 100).catch(() => []),
      ]);

      result.commodityActiveStates = otherStates.map((x) => x.state);
      result.stateActiveCommodities = Array.from(
        new Set(otherCommodities.map((x) => x.commodity))
      ).slice(0, 15);
    } catch (detectErr) {
      console.warn("Could not check alternative suggestions:", detectErr.message);
    }
  }

  // Save all records to MongoDB if requested
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
 */
async function syncStateCommodityToDb(
  state,
  commodity,
  opts = {}
) {
  const result =
    await fetchStateCommodityAllDistricts(
      state,
      commodity,
      {
        persist: true,
        ...opts,
      }
    );

  return {
    total: result.total,
    fetched: result.fetched,
    db: result.db,
    commodityActiveStates: result.commodityActiveStates || [],
    stateActiveCommodities: result.stateActiveCommodities || [],
  };
}

const ALL_INDIAN_STATES = [
  "Andaman and Nicobar",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const POPULAR_COMMODITIES = [
  "Wheat",
  "Rice",
  "Paddy(Common)",
  "Paddy(Basmati)",
  "Tomato",
  "Onion",
  "Potato",
  "Soyabean",
  "Mustard",
  "Cotton",
  "Maize",
  "Gram",
  "Green Chilli",
  "Cabbage",
  "Cauliflower",
  "Brinjal",
  "Garlic",
  "Ginger(Green)",
  "Banana",
  "Apple",
  "Mango",
  "Pomegranate",
  "Groundnut",
  "Guar",
  "Bajra(Pearl Millet/Cumbu)",
  "Jowar(Sorghum)",
  "Turmeric",
  "Arhar(Tur/Red Gram)",
  "Moong(Green Gram)",
  "Urad(Black Gram)",
];

/**
 * Fetch top active states and commodities for auto-suggestions.
 * Always guarantees all 36 Indian states/UTs are present in the list.
 */
async function fetchActiveOptions() {
  const cacheKeyStr = "active_options_summary_v2";
  const cached = getFromCache(cacheKeyStr);
  if (cached) return cached;

  try {
    const [dbStates, dbCommodities] = await Promise.all([
      MandiPrice.distinct("state").catch(() => []),
      MandiPrice.distinct("commodity").catch(() => []),
    ]);

    let feedStates = (dbStates || []).filter(Boolean);
    let feedCommodities = (dbCommodities || []).filter(Boolean);

    // Union all Indian states with feed states
    const states = Array.from(new Set([...ALL_INDIAN_STATES, ...feedStates])).sort();
    const commodities = Array.from(new Set([...POPULAR_COMMODITIES, ...feedCommodities])).sort();

    const data = {
      states,
      allStates: ALL_INDIAN_STATES,
      activeStates: feedStates.length > 0 ? feedStates.sort() : ALL_INDIAN_STATES,
      commodities,
    };

    setCache(cacheKeyStr, data);
    return data;
  } catch (err) {
    return {
      states: ALL_INDIAN_STATES,
      allStates: ALL_INDIAN_STATES,
      activeStates: ALL_INDIAN_STATES,
      commodities: POPULAR_COMMODITIES,
    };
  }
}

/**
 * ESM exports
 */
export {
  toAgmarknetDate,
  getDatesInRange,
  fetchMandiPrices,
  fetchMandiPricesDateRange,
  fetchCommodityAcrossStates,
  fetchStateCommodities,
  fetchStateCommodityAllDistricts,
  syncStateCommodityToDb,
  fetchActiveOptions,
};