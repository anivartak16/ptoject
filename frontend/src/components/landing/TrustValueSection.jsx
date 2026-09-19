import React from "react";
import { ShieldCheck, TrendingUp, Sparkles, Truck } from "lucide-react";

export function TrustValueSection({ language }) {
  const values = [
    {
      icon: <TrendingUp size={22} />,
      title:
        language === "mr"
          ? "आंतर-राज्य बाजार समिती शोध"
          : language === "hi"
          ? "अखिल भारतीय मंडी खोज"
          : "Inter-State Mandi Discovery",
      desc:
        language === "mr"
          ? "मध्य प्रदेश, पंजाब, महाराष्ट्र, राजस्थान आणि गुजरातमधील ५००+ एपीएमसी बाजार समित्यांच्या थेट भावांची तुलना करा."
          : language === "hi"
          ? "पंजाब, म.प्र., महाराष्ट्र, राजस्थान और गुजरात की 500+ मंडियों के भावों की तुलना करें।"
          : "Compare real-time rates across 500+ APMC mandis across MP, Punjab, Maharashtra, Rajasthan & Gujarat.",
    },
    {
      icon: <Sparkles size={22} />,
      title:
        language === "mr"
          ? "थेट संस्थागत संपर्क"
          : language === "hi"
          ? "सीधा संस्थागत संपर्क"
          : "Direct Institutional Connect",
      desc:
        language === "mr"
          ? "मध्यस्थांशिवाय थेट प्रमुख अन्न प्रक्रिया उद्योग, मिलर्स आणि निर्यातदारांशी जोडा."
          : language === "hi"
          ? "बिचौलियों के बिना सीधे बड़े मिल मालिकों, प्रोसेसर्स और निर्यातकों को अपनी उपज बेचें।"
          : "Connect directly with major food processors, millers, and exporters without broker margins.",
    },
    {
      icon: <ShieldCheck size={22} />,
      title:
        language === "mr"
          ? "कृषी केंद्र गुणवत्ता तपासणी"
          : language === "hi"
          ? "कृषि केंद्र गुणवत्ता जांच"
          : "Krishi Kendra Quality Testing",
      desc:
        language === "mr"
          ? "जिल्हा केंद्रांवर प्रत्यक्ष धान्य नमुना तपासणी, डिजिटल ओलावा चाचणी आणि ग्रेड-A गुणवत्ता बॅज."
          : language === "hi"
          ? "जिला स्तर पर कृषि केंद्र द्वारा भौतिक नमूना परीक्षण, नमी जांच और डिजिटल ग्रेड प्रमाणन।"
          : "Physical grain sample inspection, digital moisture testing, and Grade-A quality badges at district centers.",
    },
    {
      icon: <Truck size={22} />,
      title:
        language === "mr"
          ? "राष्ट्रीय एस्क्रो व सुरक्षित वाहतूक"
          : language === "hi"
          ? "राष्ट्रीय एस्क्रो व सुरक्षित परिवहन"
          : "National Escrow & Logistics",
      desc:
        language === "mr"
          ? "खरेदीदाराचे पैसे एस्क्रोमध्ये सुरक्षित ठेवले जातात आणि डिलिव्हरी झाल्यावर थेट शेतकऱ्याच्या बँक खात्यात वर्ग केले जातात."
          : language === "hi"
          ? "सुरक्षित एस्क्रो भुगतान और डिलीवरी सत्यापन के तुरंत बाद किसान के बैंक खाते में सीधा ट्रांसफर।"
          : "Buyer funds held safely in escrow and transferred directly to the farmer's bank account upon delivery.",
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
