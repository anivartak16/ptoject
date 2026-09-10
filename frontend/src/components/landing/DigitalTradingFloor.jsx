import React from "react";
import { Link } from "react-router-dom";

export function DigitalTradingFloor({ language }) {
  return (
    <section className="market-board">
      <div className="order-floor">
        <div className="floor-intro">
          <p className="eyebrow">THE DIGITAL TRADING FLOOR</p>
          <h2>
            {language === "en"
              ? "From mandi arrival to market match."
              : "मंडी arrival से market match तक।"}
          </h2>
          <p>
            {language === "en"
              ? "AgriLink brings the working parts of offline trade into one visible flow: discover a rate, list a lot, match a buyer and coordinate the handoff."
              : "AgriLink offline trade की जरूरी प्रक्रियाओं को एक visible digital flow में लाता है।"}
          </p>
        </div>

        <div className="order-card">
          <div className="order-card-top">
            <b>WHEAT · ORDER FLOW</b>
            <span>LIVE</span>
          </div>

          <div className="order-row order-head">
            <span>BUYERS</span>
            <span>PRICE</span>
            <span>LOTS</span>
          </div>

          <div className="order-row">
            <span>ABC Foods</span>
            <b>₹2,560</b>
            <span>12</span>
          </div>

          <div className="order-row">
            <span>Malwa Traders</span>
            <b>₹2,548</b>
            <span>8</span>
          </div>

          <div className="order-row">
            <span>Indore FPO</span>
            <b>₹2,540</b>
            <span>5</span>
          </div>

          <div className="order-footer">
            <span>3 active demands</span>
            <Link to="/register/buyer">Join the book ↗</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DigitalTradingFloor;
