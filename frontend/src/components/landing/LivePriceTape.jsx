import React from "react";
import { Link } from "react-router-dom";

export function LivePriceTape({ language, marketRows }) {
  return (
    <section className="market-board" id="market">
      <div className="board-heading">
        <div>
          <p className="eyebrow">LIVE PRICE TAPE</p>
          <h2>
            {language === "en"
              ? "What is trading near you"
              : "आपके पास क्या भाव चल रहा है"}
          </h2>
        </div>

        <Link to="/register/farmer">
          {language === "en" ? "View all mandis" : "सभी मंडियां देखें"} ↗
        </Link>
      </div>

      <div className="rate-tape">
        {marketRows.map(([name, price, change, volume]) => (
          <article key={name}>
            <div>
              <span className="status-dot" />
              <b>{name}</b>
            </div>

            <strong>{price}</strong>

            <span className="up">▲ {change}</span>

            <small>{volume} arrivals</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LivePriceTape;
