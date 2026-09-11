import React, { useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { Menu, X, LogOut, Globe } from "lucide-react";

export function Shell({ children }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { r: routeRole } = useParams();
  const r = routeRole || user?.role?.toLowerCase().replaceAll("_", "-") || "farmer";
  const workspaceRole = r.toUpperCase().replaceAll("-", "_");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate("/", { replace: true });
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
            [t("dashboard", "Dashboard"), "dashboard", "◫"],
            [t("marketPrediction", "Market Prediction"), "predictions", "📈"],
            [t("buyerDemands", "Buyer demands"), "demands", "⌁"],
            [t("browseLots", "Browse lots"), "lots", "▦"],
            [t("recommendations", "Recommended lots"), "recommendations", "✦"],
            [t("offers", "Offers"), "offers", "↔"],
            [t("transactions", "Transactions"), "transactions", "✓"],
            [t("payments", "Payments & Escrow"), "payments", "₹"],
            [t("logistics", "Logistics"), "logistics", "⌁"],
            [t("notifications", "Notifications"), "notifications", "●"],
          ]
        : workspaceRole === "FPO"
          ? [
              [t("dashboard", "Dashboard"), "dashboard", "◫"],
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
              [t("myProfile", "My profile"), "profile", "◉"],
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
      [t("inspectionDesk", "Inspection Desk"), "inspections", "✓"],
      [t("myLots", "Market Lots"), "lots", "▦"],
      [t("myProfile", "KVK Profile"), "profile", "👤"],
      [t("notifications", "Notifications"), "notifications", "●"],
    ];
  }

  return (
    <div className="app-shell">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={mobileMenuOpen ? "mobile-open" : ""}>
        <div className="sidebar-brand-row">
          <Link className="brand" to="/" onClick={() => setMobileMenuOpen(false)}>
            🌾 <span>KrishiLink</span>
          </Link>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-card">
          <span className="workspace-role">{workspaceRole}</span>
          <b>
            {workspaceRole === "FPO"
              ? "FPO collective workspace"
              : user?.name}
          </b>
          <small>{user?.district ? `${user.district}, ` : ""}{user?.state || "National Network"}</small>
        </div>

        <p className="side-label">WORKSPACE</p>
        <div className="side-nav-items">
          {items.map(([label, key, icon]) => (
            <NavLink
              key={key}
              className={({ isActive }) =>
                "side-link" + (isActive ? " active" : "")
              }
              to={"/" + r + "/" + key}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

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
            <div className="user-intro">
              <small>Signed in as</small>
              <b>{user?.name}</b>
              <small className="user-workspace-tag"> · {workspaceRole}</small>
            </div>
          </div>

          <div className="header-right">
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
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}

export default Shell;