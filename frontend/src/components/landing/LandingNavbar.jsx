import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sprout, LayoutDashboard, Shield, Menu, X, Globe } from "lucide-react";
import { useAuth, getDashboardPath } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export function LandingNavbar({ language: propLanguage, setLanguage: propSetLanguage }) {
  const { user } = useAuth();
  const { language: ctxLanguage, setLanguage: ctxSetLanguage, t, getLabel: ctxGetLabel } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const language = propLanguage || ctxLanguage || "en";
  const setLanguage = propSetLanguage || ctxSetLanguage;

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getLabel = (en, hi, mr) => {
    if (ctxGetLabel) return ctxGetLabel(en, hi, mr);
    if (language === "mr") return mr || hi;
    if (language === "hi") return hi;
    return en;
  };

  return (
    <header className="landing-header">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="landing-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav className="landing-nav">
        {/* Brand */}
        <Link to="/" className="landing-brand" onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-icon">
            <Sprout size={22} />
          </span>
          <div className="brand-text">
            <div className="brand-title-wrap">
              <strong>{t("brand.name", "KrishiLink")}</strong>
              <span className="pan-india-badge">{t("brand.badge", "PAN-INDIA")}</span>
            </div>
            <small>{t("brand.subtitle", "National Digital Mandi Network")}</small>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="landing-nav-links desktop-only">
          <a
            href="#market-prices"
            onClick={(e) => scrollToSection(e, "market-prices")}
          >
            {getLabel("Mandi Rates", "मंडी भाव", "बाजार भाव")}
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, "how-it-works")}
          >
            {getLabel("How It Works", "कार्यप्रणाली", "कार्यपद्धती")}
          </a>
          <a
            href="#buyer-demands"
            onClick={(e) => scrollToSection(e, "buyer-demands")}
          >
            {getLabel("Buyer Demands", "खरीदार मांग", "खरेदीदार मागणी")}
          </a>
          <a
            href="#mandi-network"
            onClick={(e) => scrollToSection(e, "mandi-network")}
          >
            {getLabel("Mandi Network", "मंडी नेटवर्क", "बाजार समिती नेटवर्क")}
          </a>
          <a
            href="#stakeholders"
            onClick={(e) => scrollToSection(e, "stakeholders")}
          >
            {getLabel("Stakeholders", "भागीदार", "भागीदार घटक")}
          </a>
        </div>

        {/* Actions (Language Toggle & Auth) */}
        <div className="landing-nav-actions">
          <div className="language-switch">
            <button
              type="button"
              className={language === "en" ? "active" : ""}
              onClick={() => setLanguage("en")}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              type="button"
              className={language === "hi" ? "active" : ""}
              onClick={() => setLanguage("hi")}
              aria-label="Switch to Hindi"
            >
              हिंदी
            </button>
            <button
              type="button"
              className={language === "mr" ? "active" : ""}
              onClick={() => setLanguage("mr")}
              aria-label="Switch to Marathi"
            >
              मराठी
            </button>
          </div>

          <Link to="/admin/login" className="admin-nav-btn" title="Admin Portal">
            <Shield size={14} />
            <span>{getLabel("Admin", "एडमिन", "प्रशासक")}</span>
          </Link>

          {user ? (
            <Link to={getDashboardPath(user.role)} className="nav-cta-btn">
              <LayoutDashboard size={15} />
              <span>{getLabel("My Dashboard", "मेरा डैशबोर्ड", "माझे डॅशबोर्ड")}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="login-link">
                {getLabel("Sign In", "लॉगिन", "लॉगिन")}
              </Link>
              <Link className="nav-cta-btn" to="/register/farmer">
                <span>{getLabel("Get Started", "शुरू करें", "सुरुवात करा")}</span>
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Right Controls: Compact Lang + Hamburger */}
        <div className="landing-mobile-controls">
          <div className="language-switch compact">
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
              HI
            </button>
            <button
              type="button"
              className={language === "mr" ? "active" : ""}
              onClick={() => setLanguage("mr")}
            >
              MR
            </button>
          </div>

          <button
            type="button"
            className="landing-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-down Drawer */}
      <div className={`landing-mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-links">
          <a
            href="#market-prices"
            onClick={(e) => scrollToSection(e, "market-prices")}
          >
            📊 {getLabel("Mandi Rates", "मंडी भाव", "बाजार भाव")}
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, "how-it-works")}
          >
            ⚙️ {getLabel("How It Works", "कार्यप्रणाली", "कार्यपद्धती")}
          </a>
          <a
            href="#buyer-demands"
            onClick={(e) => scrollToSection(e, "buyer-demands")}
          >
            🏪 {getLabel("Buyer Demands", "खरीदार मांग", "खरेदीदार मागणी")}
          </a>
          <a
            href="#mandi-network"
            onClick={(e) => scrollToSection(e, "mandi-network")}
          >
            🌾 {getLabel("Mandi Network", "मंडी नेटवर्क", "बाजार समिती नेटवर्क")}
          </a>
          <a
            href="#stakeholders"
            onClick={(e) => scrollToSection(e, "stakeholders")}
          >
            👥 {getLabel("Stakeholders", "भागीदार", "भागीदार घटक")}
          </a>
          <Link
            to="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
          >
            🛡️ {getLabel("Admin Portal", "एडमिन पोर्टल", "प्रशासक पोर्टल")}
          </Link>
        </div>

        <div className="drawer-actions">
          {user ? (
            <Link
              to={getDashboardPath(user.role)}
              className="drawer-cta primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard size={16} />
              <span>{getLabel("Open My Dashboard", "मेरा डैशबोर्ड खोलें", "माझे डॅशबोर्ड उघडा")}</span>
            </Link>
          ) : (
            <div className="drawer-auth-buttons">
              <Link
                to="/login"
                className="drawer-login secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {getLabel("Sign In", "लॉगिन करें", "लॉगिन करा")}
              </Link>
              <Link
                to="/register/farmer"
                className="drawer-cta primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{getLabel("Get Started", "शुरू करें", "सुरुवात करा")}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default LandingNavbar;
