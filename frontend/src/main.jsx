import React, { Component, createContext, useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import MandiMap from "./components/MandiMap";
import "./style.css";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
api.interceptors.request.use((c) => {
  if (localStorage.token)
    c.headers.Authorization = "Bearer " + localStorage.token;
  return c;
});
const A = createContext(),
  useA = () => useContext(A),
  path = (r) => "/" + r.toLowerCase() + "/dashboard";
const Card = ({ a, b, c }) => (
  <div className="card">
    <small>{a}</small>
    <h2>{b}</h2>
    <p>{c}</p>
  </div>
);
const S = ({ children }) => <b className="status">{children}</b>;
function MandiRateChart({ markets = [], title = "Nearby grain mandi rates" }) {
  const data = markets.map((row) => ({
    name: row.market?.name?.replace(/ Mandi$/, "") || "Mandi",
    modalPrice: row.modalPrice,
    location: row.market?.location,
    distanceKm: row.distanceKm,
  }));
  return (
    <>
      <div className="chart-heading">
        <div>
          <p className="eyebrow"><span className="live-dot" /> LIVE MANDI RATES</p>
          <h3>{title}</h3>
        </div>
        <span className="chart-change positive">{data.length} mandis</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 14, right: 10, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="#e7eee8" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#718078" }} tickLine={false} axisLine={false} interval={0} angle={-22} textAnchor="end" height={48} />
          <YAxis domain={["dataMin - 15", "dataMax + 15"]} tick={{ fontSize: 11, fill: "#718078" }} tickLine={false} axisLine={false} width={48} tickFormatter={(value) => `₹${value}`} />
          <Tooltip
            formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}/kg`, "Modal price"]}
            labelFormatter={(label) => `${label} Mandi`}
            contentStyle={{ border: "1px solid #dce8de", borderRadius: 8, boxShadow: "0 8px 24px rgba(24, 62, 39, .12)" }}
          />
          <Line type="monotone" dataKey="modalPrice" stroke="#17804b" strokeWidth={3} dot={{ r: 5, fill: "#fff", strokeWidth: 2, stroke: "#17804b" }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
      <small>Latest modal wheat price for each mandi near the farmer location.</small>
    </>
  );
}
class AppErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="app-recovery"><div className="panel"><p className="eyebrow">RECOVERY MODE</p><h1>We could not load this view.</h1><p>Your session is still safe. Return to the dashboard to retry without signing in again.</p><button className="primary" onClick={() => { this.setState({ failed: false }); window.location.assign("/"); }}>Return home</button></div></div>;
    return this.props.children;
  }
}
function Shell({ children }) {
  let { user, logout } = useA(),
    { r: routeRole } = useParams(),
    r = routeRole || user.role.toLowerCase(),
    workspaceRole = r.toUpperCase();
  let items =
    workspaceRole === "ADMIN"
      ? [
          ["Dashboard", "dashboard", "◫"],
          ["Users", "users", "◉"],
          ["Market activity", "prices", "↗"],
          ["Disputes", "disputes", "!"],
          ["Analytics", "analytics", "⌁"],
        ]
      : workspaceRole === "BUYER"
        ? [
            ["Dashboard", "dashboard", "◫"],
            ["Buyer demands", "demands", "⌁"],
            ["Browse lots", "lots", "▦"],
            ["Recommended lots", "recommendations", "✦"],
            ["Offers", "offers", "↔"],
            ["Transactions", "transactions", "✓"],
            ["Payments", "payments", "₹"],
            ["Logistics", "logistics", "⌁"],
            ["Notifications", "notifications", "●"],
          ]
        : workspaceRole === "FPO"
          ? [
              ["Dashboard", "dashboard", "◫"],
              ["Farmers", "farmers", "◉"],
              ["Aggregated lots", "lots", "▦"],
              ["Aggregation", "aggregation", "⊞"],
              ["Market prices", "prices", "↗"],
              ["Matching", "matching", "✦"],
              ["Offers", "offers", "↔"],
              ["Transactions", "transactions", "✓"],
              ["Logistics", "logistics", "⌁"],
              ["Storage", "storage", "□"],
              ["Payments", "payments", "₹"],
              ["Notifications", "notifications", "●"],
            ]
          : [
              ["Dashboard", "dashboard", "◫"],
              ["My profile", "profile", "◉"],
              ["My farm", "farm", "⌂"],
              ["My lots", "lots", "▦"],
              ["Market prices", "prices", "↗"],
              ["Buyer demands", "demands", "⌁"],
              ["Offers", "offers", "↔"],
              ["Transactions", "transactions", "✓"],
              ["Logistics", "logistics", "⌁"],
              ["Storage", "storage", "□"],
              ["Payments", "payments", "₹"],
              ["Notifications", "notifications", "●"],
              ["Disputes", "disputes", "!"],
            ];
  return (
    <div className="app-shell">
      <aside>
        <Link className="brand" to="/">
          🌾 <span>AgriLink</span>
        </Link>
        <div className="workspace-card">
          <span className="workspace-role">{workspaceRole}</span>
          <b>{workspaceRole === "FPO" ? "FPO collective workspace" : user.name}</b>
          <small>Marketplace workspace</small>
        </div>
        <p className="side-label">WORKSPACE</p>
        {items.map(([label, key, icon]) => (
          <NavLink
            key={key}
            className={({ isActive }) =>
              "side-link" + (isActive ? " active" : "")
            }
            to={"/" + r + "/" + key}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
        <div className="sidebar-bottom">
          <span className="online-dot" /> Verified marketplace
          <br />
          <small>Secure demo environment</small>
        </div>
      </aside>
      <div className="content">
        <header>
          <div>
            <small>Signed in as</small>
            <br />
            <b>{user.name}</b>
            <small> · {workspaceRole} workspace</small>
          </div>
          <button onClick={logout}>Sign out</button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
function Guard({ children }) {
  let { user, ready } = useA(), { r } = useParams();
  if (ready && user && r && r.toUpperCase() !== user.role)
    return <Navigate to={path(user.role)} replace />;
  return !ready ? (
    <div className="boot">Restoring your secure session…</div>
  ) : user ? (
    <Shell>{children}</Shell>
  ) : (
    <Navigate to="/login" />
  );
}
function RoleDashboardRedirect() {
  const { r } = useParams();
  const role = (r || "").toLowerCase();
  return ["farmer", "buyer", "fpo", "admin"].includes(role) ? (
    <Navigate to={`/${role}/dashboard`} replace />
  ) : (
    <Navigate to="/" replace />
  );
}
function Home() {
  const marketRows = [
    ["Indore Mandi", "₹2,450", "+1.8%", "130 qtl"],
    ["Neemuch Mandi", "₹2,540", "+2.4%", "250 qtl"],
    ["Mandsaur Mandi", "₹2,522", "+1.9%", "226 qtl"],
    ["Bhopal Mandi", "₹2,504", "+1.5%", "202 qtl"],
  ];
  return (
    <div className="landing">
      <nav>
        <b className="landing-brand"><span>↗</span> AgriLink <small>Digital Mandi</small></b>
        <div>
          <Link to="/register/farmer">For farmers</Link>
          <Link to="/register/buyer">For buyers</Link>
          <Link to="/login">Login</Link>{" "}
          <Link className="primary" to="/register">Open an account</Link>
        </div>
      </nav>
      <section className="market-hero">
        <div className="market-hero-copy">
          <div className="market-kicker"><span className="live-dot" /> MARKET OPEN <i /> WHEAT · MADHYA PRADESH</div>
          <h1>The mandi, <em>online.</em></h1>
          <p className="market-lede">A live trading network where farmers bring supply, buyers place demand, and every lot moves with a visible price, quality, and delivery trail.</p>
          <div className="hero-actions"><Link className="primary" to="/register/farmer">Sell your produce</Link><Link className="text-action" to="/register/buyer">Find market supply <span>↗</span></Link></div>
          <div className="market-stats"><div><b>₹2,558</b><span>Wheat modal price</span></div><div><b className="up">+1.97%</b><span>30-day movement</span></div><div><b>10</b><span>Mandis connected</span></div></div>
        </div>
        <div className="market-terminal">
          <div className="terminal-top"><span><i className="live-dot" /> LIVE MARKET</span><small>09 SEP 2026 · 14:32 IST</small></div>
          <div className="terminal-price"><small>WHEAT / KG</small><strong>₹2,558.00</strong><span>▲ 49.40 <b>(+1.97%)</b></span></div>
          <div className="mini-chart"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><b>LIVE</b></div>
          <div className="terminal-grid"><div><small>BEST BID</small><b>₹2,550</b><span>18 buyers</span></div><div><small>BEST ASK</small><b>₹2,558</b><span>6 lots</span></div><div><small>TRADED TODAY</small><b>1,842 qtl</b><span>+12.4%</span></div></div>
        </div>
      </section>
      <section className="market-board">
        <div className="board-heading"><div><p className="eyebrow">LIVE PRICE TAPE</p><h2>What is trading near you</h2></div><Link to="/register/farmer">View all mandis ↗</Link></div>
        <div className="rate-tape">{marketRows.map(([name, price, change, volume]) => <article key={name}><div><span className="status-dot" /> <b>{name}</b></div><strong>{price}</strong><span className="up">▲ {change}</span><small>{volume} arrivals</small></article>)}</div>
        <div className="order-floor"><div className="floor-intro"><p className="eyebrow">THE DIGITAL TRADING FLOOR</p><h2>From mandi arrival to market match.</h2><p>AgriLink brings the working parts of offline trade into one visible flow: discover a rate, list a lot, match a buyer, and coordinate the handoff.</p></div><div className="order-card"><div className="order-card-top"><b>WHEAT · ORDER FLOW</b><span>Today</span></div><div className="order-row order-head"><span>BUYERS</span><span>PRICE</span><span>LOTS</span></div><div className="order-row"><span>ABC Foods</span><b>₹2,560</b><span>12</span></div><div className="order-row"><span>Malwa Traders</span><b>₹2,548</b><span>8</span></div><div className="order-row"><span>Indore FPO</span><b>₹2,540</b><span>5</span></div><div className="order-footer"><span>3 active demands</span><Link to="/register/buyer">Join the book ↗</Link></div></div></div>
      </section>
      <section className="role-strip"><div><p className="eyebrow">ONE MARKET, DIFFERENT ROLES</p><h2>Choose your side of the trade.</h2></div><div className="role-links"><Link to="/register/farmer"><span>01</span><b>Farmer</b><small>List produce at a visible rate</small>↗</Link><Link to="/register/fpo"><span>02</span><b>FPO</b><small>Pool supply and sell together</small>↗</Link><Link to="/register/buyer"><span>03</span><b>Buyer</b><small>Place demand and source lots</small>↗</Link></div></section>
    </div>
  );
}
function Login({ reg }) {
  let nav = useNavigate(),
    { role: routeRole } = useParams(),
    selectedRole = ["farmer", "buyer", "fpo"].includes(routeRole?.toLowerCase())
      ? routeRole.toUpperCase()
      : "FARMER",
    { setUser } = useA(),
    [f, setF] = useState({
      name: "",
      email: reg ? "" : "farmer@agrilink.com",
      password: reg ? "" : "Demo@12345",
      role: selectedRole,
      phone: "",
      location: "",
      address: "",
      district: "",
      state: "",
      pincode: "",
      farmName: "",
      landSize: "",
      primaryCrop: "",
      organizationName: "",
      buyerType: "TRADER",
      registrationNumber: "",
      memberCount: "",
    }),
    [err, setErr] = useState(""),
    set = (key, value) => setF((x) => ({ ...x, [key]: value }));
  useEffect(() => {
    if (reg) setF((x) => ({ ...x, role: selectedRole }));
  }, [reg, selectedRole]);
  let go = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      let r = await api.post("/auth/" + (reg ? "register" : "login"), f);
      localStorage.token = r.data.data.token;
      setUser(r.data.data.user);
      nav(path(r.data.data.user.role));
    } catch (e) {
      setErr(e.response?.data?.message || "Request failed");
    }
  };
  if (!reg)
    return (
      <div className="auth">
        <h1>Welcome back</h1>
        <p>Demo: farmer@agrilink.com / Demo@12345</p>
        <form onSubmit={go}>
          <input
            aria-label="Email"
            type="email"
            value={f.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          <input
            aria-label="Password"
            type="password"
            value={f.password}
            onChange={(e) => set("password", e.target.value)}
            required
          />
          <button className="primary">Login</button>
        </form>
        <p className="error">{err}</p>
        <Link to="/register">Create an account</Link>
      </div>
    );
  let roleLabel =
    f.role === "FARMER"
      ? "Farmer"
      : f.role === "BUYER"
        ? "Buyer"
        : "FPO representative";
  let roleIntro =
    f.role === "FARMER"
      ? "Create a farmer workspace to list produce, compare mandi prices and connect with buyers."
      : f.role === "BUYER"
        ? "Create a buyer workspace to publish demands, discover lots and manage procurement."
        : "Create an FPO workspace to add farmers, aggregate their produce and sell together.";
  return (
    <div className="auth auth-register">
      <p className="eyebrow">CREATE YOUR MARKETPLACE PROFILE</p>
      <h1>Create your {roleLabel} workspace</h1>
      <p>{roleIntro}</p>
      <form onSubmit={go}>
        <label>
          Choose account type
          <select
            value={f.role}
            onChange={(e) => nav("/register/" + e.target.value.toLowerCase())}
          >
            <option value="FARMER">Farmer</option>
            <option value="BUYER">Buyer</option>
            <option value="FPO">FPO representative</option>
          </select>
        </label>
        <h3>Contact details</h3>
        <div className="form-grid">
          <label>
            Full name
            <input
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={f.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </label>
          <label>
            Mobile number
            <input
              type="tel"
              value={f.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              minLength="8"
              value={f.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </label>
        </div>
        <h3>Location</h3>
        <div className="form-grid">
          <label>
            Village / city
            <input
              value={f.location}
              onChange={(e) => set("location", e.target.value)}
              required
            />
          </label>
          <label>
            District
            <input
              value={f.district}
              onChange={(e) => set("district", e.target.value)}
            />
          </label>
          <label>
            State
            <input
              value={f.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </label>
          <label>
            PIN code
            <input
              inputMode="numeric"
              value={f.pincode}
              onChange={(e) => set("pincode", e.target.value)}
            />
          </label>
        </div>
        <label>
          Address
          <input
            value={f.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </label>
        {f.role === "FARMER" && (
          <>
            <h3>Your farm details</h3>
            <div className="form-grid">
              <label>
                Farm name
                <input
                  value={f.farmName}
                  onChange={(e) => set("farmName", e.target.value)}
                  required
                />
              </label>
              <label>
                Land size (acres)
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={f.landSize}
                  onChange={(e) => set("landSize", e.target.value)}
                  required
                />
              </label>
              <label>
                Primary crop
                <input
                  placeholder="e.g. Wheat"
                  value={f.primaryCrop}
                  onChange={(e) => set("primaryCrop", e.target.value)}
                  required
                />
              </label>
            </div>
          </>
        )}
        {f.role === "BUYER" && (
          <>
            <h3>Your buyer organisation</h3>
            <div className="form-grid">
              <label>
                Organisation name
                <input
                  value={f.organizationName}
                  onChange={(e) => set("organizationName", e.target.value)}
                  required
                />
              </label>
              <label>
                Buyer type
                <select
                  value={f.buyerType}
                  onChange={(e) => set("buyerType", e.target.value)}
                >
                  <option>TRADER</option>
                  <option>RETAILER</option>
                  <option>PROCESSOR</option>
                  <option>EXPORTER</option>
                </select>
              </label>
            </div>
          </>
        )}
        {f.role === "FPO" && (
          <>
            <h3>Your FPO organisation</h3>
            <div className="form-grid">
              <label>
                FPO name
                <input
                  value={f.organizationName}
                  onChange={(e) => set("organizationName", e.target.value)}
                  required
                />
              </label>
              <label>
                Registration number
                <input
                  value={f.registrationNumber}
                  onChange={(e) => set("registrationNumber", e.target.value)}
                  required
                />
              </label>
              <label>
                Member count
                <input
                  type="number"
                  min="1"
                  value={f.memberCount}
                  onChange={(e) => set("memberCount", e.target.value)}
                  required
                />
              </label>
            </div>
          </>
        )}
        <button className="primary">Create {roleLabel} account</button>
      </form>
      <p className="error">{err}</p>
      <Link to="/login">Login instead</Link>
    </div>
  );
}
function Dashboard() {
  const cachedDashboard = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("agrilink-dashboard-wheat-v2") || "null");
    } catch {
      return null;
    }
  })();
  let { user } = useA(),
    { r } = useParams(),
    [d, setD] = useState(cachedDashboard?.trend || null),
    [admin, setAdmin] = useState(null),
    [markets, setMarkets] = useState(cachedDashboard?.markets || []),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true,
      load = async () => {
        try {
          setError("");
          if (user.role === "ADMIN") {
            let x = await api.get("/admin/summary");
            if (alive) setAdmin(x.data.data);
            return;
          }
          const coordinates = user.geo?.coordinates?.length === 2 ? user.geo.coordinates : null;
          const locationQuery = coordinates ? `&longitude=${coordinates[0]}&latitude=${coordinates[1]}` : "";
          let [trend, nearby] = await Promise.all([
            api.get("/prices/trends?commodity=Wheat"),
            api.get(`/markets/nearby?commodity=Wheat${locationQuery}`),
          ]);
          if (alive) {
            setD(trend.data.data);
            const nearestMarkets = nearby.data.data;
            setMarkets(nearestMarkets);
            sessionStorage.setItem(
              "agrilink-dashboard-wheat-v2",
              JSON.stringify({ trend: trend.data.data, markets: nearestMarkets }),
            );
          }
        } catch (e) {
          if (alive)
            setError(
              e.response?.data?.message ||
                "Dashboard data could not be loaded.",
            );
        }
      };
    load();
    const refreshTimer = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(refreshTimer);
    };
  }, [user.role]);
  if (admin)
    return (
      <section>
        <p className="eyebrow">PLATFORM OVERSIGHT</p>
        <h1>Admin Command Centre</h1>
        <div className="grid">
          {Object.entries(admin).map(([k, v]) => (
            <Card
              a={k.replace(/([A-Z])/g, " $1")}
              b={typeof v === "number" ? v.toLocaleString("en-IN") : String(v)}
            />
          ))}
        </div>
        <Operational title="Verification, disputes & analytics" type="admin" />
      </section>
    );
  if (error)
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
            <Link
              className="primary"
              to={"/" + r + "/prices"}
            >
              View market prices
            </Link>
            {r === "buyer" ? (
              <Link to={"/" + r + "/demands"}>
                Create a buyer demand
              </Link>
            ) : (
              <Link to={"/" + r + "/lots"}>
                Create your first lot
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  if (!d)
    return (
      <section className="dashboard-empty">
        <p className="eyebrow">DASHBOARD</p>
        <h1>Preparing your marketplace view…</h1>
        <div className="panel">
          Loading current price signals and nearby markets.
        </div>
      </section>
    );
  let isBuyer = user.role === "BUYER",
    isFpo = r === "fpo",
    advice = d.advice || { recommendation: "COMPARE_MARKETS", reason: "Compare market prices before committing your produce.", disclaimer: "Market information is currently being refreshed." },
    chartData = (d.history || []).map((point) => ({
      ...point,
      dateLabel: new Date(point.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    })),
    chartColor = d.changePercentage >= 0 ? "#17804b" : "#c94c4c",
    farmerCoordinates = user.geo?.coordinates?.length === 2 ? user.geo.coordinates : null;
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
        <Card
          a={isFpo ? "ACTIVE MEMBER LOTS" : isBuyer ? "ACTIVE PROCUREMENT" : "CURRENT MODAL PRICE"}
          b={isFpo ? "48 lots" : isBuyer ? "2 demands" : "₹" + d.currentPrice}
          c={
            isFpo
              ? "Ready for aggregation"
              : isBuyer
              ? "Quality and price rules applied"
              : "Wheat / kg · sampled market data"
          }
        />
        <Card
          a={isFpo ? "POOLED VOLUME" : "7-DAY AVERAGE"}
          b={isFpo ? "286 qtl" : "₹" + d.average7Days}
          c={isFpo ? "Across 5 crop groups" : "Mandi modal price"}
        />
        <Card
          a={isFpo ? "BEST BUYER MATCH" : "PRICE TREND"}
          b={isFpo ? "97%" : d.trend}
          c={
            isFpo
              ? "Quality, price & pickup aligned"
              : (d.changePercentage > 0 ? "+" : "") +
                d.changePercentage +
                "% against 30 days"
          }
        />
        <Card
          a={isFpo ? "COLLECTION STATUS" : "SELLING INSIGHT"}
          b={isFpo ? "Ready" : advice.recommendation.replace("_", " ")}
          c={isFpo ? "12 member pickups scheduled" : advice.reason}
        />
      </div>
      <div className="two-col">
        <div className="panel">
          <MandiRateChart markets={markets} />
          <small>{advice.disclaimer} · Updates every 30 seconds · Last checked {new Date(d.lastUpdated || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</small>
        </div>
        <div className="panel">
          <h3>Best nearby markets</h3>
          {markets.map((p, i) => (
            <div className="market-row" key={p._id || p.market?._id || p.market?.name || i}>
              <b>
                {i + 1}. {p.market?.name}
              </b>
              <span>₹{p.modalPrice}/kg</span>
              <small>
                {p.market?.location} · {p.distanceKm} km away · arrival {p.arrivalVolume} qtl
              </small>
            </div>
          ))}
          <Link
            className="primary"
            to={"/" + r + "/prices"}
          >
            Compare all markets
          </Link>
        </div>
      </div>
      <div className="panel mandi-map-panel">
        <h3>Nearest mandis on the map</h3>
        <p>Tap a pin to compare the live modal price and arrivals for each recommended mandi.</p>
        <MandiMap markets={markets} userLocation={farmerCoordinates} compact />
      </div>
    </section>
  );
}
function Lots() {
  let { user } = useA(),
    [rows, setRows] = useState([]),
    [show, setShow] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [f, setF] = useState({
      commodity: "Wheat",
      quantity: 1000,
      expectedPrice: 2450,
      location: "Indore",
    }),
    set = (key, value) => setF((x) => ({ ...x, [key]: value }));
  let load = () =>
    api
      .get("/lots" + (user.role === "BUYER" ? "" : "?mine=true"))
      .then((x) => setRows(x.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load lots"),
      );
  useEffect(() => {
    load();
  }, [user.role]);
  let save = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await api.post("/lots", {
        ...f,
        quantity: +f.quantity,
        expectedPrice: +f.expectedPrice,
        quality: { grade: "Grade A", moisture: 11 },
      });
      setShow(false);
      setNotice("Lot published successfully. Buyers can now discover it.");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not publish this lot.");
    }
  };
  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            {user.role === "BUYER" ? "MARKETPLACE" : "INVENTORY"}
          </p>
          <h1>{user.role === "BUYER" ? "Browse available lots" : "My lots"}</h1>
          <p>
            {user.role === "BUYER"
              ? "Compare available produce, quality and prices before making an offer."
              : "Publish available produce so verified buyers can find and contact you."}
          </p>
        </div>
        {user.role !== "BUYER" && (
          <button
            className="primary"
            onClick={() => {
              setShow(!show);
              setNotice("");
            }}
          >
            {show ? "Close form" : "+ Create lot"}
          </button>
        )}
      </div>
      {show && (
        <form className="form-card" onSubmit={save}>
          <div className="form-card-heading">
            <div>
              <h3>Publish a new lot</h3>
              <p>
                Enter the produce details buyers need to make an informed offer.
              </p>
            </div>
            <S>DRAFT</S>
          </div>
          <div className="form-grid">
            <label>
              Commodity
              <input
                value={f.commodity}
                onChange={(e) => set("commodity", e.target.value)}
                required
              />
            </label>
            <label>
              Available quantity (kg)
              <input
                type="number"
                min="1"
                value={f.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                required
              />
            </label>
            <label>
              Expected price (₹ / kg)
              <input
                type="number"
                min="1"
                value={f.expectedPrice}
                onChange={(e) => set("expectedPrice", e.target.value)}
                required
              />
            </label>
            <label>
              Location
              <input
                value={f.location}
                onChange={(e) => set("location", e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setShow(false)}>
              Cancel
            </button>
            <button className="primary">Publish lot</button>
          </div>
        </form>
      )}
      {notice && <p className="form-message success">✓ {notice}</p>}
      {error && <p className="form-message error">{error}</p>}
      <div className="lots">
        {rows.length ? (
          rows.map((l) => (
            <article className="lot" key={l._id}>
              <S>{l.status}</S>
              <h3>
                {l.commodity} · {l.quality?.grade || "Quality pending"}
              </h3>
              <p>
                <b>{l.remainingQuantity} KG</b> · ₹{l.expectedPrice}/kg
              </p>
              <p>📍 {l.location || "Location not provided"}</p>
              {user.role === "BUYER" && <Offer lot={l} />}
            </article>
          ))
        ) : (
          <div className="panel empty-panel">
            <h3>
              {user.role === "BUYER"
                ? "No lots are available yet"
                : "No lots published yet"}
            </h3>
            <p>
              {user.role === "BUYER"
                ? "Check back shortly as farmers add produce to the marketplace."
                : "Create your first lot to begin receiving buyer offers."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
function Offer({ lot }) {
  let [msg, setMsg] = useState(""), [error, setError] = useState(""), [sending, setSending] = useState(false);
  let send = async () => {
    setSending(true); setError("");
    try {
      await api.post("/offers", { lotId: lot._id, quantity: Math.min(1000, lot.remainingQuantity), pricePerUnit: lot.expectedPrice, message: "We can arrange pickup within 2 days." });
      setMsg("Offer sent");
    } catch (e) {
      setError(e.response?.data?.message || "Could not send offer.");
    } finally {
      setSending(false);
    }
  };
  return (
    <>
      <button className="primary" onClick={send} disabled={sending || !!msg}>
        {sending ? "Sending…" : msg ? "Offer sent" : "Make offer"}
      </button>
      <p className="success">{msg}</p>
      {error && <p className="error">{error}</p>}
    </>
  );
}
function Demands() {
  let [rows, setRows] = useState([]),
    [matches, setMatches] = useState([]),
    [f, setF] = useState({
      commodity: "Wheat",
      requiredQuantity: 3000,
      requiredQuality: "Grade A",
      preferredLocation: "Indore",
      maxPrice: 2600,
    }), [error, setError] = useState(""), [loading, setLoading] = useState(false);
  let load = () => api.get("/demands?mine=true").then((x) => setRows(x.data.data)).catch((e) => setError(e.response?.data?.message || "Could not load demands."));
  useEffect(() => {
    load();
  }, []);
  let save = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await api.post("/demands", { ...f, requiredQuantity: +f.requiredQuantity, maxPrice: +f.maxPrice }); load(); }
    catch (x) { setError(x.response?.data?.message || "Could not create demand."); }
    finally { setLoading(false); }
  };
  return (
    <section>
      <h2>Buyer Demand & Explainable Matching</h2>
      {error && <p className="form-message error">{error}</p>}
      <form className="inline-form" onSubmit={save}>
        {Object.keys(f).map((k) => (
          <input
              key={k}
            value={f[k]}
            onChange={(e) => setF({ ...f, [k]: e.target.value })}
          />
        ))}
        <button className="primary" disabled={loading}>{loading ? "Creating…" : "Create demand"}</button>
      </form>
      {rows.map((d) => (
        <article className="lot" key={d._id}>
          <h3>
            {d.commodity} · {d.requiredQuantity} KG
          </h3>
          <button
            onClick={() =>
              api.get("/matches/" + d._id).then((x) => setMatches(x.data.data)).catch((x) => setError(x.response?.data?.message || "Could not find matches."))
            }
          >
            Find matches
          </button>
        </article>
      ))}
      {matches.map((m) => (
        <div className="match" key={m.lot?._id || m.matchScore}>
          <b>{m.matchScore}% match</b> — {m.lot.commodity} /{" "}
          {m.lot.remainingQuantity}kg / ₹{m.lot.expectedPrice}
          <p>{m.reasons.map((x) => "✓ " + x).join(" · ")}</p>
        </div>
      ))}
    </section>
  );
}
function Offers() {
  let { user } = useA(),
    [rows, setRows] = useState(null),
    [error, setError] = useState(""),
    load = () => {
      setError("");
      api
        .get("/offers")
        .then((x) => setRows(x.data.data))
        .catch((e) => {
          setRows([]);
          setError(e.response?.data?.message || "Could not load offers");
        });
    };
  useEffect(() => { load(); }, []);
  let accept = async (id) => {
    try {
      await api.patch("/offers/" + id + "/accept");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Offer could not be accepted");
    }
  };
  return (
    <section>
      <p className="eyebrow">NEGOTIATION</p>
      <h1>Offers</h1>
      <p>
        Review price, quantity, buyer reliability and validity before accepting.
      </p>
      {rows === null ? (
        <p>Loading offers…</p>
      ) : error ? (
        <div className="panel error">
          {error}
          <br />
          <button onClick={load}>Try again</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="panel">
          <h3>No offers yet</h3>
          <p>
            Buyer offers will appear here when they are made against your lots.
          </p>
          <Link
            className="primary"
            to={"/" + user.role.toLowerCase() + "/lots"}
          >
            View lots
          </Link>
        </div>
      ) : (
        <div className="lots">
          {rows.map((o) => (
            <article className="lot" key={o._id}>
              <S>{o.status}</S>
              <h3>
                {o.lot?.commodity} · ₹{o.pricePerUnit}/kg
              </h3>
              <p>
                <b>{o.quantity} kg</b> · Total ₹
                {o.totalAmount?.toLocaleString("en-IN")}
              </p>
              <p>Buyer: {o.buyer?.name} · Reliability: 92/100</p>
              <p>{o.message}</p>
              {user.role !== "BUYER" && o.status === "PENDING" && (
                <button className="primary" onClick={() => accept(o._id)}>
                  Accept & create transaction
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
function Transactions() {
  let { user } = useA(), [rows, setRows] = useState(null),
    [error, setError] = useState(""),
    load = () => {
      setError("");
      api
        .get("/transactions")
        .then((x) => setRows(x.data.data))
        .catch((e) => {
          setRows([]);
          setError(e.response?.data?.message || "Could not load transactions");
        });
    };
  useEffect(load, []);
  let update = async (t, status) => {
    try {
      await api.patch("/transactions/" + t._id + "/status", {
        status,
        note: "Updated from AgriLink dashboard",
      });
      if (status === "COMPLETED")
        await api.patch("/payments/" + t._id, { status: "PAID" });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Transaction update failed");
    }
  };
  return (
    <section>
      <p className="eyebrow">TRACEABILITY</p>
      <h1>Transactions</h1>
      <p>
        Follow each agreement from acceptance through logistics, delivery and
        payment.
      </p>
      {rows === null ? (
        <p>Loading transactions…</p>
      ) : error ? (
        <div className="panel error">
          {error}
          <br />
          <button onClick={load}>Try again</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="panel">
          <h3>No active transactions</h3>
          <p>
            Accepting a buyer offer will create a traceable transaction here.
          </p>
        </div>
      ) : (
        rows.map((t) => (
          <div className="panel" key={t._id}>
            <div className="section-head">
              <div>
                <h3>
                  {t.lot?.commodity} · ₹{t.amount?.toLocaleString("en-IN")}
                </h3>
                <S>{t.status}</S>
              </div>
              <select
                value={t.status}
                onChange={(e) => update(t, e.target.value)}
              >
                {[
                  "CREATED",
                  "CONFIRMED",
                  "IN_TRANSIT",
                  "DELIVERED",
                  "COMPLETED",
                  "CANCELLED",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <p>
              {t.quantity} kg · Buyer: {t.buyer?.name} · Seller:{" "}
              {t.seller?.name}
            </p>
            <div className="timeline">
              {t.events?.map((e) => (
                <span key={e._id}>✓ {e.status}</span>
              ))}
            </div>
            {t.status !== "COMPLETED" && t.status !== "CANCELLED" && <Link className="text-action" to={`/${user.role.toLowerCase()}/disputes`}>Raise a dispute ↗</Link>}
          </div>
        ))
      )}
    </section>
  );
}
function FpoAggregation() {
  const [members, setMembers] = useState([]), [farmers, setFarmers] = useState([]), [lots, setLots] = useState([]), [search, setSearch] = useState(""), [selected, setSelected] = useState([]), [price, setPrice] = useState(""), [message, setMessage] = useState(""), [error, setError] = useState("");
  const load = async () => { try { const [m, l] = await Promise.all([api.get("/fpo/members"), api.get("/fpo/lots")]); setMembers(m.data.data); setLots(l.data.data); } catch (e) { setError(e.response?.data?.message || "Could not load FPO members and lots."); } };
  useEffect(() => { load(); }, []);
  const findFarmers = async (value) => { setSearch(value); if (!value.trim()) { setFarmers([]); return; } try { const x = await api.get("/fpo/farmers?search=" + encodeURIComponent(value)); setFarmers(x.data.data); } catch { setFarmers([]); } };
  const addMember = async (id) => { try { await api.post("/fpo/members", { farmerId: id }); setMessage("Farmer added to your FPO."); setSearch(""); setFarmers([]); load(); } catch (e) { setError(e.response?.data?.message || "Could not add farmer."); } };
  const removeMember = async (id) => { await api.delete("/fpo/members/" + id); setMessage("Farmer removed from your FPO."); load(); };
  const toggleLot = (id) => setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  const aggregate = async (event) => { event.preventDefault(); if (selected.length < 2) { setError("Select at least two farmer lots to create an aggregation."); return; } try { await api.post("/fpo/aggregate", { lotIds: selected, expectedPrice: Number(price) }); setMessage("Combined lot published successfully."); setSelected([]); setPrice(""); load(); } catch (e) { setError(e.response?.data?.message || "Could not create aggregate lot."); } };
  return <section><p className="eyebrow">FPO COLLECTIVE SELLING</p><h1>Build your farmer pool</h1><p>Add farmers, select their available produce, and publish one larger lot with stronger market volume.</p>{error && <div className="form-message error">{error}<button onClick={() => setError("")}>Dismiss</button></div>}{message && <div className="form-message success">{message}</div>}<div className="two-col"><div className="panel"><h3>Add farmers to your FPO</h3><p>Search by name, email, or location.</p><input value={search} placeholder="Search farmers" onChange={(e) => findFarmers(e.target.value)} />{farmers.map((farmer) => <div className="member-row" key={farmer._id}><div><b>{farmer.name}</b><small>{farmer.location} · {farmer.primaryCrop || "Crop not set"}</small></div><button className="primary" onClick={() => addMember(farmer._id)}>Add</button></div>)}<h3 className="subheading">Your members ({members.length})</h3>{members.length === 0 ? <p>No farmers added yet.</p> : members.map((member) => <div className="member-row" key={member._id}><div><b>{member.name}</b><small>{member.location} · {member.email}</small></div><button onClick={() => removeMember(member._id)}>Remove</button></div>)}</div><div className="panel"><div className="section-head"><div><h3>Select produce to aggregate</h3><small>{selected.length} lot{selected.length === 1 ? "" : "s"} selected</small></div></div>{lots.length === 0 ? <p>Add farmers with available lots to begin.</p> : lots.map((lot) => <label className={`select-lot ${selected.includes(lot._id) ? "selected" : ""}`} key={lot._id}><input type="checkbox" checked={selected.includes(lot._id)} onChange={() => toggleLot(lot._id)} /><span><b>{lot.commodity} · {lot.remainingQuantity} kg</b><small>{lot.owner?.name} · {lot.location} · {lot.quality?.grade || "Quality pending"}</small></span><strong>₹{lot.expectedPrice}/kg</strong></label>)}<form className="inline-form" onSubmit={aggregate}><input type="number" min="1" placeholder="Blended selling price per kg" value={price} onChange={(e) => setPrice(e.target.value)} required /><button className="primary">Aggregate selected produce</button></form></div></div></section>;
}
function DisputesWorkspace() {
  const { user } = useA(), [rows, setRows] = useState([]), [transactions, setTransactions] = useState([]), [form, setForm] = useState({ transactionId: "", reason: "", description: "" }), [message, setMessage] = useState("");
  const load = () => Promise.all([api.get("/disputes"), api.get("/transactions")]).then(([d, t]) => { setRows(d.data.data); setTransactions(t.data.data); }).catch((e) => setMessage(e.response?.data?.message || "Could not load disputes."));
  useEffect(() => { load(); }, []);
  const submit = async (event) => { event.preventDefault(); try { await api.post("/disputes", form); setMessage("Dispute raised and sent for review."); setForm({ transactionId: "", reason: "", description: "" }); load(); } catch (e) { setMessage(e.response?.data?.message || "Could not raise dispute."); } };
  const resolve = async (id, status) => { try { await api.patch("/disputes/" + id, { status, resolution: status === "RESOLVED" ? "Reviewed and resolved by marketplace administration." : "Dispute closed after review." }); load(); } catch (e) { setMessage(e.response?.data?.message || "Could not update dispute."); } };
  return <section><p className="eyebrow">TRUST & RESOLUTION</p><h1>Dispute management</h1><p>Keep transaction issues documented, visible to the right participants, and resolved by an administrator.</p>{message && <div className="form-message success">{message}</div>}{user.role !== "ADMIN" && <form className="form-card" onSubmit={submit}><div className="form-card-heading"><div><h3>Raise a dispute</h3><p>Choose one of your transactions and describe the issue.</p></div></div><div className="form-grid"><label>Transaction<select value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} required><option value="">Select transaction</option>{transactions.map((t) => <option key={t._id} value={t._id}>{t.lot?.commodity} · ₹{t.amount?.toLocaleString("en-IN")}</option>)}</select></label><label>Reason<input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Quality, payment, delivery..." required /></label></div><label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="4" required /></label><div className="form-actions"><button className="primary">Submit dispute</button></div></form>}<div className="data-list">{rows.length === 0 ? <div className="panel"><h3>No disputes</h3><p>Open issues will appear here.</p></div> : rows.map((d) => <div className="panel" key={d._id}><S>{d.status}</S><h3>{d.reason}</h3><p>{d.description}</p><small>{d.raisedBy?.name} · Transaction: {d.transaction?.lot?.commodity || "Marketplace transaction"}</small>{user.role === "ADMIN" && d.status !== "RESOLVED" && d.status !== "REJECTED" && <div className="form-actions"><button onClick={() => resolve(d._id, "UNDER_REVIEW")}>Start review</button><button className="primary" onClick={() => resolve(d._id, "RESOLVED")}>Resolve</button><button onClick={() => resolve(d._id, "REJECTED")}>Reject</button></div>}{d.resolution && <p><b>Resolution:</b> {d.resolution}</p>}</div>)}</div></section>;
}
function AnalyticsWorkspace() {
  const [data, setData] = useState(null), [error, setError] = useState("");
  useEffect(() => { api.get("/admin/analytics").then((x) => setData(x.data.data)).catch((e) => setError(e.response?.data?.message || "Could not load analytics.")); }, []);
  if (error) return <section><p className="error">{error}</p></section>;
  if (!data) return <section><p>Loading analytics…</p></section>;
  const total = (items) => items.reduce((sum, item) => sum + item.count, 0);
  return <section><p className="eyebrow">PLATFORM INTELLIGENCE</p><h1>Marketplace analytics</h1><p>Operational health across users, inventory, procurement, trades, and payments.</p><div className="grid"><Card a="USERS" b={total(data.users)} c="All registered roles" /><Card a="ACTIVE INVENTORY" b={total(data.lots)} c="Lot records by status" /><Card a="OFFERS" b={total(data.offers)} c="Negotiation activity" /><Card a="TRANSACTIONS" b={total(data.transactions)} c="Trade lifecycle records" /></div><div className="two-col">{[["Users by role", data.users], ["Inventory by status", data.lots], ["Transactions by status", data.transactions], ["Payments by status", data.payments]].map(([title, items]) => <div className="panel" key={title}><h3>{title}</h3>{items.map((item) => <div className="market-row" key={item._id}><b>{item._id}</b><span>{item.count}</span>{item.value !== undefined && <small>Value ₹{Number(item.value || 0).toLocaleString("en-IN")}</small>}</div>)}</div>)}</div></section>;
}
function Operational({ title, type }) {
  let { user } = useA(),
    [rows, setRows] = useState([]),
    [note, setNote] = useState(""),
    [booking, setBooking] = useState(null),
    [bookingMessage, setBookingMessage] = useState(""),
    [bookingHistory, setBookingHistory] = useState([]);
  let endpoint =
    type === "prices"
      ? "/markets/nearby?commodity=Wheat"
      : type === "storage"
        ? "/storage"
        : type === "logistics"
          ? "/logistics/providers"
          : type === "notifications"
            ? "/notifications"
            : type === "demands"
              ? "/demands"
                  : type === "payments"
                    ? "/payments"
                  : type === "disputes"
                    ? "/disputes"
                  : type === "admin" && user.role === "ADMIN"
                    ? "/admin/users"
              : null;
  useEffect(() => {
    if (endpoint)
      api
        .get(endpoint)
        .then((x) => setRows(x.data.data))
        .catch(() => setNote("No records available yet."));
      if (type === "storage" || type === "logistics") api.get(type === "storage" ? "/storage/bookings" : "/logistics/bookings").then((x) => setBookingHistory(x.data.data)).catch(() => {});
  }, [type]);
  const submitBooking = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...booking.form };
      if (type === "storage") {
        payload.warehouseId = booking.id;
        payload.quantity = Number(payload.quantity);
        payload.days = Number(payload.days);
        await api.post("/storage/book", payload);
      } else {
        payload.providerId = booking.id;
        payload.quantity = Number(payload.quantity);
        payload.distanceKm = Number(payload.distanceKm);
        await api.post("/logistics/book", payload);
      }
      setBooking(null);
      setBookingMessage("Booking request created successfully.");
      const history = await api.get(type === "storage" ? "/storage/bookings" : "/logistics/bookings");
      setBookingHistory(history.data.data);
    } catch (e) {
      setBookingMessage(e.response?.data?.message || "Could not create booking.");
    }
  };
  const displayRows = type === "prices"
    ? [...new Map(rows.map((row) => [row.market?._id || row.market?.name, row])).values()]
    : rows;
  if (type === "demands" && user.role === "BUYER") return <Demands />;
  if (type === "aggregation" && user.role === "FPO") return <FpoAggregation />;
  if (type === "disputes") return <DisputesWorkspace />;
  if (type === "analytics" && user.role === "ADMIN") return <AnalyticsWorkspace />;
  if (type === "admin" && user.role === "ADMIN") {
    return <section><p className="eyebrow">ADMINISTRATION</p><h1>{title}</h1><p>Review registered accounts and verification state.</p><div className="data-list">{rows.map((x) => <div className="panel" key={x._id}><S>{x.verification}</S><h3>{x.name}</h3><p>{x.email} · {x.role} · {x.location || "Location not provided"}</p><button onClick={() => api.patch(`/admin/users/${x._id}`, { verification: x.verification === "VERIFIED" ? "PENDING" : "VERIFIED" }).then(() => setRows((current) => current.map((row) => row._id === x._id ? { ...row, verification: row.verification === "VERIFIED" ? "PENDING" : "VERIFIED" } : row)))}>Toggle verification</button></div>)}</div></section>;
  }
  let detail =
    type === "prices"
      ? "Compare current mandi modal prices, arrivals and price range before selling."
      : type === "storage"
        ? "Verified nearby storage options. Booking workflow is ready for provider integration."
        : type === "logistics"
          ? "Available transport providers for pickup and delivery coordination."
          : type === "notifications"
            ? "Offer, transaction, payment and logistics updates appear here."
            : type === "payments"
              ? "Prototype payment tracking — no external payment gateway is used."
              : type === "aggregation"
                ? "Select farmer lots and aggregate them into a larger FPO marketable lot."
                : type === "admin"
                  ? "Manage verification, marketplace governance and analytics from this control centre."
                  : "This workspace module is ready for the next marketplace record.";
  return (
    <section>
      <p className="eyebrow">OPERATIONS</p>
      <h1>{title}</h1>
      <p>{detail}</p>
      {type === "prices" && (
        <div className="panel mandi-rate-chart-panel">
          <MandiRateChart markets={displayRows} title="Latest rates by grain mandi" />
        </div>
      )}
      {type === "prices" && (
        <div className="panel mandi-map-panel">
          <h3>Nearest mandi locations</h3>
          <p>Each pin corresponds to a mandi rate shown in the chart and cards below.</p>
          <MandiMap markets={displayRows} />
        </div>
      )}
      {type === "aggregation" && (
        <div className="panel">
          <h3>FPO aggregation workflow</h3>
          <div className="timeline">
            <span>1. Select farmer produce</span>
            <span>2. Review quality</span>
            <span>3. Aggregate quantity</span>
            <span>4. Publish FPO lot</span>
          </div>
          <Link className="primary" to="/fpo/lots">
            View aggregated lots
          </Link>
        </div>
      )}
      {type === "payments" && (
        <div className="panel">
          <h3>Payment transparency</h3>
          <p>
            Payments are created when an offer becomes a transaction. Status
            transitions are recorded as PENDING → PROCESSING → PAID.
          </p>
          <S>PENDING</S>
        </div>
      )}
      {bookingMessage && <div className="form-message success">{bookingMessage}</div>}
      {(type === "storage" || type === "logistics") && bookingHistory.length > 0 && <div className="panel booking-history"><h3>Your booking history</h3>{bookingHistory.map((item) => <div className="market-row" key={item._id}><b>{type === "storage" ? item.warehouse?.name : item.provider?.name}</b><span>{item.status}</span><small>{item.quantity} kg · ₹{item.estimatedCost?.toLocaleString("en-IN")}</small></div>)}</div>}
      {type === "admin" && (
        <div className="panel">
          <h3>Verification queue</h3>
          <p>
            Farmer, FPO and buyer verifications are represented in the database
            and are accessible only to the administrator role.
          </p>
          <S>ADMIN ONLY</S>
        </div>
      )}
      <div className="data-list">
        {displayRows.map((x) => (
          <div className="panel" key={x._id || x.market?._id || x.market?.name || x.name}>
            {type === "prices" && (
              <>
                <h3>{x.market?.name}</h3>
                <b>₹{x.modalPrice}/kg modal</b>
                <p>
                  Range ₹{x.minPrice}–₹{x.maxPrice} · Arrival {x.arrivalVolume}
                </p>
              </>
            )}
            {type === "storage" && (
              <>
                <h3>{x.name}</h3>
                <p>
                  {x.location} · {x.availableCapacity} kg available
                </p>
                <b>₹{x.pricePerUnitPerDay}/unit/day</b>
                <p>{x.facilities?.join(" · ")}</p>
                <button className="primary" onClick={() => setBooking({ id: x._id, form: { quantity: "100", days: "3" } })}>Book storage</button>
                {booking?.id === x._id && <form className="inline-form" onSubmit={submitBooking}><input type="number" min="1" max={x.availableCapacity} placeholder="Quantity" value={booking.form.quantity} onChange={(e) => setBooking({ ...booking, form: { ...booking.form, quantity: e.target.value } })} required /><input type="number" min="1" placeholder="Days" value={booking.form.days} onChange={(e) => setBooking({ ...booking, form: { ...booking.form, days: e.target.value } })} required /><button className="primary">Confirm booking</button></form>}
              </>
            )}
            {type === "logistics" && (
              <>
                <h3>{x.name}</h3>
                <p>
                  {x.vehicleType} · Capacity {x.capacity} kg
                </p>
                <b>₹{x.pricePerKm}/km</b>
                <p>{x.serviceAreas?.join(" · ")}</p>
                <button className="primary" onClick={() => setBooking({ id: x._id, form: { pickupLocation: user.location || "", deliveryLocation: "", quantity: "100", distanceKm: "20" } })}>Request transport</button>
                {booking?.id === x._id && <form className="inline-form" onSubmit={submitBooking}><input placeholder="Pickup location" value={booking.form.pickupLocation} onChange={(e) => setBooking({ ...booking, form: { ...booking.form, pickupLocation: e.target.value } })} required /><input placeholder="Delivery location" value={booking.form.deliveryLocation} onChange={(e) => setBooking({ ...booking, form: { ...booking.form, deliveryLocation: e.target.value } })} required /><input type="number" min="1" placeholder="Quantity" value={booking.form.quantity} onChange={(e) => setBooking({ ...booking, form: { ...booking.form, quantity: e.target.value } })} required /><input type="number" min="0" placeholder="Distance (km)" value={booking.form.distanceKm} onChange={(e) => setBooking({ ...booking, form: { ...booking.form, distanceKm: e.target.value } })} required /><button className="primary">Confirm request</button></form>}
              </>
            )}
            {type === "notifications" && (
              <>
                <S>{x.type}</S>
                <h3>{x.message}</h3>
                <small>{new Date(x.createdAt).toLocaleString()}</small>
              </>
            )}
            {type === "payments" && x.transaction && (
              <>
                <S>{x.status}</S>
                <h3>{x.transaction.lot?.commodity || "Transaction"} payment</h3>
                <p>₹{x.amount?.toLocaleString("en-IN")} · {x.paymentMethod}</p>
                <small>Transaction status: {x.transaction.status}</small>
              </>
            )}
            {type === "demands" && (
              <>
                <S>{x.status}</S>
                <h3>
                  {x.commodity} · {x.requiredQuantity} kg
                </h3>
                <p>
                  Max ₹{x.maxPrice}/kg · {x.preferredLocation}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
      {note && <p>{note}</p>}
    </section>
  );
}
function DynamicPage() {
  let { misc, r } = useParams(),
    { user } = useA();
  if (misc === "profile")
    return (
      <section>
        <p className="eyebrow">ACCOUNT</p>
        <h1>My profile</h1>
        <div className="two-col">
          <div className="panel">
            <h3>{user.name}</h3>
            <p>
              <b>Role:</b> {user.role}
            </p>
            <p>
              <b>Email:</b> {user.email}
            </p>
            <p>
              <b>Location:</b> {user.location || "Not provided"}
            </p>
            <S>{user.verification || "PENDING VERIFICATION"}</S>
          </div>
          <div className="panel">
            <h3>Trust status</h3>
            <p>
              Your verified profile helps buyers and partners make confident
              decisions.
            </p>
            <Link className="primary" to={"/" + r + "/notifications"}>
              View notifications
            </Link>
          </div>
        </div>
      </section>
    );
  if (misc === "farm")
    return (
      <section>
        <p className="eyebrow">FARM MANAGEMENT</p>
        <h1>My farm</h1>
        <div className="grid">
          <Card
            a="PRIMARY LOCATION"
            b={user.location || "Indore"}
            c="Update through your profile"
          />
          <Card a="ACTIVE PRODUCE" b="Wheat" c="Grade A quality records" />
          <Card
            a="AVAILABLE LOTS"
            b="View lots"
            c="Create and manage inventory"
          />
        </div>
        <div className="panel">
          <h3>Farm inventory</h3>
          <p>
            Lot quantity, harvest date, quality and availability are managed
            from My Lots so every buyer sees consistent information.
          </p>
          <Link className="primary" to={"/" + r + "/lots"}>
            Manage farm lots
          </Link>
        </div>
      </section>
    );
  if (misc === "recommendations" || misc === "matching")
    return <MatchWorkspace />;
  if (misc === "farmers") return <FpoAggregation />;
  return (
    <section>
      <p className="eyebrow">WORKSPACE</p>
      <h1>{misc.replaceAll("-", " ")}</h1>
      <div className="panel">
        <h3>This module is ready</h3>
        <p>
          Use the navigation to access the connected marketplace workflows:
          lots, demands, market prices, offers and transactions.
        </p>
        <Link className="primary" to={"/" + r + "/dashboard"}>
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
function MatchWorkspace() {
  let { user } = useA(),
    [demands, setDemands] = useState([]),
    [matches, setMatches] = useState([]);
  useEffect(() => {
    api
      .get("/demands")
      .then((x) => setDemands(x.data.data))
      .catch(() => {});
  }, []);
  return (
    <section>
      <p className="eyebrow">EXPLAINABLE MATCHING</p>
      <h1>
        {user.role === "BUYER" ? "Recommended lots" : "Demand-to-lot matching"}
      </h1>
      <p>
        Scores use commodity, quantity, quality, location, price and deadline
        criteria—never a black box.
      </p>
      <div className="lots">
        {demands.map((d) => (
          <article className="lot">
            <S>{d.status}</S>
            <h3>
              {d.commodity} · {d.requiredQuantity} kg
            </h3>
            <p>
              Maximum ₹{d.maxPrice}/kg · {d.preferredLocation}
            </p>
            <button
              className="primary"
              onClick={() =>
                api
                  .get("/matches/" + d._id)
                  .then((x) => setMatches(x.data.data))
              }
            >
              Show ranked matches
            </button>
          </article>
        ))}
      </div>
      {matches.map((m) => (
        <div className="match">
          <b>{m.matchScore}% Match</b> {m.lot.commodity} ·{" "}
          {m.lot.remainingQuantity} kg · ₹{m.lot.expectedPrice}/kg
          <p>{m.reasons.map((x) => "✓ " + x).join(" · ")}</p>
        </div>
      ))}
    </section>
  );
}
function App() {
  let [user, setUser] = useState(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    let restore = async () => {
      try {
        if (localStorage.token) {
          let x = await api.get("/auth/me");
          setUser(x.data.data);
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        setReady(true);
      }
    };
    restore();
  }, []);
  let module = (title, type) => (
    <Guard>
      <Operational title={title} type={type} />
    </Guard>
  );
  return (
    <A.Provider
      value={{
        user,
        setUser,
        ready,
        logout: () => {
          localStorage.removeItem("token");
          setUser(null);
        },
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/register/farmer" replace />} />
        <Route path="/register/:role" element={<Login reg />} />
        <Route
          path="/:r"
          element={
            <Guard>
              <RoleDashboardRedirect />
            </Guard>
          }
        />
        <Route
          path="/:r/dashboard"
          element={
            <Guard>
              <Dashboard />
            </Guard>
          }
        />
        <Route
          path="/:r/lots"
          element={
            <Guard>
              <Lots />
            </Guard>
          }
        />
        <Route
          path="/:r/offers"
          element={
            <Guard>
              <Offers />
            </Guard>
          }
        />
        <Route
          path="/:r/transactions"
          element={
            <Guard>
              <Transactions />
            </Guard>
          }
        />
        <Route
          path="/:r/demands"
          element={module("Buyer demands", "demands")}
        />
        <Route
          path="/:r/prices"
          element={module("Market prices & comparison", "prices")}
        />
        <Route
          path="/:r/storage"
          element={module("Storage discovery", "storage")}
        />
        <Route
          path="/:r/logistics"
          element={module("Logistics coordination", "logistics")}
        />
        <Route
          path="/:r/notifications"
          element={module("Notifications", "notifications")}
        />
        <Route
          path="/:r/payments"
          element={module("Payment tracking", "payments")}
        />
        <Route
          path="/:r/aggregation"
          element={module("FPO aggregation", "aggregation")}
        />
        <Route
          path="/:r/users"
          element={module("Users & verification", "admin")}
        />
        <Route
          path="/:r/disputes"
          element={module("Dispute management", "disputes")}
        />
        <Route
          path="/:r/analytics"
          element={module("Marketplace analytics", "analytics")}
        />
        <Route
          path="/:r/:misc"
          element={
            <Guard>
              <DynamicPage />
            </Guard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </A.Provider>
  );
}
createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AppErrorBoundary>,
);
