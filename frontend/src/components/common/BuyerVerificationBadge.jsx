import React from "react";
import { ShieldCheck, AlertTriangle, Building2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export function BuyerVerificationBadge({
  verification = "PENDING",
  buyer = null,
  compact = false,
}) {
  const { t, getLabel } = useLanguage();
  const isVerified =
    verification === "VERIFIED" ||
    buyer?.verification === "VERIFIED" ||
    Boolean(buyer?.gstNumber);

  if (compact) {
    return isVerified ? (
      <span
        className="verification-badge-compact verified"
        title={getLabel(
          "Verified Buyer: GST & APMC Licensed",
          "सत्यापित खरीदार: जीएसटी व मंडी लाइसेंस प्राप्त",
          "प्रमाणित खरेदीदार: जीएसटी व बाजार समिती परवानाधारक"
        )}
      >
        <ShieldCheck size={13} className="badge-icon-svg" />
        <span>{t("verifiedBuyer", "Verified Buyer")}</span>
      </span>
    ) : (
      <span
        className="verification-badge-compact pending"
        title={getLabel(
          "Unverified Buyer: Always use Escrow",
          "सत्यापन लंबित: केवल एस्क्रो से सौदा करें",
          "पडताळणी प्रलंबित: फक्त एस्क्रो द्वारे व्यवहार करा"
        )}
      >
        <AlertTriangle size={13} className="badge-icon-svg" />
        <span>{t("unverifiedBuyer", "Verification Pending")}</span>
      </span>
    );
  }

  return isVerified ? (
    <div className="buyer-verification-card verified">
      <div className="badge-header">
        <div className="shield-wrap">
          <ShieldCheck size={18} color="#16a34a" />
        </div>
        <div>
          <strong className="badge-title">
            {t("verifiedBuyer", "Verified Buyer")}
          </strong>
          <small className="badge-subtitle">
            {t("buyerTrustDetails", "GST & Mandi Licensed Buyer")}
          </small>
        </div>
      </div>
      {buyer?.gstNumber && (
        <div className="credential-row">
          <span>GSTIN: <code>{buyer.gstNumber}</code></span>
          {buyer.organizationName && (
            <span>
              <Building2 size={12} style={{ display: "inline", marginRight: "3px" }} />
              {buyer.organizationName}
            </span>
          )}
        </div>
      )}
    </div>
  ) : (
    <div className="buyer-verification-card pending">
      <div className="badge-header">
        <div className="shield-wrap pending">
          <AlertTriangle size={18} color="#d97706" />
        </div>
        <div>
          <strong className="badge-title pending">
            {t("unverifiedBuyer", "Verification Pending")}
          </strong>
          <small className="badge-subtitle">
            {getLabel(
              "Account under review · Escrow deposit mandatory",
              "खाता समीक्षाधीन है · एस्क्रो जमा अनिवार्य है",
              "खाते तपासणी सुरू आहे · एस्क्रो ठेव अनिवार्य आहे"
            )}
          </small>
        </div>
      </div>
    </div>
  );
}

export default BuyerVerificationBadge;
