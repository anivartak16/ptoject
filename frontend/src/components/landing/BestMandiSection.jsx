import React from "react";
import { Link } from "react-router-dom";
import { Globe2, MapPin } from "lucide-react";

export function BestMandiSection({ language, marketRows }) {
  return (
    <section className="enhanced-section mandi-section">
      <div className="section-intro">
        <p className="eyebrow">MARKET DISCOVERY</p>
        <h2>
          {language === "en"
            ? "Find the best mandi for your crop"
            : "अपनी फसल के लिए सबसे अच्छी मंडी खोजें"}
        </h2>
        <p>
          {language === "en"
            ? "Compare nearby market prices instead of relying on a single mandi."
            : "सिर्फ एक मंडी पर निर्भर रहने के बजाय आसपास की मंडियों की कीमतों की तुलना करें।"}
        </p>
      </div>

      <div className="mandi-discovery">
        <div className="mandi-list">
          {marketRows.map(([name, price, change], index) => (
            <div
              className={index === 1 ? "mandi-card best" : "mandi-card"}
              key={name}
            >
              <div className="mandi-rank">#{index + 1}</div>

              <div className="mandi-info">
                <h3>{name}</h3>
                <span>
                  <MapPin size={14} />
                  Madhya Pradesh
                </span>
              </div>

              <div className="mandi-price">
                <strong>{price}</strong>
                <span className={change.startsWith("+") ? "up" : "down"}>
                  {change}
                </span>
              </div>

              {index === 1 && <span className="best-badge">BEST PRICE</span>}
            </div>
          ))}
        </div>

        <div className="mandi-map-placeholder">
          <div className="map-content">
            <Globe2 size={60} />
            <h3>{language === "en" ? "Mandi network" : "मंडी नेटवर्क"}</h3>
            <p>
              {language === "en"
                ? "Connect with markets across regions."
                : "अलग-अलग क्षेत्रों के बाजारों से जुड़ें।"}
            </p>
            <Link to="/register/farmer" className="primary">
              {language === "en" ? "Explore markets" : "बाजार देखें"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BestMandiSection;
