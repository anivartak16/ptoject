import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export function FarmerVerificationBadge({
  verification = "PENDING",
  farmer = null,
  compact = false,
  showDetails = false,
}) {
  const { t, getLabel } = useLanguage();

  const isVerified =
    verification === "VERIFIED" ||
    farmer?.verification === "VERIFIED" ||
    farmer?.ekycStatus === "VERIFIED" ||
    farmer?.verificationBadge === "EKYC_VERIFIED_FARMER";

  const docTypeLabel =
    farmer?.ekycType === "AADHAAR"
      ? getLabel("Aadhaar e-KYC", "आधार ई-केवाईसी", "आधार ई-केवायसी")
      : farmer?.ekycType === "PM_KISAN"
      ? getLabel("PM-KISAN ID", "पीएम-किसान आईडी", "पीएम-किसान ओळखपत्र")
      : farmer?.ekycType === "LAND_RECORD"
      ? getLabel("Land Records (7/12)", "भू-अभिलेख (7/12)", "जमीन महसूल (७/१२)")
      : farmer?.ekycType === "KCC"
      ? getLabel("Kisan Credit Card", "किसान क्रेडिट कार्ड", "किसान क्रेडिट कार्ड")
      : getLabel("Govt Authenticated", "सरकारी सत्यापित", "शासकीय प्रमाणित");

  if (compact) {
    return isVerified ? (
      <span
        className="verification-badge-compact verified"
        style={{
          background: "#ecfdf5",
          color: "#047857",
          borderColor: "#a7f3d0",
        }}
        title={getLabel(
          `Govt e-KYC Verified Farmer (${docTypeLabel})`,
          `सरकारी ई-केवाईसी सत्यापित किसान (${docTypeLabel})`,
          `शासकीय ई-केवायसी प्रमाणित शेतकरी (${docTypeLabel})`
        )}
      >
        <ShieldCheck size={13} className="badge-icon-svg" color="#059669" />
        <span>{getLabel("e-KYC Verified", "ई-केवाईसी सत्यापित", "ई-केवायसी प्रमाणित")}</span>
      </span>
    ) : (
      <span
        className="verification-badge-compact pending"
        title={getLabel(
          "e-KYC Pending: Basic registration only",
          "ई-केवाईसी लंबित: केवल बुनियादी पंजीकरण",
          "ई-केवायसी प्रलंबित: केवळ मूलभूत नोंदणी"
        )}
      >
        <AlertCircle size={13} className="badge-icon-svg" />
        <span>{getLabel("e-KYC Pending", "ई-केवाईसी लंबित", "ई-केवायसी प्रलंबित")}</span>
      </span>
    );
  }

  return isVerified ? (
    <div
      className="farmer-verification-card verified animate-fadeIn"
      style={{
        border: "1px solid #86efac",
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        borderRadius: "10px",
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            background: "#16a34a",
            color: "#ffffff",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 4px rgba(22, 163, 74, 0.2)",
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div>
          <strong style={{ display: "block", color: "#14532d", fontSize: "14px", fontWeight: 700 }}>
            {getLabel("Official e-KYC Verified Farmer", "आधिकारिक ई-केवाईसी सत्यापित किसान", "अधिकृत ई-केवायसी प्रमाणित शेतकरी")}
          </strong>
          <small style={{ color: "#166534", fontSize: "12px" }}>
            {getLabel(
              "UIDAI / PM-KISAN Govt Registry Authenticated",
              "यूआईडीएआई / पीएम-किसान सरकारी रिकॉर्ड से सत्यापित",
              "युआयडीएआय / पीएम-किसान शासकीय नोंदणीवरून प्रमाणित"
            )}
          </small>
        </div>
      </div>

      {(showDetails || farmer?.ekycIdNumber) && (
        <div
          style={{
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px solid #bbf7d0",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "12px",
            color: "#166534",
          }}
        >
          <span>
            <b>{getLabel("Doc Type", "दस्तावेज़", "कागदपत्र")}:</b> {docTypeLabel}
          </span>
          {farmer?.ekycIdNumber && (
            <span>
              <b>{getLabel("ID", "पहचान", "ओळख क्रमांक")}:</b> <code>{farmer.ekycIdNumber}</code>
            </span>
          )}
          {farmer?.ekycVerifiedAt && (
            <span>
              <b>{getLabel("Verified On", "सत्यापन तिथि", "प्रमाणित दिनांक")}:</b>{" "}
              {new Date(farmer.ekycVerifiedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      )}
    </div>
  ) : (
    <div
      className="farmer-verification-card pending animate-fadeIn"
      style={{
        border: "1px solid #fde68a",
        background: "#fffbeb",
        borderRadius: "10px",
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            background: "#d97706",
            color: "#ffffff",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AlertCircle size={20} />
        </div>
        <div>
          <strong style={{ display: "block", color: "#92400e", fontSize: "14px", fontWeight: 700 }}>
            {getLabel("e-KYC Verification Pending", "ई-केवाईसी सत्यापन लंबित", "ई-केवायसी पडताळणी प्रलंबित")}
          </strong>
          <small style={{ color: "#b45309", fontSize: "12px" }}>
            {getLabel(
              "Complete e-KYC using Aadhaar, PM-KISAN ID, or Land Record (7/12)",
              "आधार, पीएम-किसान आईडी, अथवा 7/12 भू-अभिलेख से ई-केवाईसी पूर्ण करें",
              "आधार, पीएम-किसान ओळखपत्र किंवा ७/१२ द्वारे ई-केवायसी पूर्ण करा"
            )}
          </small>
        </div>
      </div>
    </div>
  );
}

export default FarmerVerificationBadge;
