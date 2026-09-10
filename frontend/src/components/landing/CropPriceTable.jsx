import React, { useState } from "react";
import { ArrowDown, CheckCircle2, ChevronRight, TrendingUp } from "lucide-react";

const panIndiaCrops = [
  {
    id: "wheat",
    name: "Wheat (Sharbati / Lokwan)",
    states: "Madhya Pradesh, Punjab, Haryana",
    category: "Cereal Grain",
    emoji: "🌾",
    price: "₹2,580/qtl",
    change: "+2.14%",
    trend: "up",
    demand: "HIGH",
    mandis: "Khanna (₹2,590), Indore (₹2,575), Kota (₹2,560)",
    bestBid: "₹2,575 (ITC Agri Business)",
  },
  {
    id: "rice",
    name: "Basmati Paddy (1121)",
    states: "Haryana, Punjab, Western UP",
    category: "Grain",
    emoji: "🌾",
    price: "₹3,920/qtl",
    change: "+3.80%",
    trend: "up",
    demand: "VERY HIGH",
    mandis: "Karnal (₹3,940), Amritsar (₹3,910), Taraori (₹3,950)",
    bestBid: "₹3,930 (KRBL World)",
  },
  {
    id: "soybean",
    name: "Soybean (Yellow)",
    states: "Madhya Pradesh, Maharashtra, Rajasthan",
    category: "Oilseed",
    emoji: "🌱",
    price: "₹4,650/qtl",
    change: "+1.85%",
    trend: "up",
    demand: "HIGH",
    mandis: "Indore (₹4,650), Latur (₹4,620), Ujjain (₹4,640)",
    bestBid: "₹4,640 (Adani Wilmar)",
  },
  {
    id: "cotton",
    name: "Cotton (Shankar-6)",
    states: "Gujarat, Maharashtra, Telangana",
    category: "Fiber Crop",
    emoji: "☁️",
    price: "₹7,100/qtl",
    change: "+2.40%",
    trend: "up",
    demand: "HIGH",
    mandis: "Rajkot (₹7,120), Kadi (₹7,090), Warangal (₹7,080)",
    bestBid: "₹7,100 (Vardhman Textiles)",
  },
  {
    id: "mustard",
    name: "Mustard Seed (Sarson)",
    states: "Rajasthan, Haryana, Madhya Pradesh",
    category: "Oilseed",
    emoji: "🌼",
    price: "₹5,480/qtl",
    change: "+1.50%",
    trend: "up",
    demand: "MEDIUM",
    mandis: "Bharatpur (₹5,500), Jaipur (₹5,470), Alwar (₹5,490)",
    bestBid: "₹5,475 (Patanjali Agro)",
  },
  {
    id: "onion",
    name: "Nashik Red Onion",
    states: "Maharashtra, Karnataka, Gujarat",
    category: "Horticulture",
    emoji: "🧅",
    price: "₹2,820/qtl",
    change: "+3.42%",
    trend: "up",
    demand: "HIGH",
    mandis: "Lasalgaon (₹2,850), Pimpalgaon (₹2,820), Pune (₹2,800)",
    bestBid: "₹2,840 (Reliance Fresh Retail)",
  },
  {
    id: "chilli",
    name: "Guntur Red Chilli (Teja)",
    states: "Andhra Pradesh, Telangana, Karnataka",
    category: "Spice",
    emoji: "🌶️",
    price: "₹8,450/qtl",
    change: "+4.20%",
    trend: "up",
    demand: "VERY HIGH",
    mandis: "Guntur (₹8,450), Khammam (₹8,400), Byadgi (₹8,380)",
    bestBid: "₹8,420 (Everest Spices Ltd)",
  },
  {
    id: "maize",
    name: "Yellow Maize (Poultry Feed)",
    states: "Karnataka, Bihar, Andhra Pradesh",
    category: "Coarse Grain",
    emoji: "🌽",
    price: "₹2,180/qtl",
    change: "-0.42%",
    trend: "down",
    demand: "MEDIUM",
    mandis: "Davangere (₹2,200), Gulabbagh (₹2,170), Chhindwara (₹2,180)",
    bestBid: "₹2,175 (Cargill India Feed)",
  },
];

export function CropPriceTable({ language = "en" }) {
  const [selectedCropId, setSelectedCropId] = useState("wheat");

  const scrollToDemands = () => {
    const el = document.getElementById("buyer-demands");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeCrop = panIndiaCrops.find((c) => c.id === selectedCropId) || panIndiaCrops[0];

  return (
    <section className="agri-market-board" id="market-prices">
      <div className="agri-market-heading">
        <div>
          <p className="eyebrow">PAN-INDIA COMMODITY BENCHMARK</p>
          <h2>
            {language === "en"
              ? "Real-Time Mandi Rates Across 18+ States"
              : "18+ राज्यों की मंडियों के वास्तविक भाव"}
          </h2>
          <p>
            {language === "en"
              ? "Select any commodity to view major producing state mandis, daily price movements, and active buyer bids."
              : "किसी भी फसल पर क्लिक करें और प्रमुख उत्पादक राज्यों की मंडियों के भाव व सक्रिय खरीदार देखें।"}
          </p>
        </div>

        <div className="market-index-clean">
          <span className="live-dot" />
          <span>NATIONAL APMC DATA FEED</span>
        </div>
      </div>

      {/* STAT SUMMARY BAR */}
      <div className="market-summary-clean">
        <div className="summary-clean-card">
          <small>MAJOR COMMODITIES</small>
          <strong>8 Key Crops</strong>
        </div>
        <div className="summary-clean-card">
          <small>AVERAGE GAIN TODAY</small>
          <strong className="text-green">+2.18%</strong>
        </div>
        <div className="summary-clean-card">
          <small>HIGHEST DEMAND</small>
          <strong>🌶️ Guntur Chilli</strong>
        </div>
        <div className="summary-clean-card">
          <small>NATIONAL VOLUMES</small>
          <strong>1,42,800 qtl</strong>
        </div>
      </div>

      {/* CROP MATRIX */}
      <div className="agri-price-table-clean">
        <div className="agri-clean-header">
          <span>COMMODITY & PRODUCING STATES</span>
          <span>PRICE / QTL</span>
          <span>24H CHANGE</span>
          <span>MARKET DEMAND</span>
          <span>TOP REGIONAL MANDIS</span>
        </div>

        {panIndiaCrops.map((crop) => {
          const isSelected = crop.id === selectedCropId;
          return (
            <div
              key={crop.id}
              className={`agri-clean-row ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedCropId(crop.id)}
              role="button"
              tabIndex={0}
            >
              <div className="crop-col-main">
                <span className="crop-emoji">{crop.emoji}</span>
                <div>
                  <strong>{crop.name}</strong>
                  <small>{crop.states}</small>
                </div>
              </div>

              <div className="crop-price-col">
                <strong>{crop.price}</strong>
              </div>

              <div className="crop-change-col">
                <span className={crop.trend === "up" ? "text-green" : "text-red"}>
                  {crop.trend === "up" ? "▲" : "▼"} {crop.change}
                </span>
              </div>

              <div className="crop-demand-col">
                <span className={`demand-pill ${crop.demand.toLowerCase().replace(" ", "-")}`}>
                  {crop.demand}
                </span>
              </div>

              <div className="crop-mandis-col">
                <span>{crop.mandis}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* INTERACTIVE DETAILS CARD FOR SELECTED CROP */}
      <div className="selected-crop-detail-card">
        <div className="detail-left">
          <span className="detail-emoji">{activeCrop.emoji}</span>
          <div>
            <h4>{activeCrop.name}</h4>
            <p>Major hubs: {activeCrop.mandis}</p>
          </div>
        </div>

        <div className="detail-right">
          <div className="detail-bid-box">
            <small>TOP INSTITUTIONAL BIDDER</small>
            <b>{activeCrop.bestBid}</b>
          </div>

          <button
            type="button"
            className="detail-action-btn"
            onClick={scrollToDemands}
          >
            <span>View All Buyer Demands</span>
            <ArrowDown size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default CropPriceTable;
