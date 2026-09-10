import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sprout, LayoutDashboard, Shield } from "lucide-react";
import { useAuth, getDashboardPath } from "../../context/AuthContext.jsx";

export function LandingNavbar({ language, setLanguage }) {
  const { user } = useAuth();

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

        {/* Navigation Links with Generous Spacing */}
        <div className="landing-nav-links">
          <a
            href="#market-prices"
            onClick={(e) => scrollToSection(e, "market-prices")}
          >
            {language === "en" ? "Mandi Rates" : "मंडी भाव"}
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, "how-it-works")}
          >
            {language === "en" ? "How It Works" : "कार्यप्रणाली"}
          </a>
          <a
            href="#buyer-demands"
            onClick={(e) => scrollToSection(e, "buyer-demands")}
          >
            {language === "en" ? "Buyer Demands" : "खरीदार मांग"}
          </a>
          <a
            href="#mandi-network"
            onClick={(e) => scrollToSection(e, "mandi-network")}
          >
            {language === "en" ? "Mandi Network" : "मंडी नेटवर्क"}
          </a>
          <a
            href="#stakeholders"
            onClick={(e) => scrollToSection(e, "stakeholders")}
          >
            {language === "en" ? "Stakeholders" : "भागीदार"}
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
          </div>

          <Link to="/admin/login" className="admin-nav-btn" title="Admin Portal">
            <Shield size={14} />
            <span>{language === "en" ? "Admin" : "एडमिन"}</span>
          </Link>

          {user ? (
            <Link to={getDashboardPath(user.role)} className="nav-cta-btn">
              <LayoutDashboard size={15} />
              <span>{language === "en" ? "My Dashboard" : "मेरा डैशबोर्ड"}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="login-link">
                {language === "en" ? "Sign In" : "लॉगिन"}
              </Link>
              <Link className="nav-cta-btn" to="/register/farmer">
                <span>{language === "en" ? "Get Started" : "शुरू करें"}</span>
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
