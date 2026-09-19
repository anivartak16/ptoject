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
          <p className="eyebrow">
            {language === "mr" ? "अखिल भारतीय शेतमाल दर सूची" : language === "hi" ? "अखिल भारतीय कमोडिटी बेंचमार्क" : "PAN-INDIA COMMODITY BENCHMARK"}
          </p>
          <h2>
            {language === "mr"
              ? "१८+ राज्यांमधील बाजार समित्यांचे थेट भाव"
              : language === "hi"
              ? "18+ राज्यों की मंडियों के वास्तविक भाव"
              : "Real-Time Mandi Rates Across 18+ States"}
          </h2>
          <p>
            {language === "mr"
              ? "प्रमुख उत्पादक राज्यांमधील बाजार समिती भाव, दैनंदिन चढ-उतार आणि सक्रिय खरेदीदारांच्या बोल्या पाहण्यासाठी कोणत्याही पिकावर क्लिक करा."
              : language === "hi"
              ? "किसी भी फसल पर क्लिक करें और प्रमुख उत्पादक राज्यों की मंडियों के भाव व सक्रिय खरीदार देखें।"
              : "Select any commodity to view major producing state mandis, daily price movements, and active buyer bids."}
          </p>
        </div>

        <div className="market-index-clean">
          <span className="live-dot" />
          <span>{language === "mr" ? "राष्ट्रीय एपीएमसी थेट डेटा" : language === "hi" ? "राष्ट्रीय APMC डेटा फीड" : "NATIONAL APMC DATA FEED"}</span>
        </div>
      </div>

      {/* STAT SUMMARY BAR */}
      <div className="market-summary-clean">
        <div className="summary-clean-card">
          <small>{language === "mr" ? "प्रमुख शेतमाल" : language === "hi" ? "प्रमुख फसलें" : "MAJOR COMMODITIES"}</small>
          <strong>8 {language === "mr" ? "प्रमुख पिके" : language === "hi" ? "प्रमुख फसलें" : "Key Crops"}</strong>
        </div>
        <div className="summary-clean-card">
          <small>{language === "mr" ? "आजची सरासरी वाढ" : language === "hi" ? "आज की औसत वृद्धि" : "AVERAGE GAIN TODAY"}</small>
          <strong className="text-green">+2.18%</strong>
        </div>
        <div className="summary-clean-card">
          <small>{language === "mr" ? "सर्वाधिक मागणी" : language === "hi" ? "सर्वाधिक मांग" : "HIGHEST DEMAND"}</small>
          <strong>🌶️ {language === "mr" ? "गुंटूर मिरची" : language === "hi" ? "गुंटूर मिर्च" : "Guntur Chilli"}</strong>
        </div>
        <div className="summary-clean-card">
          <small>{language === "mr" ? "राष्ट्रीय आवक" : language === "hi" ? "राष्ट्रीय व्यापार" : "NATIONAL VOLUMES"}</small>
          <strong>1,42,800 qtl</strong>
        </div>
      </div>

      {/* CROP MATRIX */}
      <div className="agri-price-table-clean">
        <div className="agri-clean-header">
          <span>{language === "mr" ? "शेतमाल आणि उत्पादक राज्ये" : language === "hi" ? "फसल और उत्पादक राज्य" : "COMMODITY & PRODUCING STATES"}</span>
          <span>{language === "mr" ? "दर / क्विंटल" : language === "hi" ? "भाव / क्विंटल" : "PRICE / QTL"}</span>
          <span>{language === "mr" ? "२४-तास बदल" : language === "hi" ? "24 घंटे परिवर्तन" : "24H CHANGE"}</span>
          <span>{language === "mr" ? "बाजार मागणी" : language === "hi" ? "बाजार मांग" : "MARKET DEMAND"}</span>
          <span>{language === "mr" ? "प्रमुख प्रादेशिक बाजार समित्या" : language === "hi" ? "प्रमुख क्षेत्रीय मंडियां" : "TOP REGIONAL MANDIS"}</span>
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
            <p>{language === "mr" ? "प्रमुख केंद्रे" : language === "hi" ? "प्रमुख केंद्र" : "Major hubs"}: {activeCrop.mandis}</p>
          </div>
        </div>

        <div className="detail-right">
          <div className="detail-bid-box">
            <small>{language === "mr" ? "सर्वोच्च संस्थागत बोलीदार" : language === "hi" ? "शीर्ष संस्थागत बोलीदाता" : "TOP INSTITUTIONAL BIDDER"}</small>
            <b>{activeCrop.bestBid}</b>
          </div>

          <button
            type="button"
            className="detail-action-btn"
            onClick={scrollToDemands}
          >
            <span>{language === "mr" ? "सर्व खरेदीदार मागण्या पहा" : language === "hi" ? "सभी खरीदार मांगें देखें" : "View All Buyer Demands"}</span>
            <ArrowDown size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default CropPriceTable;
