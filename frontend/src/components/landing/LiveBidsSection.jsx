import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Building2, MapPin, ShieldAlert, Sparkles } from "lucide-react";

const panIndiaBuyerDemands = [
  {
    buyer: "ITC Agri Business Division",
    type: "Food Processing Enterprise",
    crop: "Sharbati Wheat (Grade A)",
    price: "₹2,580 / qtl",
    quantity: "850 qtl",
    location: "Indore & Bhopal, MP",
    terms: "Payment upon Krishi Kendra Grade Certificate",
    verified: true,
  },
  {
    buyer: "Adani Wilmar Ltd.",
    type: "Edible Oil & Food Conglomerate",
    crop: "Yellow Soybean (Moisture < 10%)",
    price: "₹4,650 / qtl",
    quantity: "1,200 qtl",
    location: "Latur, Maharashtra",
    terms: "Direct farmgate pickup arranged",
    verified: true,
  },
  {
    buyer: "KRBL Limited (India Gate)",
    type: "Basmati Rice Miller & Exporter",
    crop: "1121 Basmati Paddy",
    price: "₹3,940 / qtl",
    quantity: "600 qtl",
    location: "Karnal, Haryana",
    terms: "Instant escrow payout upon delivery",
    verified: true,
  },
  {
    buyer: "Everest Spices Pvt Ltd",
    type: "National Spice Manufacturer",
    crop: "Guntur Red Chilli (Teja)",
    price: "₹8,480 / qtl",
    quantity: "250 qtl",
    location: "Guntur, Andhra Pradesh",
    terms: "Quality sample verified at Krishi Kendra",
    verified: true,
  },
  {
    buyer: "Cargill India",
    type: "Global Agri Processor",
    crop: "Yellow Feed Maize",
    price: "₹2,200 / qtl",
    quantity: "1,500 qtl",
    location: "Davangere, Karnataka",
    terms: "Bulk contract pricing",
    verified: true,
  },
];

export function LiveBidsSection({ language = "en" }) {
  return (
    <section className="bids-section-clean" id="buyer-demands">
      <div className="section-intro">
        <p className="eyebrow">
          <span className="live-dot" /> LIVE VERIFIED BUYER DEMANDS
        </p>
        <h2>
          {language === "en"
            ? "Institutional Buyers Ready to Procure Directly"
            : "संस्थागत खरीदारों की सक्रिय मांग"}
        </h2>
        <p>
          {language === "en"
            ? "Leading Indian food processors, exporters, and millers place binding purchase demands with secured escrow deposits."
            : "भारत की प्रमुख खाद्य कंपनियां, निर्यातक और मिलर्स सुरक्षित एस्क्रो जमा के साथ फसल की सीधी खरीद कर रहे हैं।"}
        </p>
      </div>

      <div className="bids-table-clean">
        <div className="clean-bid-header">
          <span>ENTERPRISE BUYER</span>
          <span>COMMODITY & SPECS</span>
          <span>OFFER PRICE</span>
          <span>VOLUME</span>
          <span>PROCUREMENT LOCATION</span>
        </div>

        {panIndiaBuyerDemands.map((bid) => (
          <div className="clean-bid-row" key={bid.buyer}>
            <div className="buyer-col-info">
              <div className="buyer-avatar-clean">
                <Building2 size={18} />
              </div>
              <div>
                <b>{bid.buyer}</b>
                <small>
                  <BadgeCheck size={13} className="text-green" />
                  Verified Corporate Buyer
                </small>
              </div>
            </div>

            <div className="crop-spec-col">
              <strong>{bid.crop}</strong>
              <small>{bid.terms}</small>
            </div>

            <div className="price-offer-col">
              <strong>{bid.price}</strong>
            </div>

            <div className="quantity-col">
              <span>{bid.quantity}</span>
            </div>

            <div className="location-col">
              <span>
                <MapPin size={13} />
                {bid.location}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action banner with unambiguous links */}
      <div className="bids-action-banner">
        <div className="action-text">
          <Sparkles size={20} className="text-green" />
          <div>
            <strong>
              {language === "en"
                ? "Are you a Farmer or FPO with harvested stock?"
                : "क्या आप किसान या FPO हैं और अपनी फसल बेचना चाहते हैं?"}
            </strong>
            <p>
              {language === "en"
                ? "Register your crop lot to match with these buyers and receive payment directly into your bank account."
                : "अपनी फसल दर्ज करें, इन खरीदारों से सीधे जुड़ें और बैंक खाते में सुरक्षित भुगतान प्राप्त करें।"}
            </p>
          </div>
        </div>

        <div className="action-buttons-wrap">
          <Link className="clean-cta-btn" to="/register/farmer">
            <span>{language === "en" ? "Register to Sell Produce" : "फसल बेचने के लिए पंजीकरण"}</span>
            <ArrowRight size={16} />
          </Link>

          <Link className="clean-secondary-btn" to="/register/buyer">
            <span>{language === "en" ? "Post Buyer Demand" : "खरीदार मांग दर्ज करें"}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LiveBidsSection;
