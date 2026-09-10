import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sprout } from "lucide-react";

export function LandingNavbar({ language, setLanguage }) {
  return (
    <header className="landing-header">
      <nav className="landing-nav">
        <Link to="/" className="landing-brand">
          <span className="brand-icon">
            <Sprout size={20} />
          </span>
          <div className="brand-text">
            <strong>KrishiLink</strong>
            <small>Digital Mandi</small>
          </div>
        </Link>

        <div className="landing-nav-links">
          <a href="#how-it-works">
            {language === "en" ? "How it works" : "प्रक्रिया"}
          </a>
          <a href="#why-krishilink">
            {language === "en" ? "Why KrishiLink" : "KrishiLink क्यों?"}
          </a>
          <a href="#market">
            {language === "en" ? "Live Mandi Rates" : "लाइव मंडी भाव"}
          </a>
          <Link to="/register/farmer">
            {language === "en" ? "For Farmers" : "किसानों के लिए"}
          </Link>
          <Link to="/register/buyer">
            {language === "en" ? "For Buyers" : "खरीदारों के लिए"}
          </Link>
        </div>

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

          <Link to="/login" className="login-link">
            {language === "en" ? "Sign In" : "लॉगिन"}
          </Link>

          <Link className="nav-cta-btn" to="/register">
            {language === "en" ? "Get Started" : "शुरू करें"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default LandingNavbar;
