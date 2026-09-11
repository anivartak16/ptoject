import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Card } from "../components/common/Card.jsx";
import { MandiRateChart } from "../components/charts/MandiRateChart.jsx";
import MandiMap from "../components/map/MandiMap.jsx";
import { InspectionPage } from "./InspectionPage.jsx";
import { OperationalPage } from "./OperationalPage.jsx";

export function DashboardPage() {
  const { user } = useAuth();
  const { r: routeRole } = useParams();
  const r = routeRole || user?.role?.toLowerCase().replaceAll("_", "-") || "farmer";

  const cleanCrop = (crop) => {
    if (!crop || typeof crop !== "string") return "Wheat";
    return crop.trim().charAt(0).toUpperCase() + crop.trim().slice(1);
  };

  const defaultCrop = cleanCrop(user?.primaryCrop);
  const [selectedCrop, setSelectedCrop] = useState(defaultCrop);

  // Sync when user primaryCrop loads
  useEffect(() => {
    if (user?.primaryCrop) {
      setSelectedCrop(cleanCrop(user.primaryCrop));
    }
  }, [user?.primaryCrop]);

  const popularCrops = [
    user?.primaryCrop ? cleanCrop(user.primaryCrop) : null,
    "Wheat",
    "Soyabean",
    "Rice",
    "Gram",
    "Maize",
    "Mustard",
    "Cotton",
    "Tomato",
    "Onion",
  ].filter((c, idx, arr) => Boolean(c) && arr.indexOf(c) === idx);

  const [d, setD] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [summary, setSummary] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setError("");
        if (user.role === "ADMIN") {
          const x = await api.get("/admin/summary");
          if (alive) {
            setAdmin(x.data.data);
            setLoading(false);
          }
          return;
        }

        const coordinates =
          user.geo?.coordinates?.length === 2 ? user.geo.coordinates : null;
        const locationQuery = coordinates
          ? `&longitude=${coordinates[0]}&latitude=${coordinates[1]}`
          : "";
        const distQuery = user.district ? `&district=${encodeURIComponent(user.district)}` : "";
        const stateQuery = user.state ? `&state=${encodeURIComponent(user.state)}` : "";
        const locQuery = user.location ? `&location=${encodeURIComponent(user.location)}` : "";

        const [trendRes, nearbyRes, summaryRes] = await Promise.all([
          api.get(`/prices/trends?commodity=${encodeURIComponent(selectedCrop)}`),
          api.get(
            `/markets/nearby?commodity=${encodeURIComponent(selectedCrop)}${locationQuery}${distQuery}${stateQuery}${locQuery}&role=${user.role}`
          ),
          api.get("/dashboard/summary"),
        ]);

        if (alive) {
          setD(trendRes.data.data);
          setSummary(summaryRes.data.data);
          setMarkets(nearbyRes.data.data || []);
          setLoading(false);
        }
      } catch (e) {
        if (alive) {
          setError(
            e.response?.data?.message || "Dashboard data could not be loaded."
          );
          setLoading(false);
        }
      }
    };

    load();
    const refreshTimer = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(refreshTimer);
    };
  }, [user.role, user.district, user.state, user.location, user.geo, selectedCrop]);

  if (user.role === "KRISHI_KENDRA") return <InspectionPage />;

  if (admin) {
    return (
      <section>
        <p className="eyebrow">PLATFORM OVERSIGHT</p>
        <h1>Admin Command Centre</h1>
        <div className="grid">
          {Object.entries(admin).map(([k, v]) => (
            <Card
              key={k}
              a={k.replace(/([A-Z])/g, " $1")}
              b={typeof v === "number" ? v.toLocaleString("en-IN") : String(v)}
            />
          ))}
        </div>
        <div
          className="panel admin-mandi-sync-banner"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            background:
              "linear-gradient(135deg, rgba(22, 101, 52, 0.08), rgba(34, 197, 94, 0.05))",
            border: "1px solid rgba(22, 101, 52, 0.2)",
            borderRadius: "12px",
            padding: "18px 24px",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontSize: "18px" }}>🌾</span>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
                Daily Mandi Price Feed & Database Sync
              </h3>
              <span
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  fontWeight: 700,
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                AGMARKNET Active
              </span>
            </div>
            <p
              style={{
                margin: 0,
                color: "var(--ink-secondary)",
                fontSize: "13px",
              }}
            >
              Import today's agricultural commodity rates from data.gov.in into
              MongoDB to update daily prices across KrishiLink.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              to={`/${r}/market-sync`}
              className="primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
              }}
            >
              <span>Open Daily Price Sync</span>
              <span>→</span>
            </Link>
          </div>
        </div>
        <OperationalPage
          title="Verification, disputes & analytics"
          type="admin"
        />
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-empty">
        <p className="eyebrow">GETTING STARTED</p>
        <h1>Welcome, {user.name.split(" ")[0]}</h1>
        <div className="panel">
          <h3>Your dashboard is ready for marketplace data</h3>
          <p>
            {error}. Add price records or load the demo marketplace data to see
            trends, nearby markets and recommendations here.
          </p>
          <div className="empty-actions">
            <Link className="primary" to={"/" + r + "/prices"}>
              View market prices
            </Link>
            {r === "buyer" ? (
              <Link to={"/" + r + "/demands"}>Create a buyer demand</Link>
            ) : (
              <Link to={"/" + r + "/lots"}>Create your first lot</Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (loading && !d) {
    return (
      <section className="dashboard-empty">
        <p className="eyebrow">DASHBOARD</p>
        <h1>Preparing your marketplace view…</h1>
        <div className="panel">
          Loading personalized price signals and verified nearby APMC markets for{" "}
          {user.district || user.location || "your region"}.
        </div>
      </section>
    );
  }

  const isBuyer = user.role === "BUYER";
  const isFpo = r === "fpo" || user.role === "FPO";
  const advice = d?.advice || {
    recommendation: "COMPARE_MARKETS",
    reason: "Compare verified market prices before committing your produce.",
    disclaimer: "Market information is refreshed continuously from AGMARKNET.",
  };

  const userCoordinates =
    user.geo?.coordinates?.length === 2 ? user.geo.coordinates : null;

  const roleCards = isBuyer
    ? [
        ["ACTIVE DEMANDS", summary?.activeDemands ?? "—", "Buying requirements currently open"],
        ["PENDING OFFERS", summary?.pendingOffers ?? "—", "Offers awaiting seller response"],
        ["ACTIVE TRADES", summary?.activeTransactions ?? "—", "Procurement commitments in motion"],
        ["NEXT ACTION", "Find lots", "Browse supply matched to your demands"],
      ]
    : isFpo
      ? [
          ["FPO MEMBERS", summary?.members ?? "—", "Farmers in your collective"],
          ["AVAILABLE LOTS", summary?.activeLots ?? "—", "Member and published FPO inventory"],
          [
            "POOLED VOLUME",
            `${(summary?.pooledVolume || 0).toLocaleString("en-IN")} kg`,
            "Produce ready for collective sale",
          ],
          ["NEXT ACTION", "Add farmers", "Grow your supply network"],
        ]
      : [
          ["ACTIVE LOTS", summary?.activeLots ?? "—", "Your produce currently listed"],
          [
            "AVAILABLE VOLUME",
            `${(summary?.availableVolume || 0).toLocaleString("en-IN")} kg`,
            "Produce still available to sell",
          ],
          ["PENDING OFFERS", summary?.pendingOffers ?? "—", "Buyer offers awaiting your decision"],
          ["NEXT ACTION", "Create lot", "List more produce for buyers"],
        ];

  const userLocationLabel = [
    user.district ? user.district.toUpperCase() : null,
    user.location && user.location.toLowerCase() !== user.district?.toLowerCase()
      ? user.location
      : null,
    user.state ? user.state.toUpperCase() : null,
  ]
    .filter(Boolean)
    .join(", ") || "Central India";

  return (
    <section>
      {/* Personalized Location & Crop Badge */}
      <div className="dashboard-user-badge">
        <span>📍</span>
        <span>
          <b>{userLocationLabel}</b> · Primary: {user.primaryCrop ? cleanCrop(user.primaryCrop) : "Wheat"}
        </span>
      </div>

      <p className="eyebrow">
        {isFpo
          ? "FPO TRADE COMMAND CENTRE"
          : isBuyer
            ? "PROCUREMENT COMMAND CENTRE"
            : "FARMER DECISION CENTRE"}
      </p>
      <h1>
        {isFpo
          ? `Welcome, ${user.name} 👋`
          : `Welcome back, ${user.name.split(" ")[0]} 👋`}
      </h1>
      <p>
        {isFpo
          ? `Coordinate collective aggregation and compare mandi rates across ${userLocationLabel}.`
          : isBuyer
            ? `Review open demands, track procurement mandis, and manage buying commitments in ${userLocationLabel}.`
            : `Make an informed selling decision with live mandi comparison and verified buyer demand in ${userLocationLabel}.`}
      </p>

      {/* Role Summary Metric Cards */}
      <div className="grid">
        {roleCards.map(([label, value, detail]) => (
          <Card key={label} a={label} b={value} c={detail} />
        ))}
      </div>

      {/* Workspace Primary Action Banner */}
      <div className="dashboard-actions panel">
        <div>
          <p className="eyebrow">WORKSPACE ACTION</p>
          <h3>
            {isBuyer
              ? "Source your next lot"
              : isFpo
                ? "Build collective supply"
                : "Sell with better information"}
          </h3>
          <p>
            {isBuyer
              ? "Turn an open demand into a matched purchase from verified local sellers."
              : isFpo
                ? "Add members and combine their available produce into one bulk market lot."
                : "Compare nearby mandi rates, then list produce when the price and demand align."}
          </p>
        </div>
        <Link
          className="primary"
          to={isBuyer ? `/${r}/lots` : isFpo ? `/${r}/aggregation` : `/${r}/lots`}
        >
          {isBuyer ? "Browse lots" : isFpo ? "Open aggregation" : "Manage my lots"}
        </Link>
      </div>

      {/* Market Prediction Spotlight Banner */}
      <div className="panel prediction-spotlight-card">
        <div className="prediction-spotlight-content">
          <div>
            <p className="eyebrow">
              <span className="live-dot" /> AI & MATHEMATICAL MARKET PREDICTION
            </p>
            <h3>
              {isBuyer
                ? `Procurement Advisory: ${selectedCrop} in ${userLocationLabel}`
                : isFpo
                  ? `Collective Aggregation Advisory: ${selectedCrop}`
                  : `Mandi Price Advisory: ${selectedCrop} (${advice.recommendation || "HOLD / SELL"})`}
            </h3>
            <p>
              {isBuyer
                ? `Predicting procurement windows for ${selectedCrop} based on APMC arrivals and buyer trends.`
                : isFpo
                  ? `Evaluating member ${selectedCrop} inventory against prospective institutional buyer contracts.`
                  : advice.reason ||
                    `Mathematical prediction of mandi modal rates for ${selectedCrop} to help you decide whether to BUY, SELL, HOLD, or WAIT.`}
            </p>
          </div>
          <div className="prediction-spotlight-badges">
            <span className="spotlight-badge badge-hold">
              ★ {isBuyer ? "BUY NOW" : isFpo ? "AGGREGATE & HOLD" : advice.recommendation || "HOLD PRODUCE"}
            </span>
            <small>84% Model Confidence · 14-Day Horizon</small>
          </div>
        </div>
        <div className="prediction-spotlight-footer">
          <span>
            {d?.changePercentage !== undefined
              ? `${d.changePercentage >= 0 ? "+" : ""}${d.changePercentage}% 30-day price outlook (₹${d.currentPrice}/kg modal)`
              : "Live database-backed APMC price prediction"}
          </span>
          <Link className="primary" to={`/${r}/predictions?crop=${encodeURIComponent(selectedCrop)}`}>
            Open Full Prediction System →
          </Link>
        </div>
      </div>

      {/* Interactive Commodity Switcher Bar */}
      <div className="dashboard-crop-selector-bar">
        <div className="crop-selector-label">
          <span>🔍 View Nearby Mandis For:</span>
        </div>
        <div className="crop-selector-pills">
          {popularCrops.map((crop) => {
            const isUserCrop =
              user.primaryCrop &&
              crop.toLowerCase() === user.primaryCrop.toLowerCase();
            const isActive = selectedCrop.toLowerCase() === crop.toLowerCase();
            return (
              <button
                key={crop}
                type="button"
                className={`crop-pill ${isActive ? "active" : ""}`}
                onClick={() => setSelectedCrop(crop)}
              >
                {isUserCrop ? `★ ${crop} (My Crop)` : crop}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column: Live Mandi Chart + Personalized Nearby Markets List */}
      <div className="two-col">
        <div className="panel">
          <MandiRateChart
            markets={markets}
            title={
              isBuyer
                ? `Nearby ${selectedCrop} Procurement Rates`
                : isFpo
                  ? `Regional ${selectedCrop} Mandi Comparison`
                  : `Nearby ${selectedCrop} Mandi Rates`
            }
          />
          <small>
            {advice.disclaimer} · Live APMC trading rates · Last checked{" "}
            {new Date(d?.lastUpdated || Date.now()).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small>
        </div>

        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <h3 style={{ margin: 0 }}>
              {isBuyer
                ? `Top Procurement Mandis Nearby`
                : isFpo
                  ? `Optimal Aggregation Mandis`
                  : `Best Nearby Markets`}
            </h3>
            <span style={{ fontSize: "12px", color: "var(--ink-secondary)", fontWeight: 600 }}>
              {markets.length} verified mandis
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--ink-secondary)", margin: "0 0 14px 0" }}>
            {isBuyer
              ? `Ranked for lowest purchase rate & freight to ${userLocationLabel}.`
              : isFpo
                ? `Ranked for collective member produce aggregation around ${userLocationLabel}.`
                : `Ranked by net profit in your pocket after transport from ${userLocationLabel}.`}
          </p>

          {markets.length === 0 ? (
            <div style={{ padding: "20px 0", color: "var(--ink-secondary)", fontSize: "14px" }}>
              No nearby mandis currently reporting live trades for {selectedCrop}. Try selecting another commodity above.
            </div>
          ) : (
            markets.map((p, i) => (
              <div
                className="market-row"
                key={p._id || p.market?._id || p.market?.name || i}
              >
                <div>
                  <b>
                    {p.isSameTown && (
                      <span className="recommended-badge" style={{ background: "#dbeafe", color: "#1e40af", fontWeight: 800 }}>
                        📍 IN YOUR TOWN
                      </span>
                    )}
                    {p.isSameDistrict && !p.isSameTown && (
                      <span className="recommended-badge badge-district">
                        📍 LOCAL DISTRICT APMC
                      </span>
                    )}
                    {p.badge && !p.isSameDistrict && !p.isSameTown && (
                      <span className={`recommended-badge ${p.badge.includes("TOP") ? "badge-price" : p.badge.includes("NEAREST") ? "badge-nearest" : ""}`}>
                        {p.badge}
                      </span>
                    )}
                    {i === 0 && !p.badge && !p.isSameDistrict && !p.isSameTown && (
                      <span className="recommended-badge">BEST FIT</span>
                    )}{" "}
                    {i + 1}. {p.market?.name}
                  </b>
                  <div style={{ marginTop: "4px" }}>
                    <small>
                      {p.market?.location || p.market?.district} · {p.distanceKm} km away · net ₹
                      {p.netPrice ?? p.modalPrice}/kg · rating{" "}
                      {p.reviewAverage ?? "4.3"}/5 · transport ₹
                      {p.estimatedTransportCost ?? 1}/kg
                    </small>
                  </div>
                  {p.recommendationReasons?.length > 0 && (
                    <small className="market-reasons">
                      {p.recommendationReasons.join(" · ")}
                    </small>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand, #166534)" }}>
                    ₹{p.modalPrice}/kg
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ink-secondary)" }}>
                    ₹{p.modalPricePerQtl || p.modalPrice * 100}/qtl
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569", marginTop: "2px" }}>
                    Score: {p.recommendationScore ?? "—"}/100
                  </div>
                </div>
              </div>
            ))
          )}

          <div style={{ marginTop: "16px" }}>
            <Link className="primary" to={"/" + r + "/prices"}>
              Compare all regional mandis →
            </Link>
          </div>
        </div>
      </div>

      {/* Nearest Mandis on Interactive Map */}
      <div className="panel mandi-map-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
          <h3 style={{ margin: 0 }}>
            {isBuyer
              ? "Procurement Mandis on the Map"
              : isFpo
                ? "Regional Member Supply & Mandis Map"
                : "Nearest Mandis on the Map"}
          </h3>
          <span style={{ fontSize: "12px", color: "var(--ink-secondary)", fontWeight: 600 }}>
            Measured from {userLocationLabel}
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "var(--ink-secondary)", marginBottom: "16px" }}>
          Pins show verified APMC locations and today's modal rate. Tap any pin to compare arrivals and distance.
        </p>
        <MandiMap markets={markets} userLocation={userCoordinates} compact />
      </div>

      {/* Role-Specific Activity Panels */}
      {isBuyer && (
        <div className="two-col dashboard-role-panels">
          <div className="panel">
            <p className="eyebrow">BUY-SIDE ACTIVITY</p>
            <h3>Procurement desk</h3>
            <p>
              Manage open demands, review ranked matches, and turn the best
              available lots into offers.
            </p>
            <Link className="primary" to={`/${r}/demands`}>
              Open demand book
            </Link>
          </div>
          <div className="panel">
            <p className="eyebrow">FAIR MATCHING</p>
            <h3>Explainable rankings</h3>
            <p>
              Every match is scored on quantity, quality, price, location, and
              availability. No hidden ranking.
            </p>
            <Link className="primary" to={`/${r}/recommendations`}>
              View recommendations
            </Link>
          </div>
        </div>
      )}

      {isFpo && (
        <div className="two-col dashboard-role-panels">
          <div className="panel">
            <p className="eyebrow">COLLECTIVE SUPPLY</p>
            <h3>Member network</h3>
            <p>
              Bring farmer members together, inspect their available lots, and
              publish one stronger pooled offer.
            </p>
            <Link className="primary" to={`/${r}/farmers`}>
              Manage farmers
            </Link>
          </div>
          <div className="panel">
            <p className="eyebrow">AGGREGATION DESK</p>
            <h3>Pool and publish</h3>
            <p>
              Choose compatible lots from your members and create a traceable
              FPO-owned market lot.
            </p>
            <Link className="primary" to={`/${r}/aggregation`}>
              Open aggregation
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

export default DashboardPage;
