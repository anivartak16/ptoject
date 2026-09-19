import React from "react";
import { ArrowDown, ChevronRight } from "lucide-react";

const panIndiaMarketRows = [
  {
    name: "Khanna Mandi",
    state: "Punjab",
    crop: "Wheat",
    price: "₹2,590",
    change: "+2.1%",
    volume: "420 qtl",
  },
  {
    name: "Indore Mandi",
    state: "Madhya Pradesh",
    crop: "Soybean",
    price: "₹4,650",
    change: "+1.8%",
    volume: "680 qtl",
  },
  {
    name: "Nashik Mandi",
    state: "Maharashtra",
    crop: "Onion",
    price: "₹2,820",
    change: "+3.4%",
    volume: "940 qtl",
  },
  {
    name: "Guntur Mandi",
    state: "Andhra Pradesh",
    crop: "Chilli",
    price: "₹8,450",
    change: "+4.2%",
    volume: "310 qtl",
  },
];

export function LivePriceTape({ language = "en" }) {
  const scrollToTable = () => {
    const el = document.getElementById("market-prices");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="market-board" id="market-tape">
      <div className="board-heading">
        <div>
          <p className="eyebrow">
            {language === "mr" ? "राष्ट्रीय बाजार समिती थेट भाव सूची" : language === "hi" ? "राष्ट्रीय मंडी भाव टेप" : "NATIONAL MANDI PRICE TAPE"}
          </p>
          <h2>
            {language === "mr"
              ? "भारतातील प्रमुख कृषी केंद्रांमधील थेट भाव व आवक"
              : language === "hi"
              ? "प्रमुख भारतीय मंडियों के लाइव भाव व आवक"
              : "Live Benchmarks Across Major Indian Agricultural Hubs"}
          </h2>
          <p className="board-sub">
            {language === "mr"
              ? "राज्य कृषी उत्पन्न बाजार समित्यांकडून थेट प्राप्त झालेले अधिकृत सरासरी दर आणि आवक आकडेवारी."
              : language === "hi"
              ? "राज्य कृषि उपज मंडियों से सीधे रिपोर्ट किए गए वास्तविक मॉडल भाव व आवक आंकड़े।"
              : "Real-time modal arrivals and rate changes reported directly from state APMCs."}
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToTable}
          className="board-action-btn"
        >
          <span>
            {language === "mr" ? "संपूर्ण भाव तक्ता पहा" : language === "hi" ? "विस्तृत भाव तालिका देखें" : "Explore Full Price Matrix"}
          </span>
          <ArrowDown size={15} />
        </button>
      </div>

      <div className="rate-tape">
        {panIndiaMarketRows.map((item) => (
          <article key={item.name} className="tape-item" onClick={scrollToTable} role="button" tabIndex={0}>
            <div className="tape-header">
              <span className="status-dot" />
              <div>
                <b>{item.name}</b>
                <span className="tape-state-tag">{item.state}</span>
              </div>
            </div>

            <div className="tape-commodity-row">
              <span>{item.crop}</span>
              <strong className="tape-price">{item.price}</strong>
            </div>

            <div className="tape-meta">
              <span className="up">▲ {item.change}</span>
              <small>{item.volume} {language === "mr" ? "आवक" : language === "hi" ? "आवक" : "arrivals"}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LivePriceTape;
