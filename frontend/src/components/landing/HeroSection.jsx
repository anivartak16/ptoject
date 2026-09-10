import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function HeroSection({ language }) {
  return (
    <section className="market-hero">
      <div className="market-hero-copy">
        <div className="market-kicker">
          <span className="live-dot" />
          MARKET OPEN
          <i />
          WHEAT · MADHYA PRADESH
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
            ? "A digital trading network where farmers bring supply, buyers place demand, and every lot moves with a visible price, quality and delivery trail."
            : "एक डिजिटल trading network जहां किसान अपनी फसल लाते हैं, खरीदार demand रखते हैं और हर lot की कीमत, quality और delivery दिखाई देती है।"}
        </p>

        <div className="hero-actions">
          <Link className="primary" to="/register/farmer">
            {language === "en" ? "Sell your produce" : "अपनी फसल बेचें"}
            <ArrowRight size={17} />
          </Link>

          <Link className="text-action" to="/register/buyer">
            {language === "en" ? "Find market supply" : "फसल खोजें"}
            <span>↗</span>
          </Link>
        </div>

        <div className="market-stats">
          <div>
            <b>₹2,558</b>
            <span>
              {language === "en"
                ? "Wheat modal price"
                : "गेहूं की modal कीमत"}
            </span>
          </div>

          <div>
            <b className="up">+1.97%</b>
            <span>
              {language === "en" ? "30-day movement" : "30 दिन का बदलाव"}
            </span>
          </div>

          <div>
            <b>10</b>
            <span>
              {language === "en" ? "Mandis connected" : "जुड़ी हुई मंडियां"}
            </span>
          </div>
        </div>
      </div>

      {/* MARKET TERMINAL */}
      <div className="market-terminal">
        <div className="terminal-top">
          <span>
            <i className="live-dot" />
            LIVE MARKET
          </span>
          <small>09 SEP 2026 · 14:32 IST</small>
        </div>

        <div className="terminal-price">
          <small>WHEAT / KG</small>
          <strong>₹2,558.00</strong>
          <span>
            ▲ 49.40 <b>(+1.97%)</b>
          </span>
        </div>

        <div className="mini-chart">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <b>LIVE</b>
        </div>

        <div className="terminal-grid">
          <div>
            <small>BEST BID</small>
            <b>₹2,550</b>
            <span>18 buyers</span>
          </div>

          <div>
            <small>BEST ASK</small>
            <b>₹2,558</b>
            <span>6 lots</span>
          </div>

          <div>
            <small>TRADED TODAY</small>
            <b>1,842 qtl</b>
            <span>+12.4%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
