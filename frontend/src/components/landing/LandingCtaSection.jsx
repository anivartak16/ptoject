import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function LandingCtaSection({ language }) {
  return (
    <section className="landing-cta-clean-section">
      <div className="landing-cta-clean-card">
        <div className="cta-clean-content">
          <div className="cta-clean-badge">
            <ShieldCheck size={16} />
            <span>
              {language === "mr"
                ? "भारताच्या राष्ट्रीय डिजिटल कृषी बाजारपेठेत सामील व्हा"
                : language === "hi"
                ? "भारत के राष्ट्रीय डिजिटल कृषि नेटवर्क से जुड़ें"
                : "JOIN INDIA'S NATIONAL DIGITAL MANDI PLATFORM"}
            </span>
          </div>

          <h2>
            {language === "mr" ? (
              <>
                तुमच्या शेतमालाचा <em>योग्य आणि सर्वोत्तम भाव</em> मिळवण्यासाठी तयार आहात?
              </>
            ) : language === "hi" ? (
              <>
                अपनी फसल का <em>सही और बेहतर दाम</em> पाने के लिए तैयार हैं?
              </>
            ) : (
              <>
                Ready to Experience <em>Fairer Agri-Trade?</em>
              </>
            )}
          </h2>

          <p>
            {language === "mr"
              ? "पारदर्शक भाव, गुणवत्ता तपासणी आणि त्वरित बँक खात्यात पैशांचा लाभ घेण्यासाठी १८+ राज्यांमधील हजारो शेतकरी, एफपीओ आणि खरेदीदारांशी जोडा."
              : language === "hi"
              ? "18+ राज्यों के हजारों किसानों, FPO और सत्यापित खरीदारों से जुड़ें। पारदर्शी भाव, गुणवत्ता जांच और सुरक्षित बैंक भुगतान का लाभ उठाएं।"
              : "Join thousands of farmers, FPOs, and verified institutional buyers trading across 18+ states with transparent prices, quality testing, and instant bank settlements."}
          </p>

          <div className="cta-clean-bullets">
            <div>
              <CheckCircle2 size={16} className="text-emerald" />
              <span>{language === "mr" ? "शून्य मध्यस्थ दलाली" : language === "hi" ? "शून्य बिचौलिया दलाली" : "Zero middleman brokerage"}</span>
            </div>
            <div>
              <CheckCircle2 size={16} className="text-emerald" />
              <span>{language === "mr" ? "कृषी केंद्र गुणवत्ता चाचणी" : language === "hi" ? "कृषि केंद्र गुणवत्ता जांच" : "Krishi Kendra quality testing"}</span>
            </div>
            <div>
              <CheckCircle2 size={16} className="text-emerald" />
              <span>{language === "mr" ? "थेट बँक खात्यात सुरक्षित प्रदान" : language === "hi" ? "सीधे बैंक खाते में सुरक्षित भुगतान" : "Direct bank account settlements"}</span>
            </div>
          </div>

          <div className="cta-clean-button-group">
            <Link to="/register/farmer" className="cta-clean-btn-primary">
              <span>{language === "mr" ? "शेतकरी म्हणून नोंदणी करा" : language === "hi" ? "किसान पंजीकरण" : "Register as Farmer"}</span>
              <ArrowRight size={17} />
            </Link>

            <Link to="/register/buyer" className="cta-clean-btn-secondary">
              <span>{language === "mr" ? "खरेदीदार म्हणून नोंदणी करा" : language === "hi" ? "खरीदार पंजीकरण" : "Register as Buyer"}</span>
            </Link>

            <Link to="/login" className="cta-clean-btn-ghost">
              <span>{language === "mr" ? "आधीच नोंदणी केली आहे? लॉगिन करा" : language === "hi" ? "पहले से सदस्य हैं? लॉगिन करें" : "Already registered? Sign In"} →</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingCtaSection;
