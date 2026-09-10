import { MarketPrice, Market, Lot, Demand } from "../models/index.js";

/**
 * Calculates 7-day and 30-day price trends, min/max, percentage change, and trend direction.
 */
export async function priceInsight(commodity) {
  const rows = await MarketPrice.find({ commodity }).sort({ date: 1 });
  if (!rows.length) return null;

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
 */
export async function marketsFor(commodity, origin = [75.8577, 22.7196]) {
  const prices = await MarketPrice.find({ commodity })
    .sort({ date: -1 })
    .populate("market");

  const newest = new Map();
  prices.forEach((price) => {
    if (!newest.has(String(price.market._id))) {
      newest.set(String(price.market._id), price);
    }
  });

  const distance = ([longitude, latitude]) => {
    const radians = Math.PI / 180;
    const deltaLatitude = (latitude - origin[1]) * radians;
    const deltaLongitude = (longitude - origin[0]) * radians;
    const a =
      Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(origin[1] * radians) *
        Math.cos(latitude * radians) *
        Math.sin(deltaLongitude / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const base = [...newest.values()].map((price) => {
    const market = price.market;
    const distanceKm = distance(market.geo.coordinates);
    const transportCostPerKm = market.transportCostPerKm ?? 8;
    const estimatedTransportCost = Math.round(distanceKm * transportCostPerKm);
    return {
      ...price.toObject(),
      distanceKm: Math.round(distanceKm),
      transportCostPerKm,
      estimatedTransportCost,
      netPrice: Math.round(price.modalPrice - estimatedTransportCost),
      reviewAverage: market.reviewAverage ?? 4.2,
      reviewCount: market.reviewCount ?? 0,
      isNearest: false,
    };
  });

  const minNet = Math.min(...base.map((row) => row.netPrice));
  const maxNet = Math.max(...base.map((row) => row.netPrice));
  const minCost = Math.min(...base.map((row) => row.estimatedTransportCost));
  const maxCost = Math.max(...base.map((row) => row.estimatedTransportCost));
  const maxDistance = Math.max(...base.map((row) => row.distanceKm), 1);
  const nearestDistance = Math.min(...base.map((row) => row.distanceKm));

  return base
    .map((row) => {
      const netScore =
        maxNet === minNet
          ? 35
          : ((row.netPrice - minNet) / (maxNet - minNet)) * 35;
      const reviewScore = (row.reviewAverage / 5) * 20;
      const distanceScore = Math.max(0, 20 - (row.distanceKm / maxDistance) * 20);
      const costScore =
        maxCost === minCost
          ? 25
          : Math.max(
              0,
              25 -
                ((row.estimatedTransportCost - minCost) / (maxCost - minCost)) *
                  25,
            );
      return {
        ...row,
        recommendationScore: Math.round(
          netScore + reviewScore + distanceScore + costScore,
        ),
        recommendationReasons: [
          `Net price ₹${row.netPrice}/kg after ₹${row.estimatedTransportCost} transport`,
          `Mandi rating ${row.reviewAverage.toFixed(1)}/5 (${row.reviewCount} reviews)`,
          `Distance ${row.distanceKm} km`,
          `Transport estimate ₹${row.transportCostPerKm}/km`,
        ],
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .map((row, index) => ({
      ...row,
      isRecommended: index === 0,
      isNearest: row.distanceKm === nearestDistance,
    }));
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

/**
 * Explainable matching engine between buyer demands and farmer/FPO lots.
 */
export async function matchesFor(demand) {
  if (demand.deadline && new Date(demand.deadline) <= new Date()) return [];

  const lots = await Lot.find({
    commodity: demand.commodity,
    status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
  }).populate("quality owner");

  return lots
    .filter((l) => !l.availableUntil || new Date(l.availableUntil) > new Date())
    .map((l) => {
      const quantityScore =
        Math.min((l.remainingQuantity || 0) / (demand.requiredQuantity || 1), 1) * 25;
      const grade =
        (l.quality?.grade || "").toLowerCase() ===
        (demand.requiredQuality || "").toLowerCase();
      const qualityScore = grade ? 25 : 12;
      const priceScore =
        l.expectedPrice <= demand.maxPrice
          ? 25
          : Math.max(
              0,
              25 -
                ((l.expectedPrice - demand.maxPrice) /
                  Math.max(demand.maxPrice, 1)) *
                  25,
            );
      const locationMatch =
        !demand.preferredLocation ||
        l.location?.toLowerCase() === demand.preferredLocation.toLowerCase();
      const locationScore = locationMatch ? 15 : 5;
      const freshnessScore = l.availableUntil ? 10 : 6;
      const matchScore = Math.round(
        Math.max(
          0,
          Math.min(
            100,
            quantityScore + qualityScore + priceScore + locationScore + freshnessScore,
          ),
        ),
      );
      const reasons = [
        `${Math.round(quantityScore)}/25 quantity fit`,
        `${Math.round(qualityScore)}/25 quality fit`,
        `${Math.round(priceScore)}/25 price fit`,
        `${Math.round(locationScore)}/15 location fit`,
        `${Math.round(freshnessScore)}/10 availability fit`,
      ];
      return {
        lot: l,
        matchScore,
        reasons,
        breakdown: {
          quantity: Math.round(quantityScore),
          quality: Math.round(qualityScore),
          price: Math.round(priceScore),
          location: Math.round(locationScore),
          availability: Math.round(freshnessScore),
        },
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}


 