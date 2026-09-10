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
  const cachedDashboard = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("agrilink-dashboard-wheat-v2") || "null"
      );
    } catch {
      return null;
    }
  })();

  const { user } = useAuth();
  const { r: routeRole } = useParams();
  const r = routeRole || user?.role?.toLowerCase().replaceAll("_", "-") || "farmer";

  const [d, setD] = useState(cachedDashboard?.trend || null);
  const [admin, setAdmin] = useState(null);
  const [summary, setSummary] = useState(null);
  const [markets, setMarkets] = useState(cachedDashboard?.markets || []);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setError("");
        if (user.role === "ADMIN") {
          const x = await api.get("/admin/summary");
          if (alive) setAdmin(x.data.data);
          return;
        }
        const coordinates =
          user.geo?.coordinates?.length === 2 ? user.geo.coordinates : null;
        const locationQuery = coordinates
          ? `&longitude=${coordinates[0]}&latitude=${coordinates[1]}`
          : "";
        const trend = await api.get("/prices/trends?commodity=Wheat");
        const nearby =
          user.role === "FARMER"
            ? await api.get(`/markets/nearby?commodity=Wheat${locationQuery}`)
            : { data: { data: [] } };
        const summaryResponse = await api.get("/dashboard/summary");

        if (alive) {
          setD(trend.data.data);
          setSummary(summaryResponse.data.data);
          const nearestMarkets = nearby.data.data;
          setMarkets(nearestMarkets);
          sessionStorage.setItem(
            "agrilink-dashboard-wheat-v2",
            JSON.stringify({ trend: trend.data.data, markets: nearestMarkets })
          );
        }
      } catch (e) {
        if (alive) {
          setError(
            e.response?.data?.message || "Dashboard data could not be loaded."
          );
        }
      }
    };

    load();
    const refreshTimer = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(refreshTimer);
    };
  }, [user.role, user.geo]);

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

  if (!d) {
    return (
      <section className="dashboard-empty">
        <p className="eyebrow">DASHBOARD</p>
        <h1>Preparing your marketplace view…</h1>
        <div className="panel">Loading current price signals and nearby markets.</div>
      </section>
    );
  }

  const isBuyer = user.role === "BUYER";
  const isFpo = r === "fpo";
  const advice = d.advice || {
    recommendation: "COMPARE_MARKETS",
    reason: "Compare market prices before committing your produce.",
    disclaimer: "Market information is currently being refreshed.",
  };

  const farmerCoordinates =
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

  return (
    <section>
      <p className="eyebrow">
        {isFpo
          ? "FPO TRADE COMMAND CENTRE"
          : isBuyer
            ? "PROCUREMENT COMMAND CENTRE"
            : "FARMER DECISION CENTRE"}
      </p>
      <h1>
        {isFpo
          ? "Stronger sales, together."
          : `Welcome back, ${user.name.split(" ")[0]} 👋`}
      </h1>
      <p>
        {isFpo
          ? "Pool member lots, compare verified buyer offers, and coordinate collection from one shared workspace."
          : isBuyer
            ? "Review demands, receive matched lots and manage buying commitments."
            : "Make an informed selling decision with live mandi comparison and active buyer demand."}
      </p>
      <div className="grid">
        {roleCards.map(([label, value, detail]) => (
          <Card key={label} a={label} b={value} c={detail} />
        ))}
      </div>
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
              ? "Turn an open demand into a matched purchase."
              : isFpo
                ? "Add members and combine their available produce into one market lot."
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

      {user.role === "FARMER" && (
        <div className="two-col">
          <div className="panel">
            <MandiRateChart markets={markets} />
            <small>
              {advice.disclaimer} · Updates every 30 seconds · Last checked{" "}
              {new Date(d.lastUpdated || Date.now()).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>
          </div>
          <div className="panel">
            <h3>Best nearby markets</h3>
            {markets.map((p, i) => (
              <div
                className="market-row"
                key={p._id || p.market?._id || p.market?.name || i}
              >
                <b>
                  {i === 0 && <span className="recommended-badge">BEST FIT</span>}{" "}
                  {i + 1}. {p.market?.name}
                </b>
                <span>
                  ₹{p.modalPrice}/kg · {p.recommendationScore ?? "—"}/100
                </span>
                <small>
                  {p.market?.location} · {p.distanceKm} km · net ₹
                  {p.netPrice ?? p.modalPrice}/kg · rating{" "}
                  {p.reviewAverage ?? "—"}/5 · transport ₹
                  {p.estimatedTransportCost ?? 0}
                </small>
                {i === 0 && (
                  <small className="market-reasons">
                    {p.recommendationReasons?.join(" · ")}
                  </small>
                )}
              </div>
            ))}
            <Link className="primary" to={"/" + r + "/prices"}>
              Compare all markets
            </Link>
          </div>
        </div>
      )}

      {user.role === "FARMER" && (
        <div className="panel mandi-map-panel">
          <h3>Nearest mandis on the map</h3>
          <p>
            Tap a pin to compare the live modal price and arrivals for each
            recommended mandi.
          </p>
          <MandiMap markets={markets} userLocation={farmerCoordinates} compact />
        </div>
      )}

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
