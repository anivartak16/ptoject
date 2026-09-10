import React from "react";
import { ShieldCheck, TrendingUp, Sparkles, Truck } from "lucide-react";

export function TrustValueSection({ language }) {
  const values = [
    {
      icon: <TrendingUp size={22} />,
      title: language === "en" ? "Direct Market Connect" : "सीधा बाजार संपर्क",
      desc:
        language === "en"
          ? "Sell directly to verified institutional buyers and millers without unfair middlemen cuts."
          : "बिचौलियों के बिना सीधे सत्यापित खरीदारों और मिल मालिकों को अपनी फसल बेचें।",
    },
    {
      icon: <Sparkles size={22} />,
      title: language === "en" ? "Transparent Mandi Rates" : "पारदर्शी मंडी भाव",
      desc:
        language === "en"
          ? "Live price discovery across major MP mandis: Indore, Neemuch, Mandsaur & Bhopal."
          : "मध्य प्रदेश की प्रमुख मंडियों (इंदौर, नीमच, मंदसौर) के वास्तविक लाइव भाव।",
    },
    {
      icon: <ShieldCheck size={22} />,
      title:
        language === "en"
          ? "Krishi Kendra Quality Cert"
          : "कृषि केंद्र गुणवत्ता जांच",
      desc:
        language === "en"
          ? "Physical grain sample inspection, moisture testing, and Grade-A quality certification."
          : "फसल के नमूने की जांच, नमी परीक्षण और ग्रेड प्रमाणन द्वारा भरोसा।",
    },
    {
      icon: <Truck size={22} />,
      title: language === "en" ? "Secure Logistics & Escrow" : "सुरक्षित भुगतान व परिवहन",
      desc:
        language === "en"
          ? "Milestone-backed payments held safely until delivery verification at the destination."
          : "डिलीवरी सत्यापन तक सुरक्षित भुगतान और पारदर्शी ट्रांसपोर्ट ट्रैकिंग।",
    },
  ];

  return (
    <section className="trust-strip">
      <div className="trust-strip-inner">
        {values.map((v, i) => (
          <div key={i} className="trust-item">
            <div className="trust-icon-box">{v.icon}</div>
            <div className="trust-text">
              <h4>{v.title}</h4>
              <p>{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustValueSection;
