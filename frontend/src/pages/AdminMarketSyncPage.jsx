import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Card } from "../components/common/Card.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import {
  RefreshCw,
  Database,
  CloudDownload,
  CheckCircle2,
  AlertTriangle,
  Search,
  Table,
  Layers,
  MapPin,
  TrendingUp,
} from "lucide-react";

const POPULAR_STATES = [
  "Madhya Pradesh",
  "Maharashtra",
  "Uttar Pradesh",
  "Punjab",
  "Haryana",
  "Rajasthan",
  "Gujarat",
  "Karnataka",
  "Andhra Pradesh",
  "West Bengal",
  "Tamil Nadu",
  "Bihar",
];

const POPULAR_COMMODITIES = [
  "Wheat",
  "Rice",
  "Paddy(Dhan)(Common)",
  "Tomato",
  "Onion",
  "Potato",
  "Soyabean",
  "Mustard",
  "Cotton",
  "Maize",
  "Gram",
  "Chikoos(Sapota)",
];

export function AdminMarketSyncPage() {
  const { user } = useAuth();
  const { r: routeRole } = useParams();
  const r = routeRole || user?.role?.toLowerCase().replaceAll("_", "-") || "admin";

  // Database stats
  const [dbStats, setDbStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Sync Form State
  const [syncState, setSyncState] = useState("");
  const [syncCommodity, setSyncCommodity] = useState("");
  const [syncLimit, setSyncLimit] = useState(100);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState("");

  // Active Explorer Tab: "prices" | "state-commodity" | "by-commodity" | "by-state" | "db"
  const [activeTab, setActiveTab] = useState("prices");

  // Explorer Filter State
  const [filterState, setFilterState] = useState("Madhya Pradesh");
  const [filterCommodity, setFilterCommodity] = useState("Wheat");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [dataLimit, setDataLimit] = useState(50);

  // Explorer Data State
  const [explorerData, setExplorerData] = useState([]);
  const [explorerTotal, setExplorerTotal] = useState(0);
  const [explorerLoading, setExplorerLoading] = useState(false);
  const [explorerError, setExplorerError] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  // Fetch DB Stats
  const loadDbStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/marketPrice/prices/stats");
      setDbStats(res.data.data);
    } catch (e) {
      console.warn("Could not fetch DB stats", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDbStats();
  }, [loadDbStats]);

  // Execute Sync to DB via POST /api/marketPrice/prices/sync
  const handleSyncToDb = async (overrideParams = null) => {
    setSyncLoading(true);
    setSyncError("");
    setSyncResult(null);

    const payload = overrideParams || {
      state: syncState || undefined,
      commodity: syncCommodity || undefined,
      limit: syncLimit,
    };

    try {
      const res = await api.post("/marketPrice/prices/sync", payload);
      setSyncResult({
        message: res.data.message || "Daily mandi prices imported into MongoDB successfully.",
        data: res.data.data,
        timestamp: new Date().toLocaleTimeString(),
      });
      // Refresh stats after successful sync
      loadDbStats();
    } catch (e) {
      setSyncError(
        e.response?.data?.message ||
          e.message ||
          "Failed to sync daily mandi prices. Please check API key or connectivity."
      );
    } finally {
      setSyncLoading(false);
    }
  };

  // Fetch data based on active explorer route
  const fetchExplorerRouteData = useCallback(async () => {
    setExplorerLoading(true);
    setExplorerError("");
    try {
      let res;
      if (activeTab === "prices") {
        // GET /api/marketPrice/prices
        const params = {
          limit: dataLimit,
          offset: 0,
        };
        if (filterState) params.state = filterState;
        if (filterCommodity) params.commodity = filterCommodity;
        if (filterDistrict) params.district = filterDistrict;
        res = await api.get("/marketPrice/prices", { params });
        const records = res.data.data?.records || [];
        setExplorerData(records);
        setExplorerTotal(res.data.data?.total || records.length);
      } else if (activeTab === "state-commodity") {
        // GET /api/marketPrice/prices/state-commodity?state=...&commodity=...
        const params = {
          state: filterState || "Madhya Pradesh",
          commodity: filterCommodity || "Wheat",
        };
        res = await api.get("/marketPrice/prices/state-commodity", { params });
        const records = res.data.data?.records || [];
        setExplorerData(records);
        setExplorerTotal(res.data.data?.total || records.length);
      } else if (activeTab === "by-commodity") {
        // GET /api/marketPrice/prices/by-commodity/:commodity
        const targetCommodity = filterCommodity || "Wheat";
        res = await api.get(`/marketPrice/prices/by-commodity/${encodeURIComponent(targetCommodity)}`);
        const rows = res.data.data || [];
        setExplorerData(rows);
        setExplorerTotal(rows.length);
      } else if (activeTab === "by-state") {
        // GET /api/marketPrice/prices/by-state/:state
        const targetState = filterState || "Madhya Pradesh";
        res = await api.get(`/marketPrice/prices/by-state/${encodeURIComponent(targetState)}`);
        const rows = res.data.data || [];
        setExplorerData(rows);
        setExplorerTotal(rows.length);
      } else if (activeTab === "db") {
        // GET /api/marketPrice/prices/db
        const params = {
          limit: dataLimit,
          page: 1,
        };
        if (filterState) params.state = filterState;
        if (filterCommodity) params.commodity = filterCommodity;
        if (filterDistrict) params.district = filterDistrict;
        res = await api.get("/marketPrice/prices/db", { params });
        const records = res.data.data?.records || [];
        setExplorerData(records);
        setExplorerTotal(res.data.data?.total || 0);
      }
    } catch (e) {
      setExplorerError(
        e.response?.data?.message ||
          e.message ||
          "Failed to load data for this route."
      );
      setExplorerData([]);
      setExplorerTotal(0);
    } finally {
      setExplorerLoading(false);
    }
  }, [activeTab, filterState, filterCommodity, filterDistrict, dataLimit]);

  useEffect(() => {
    fetchExplorerRouteData();
  }, [fetchExplorerRouteData]);

  // Filter table rows by search text
  const filteredRows = explorerData.filter((row) => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    return (
      (row.state && row.state.toLowerCase().includes(q)) ||
      (row.district && row.district.toLowerCase().includes(q)) ||
      (row.market && row.market.toLowerCase().includes(q)) ||
      (row.commodity && row.commodity.toLowerCase().includes(q)) ||
      (row.variety && row.variety.toLowerCase().includes(q))
    );
  });

  return (
    <section className="admin-market-sync-page">
      <div className="admin-header-row">
        <div>
          <p className="eyebrow">MANDI DATA FEED & SYNC ENGINE</p>
          <h1>Daily Market Price Sync & Feed</h1>
          <p className="lead-text">
            Import live agricultural commodity rates directly from AGMARKNET
            (data.gov.in) into MongoDB to keep daily pricing accurate across
            KrishiLink.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="secondary"
            onClick={loadDbStats}
            disabled={statsLoading}
            title="Refresh Database Stats"
          >
            <RefreshCw size={15} className={statsLoading ? "spin" : ""} />
            <span>Refresh Stats</span>
          </button>
          <Link to={`/${r}/prices`} className="button secondary">
            <TrendingUp size={15} />
            <span>Market Activity</span>
          </Link>
        </div>
      </div>

      {/* Database Statistics Overview */}
      <div className="grid">
        <Card
          a="TOTAL SYNCED RECORDS"
          b={
            statsLoading
              ? "..."
              : (dbStats?.totalRecords || 0).toLocaleString("en-IN")
          }
          c="Mandi price records stored in MongoDB"
        />
        <Card
          a="COMMODITIES TRACKED"
          b={
            statsLoading
              ? "..."
              : (dbStats?.commoditiesCount || 0).toLocaleString("en-IN")
          }
          c="Distinct crops with market data"
        />
        <Card
          a="STATES COVERED"
          b={
            statsLoading
              ? "..."
              : (dbStats?.statesCount || 0).toLocaleString("en-IN")
          }
          c="States reporting mandi arrivals"
        />
        <Card
          a="LAST SYNCED AT"
          b={
            statsLoading
              ? "..."
              : dbStats?.lastSyncedAt
              ? new Date(dbStats.lastSyncedAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "numeric",
                  month: "short",
                })
              : "Not synced yet"
          }
          c={
            dbStats?.latestArrivalDate
              ? `Mandi arrival date: ${new Date(
                  dbStats.latestArrivalDate
                ).toLocaleDateString("en-IN")}`
              : "Ready to sync"
          }
        />
      </div>

      {/* Sync Control Centre Panel */}
      <div className="panel admin-sync-control-panel">
        <div className="sync-panel-header">
          <div className="sync-title-group">
            <div className="sync-icon-badge">
              <Database size={22} />
            </div>
            <div>
              <h3>Daily Mandi Price Sync (Feed to Database)</h3>
              <p>
                Trigger live sync to fetch latest prices from AGMARKNET APIs and
                upsert them into the database.
              </p>
            </div>
          </div>
          <StatusBadge status="ACTIVE">AGMARKNET LIVE FEED</StatusBadge>
        </div>

        {/* Quick Sync Presets */}
        <div className="quick-sync-section">
          <span className="quick-sync-label">⚡ 1-Click Fast Sync:</span>
          <div className="quick-sync-chips">
            <button
              type="button"
              className="quick-chip"
              disabled={syncLoading}
              onClick={() => handleSyncToDb({ limit: 100 })}
            >
              Sync Top 100 Nationwide
            </button>
            <button
              type="button"
              className="quick-chip"
              disabled={syncLoading}
              onClick={() => handleSyncToDb({ limit: 500 })}
            >
              Sync Top 500 Nationwide
            </button>
            <button
              type="button"
              className="quick-chip"
              disabled={syncLoading}
              onClick={() =>
                handleSyncToDb({
                  state: "Madhya Pradesh",
                  commodity: "Wheat",
                })
              }
            >
              Sync Wheat in MP (All Districts)
            </button>
            <button
              type="button"
              className="quick-chip"
              disabled={syncLoading}
              onClick={() =>
                handleSyncToDb({
                  state: "Punjab",
                  commodity: "Rice",
                })
              }
            >
              Sync Rice in Punjab
            </button>
            <button
              type="button"
              className="quick-chip"
              disabled={syncLoading}
              onClick={() =>
                handleSyncToDb({
                  state: "Maharashtra",
                  commodity: "Onion",
                })
              }
            >
              Sync Onion in Maharashtra
            </button>
            <button
              type="button"
              className="quick-chip"
              disabled={syncLoading}
              onClick={() =>
                handleSyncToDb({
                  commodity: "Soyabean",
                  limit: 200,
                })
              }
            >
              Sync Soyabean (All States)
            </button>
          </div>
        </div>

        {/* Targeted Sync Form */}
        <form
          className="sync-form-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleSyncToDb();
          }}
        >
          <div className="form-item">
            <label htmlFor="sync-state-input">Target State (Optional)</label>
            <input
              id="sync-state-input"
              list="sync-states-list"
              type="text"
              placeholder="e.g. Madhya Pradesh, Maharashtra (or leave blank for all)"
              value={syncState}
              onChange={(e) => setSyncState(e.target.value)}
            />
            <datalist id="sync-states-list">
              {POPULAR_STATES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="form-item">
            <label htmlFor="sync-comm-input">Target Commodity (Optional)</label>
            <input
              id="sync-comm-input"
              list="sync-comm-list"
              type="text"
              placeholder="e.g. Wheat, Rice, Onion (or leave blank for all)"
              value={syncCommodity}
              onChange={(e) => setSyncCommodity(e.target.value)}
            />
            <datalist id="sync-comm-list">
              {POPULAR_COMMODITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="form-item limit-item">
            <label htmlFor="sync-limit-input">Record Limit</label>
            <select
              id="sync-limit-input"
              value={syncLimit}
              onChange={(e) => setSyncLimit(Number(e.target.value))}
            >
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
              <option value={200}>200 records</option>
              <option value={500}>500 records</option>
              <option value={1000}>1000 records</option>
            </select>
          </div>

          <div className="form-submit-item">
            <button
              type="submit"
              className="primary sync-submit-btn"
              disabled={syncLoading}
            >
              <CloudDownload
                size={16}
                className={syncLoading ? "spin" : ""}
              />
              <span>
                {syncLoading
                  ? "Importing & Upserting..."
                  : "Import & Feed to DB"}
              </span>
            </button>
          </div>
        </form>

        {/* Sync Success Feedback */}
        {syncResult && (
          <div className="sync-feedback success">
            <div className="feedback-icon">
              <CheckCircle2 size={20} color="#16a34a" />
            </div>
            <div className="feedback-text">
              <b>{syncResult.message}</b>
              <div className="feedback-details">
                {syncResult.data?.fetched !== undefined && (
                  <span>
                    Fetched: <strong>{syncResult.data.fetched}</strong> records
                  </span>
                )}
                {syncResult.data?.db?.upsertedCount !== undefined && (
                  <span>
                    · New Upserted:{" "}
                    <strong>{syncResult.data.db.upsertedCount}</strong>
                  </span>
                )}
                {syncResult.data?.db?.modifiedCount !== undefined && (
                  <span>
                    · Updated:{" "}
                    <strong>{syncResult.data.db.modifiedCount}</strong>
                  </span>
                )}
                <span>· Time: {syncResult.timestamp}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sync Error Feedback */}
        {syncError && (
          <div className="sync-feedback error">
            <div className="feedback-icon">
              <AlertTriangle size={20} color="#dc2626" />
            </div>
            <div className="feedback-text">
              <b>Sync Error:</b> <span>{syncError}</span>
            </div>
          </div>
        )}
      </div>

      {/* API Routes & Data Inspector */}
      <div className="panel explorer-panel">
        <div className="explorer-header">
          <div>
            <h3>API Routes & Mandi Data Explorer</h3>
            <p>
              Test and inspect the live data feeds returned by each endpoint
              before and after syncing to the database.
            </p>
          </div>
          <div className="route-badge">
            Endpoint:{" "}
            <code>
              {activeTab === "prices"
                ? "GET /api/marketPrice/prices"
                : activeTab === "state-commodity"
                ? "GET /api/marketPrice/prices/state-commodity"
                : activeTab === "by-commodity"
                ? `GET /api/marketPrice/prices/by-commodity/${encodeURIComponent(filterCommodity || "Wheat")}`
                : activeTab === "by-state"
                ? `GET /api/marketPrice/prices/by-state/${encodeURIComponent(filterState || "Madhya Pradesh")}`
                : "GET /api/marketPrice/prices/db (MongoDB Saved)"}
            </code>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="explorer-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "prices" ? "active" : ""}`}
            onClick={() => setActiveTab("prices")}
          >
            <CloudDownload size={14} />
            <span>1. Live AGMARKNET Prices (/prices)</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "state-commodity" ? "active" : ""}`}
            onClick={() => setActiveTab("state-commodity")}
          >
            <Layers size={14} />
            <span>2. State + Commodity All Districts (/state-commodity)</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "by-commodity" ? "active" : ""}`}
            onClick={() => setActiveTab("by-commodity")}
          >
            <TrendingUp size={14} />
            <span>3. Commodity Across States (/by-commodity/:commodity)</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "by-state" ? "active" : ""}`}
            onClick={() => setActiveTab("by-state")}
          >
            <MapPin size={14} />
            <span>4. State Commodities (/by-state/:state)</span>
          </button>
          <button
            type="button"
            className={`tab-btn db-tab ${activeTab === "db" ? "active" : ""}`}
            onClick={() => setActiveTab("db")}
          >
            <Database size={14} />
            <span>5. Database Records (/prices/db)</span>
          </button>
        </div>

        {/* Filter Controls for Current Route */}
        <div className="explorer-filter-bar">
          {(activeTab === "prices" ||
            activeTab === "state-commodity" ||
            activeTab === "by-state" ||
            activeTab === "db") && (
            <div className="filter-input-group">
              <label>State:</label>
              <input
                list="explorer-states"
                type="text"
                placeholder="State"
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
              />
              <datalist id="explorer-states">
                {POPULAR_STATES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          )}

          {(activeTab === "prices" ||
            activeTab === "state-commodity" ||
            activeTab === "by-commodity" ||
            activeTab === "db") && (
            <div className="filter-input-group">
              <label>Commodity:</label>
              <input
                list="explorer-commodities"
                type="text"
                placeholder="Commodity"
                value={filterCommodity}
                onChange={(e) => setFilterCommodity(e.target.value)}
              />
              <datalist id="explorer-commodities">
                {POPULAR_COMMODITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          )}

          {(activeTab === "prices" || activeTab === "db") && (
            <div className="filter-input-group">
              <label>District:</label>
              <input
                type="text"
                placeholder="District (optional)"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
              />
            </div>
          )}

          {(activeTab === "prices" || activeTab === "db") && (
            <div className="filter-input-group">
              <label>Limit:</label>
              <select
                value={dataLimit}
                onChange={(e) => setDataLimit(Number(e.target.value))}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          )}

          <button
            type="button"
            className="secondary query-btn"
            onClick={fetchExplorerRouteData}
            disabled={explorerLoading}
          >
            <Search size={14} className={explorerLoading ? "spin" : ""} />
            <span>Query API</span>
          </button>
        </div>

        {/* Table Search & Results Count Bar */}
        <div className="table-action-bar">
          <div className="results-count">
            Showing <strong>{filteredRows.length}</strong> of{" "}
            <strong>{explorerTotal}</strong> records
            {activeTab === "db" && " (Saved in MongoDB)"}
          </div>
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Quick search commodity, market, district..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
            {tableSearch && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setTableSearch("")}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {explorerError && (
          <div className="sync-feedback error">
            <AlertTriangle size={18} color="#dc2626" />
            <span>{explorerError}</span>
          </div>
        )}

        {/* Table Data */}
        <div className="table-container">
          {explorerLoading ? (
            <div className="loading-state">
              <RefreshCw size={24} className="spin" />
              <p>Fetching data from {activeTab === "db" ? "MongoDB" : "AGMARKNET API"}...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="empty-state">
              <Table size={32} />
              <p>No records found matching the current query filters.</p>
              <small>Try selecting a different state, commodity, or clearing search text.</small>
            </div>
          ) : (
            <table className="mandi-data-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>District</th>
                  <th>Market / Mandi</th>
                  <th>Commodity</th>
                  <th>Variety / Grade</th>
                  <th>Arrival Date</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Modal Price</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={row._id || `${row.market}-${row.commodity}-${idx}`}>
                    <td>
                      <span className="state-tag">{row.state}</span>
                    </td>
                    <td>{row.district || "—"}</td>
                    <td>
                      <strong>{row.market}</strong>
                    </td>
                    <td>
                      <span className="commodity-name">{row.commodity}</span>
                    </td>
                    <td>
                      <small className="variety-grade">
                        {[row.variety, row.grade].filter(Boolean).join(" · ") || "Standard"}
                      </small>
                    </td>
                    <td>
                      <small>
                        {row.arrivalDate
                          ? typeof row.arrivalDate === "string" && row.arrivalDate.includes("/")
                            ? row.arrivalDate
                            : new Date(row.arrivalDate).toLocaleDateString("en-IN")
                          : "—"}
                      </small>
                    </td>
                    <td>
                      ₹{(Number(row.minPrice) || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      ₹{(Number(row.maxPrice) || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className="modal-price-badge">
                        ₹{(Number(row.modalPrice) || 0).toLocaleString("en-IN")}
                        <small>/qtl</small>
                      </span>
                    </td>
                    <td>
                      <span className={`source-pill ${activeTab === "db" ? "db-source" : "api-source"}`}>
                        {row.source || (activeTab === "db" ? "MongoDB" : "AGMARKNET")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminMarketSyncPage;
