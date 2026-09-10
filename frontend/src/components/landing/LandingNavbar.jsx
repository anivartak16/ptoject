import React from "react";
import { Link } from "react-router-dom";

export function LandingNavbar({ language, setLanguage }) {
  return (
    <nav className="landing-nav">
      <Link to="/" className="landing-brand">
        <span>🌾</span>
        <strong>AgriLink</strong>
        <small>Digital Mandi</small>
      </Link>

      <div className="landing-nav-links">
        <a href="#how-it-works">
          {language === "en" ? "How it works" : "कैसे काम करता है"}
        </a>
        <a href="#why-agrilink">
          {language === "en" ? "Why AgriLink" : "AgriLink क्यों?"}
        </a>
        <a href="#market">{language === "en" ? "Market" : "बाजार"}</a>
        <Link to="/register/farmer">
          {language === "en" ? "For farmers" : "किसानों के लिए"}
        </Link>
        <Link to="/register/buyer">
          {language === "en" ? "For buyers" : "खरीदारों के लिए"}
        </Link>
      </div>

      <div className="landing-nav-actions">
        <div className="language-switch">
          <button
            className={language === "en" ? "active" : ""}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
          <button
            className={language === "hi" ? "active" : ""}
            onClick={() => setLanguage("hi")}
          >
            हिंदी
          </button>
        </div>

        <Link to="/login" className="login-link">
          {language === "en" ? "Login" : "लॉगिन"}
        </Link>

        <Link className="primary" to="/register">
          {language === "en" ? "Get started" : "शुरू करें"}
        </Link>
      </div>
    </nav>
  );
}

export default LandingNavbar;
