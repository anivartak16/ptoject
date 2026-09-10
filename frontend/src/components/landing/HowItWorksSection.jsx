import React from "react";
import { ChevronRight, IndianRupee, Sprout, Users } from "lucide-react";

export function HowItWorksSection({ language }) {
  const howItWorks = [
    {
      number: "01",
      icon: <Sprout size={28} />,
      title:
        language === "en"
          ? "Register & List"
          : "रजिस्टर करें और फसल लिस्ट करें",
      text:
        language === "en"
          ? "Create your account and publish the produce you want to sell."
          : "अपना अकाउंट बनाएं और बेचने वाली फसल लिस्ट करें।",
    },
    {
      number: "02",
      icon: <Users size={28} />,
      title: language === "en" ? "Discover & Match" : "खोजें और मैच करें",
      text:
        language === "en"
          ? "Compare mandi prices and connect with buyers looking for your crop."
          : "मंडी कीमतों की तुलना करें और अपनी फसल के खरीदारों से जुड़ें।",
    },
    {
      number: "03",
      icon: <IndianRupee size={28} />,
      title: language === "en" ? "Trade & Track" : "व्यापार और ट्रैक करें",
      text:
        language === "en"
          ? "Agree on the offer and follow the trade through delivery and payment."
          : "ऑफर स्वीकार करें और delivery व payment तक व्यापार को ट्रैक करें।",
    },
  ];

  return (
    <section className="enhanced-section how-section" id="how-it-works">
      <div className="section-intro">
        <p className="eyebrow">SIMPLE DIGITAL FLOW</p>
        <h2>
          {language === "en"
            ? "How AgriLink works"
            : "AgriLink कैसे काम करता है"}
        </h2>
        <p>
          {language === "en"
            ? "A simple flow that connects supply, demand and trade in one marketplace."
            : "एक सरल प्रक्रिया जो supply, demand और trade को एक ही marketplace में जोड़ती है।"}
        </p>
      </div>

      <div className="how-grid">
        {howItWorks.map((item, index) => (
          <div className="how-card" key={item.number}>
            <div className="how-number">{item.number}</div>
            <div className="how-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            {index < howItWorks.length - 1 && (
              <ChevronRight className="how-arrow" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
