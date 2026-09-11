import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, TrendingUp, Compass, Building2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export function HeroSection({ language: propLang }) {
  const { language: ctxLang, getLabel } = useLanguage();
  const language = propLang || ctxLang || "en";

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
            {getLabel(
              "PAN-INDIA DIGITAL AGRI MARKETPLACE",
              "राष्ट्रीय डिजिटल कृषि बाजार",
              "अखिल भारतीय डिजिटल कृषी बाजार"
            )}
          </span>
          <i />
          <span>{getLabel("18+ STATES CONNECTED", "18+ राज्य जुड़े", "१८+ राज्ये जोडलेली")}</span>
        </div>

        <h1>
          {language === "mr" ? (
            <>
              भारतीय शेतकरी आणि पडताळणी झालेले खरेदीदार यांचे <em>राष्ट्रीय डिजिटल मार्केटप्लेस.</em>
            </>
          ) : language === "hi" ? (
            <>
              भारतीय किसानों और खरीदारों का <em>राष्ट्रीय डिजिटल बाजार.</em>
            </>
          ) : (
            <>
              Connecting Indian Farmers & Verified Buyers <em>Across the Nation.</em>
            </>
          )}
        </h1>

        <p className="market-lede">
          {getLabel(
            "Discover transparent daily prices across 500+ APMC mandis, connect directly with institutional millers and traders, and trade with Krishi Kendra quality certification and secured escrow settlements.",
            "500+ APMC मंडियों के पारदर्शी भाव देखें, सीधे संस्थागत मिलर्स व व्यापारियों से जुड़ें, और कृषि केंद्र गुणवत्ता प्रमाणन व सुरक्षित बैंक एस्क्रो के साथ व्यापार करें।",
            "५००+ कृषी उत्पन्न बाजार समित्यांचे पारदर्शक दैनिक दर पहा, थेट गिरणीधारक व व्यापाऱ्यांशी संपर्क साधा आणि कृषी केंद्र गुणवत्ता तपासणी व सुरक्षित बँक एस्क्रो पेमेंटसह व्यापार करा."
          )}
        </p>

        <div className="hero-actions">
          <Link className="hero-btn-primary" to="/register/farmer">
            <span>{getLabel("Sell Produce (Farmer / FPO)", "फसल बेचें (किसान / FPO)", "शेतमाल विका (शेतकरी / FPO)")}</span>
            <ArrowRight size={17} />
          </Link>

          <button
            type="button"
            className="hero-btn-secondary"
            onClick={() => scrollToSection("buyer-demands")}
          >
            <Compass size={17} />
            <span>{getLabel("View Live Buyer Demands", "खरीदार मांग देखें", "खरेदीदारांची थेट मागणी पहा")}</span>
          </button>
        </div>

        <div className="market-stats">
          <div className="stat-box">
            <b>₹2,580</b>
            <span>
              {getLabel("National modal rate", "राष्ट्रीय औसत भाव", "राष्ट्रीय सरासरी दर")}
            </span>
          </div>

          <div className="stat-box">
            <b>18+</b>
            <span>
              {getLabel("States covered", "शामिल राज्य", "समाविष्ट राज्ये")}
            </span>
          </div>

          <div className="stat-box">
            <b>520+</b>
            <span>
              {getLabel("APMC Mandis", "जुड़ी मंडियां", "बाजार समित्या")}
            </span>
          </div>

          <div className="stat-box">
            <b>48,000+ qtl</b>
            <span>
              {getLabel("Daily volume", "दैनिक व्यापार", "दैनंदिन उलाढाल")}
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
          <span>{getLabel("Krishi Kendra Quality Certified & Moisture Tested", "कृषि केंद्र गुणवत्ता प्रमाणित व नमी परीक्षित", "कृषी केंद्र गुणवत्ता प्रमाणित आणि आर्द्रता तपासणी")}</span>
        </div>

        <div className="terminal-price-section">
          <div className="terminal-price-left">
            <div className="commodity-name-tag">
              <span>🌾</span>
              <strong>{getLabel("Sharbati Wheat (Grade A)", "शरबती गेहूं (ग्रेड A)", "शरबती गहू (दर्जा A)")}</strong>
            </div>
            <div className="price-number-row">
              <span className="currency">₹</span>
              <span className="main-price">2,580</span>
              <span className="unit">/ {getLabel("quintal", "क्विंटल", "क्विंटल")}</span>
            </div>
          </div>

          <div className="terminal-price-change-pill">
            <TrendingUp size={15} />
            <span>+2.14% {getLabel("Today", "आज", "आज")}</span>
          </div>
        </div>

        {/* Crisp Sparkline */}
        <div className="terminal-sparkline-clean">
          <div className="sparkline-header-clean">
            <span>{getLabel("24-HOUR INTER-MANDI PRICE SPREAD", "24-घंटे मंडी भाव प्रसार", "२४-तास बाजारभाव फरक")}</span>
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
            <small>{getLabel("INSTITUTIONAL BIDS", "संस्थागत बोलियां", "संस्थागत खरेदी बोली")}</small>
            <b>₹2,575 / qtl</b>
            <span>{getLabel("24 verified buyers", "24 सत्यापित खरीदार", "२४ पडताळणी झालेले खरेदीदार")}</span>
          </div>

          <div className="terminal-depth-card">
            <small>{getLabel("FARMER SUPPLY", "किसान आपूर्ति", "शेतकरी शेतमाल पुरवठा")}</small>
            <b>142 {getLabel("Lots", "लॉट्स", "लॉट्स")}</b>
            <span>{getLabel("Available across 6 states", "6 राज्यों में उपलब्ध", "६ राज्यांमध्ये उपलब्ध")}</span>
          </div>

          <div className="terminal-depth-card">
            <small>{getLabel("TODAY'S TRADED", "आज का व्यापार", "आजचा व्यापार")}</small>
            <b>48,250 qtl</b>
            <span className="text-green">+14.2% {getLabel("week-on-week", "साप्ताहिक बढ़त", "साप्ताहिक वाढ")}</span>
          </div>
        </div>

        <div className="terminal-footer-action">
          <button
            type="button"
            className="terminal-link-btn"
            onClick={() => scrollToSection("market-prices")}
          >
            <span>{getLabel("Compare prices across Punjab, MP, Maharashtra & Gujarat →", "पंजाब, एमपी, महाराष्ट्र और गुजरात के भाव तुलना करें →", "पंजाब, मध्य प्रदेश, महाराष्ट्र आणि गुजरातच्या बाजारभावाची तुलना करा →")}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
