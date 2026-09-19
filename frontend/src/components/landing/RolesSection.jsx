import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Factory, ShieldCheck, Sprout, Users } from "lucide-react";

export function RolesSection({ language }) {
  const roles = [
    {
      id: "farmer",
      num: "01",
      icon: <Sprout size={24} />,
      title: language === "mr" ? "शेतकरी" : language === "hi" ? "किसान" : "Farmer",
      badge: language === "mr" ? "थेट विक्री" : language === "hi" ? "सीधी बिक्री" : "DIRECT SALES",
      desc:
        language === "mr"
          ? "पारदर्शक राष्ट्रीय बाजारभावात शेतमालाची नोंदणी करा, थेट खरेदीदारांकडून स्पर्धात्मक बोल्या मिळवा आणि बँक खात्यात सुरक्षित पैसे मिळवा."
          : language === "hi"
          ? "अपनी फसल राष्ट्रीय मंडी भाव पर लिस्ट करें, सीधे खरीदारों से बोलियां पाएं और बैंक खाते में सुरक्षित भुगतान प्राप्त करें।"
          : "List harvested produce at transparent national market rates, receive competitive buyer bids, and get guaranteed escrow payouts.",
      points: [
        language === "mr" ? "शून्य मध्यस्थ दलाली" : language === "hi" ? "शून्य बिचौलिया दलाली" : "Zero middleman brokerage",
        language === "mr" ? "रिअल-टाईम बाजार समिती भाव तुलना" : language === "hi" ? "रीयल-टाइम मंडी भाव तुलना" : "Real-time mandi rate comparisons",
        language === "mr" ? "शेतातून खात्रीशीर वाहतूक व्यवस्था" : language === "hi" ? "निश्चित ढुलाई व परिवहन व्यवस्था" : "Assured doorstep pickup & freight",
      ],
      link: "/register/farmer",
      btnText: language === "mr" ? "शेतकरी म्हणून नोंदणी करा" : language === "hi" ? "किसान पंजीकरण" : "Register as Farmer",
    },
    {
      id: "buyer",
      num: "02",
      icon: <Factory size={24} />,
      title: language === "mr" ? "खरेदीदार / प्रक्रियादार" : language === "hi" ? "खरीदार / मिलर" : "Buyer / Processor",
      badge: language === "mr" ? "थोक खरेदी" : language === "hi" ? "थोक खरीद" : "BULK SOURCING",
      desc:
        language === "mr"
          ? "तुमच्या खरेदीच्या गरजा नोंदवा, उत्पादक राज्यांमधून पडताळणीकृत शेतमाल शोधा आणि प्रयोगशाळा प्रमाणित धान्य खरेदी करा."
          : language === "hi"
          ? "अपनी खरीद मांग दर्ज करें, उत्पादक राज्यों से सत्यापित फसलें खोजें और प्रयोगशाला प्रमाणित अनाज खरीदें।"
          : "Post crop requirements, discover verified lots across producing states, and procure high-grade grains with lab-certified quality.",
      points: [
        language === "mr" ? "थेट शेताच्या बांधावरून खरेदी" : language === "hi" ? "सीधे खेत से थोक खरीद" : "Direct origin farmgate sourcing",
        language === "mr" ? "कृषी केंद्र प्रयोगशाळा चाचणी अहवाल" : language === "hi" ? "प्रमाणित गुणवत्ता जांच रिपोर्ट" : "Krishi Kendra lab test reports",
        language === "mr" ? "संपूर्ण पुरवठा साखळी पारदर्शकता" : language === "hi" ? "पूर्ण आपूर्ति श्रृंखला ट्रैकिंग" : "Full supply trail transparency",
      ],
      link: "/register/buyer",
      btnText: language === "mr" ? "खरेदीदार म्हणून नोंदणी करा" : language === "hi" ? "खरीदार पंजीकरण" : "Register as Buyer",
    },
    {
      id: "fpo",
      num: "03",
      icon: <Users size={24} />,
      title: language === "mr" ? "एफपीओ / सहकारी संस्था" : language === "hi" ? "FPO / सहकारी संस्था" : "FPO / Cooperative",
      badge: language === "mr" ? "सामूहिक एकत्रिकरण" : language === "hi" ? "सामूहिक शक्ति" : "AGGREGATION",
      desc:
        language === "mr"
          ? "शेकडो शेतकरी सदस्यांचा शेतमाल एकत्रित करून चांगल्या घाऊक दरांची वाटाघाटी करा आणि मोठ्या कॉर्पोरेट करारांची पूर्तता करा."
          : language === "hi"
          ? "सैकड़ों किसान सदस्यों की फसल को एकत्रित कर बड़े कॉर्पोरेट खरीदारों से बेहतर थोक भाव प्राप्त करें।"
          : "Pool harvests from hundreds of member farmers to negotiate better bulk rates and service corporate enterprise contracts.",
      points: [
        language === "mr" ? "सामूहिक सौदेबाजीची ताकद" : language === "hi" ? "सामूहिक सौदेबाजी की ताकत" : "Collective bargaining power",
        language === "mr" ? "सदस्य लॉट इन्व्हेंटरी व्यवस्थापन" : language === "hi" ? "सदस्य लॉट इन्वेंट्री प्रबंधन" : "Member lot inventory tracking",
        language === "mr" ? "संस्थागत घाऊक करार" : language === "hi" ? "संस्थागत थोक अनुबंध" : "Institutional bulk contracts",
      ],
      link: "/register/fpo",
      btnText: language === "mr" ? "FPO म्हणून नोंदणी करा" : language === "hi" ? "FPO पंजीकरण" : "Register as FPO",
    },
    {
      id: "krishi-kendra",
      num: "04",
      icon: <ShieldCheck size={24} />,
      title: language === "mr" ? "कृषी केंद्र / निरीक्षक" : language === "hi" ? "कृषि केंद्र / निरीक्षक" : "Krishi Kendra",
      badge: language === "mr" ? "गुणवत्ता प्रमाणन" : language === "hi" ? "गुणवत्ता प्रमाणन" : "CERTIFICATION",
      desc:
        language === "mr"
          ? "धान्याच्या प्रत्यक्ष नमुन्यांची तपासणी करा, ओलावा आणि बाह्य घटक मोजा आणि विश्वासार्ह डिजिटल गुणवत्ता प्रमाणपत्रे जारी करा."
          : language === "hi"
          ? "फसल के नमूनों की भौतिक जांच करें, नमी मापें और निष्पक्ष डिजिटल गुणवत्ता प्रमाण पत्र जारी करें।"
          : "Examine physical grain samples, measure moisture and foreign matter, and issue trusted digital quality certificates.",
      points: [
        language === "mr" ? "डिजिटल ग्रेडिंग प्रमाणपत्रे" : language === "hi" ? "डिजिटल ग्रेडिंग प्रमाण पत्र" : "Digital grading certificates",
        language === "mr" ? "ओलावा व शुद्धता प्रयोगशाळा चाचणी" : language === "hi" ? "नमी व शुद्धता वैज्ञानिक परीक्षण" : "Moisture & purity lab tests",
        language === "mr" ? "विवादमुक्त सुरक्षित व्यवहार" : language === "hi" ? "विवाद-रहित सुरक्षित सौदे" : "Dispute-free settlements",
      ],
      link: "/register/krishi-kendra",
      btnText: language === "mr" ? "कृषी केंद्र म्हणून नोंदणी करा" : language === "hi" ? "कृषि केंद्र पंजीकरण" : "Register as Kendra",
    },
  ];

  return (
    <section className="role-section-clean" id="stakeholders">
      <div className="section-intro">
        <p className="eyebrow">
          {language === "mr" ? "एक राष्ट्रीय व्यासपीठ · चार प्रमुख भूमिका" : language === "hi" ? "एक राष्ट्रीय मंच · चार मुख्य भूमिकाएं" : "ONE NATIONAL PLATFORM · FOUR KEY ROLES"}
        </p>
        <h2>
          {language === "mr"
            ? "प्रत्येक कृषी घटकासाठी समर्पित पोर्टल"
            : language === "hi"
            ? "कृषि क्षेत्र के हर भागीदार के लिए समर्पित पोर्टल"
            : "Dedicated Portals for Every Agricultural Stakeholder"}
        </h2>
        <p>
          {language === "mr"
            ? "तुम्ही शेती करत असाल, एकत्रिकरण करत असाल, तपासणी करत असाल किंवा धान्य प्रक्रिया करत असाल - KrishiLink तुम्हाला समर्पित साधने पुरवते."
            : language === "hi"
            ? "चाहे आप किसान हों, FPO हों, गुणवत्ता निरीक्षक हों या खरीदार - KrishiLink आपको समर्पित सुविधाएं देता है।"
            : "Whether you farm, aggregate, inspect, or process grains, KrishiLink provides tailored tools for your trade."}
        </p>
      </div>

      <div className="role-grid-clean">
        {roles.map((role) => (
          <div className="role-card-clean" key={role.id}>
            <div className="role-top-row">
              <span className="role-index">{role.num}</span>
              <span className="role-badge-pill">{role.badge}</span>
            </div>

            <div className="role-icon-clean">{role.icon}</div>

            <h3>{role.title}</h3>
            <p className="role-desc-text">{role.desc}</p>

            <ul className="role-points-clean">
              {role.points.map((pt, i) => (
                <li key={i}>
                  <CheckCircle2 size={14} className="text-green" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <Link to={role.link} className="role-cta-btn">
              <span>{role.btnText}</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RolesSection;
