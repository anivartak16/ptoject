import React from "react";
import { ArrowDown, Globe2, MapPin, Award, CheckCircle2 } from "lucide-react";

const panIndiaMandis = [
  {
    rank: "1",
    name: "Khanna Mandi",
    state: "Punjab",
    highlight: "Asia's Largest Grain Market",
    commodity: "Wheat & Paddy",
    rate: "₹2,590",
    change: "+2.1%",
    tag: "TOP LIQUIDITY",
  },
  {
    rank: "2",
    name: "Indore Mandi",
    state: "Madhya Pradesh",
    highlight: "Central India Agri Gateway",
    commodity: "Soybean & Sharbati",
    rate: "₹4,650",
    change: "+1.8%",
    tag: "HIGH DEMAND",
  },
  {
    rank: "3",
    name: "Lasalgaon Mandi",
    state: "Maharashtra",
    highlight: "Asia's Premier Onion Hub",
    commodity: "Red Onion & Grapes",
    rate: "₹2,850",
    change: "+3.4%",
    tag: "ACTIVE INFLOW",
  },
  {
    rank: "4",
    name: "Guntur Mandi",
    state: "Andhra Pradesh",
    highlight: "National Spice Trading Terminal",
    commodity: "Red Chilli & Turmeric",
    rate: "₹8,450",
    change: "+4.2%",
    tag: "RECORD GAIN",
  },
  {
    rank: "5",
    name: "Rajkot Mandi",
    state: "Gujarat",
    highlight: "Western Cotton & Oilseed Hub",
    commodity: "Cotton & Groundnut",
    rate: "₹7,120",
    change: "+2.4%",
    tag: "STEADY TRADING",
  },
];

export function BestMandiSection({ language = "en" }) {
  const scrollToTable = () => {
    const el = document.getElementById("market-prices");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="mandi-section-clean" id="mandi-network">
      <div className="section-intro">
        <p className="eyebrow">PAN-INDIA MANDI BENCHMARKING</p>
        <h2>
          {language === "en"
            ? "Discover India's Highest Paying Agricultural Mandis"
            : "देश की सबसे बेहतर दाम देने वाली मंडियों की खोज"}
        </h2>
        <p>
          {language === "en"
            ? "Stop depending on local village traders. Compare real-time arrival prices across major terminal mandis nationwide."
            : "स्थानीय व्यापारियों पर निर्भर न रहें। देश भर की प्रमुख टर्मिनल मंडियों के वास्तविक भावों की तुलना करें।"}
        </p>
      </div>

      <div className="mandi-grid-clean">
        <div className="mandi-cards-stack">
          {panIndiaMandis.map((mandi) => (
            <div className="mandi-item-clean" key={mandi.name} onClick={scrollToTable} role="button" tabIndex={0}>
              <div className="mandi-rank-pill">#{mandi.rank}</div>

              <div className="mandi-details">
                <div className="mandi-title-row">
                  <h3>{mandi.name}</h3>
                  <span className="mandi-state-pill">
                    <MapPin size={12} />
                    {mandi.state}
                  </span>
                </div>
                <p className="mandi-subtitle">{mandi.highlight} · <b>{mandi.commodity}</b></p>
              </div>

              <div className="mandi-rate-col">
                <strong className="mandi-clean-rate">{mandi.rate}</strong>
                <span className="text-green">{mandi.change}</span>
              </div>

              <div className="mandi-badge-col">
                <span className="mandi-status-tag">{mandi.tag}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Informative Side Card */}
        <div className="mandi-network-summary-card">
          <div className="network-card-icon">
            <Globe2 size={40} />
          </div>
          <h3>
            {language === "en"
              ? "Inter-Mandi Price Arbitrage"
              : "अंतर-मंडी मूल्य लाभ"}
          </h3>
          <p>
            {language === "en"
              ? "Prices for the same grain can vary up to 15% between districts. KrishiLink shows where buyers are paying peak rates, helping farmers coordinate transport for higher realization."
              : "एक ही फसल की कीमत अलग-अलग मंडियों में 15% तक भिन्न हो सकती है। KrishiLink आपको दिखाता है कि अधिकतम भाव कहाँ मिल रहा है।"}
          </p>

          <div className="network-points">
            <div>
              <CheckCircle2 size={16} />
              <span>520+ APMC Mandis Connected</span>
            </div>
            <div>
              <CheckCircle2 size={16} />
              <span>Direct Farmgate Doorstep Pickup</span>
            </div>
            <div>
              <CheckCircle2 size={16} />
              <span>e-NAM Protocol Aligned Quality Specs</span>
            </div>
          </div>

          <button
            type="button"
            className="network-action-btn"
            onClick={scrollToTable}
          >
            <span>Compare Today's Mandi Spreads</span>
            <ArrowDown size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default BestMandiSection;
