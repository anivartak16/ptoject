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
      icon: <TrendingUp size={22} />,
      title:
        language === "en"
          ? "Inter-State Price Discovery"
          : "पारदर्शी अंतर-राज्यीय मूल्य खोज",
      description:
        language === "en"
          ? "Compare real-time prices across 520+ APMC mandis nationwide and sell where realization is highest."
          : "देशभर की 520+ APMC मंडियों के भाव देखें और जहाँ सबसे अधिक दाम मिले, वहीं बेचें।",
    },
    {
      icon: <Handshake size={22} />,
      title:
        language === "en"
          ? "Direct Enterprise Connect"
          : "सीधा कॉर्पोरेट व मिलर संपर्क",
      description:
        language === "en"
          ? "Connect directly with food processors, exporters, and large flour mills without middleman cuts."
          : "बिचौलियों के बिना सीधे बड़े प्रोसेसर्स, निर्यातकों और आटा मिलों से जुड़ें।",
    },
    {
      icon: <BarChart3 size={22} />,
      title:
        language === "en"
          ? "National Order Book Depth"
          : "राष्ट्रीय बाजार गहराई",
      description:
        language === "en"
          ? "Access arrival volumes, bid-ask spreads, and multi-state commodity trends in real time."
          : "दैनिक आवक, खरीदार मांग और विभिन्न राज्यों के मूल्य रुझान वास्तविक समय में देखें।",
    },
    {
      icon: <BadgeCheck size={22} />,
      title:
        language === "en"
          ? "District Krishi Kendra Testing"
          : "कृषि केंद्र गुणवत्ता प्रमाणन",
      description:
        language === "en"
          ? "Grain lots inspected for moisture, purity, and grade standard by local agricultural experts."
          : "स्थानीय कृषि केंद्र पर अनाज की नमी, शुद्धता और गुणवत्ता का निष्पक्ष वैज्ञानिक परीक्षण।",
    },
    {
      icon: <Truck size={22} />,
      title:
        language === "en"
          ? "Farmgate Doorstep Logistics"
          : "खेत से सीधा सुरक्षित परिवहन",
      description:
        language === "en"
          ? "Coordinate bulk freight and GPS-tracked transport from village farmgate to factory destination."
          : "गांव के खेत से सीधे खरीदार के गोदाम तक जीपीएस-ट्रैक्ड ढुलाई की पारदर्शी व्यवस्था।",
    },
    {
      icon: <Lock size={22} />,
      title:
        language === "en"
          ? "100% Escrow Payout Security"
          : "100% सुरक्षित एस्क्रो भुगतान",
      description:
        language === "en"
          ? "Buyer funds are held safely in escrow and transferred directly to the farmer's bank account upon delivery."
          : "खरीदार की राशि एस्क्रो में सुरक्षित रखी जाती है और डिलीवरी के तुरंत बाद सीधे बैंक खाते में ट्रांसफर होती है।",
    },
  ];

  return (
    <section className="usp-section-clean" id="why-krishilink">
      <div className="section-intro">
        <p className="eyebrow">WHY KRISHILINK</p>
        <h2>
          {language === "en"
            ? "Built for India's Agricultural Future"
            : "भारतीय कृषि के पारदर्शी व आधुनिक भविष्य के लिए"}
        </h2>
        <p>
          {language === "en"
            ? "Replacing offline middlemen opacity with scientific testing, national price discovery, and secure bank payments."
            : "बिचौलियों की अपारदर्शिता को वैज्ञानिक परीक्षण, राष्ट्रीय भाव खोज और सुरक्षित भुगतान से बदलना।"}
        </p>
      </div>

      <div className="usp-grid-clean">
        {uspFeatures.map((feature) => (
          <article className="usp-card-clean" key={feature.title}>
            <div className="usp-icon-clean">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default UspSection;
