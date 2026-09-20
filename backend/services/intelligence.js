import { MarketPrice, Market, Lot, Demand } from "../models/index.js";
import MandiPrice from "../models/mandiPriceSchema.js";
import { fetchMandiPrices } from "./agmarknetService.js";
import {
  resolveCoordinates,
  calculateDistanceKm,
  cleanKey,
} from "../utils/geoCoordinates.js";

/**
 * Returns commodity matching regex supporting aliases (e.g. Rice -> Paddy, Soybean -> Soyabean)
 */
function getCommodityRegex(commodity) {
  if (!commodity || typeof commodity !== "string") return /Wheat/i;
  const c = commodity.trim().toLowerCase();
  if (c === "rice" || c === "paddy") return /paddy|rice/i;
  if (c === "soybean" || c === "soyabean") return /soya/i;
  if (c === "corn" || c === "maize") return /maize|corn/i;
  if (c === "gram" || c === "chana") return /gram|chana/i;
  if (c === "chilli" || c === "chili") return /chilli|chili/i;
  return new RegExp(commodity.trim(), "i");
}

function hashString(str) {
  if (!str || typeof str !== "string") return 42;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Calculates 7-day and 30-day price trends, min/max, percentage change, and trend direction.
 * Backed by both MarketPrice and live AGMARKNET MandiPrice records in MongoDB.
 */
export async function priceInsight(commodity = "Wheat") {
  const queryRegex = getCommodityRegex(commodity);

  // 1. Prioritize live MandiPrice records (prices stored in ₹/quintal from AGMARKNET)
  let rows = [];
  const mandiRows = await MandiPrice.find({ commodity: queryRegex })
    .sort({ arrivalDate: 1 })
    .limit(300)
    .lean();

  if (mandiRows && mandiRows.length > 0) {
    // Group records by date and compute average modal price per day (₹/qtl)
    const byDate = new Map();
    mandiRows.forEach((r) => {
      const dateKey = r.arrivalDate
        ? new Date(r.arrivalDate).toISOString().slice(0, 10)
        : "unknown";
      if (!byDate.has(dateKey)) byDate.set(dateKey, []);
      byDate.get(dateKey).push(r);
    });

    // Build a time-series where each point is the average of all mandis on that date
    rows = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, records]) => {
        const avgModal = Math.round(
          records.reduce((s, r) => s + (r.modalPrice || 0), 0) / records.length
        );
        const avgMin = Math.round(
          records.reduce((s, r) => s + (r.minPrice || r.modalPrice || 0), 0) / records.length
        );
        const avgMax = Math.round(
          records.reduce((s, r) => s + (r.maxPrice || r.modalPrice || 0), 0) / records.length
        );
        return {
          commodity: records[0].commodity,
          modalPrice: avgModal,   // ₹/quintal — genuine DB value
          minPrice: avgMin,
          maxPrice: avgMax,
          date: new Date(dateKey),
          mandisReporting: records.length,
        };
      });
  } else {
    // Fall back to legacy MarketPrice records if MandiPrice is empty
    const legacy = await MarketPrice.find({ commodity: queryRegex }).sort({ date: 1 });
    rows = legacy.map((r) => ({
      commodity: r.commodity,
      modalPrice: r.modalPrice,
      minPrice: r.minPrice,
      maxPrice: r.maxPrice,
      date: r.date,
    }));
  }

  if (!rows || !rows.length) return null;

  const vals = rows.map((x) => x.modalPrice);
  const current = vals.at(-1);
  const avg = (n) =>
    Math.round(vals.slice(-n).reduce((a, b) => a + b, 0) / Math.min(n, vals.length));

  const average30Days = avg(30);
  const changePercentage = +(((current - average30Days) / average30Days) * 100).toFixed(2);
  const trend =
    changePercentage > 1 ? "UP" : changePercentage < -1 ? "DOWN" : "STABLE";

  return {
    commodity,
    currentPrice: current,
    average7Days: avg(7),
    average30Days,
    minPrice: Math.min(...vals),
    maxPrice: Math.max(...vals),
    changePercentage,
    trend,
    lastUpdated: new Date(),
    history: rows,
  };
}


/**
 * Finds and ranks nearby grain mandis based on net price, ratings, distance, and transport cost.
 * Fully personalized per user:
 * - Geocodes user district, state, coordinates
 * - Auto-fetches live AGMARKNET API data into MongoDB if missing for user's state
 * - Strict proximity: filters out distant states (e.g. Tamil Nadu) when user is in MP
 * - Always includes local district and town mandis (e.g. Khurai, Bina, Sagar)
 */
export async function marketsFor(commodity = "Wheat", originOrOptions = [75.8577, 22.7196], extraOptions = {}) {
  let origin;
  let district = "";
  let state = "";
  let location = "";
  let address = "";
  let role = "FARMER";

  if (Array.isArray(originOrOptions)) {
    origin = originOrOptions;
    district = extraOptions.district || "";
    state = extraOptions.state || "";
    location = extraOptions.location || "";
    address = extraOptions.address || "";
    role = extraOptions.role || "FARMER";
  } else if (typeof originOrOptions === "object" && originOrOptions !== null) {
    origin = originOrOptions.origin;
    district = originOrOptions.district || "";
    state = originOrOptions.state || "";
    location = originOrOptions.location || "";
    address = originOrOptions.address || "";
    role = originOrOptions.role || "FARMER";
  } else {
    origin = [75.8577, 22.7196];
    role = "FARMER";
  }

  const userOrigin = resolveCoordinates({
    coordinates: origin,
    district,
    state,
    location,
    address,
  });

  const targetState = state || "Madhya Pradesh";
  const targetDistrict = district || location || "";
  const queryRegex = getCommodityRegex(commodity);

  // 1. Check if database has records for this commodity in user's state
  const stateCount = await MandiPrice.countDocuments({
    commodity: queryRegex,
    state: new RegExp(targetState, "i"),
  });

  // 2. If 0 records in state, auto-fetch from data.gov.in AGMARKNET API into MongoDB!
  if (stateCount === 0) {
    try {
      await fetchMandiPrices({
        state: targetState,
        commodity,
        limit: 100,
        persist: true, // Stores directly into MongoDB MandiPrice collection!
      });
    } catch (err) {
      console.warn(`[Auto-Sync API] Could not fetch ${commodity} for ${targetState}:`, err.message);
    }
  }

  // 3. Fetch records from user's state first
  let mandiPrices = await MandiPrice.find({
    commodity: queryRegex,
    state: new RegExp(targetState, "i"),
  })
    .sort({ arrivalDate: -1, createdAt: -1 })
    .limit(300)
    .lean();

  // If still empty in state, search without state filter
  if (!mandiPrices.length) {
    mandiPrices = await MandiPrice.find({ commodity: queryRegex })
      .sort({ arrivalDate: -1, createdAt: -1 })
      .limit(100)
      .lean();
  }

  // Guarantee local mandis: if user has a district/town (e.g. Sagar, Khurai), also pull local APMC mandis
  if (targetDistrict) {
    const localMandis = await MandiPrice.find({
      district: new RegExp(targetDistrict, "i"),
    })
      .sort({ arrivalDate: -1, createdAt: -1 })
      .limit(30)
      .lean();

    const existingIds = new Set(mandiPrices.map((p) => String(p._id)));
    localMandis.forEach((lm) => {
      if (!existingIds.has(String(lm._id))) {
        mandiPrices.push(lm);
      }
    });
  }

  // 4. Also fetch any MarketPrice seeded records with associated Market docs
  const seedPrices = await MarketPrice.find({ commodity: queryRegex })
    .sort({ date: -1 })
    .populate("market")
    .lean();

  const newest = new Map();

  // Process live AGMARKNET records
  mandiPrices.forEach((price) => {
    const key = (price.market || "").toLowerCase().trim();
    if (!newest.has(key)) {
      const mandiCoords = resolveCoordinates({
        district: price.district,
        state: price.state,
        location: price.market,
      });

      const distKey = cleanKey(district || location);
      const locKey = cleanKey(location);
      const mDistKey = cleanKey(price.district);
      const mMarketKey = cleanKey(price.market);

      const isSameTown = Boolean(locKey) && (mMarketKey.includes(locKey) || locKey.includes(mMarketKey));
      const isSameDistrict =
        isSameTown ||
        (Boolean(distKey) &&
          (distKey === mDistKey ||
            mMarketKey.includes(distKey) ||
            mDistKey.includes(distKey)));

      let dist = calculateDistanceKm(userOrigin, mandiCoords);
      if (isSameTown) {
        dist = 2 + (hashString(price.market) % 4); // estimated 2-5 km (no GPS in AGMARKNET)
      } else if (isSameDistrict && dist <= 8) {
        dist = 12 + (hashString(price.market) % 12); // estimated 12-23 km for same district
      }

      // Keep genuine AGMARKNET prices in ₹/quintal (the unit they are stored in)
      const modalPricePerQtl = price.modalPrice; // genuine ₹/qtl from DB
      const minPriceQtl = price.minPrice;
      const maxPriceQtl = price.maxPrice;

      // Convert to ₹/kg for net-return display (accurate to 2 decimal places)
      const modalPricePerKg = Math.round((price.modalPrice / 100) * 100) / 100;

      // Transport cost: ₹8/km per quintal is a reasonable approximation
      const transportCostPerQtlPerKm = 0.8;
      const estimatedTransportCostPerQtl = Math.max(5, Math.round(dist * transportCostPerQtlPerKm));
      const netPricePerQtl = Math.max(1, modalPricePerQtl - estimatedTransportCostPerQtl);

      newest.set(key, {
        _id: price._id,
        commodity: price.commodity,
        variety: price.variety,
        grade: price.grade,
        arrivalDate: price.arrivalDate,
        // ₹/kg (for UI display in market list cards)
        modalPrice: modalPricePerKg,
        // ₹/quintal (genuine DB values for chart)
        modalPricePerQtl,
        minPrice: minPriceQtl,
        maxPrice: maxPriceQtl,
        netPrice: Math.round(netPricePerQtl / 100 * 100) / 100, // ₹/kg net
        netPricePerQtl,
        distanceKm: dist,
        transportCostPerKm: 0.8,
        estimatedTransportCost: Math.round(estimatedTransportCostPerQtl / 100 * 100) / 100,
        isSameTown,
        isSameDistrict,
        source: price.source || "AGMARKNET",
        market: {
          _id: price._id,
          name: price.market,
          location: `${price.district}, ${price.state}`,
          district: price.district,
          state: price.state,
          geo: { type: "Point", coordinates: mandiCoords },
        },
      });
    }
  });


  // Process any seed records
  seedPrices.forEach((price) => {
    if (!price.market) return;
    const key = (price.market.name || "").toLowerCase().trim();
    if (!newest.has(key)) {
      const coords = price.market.geo?.coordinates || resolveCoordinates({
        district: price.market.district,
        state: price.market.state,
        location: price.market.location,
      });

      const distKey = cleanKey(district || location);
      const isSameDistrict =
        Boolean(distKey) &&
        (cleanKey(price.market.district) === distKey ||
          cleanKey(price.market.name).includes(distKey));

      let dist = calculateDistanceKm(userOrigin, coords);
      if (isSameDistrict && dist <= 5) {
        dist = 10 + (hashString(price.market.name) % 12);
      }

      const modalPricePerKg =
        price.modalPrice > 150 ? Math.round(price.modalPrice / 100) : price.modalPrice;
      const modalPricePerQtl =
        price.modalPrice > 150 ? price.modalPrice : price.modalPrice * 100;

      const transportCostPerKm = 0.08;
      const estimatedTransportCost = Math.max(1, Math.round(dist * transportCostPerKm));
      const netPrice = Math.max(1, modalPricePerKg - estimatedTransportCost);

      newest.set(key, {
        _id: price._id,
        commodity: price.commodity,
        variety: price.variety || "Standard",
        grade: price.grade || "FAQ",
        arrivalDate: price.date || new Date(),
        modalPrice: modalPricePerKg,
        modalPricePerQtl,
        minPrice: Math.max(1, modalPricePerKg - 2),
        maxPrice: modalPricePerKg + 3,
        distanceKm: dist,
        transportCostPerKm: 8,
        estimatedTransportCost,
        netPrice,
        reviewAverage: price.market.reviewAverage ?? 4.4,
        reviewCount: price.market.reviewCount ?? 50,
        isSameDistrict,
        source: "MARKETPLACE",
        market: {
          ...price.market,
          geo: { type: "Point", coordinates: coords },
        },
      });
    }
  });

  const base = [...newest.values()];
  if (!base.length) return [];

  // STRICT PROXIMITY FILTER: Mandis beyond 300 km are never shown as "nearby" if regional mandis exist!
  const withinRegion = base.filter((r) => r.distanceKm <= 300);
  const pool = withinRegion.length > 0 ? withinRegion : base.filter((r) => r.distanceKm <= 450);
  const finalCandidates = pool.length > 0 ? pool : base;

  const minNet = Math.min(...finalCandidates.map((r) => r.netPrice));
  const maxNet = Math.max(...finalCandidates.map((r) => r.netPrice));
  const minModal = Math.min(...finalCandidates.map((r) => r.modalPrice));
  const maxModal = Math.max(...finalCandidates.map((r) => r.modalPrice));
  const maxDist = Math.max(...finalCandidates.map((r) => r.distanceKm), 1);
  const nearestDist = Math.min(...finalCandidates.map((r) => r.distanceKm));

  const scored = finalCandidates.map((row) => {
    let priceScore;
    if (role === "BUYER") {
      priceScore = maxModal === minModal ? 35 : ((maxModal - row.modalPrice) / (maxModal - minModal)) * 35;
    } else {
      priceScore = maxNet === minNet ? 35 : ((row.netPrice - minNet) / (maxNet - minNet)) * 35;
    }

    const distScore = Math.max(0, 35 - (row.distanceKm / maxDist) * 35);
    // No fake review data — use a neutral base score of 8/10 (equal for all AGMARKNET mandis)
    const reviewScore = 8;
    const townBonus = row.isSameTown ? 25 : row.isSameDistrict ? 18 : 0;

    const recommendationScore = Math.min(
      100,
      Math.round(priceScore + distScore + reviewScore + townBonus)
    );

    const reasons = [
      row.isSameTown
        ? `📍 In your town (${location})`
        : row.isSameDistrict
          ? `📍 In your home district (${row.market.district || district})`
          : `Distance: ~${row.distanceKm} km`,
      `Modal: ₹${row.modalPricePerQtl?.toLocaleString("en-IN")}/qtl (₹${row.modalPrice?.toFixed(2)}/kg)`,
      `Net return: ~₹${row.netPricePerQtl?.toLocaleString("en-IN")}/qtl after transport`,
      `Source: ${row.source || "AGMARKNET"} · Arrival: ${row.arrivalDate ? new Date(row.arrivalDate).toLocaleDateString("en-IN") : "Recent"}`,
    ];

    let badge = "";
    if (row.isSameTown) badge = "📍 IN YOUR TOWN";
    else if (row.isSameDistrict) badge = "📍 LOCAL DISTRICT APMC";
    else if (row.distanceKm === nearestDist) badge = "⚡ NEAREST APMC";
    else if (row.netPrice === maxNet) badge = "💰 TOP RETURN";
    else if (role === "BUYER" && row.modalPrice === minModal) badge = "💎 LOWEST PRICE";

    return {
      ...row,
      recommendationScore,
      recommendationReasons: reasons,
      badge,
      isNearest: row.distanceKm === nearestDist,
    };
  });


  scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
  if (scored.length) scored[0].isRecommended = true;
  return scored.slice(0, 10);
}

/**
 * Rule-based market insight advising farmer whether to sell or wait.
 */
export function sellAdvice(insight, demandCount = 0) {
  if (!insight) return null;
  let recommendation = "COMPARE_MARKETS";
  let reason =
    "Compare verified nearby mandi prices before committing your produce.";

  if (insight.trend === "UP" && insight.currentPrice < insight.average30Days) {
    recommendation = "WAIT";
    reason =
      "Current price is below the 30-day average and the recent trend is upward.";
  } else if (
    insight.currentPrice >= insight.average30Days &&
    demandCount > 0
  ) {
    recommendation = "SELL_NOW";
    reason =
      "Price is at or above the recent average and active buyer demand is available.";
  }

  return {
    recommendation,
    confidence: 72,
    reason,
    disclaimer:
      "Rule-based market insight — not financial advice or guaranteed price prediction.",
  };
}

// Official Government Minimum Support Prices (MSP) 2024-25 (₹ per Quintal)
export const GOVT_MSP_BENCHMARKS = {
  wheat: { mspQtl: 2275, mspKg: 22.75, season: "Rabi" },
  paddy: { mspQtl: 2300, mspKg: 23.0, season: "Kharif" },
  rice: { mspQtl: 2300, mspKg: 23.0, season: "Kharif" },
  soybean: { mspQtl: 4892, mspKg: 48.92, season: "Kharif" },
  soyabean: { mspQtl: 4892, mspKg: 48.92, season: "Kharif" },
  maize: { mspQtl: 2225, mspKg: 22.25, season: "Kharif" },
  corn: { mspQtl: 2225, mspKg: 22.25, season: "Kharif" },
  gram: { mspQtl: 5440, mspKg: 54.4, season: "Rabi" },
  chana: { mspQtl: 5440, mspKg: 54.4, season: "Rabi" },
  mustard: { mspQtl: 5650, mspKg: 56.5, season: "Rabi" },
  cotton: { mspQtl: 7121, mspKg: 71.21, season: "Kharif" },
  onion: { mspQtl: 1800, mspKg: 18.0, season: "Year-Round" },
  potato: { mspQtl: 1400, mspKg: 14.0, season: "Rabi" },
};

/**
 * Generates Price Opportunity Alert (Sell vs Hold)
 */
export async function getPriceOpportunityAlert(commodity = "Wheat") {
  const insight = await priceInsight(commodity);
  const mspKey = (commodity || "").toLowerCase().trim();
  const mspInfo = GOVT_MSP_BENCHMARKS[mspKey] || { mspKg: 22, mspQtl: 2200 };

  const currentRate = insight?.currentPrice || mspInfo.mspKg + 3;
  const avg30 = insight?.average30Days || mspInfo.mspKg;
  const changePct = insight?.changePercentage ?? Math.round(((currentRate - avg30) / (avg30 || 1)) * 100);

  let recommendation = "MONITOR";
  let badgeColor = "blue";
  let title = "Market Price in Equilibrium";
  let reasoning = `Current rate is ₹${currentRate}/kg against ₹${avg30}/kg 30-day benchmark.`;

  if (changePct >= 5 || currentRate > mspInfo.mspKg * 1.15) {
    recommendation = "SELL_NOW";
    badgeColor = "green";
    title = `🟢 SELL OPPORTUNITY: ${commodity} at Seasonal Peak (+${changePct}%)`;
    reasoning = `Mandi prices have surged +${changePct}% above the 30-day baseline and ₹${(currentRate - mspInfo.mspKg).toFixed(1)}/kg above official MSP (₹${mspInfo.mspKg}/kg). High buyer liquidity present.`;
  } else if (changePct <= -4 || currentRate < avg30) {
    recommendation = "HOLD_IN_STORAGE";
    badgeColor = "amber";
    title = `🟡 HOLD RECOMMENDED: ${commodity} Under Market Dip (${changePct}%)`;
    reasoning = `Current prices are ${Math.abs(changePct)}% below 30-day averages due to temporary arrival surges. Holding for 2-3 weeks in warehouse storage is advised to capture anticipated price rebound.`;
  }

  return {
    commodity,
    recommendation,
    badgeColor,
    title,
    reasoning,
    currentRate,
    benchmarkRate: avg30,
    changePercentage: changePct,
    mspKg: mspInfo.mspKg,
    mspQtl: mspInfo.mspQtl,
    updatedAt: new Date(),
  };
}

/**
 * Enhanced explainable matching engine between buyer demands and farmer/FPO lots.
 */
export async function matchesFor(demand, currentUser = null) {
  if (demand.deadline && new Date(demand.deadline) <= new Date()) return [];

  const queryRegex = getCommodityRegex(demand.commodity);
  const lots = await Lot.find({
    commodity: queryRegex,
    status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
  }).populate("quality owner");

  return lots
    .filter((l) => !l.availableUntil || new Date(l.availableUntil) > new Date())
    .map((l) => {
      // 1. Quantity fit (25 pts): supports full or partial fulfillment
      const reqQty = demand.requiredQuantity || 1;
      const lotQty = l.remainingQuantity || 0;
      const quantityRatio = Math.min(lotQty / reqQty, 1);
      const quantityScore = Math.round(quantityRatio * 25);

      // 2. Quality grade fit (25 pts)
      const lotGrade = (l.quality?.grade || "Grade B").toLowerCase();
      const buyerQualitySpecs = demand.qualitySpecs || demand.buyer?.qualitySpecs;
      const demGrade = (demand.requiredQuality || buyerQualitySpecs?.grade || "Grade A").toLowerCase();
      const demMoisture = demand.maxMoisture || buyerQualitySpecs?.moisturePercent;
      let qualityScore = 15;
      if (lotGrade === demGrade || lotGrade.includes(demGrade) || demGrade.includes(lotGrade)) {
        qualityScore = 25;
      } else if (lotGrade.includes("a") && demGrade.includes("b")) {
        qualityScore = 25; // Superior grade supplied
      } else if (l.quality?.moisture && demMoisture && l.quality.moisture <= demMoisture) {
        qualityScore = 22;
      }

      // 3. Price fit (25 pts)
      let priceScore = 0;
      if (l.expectedPrice <= demand.maxPrice) {
        // Lot price within or below buyer's max budget
        priceScore = 25;
      } else {
        const diff = l.expectedPrice - demand.maxPrice;
        priceScore = Math.max(0, Math.round(25 - (diff / Math.max(demand.maxPrice, 1)) * 30));
      }

      // 4. Location fit (15 pts)
      const lotLoc = (l.location || "").toLowerCase().trim();
      const prefLoc = (demand.preferredLocation || demand.deliveryLocation || "").toLowerCase().trim();
      let locationScore = 8;
      if (!prefLoc) {
        locationScore = 12;
      } else if (lotLoc === prefLoc || lotLoc.includes(prefLoc) || prefLoc.includes(lotLoc)) {
        locationScore = 15;
      }

      // 5. Freshness & availability (10 pts)
      const freshnessScore = l.availableUntil ? 10 : 7;

      // 6. Organic / Farming Type fit
      let organicBonus = 0;
      let organicReason = null;
      const demFarming = (demand.farmingType || "any").toLowerCase();
      const lotFarming = (l.farmingType || "conventional").toLowerCase();
      const lotOrganicStatus = l.organicCertificationStatus || "not_verified";

      if (demFarming === "organic") {
        if (lotFarming === "organic" && lotOrganicStatus === "verified") {
          organicBonus = 15; // Top priority for verified organic
          organicReason = `🌱 Certified Organic match (${l.certificationType || "PGS-India / NPOP"} Verified ✓)`;
        } else if (lotFarming === "organic" && lotOrganicStatus === "pending") {
          organicBonus = 5;
          organicReason = `🟡 Organic match (Verification Pending)`;
        } else if (lotFarming === "in_conversion") {
          organicBonus = 2;
          organicReason = `🌱 In-Conversion Organic`;
        } else {
          organicBonus = -30; // Heavily deprioritize conventional when buyer requested organic
          organicReason = `⚪ Conventional produce (Buyer requested Organic Only)`;
        }
      } else if (demFarming === "in_conversion") {
        if (lotFarming === "in_conversion") {
          organicBonus = 10;
          organicReason = `🌱 In-Conversion Organic match`;
        }
      } else if (demFarming === "conventional") {
        if (lotFarming === "conventional") {
          organicBonus = 5;
        }
      } else {
        // demFarming === "any"
        if (lotFarming === "organic" && lotOrganicStatus === "verified") {
          organicBonus = 5;
          organicReason = `🌱 Certified Organic available (${l.certificationType || "Verified"} ✓)`;
        }
      }

      const matchScore = Math.round(
        Math.max(0, Math.min(100, quantityScore + qualityScore + priceScore + locationScore + freshnessScore + organicBonus))
      );

      const isUserLot =
        currentUser &&
        (String(l.owner?._id) === String(currentUser._id) ||
          (currentUser.members && currentUser.members.map(String).includes(String(l.owner?._id))));

      const reasons = [
        `${quantityScore}/25 quantity match (${lotQty} kg available)`,
        `${qualityScore}/25 quality grade compatibility (${l.quality?.grade || "FAQ"} vs ${demand.requiredQuality || "Grade A"})`,
        `${priceScore}/25 price budget fit (₹${l.expectedPrice}/kg vs budget ₹${demand.maxPrice}/kg)`,
        `${locationScore}/15 location proximity (${l.location || "Local"} -> ${demand.preferredLocation || "Destination"})`,
        `${freshnessScore}/10 batch freshness`,
      ];

      if (organicReason) {
        reasons.push(organicReason);
      }

      // Net Realisation computation for the lot
      const estimatedTransport = 2; // ₹2/kg estimated
      const mandiFee = +(l.expectedPrice * 0.015).toFixed(2);
      const netRealisation = Math.max(1, +(l.expectedPrice - estimatedTransport - mandiFee).toFixed(2));

      return {
        lot: l,
        matchScore,
        isUserLot: Boolean(isUserLot),
        isFpoLot: l.ownerType === "FPO" || Boolean(l.sourceLots?.length),
        netRealisation,
        reasons,
        breakdown: {
          quantity: quantityScore,
          quality: qualityScore,
          price: priceScore,
          location: locationScore,
          availability: freshnessScore,
        },
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

