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
      icon: <ClipboardList size={24} />,
      title:
        language === "en"
          ? "List Your Harvest"
          : "फसल दर्ज करें",
      desc:
        language === "en"
          ? "Farmers or FPOs enter crop type, estimated quantity, and minimum expected base price."
          : "किसान या FPO अपनी फसल का प्रकार, अनुमानित मात्रा और न्यूनतम अपेक्षित दर दर्ज करते हैं।",
    },
    {
      number: "02",
      icon: <Search size={24} />,
      title:
        language === "en"
          ? "Pan-India Bidding"
          : "अखिल भारतीय बोलियां",
      desc:
        language === "en"
          ? "Verified institutional buyers, millers, and processors compete to place binding bids."
          : "सत्यापित संस्थागत खरीदार, मिलर्स और प्रोसेसर्स प्रतिस्पर्धी खरीद बोलियां लगाते हैं।",
    },
    {
      number: "03",
      icon: <ShieldCheck size={24} />,
      title:
        language === "en"
          ? "Krishi Kendra Quality Cert"
          : "कृषि केंद्र गुणवत्ता जांच",
      desc:
        language === "en"
          ? "Local district Krishi Kendra inspects physical samples, tests moisture, and certifies grade standards."
          : "स्थानीय कृषि केंद्र नमूने की नमी व शुद्धता जांचकर निष्पक्ष गुणवत्ता ग्रेड जारी करता है।",
    },
    {
      number: "04",
      icon: <Banknote size={24} />,
      title:
        language === "en"
          ? "Direct Bank Escrow Payout"
          : "सुरक्षित बैंक भुगतान",
      desc:
        language === "en"
          ? "Buyer funds held in escrow are released directly into the farmer's bank account upon dispatch."
          : "एस्क्रो में सुरक्षित राशि डिलीवरी सत्यापन के तुरंत बाद किसान के बैंक खाते में जमा हो जाती है।",
    },
  ];

  return (
    <section className="how-section-clean" id="how-it-works">
      <div className="section-intro">
        <p className="eyebrow">SIMPLE 4-STEP WORKFLOW</p>
        <h2>
          {language === "en"
            ? "How KrishiLink Works Across India"
            : "KrishiLink की 4-चरणीय कार्यप्रणाली"}
        </h2>
        <p>
          {language === "en"
            ? "From initial farmgate listing to verified laboratory testing and guaranteed escrow payout."
            : "खेत से लिस्टिंग, कृषि केंद्र पर गुणवत्ता जांच से लेकर बैंक खाते में सुरक्षित भुगतान तक।"}
        </p>
      </div>

      <div className="how-grid-clean">
        {steps.map((step, idx) => (
          <div className="how-card-clean" key={step.number}>
            <div className="how-card-header">
              <span className="step-num-pill">STEP {step.number}</span>
              <div className="step-icon-box">{step.icon}</div>
            </div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
            {idx < steps.length - 1 && (
              <div className="step-arrow-clean">
                <ArrowRight size={16} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
