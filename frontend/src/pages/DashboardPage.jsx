import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { Card } from "../components/common/Card.jsx";
import { MandiRateChart } from "../components/charts/MandiRateChart.jsx";
import MandiMap from "../components/map/MandiMap.jsx";
import { InspectionPage } from "./InspectionPage.jsx";
import { OperationalPage } from "./OperationalPage.jsx";
import { PriceOpportunityAlert } from "../components/common/PriceOpportunityAlert.jsx";
import { NetRealisationCalculator } from "../components/common/NetRealisationCalculator.jsx";
import { MarketDataSourcesWidget } from "../components/common/MarketDataSourcesWidget.jsx";
import { OrganicFarmingModal } from "../components/common/OrganicFarmingModal.jsx";

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
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
  const [buyerLots, setBuyerLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOrganicModalOpen, setIsOrganicModalOpen] = useState(false);

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

        if (user.role === "KRISHI_KENDRA") {
          if (alive) {
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

        const [trendRes, nearbyRes, summaryRes, lotsRes] = await Promise.all([
          api.get(`/prices/trends?commodity=${encodeURIComponent(selectedCrop)}`),
          user.role === "BUYER"
            ? Promise.resolve({ data: { data: [] } })
            : api.get(
                `/markets/nearby?commodity=${encodeURIComponent(selectedCrop)}${locationQuery}${distQuery}${stateQuery}${locQuery}&role=${user.role}`
              ),
          api.get("/dashboard/summary"),
          user.role === "BUYER" ? api.get("/lots") : Promise.resolve({ data: { data: [] } }),
        ]);

        if (alive) {
          setD(trendRes.data.data);
          setSummary(summaryRes.data.data);
          setMarkets(nearbyRes.data.data || []);
          if (user.role === "BUYER") {
            setBuyerLots((lotsRes.data?.data || []).slice(0, 6));
          }
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
        [
          "OPEN DEMANDS",
          summary?.activeDemands ?? 0,
          "Procurement requirements awaiting fulfillment",
        ],
        [
          "MARKETPLACE SUPPLY",
          `${(summary?.availableVolume || 0).toLocaleString("en-IN")} kg`,
          `${summary?.availableLots || 0} active farmer lots ready`,
        ],
        [
          "OFFERS SENT",
          summary?.pendingOffers ?? 0,
          "Offers awaiting seller acceptance",
        ],
        [
          "ACTIVE ORDERS",
          summary?.activeTransactions ?? 0,
          "Orders in fulfillment & dispatch",
        ],
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
          <p className="eyebrow">
            {isBuyer ? "QUICK PROCUREMENT ACTIONS" : "WORKSPACE ACTION"}
          </p>
          <h3>
            {isBuyer
              ? "Procurement & Sourcing Desk"
              : isFpo
                ? "Build collective supply"
                : "Sell with better information"}
          </h3>
          <p>
            {isBuyer
              ? "Post immediate procurement demands, browse verified farmer supply lots, and negotiate directly with zero middlemen."
              : isFpo
                ? "Add members and combine their available produce into one bulk market lot."
                : "Compare nearby mandi rates, then list produce when the price and demand align."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {isBuyer ? (
            <>
              <Link className="primary" to={`/${r}/demands`}>
                + Post Demand
              </Link>
              <Link
                to={`/${r}/lots`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#f1f5f9",
                  color: "#1e293b",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1px solid #cbd5e1",
                }}
              >
                Browse Lots →
              </Link>
              <Link
                to={`/${r}/profile`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid #93c5fd",
                }}
              >
                🏢 Buyer Profile & Credentials
              </Link>
              <Link
                to={`/${r}/payments`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#f0fdf4",
                  color: "#166534",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1px solid #bbf7d0",
                }}
              >
                💳 Payments & Escrow
              </Link>
              <Link
                to={`/${r}/transactions`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  color: "#334155",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1px solid #cbd5e1",
                }}
              >
                ✓ Trade Orders
              </Link>
            </>
          ) : isFpo ? (
            <>
              <Link className="primary" to={`/${r}/aggregation`}>
                Open aggregation
              </Link>
              <Link
                to={`/${r}/profile`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#f0fdf4",
                  color: "#166534",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid #86efac",
                }}
              >
                🏛️ FPO Leader & Aggregation Profile
              </Link>
              <Link
                to={`/${r}/transactions`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  color: "#334155",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1px solid #cbd5e1",
                }}
              >
                ✓ Trade Orders
              </Link>
            </>
          ) : (
            <>
              <Link className="primary" to={`/${r}/lots`}>
                {t("addLot", "Manage / Add Lots")}
              </Link>
              <Link
                to={`/${r}/profile`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#f0fdf4",
                  color: "#166534",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid #86efac",
                }}
              >
                🛡️ e-KYC & Farm Profile
              </Link>
              <Link
                to={`/${r}/payments`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#f0fdf4",
                  color: "#166534",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1px solid #bbf7d0",
                }}
              >
                💳 Payments & Escrow
              </Link>
              <Link
                to={`/${r}/transactions`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  color: "#334155",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1px solid #cbd5e1",
                }}
              >
                ✓ Trade Orders
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Farmer & FPO: Organic Farming Guidance Card */}
      {!isBuyer && (
        <div className="panel organic-dashboard-card">
          <div className="organic-card-content">
            <div className="organic-card-header">
              <span className="organic-card-emoji">🌱</span>
              <div>
                <div className="organic-card-eyebrow">PRACTICES & CERTIFICATION</div>
                <h3>Organic Farming</h3>
              </div>
            </div>
            <p className="organic-card-subtitle">
              Get guidance on organic practices, natural inputs and certification.
            </p>
            <div className="organic-card-tags">
              <span>✓ Natural Compost</span>
              <span>✓ Bio-Inputs & Neem</span>
              <span>✓ Natural Pest Management</span>
              <span>✓ PGS-India & NPOP Certification</span>
            </div>
          </div>
          <div className="organic-card-action">
            <button
              type="button"
              className="primary organic-explore-btn"
              onClick={() => setIsOrganicModalOpen(true)}
            >
              <span>Explore Organic Farming</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Buyer-Specific: Active Demands & Live Farmer Supply Feed */}
      {isBuyer && (
        <>
          {/* Active Demands Section */}
          <div className="panel buyer-dashboard-section" style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>My Active Procurement Demands</h3>
                <p style={{ margin: "4px 0 0 0", color: "var(--ink-secondary)", fontSize: "13px" }}>
                  Real-time status of your buying requisitions and automated lot matching.
                </p>
              </div>
              <Link className="primary" to={`/${r}/demands`} style={{ textDecoration: "none", fontSize: "13px", padding: "6px 14px" }}>
                + Post New Demand
              </Link>
            </div>

            {summary?.recentDemands?.length > 0 ? (
              <div className="buyer-demand-grid">
                {summary.recentDemands.map((demand) => (
                  <div key={demand._id} className="buyer-demand-card">
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: "16px" }}>{demand.commodity}</span>
                        <span className="buyer-badge-tag buyer-tag-farmer">{demand.status || "ACTIVE"}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--ink-secondary)", marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
                        <div><b>Volume:</b> {(demand.requiredQuantity || 0).toLocaleString("en-IN")} kg</div>
                        <div><b>Quality:</b> {demand.requiredQuality || "Standard"}</div>
                        <div><b>Max Budget:</b> ₹{(demand.maxPrice || 0).toLocaleString("en-IN")}/qtl</div>
                        <div><b>Location:</b> {demand.preferredLocation || userLocationLabel}</div>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <small style={{ color: "var(--ink-secondary)" }}>
                        Posted {new Date(demand.createdAt).toLocaleDateString("en-IN")}
                      </small>
                      <Link
                        to={`/${r}/recommendations?demandId=${demand._id}`}
                        style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand, #166534)", textDecoration: "none" }}
                      >
                        View Matches →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "8px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
                <p style={{ margin: "0 0 10px 0", color: "var(--ink-secondary)", fontSize: "14px" }}>
                  You don't have any open procurement demands yet. Post what you need and our algorithmic engine will match verified farmer lots.
                </p>
                <Link className="primary" to={`/${r}/demands`} style={{ display: "inline-block", textDecoration: "none" }}>
                  + Post First Demand
                </Link>
              </div>
            )}
          </div>

          {/* Verified Local Farmer Supply Feed */}
          <div className="panel buyer-dashboard-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>Verified Local Farmer & FPO Supply Lots</h3>
                <p style={{ margin: "4px 0 0 0", color: "var(--ink-secondary)", fontSize: "13px" }}>
                  Direct farm produce ready for procurement with verified quality and location.
                </p>
              </div>
              <Link to={`/${r}/lots`} style={{ fontSize: "13px", fontWeight: 600, color: "var(--brand, #166534)", textDecoration: "none" }}>
                Browse All ({summary?.availableLots || buyerLots.length}) Lots →
              </Link>
            </div>

            {buyerLots.length > 0 ? (
              <div className="buyer-supply-grid">
                {buyerLots.map((lot) => (
                  <div key={lot._id} className="buyer-lot-card">
                    <div>
                      <div className="buyer-lot-header">
                        <h4>{lot.commodity}</h4>
                        <span className={`buyer-badge-tag ${lot.ownerType === "FPO" ? "buyer-tag-fpo" : "buyer-tag-farmer"}`}>
                          {lot.ownerType || "FARMER"}
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--ink-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div><b>Available:</b> {(lot.remainingQuantity || lot.quantity).toLocaleString("en-IN")} {lot.unit || "kg"}</div>
                        <div><b>Expected:</b> <span style={{ color: "var(--brand, #166534)", fontWeight: 700 }}>₹{lot.expectedPrice}/qtl</span></div>
                        <div><b>Location:</b> 📍 {lot.location || lot.owner?.location || lot.owner?.district || "Nearby Region"}</div>
                        <div><b>Quality:</b> {lot.quality?.grade || "Grade A"}</div>
                      </div>
                    </div>
                    <Link
                      to={`/${r}/lots`}
                      className="primary"
                      style={{
                        textAlign: "center",
                        display: "block",
                        textDecoration: "none",
                        marginTop: "14px",
                        fontSize: "13px",
                        padding: "8px 12px",
                      }}
                    >
                      Make Direct Offer
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "8px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
                <p style={{ margin: 0, color: "var(--ink-secondary)", fontSize: "14px" }}>
                  No farmer supply lots currently listed. New harvests are synchronized daily.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Price Opportunity Alert (Sell vs Hold) */}
      <div style={{ marginBottom: "16px" }}>
        <PriceOpportunityAlert commodity={selectedCrop} />
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
                ? d?.changePercentage && d.changePercentage < 0
                  ? `Wholesale arrivals are strong and prices are trending softer (-${Math.abs(d.changePercentage)}% outlook). Consider staggered procurement batches to maximize margins.`
                  : `Wholesale mandi supplies are tightening and prices are trending upward (${d?.changePercentage >= 0 ? "+" : ""}${d?.changePercentage || 0}% outlook). Lock in farmer contracts now before rates escalate.`
                : isFpo
                  ? `Evaluating member ${selectedCrop} inventory against prospective institutional buyer contracts.`
                  : advice.reason ||
                    `Mathematical prediction of mandi modal rates for ${selectedCrop} to help you decide whether to BUY, SELL, HOLD, or WAIT.`}
            </p>
          </div>
          <div className="prediction-spotlight-badges">
            <span className="spotlight-badge badge-hold">
              ★ {isBuyer ? (d?.changePercentage && d.changePercentage > 3 ? "WAIT FOR SOFTENING" : "BUY NOW") : isFpo ? "AGGREGATE & HOLD" : advice.recommendation || "HOLD PRODUCE"}
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

      {/* Interactive Commodity Switcher Bar & Mandi Panels (For Farmers & FPOs only) */}
      {!isBuyer && (
        <>
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

          {/* Interactive Net Realisation Calculator */}
          <div style={{ marginBottom: "20px" }}>
            <NetRealisationCalculator
              cropName={selectedCrop}
              initialPrice={d?.currentPrice || 26}
              initialQuantity={2000}
            />
          </div>

          {/* Two Column: Live Mandi Chart + Personalized Nearby Markets List */}
          <div className="two-col dashboard-mandi-grid">
            <div className="panel dashboard-chart-panel">
              <MandiRateChart
                markets={markets}
                height={320}
                commodity={selectedCrop}
                title={
                  isFpo
                    ? `Regional ${selectedCrop} Mandi Comparison`
                    : `Nearby ${selectedCrop} Mandi Rates`
                }
              />
              <div style={{ marginTop: "auto", paddingTop: "12px" }}>
                <small style={{ color: "var(--ink-secondary)", display: "block", lineHeight: "1.4" }}>
                  {advice.disclaimer} · Live APMC trading rates · Last checked{" "}
                  {new Date(d?.lastUpdated || Date.now()).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
            </div>

            <div className="panel dashboard-markets-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                <h3 style={{ margin: 0 }}>
                  {isFpo
                    ? `Optimal Aggregation Mandis`
                    : `Best Nearby Markets`}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--ink-secondary)", fontWeight: 600 }}>
                  {markets.length} verified mandis
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--ink-secondary)", margin: "0 0 10px 0" }}>
                {isFpo
                  ? `Ranked for collective member produce aggregation around ${userLocationLabel}.`
                  : `Ranked by net profit in your pocket after transport from ${userLocationLabel}.`}
              </p>

              <div className="dashboard-markets-list">
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
                      <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: "8px" }}>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand, #166534)" }}>
                          ₹{(p.modalPricePerQtl || p.modalPrice * 100)?.toLocaleString("en-IN")}/qtl
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--ink-secondary)" }}>
                          ₹{p.modalPrice?.toFixed(2)}/kg
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569", marginTop: "2px" }}>
                          Score: {p.recommendationScore ?? "—"}/100
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="dashboard-markets-footer">
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
                {isFpo
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
        </>
      )}

      {/* Role-Specific Activity Panels */}
      {isBuyer && (
        <div className="two-col dashboard-role-panels" style={{ marginTop: "24px" }}>
          <div className="panel">
            <p className="eyebrow">DEMAND BOOK</p>
            <h3>Procurement Requirements</h3>
            <p>
              Manage open demand requisitions, define quantity tolerances, target specifications, and maximum landed budgets.
            </p>
            <Link className="primary" to={`/${r}/demands`}>
              Open Demand Book →
            </Link>
          </div>
          <div className="panel">
            <p className="eyebrow">FAIR MATCHING</p>
            <h3>Explainable Sourcing Engine</h3>
            <p>
              Algorithmic scoring matching your requirements against available farmer and FPO lots with transparent scoring breakdown.
            </p>
            <Link className="primary" to={`/${r}/recommendations`}>
              View Recommended Lots →
            </Link>
          </div>
          <div className="panel">
            <p className="eyebrow">NEGOTIATION DESK</p>
            <h3>Offers & Proposals</h3>
            <p>
              Send formal bids directly to verified growers, manage counter-offers, and lock in volume contracts.
            </p>
            <Link className="primary" to={`/${r}/offers`}>
              Manage Offers ({summary?.pendingOffers ?? 0}) →
            </Link>
          </div>
          <div className="panel">
            <p className="eyebrow">FULFILLMENT & ORDERS</p>
            <h3>Active Orders & Logistics</h3>
            <p>
              Track orders in fulfillment, monitor dispatch from farmgate to warehouse, and inspect digital quality certificates.
            </p>
            <Link className="primary" to={`/${r}/transactions`}>
              Track Orders ({summary?.activeTransactions ?? 0}) →
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

      {/* Multi-Source Data Transparency Widget */}
      <div style={{ marginTop: "24px" }}>
        <MarketDataSourcesWidget commodity={selectedCrop} />
      </div>

      {/* Organic Farming Modal */}
      <OrganicFarmingModal
        isOpen={isOrganicModalOpen}
        onClose={() => setIsOrganicModalOpen(false)}
        initialCrop={selectedCrop}
      />
    </section>
  );
}

export default DashboardPage;