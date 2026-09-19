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
  Calendar,
  Info,
  ArrowRight,
  Zap,
  Clock,
  Activity,
  Server,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Complete, comprehensive list of all 28 Indian States & 8 Union Territories
export const ALL_INDIAN_STATES = [
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

// Comprehensive catalog of all major Indian agricultural commodities
export const ALL_COMMODITIES = [
  "Wheat",
  "Rice",
  "Paddy(Common)",
  "Paddy(Basmati)",
  "Maize",
  "Bajra(Pearl Millet/Cumbu)",
  "Jowar(Sorghum)",
  "Barley(Jau)",
  "Ragi(Finger Millet)",
  "Gram",
  "Arhar(Tur/Red Gram)",
  "Moong(Green Gram)",
  "Urad(Black Gram)",
  "Masoor(Lentil)",
  "Peas Wet",
  "Potato",
  "Onion",
  "Tomato",
  "Green Chilli",
  "Cabbage",
  "Cauliflower",
  "Brinjal",
  "Bitter gourd",
  "Bottle gourd",
  "Ridgeguard(Tori)",
  "Bhindi(Ladies Finger)",
  "Capsicum",
  "Carrot",
  "Raddish",
  "Spinach",
  "Garlic",
  "Ginger(Green)",
  "Ginger(Dry)",
  "Cucumbar(Kheera)",
  "Pumpkin",
  "Mustard",
  "Soyabean",
  "Cotton",
  "Groundnut",
  "Castor Seed",
  "Sunflower",
  "Sesamum(Sesame/Gingelly/Til)",
  "Sugarcane",
  "Guar",
  "Apple",
  "Banana",
  "Mango",
  "Pomegranate",
  "Orange",
  "Guava",
  "Grapes",
  "Papaya",
  "Lemon",
  "Water Melon",
  "Pineapple",
  "Chikoos(Sapota)",
  "Turmeric",
  "Coriander(Leaves)",
  "Coriander(Dry)",
  "Cumin Seed(Jeera)",
  "Black pepper",
  "Cardamoms",
];

// Helper to get formatted date string YYYY-MM-DD
const formatDateInput = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export function AdminMarketSyncPage() {
  const { user } = useAuth();
  const { r: routeRole } = useParams();
  const r = routeRole || user?.role?.toLowerCase().replaceAll("_", "-") || "admin";

  // Database stats
  const [dbStats, setDbStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Active options fetched from live AGMARKNET feed
  const [activeOptions, setActiveOptions] = useState({
    allStates: ALL_INDIAN_STATES,
    activeStates: [
      "Madhya Pradesh",
      "Maharashtra",
      "Uttar Pradesh",
      "Haryana",
      "Punjab",
      "Rajasthan",
      "Gujarat",
      "Karnataka",
      "Tamil Nadu",
      "West Bengal",
      "Andhra Pradesh",
      "Odisha",
      "Keralam",
      "Assam",
    ],
    states: ALL_INDIAN_STATES,
    commodities: ALL_COMMODITIES,
  });

  // Sync Form State
  const [syncState, setSyncState] = useState("");
  const [syncCommodity, setSyncCommodity] = useState("");
  const [syncFromDate, setSyncFromDate] = useState("");
  const [syncToDate, setSyncToDate] = useState("");
  const [syncLimit, setSyncLimit] = useState(100);
  const [syncFetchAll, setSyncFetchAll] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState("");

  // Real-Time Auto-Sync Engine State
  const [syncDaemon, setSyncDaemon] = useState(null);
  const [instantSyncLoading, setInstantSyncLoading] = useState(false);
  const [instantSyncMsg, setInstantSyncMsg] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdownStr, setCountdownStr] = useState("");

  // Active Explorer Tab: "prices" | "state-commodity" | "by-commodity" | "by-state" | "db"
  const [activeTab, setActiveTab] = useState("prices");

  // Explorer Filter State
  const [filterState, setFilterState] = useState("");
  const [filterCommodity, setFilterCommodity] = useState("Wheat");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [dataLimit, setDataLimit] = useState(50);
  const [explorerPage, setExplorerPage] = useState(1);
  const [fallbackNotice, setFallbackNotice] = useState(null);

  // Explorer Data State
  const [explorerData, setExplorerData] = useState([]);
  const [explorerTotal, setExplorerTotal] = useState(0);
  const [explorerLoading, setExplorerLoading] = useState(false);
  const [explorerError, setExplorerError] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  // Live Prediction Explorer State (Backed by MongoDB mandiprices)
  const [predCrop, setPredCrop] = useState("Wheat");
  const [predHorizon, setPredHorizon] = useState(14);
  const [predRole, setPredRole] = useState("FARMER");
  const [predData, setPredData] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [predError, setPredError] = useState("");

  const fetchPredictionForAdmin = useCallback(
    async (crop = predCrop, horizon = predHorizon, role = predRole) => {
      setPredLoading(true);
      setPredError("");
      try {
        const res = await api.get(`/predictions/${encodeURIComponent(crop)}`, {
          params: { horizon, role, location: "All Mandis" },
        });
        if (res.data?.data) {
          setPredData(res.data.data);
        }
      } catch (err) {
        setPredError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load prediction"
        );
      } finally {
        setPredLoading(false);
      }
    },
    [predCrop, predHorizon, predRole]
  );

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

  // Fetch active options for suggestions
  const loadActiveOptions = useCallback(async () => {
    try {
      const res = await api.get("/marketPrice/prices/active-options");
      if (res.data.data) {
        const returnedStates = res.data.data.states || [];
        const returnedActive = res.data.data.activeStates || [];
        const returnedCommodities = res.data.data.commodities || [];

        // Always guarantee all 36 Indian states are available
        const mergedStates = Array.from(
          new Set([...ALL_INDIAN_STATES, ...returnedStates])
        ).sort();

        const mergedCommodities = Array.from(
          new Set([...ALL_COMMODITIES, ...returnedCommodities])
        ).sort();

        setActiveOptions((prev) => ({
          allStates: ALL_INDIAN_STATES,
          activeStates: returnedActive.length > 0 ? returnedActive : prev.activeStates,
          states: mergedStates,
          commodities: mergedCommodities,
        }));
      }
    } catch (e) {
      console.warn("Could not fetch active options", e);
    }
  }, []);

  // Fetch Sync Daemon Status
  const loadDaemonStatus = useCallback(async () => {
    try {
      const res = await api.get("/marketPrice/sync/status");
      if (res.data?.data) {
        setSyncDaemon(res.data.data);
      }
    } catch (e) {
      console.warn("Could not fetch sync daemon status", e);
    }
  }, []);

  // Trigger Instant Live National Sync
  const handleTriggerLiveNationalSync = async () => {
    setInstantSyncLoading(true);
    setInstantSyncMsg(null);
    try {
      const res = await api.post("/marketPrice/sync/trigger", { limit: 250 });
      setInstantSyncMsg({
        success: res.data?.success,
        message: res.data?.message || `Successfully ingested real-time arrivals.`,
        time: new Date().toLocaleTimeString(),
      });
      await Promise.all([loadDbStats(), loadDaemonStatus()]);
    } catch (err) {
      setInstantSyncMsg({
        success: false,
        message: err.response?.data?.message || err.message || "Live sync trigger failed.",
        time: new Date().toLocaleTimeString(),
      });
    } finally {
      setInstantSyncLoading(false);
    }
  };

  useEffect(() => {
    loadDbStats();
    loadActiveOptions();
    loadDaemonStatus();
  }, [loadDbStats, loadActiveOptions, loadDaemonStatus]);

  // Countdown timer for next scheduled background sync
  useEffect(() => {
    if (!syncDaemon?.nextScheduledSyncAt) return;
    const interval = setInterval(() => {
      const diff = new Date(syncDaemon.nextScheduledSyncAt).getTime() - Date.now();
      if (diff <= 0) {
        setCountdownStr("Sync due / in progress...");
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setCountdownStr(`${mins}m ${secs.toString().padStart(2, "0")}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [syncDaemon?.nextScheduledSyncAt]);

  // Real-time polling auto-refresh (every 15 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      loadDbStats();
      loadDaemonStatus();
    }, 15000);
    return () => clearInterval(timer);
  }, [autoRefresh, loadDbStats, loadDaemonStatus]);

  // Execute Sync to DB via POST /api/marketPrice/prices/sync
  const handleSyncToDb = async (overrideParams = null) => {
    setSyncLoading(true);
    setSyncError("");
    setSyncResult(null);

    const payload = overrideParams || {
      state: syncState || undefined,
      commodity: syncCommodity || undefined,
      fromDate: syncFromDate || undefined,
      toDate: syncToDate || undefined,
      limit: syncLimit,
      autoPaginate: syncFetchAll || syncLimit > 250,
      fetchAll: syncFetchAll,
    };

    // If an override updated state or commodity, update the form inputs as well
    if (overrideParams) {
      if (overrideParams.state !== undefined) setSyncState(overrideParams.state);
      if (overrideParams.commodity !== undefined) setSyncCommodity(overrideParams.commodity);
    }

    try {
      const res = await api.post("/marketPrice/prices/sync", payload);
      setSyncResult({
        warning: res.data.warning || res.data.data?.fetched === 0,
        message: res.data.message || "Daily mandi prices imported into MongoDB successfully.",
        data: res.data.data,
        targetState: payload.state || "Nationwide (All States)",
        targetCommodity: payload.commodity || "All Commodities",
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

  // Quick Date Preset Handlers
  const setDatePreset = (preset) => {
    const today = new Date();
    if (preset === "today") {
      const todayStr = formatDateInput(today);
      setSyncFromDate(todayStr);
      setSyncToDate(todayStr);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = formatDateInput(y);
      setSyncFromDate(yStr);
      setSyncToDate(yStr);
    } else if (preset === "last7") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setSyncFromDate(formatDateInput(past));
      setSyncToDate(formatDateInput(today));
    } else if (preset === "clear") {
      setSyncFromDate("");
      setSyncToDate("");
    }
  };

  // Fetch data based on active explorer route
  const fetchExplorerRouteData = useCallback(async (targetPage = explorerPage) => {
    setExplorerLoading(true);
    setExplorerError("");
    try {
      let res;
      const pageToUse = typeof targetPage === "number" ? Math.max(1, targetPage) : 1;

      if (activeTab === "prices") {
        // GET /api/marketPrice/prices
        const offset = (pageToUse - 1) * dataLimit;
        const params = {
          limit: dataLimit,
          offset,
          page: pageToUse,
        };
        if (filterState) params.state = filterState;
        if (filterCommodity) params.commodity = filterCommodity;
        if (filterDistrict) params.district = filterDistrict;
        if (filterFromDate) params.fromDate = filterFromDate;
        if (filterToDate) params.toDate = filterToDate;
        res = await api.get("/marketPrice/prices", { params });
        let records = res.data.data?.records || [];
        let total = typeof res.data.data?.total === "number" ? res.data.data.total : records.length;

        // Enforce strict client-side state match to prevent any government API tokenization leaks
        if (filterState && records.length > 0) {
          const normFilterState = filterState.trim().toLowerCase();
          records = records.filter(
            (r) => r.state && r.state.trim().toLowerCase() === normFilterState
          );
        }

        // Smart Fallback: If 0 records because state filter is too restrictive for this crop
        if (records.length === 0 && filterState && filterCommodity) {
          const fallbackParams = {
            limit: dataLimit,
            offset: 0,
            page: 1,
            commodity: filterCommodity,
          };
          if (filterFromDate) fallbackParams.fromDate = filterFromDate;
          if (filterToDate) fallbackParams.toDate = filterToDate;
          try {
            const fallbackRes = await api.get("/marketPrice/prices", { params: fallbackParams });
            const altRecords = fallbackRes.data.data?.records || [];
            if (altRecords.length > 0) {
              records = altRecords;
              total = typeof fallbackRes.data.data?.total === "number" ? fallbackRes.data.data.total : altRecords.length;
              const altStates = Array.from(new Set(altRecords.map((r) => r.state))).filter(Boolean);
              setFallbackNotice({
                type: "state_empty_crop_found",
                searchedState: filterState,
                commodity: filterCommodity,
                count: altRecords.length,
                availableStates: altStates,
              });
            } else {
              setFallbackNotice(null);
            }
          } catch (_fallbackErr) {
            setFallbackNotice(null);
          }
        } else {
          setFallbackNotice(null);
        }

        setExplorerData(records);
        setExplorerTotal(total);
      } else if (activeTab === "state-commodity") {
        // GET /api/marketPrice/prices/state-commodity?state=...&commodity=...
        const targetState = filterState || "Madhya Pradesh";
        const targetComm = filterCommodity || "Wheat";
        const params = {
          state: targetState,
          commodity: targetComm,
        };
        if (filterFromDate) params.fromDate = filterFromDate;
        if (filterToDate) params.toDate = filterToDate;
        res = await api.get("/marketPrice/prices/state-commodity", { params });
        let records = res.data.data?.records || [];
        let total = typeof res.data.data?.total === "number" ? res.data.data.total : records.length;

        // If 0 records and backend provided alternative active states for this crop
        if (records.length === 0 && res.data.data?.commodityActiveStates?.length > 0) {
          const topState = res.data.data.commodityActiveStates[0];
          try {
            const altRes = await api.get("/marketPrice/prices/state-commodity", {
              params: {
                state: topState,
                commodity: targetComm,
                fromDate: filterFromDate || undefined,
                toDate: filterToDate || undefined,
              },
            });
            const altRecords = altRes.data.data?.records || [];
            if (altRecords.length > 0) {
              records = altRecords;
              total = typeof altRes.data.data?.total === "number" ? altRes.data.data.total : altRecords.length;
              setFallbackNotice({
                type: "auto_switched_state",
                originalState: targetState,
                activeState: topState,
                commodity: targetComm,
                availableStates: res.data.data.commodityActiveStates,
              });
            } else {
              setFallbackNotice(null);
            }
          } catch (_altErr) {
            setFallbackNotice(null);
          }
        } else {
          setFallbackNotice(null);
        }

        setExplorerData(records);
        setExplorerTotal(total);
      } else if (activeTab === "by-commodity") {
        // GET /api/marketPrice/prices/by-commodity/:commodity
        const targetCommodity = filterCommodity || "Wheat";
        res = await api.get(`/marketPrice/prices/by-commodity/${encodeURIComponent(targetCommodity)}`);
        const rows = res.data.data || [];
        setExplorerData(rows);
        setExplorerTotal(rows.length);
        setFallbackNotice(null);
      } else if (activeTab === "by-state") {
        // GET /api/marketPrice/prices/by-state/:state
        const targetState = filterState || "Madhya Pradesh";
        res = await api.get(`/marketPrice/prices/by-state/${encodeURIComponent(targetState)}`);
        const rows = res.data.data || [];
        setExplorerData(rows);
        setExplorerTotal(rows.length);
        setFallbackNotice(null);
      } else if (activeTab === "db") {
        // GET /api/marketPrice/prices/db
        const params = {
          limit: dataLimit,
          page: pageToUse,
        };
        if (filterState) params.state = filterState;
        if (filterCommodity) params.commodity = filterCommodity;
        if (filterDistrict) params.district = filterDistrict;
        if (filterFromDate) params.fromDate = filterFromDate;
        if (filterToDate) params.toDate = filterToDate;
        res = await api.get("/marketPrice/prices/db", { params });
        let records = res.data.data?.records || [];
        let total = typeof res.data.data?.total === "number" ? res.data.data.total : 0;

        // If 0 records in DB for selected state, check across all states in DB
        if (records.length === 0 && filterState && filterCommodity) {
          const fallbackParams = { ...params, page: 1 };
          delete fallbackParams.state;
          try {
            const fallbackRes = await api.get("/marketPrice/prices/db", { params: fallbackParams });
            const altRecords = fallbackRes.data.data?.records || [];
            if (altRecords.length > 0) {
              records = altRecords;
              total = typeof fallbackRes.data.data?.total === "number" ? fallbackRes.data.data.total : altRecords.length;
              const altStates = Array.from(new Set(altRecords.map((r) => r.state))).filter(Boolean);
              setFallbackNotice({
                type: "db_state_empty_crop_found",
                searchedState: filterState,
                commodity: filterCommodity,
                count: altRecords.length,
                availableStates: altStates,
              });
            } else {
              setFallbackNotice(null);
            }
          } catch (_dbFallbackErr) {
            setFallbackNotice(null);
          }
        } else {
          setFallbackNotice(null);
        }

        setExplorerData(records);
        setExplorerTotal(total);
      }
    } catch (e) {
      setExplorerError(
        e.response?.data?.message ||
          e.message ||
          "Failed to load data for this route."
      );
      setExplorerData([]);
      setExplorerTotal(0);
      setFallbackNotice(null);
    } finally {
      setExplorerLoading(false);
    }
  }, [activeTab, filterState, filterCommodity, filterDistrict, filterFromDate, filterToDate, dataLimit, explorerPage]);

  const handlePageChange = (newPage) => {
    const totalPages = Math.max(1, Math.ceil(explorerTotal / dataLimit));
    const target = Math.max(1, Math.min(newPage, totalPages));
    setExplorerPage(target);
    fetchExplorerRouteData(target);
  };

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
            KrishiLink Pan-India.
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

      {/* Real-Time Automated Sync Engine & Daemon Hub */}
      <div className="panel real-time-daemon-hub" style={{
        background: "linear-gradient(135deg, #064e3b 0%, #0f766e 100%)",
        color: "#ffffff",
        borderRadius: "16px",
        padding: "24px 28px",
        boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.25), 0 8px 10px -6px rgba(6, 78, 59, 0.2)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "18px",
          position: "relative",
          zIndex: 2,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: "rgba(16, 185, 129, 0.25)",
                border: "1px solid rgba(110, 231, 183, 0.4)",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#a7f3d0"
              }}>
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#34d399",
                  boxShadow: "0 0 10px #34d399",
                  display: "inline-block"
                }}></span>
                {syncDaemon?.active ? "REAL-TIME SYNC DAEMON ACTIVE" : "DAEMON INITIALIZING"}
              </span>
              <span style={{ fontSize: "12px", opacity: 0.85, color: "#e6fffa" }}>
                Auto-Sync Interval: <b>Every {syncDaemon?.intervalMinutes || 30} Mins</b>
              </span>
            </div>
            <h2 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700", margin: "0 0 6px 0" }}>
              Pan-India Real-Time Mandi Ingestion Architecture
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.82)", fontSize: "14px", margin: 0, maxWidth: "680px", lineHeight: "1.5" }}>
              Automated background daemon synchronizes official trading arrivals from AGMARKNET (data.gov.in) into MongoDB, auto-bridging with KrishiLink's Price Engine, ML Predictions, and Multilingual Chatbot.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(0, 0, 0, 0.2)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#e2e8f0",
                cursor: "pointer",
                userSelect: "none"
              }}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  style={{ accentColor: "#10b981", cursor: "pointer" }}
                />
                Auto-Refresh Feed (15s)
              </label>

              <button
                type="button"
                onClick={handleTriggerLiveNationalSync}
                disabled={instantSyncLoading || syncDaemon?.isRunning}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: instantSyncLoading ? "#047857" : "#10b981",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: instantSyncLoading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease"
                }}
              >
                <Zap size={16} className={instantSyncLoading ? "spin" : ""} />
                <span>{instantSyncLoading ? "Syncing National Mandis..." : "Trigger Instant National Sync"}</span>
              </button>
            </div>

            {instantSyncMsg && (
              <div style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: instantSyncMsg.success ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)",
                color: instantSyncMsg.success ? "#6ee7b7" : "#fca5a5",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <Clock size={13} />
                <span>[{instantSyncMsg.time}] {instantSyncMsg.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginTop: "20px",
          position: "relative",
          zIndex: 2
        }}>
          <div style={{ background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a7f3d0", fontWeight: "600" }}>
              Next Scheduled Sync
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", marginTop: "4px", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} color="#6ee7b7" />
              <span>{countdownStr || "Calculating..."}</span>
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
              Automated 30-min background daemon
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a7f3d0", fontWeight: "600" }}>
              Latest Ingested Batch
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", marginTop: "4px", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
              <Activity size={16} color="#6ee7b7" />
              <span>{syncDaemon?.lastSyncCount || 0} Records</span>
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
              {syncDaemon?.lastSyncAt ? `Last run at ${new Date(syncDaemon.lastSyncAt).toLocaleTimeString()}` : "At server boot"}
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a7f3d0", fontWeight: "600" }}>
              Data Pipeline Architecture
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", marginTop: "4px", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={16} color="#34d399" />
              <span>DUAL BRIDGE ACTIVE</span>
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
              MandiPrice ⇄ MarketPrice linked
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a7f3d0", fontWeight: "600" }}>
              Consumer Readiness
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", marginTop: "4px", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
              <Server size={16} color="#6ee7b7" />
              <span>100% Real-Time</span>
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
              Farmer / Buyer / Chatbot live
            </div>
          </div>
        </div>

        {/* Real-Time Architecture Pipeline Visualizer */}
        <div style={{
          marginTop: "20px",
          padding: "14px 18px",
          background: "rgba(0, 0, 0, 0.22)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          fontSize: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", color: "#ffffff", flexWrap: "wrap" }}>
            <span style={{ padding: "4px 8px", background: "rgba(16, 185, 129, 0.3)", borderRadius: "6px", color: "#a7f3d0" }}>1. AGMARKNET API (data.gov.in)</span>
            <span style={{ color: "#6ee7b7" }}>➔</span>
            <span style={{ padding: "4px 8px", background: "rgba(16, 185, 129, 0.3)", borderRadius: "6px", color: "#a7f3d0" }}>2. Sync Daemon (30m Interval)</span>
            <span style={{ color: "#6ee7b7" }}>➔</span>
            <span style={{ padding: "4px 8px", background: "rgba(16, 185, 129, 0.3)", borderRadius: "6px", color: "#a7f3d0" }}>3. MongoDB Unified Bridge</span>
            <span style={{ color: "#6ee7b7" }}>➔</span>
            <span style={{ padding: "4px 8px", background: "rgba(16, 185, 129, 0.3)", borderRadius: "6px", color: "#a7f3d0" }}>4. Live REST & AI Consumers</span>
          </div>
          <div style={{ color: "#e2e8f0", fontSize: "11px" }}>
            API Status: <code style={{ background: "rgba(255,255,255,0.15)", padding: "2px 6px", borderRadius: "4px" }}>Connected</code> | Resource ID: <code style={{ background: "rgba(255,255,255,0.15)", padding: "2px 6px", borderRadius: "4px" }}>9ef84268...</code>
          </div>
        </div>

        {/* Sync History Logs (Last Runs) */}
        {syncDaemon?.history?.length > 0 && (
          <div style={{ marginTop: "16px", fontSize: "12px" }}>
            <details style={{ cursor: "pointer" }}>
              <summary style={{ color: "#a7f3d0", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>View Real-Time Sync Ingestion Logs ({syncDaemon.history.length} recent runs)</span>
              </summary>
              <div style={{
                marginTop: "10px",
                maxHeight: "160px",
                overflowY: "auto",
                background: "rgba(0, 0, 0, 0.35)",
                borderRadius: "8px",
                padding: "10px"
              }}>
                <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse", color: "#e2e8f0" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", color: "#a7f3d0" }}>
                      <th style={{ padding: "4px 8px" }}>Timestamp</th>
                      <th style={{ padding: "4px 8px" }}>Trigger Type</th>
                      <th style={{ padding: "4px 8px" }}>Ingested Records</th>
                      <th style={{ padding: "4px 8px" }}>Duration</th>
                      <th style={{ padding: "4px 8px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncDaemon.history.map((h, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "4px 8px" }}>{new Date(h.timestamp).toLocaleTimeString()}</td>
                        <td style={{ padding: "4px 8px" }}>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: h.type === "MANUAL_TRIGGER" ? "rgba(59, 130, 246, 0.3)" : "rgba(16, 185, 129, 0.3)",
                            fontSize: "10px"
                          }}>
                            {h.type}
                          </span>
                        </td>
                        <td style={{ padding: "4px 8px", fontWeight: "700" }}>{h.recordsCount}</td>
                        <td style={{ padding: "4px 8px" }}>{(h.durationMs / 1000).toFixed(2)}s</td>
                        <td style={{ padding: "4px 8px", color: h.status === "SUCCESS" ? "#34d399" : "#f87171" }}>{h.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        )}
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
                Select from all 36 Indian States & UTs, filter by crop or date range,
                and upsert live prices directly into MongoDB.
              </p>
            </div>
          </div>
          <StatusBadge status="ACTIVE">PAN-INDIA FEED ACTIVE</StatusBadge>
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
                  state: "Haryana",
                  commodity: "Paddy(Common)",
                })
              }
            >
              Sync Paddy in Haryana
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
          {/* Target State Dropdown with ALL 36 States & UTs */}
          <div className="form-item">
            <label htmlFor="sync-state-select">
              <MapPin size={13} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "4px" }} />
              Target State (All 36 States & UTs)
            </label>
            <select
              id="sync-state-select"
              value={syncState}
              onChange={(e) => setSyncState(e.target.value)}
            >
              <option value="">All States (Nationwide Feed)</option>
              {activeOptions.activeStates?.length > 0 && (
                <optgroup label="⚡ Actively Reporting in Live Feed">
                  {activeOptions.activeStates.map((s) => (
                    <option key={`active-state-${s}`} value={s}>
                      ● {s}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="All 36 Indian States & Union Territories">
                {ALL_INDIAN_STATES.map((s) => (
                  <option key={`all-state-${s}`} value={s}>
                    {s}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Target Commodity Dropdown with ALL Major Agricultural Commodities */}
          <div className="form-item">
            <label htmlFor="sync-comm-select">
              Target Commodity (Optional)
            </label>
            <select
              id="sync-comm-select"
              value={syncCommodity}
              onChange={(e) => setSyncCommodity(e.target.value)}
            >
              <option value="">All Commodities (Full Mandi Feed)</option>
              <optgroup label="⚡ Popular & High-Volume Commodities">
                {ALL_COMMODITIES.slice(0, 15).map((c) => (
                  <option key={`popular-comm-${c}`} value={c}>
                    ● {c}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All Indian Agricultural Commodities">
                {activeOptions.commodities.map((c) => (
                  <option key={`all-comm-${c}`} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Date From Field */}
          <div className="form-item">
            <label htmlFor="sync-from-date">
              <Calendar size={13} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "4px" }} />
              Date From (Optional)
            </label>
            <input
              id="sync-from-date"
              type="date"
              value={syncFromDate}
              onChange={(e) => setSyncFromDate(e.target.value)}
            />
          </div>

          {/* Date To Field */}
          <div className="form-item">
            <label htmlFor="sync-to-date">
              <Calendar size={13} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "4px" }} />
              Date To (Optional)
            </label>
            <input
              id="sync-to-date"
              type="date"
              value={syncToDate}
              onChange={(e) => setSyncToDate(e.target.value)}
            />
          </div>

          <div className="form-item limit-item">
            <label htmlFor="sync-limit-input">Record Limit & Mode</label>
            <select
              id="sync-limit-input"
              value={syncFetchAll ? "all" : syncLimit}
              onChange={(e) => {
                if (e.target.value === "all") {
                  setSyncFetchAll(true);
                  setSyncLimit(5000);
                } else {
                  setSyncFetchAll(false);
                  setSyncLimit(Number(e.target.value));
                }
              }}
            >
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
              <option value={250}>250 records</option>
              <option value={500}>500 records (Auto-Paged)</option>
              <option value={1000}>1,000 records (Auto-Paged)</option>
              <option value={2500}>2,500 records (Auto-Paged)</option>
              <option value="all">⚡ Full Dataset (Auto-Paging All Records)</option>
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

        {/* Quick Date Presets Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "12px", color: "var(--ink-secondary)" }}>
          <span style={{ fontWeight: 600 }}>Quick Date Filter:</span>
          <div className="date-preset-chips">
            <button type="button" className="date-chip" onClick={() => setDatePreset("today")}>Today</button>
            <button type="button" className="date-chip" onClick={() => setDatePreset("yesterday")}>Yesterday</button>
            <button type="button" className="date-chip" onClick={() => setDatePreset("last7")}>Last 7 Days</button>
            {(syncFromDate || syncToDate) && (
              <button type="button" className="date-chip" style={{ color: "#b91c1c", borderColor: "#fca5a5" }} onClick={() => setDatePreset("clear")}>
                ✕ Clear Dates
              </button>
            )}
          </div>
          {(syncFromDate || syncToDate) && (
            <span style={{ color: "#166534", fontWeight: 600 }}>
              Filtering: {syncFromDate || "Any"} to {syncToDate || "Any"}
            </span>
          )}
        </div>

        {/* Actionable Warning on 0 Records */}
        {syncResult && (syncResult.warning || syncResult.data?.fetched === 0) && (
          <div className="sync-feedback warning">
            <div className="feedback-icon" style={{ marginTop: "2px" }}>
              <Info size={22} color="#b45309" />
            </div>
            <div className="feedback-text" style={{ flex: 1 }}>
              <b style={{ fontSize: "14px", color: "#78350f" }}>
                {syncResult.message}
              </b>
              <p style={{ margin: "6px 0 10px 0", color: "#92400e", lineHeight: 1.45 }}>
                💡 <strong>Why 0 records?</strong> Agricultural mandi arrivals depend on seasonal harvest and trading cycles.
                For instance, <em>Wheat</em> is a Rabi crop with peak arrivals in spring, and currently has active arrivals in states like Madhya Pradesh and Uttar Pradesh.
                Meanwhile, in Haryana, currently active crops in the mandi feed include <em>Paddy, Potato, Onion, and Cotton</em>.
              </p>

              {/* Actionable Remedy: Switch to active state for this commodity */}
              {syncResult.data?.commodityActiveStates?.length > 0 && (
                <div className="remedy-section">
                  <span className="remedy-title">
                    🌾 Click to sync "{syncResult.targetCommodity}" from active states:
                  </span>
                  <div className="remedy-chips">
                    {syncResult.data.commodityActiveStates.slice(0, 6).map((activeState) => (
                      <button
                        key={activeState}
                        type="button"
                        className="remedy-chip"
                        disabled={syncLoading}
                        onClick={() =>
                          handleSyncToDb({
                            state: activeState,
                            commodity: syncCommodity || "Wheat",
                            fromDate: syncFromDate || undefined,
                            toDate: syncToDate || undefined,
                          })
                        }
                      >
                        Sync in {activeState} <ArrowRight size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                      </button>
                    ))}
                    <button
                      type="button"
                      className="remedy-chip"
                      style={{ background: "#dcfce7", borderColor: "#86efac", color: "#166534" }}
                      disabled={syncLoading}
                      onClick={() =>
                        handleSyncToDb({
                          state: "",
                          commodity: syncCommodity,
                          fromDate: syncFromDate || undefined,
                          toDate: syncToDate || undefined,
                        })
                      }
                    >
                      Sync {syncCommodity} Nationwide (All States)
                    </button>
                  </div>
                </div>
              )}

              {/* Actionable Remedy: Switch to active crop in this state */}
              {syncResult.data?.stateActiveCommodities?.length > 0 && (
                <div className="remedy-section">
                  <span className="remedy-title">
                    🌱 Click to sync active crops currently reporting in {syncResult.targetState}:
                  </span>
                  <div className="remedy-chips">
                    {syncResult.data.stateActiveCommodities.slice(0, 6).map((activeCrop) => (
                      <button
                        key={activeCrop}
                        type="button"
                        className="remedy-chip"
                        disabled={syncLoading}
                        onClick={() =>
                          handleSyncToDb({
                            state: syncState || "Haryana",
                            commodity: activeCrop,
                            fromDate: syncFromDate || undefined,
                            toDate: syncToDate || undefined,
                          })
                        }
                      >
                        Sync {activeCrop} <ArrowRight size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                      </button>
                    ))}
                    <button
                      type="button"
                      className="remedy-chip"
                      style={{ background: "#dcfce7", borderColor: "#86efac", color: "#166534" }}
                      disabled={syncLoading}
                      onClick={() =>
                        handleSyncToDb({
                          state: syncState || "Haryana",
                          commodity: "",
                          fromDate: syncFromDate || undefined,
                          toDate: syncToDate || undefined,
                        })
                      }
                    >
                      Sync All Crops in {syncResult.targetState}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sync Success Feedback (when fetched > 0) */}
        {syncResult && !syncResult.warning && syncResult.data?.fetched > 0 && (
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
                {syncResult.data?.dates?.length > 1 && (
                  <span>
                    · Dates: <strong>{syncResult.data.dates.join(", ")}</strong>
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
                : activeTab === "prediction"
                ? `GET /api/predictions/${encodeURIComponent(predCrop)}?horizon=${predHorizon}&role=${predRole}`
                : "GET /api/marketPrice/prices/db (MongoDB Saved)"}
            </code>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="explorer-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "prices" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("prices");
              setExplorerPage(1);
              setTableSearch("");
            }}
          >
            <CloudDownload size={14} />
            <span>1. Live AGMARKNET Prices (/prices)</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "state-commodity" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("state-commodity");
              setExplorerPage(1);
              setTableSearch("");
            }}
          >
            <Layers size={14} />
            <span>2. State + Commodity All Districts (/state-commodity)</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "by-commodity" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("by-commodity");
              setExplorerPage(1);
              setTableSearch("");
            }}
          >
            <TrendingUp size={14} />
            <span>3. Commodity Across States (/by-commodity/:commodity)</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "by-state" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("by-state");
              setExplorerPage(1);
              setTableSearch("");
            }}
          >
            <MapPin size={14} />
            <span>4. State Commodities (/by-state/:state)</span>
          </button>
          <button
            type="button"
            className={`tab-btn db-tab ${activeTab === "db" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("db");
              setExplorerPage(1);
              setTableSearch("");
            }}
          >
            <Database size={14} />
            <span>5. Database Records (/prices/db)</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "prediction" ? "active" : ""}`}
            style={activeTab === "prediction" ? { borderColor: "#16a34a", color: "#16a34a", fontWeight: 700 } : {}}
            onClick={() => {
              setActiveTab("prediction");
              setExplorerPage(1);
              setTableSearch("");
              fetchPredictionForAdmin(predCrop, predHorizon, predRole);
            }}
          >
            <Zap size={14} />
            <span>6. ML Price Prediction Engine (Live)</span>
          </button>
        </div>

        {activeTab === "prediction" ? (
          <div className="admin-prediction-workbench" style={{ marginTop: "16px" }}>
            {/* Controls Bar for Prediction */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                alignItems: "flex-end",
                padding: "16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink-secondary)" }}>
                  Target Crop / Commodity:
                </label>
                <select
                  value={predCrop}
                  onChange={(e) => {
                    const c = e.target.value;
                    setPredCrop(c);
                    fetchPredictionForAdmin(c, predHorizon, predRole);
                  }}
                  style={{
                    minWidth: "180px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                >
                  <optgroup label="⚡ Crops with Synced DB Records">
                    {(dbStats?.commodities || ["Wheat", "Tomato", "Onion", "Potato", "Soyabean"]).map((c) => (
                      <option key={`pred-db-${c}`} value={c}>
                        ● {c}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="All Agricultural Commodities">
                    {ALL_COMMODITIES.map((c) => (
                      <option key={`pred-all-${c}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink-secondary)" }}>
                  Forecast Horizon:
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[7, 14, 30].map((h) => (
                    <button
                      key={h}
                      type="button"
                      style={{
                        padding: "7px 14px",
                        borderRadius: "6px",
                        border: "1px solid",
                        borderColor: predHorizon === h ? "#16a34a" : "#cbd5e1",
                        background: predHorizon === h ? "#dcfce7" : "#ffffff",
                        color: predHorizon === h ? "#15803d" : "#334155",
                        fontWeight: predHorizon === h ? 700 : 500,
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                      onClick={() => {
                        setPredHorizon(h);
                        fetchPredictionForAdmin(predCrop, h, predRole);
                      }}
                    >
                      {h} Days
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink-secondary)" }}>
                  Simulated Stakeholder Role:
                </label>
                <select
                  value={predRole}
                  onChange={(e) => {
                    const r = e.target.value;
                    setPredRole(r);
                    fetchPredictionForAdmin(predCrop, predHorizon, r);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                >
                  <option value="FARMER">Farmer (Producer)</option>
                  <option value="BUYER">Buyer / Trader</option>
                  <option value="FPO">FPO Collective</option>
                  <option value="ADMIN">Market Administrator</option>
                </select>
              </div>

              <button
                type="button"
                className="secondary"
                disabled={predLoading}
                onClick={() => fetchPredictionForAdmin(predCrop, predHorizon, predRole)}
                style={{ padding: "8px 16px", alignSelf: "flex-end" }}
              >
                <RefreshCw size={14} className={predLoading ? "spin" : ""} />
                <span>Recalculate Model</span>
              </button>

              <button
                type="button"
                className="primary"
                disabled={syncLoading}
                onClick={() =>
                  handleSyncToDb({
                    commodity: predCrop,
                    limit: 100,
                  }).then(() => fetchPredictionForAdmin(predCrop, predHorizon, predRole))
                }
                style={{ padding: "8px 16px", alignSelf: "flex-end" }}
              >
                <CloudDownload size={14} />
                <span>Sync Fresh {predCrop} & Forecast</span>
              </button>
            </div>

            {/* Prediction Error */}
            {predError && (
              <div className="sync-feedback error" style={{ marginBottom: "16px" }}>
                <AlertTriangle size={18} color="#dc2626" />
                <span>{predError}</span>
              </div>
            )}

            {predLoading && !predData ? (
              <div className="loading-state">
                <RefreshCw size={24} className="spin" />
                <p>Computing statistical model and projecting prices from MongoDB records...</p>
              </div>
            ) : predData ? (
              <>
                {/* Metric Summary Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "14px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background:
                        predData.action === "HOLD" || predData.action === "BUY NOW"
                          ? "#f0fdf4"
                          : predData.action === "SELL NOW"
                          ? "#fef2f2"
                          : "#fefce8",
                    }}
                  >
                    <small style={{ fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
                      Recommended Action
                    </small>
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: 900,
                        margin: "4px 0",
                        color:
                          predData.action === "HOLD" || predData.action === "BUY NOW"
                            ? "#15803d"
                            : predData.action === "SELL NOW"
                            ? "#b91c1c"
                            : "#a16207",
                      }}
                    >
                      {predData.action}
                    </div>
                    <small style={{ color: "#334155" }}>{predData.actionTagline}</small>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                  >
                    <small style={{ fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
                      Current DB Stored Rate
                    </small>
                    <div style={{ fontSize: "22px", fontWeight: 800, margin: "4px 0", color: "#0f172a" }}>
                      ₹{predData.currentPrice?.toLocaleString("en-IN")}/qtl
                    </div>
                    <small style={{ color: "#64748b" }}>
                      ~₹{(predData.currentPrice / 100).toFixed(1)}/kg · Latest APMC
                    </small>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                  >
                    <small style={{ fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
                      Projected {predData.horizonDays}d Target
                    </small>
                    <div style={{ fontSize: "22px", fontWeight: 800, margin: "4px 0", color: "#16a34a" }}>
                      ₹{predData.predictedPrice?.toLocaleString("en-IN")}/qtl
                    </div>
                    <small
                      style={{
                        color: predData.projectedChangePct >= 0 ? "#16a34a" : "#dc2626",
                        fontWeight: 600,
                      }}
                    >
                      {predData.projectedChangePct >= 0 ? "↑ +" : "↓ "}
                      {predData.projectedChangePct}% Expected Shift
                    </small>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                  >
                    <small style={{ fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
                      Model Confidence
                    </small>
                    <div style={{ fontSize: "22px", fontWeight: 800, margin: "4px 0", color: "#0284c7" }}>
                      {predData.confidence}%
                    </div>
                    <small style={{ color: "#64748b" }}>Multi-factor signal alignment</small>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                  >
                    <small style={{ fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
                      MongoDB Stored Records
                    </small>
                    <div style={{ fontSize: "22px", fontWeight: 800, margin: "4px 0", color: "#7c3aed" }}>
                      {predData.dbRecordsCount || 0}
                    </div>
                    <small style={{ color: "#64748b" }}>
                      Across {predData.reportingMarketsCount || 1} APMC reporting mandis
                    </small>
                  </div>
                </div>

                {/* Dual Graphs: Forecast Cone + Historical Mandi Rates */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "24px",
                  }}
                >
                  {/* Forecast Cone AreaChart */}
                  <div
                    style={{
                      padding: "16px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "14px" }}>
                          {predCrop} {predHorizon}-Day Projected Cone
                        </strong>
                        <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>
                          Originates from DB baseline rate (₹{predData.currentPrice}/qtl)
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                        {predData.projectedChangePct >= 0 ? "+" : ""}
                        {predData.projectedChangePct}% Projected
                      </span>
                    </div>

                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart
                        data={predData.forecastSeries}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="adminPriceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `₹${v}`}
                          width={54}
                        />
                        <ChartTooltip formatter={(v) => [`₹${v}/qtl`, "Projected Price"]} />
                        <Area
                          type="monotone"
                          dataKey="upperBound"
                          stroke="#cbd5e1"
                          strokeDasharray="3 3"
                          fill="transparent"
                          name="Upper Margin"
                        />
                        <Area
                          type="monotone"
                          dataKey="projectedPrice"
                          stroke="#16a34a"
                          strokeWidth={2.5}
                          fill="url(#adminPriceGrad)"
                          name="Target Price"
                        />
                        <Area
                          type="monotone"
                          dataKey="lowerBound"
                          stroke="#cbd5e1"
                          strokeDasharray="3 3"
                          fill="transparent"
                          name="Lower Margin"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Historical Rates LineChart from MongoDB */}
                  <div
                    style={{
                      padding: "16px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "14px" }}>
                          Stored Mandi Modal Rates in MongoDB
                        </strong>
                        <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>
                          {predData.historicalSeries?.length || 0} API records stored from AGMARKNET
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: 700 }}>
                        {predData.msp ? `MSP: ₹${predData.msp}/qtl` : "Live APMC Feed"}
                      </span>
                    </div>

                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart
                        data={predData.historicalSeries}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `₹${v}`}
                          width={54}
                        />
                        <ChartTooltip
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
                                    fontSize: "12px",
                                  }}
                                >
                                  <strong>{item.market}</strong>
                                  <span
                                    style={{
                                      display: "block",
                                      color: "#64748b",
                                      fontSize: "11px",
                                    }}
                                  >
                                    {item.district}, {item.state} · {item.date}
                                  </span>
                                  <div
                                    style={{
                                      color: "#0284c7",
                                      fontWeight: 700,
                                      marginTop: "4px",
                                    }}
                                  >
                                    Modal: ₹{item.modalPrice}/qtl
                                  </div>
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
                  </div>
                </div>

                {/* Stored DB Records Table */}
                {predData.rawDbRecords?.length > 0 && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <strong>
                        MongoDB `mandiprices` Documents Used for this Forecast ({predData.rawDbRecords.length} records shown)
                      </strong>
                      <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                        ✓ Live Database Records
                      </span>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table className="mandi-data-table" style={{ width: "100%", fontSize: "13px" }}>
                        <thead>
                          <tr>
                            <th>Market / Mandi</th>
                            <th>District</th>
                            <th>State</th>
                            <th>Arrival Date</th>
                            <th>Min Rate</th>
                            <th>Max Rate</th>
                            <th>Modal Rate</th>
                            <th>Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predData.rawDbRecords.map((r, idx) => (
                            <tr key={r._id || idx}>
                              <td>
                                <strong>{r.market}</strong>
                              </td>
                              <td>{r.district}</td>
                              <td>{r.state}</td>
                              <td>
                                {r.arrivalDate
                                  ? new Date(r.arrivalDate).toLocaleDateString("en-IN")
                                  : "—"}
                              </td>
                              <td>₹{(r.minPrice || 0).toLocaleString("en-IN")}/qtl</td>
                              <td>₹{(r.maxPrice || 0).toLocaleString("en-IN")}/qtl</td>
                              <td style={{ color: "#16a34a", fontWeight: 700 }}>
                                ₹{(r.modalPrice || 0).toLocaleString("en-IN")}/qtl
                              </td>
                              <td>
                                <span className="source-pill db-source">MongoDB</span>
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
        ) : (
          <>
            {/* Filter Controls for Current Route */}
            <div className="explorer-filter-bar">
              {(activeTab === "prices" ||
            activeTab === "state-commodity" ||
            activeTab === "by-state" ||
            activeTab === "db") && (
            <div className="filter-input-group">
              <label>State (All 36 States & UTs):</label>
              <select
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setExplorerPage(1);
                }}
              >
                <option value="">All States</option>
                {activeOptions.activeStates?.length > 0 && (
                  <optgroup label="⚡ Actively Reporting in Live Feed">
                    {activeOptions.activeStates.map((s) => (
                      <option key={`exp-active-${s}`} value={s}>
                        ● {s}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="All 36 Indian States & Union Territories">
                  {ALL_INDIAN_STATES.map((s) => (
                    <option key={`exp-all-${s}`} value={s}>
                      {s}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {(activeTab === "prices" ||
            activeTab === "state-commodity" ||
            activeTab === "by-commodity" ||
            activeTab === "db") && (
            <div className="filter-input-group">
              <label>Commodity:</label>
              <select
                value={filterCommodity}
                onChange={(e) => {
                  setFilterCommodity(e.target.value);
                  setExplorerPage(1);
                }}
              >
                <option value="">All Commodities</option>
                <optgroup label="⚡ Popular Commodities">
                  {ALL_COMMODITIES.slice(0, 15).map((c) => (
                    <option key={`exp-pop-${c}`} value={c}>
                      ● {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="All Agricultural Commodities">
                  {activeOptions.commodities.map((c) => (
                    <option key={`exp-comm-${c}`} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {(activeTab === "prices" || activeTab === "db") && (
            <div className="filter-input-group">
              <label>District:</label>
              <input
                type="text"
                placeholder="District (optional)"
                value={filterDistrict}
                onChange={(e) => {
                  setFilterDistrict(e.target.value);
                  setExplorerPage(1);
                }}
              />
            </div>
          )}

          {/* Date Range in Explorer Bar */}
          {(activeTab === "prices" || activeTab === "state-commodity" || activeTab === "db") && (
            <>
              <div className="filter-input-group">
                <label>Date From:</label>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => {
                    setFilterFromDate(e.target.value);
                    setExplorerPage(1);
                  }}
                />
              </div>
              <div className="filter-input-group">
                <label>Date To:</label>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => {
                    setFilterToDate(e.target.value);
                    setExplorerPage(1);
                  }}
                />
              </div>
            </>
          )}

          {(activeTab === "prices" || activeTab === "db") && (
            <div className="filter-input-group">
              <label>Page Size:</label>
              <select
                value={dataLimit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setDataLimit(newLimit);
                  setExplorerPage(1);
                  fetchExplorerRouteData(1);
                }}
              >
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
                <option value={200}>200 rows</option>
                <option value={500}>500 rows</option>
              </select>
            </div>
          )}

          <button
            type="button"
            className="secondary query-btn"
            onClick={() => {
              setExplorerPage(1);
              fetchExplorerRouteData(1);
            }}
            disabled={explorerLoading}
          >
            <Search size={14} className={explorerLoading ? "spin" : ""} />
            <span>Query API</span>
          </button>
        </div>

        {/* Table Search & Results Count Bar */}
        <div className="table-action-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div className="results-count" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span>
              Showing{" "}
              <strong>
                {explorerTotal > 0 ? (explorerPage - 1) * dataLimit + 1 : 0} –{" "}
                {Math.min(explorerPage * dataLimit, explorerTotal).toLocaleString()}
              </strong>{" "}
              of <strong>{explorerTotal.toLocaleString()}</strong> records
              {activeTab === "db" && " (Saved in MongoDB)"}
              {activeTab === "prices" && " (AGMARKNET Official Feed)"}
            </span>
            {(activeTab === "prices" || activeTab === "db") && explorerTotal > dataLimit && (
              <span
                style={{
                  fontSize: "11px",
                  background: "#e0e7ff",
                  color: "#3730a3",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontWeight: 600,
                }}
              >
                Page {explorerPage} of {Math.ceil(explorerTotal / dataLimit)}
              </span>
            )}
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

        {/* Active Smart Fallback Banner */}
        {fallbackNotice && (
          <div
            className="sync-feedback warning"
            style={{
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "280px" }}>
              <Info size={22} color="#b45309" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#78350f", fontSize: "14px" }}>
                  {fallbackNotice.type === "auto_switched_state"
                    ? `0 arrivals for ${fallbackNotice.commodity} in ${fallbackNotice.originalState}. Showing active arrivals in ${fallbackNotice.activeState}.`
                    : `0 arrivals reported in ${fallbackNotice.searchedState} for "${fallbackNotice.commodity}". Showing ${fallbackNotice.count} arrivals from active states.`}
                </strong>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#92400e" }}>
                  Active states reporting arrivals:{" "}
                  <strong>{fallbackNotice.availableStates?.slice(0, 5).join(", ") || "Nationwide"}</strong>
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              {filterState && (
                <button
                  type="button"
                  className="date-chip"
                  style={{
                    background: "#dcfce7",
                    borderColor: "#86efac",
                    color: "#166534",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "6px 12px",
                    borderRadius: "6px",
                  }}
                  onClick={() => setFilterState("")}
                >
                  🌐 View All States (Nationwide)
                </button>
              )}
              {fallbackNotice.availableStates?.slice(0, 3).map((st) => (
                <button
                  key={`switch-${st}`}
                  type="button"
                  className="date-chip"
                  style={{
                    background: "#ffffff",
                    borderColor: "#cbd5e1",
                    color: "#1e293b",
                    cursor: "pointer",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  onClick={() => setFilterState(st)}
                >
                  📍 Switch to {st}
                </button>
              ))}
            </div>
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
              <small>Try selecting a different state, commodity, or date range.</small>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                {filterState && (
                  <button
                    type="button"
                    className="secondary"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                    onClick={() => setFilterState("")}
                  >
                    🌐 Search "{filterCommodity || 'This Crop'}" Nationwide
                  </button>
                )}
                {tableSearch && (
                  <button
                    type="button"
                    className="secondary"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                    onClick={() => setTableSearch("")}
                  >
                    ✕ Clear Search Text
                  </button>
                )}
                <button
                  type="button"
                  className="primary"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                  disabled={syncLoading}
                  onClick={() => handleSyncToDb({ commodity: filterCommodity, state: filterState || undefined })}
                >
                  <CloudDownload size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                  Import Fresh {filterCommodity || "Mandi"} Data
                </button>
              </div>
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

          {/* Interactive Pagination Bar for Paginated Views */}
          {(activeTab === "prices" || activeTab === "db") && explorerTotal > 0 && (
            <div
              className="explorer-pagination-bar"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                borderRadius: "0 0 10px 10px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                Showing{" "}
                <strong style={{ color: "#1e293b" }}>
                  {(explorerPage - 1) * dataLimit + 1} –{" "}
                  {Math.min(explorerPage * dataLimit, explorerTotal).toLocaleString()}
                </strong>{" "}
                of <strong style={{ color: "#1e293b" }}>{explorerTotal.toLocaleString()}</strong> total records
                <span style={{ marginLeft: "6px", color: "#94a3b8" }}>
                  (Page {explorerPage} of {Math.max(1, Math.ceil(explorerTotal / dataLimit))})
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  title="First Page"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: explorerPage <= 1 ? "#f1f5f9" : "#ffffff",
                    color: explorerPage <= 1 ? "#94a3b8" : "#334155",
                    cursor: explorerPage <= 1 ? "not-allowed" : "pointer",
                  }}
                  onClick={() => handlePageChange(1)}
                  disabled={explorerPage <= 1 || explorerLoading}
                >
                  <ChevronsLeft size={14} />
                  <span>First</span>
                </button>

                <button
                  type="button"
                  title="Previous Page"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: explorerPage <= 1 ? "#f1f5f9" : "#ffffff",
                    color: explorerPage <= 1 ? "#94a3b8" : "#334155",
                    cursor: explorerPage <= 1 ? "not-allowed" : "pointer",
                  }}
                  onClick={() => handlePageChange(explorerPage - 1)}
                  disabled={explorerPage <= 1 || explorerLoading}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                <div
                  style={{
                    padding: "4px 12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#0f172a",
                    background: "#e2e8f0",
                    borderRadius: "6px",
                  }}
                >
                  {explorerPage} / {Math.max(1, Math.ceil(explorerTotal / dataLimit))}
                </div>

                <button
                  type="button"
                  title="Next Page"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: explorerPage >= Math.ceil(explorerTotal / dataLimit) ? "#f1f5f9" : "#ffffff",
                    color: explorerPage >= Math.ceil(explorerTotal / dataLimit) ? "#94a3b8" : "#334155",
                    cursor: explorerPage >= Math.ceil(explorerTotal / dataLimit) ? "not-allowed" : "pointer",
                  }}
                  onClick={() => handlePageChange(explorerPage + 1)}
                  disabled={explorerPage >= Math.ceil(explorerTotal / dataLimit) || explorerLoading}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  title="Last Page"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: explorerPage >= Math.ceil(explorerTotal / dataLimit) ? "#f1f5f9" : "#ffffff",
                    color: explorerPage >= Math.ceil(explorerTotal / dataLimit) ? "#94a3b8" : "#334155",
                    cursor: explorerPage >= Math.ceil(explorerTotal / dataLimit) ? "not-allowed" : "pointer",
                  }}
                  onClick={() => handlePageChange(Math.ceil(explorerTotal / dataLimit))}
                  disabled={explorerPage >= Math.ceil(explorerTotal / dataLimit) || explorerLoading}
                >
                  <span>Last</span>
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
        </>
      )}
      </div>
    </section>
  );
}

export default AdminMarketSyncPage;
