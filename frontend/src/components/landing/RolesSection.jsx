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
          ? "List harvested produce at transparent market rates, connect with multiple verified buyers, and get guaranteed escrow payouts."
          : "अपनी फसल पारदर्शी मंडी भाव पर लिस्ट करें, सीधे खरीदारों से जुड़ें और बैंक खाते में सुरक्षित भुगतान पाएं।",
      points: [
        language === "en" ? "Zero middleman cut" : "शून्य बिचौलिया कटौती",
        language === "en" ? "Instant rate comparison" : "त्वरित मंडी भाव तुलना",
        language === "en" ? "Assured doorstep pickup" : "निश्चित परिवहन व्यवस्था",
      ],
      link: "/register/farmer",
      btnText: language === "en" ? "Join as Farmer" : "किसान के रूप में जुड़ें",
    },
    {
      id: "buyer",
      num: "02",
      icon: <Factory size={24} />,
      title: language === "en" ? "Buyer / Processor" : "खरीदार / मिलर",
      badge: language === "en" ? "BULK PROCUREMENT" : "थोक खरीद",
      desc:
        language === "en"
          ? "Post crop requirements, discover verified lots across MP, and procure high-grade grains with lab-certified quality."
          : "अपनी मांग दर्ज करें, मध्य प्रदेश की मंडियों से सत्यापित फसलें खोजें और प्रयोगशाला प्रमाणित अनाज खरीदें।",
      points: [
        language === "en" ? "Direct origin sourcing" : "सीधे स्रोत से खरीद",
        language === "en" ? "Quality lab test reports" : "प्रमाणित लैब जांच रिपोर्ट",
        language === "en" ? "Full supply trail tracking" : "पूर्ण आपूर्ति ट्रैकिंग",
      ],
      link: "/register/buyer",
      btnText: language === "en" ? "Join as Buyer" : "खरीदार के रूप में जुड़ें",
    },
    {
      id: "fpo",
      num: "03",
      icon: <Users size={24} />,
      title: language === "en" ? "FPO / Cooperative" : "FPO / सहकारी संस्था",
      badge: language === "en" ? "AGGREGATION" : "सामूहिक शक्ति",
      desc:
        language === "en"
          ? "Pool harvests from hundreds of member farmers to negotiate better bulk rates and service corporate contracts."
          : "सैकड़ों किसान सदस्यों की फसल को एक साथ मिलाकर बड़े कॉर्पोरेट खरीदारों से बेहतर भाव प्राप्त करें।",
      points: [
        language === "en" ? "Bulk bargaining power" : "सामूहिक सौदेबाजी की ताकत",
        language === "en" ? "Member lot management" : "सदस्य लॉट प्रबंधन",
        language === "en" ? "Institutional contracts" : "संस्थागत अनुबंध",
      ],
      link: "/register/fpo",
      btnText: language === "en" ? "Join as FPO" : "FPO के रूप में जुड़ें",
    },
    {
      id: "krishi-kendra",
      num: "04",
      icon: <ShieldCheck size={24} />,
      title: language === "en" ? "Krishi Kendra" : "कृषि केंद्र / निरीक्षक",
      badge: language === "en" ? "VERIFICATION" : "गुणवत्ता प्रमाणन",
      desc:
        language === "en"
          ? "Examine physical grain samples, measure moisture and foreign matter, and award digital quality grade badges."
          : "फसल के नमूनों की भौतिक जांच करें, नमी मापें और निष्पक्ष डिजिटल गुणवत्ता ग्रेड जारी करें।",
      points: [
        language === "en" ? "Digital grading badges" : "डिजिटल ग्रेडिंग बैज",
        language === "en" ? "Moisture & purity checks" : "नमी व शुद्धता परीक्षण",
        language === "en" ? "Dispute-free settlements" : "विवाद-मुक्त सुरक्षित सौदे",
      ],
      link: "/register/krishi-kendra",
      btnText: language === "en" ? "Join as Inspector" : "निरीक्षक के रूप में जुड़ें",
    },
  ];

  return (
    <section className="role-strip" id="roles">
      <div className="section-intro">
        <p className="eyebrow">ONE MARKETPLACE · FOUR KEY PLAYERS</p>
        <h2>
          {language === "en"
            ? "Tailored for Every Agricultural Stakeholder"
            : "कृषि क्षेत्र के हर वर्ग के लिए विशेष समाधान"}
        </h2>
        <p>
          {language === "en"
            ? "Whether you produce, aggregate, inspect, or process grains, KrishiLink provides dedicated tools for your operations."
            : "चाहे आप किसान हों, FPO हों, गुणवत्ता निरीक्षक हों या खरीदार - KrishiLink आपको समर्पित सुविधाएं प्रदान करता है।"}
        </p>
      </div>

      <div className="role-grid-4">
        {roles.map((role) => (
          <div className="role-card-modern" key={role.id}>
            <div className="role-card-top-row">
              <span className="role-num">{role.num}</span>
              <span className="role-pill-badge">{role.badge}</span>
            </div>

            <div className="role-icon-box">{role.icon}</div>

            <h3>{role.title}</h3>
            <p className="role-desc">{role.desc}</p>

            <ul className="role-bullet-list">
              {role.points.map((pt, i) => (
                <li key={i}>
                  <CheckCircle2 size={14} />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <Link to={role.link} className="role-action-link">
              <span>{role.btnText}</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RolesSection;
