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
              {language === "en"
                ? "JOIN INDIA'S NATIONAL DIGITAL MANDI PLATFORM"
                : "भारत के राष्ट्रीय डिजिटल कृषि नेटवर्क से जुड़ें"}
            </span>
          </div>

          <h2>
            {language === "en" ? (
              <>
                Ready to Experience <em>Fairer Agri-Trade?</em>
              </>
            ) : (
              <>
                अपनी फसल का <em>सही और बेहतर दाम</em> पाने के लिए तैयार हैं?
              </>
            )}
          </h2>

          <p>
            {language === "en"
              ? "Join thousands of farmers, FPOs, and verified institutional buyers trading across 18+ states with transparent prices, quality testing, and instant bank settlements."
              : "18+ राज्यों के हजारों किसानों, FPO और सत्यापित खरीदारों से जुड़ें। पारदर्शी भाव, गुणवत्ता जांच और सुरक्षित बैंक भुगतान का लाभ उठाएं।"}
          </p>

          <div className="cta-clean-bullets">
            <div>
              <CheckCircle2 size={16} className="text-emerald" />
              <span>{language === "en" ? "Zero middleman brokerage" : "शून्य बिचौलिया दलाली"}</span>
            </div>
            <div>
              <CheckCircle2 size={16} className="text-emerald" />
              <span>{language === "en" ? "Krishi Kendra quality testing" : "कृषि केंद्र गुणवत्ता जांच"}</span>
            </div>
            <div>
              <CheckCircle2 size={16} className="text-emerald" />
              <span>{language === "en" ? "Direct bank account settlements" : "सीधे बैंक खाते में सुरक्षित भुगतान"}</span>
            </div>
          </div>

          <div className="cta-clean-button-group">
            <Link to="/register/farmer" className="cta-clean-btn-primary">
              <span>{language === "en" ? "Register as Farmer" : "किसान पंजीकरण"}</span>
              <ArrowRight size={17} />
            </Link>

            <Link to="/register/buyer" className="cta-clean-btn-secondary">
              <span>{language === "en" ? "Register as Buyer" : "खरीदार पंजीकरण"}</span>
            </Link>

            <Link to="/login" className="cta-clean-btn-ghost">
              <span>{language === "en" ? "Already registered? Sign In" : "पहले से सदस्य हैं? लॉगिन करें"} →</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingCtaSection;
