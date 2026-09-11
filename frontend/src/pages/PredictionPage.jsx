import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuth } from "../context/AuthContext.jsx";
import {
  fetchCropPrediction,
  COMMODITY_LIST,
  REGIONS_LIST,
} from "../services/predictionService.js";

export function PredictionPage() {
  const { user } = useAuth();
  const { r: routeRole } = useParams();
  const currentRole = routeRole || user?.role || "farmer";

  const [commodity, setCommodity] = useState("Wheat");
  const [location, setLocation] = useState(user?.location?.split(",")[0]?.trim() || "Indore");
  const [horizon, setHorizon] = useState(14);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commodityOptions, setCommodityOptions] = useState(COMMODITY_LIST);
  const [regionOptions, setRegionOptions] = useState(REGIONS_LIST);

  useEffect(() => {
    let alive = true;
    const loadData = async () => {
      setLoading(true);
      const res = await fetchCropPrediction({
        crop: commodity,
        location,
        role: currentRole,
        horizon,
      });
      if (alive) {
        setPrediction(res);
        if (res?.availableCommodities?.length > 0) {
          setCommodityOptions(res.availableCommodities);
        }
        if (res?.availableStates?.length > 0) {
          setRegionOptions(
            Array.from(new Set([...REGIONS_LIST, ...res.availableStates, ...(res.reportingMarkets || [])]))
          );
        }
        setLoading(false);
      }
    };
    loadData();
    return () => {
      alive = false;
    };
  }, [commodity, location, horizon, currentRole]);

  const getActionBadgeClass = (action) => {
    switch (action) {
      case "HOLD":
      case "AGGREGATE & HOLD":
        return "badge-hold";
      case "BUY NOW":
      case "BUY GRADUALLY":
        return "badge-buy";
      case "SELL NOW":
      case "SELL COLLECTIVELY NOW":
        return "badge-sell";
      default:
        return "badge-wait";
    }
  };

  return (
    <div className="prediction-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            <span className="live-dot" /> MARKET INTELLIGENCE & FORECASTING
          </p>
          <h1>Agricultural Market Prediction</h1>
          <p>
            Multi-factor mathematical and trend intelligence modeling backed by{" "}
            <strong>live AGMARKNET mandi records stored in MongoDB</strong> to help{" "}
            <strong>{currentRole.toUpperCase()}</strong> make informed <strong>BUY, SELL, HOLD, or WAIT</strong> decisions.
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="prediction-controls">
          <div className="control-group">
            <label>Commodity ({commodityOptions.length} available)</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="control-select"
            >
              {commodityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Mandi / Region</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="control-select"
            >
              <option value="All Mandis">All Regional APMCs</option>
              {regionOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Forecast Horizon</label>
            <div className="horizon-pills">
              {[7, 14, 30].map((h) => (
                <button
                  key={h}
                  type="button"
                  className={`horizon-pill ${horizon === h ? "active" : ""}`}
                  onClick={() => setHorizon(h)}
                >
                  {h} Days
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && !prediction ? (
        <div className="panel loading-panel">
          <p>Analyzing historical mandi rates, supply arrivals and demand signals for {commodity} from MongoDB…</p>
        </div>
      ) : prediction ? (
        <>
          {/* DB Data Verification Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              padding: "10px 16px",
              background: prediction.dbBacked ? "#f0fdf4" : "#fefce8",
              border: `1px solid ${prediction.dbBacked ? "#bbf7d0" : "#fef08a"}`,
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: prediction.dbBacked ? "#16a34a" : "#ca8a04",
                }}
              />
              <strong style={{ color: prediction.dbBacked ? "#15803d" : "#854d0e" }}>
                {prediction.dbBacked
                  ? `✓ Backed by ${prediction.dbRecordsCount} Live AGMARKNET Records in MongoDB`
                  : "Statistical Baseline Forecast"}
              </strong>
              {prediction.latestArrivalDate && (
                <span style={{ color: "#166534" }}>
                  (Latest Arrival Date: {new Date(prediction.latestArrivalDate).toLocaleDateString("en-IN")})
                </span>
              )}
              {prediction.reportingMarketsCount > 0 && (
                <span style={{ color: "#4b5563" }}>
                  · {prediction.reportingMarketsCount} APMC reporting mandis
                </span>
              )}
            </div>
            {currentRole.toUpperCase() === "ADMIN" && (
              <a
                href="/admin/market-sync"
                style={{
                  color: "#15803d",
                  fontWeight: 600,
                  textDecoration: "underline",
                  fontSize: "12px",
                }}
              >
                Sync More Mandi Data →
              </a>
            )}
          </div>
          {/* Main Hero Recommendation Banner */}
          <div className={`panel prediction-hero ${getActionBadgeClass(prediction.action)}`}>
            <div className="hero-action-section">
              <div className="action-tag">RECOMMENDED ACTION</div>
              <div className="action-title">
                <span className="action-badge-large">{prediction.action}</span>
                <span className="action-tagline">{prediction.actionTagline}</span>
              </div>
              <p className="recommendation-narrative">{prediction.recommendationSummary}</p>
            </div>

            <div className="hero-metrics-section">
              <div className="metric-box">
                <small>Current Modal Rate</small>
                <div className="metric-value">
                  ₹{prediction.currentPrice.toLocaleString("en-IN")}/qtl
                </div>
                <small className="metric-sub">
                  ~₹{(prediction.currentPrice / 100).toFixed(1)}/kg · Live APMC
                </small>
              </div>

              <div className="metric-box">
                <small>Expected {prediction.horizonDays}-Day Price</small>
                <div className="metric-value predicted">
                  ₹{prediction.predictedPrice.toLocaleString("en-IN")}/qtl
                </div>
                <div
                  className={`metric-change ${
                    prediction.projectedChangePct >= 0 ? "positive" : "negative"
                  }`}
                >
                  {prediction.projectedChangePct >= 0 ? "↑ +" : "↓ "}
                  {prediction.projectedChangePct}%
                </div>
              </div>

              <div className="metric-box">
                <small>Expected Range</small>
                <div className="metric-value range">
                  ₹{prediction.priceRange.min} – ₹{prediction.priceRange.max}/qtl
                </div>
                <small className="metric-sub">95% confidence bounds</small>
              </div>

              <div className="metric-box confidence-box">
                <small>Model Confidence</small>
                <div className="confidence-num">{prediction.confidence}%</div>
                <div className="confidence-meter">
                  <div
                    className="confidence-fill"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
                <small className="metric-sub">Multi-factor alignment</small>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="two-col prediction-charts-grid">
            {/* Projected Price Trajectory */}
            <div className="panel">
              <div className="chart-heading">
                <div>
                  <p className="eyebrow">FORECAST TRAJECTORY</p>
                  <h3>
                    {commodity} {horizon}-Day Expected Price Cone
                  </h3>
                </div>
                <span className="chart-change positive">
                  {prediction.projectedChangePct >= 0 ? "+" : ""}
                  {prediction.projectedChangePct}% Projected
                </span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={prediction.forecastSeries}
                  margin={{ top: 14, right: 10, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={["dataMin - 50", "dataMax + 50"]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                    width={56}
                  />
                  <Tooltip formatter={(value) => [`₹${value}/qtl`, "Projected Rate"]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    fill="transparent"
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="projectedPrice"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    fill="url(#priceGradient)"
                    name="Projected Price"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    fill="transparent"
                    name="Lower Bound"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <small className="chart-caption">
                * Forecast cone originates from live database baseline (₹{prediction.currentPrice}/qtl) with statistical confidence margins.
              </small>
            </div>

            {/* Historical Mandi Trends */}
            <div className="panel">
              <div className="chart-heading">
                <div>
                  <p className="eyebrow">HISTORICAL BENCHMARK (MONGODB)</p>
                  <h3>Recent {commodity} Stored Mandi Rates</h3>
                </div>
                <span className="chart-change">
                  {prediction.msp ? `MSP: ₹${prediction.msp}/qtl` : `${prediction.historicalSeries?.length || 0} DB Points`}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={prediction.historicalSeries}
                  margin={{ top: 14, right: 10, left: 0, bottom: 4 }}
                >
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={["dataMin - 50", "dataMax + 50"]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                    width={56}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div
                            style={{
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                              fontSize: "12px",
                            }}
                          >
                            <strong style={{ display: "block", color: "#0f172a" }}>
                              {item.market || "APMC Mandi"}
                            </strong>
                            <span style={{ color: "#64748b", display: "block", fontSize: "11px" }}>
                              {item.district && item.state ? `${item.district}, ${item.state}` : item.state || ""} · {item.date}
                            </span>
                            <div style={{ marginTop: "4px", color: "#0284c7", fontWeight: 700 }}>
                              Modal: ₹{item.modalPrice?.toLocaleString("en-IN")}/qtl
                            </div>
                            {item.minPrice && item.maxPrice && (
                              <div style={{ color: "#64748b", fontSize: "11px" }}>
                                Range: ₹{item.minPrice} – ₹{item.maxPrice}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="modalPrice"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#0284c7" }}
                    name="Modal Price"
                  />
                </LineChart>
              </ResponsiveContainer>
              <small className="chart-caption">
                Actual reported rates from {prediction.reportingMarketsCount || 1} APMC mandis stored in MongoDB.
              </small>
            </div>
          </div>

          {/* Explainable Decision Factors */}
          <div className="panel explainability-panel">
            <div className="panel-title-group">
              <p className="eyebrow">MODEL EXPLAINABILITY & TRANSPARENCY</p>
              <h3>Why this recommendation?</h3>
              <p>
                Our prediction model normalizes 7 distinct market indicators into a weighted composite score of{" "}
                <strong>{prediction.compositeScore}</strong> with <strong>{prediction.confidence}% confidence</strong>.
              </p>
            </div>

            <div className="factors-grid">
              {prediction.explainableFactors.map((f, idx) => (
                <div key={idx} className="factor-card">
                  <div className="factor-header">
                    <span className="factor-label">{f.label}</span>
                    <span
                      className={`factor-tag ${
                        f.impact === "Bullish"
                          ? "bullish"
                          : f.impact === "Bearish"
                            ? "bearish"
                            : "neutral"
                      }`}
                    >
                      {f.impact}
                    </span>
                  </div>
                  <p className="factor-desc">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stored Mandi Records from MongoDB */}
          {prediction.rawDbRecords?.length > 0 && (
            <div className="panel" style={{ marginTop: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <p className="eyebrow" style={{ color: "#16a34a" }}>
                    MONGODB STORED MANDIPRICES
                  </p>
                  <h3 style={{ margin: "4px 0" }}>
                    Live Mandi Records in DB Used for {commodity} Prediction
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
                    The prediction model directly ingested these {prediction.dbRecordsCount} records stored in your MongoDB database from AGMARKNET.
                  </p>
                </div>
                <span
                  style={{
                    background: "#ecfdf5",
                    color: "#15803d",
                    border: "1px solid #86efac",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  ✓ {prediction.dbRecordsCount} Records in DB
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="table" style={{ width: "100%", fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th>APMC Market</th>
                      <th>District</th>
                      <th>State</th>
                      <th>Arrival Date</th>
                      <th>Min Rate</th>
                      <th>Max Rate</th>
                      <th>Modal Rate</th>
                      <th>Variety</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prediction.rawDbRecords.map((rec, i) => (
                      <tr key={rec._id || i}>
                        <td>
                          <strong>{rec.market}</strong>
                        </td>
                        <td>{rec.district}</td>
                        <td>{rec.state}</td>
                        <td>
                          {rec.arrivalDate
                            ? new Date(rec.arrivalDate).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                        <td>₹{rec.minPrice?.toLocaleString("en-IN")}/qtl</td>
                        <td>₹{rec.maxPrice?.toLocaleString("en-IN")}/qtl</td>
                        <td style={{ color: "#16a34a", fontWeight: 700 }}>
                          ₹{rec.modalPrice?.toLocaleString("en-IN")}/qtl
                        </td>
                        <td>
                          <small>{rec.variety || "-"}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export default PredictionPage;

