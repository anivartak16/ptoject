import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CheckCircle2, TrendingUp } from "lucide-react";

export function HeroSection({ language }) {
  return (
    <section className="market-hero">
      <div className="market-hero-copy">
        <div className="market-kicker">
          <span className="live-dot" />
          <span>{language === "en" ? "LIVE DIGITAL MANDI" : "लाइव डिजिटल मंडी"}</span>
          <i />
          <span>WHEAT · MADHYA PRADESH</span>
        </div>

        <h1>
          {language === "en" ? (
            <>
              The mandi,
              <em> online.</em>
            </>
          ) : (
            <>
              मंडी अब,
              <em> ऑनलाइन.</em>
            </>
          )}
        </h1>

        <p className="market-lede">
          {language === "en"
            ? "Connecting farmers and verified buyers across Madhya Pradesh. Direct open-market rates, Krishi Kendra quality testing, and guaranteed escrow settlements."
            : "मध्य प्रदेश भर के किसानों और सत्यापित खरीदारों को जोड़ने वाला डिजिटल मंच। खुली मंडी भाव, कृषि केंद्र पर गुणवत्ता जांच और सुरक्षित भुगतान।"}
        </p>

        <div className="hero-actions">
          <Link className="hero-btn-primary" to="/register/farmer">
            <span>{language === "en" ? "Sell your produce" : "अपनी फसल बेचें"}</span>
            <ArrowRight size={18} />
          </Link>

          <Link className="hero-btn-secondary" to="/register/buyer">
            <span>{language === "en" ? "Find market supply" : "फसल की खरीद करें"}</span>
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="market-stats">
          <div className="stat-box">
            <b>₹2,558</b>
            <span>
              {language === "en"
                ? "Wheat modal price"
                : "गेहूं की modal कीमत"}
            </span>
          </div>

          <div className="stat-box">
            <b className="up">+1.97%</b>
            <span>
              {language === "en" ? "30-day movement" : "30 दिन का बदलाव"}
            </span>
          </div>

          <div className="stat-box">
            <b>10+</b>
            <span>
              {language === "en" ? "Mandis connected" : "जुड़ी हुई मंडियां"}
            </span>
          </div>

          <div className="stat-box">
            <b>1,840+ qtl</b>
            <span>
              {language === "en" ? "Traded volume" : "दैनिक व्यापार"}
            </span>
          </div>
        </div>
      </div>

      {/* MARKET TERMINAL */}
      <div className="market-terminal">
        <div className="terminal-top">
          <div className="terminal-live-badge">
            <i className="live-dot" />
            <span>KRISHILINK AGRI-TERMINAL</span>
          </div>
          <small className="terminal-timestamp">LIVE · MP MANDI FEED</small>
        </div>

        <div className="terminal-quality-banner">
          <CheckCircle2 size={15} />
          <span>Krishi Kendra Grade A Certified Lot</span>
        </div>

        <div className="terminal-price">
          <div className="terminal-price-left">
            <small>SHARBATI WHEAT / QTL</small>
            <strong>₹2,558.00</strong>
          </div>
          <div className="terminal-price-change">
            <TrendingUp size={16} />
            <span>▲ ₹49.40 (+1.97%)</span>
          </div>
        </div>

        <div className="terminal-sparkline-wrap">
          <div className="sparkline-header">
            <span>24H PRICE TRAIL</span>
            <b>HIGH ₹2,565 · LOW ₹2,510</b>
          </div>
          <svg
            className="terminal-svg-sparkline"
            viewBox="0 0 340 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M0,52 C30,48 50,56 80,44 C110,32 130,40 160,28 C190,16 220,30 250,18 C280,6 310,14 340,8 L340,70 L0,70 Z"
              fill="url(#chartGrad)"
            />
            <path
              d="M0,52 C30,48 50,56 80,44 C110,32 130,40 160,28 C190,16 220,30 250,18 C280,6 310,14 340,8"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="340" cy="8" r="4.5" fill="#86efac" stroke="#166534" strokeWidth="2" />
          </svg>
        </div>

        <div className="terminal-grid">
          <div className="terminal-metric">
            <small>BEST BUYER BID</small>
            <b>₹2,550</b>
            <span>18 active buyers</span>
          </div>

          <div className="terminal-metric">
            <small>BEST FARMER ASK</small>
            <b>₹2,558</b>
            <span>6 certified lots</span>
          </div>

          <div className="terminal-metric">
            <small>TODAY'S VOLUME</small>
            <b>1,842 qtl</b>
            <span className="metric-highlight">+12.4% inflow</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
