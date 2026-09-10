import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const defaultMarketRows = [
  ["Indore Mandi", "₹2,450", "+1.8%", "130 qtl"],
  ["Neemuch Mandi", "₹2,540", "+2.4%", "250 qtl"],
  ["Mandsaur Mandi", "₹2,522", "+1.9%", "226 qtl"],
  ["Bhopal Mandi", "₹2,504", "+1.5%", "202 qtl"],
];

export function LivePriceTape({ language = "en", marketRows = defaultMarketRows }) {
  const rows = marketRows?.length ? marketRows : defaultMarketRows;

  return (
    <section className="market-board" id="market">
      <div className="board-heading">
        <div>
          <p className="eyebrow">LIVE MANDI PRICE TAPE</p>
          <h2>
            {language === "en"
              ? "Live Mandi Arrivals & Benchmarks"
              : "लाइव मंडी भाव व आवक"}
          </h2>
          <p className="board-sub">
            {language === "en"
              ? "Real-time modal prices and volume movements across major grain hubs in MP."
              : "मध्य प्रदेश की प्रमुख कृषि उपज मंडियों के वास्तविक भाव व दैनिक आवक।"}
          </p>
        </div>

        <Link to="/register/farmer" className="board-link-action">
          <span>{language === "en" ? "Compare all mandis" : "सभी मंडियों की तुलना करें"}</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="rate-tape">
        {rows.map(([name, price, change, volume]) => (
          <article key={name} className="tape-item">
            <div className="tape-header">
              <span className="status-dot" />
              <b>{name}</b>
            </div>

            <strong className="tape-price">{price}</strong>

            <div className="tape-meta">
              <span className="up">▲ {change}</span>
              <small>{volume} arrivals</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LivePriceTape;
