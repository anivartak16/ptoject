import React from "react";
import { ShieldCheck, TrendingUp, Sparkles, Truck } from "lucide-react";

export function TrustValueSection({ language }) {
  const values = [
    {
      icon: <TrendingUp size={22} />,
      title:
        language === "en"
          ? "Inter-State Mandi Discovery"
          : "अखिल भारतीय मंडी खोज",
      desc:
        language === "en"
          ? "Compare real-time rates across 500+ APMC mandis across MP, Punjab, Maharashtra, Rajasthan & Gujarat."
          : "पंजाब, म.प्र., महाराष्ट्र, राजस्थान और गुजरात की 500+ मंडियों के भावों की तुलना करें।",
    },
    {
      icon: <Sparkles size={22} />,
      title:
        language === "en"
          ? "Direct Institutional Connect"
          : "सीधा संस्थागत संपर्क",
      desc:
        language === "en"
          ? "Connect directly with major food processors, millers, and exporters without broker margins."
          : "बिचौलियों के बिना सीधे बड़े मिल मालिकों, प्रोसेसर्स और निर्यातकों को अपनी उपज बेचें।",
    },
    {
      icon: <ShieldCheck size={22} />,
      title:
        language === "en"
          ? "Krishi Kendra Quality Testing"
          : "कृषि केंद्र गुणवत्ता जांच",
      desc:
        language === "en"
          ? "Physical grain sample inspection, digital moisture testing, and Grade-A quality badges at district centers."
          : "जिला स्तर पर कृषि केंद्र द्वारा भौतिक नमूना परीक्षण, नमी जांच और डिजिटल ग्रेड प्रमाणन।",
    },
    {
      icon: <Truck size={22} />,
      title:
        language === "en"
          ? "National Escrow & Logistics"
          : "राष्ट्रीय एस्क्रो व सुरक्षित परिवहन",
      desc:
        language === "en"
          ? "Buyer funds held safely in escrow and transferred directly to the farmer's bank account upon delivery."
          : "सुरक्षित एस्क्रो भुगतान और डिलीवरी सत्यापन के तुरंत बाद किसान के बैंक खाते में सीधा ट्रांसफर।",
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
