import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Factory, ShieldCheck, Sprout, Users } from "lucide-react";

export function RolesSection({ language }) {
  const roles = [
    {
      id: "farmer",
      num: "01",
      icon: <Sprout size={24} />,
      title: language === "en" ? "Farmer" : "किसान",
      badge: language === "en" ? "DIRECT SALES" : "सीधी बिक्री",
      desc:
        language === "en"
          ? "List harvested produce at transparent national market rates, receive competitive buyer bids, and get guaranteed escrow payouts."
          : "अपनी फसल राष्ट्रीय मंडी भाव पर लिस्ट करें, सीधे खरीदारों से बोलियां पाएं और बैंक खाते में सुरक्षित भुगतान प्राप्त करें।",
      points: [
        language === "en" ? "Zero middleman brokerage" : "शून्य बिचौलिया दलाली",
        language === "en" ? "Real-time mandi rate comparisons" : "रीयल-टाइम मंडी भाव तुलना",
        language === "en" ? "Assured doorstep pickup & freight" : "निश्चित ढुलाई व परिवहन व्यवस्था",
      ],
      link: "/register/farmer",
      btnText: language === "en" ? "Register as Farmer" : "किसान पंजीकरण",
    },
    {
      id: "buyer",
      num: "02",
      icon: <Factory size={24} />,
      title: language === "en" ? "Buyer / Processor" : "खरीदार / मिलर",
      badge: language === "en" ? "BULK SOURCING" : "थोक खरीद",
      desc:
        language === "en"
          ? "Post crop requirements, discover verified lots across producing states, and procure high-grade grains with lab-certified quality."
          : "अपनी खरीद मांग दर्ज करें, उत्पादक राज्यों से सत्यापित फसलें खोजें और प्रयोगशाला प्रमाणित अनाज खरीदें।",
      points: [
        language === "en" ? "Direct origin farmgate sourcing" : "सीधे खेत से थोक खरीद",
        language === "en" ? "Krishi Kendra lab test reports" : "प्रमाणित गुणवत्ता जांच रिपोर्ट",
        language === "en" ? "Full supply trail transparency" : "पूर्ण आपूर्ति श्रृंखला ट्रैकिंग",
      ],
      link: "/register/buyer",
      btnText: language === "en" ? "Register as Buyer" : "खरीदार पंजीकरण",
    },
    {
      id: "fpo",
      num: "03",
      icon: <Users size={24} />,
      title: language === "en" ? "FPO / Cooperative" : "FPO / सहकारी संस्था",
      badge: language === "en" ? "AGGREGATION" : "सामूहिक शक्ति",
      desc:
        language === "en"
          ? "Pool harvests from hundreds of member farmers to negotiate better bulk rates and service corporate enterprise contracts."
          : "सैकड़ों किसान सदस्यों की फसल को एकत्रित कर बड़े कॉर्पोरेट खरीदारों से बेहतर थोक भाव प्राप्त करें।",
      points: [
        language === "en" ? "Collective bargaining power" : "सामूहिक सौदेबाजी की ताकत",
        language === "en" ? "Member lot inventory tracking" : "सदस्य लॉट इन्वेंट्री प्रबंधन",
        language === "en" ? "Institutional bulk contracts" : "संस्थागत थोक अनुबंध",
      ],
      link: "/register/fpo",
      btnText: language === "en" ? "Register as FPO" : "FPO पंजीकरण",
    },
    {
      id: "krishi-kendra",
      num: "04",
      icon: <ShieldCheck size={24} />,
      title: language === "en" ? "Krishi Kendra" : "कृषि केंद्र / निरीक्षक",
      badge: language === "en" ? "CERTIFICATION" : "गुणवत्ता प्रमाणन",
      desc:
        language === "en"
          ? "Examine physical grain samples, measure moisture and foreign matter, and issue trusted digital quality certificates."
          : "फसल के नमूनों की भौतिक जांच करें, नमी मापें और निष्पक्ष डिजिटल गुणवत्ता प्रमाण पत्र जारी करें।",
      points: [
        language === "en" ? "Digital grading certificates" : "डिजिटल ग्रेडिंग प्रमाण पत्र",
        language === "en" ? "Moisture & purity lab tests" : "नमी व शुद्धता वैज्ञानिक परीक्षण",
        language === "en" ? "Dispute-free settlements" : "विवाद-रहित सुरक्षित सौदे",
      ],
      link: "/register/krishi-kendra",
      btnText: language === "en" ? "Register as Kendra" : "कृषि केंद्र पंजीकरण",
    },
  ];

  return (
    <section className="role-section-clean" id="stakeholders">
      <div className="section-intro">
        <p className="eyebrow">ONE NATIONAL PLATFORM · FOUR KEY ROLES</p>
        <h2>
          {language === "en"
            ? "Dedicated Portals for Every Agricultural Stakeholder"
            : "कृषि क्षेत्र के हर भागीदार के लिए समर्पित पोर्टल"}
        </h2>
        <p>
          {language === "en"
            ? "Whether you farm, aggregate, inspect, or process grains, KrishiLink provides tailored tools for your trade."
            : "चाहे आप किसान हों, FPO हों, गुणवत्ता निरीक्षक हों या खरीदार - KrishiLink आपको समर्पित सुविधाएं देता है।"}
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
