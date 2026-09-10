import React from "react";
import {
  ClipboardList,
  Search,
  ShieldCheck,
  Banknote,
  ArrowRight,
} from "lucide-react";

export function HowItWorksSection({ language }) {
  const steps = [
    {
      number: "01",
      icon: <ClipboardList size={26} />,
      title:
        language === "en"
          ? "List Your Harvest"
          : "फसल दर्ज करें",
      desc:
        language === "en"
          ? "Farmers or FPOs enter crop details, estimated quantity, and expected rate."
          : "किसान या FPO अपनी फसल, अनुमानित मात्रा और अपेक्षित दर दर्ज करते हैं।",
    },
    {
      number: "02",
      icon: <Search size={26} />,
      title:
        language === "en"
          ? "Match & Place Bids"
          : "सत्यापित बोलियां",
      desc:
        language === "en"
          ? "Verified millers, traders, and institutional buyers discover lots and place binding bids."
          : "सत्यापित खरीदार और मिल मालिक फसल देखकर प्रतिस्पर्धी बोलियां लगाते हैं।",
    },
    {
      number: "03",
      icon: <ShieldCheck size={26} />,
      title:
        language === "en"
          ? "Krishi Kendra Quality Check"
          : "कृषि केंद्र गुणवत्ता जांच",
      desc:
        language === "en"
          ? "Local Krishi Kendra inspects grain samples, testing moisture and certifying grade standards."
          : "स्थानीय कृषि केंद्र नमूने की नमी व शुद्धता जांचकर ग्रेड प्रमाण पत्र जारी करता है।",
    },
    {
      number: "04",
      icon: <Banknote size={26} />,
      title:
        language === "en"
          ? "Escrow & Fast Payout"
          : "सुरक्षित भुगतान",
      desc:
        language === "en"
          ? "Funds held securely in escrow are released directly to the farmer's bank account upon dispatch."
          : "एस्क्रो में सुरक्षित राशि डिलीवरी सत्यापन के तुरंत बाद किसान के बैंक खाते में भेज दी जाती है।",
    },
  ];

  return (
    <section className="enhanced-section how-section" id="how-it-works">
      <div className="section-intro">
        <p className="eyebrow">SIMPLE 4-STEP DIGITAL WORKFLOW</p>
        <h2>
          {language === "en"
            ? "How KrishiLink Works"
            : "KrishiLink कैसे काम करता है"}
        </h2>
        <p>
          {language === "en"
            ? "From initial farm listing to verified quality testing and guaranteed bank payout."
            : "खेत से लिस्टिंग, कृषि केंद्र पर गुणवत्ता जांच से लेकर बैंक खाते में सुरक्षित भुगतान तक।"}
        </p>
      </div>

      <div className="how-grid-4">
        {steps.map((step, idx) => (
          <div className="how-step-card" key={step.number}>
            <div className="step-card-header">
              <span className="step-badge">{step.number}</span>
              <div className="step-icon-wrap">{step.icon}</div>
            </div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
            {idx < steps.length - 1 && (
              <div className="step-connector">
                <ArrowRight size={18} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
