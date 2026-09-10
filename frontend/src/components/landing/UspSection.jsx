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
      icon: <TrendingUp size={24} />,
      title:
        language === "en"
          ? "Better Price Discovery"
          : "पारदर्शी मूल्य खोज",
      description:
        language === "en"
          ? "Compare live mandi prices across Indore, Neemuch, Mandsaur and direct buyer bids before selling."
          : "बेचने से पहले इंदौर, नीमच, मंदसौर मंडी भाव और खरीदारों के सीधे ऑफर्स की तुलना करें।",
    },
    {
      icon: <Handshake size={24} />,
      title:
        language === "en"
          ? "Direct Farmer-Buyer Connect"
          : "सीधा किसान-खरीदार संपर्क",
      description:
        language === "en"
          ? "Connect farmers, FPOs, and verified millers without intermediate commissions."
          : "किसानों, FPO और सत्यापित मिल मालिकों को बिना बिचौलियों के एक पारदर्शी मंच से जोड़ें।",
    },
    {
      icon: <BarChart3 size={24} />,
      title:
        language === "en"
          ? "Live Market Depth"
          : "लाइव बाजार गहराई",
      description:
        language === "en"
          ? "Access arrival volumes, bid-ask spreads, and historical price momentum in real time."
          : "आवक मात्रा, खरीदार-विक्रेता भाव और मूल्य रुझान वास्तविक समय में देखें।",
    },
    {
      icon: <BadgeCheck size={24} />,
      title:
        language === "en"
          ? "Krishi Kendra Certified"
          : "कृषि केंद्र प्रमाणित",
      description:
        language === "en"
          ? "Every lot can be verified by local Krishi Kendras for moisture, purity, and grain quality."
          : "हर लॉट की नमी, शुद्धता और अनाज की गुणवत्ता का स्थानीय कृषि केंद्र द्वारा सत्यापन।",
    },
    {
      icon: <Truck size={24} />,
      title:
        language === "en"
          ? "Tracked Logistics"
          : "सत्यापित परिवहन ट्रैकिंग",
      description:
        language === "en"
          ? "Transparent pickup and delivery coordination with verified transport partners."
          : "सत्यापित ट्रांसपोर्टर्स के साथ पारदर्शी लोडिंग और डिलीवरी ट्रैकिंग।",
    },
    {
      icon: <Lock size={24} />,
      title:
        language === "en"
          ? "Escrow Payout Security"
          : "सुरक्षित एस्क्रो भुगतान",
      description:
        language === "en"
          ? "Buyer funds are deposited in escrow before transport and credited directly to the farmer's account."
          : "खरीदार की राशि एस्क्रो में सुरक्षित रखी जाती है और डिलीवरी सत्यापन के तुरंत बाद किसान के खाते में जाती है।",
    },
  ];

  return (
    <section className="enhanced-section usp-section" id="why-krishilink">
      <div className="section-intro">
        <p className="eyebrow">WHY KRISHILINK</p>
        <h2>
          {language === "en"
            ? "Engineered for Fairer, Faster Farm Trade"
            : "किसानों के सशक्तिकरण और न्यायसंगत व्यापार के लिए निर्मित"}
        </h2>
        <p>
          {language === "en"
            ? "A modern digital marketplace replacing guesswork with transparency, testing, and trust."
            : "पारदर्शिता, परीक्षण और भरोसे के साथ कृषि उपज का आधुनिक डिजिटल प्लेटफॉर्म।"}
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
