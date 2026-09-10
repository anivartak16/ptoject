import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";

export function DigitalTradingFloor({ language }) {
  const scrollToDemands = () => {
    const el = document.getElementById("buyer-demands");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="market-board" id="order-flow">
      <div className="order-floor-clean">
        <div className="floor-intro">
          <p className="eyebrow">NATIONAL DIGITAL ORDER BOOK</p>
          <h2>
            {language === "en"
              ? "Transparent Matching from Farmgate to Factory"
              : "खेत से लेकर कारखाने तक पारदर्शी व्यापार"}
          </h2>
          <p>
            {language === "en"
              ? "KrishiLink digitizes physical mandi trading onto a national order book. Compare institutional procurement offers, view verified grain demand across states, and close trades with escrow security."
              : "KrishiLink पारंपरिक मंडी व्यापार को राष्ट्रीय डिजिटल ऑर्डर बुक में बदलता है। विभिन्न राज्यों के खरीदारों के लाइव ऑफर्स देखें और सुरक्षित एस्क्रो के साथ व्यापार करें।"}
          </p>

          <div className="floor-highlights">
            <div className="floor-hl-item">
              <CheckCircle2 size={16} />
              <span>{language === "en" ? "Real-time institutional procurement offers" : "संस्थागत खरीदारों के रीयल-टाइम खरीद ऑफर्स"}</span>
            </div>
            <div className="floor-hl-item">
              <CheckCircle2 size={16} />
              <span>{language === "en" ? "e-NAM aligned quality standards & lab grading" : "मानकीकृत गुणवत्ता जांच व प्रयोगशाला ग्रेडिंग"}</span>
            </div>
            <div className="floor-hl-item">
              <CheckCircle2 size={16} />
              <span>{language === "en" ? "Guaranteed payout release upon dispatch verification" : "सत्यापन के बाद बैंक खाते में त्वरित भुगतान"}</span>
            </div>
          </div>
        </div>

        {/* ORDER BOOK CARD */}
        <div className="order-card-clean">
          <div className="order-card-top">
            <div className="order-top-left">
              <span className="live-dot" />
              <b>NATIONAL ORDER FLOW · SHARBATI WHEAT</b>
            </div>
            <span className="order-live-tag">ACTIVE MATCHING</span>
          </div>

          <div className="order-row order-head">
            <span>BUYER / ENTERPRISE</span>
            <span>BID PRICE</span>
            <span>VOLUME</span>
            <span>STATE</span>
          </div>

          <div className="order-row">
            <div className="order-buyer-col">
              <strong>ITC Agri Business</strong>
              <small>Processing Unit</small>
            </div>
            <b className="order-price">₹2,580/qtl</b>
            <span>850 qtl</span>
            <span className="order-state-pill">Madhya Pradesh</span>
          </div>

          <div className="order-row">
            <div className="order-buyer-col">
              <strong>Adani Wilmar Ltd.</strong>
              <small>Bulk Procurement</small>
            </div>
            <b className="order-price">₹2,575/qtl</b>
            <span>1,200 qtl</span>
            <span className="order-state-pill">Gujarat</span>
          </div>

          <div className="order-row">
            <div className="order-buyer-col">
              <strong>Central Flour Mills</strong>
              <small>Flour Milling Hub</small>
            </div>
            <b className="order-price">₹2,560/qtl</b>
            <span>450 qtl</span>
            <span className="order-state-pill">Maharashtra</span>
          </div>

          <div className="order-footer-clean">
            <button
              type="button"
              className="order-scroll-link"
              onClick={scrollToDemands}
            >
              <span>View All 5 Active Corporate Demands ↓</span>
            </button>

            <Link to="/register/buyer" className="order-join-btn">
              <span>Register as Buyer to Place Bid</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DigitalTradingFloor;
