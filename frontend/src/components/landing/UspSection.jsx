import React from "react";
import {
  BadgeCheck,
  BarChart3,
  Handshake,
  Lock,
  TrendingUp,
  Truck,
} from "lucide-react";

export function UspSection({ language }) {
  const uspFeatures = [
    {
      icon: <TrendingUp size={25} />,
      title:
        language === "en"
          ? "Better Price Discovery"
          : "बेहतर मूल्य खोज",
      description:
        language === "en"
          ? "Compare mandi prices and buyer offers before deciding where to sell."
          : "बेचने से पहले मंडी कीमतों और खरीदारों के ऑफर की तुलना करें।",
    },
    {
      icon: <Handshake size={25} />,
      title:
        language === "en"
          ? "Direct Farmer-Buyer Connect"
          : "सीधा किसान-खरीदार संपर्क",
      description:
        language === "en"
          ? "Connect farmers, FPOs and buyers through one transparent marketplace."
          : "किसानों, FPO और खरीदारों को एक पारदर्शी marketplace से जोड़ें।",
    },
    {
      icon: <BarChart3 size={25} />,
      title:
        language === "en"
          ? "Transparent Market Data"
          : "पारदर्शी बाजार डेटा",
      description:
        language === "en"
          ? "See market prices, demand and trade activity in one place."
          : "बाजार कीमत, मांग और व्यापार गतिविधि एक ही जगह देखें।",
    },
    {
      icon: <BadgeCheck size={25} />,
      title:
        language === "en"
          ? "Verified Participants"
          : "सत्यापित प्रतिभागी",
      description:
        language === "en"
          ? "Build trust by trading with registered marketplace participants."
          : "पंजीकृत marketplace participants के साथ भरोसे से व्यापार करें।",
    },
    {
      icon: <Truck size={25} />,
      title:
        language === "en"
          ? "End-to-End Trade Flow"
          : "पूरी व्यापार प्रक्रिया",
      description:
        language === "en"
          ? "From listing and matching to delivery and payment."
          : "लिस्टिंग और matching से लेकर delivery और payment तक।",
    },
    {
      icon: <Lock size={25} />,
      title:
        language === "en"
          ? "Secure Transactions"
          : "सुरक्षित लेनदेन",
      description:
        language === "en"
          ? "Keep transaction records visible and structured throughout the trade."
          : "पूरे व्यापार के दौरान transaction records को सुरक्षित और व्यवस्थित रखें।",
    },
  ];

  return (
    <section className="enhanced-section usp-section" id="why-agrilink">
      <div className="section-intro">
        <p className="eyebrow">WHY AGRILINK</p>
        <h2>
          {language === "en"
            ? "Built to give farmers more control"
            : "किसानों को अधिक नियंत्रण देने के लिए बनाया गया"}
        </h2>
        <p>
          {language === "en"
            ? "A marketplace designed around visibility, choice and better coordination."
            : "एक marketplace जो visibility, choice और बेहतर coordination पर आधारित है।"}
        </p>
      </div>

      <div className="usp-grid">
        {uspFeatures.map((feature) => (
          <article className="usp-card" key={feature.title}>
            <div className="usp-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default UspSection;
