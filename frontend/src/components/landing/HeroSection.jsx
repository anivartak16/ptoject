import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, TrendingUp, Compass, Building2 } from "lucide-react";

export function HeroSection({ language }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="market-hero">
      <div className="market-hero-copy">
        <div className="market-kicker">
          <span className="live-dot" />
          <span className="kicker-flag">🇮🇳</span>
          <span className="kicker-title">
            {language === "en"
              ? "PAN-INDIA DIGITAL AGRI MARKETPLACE"
              : "राष्ट्रीय डिजिटल कृषि बाजार"}
          </span>
          <i />
          <span>18+ STATES CONNECTED</span>
        </div>

        <h1>
          {language === "en" ? (
            <>
              Connecting Indian Farmers & Verified Buyers <em>Across the Nation.</em>
            </>
          ) : (
            <>
              भारतीय किसानों और खरीदारों का <em>राष्ट्रीय डिजिटल बाजार.</em>
            </>
          )}
        </h1>

        <p className="market-lede">
          {language === "en"
            ? "Discover transparent daily prices across 500+ APMC mandis, connect directly with institutional millers and traders, and trade with Krishi Kendra quality certification and secured escrow settlements."
            : "500+ APMC मंडियों के पारदर्शी भाव देखें, सीधे संस्थागत मिलर्स व व्यापारियों से जुड़ें, और कृषि केंद्र गुणवत्ता प्रमाणन व सुरक्षित बैंक एस्क्रो के साथ व्यापार करें।"}
        </p>

        <div className="hero-actions">
          <Link className="hero-btn-primary" to="/register/farmer">
            <span>{language === "en" ? "Sell Produce (Farmer / FPO)" : "फसल बेचें (किसान / FPO)"}</span>
            <ArrowRight size={17} />
          </Link>

          <button
            type="button"
            className="hero-btn-secondary"
            onClick={() => scrollToSection("buyer-demands")}
          >
            <Compass size={17} />
            <span>{language === "en" ? "View Live Buyer Demands" : "खरीदार मांग देखें"}</span>
          </button>
        </div>

        <div className="market-stats">
          <div className="stat-box">
            <b>₹2,580</b>
            <span>
              {language === "en"
                ? "National modal rate"
                : "राष्ट्रीय औसत भाव"}
            </span>
          </div>

          <div className="stat-box">
            <b>18+</b>
            <span>
              {language === "en" ? "States covered" : "शामिल राज्य"}
            </span>
          </div>

          <div className="stat-box">
            <b>520+</b>
            <span>
              {language === "en" ? "APMC Mandis" : "जुड़ी मंडियां"}
            </span>
          </div>

          <div className="stat-box">
            <b>48,000+ qtl</b>
            <span>
              {language === "en" ? "Daily volume" : "दैनिक व्यापार"}
            </span>
          </div>
        </div>
      </div>

      {/* MODERN LIGHT MARKET TERMINAL */}
      <div className="market-terminal-clean">
        <div className="terminal-top">
          <div className="terminal-live-badge">
            <i className="live-dot" />
            <span>NATIONAL AGRI DESK · LIVE FEED</span>
          </div>
          <span className="terminal-location-badge">PAN-INDIA BENCHMARK</span>
        </div>

        <div className="terminal-quality-banner">
          <CheckCircle2 size={16} />
          <span>Krishi Kendra Quality Certified & Moisture Tested</span>
        </div>

        <div className="terminal-price-section">
          <div className="terminal-price-left">
            <div className="commodity-name-tag">
              <span>🌾</span>
              <strong>Sharbati Wheat (Grade A)</strong>
            </div>
            <div className="price-number-row">
              <span className="currency">₹</span>
              <span className="main-price">2,580</span>
              <span className="unit">/ quintal</span>
            </div>
          </div>

          <div className="terminal-price-change-pill">
            <TrendingUp size={15} />
            <span>+2.14% Today</span>
          </div>
        </div>

        {/* Crisp Sparkline */}
        <div className="terminal-sparkline-clean">
          <div className="sparkline-header-clean">
            <span>24-HOUR INTER-MANDI PRICE SPREAD</span>
            <b>HIGH ₹2,610 · LOW ₹2,520</b>
          </div>
          <svg
            className="terminal-svg-clean"
            viewBox="0 0 360 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cleanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M0,48 C35,46 60,52 90,38 C120,24 150,34 180,22 C210,12 240,26 270,16 C300,6 330,12 360,8 L360,65 L0,65 Z"
              fill="url(#cleanGrad)"
            />
            <path
              d="M0,48 C35,46 60,52 90,38 C120,24 150,34 180,22 C210,12 240,26 270,16 C300,6 330,12 360,8"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="360" cy="8" r="4.5" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
          </svg>
        </div>

        <div className="terminal-depth-grid">
          <div className="terminal-depth-card">
            <small>INSTITUTIONAL BIDS</small>
            <b>₹2,575 / qtl</b>
            <span>24 verified buyers</span>
          </div>

          <div className="terminal-depth-card">
            <small>FARMER SUPPLY</small>
            <b>142 Lots</b>
            <span>Available across 6 states</span>
          </div>

          <div className="terminal-depth-card">
            <small>TODAY'S TRADED</small>
            <b>48,250 qtl</b>
            <span className="text-green">+14.2% week-on-week</span>
          </div>
        </div>

        <div className="terminal-footer-action">
          <button
            type="button"
            className="terminal-link-btn"
            onClick={() => scrollToSection("market-prices")}
          >
            <span>Compare prices across Punjab, MP, Maharashtra & Gujarat →</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
