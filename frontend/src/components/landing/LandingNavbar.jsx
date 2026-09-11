import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sprout, LayoutDashboard, Shield } from "lucide-react";
import { useAuth, getDashboardPath } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export function LandingNavbar({ language: propLang, setLanguage: propSetLang }) {
  const { user } = useAuth();
  const langContext = useLanguage();
  const language = propLang || langContext?.language || "en";
  const setLanguage = propSetLang || langContext?.setLanguage;

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getLabel = (en, hi, mr) => {
    if (language === "mr") return mr || hi;
    if (language === "hi") return hi;
    return en;
  };

  return (
    <header className="landing-header">
      <nav className="landing-nav">
        {/* Brand */}
        <Link to="/" className="landing-brand">
          <span className="brand-icon">
            <Sprout size={22} />
          </span>
          <div className="brand-text">
            <div className="brand-title-wrap">
              <strong>KrishiLink</strong>
              <span className="pan-india-badge">PAN-INDIA</span>
            </div>
            <small>National Digital Mandi Network</small>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="landing-nav-links">
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
              हिन्दी
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
      </nav>
    </header>
  );
}

export default LandingNavbar;

