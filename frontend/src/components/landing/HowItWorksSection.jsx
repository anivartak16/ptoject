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
        language === "mr"
          ? "तुमचा शेतमाल नोंदवा"
          : language === "hi"
          ? "फसल दर्ज करें"
          : "List Your Harvest",
      desc:
        language === "mr"
          ? "शेतकरी किंवा एफपीओ पिकाचा प्रकार, अंदाजे प्रमाण आणि किमान अपेक्षित आधारभूत किंमत नोंदवतात."
          : language === "hi"
          ? "किसान या FPO अपनी फसल का प्रकार, अनुमानित मात्रा और न्यूनतम अपेक्षित दर दर्ज करते हैं।"
          : "Farmers or FPOs enter crop type, estimated quantity, and minimum expected base price.",
    },
    {
      number: "02",
      icon: <Search size={24} />,
      title:
        language === "mr"
          ? "अखिल भारतीय बोली"
          : language === "hi"
          ? "अखिल भारतीय बोलियां"
          : "Pan-India Bidding",
      desc:
        language === "mr"
          ? "पडताळणीकृत संस्थागत खरेदीदार, मिलर्स आणि प्रक्रियादार स्पर्धात्मक बोली लावतात."
          : language === "hi"
          ? "सत्यापित संस्थागत खरीदार, मिलर्स और प्रोसेसर्स प्रतिस्पर्धी खरीद बोलियां लगाते हैं।"
          : "Verified institutional buyers, millers, and processors compete to place binding bids.",
    },
    {
      number: "03",
      icon: <ShieldCheck size={24} />,
      title:
        language === "mr"
          ? "कृषी केंद्र गुणवत्ता प्रमाणपत्र"
          : language === "hi"
          ? "कृषि केंद्र गुणवत्ता जांच"
          : "Krishi Kendra Quality Cert",
      desc:
        language === "mr"
          ? "स्थानिक जिल्हा कृषी केंद्र प्रत्यक्ष नमुन्यांची तपासणी करते, ओलावा मोजते आणि दर्जा प्रमाणित करते."
          : language === "hi"
          ? "स्थानीय कृषि केंद्र नमूने की नमी व शुद्धता जांचकर निष्पक्ष गुणवत्ता ग्रेड जारी करता है।"
          : "Local district Krishi Kendra inspects physical samples, tests moisture, and certifies grade standards.",
    },
    {
      number: "04",
      icon: <Banknote size={24} />,
      title:
        language === "mr"
          ? "थेट बँक एस्क्रो प्रदान"
          : language === "hi"
          ? "सुरक्षित बैंक भुगतान"
          : "Direct Bank Escrow Payout",
      desc:
        language === "mr"
          ? "एस्क्रोमध्ये सुरक्षित ठेवलेले खरेदीदाराचे पैसे पाठवणीच्या पडताळणीनंतर थेट शेतकऱ्याच्या बँक खात्यात वर्ग केले जातात."
          : language === "hi"
          ? "एस्क्रो में सुरक्षित राशि डिलीवरी सत्यापन के तुरंत बाद किसान के बैंक खाते में जमा हो जाती है।"
          : "Buyer funds held in escrow are released directly into the farmer's bank account upon dispatch.",
    },
  ];

  return (
    <section className="how-section-clean" id="how-it-works">
      <div className="section-intro">
        <p className="eyebrow">
          {language === "mr" ? "सोपी ४-टप्प्यांची कार्यपद्धती" : language === "hi" ? "सरल 4-चरणीय कार्यप्रणाली" : "SIMPLE 4-STEP WORKFLOW"}
        </p>
        <h2>
          {language === "mr"
            ? "KrishiLink संपूर्ण भारतात कसे कार्य करते"
            : language === "hi"
            ? "KrishiLink की 4-चरणीय कार्यप्रणाली"
            : "How KrishiLink Works Across India"}
        </h2>
        <p>
          {language === "mr"
            ? "खेत ते नोंदणी, कृषी केंद्रावर गुणवत्ता तपासणी ते बँक खात्यात हमीसह सुरक्षित पैसे मिळेपर्यंत."
            : language === "hi"
            ? "खेत से लिस्टिंग, कृषि केंद्र पर गुणवत्ता जांच से लेकर बैंक खाते में सुरक्षित भुगतान तक।"
            : "From initial farmgate listing to verified laboratory testing and guaranteed escrow payout."}
        </p>
      </div>

      <div className="how-grid-clean">
        {steps.map((step, idx) => (
          <div className="how-card-clean" key={step.number}>
            <div className="how-card-header">
              <span className="step-num-pill">
                {language === "mr" ? `टप्पा ${step.number}` : language === "hi" ? `चरण ${step.number}` : `STEP ${step.number}`}
              </span>
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
