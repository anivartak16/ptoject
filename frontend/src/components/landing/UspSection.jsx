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
        language === "mr"
          ? "आंतर-राज्य भाव शोध"
          : language === "hi"
          ? "पारदर्शी अंतर-राज्यीय मूल्य खोज"
          : "Inter-State Price Discovery",
      description:
        language === "mr"
          ? "देशभरातील ५२०+ एपीएमसी बाजार समित्यांच्या थेट भावांची तुलना करा आणि जिथे सर्वाधिक भाव मिळेल तिथे विका."
          : language === "hi"
          ? "देशभर की 520+ APMC मंडियों के भाव देखें और जहाँ सबसे अधिक दाम मिले, वहीं बेचें।"
          : "Compare real-time prices across 520+ APMC mandis nationwide and sell where realization is highest.",
    },
    {
      icon: <Handshake size={22} />,
      title:
        language === "mr"
          ? "थेट कॉर्पोरेट व मिलर संपर्क"
          : language === "hi"
          ? "सीधा कॉर्पोरेट व मिलर संपर्क"
          : "Direct Enterprise Connect",
      description:
        language === "mr"
          ? "दलालांशिवाय थेट मोठे प्रक्रियादार, निर्यातदार आणि पिठाच्या गिरण्यांशी जोडा."
          : language === "hi"
          ? "बिचौलियों के बिना सीधे बड़े प्रोसेसर्स, निर्यातकों और आटा मिलों से जुड़ें।"
          : "Connect directly with food processors, exporters, and large flour mills without middleman cuts.",
    },
    {
      icon: <BarChart3 size={22} />,
      title:
        language === "mr"
          ? "राष्ट्रीय बाजार खोली"
          : language === "hi"
          ? "राष्ट्रीय बाजार गहराई"
          : "National Order Book Depth",
      description:
        language === "mr"
          ? "दैनिक आवक, खरेदीदार मागणी आणि विविध राज्यांचे मूल्य कल रिअल टाईममध्ये पहा."
          : language === "hi"
          ? "दैनिक आवक, खरीदार मांग और विभिन्न राज्यों के मूल्य रुझान वास्तविक समय में देखें।"
          : "Access arrival volumes, bid-ask spreads, and multi-state commodity trends in real time.",
    },
    {
      icon: <BadgeCheck size={22} />,
      title:
        language === "mr"
          ? "जिल्हा कृषी केंद्र तपासणी"
          : language === "hi"
          ? "कृषि केंद्र गुणवत्ता प्रमाणन"
          : "District Krishi Kendra Testing",
      description:
        language === "mr"
          ? "स्थानिक कृषी तज्ज्ञांकडून धान्याची ओलावा, शुद्धता आणि दर्जा तपासणी."
          : language === "hi"
          ? "स्थानीय कृषि केंद्र पर अनाज की नमी, शुद्धता और गुणवत्ता का निष्पक्ष वैज्ञानिक परीक्षण।"
          : "Grain lots inspected for moisture, purity, and grade standard by local agricultural experts.",
    },
    {
      icon: <Truck size={22} />,
      title:
        language === "mr"
          ? "शेताच्या बांधावरून थेट वाहतूक"
          : language === "hi"
          ? "खेत से सीधा सुरक्षित परिवहन"
          : "Farmgate Doorstep Logistics",
      description:
        language === "mr"
          ? "गावातील शेतापासून थेट खरेदीदाराच्या गोदामापर्यंत जीपीएस ट्रॅकिंगसह मालवाहतूक."
          : language === "hi"
          ? "गांव के खेत से सीधे खरीदार के गोदाम तक जीपीएस-ट्रैक्ड ढुलाई की पारदर्शी व्यवस्था।"
          : "Coordinate bulk freight and GPS-tracked transport from village farmgate to factory destination.",
    },
    {
      icon: <Lock size={22} />,
      title:
        language === "mr"
          ? "१००% सुरक्षित एस्क्रो प्रदान"
          : language === "hi"
          ? "100% सुरक्षित एस्क्रो भुगतान"
          : "100% Escrow Payout Security",
      description:
        language === "mr"
          ? "खरेदीदाराची रक्कम एस्क्रोमध्ये सुरक्षित ठेवली जाते आणि माल मिळाल्यावर थेट शेतकऱ्याच्या बँक खात्यात वर्ग होते."
          : language === "hi"
          ? "खरीदार की राशि एस्क्रो में सुरक्षित रखी जाती है और डिलीवरी के तुरंत बाद सीधे बैंक खाते में ट्रांसफर होती है।"
          : "Buyer funds are held safely in escrow and transferred directly to the farmer's bank account upon delivery.",
    },
  ];

  return (
    <section className="usp-section-clean" id="why-krishilink">
      <div className="section-intro">
        <p className="eyebrow">
          {language === "mr" ? "KRISHILINK ची निवड का करावी" : language === "hi" ? "KRISHILINK क्यों चुनें" : "WHY KRISHILINK"}
        </p>
        <h2>
          {language === "mr"
            ? "भारताच्या कृषी भविष्यासाठी सज्ज"
            : language === "hi"
            ? "भारतीय कृषि के पारदर्शी व आधुनिक भविष्य के लिए"
            : "Built for India's Agricultural Future"}
        </h2>
        <p>
          {language === "mr"
            ? "मध्यस्थांची अपारदर्शकता दूर करून वैज्ञानिक चाचणी, राष्ट्रीय भाव शोध आणि सुरक्षित बँक पेमेंट आणणे."
            : language === "hi"
            ? "बिचौलियों की अपारदर्शिता को वैज्ञानिक परीक्षण, राष्ट्रीय भाव खोज और सुरक्षित भुगतान से बदलना।"
            : "Replacing offline middlemen opacity with scientific testing, national price discovery, and secure bank payments."}
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
