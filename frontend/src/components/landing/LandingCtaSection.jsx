import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function LandingCtaSection({ language }) {
  return (
    <section className="landing-cta-section">
      <div className="landing-cta-card">
        <div className="landing-cta-content">
          <div className="cta-badge">
            <ShieldCheck size={16} />
            <span>
              {language === "en"
                ? "JOIN INDIA'S TRUSTED AGRI-NETWORK"
                : "भारत के विश्वसनीय कृषि नेटवर्क से जुड़ें"}
            </span>
          </div>

          <h2>
            {language === "en" ? (
              <>
                Ready to get <em>better rates</em> for your harvest?
              </>
            ) : (
              <>
                अपनी फसल का <em>सही और बेहतर दाम</em> पाने के लिए तैयार हैं?
              </>
            )}
          </h2>

          <p>
            {language === "en"
              ? "Sign up today to discover live market prices, connect directly with verified buyers, and receive guaranteed escrow payouts upon quality certification."
              : "आज ही पंजीकरण करें, लाइव मंडी भाव देखें, सीधे सत्यापित खरीदारों से जुड़ें और गुणवत्ता प्रमाणन के साथ सुरक्षित भुगतान पाएं।"}
          </p>

          <div className="cta-bullets">
            <div>
              <CheckCircle2 size={16} />
              <span>{language === "en" ? "Zero broker commission" : "शून्य बिचौलिया दलाली"}</span>
            </div>
            <div>
              <CheckCircle2 size={16} />
              <span>{language === "en" ? "Krishi Kendra quality testing" : "कृषि केंद्र गुणवत्ता जांच"}</span>
            </div>
            <div>
              <CheckCircle2 size={16} />
              <span>{language === "en" ? "Direct bank account settlements" : "सीधे बैंक खाते में सुरक्षित भुगतान"}</span>
            </div>
          </div>

          <div className="cta-button-group">
            <Link to="/register/farmer" className="landing-btn-primary">
              {language === "en" ? "Register as Farmer" : "किसान के रूप में पंजीकरण"}
              <ArrowRight size={18} />
            </Link>

            <Link to="/register/buyer" className="landing-btn-secondary">
              {language === "en" ? "Register as Buyer" : "खरीदार के रूप में पंजीकरण"}
            </Link>

            <Link to="/login" className="landing-btn-ghost">
              {language === "en" ? "Already a member? Log in" : "पहले से सदस्य हैं? लॉगिन करें"} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingCtaSection;
