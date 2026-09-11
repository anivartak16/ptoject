import React from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export function Shell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { r: routeRole } = useParams();
  const r = routeRole || user?.role?.toLowerCase().replaceAll("_", "-") || "farmer";
  const workspaceRole = r.toUpperCase().replaceAll("-", "_");

  const handleSignOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  let items =
    workspaceRole === "ADMIN"
      ? [
          ["Dashboard", "dashboard", "◫"],
          ["Daily Price Sync", "market-sync", "🔄"],
          ["Users", "users", "◉"],
          ["Market activity", "prices", "↗"],
          ["Market Prediction", "predictions", "📈"],
          ["Disputes", "disputes", "!"],
          ["Analytics", "analytics", "⌁"],
        ]
      : workspaceRole === "BUYER"
        ? [
            ["Dashboard", "dashboard", "◫"],
            ["Market Prediction", "predictions", "📈"],
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
              ["Market Prediction", "predictions", "📈"],
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
              ["Market Prediction", "predictions", "📈"],
              ["Buyer demands", "demands", "⌁"],
              ["Offers", "offers", "↔"],
              ["Transactions", "transactions", "✓"],
              ["Logistics", "logistics", "⌁"],
              ["Storage", "storage", "□"],
              ["Payments", "payments", "₹"],
              ["Notifications", "notifications", "●"],
              ["Disputes", "disputes", "!"],
            ];

  if (workspaceRole === "KRISHI_KENDRA") {
    items = [
      ["Inspection Desk", "inspections", "✓"],
      ["Market Lots", "lots", "▦"],
      ["KVK Profile", "profile", "👤"],
      ["Notifications", "notifications", "●"],
    ];
  }

  return (
    <div className="app-shell">
      <aside>
        <Link className="brand" to="/">
          🌾 <span>KrishiLink</span>
        </Link>
        <div className="workspace-card">
          <span className="workspace-role">{workspaceRole}</span>
          <b>
            {workspaceRole === "FPO"
              ? "FPO collective workspace"
              : user?.name}
          </b>
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
            <b>{user?.name}</b>
            <small> · {workspaceRole} workspace</small>
          </div>
          <button onClick={handleSignOut} className="signout-btn">Sign out</button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

export default Shell;