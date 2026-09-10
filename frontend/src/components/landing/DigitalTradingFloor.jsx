import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export function DigitalTradingFloor({ language }) {
  return (
    <section className="market-board">
      <div className="order-floor">
        <div className="floor-intro">
          <p className="eyebrow">DIGITAL ORDER BOOK & MATCHING</p>
          <h2>
            {language === "en"
              ? "From Mandi Arrival to Instant Market Match."
              : "मंडी आवक से सीधा त्वरित मार्केट मैच।"}
          </h2>
          <p>
            {language === "en"
              ? "KrishiLink mirrors physical mandi trading onto a transparent digital order book. Compare live procurement offers, see verified grain demand, and lock orders with guaranteed settlement."
              : "KrishiLink पारंपरिक मंडी व्यापार को एक पारदर्शी डिजिटल ऑर्डर बुक में बदलता है। खरीदारों के लाइव ऑफर्स देखें और सुरक्षित भुगतान के साथ ऑर्डर मैच करें।"}
          </p>

          <div className="floor-highlights">
            <div className="floor-hl-item">
              <CheckCircle2 size={16} />
              <span>{language === "en" ? "Real-time buyer demand tracking" : "सत्यापित खरीदार मांग की रीयल-टाइम ट्रैकिंग"}</span>
            </div>
            <div className="floor-hl-item">
              <CheckCircle2 size={16} />
              <span>{language === "en" ? "Transparent lot-by-lot price discovery" : "प्रति क्विंटल पारदर्शी मूल्य निर्धारण"}</span>
            </div>
          </div>
        </div>

        <div className="order-card">
          <div className="order-card-top">
            <div className="order-top-left">
              <span className="live-dot" />
              <b>SHARBATI WHEAT · LIVE ORDER BOOK</b>
            </div>
            <span className="order-live-tag">ACTIVE MATCHING</span>
          </div>

          <div className="order-row order-head">
            <span>BUYER / ENTERPRISE</span>
            <span>BID PRICE</span>
            <span>VOLUME</span>
            <span>STATUS</span>
          </div>

          <div className="order-row">
            <div className="order-buyer-col">
              <strong>ABC Foods Ltd.</strong>
              <small>Indore Hub</small>
            </div>
            <b className="order-price">₹2,560/qtl</b>
            <span>120 qtl</span>
            <span className="order-badge active">Active Bid</span>
          </div>

          <div className="order-row">
            <div className="order-buyer-col">
              <strong>Malwa Agro Processing</strong>
              <small>Mandsaur</small>
            </div>
            <b className="order-price">₹2,548/qtl</b>
            <span>80 qtl</span>
            <span className="order-badge active">Active Bid</span>
          </div>

          <div className="order-row">
            <div className="order-buyer-col">
              <strong>Central Flour Mills</strong>
              <small>Bhopal</small>
            </div>
            <b className="order-price">₹2,540/qtl</b>
            <span>150 qtl</span>
            <span className="order-badge active">Active Bid</span>
          </div>

          <div className="order-footer">
            <span>3 verified demands waiting for supply match</span>
            <Link to="/register/buyer" className="order-join-link">
              <span>{language === "en" ? "Place Your Demand" : "अपनी मांग रखें"}</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DigitalTradingFloor;
