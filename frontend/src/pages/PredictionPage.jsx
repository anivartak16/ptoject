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
            Multi-factor mathematical and trend intelligence modeling to help{" "}
            <strong>{currentRole.toUpperCase()}</strong> make informed <strong>BUY, SELL, HOLD, or WAIT</strong> decisions.
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="prediction-controls">
          <div className="control-group">
            <label>Commodity</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="control-select"
            >
              {COMMODITY_LIST.map((c) => (
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
              {REGIONS_LIST.map((loc) => (
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
          <p>Analyzing historical mandi rates, supply arrivals and demand signals for {commodity}…</p>
        </div>
      ) : prediction ? (
        <>
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
                  ₹{prediction.currentPrice.toLocaleString("en-IN")}/kg
                </div>
                <small className="metric-sub">Base APMC price</small>
              </div>

              <div className="metric-box">
                <small>Expected {prediction.horizonDays}-Day Price</small>
                <div className="metric-value predicted">
                  ₹{prediction.predictedPrice.toLocaleString("en-IN")}/kg
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
                  ₹{prediction.priceRange.min} – ₹{prediction.priceRange.max}
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
                  <Tooltip formatter={(value) => [`₹${value}/kg`, "Price"]} />
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
                * Mathematical projection combines historical seasonality with live demand velocity and arrival momentum.
              </small>
            </div>

            {/* Historical Mandi Trends */}
            <div className="panel">
              <div className="chart-heading">
                <div>
                  <p className="eyebrow">HISTORICAL BENCHMARK</p>
                  <h3>Recent {commodity} Mandi Price Velocity</h3>
                </div>
                <span className="chart-change">MSP: ₹{prediction.msp}/qtl</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={prediction.historicalSeries}
                  margin={{ top: 14, right: 10, left: 0, bottom: 4 }}
                >
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={["dataMin - 30", "dataMax + 30"]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                    width={56}
                  />
                  <Tooltip formatter={(value) => [`₹${value}/kg`, "Mandi Rate"]} />
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
                Recorded historical rates across {location} & surrounding APMC centers.
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
        </>
      ) : null}
    </div>
  );
}

export default PredictionPage;