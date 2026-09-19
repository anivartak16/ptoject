import React, { useState } from "react";
import { Link, NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { Menu, Globe, LogOut } from "lucide-react";

export function Shell({ children }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { r: routeRole } = useParams();
  const r = routeRole || user?.role?.toLowerCase().replaceAll("_", "-") || "farmer";
  const workspaceRole = r.toUpperCase().replaceAll("-", "_");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  const getNavLabel = (key, defaultLabel) => {
    const keyMap = {
      dashboard: "nav.dashboard",
      "market-sync": "nav.dailyPriceSync",
      users: "nav.users",
      prices: "nav.marketPrices",
      predictions: "nav.marketPrediction",
      disputes: "nav.disputes",
      analytics: "nav.analytics",
      profile: "nav.myProfile",
      demands: "nav.buyerDemands",
      lots: workspaceRole === "BUYER" ? "nav.browseLots" : workspaceRole === "KRISHI_KENDRA" ? "nav.marketLots" : "nav.myLots",
      recommendations: "nav.recommendedLots",
      offers: "nav.offers",
      transactions: "nav.transactions",
      payments: "nav.payments",
      logistics: "nav.logistics",
      notifications: "nav.notifications",
      farmers: "nav.farmers",
      aggregation: "nav.aggregation",
      matching: "matching.title",
      storage: "nav.storage",
      farm: "nav.myFarm",
      inspections: "nav.inspectionDesk",
    };
    return t(keyMap[key] || defaultLabel, defaultLabel);
  };

  let items =
    workspaceRole === "ADMIN"
      ? [
          [t("dashboard", "Dashboard"), "dashboard", "◫"],
          [t("dailyPriceSync", "Daily Price Sync"), "market-sync", "🔄"],
          [t("users", "Users"), "users", "◉"],
          [t("disputes", "Disputes"), "disputes", "!"],
          [t("analytics", "Analytics"), "analytics", "⌁"],
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
              [t("dashboard", "Dashboard"), "dashboard", "◫"],
              [t("fpoProfile", "FPO Leader & Aggregation"), "profile", "🏛️"],
              [t("farmers", "Farmers"), "farmers", "◉"],
              [t("aggregatedLots", "Aggregated lots"), "lots", "▦"],
              [t("aggregation", "Aggregation"), "aggregation", "⊞"],
              [t("marketPrices", "Market prices"), "prices", "↗"],
              [t("marketPrediction", "Market Prediction"), "predictions", "📈"],
              [t("matching", "Matching"), "matching", "✦"],
              [t("offers", "Offers"), "offers", "↔"],
              [t("transactions", "Transactions"), "transactions", "✓"],
              [t("logistics", "Logistics"), "logistics", "⌁"],
              [t("storage", "Storage"), "storage", "□"],
              [t("payments", "Payments & Escrow"), "payments", "₹"],
              [t("notifications", "Notifications"), "notifications", "●"],
            ]
          : [
              [t("dashboard", "Dashboard"), "dashboard", "◫"],
              [t("farmerProfile", "Farmer profile & e-KYC"), "profile", "🛡️"],
              [t("myFarm", "My farm"), "farm", "⌂"],
              [t("myLots", "My lots"), "lots", "▦"],
              [t("marketPrices", "Market prices"), "prices", "↗"],
              [t("marketPrediction", "Market Prediction"), "predictions", "📈"],
              [t("buyerDemands", "Buyer demands"), "demands", "⌁"],
              [t("offers", "Offers"), "offers", "↔"],
              [t("transactions", "Transactions"), "transactions", "✓"],
              [t("logistics", "Logistics"), "logistics", "⌁"],
              [t("storage", "Storage"), "storage", "□"],
              [t("payments", "Payments & Escrow"), "payments", "₹"],
              [t("notifications", "Notifications"), "notifications", "●"],
              [t("disputes", "Disputes"), "disputes", "!"],
            ];

  if (workspaceRole === "KRISHI_KENDRA") {
    items = [
      [t("dashboard", "Dashboard"), "dashboard", "◫"],
      [t("inspectionDesk", "Inspection Desk"), "inspections", "✓"],
      [t("myLots", "Market Lots"), "lots", "▦"],
      [t("myProfile", "KVK Profile"), "profile", "👤"],
      [t("notifications", "Notifications"), "notifications", "●"],
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
              ? (user?.organizationName || "FPO collective workspace")
              : workspaceRole === "BUYER"
              ? (user?.organizationName || user?.name || "Institutional Buyer")
              : user?.name}
          </b>
          <small>{user?.district ? `${user.district}, ` : ""}{user?.state || "National Network"}</small>
          <Link
            to={`/${r}/profile`}
            className="sidebar-profile-action-btn"
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "12px",
              padding: "6px 10px",
              borderRadius: "6px",
              background: "#ffffff",
              color: "#166534",
              fontWeight: 700,
              textDecoration: "none",
              border: "1px solid #bbf7d0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <span>👤</span>
            <span>{workspaceRole === "BUYER" ? "Buyer Profile" : workspaceRole === "FPO" ? "FPO Leader & Aggregation" : "Farmer Profile & e-KYC"} →</span>
          </Link>
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
        <header className="shell-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <Link
              to={`/${r}/profile`}
              title="Open My Profile"
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            >
              <div className="user-intro" style={{ cursor: "pointer" }}>
                <small>Signed in as 👤 <span style={{ textDecoration: "underline", color: "#166534" }}>View Profile</span></small>
                <b>{user?.name}</b>
                <small className="user-workspace-tag"> · {workspaceRole}</small>
              </div>
            </Link>
          </div>

          <div className="header-right">
            {/* Direct Profile Button in Header */}
            {(() => {
              const isProfileActive = location.pathname.endsWith("/profile");
              return (
                <Link
                  to={`/${r}/profile`}
                  className={`header-direct-profile-btn ${isProfileActive ? "active" : ""}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    background: isProfileActive ? "#15803d" : "#f0fdf4",
                    border: isProfileActive ? "1px solid #166534" : "1px solid #86efac",
                    color: isProfileActive ? "#ffffff" : "#166534",
                    fontWeight: 700,
                    fontSize: "13px",
                    textDecoration: "none",
                    boxShadow: isProfileActive ? "0 2px 4px rgba(21, 128, 61, 0.25)" : "0 1px 2px rgba(22, 101, 52, 0.08)",
                    transition: "all 0.15s ease",
                  }}
                  title="Open My Profile"
                >
                  <span>{workspaceRole === "BUYER" ? "🏢" : workspaceRole === "FPO" ? "🏛️" : "👤"}</span>
                  <span>{workspaceRole === "BUYER" ? "Buyer Profile" : workspaceRole === "FPO" ? "FPO Leader" : "My Profile"}</span>
                  {isProfileActive && <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.25)", padding: "1px 5px", borderRadius: "10px" }}>Active</span>}
                </Link>
              );
            })()}

            {/* Multilingual Switcher */}
            <div className="shell-lang-switcher">
              <Globe size={15} color="var(--muted)" />
              <div className="lang-chips">
                <button
                  type="button"
                  className={language === "en" ? "active" : ""}
                  onClick={() => setLanguage("en")}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={language === "hi" ? "active" : ""}
                  onClick={() => setLanguage("hi")}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  className={language === "mr" ? "active" : ""}
                  onClick={() => setLanguage("mr")}
                >
                  मराठी
                </button>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="signout-btn"
              title={t("signOut", "Sign out")}
            >
              <LogOut size={15} />
              <span>{t("signOut", "Sign out")}</span>
            </button>
          </div>
          <button onClick={handleSignOut} className="signout-btn">Sign out</button>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}

export default Shell;
