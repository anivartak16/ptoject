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
          <p className="eyebrow">
            {language === "mr" ? "राष्ट्रीय डिजिटल खरेदी-विक्री नोंदवही" : language === "hi" ? "राष्ट्रीय डिजिटल ऑर्डर बुक" : "NATIONAL DIGITAL ORDER BOOK"}
          </p>
          <h2>
            {language === "mr"
              ? "शेताच्या बांधापासून कारखान्यापर्यंत पारदर्शक व्यापार"
              : language === "hi"
              ? "खेत से लेकर कारखाने तक पारदर्शी व्यापार"
              : "Transparent Matching from Farmgate to Factory"}
          </h2>
          <p>
            {language === "mr"
              ? "KrishiLink पारंपारिक बाजार समिती व्यापाराला राष्ट्रीय डिजिटल ऑर्डर बुकमध्ये रूपांतरित करते. विविध राज्यांमधील खरेदीदारांचे थेट ऑफर्स पहा आणि सुरक्षित एस्क्रोसह व्यापार पूर्ण करा."
              : language === "hi"
              ? "KrishiLink पारंपरिक मंडी व्यापार को राष्ट्रीय डिजिटल ऑर्डर बुक में बदलता है। विभिन्न राज्यों के खरीदारों के लाइव ऑफर्स देखें और सुरक्षित एस्क्रो के साथ व्यापार करें।"
              : "KrishiLink digitizes physical mandi trading onto a national order book. Compare institutional procurement offers, view verified grain demand across states, and close trades with escrow security."}
          </p>

          <div className="floor-highlights">
            <div className="floor-hl-item">
              <CheckCircle2 size={16} />
              <span>
                {language === "mr"
                  ? "संस्थागत खरेदीदारांचे रिअल-टाईम खरेदी ऑफर्स"
                  : language === "hi"
                  ? "संस्थागत खरीदारों के रीयल-टाइम खरीद ऑफर्स"
                  : "Real-time institutional procurement offers"}
              </span>
            </div>
            <div className="floor-hl-item">
              <CheckCircle2 size={16} />
              <span>
                {language === "mr"
                  ? "मानकीकृत गुणवत्ता चाचणी आणि प्रयोगशाळा ग्रेडिंग"
                  : language === "hi"
                  ? "मानकीकृत गुणवत्ता जांच व प्रयोगशाला ग्रेडिंग"
                  : "e-NAM aligned quality standards & lab grading"}
              </span>
            </div>
            <div className="floor-hl-item">
              <CheckCircle2 size={16} />
              <span>
                {language === "mr"
                  ? "पडताळणीनंतर बँक खात्यात त्वरित पैसे जमा"
                  : language === "hi"
                  ? "सत्यापन के बाद बैंक खाते में त्वरित भुगतान"
                  : "Guaranteed payout release upon dispatch verification"}
              </span>
            </div>
          </div>
        </div>

        {/* ORDER BOOK CARD */}
        <div className="order-card-clean">
          <div className="order-card-top">
            <div className="order-top-left">
              <span className="live-dot" />
              <b>
                {language === "mr"
                  ? "राष्ट्रीय मागणी प्रवाह · शरबती गहू"
                  : language === "hi"
                  ? "राष्ट्रीय ऑर्डर प्रवाह · शरबती गेहूं"
                  : "NATIONAL ORDER FLOW · SHARBATI WHEAT"}
              </b>
            </div>
            <span className="order-live-tag">
              {language === "mr" ? "सक्रिय व्यवहार" : language === "hi" ? "सक्रिय मिलान" : "ACTIVE MATCHING"}
            </span>
          </div>

          <div className="order-row order-head">
            <span>{language === "mr" ? "खरेदीदार / उद्योग" : language === "hi" ? "खरीदार / उद्यम" : "BUYER / ENTERPRISE"}</span>
            <span>{language === "mr" ? "बोली किंमत" : language === "hi" ? "बोली मूल्य" : "BID PRICE"}</span>
            <span>{language === "mr" ? "प्रमाण" : language === "hi" ? "मात्रा" : "VOLUME"}</span>
            <span>{language === "mr" ? "राज्य" : language === "hi" ? "राज्य" : "STATE"}</span>
          </div>

          <div className="order-row">
            <div className="order-buyer-col">
              <strong>ITC Agri Business</strong>
              <small>{language === "mr" ? "प्रक्रिया केंद्र" : language === "hi" ? "प्रसंस्करण इकाई" : "Processing Unit"}</small>
            </div>
            <b className="order-price">₹2,580/qtl</b>
            <span>850 qtl</span>
            <span className="order-state-pill">{language === "mr" ? "मध्य प्रदेश" : language === "hi" ? "मध्य प्रदेश" : "Madhya Pradesh"}</span>
          </div>

          <div className="order-row">
            <div className="order-buyer-col">
              <strong>Adani Wilmar Ltd.</strong>
              <small>{language === "mr" ? "घाऊक खरेदी" : language === "hi" ? "थोक खरीद" : "Bulk Procurement"}</small>
            </div>
            <b className="order-price">₹2,575/qtl</b>
            <span>1,200 qtl</span>
            <span className="order-state-pill">{language === "mr" ? "गुजरात" : language === "hi" ? "गुजरात" : "Gujarat"}</span>
          </div>

          <div className="order-row">
            <div className="order-buyer-col">
              <strong>Central Flour Mills</strong>
              <small>{language === "mr" ? "पिठाची गिरणी केंद्र" : language === "hi" ? "आटा मिल केंद्र" : "Flour Milling Hub"}</small>
            </div>
            <b className="order-price">₹2,560/qtl</b>
            <span>450 qtl</span>
            <span className="order-state-pill">{language === "mr" ? "महाराष्ट्र" : language === "hi" ? "महाराष्ट्र" : "Maharashtra"}</span>
          </div>

          <div className="order-footer-clean">
            <button
              type="button"
              className="order-scroll-link"
              onClick={scrollToDemands}
            >
              <span>
                {language === "mr"
                  ? "सर्व ५ सक्रिय कॉर्पोरेट मागण्या पहा ↓"
                  : language === "hi"
                  ? "सभी 5 सक्रिय मांगें देखें ↓"
                  : "View All 5 Active Corporate Demands ↓"}
              </span>
            </button>

            <Link to="/register/buyer" className="order-join-btn">
              <span>
                {language === "mr"
                  ? "बोली लावण्यासाठी खरेदीदार म्हणून नोंदणी करा"
                  : language === "hi"
                  ? "बोली लगाने के लिए खरीदार पंजीकरण करें"
                  : "Register as Buyer to Place Bid"}
              </span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DigitalTradingFloor;
