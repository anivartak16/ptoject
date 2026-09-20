import React, { useState, useEffect } from "react";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { isValidAadhaar } from "../../utils/verhoeff.js";

/**
 * KycModal: Real Aadhaar-based e-KYC Verification Modal
 * 
 * Features:
 * - 12-digit Aadhaar input with auto-formatting [ XXXX XXXX XXXX ]
 * - UIDAI Verhoeff algorithm client-side checksum validation
 * - Backend routing to authorized Aadhaar e-KYC/authentication provider (Surepass / Cashfree)
 * - Zero manual phone number input: OTP dispatched directly to Aadhaar-registered mobile
 * - Masked target confirmation ("OTP sent to ******1234")
 * - 6-digit OTP verification with 30-second countdown timer & resend protection
 * - Secure compliance: raw Aadhaar numbers and OTPs are never stored or logged
 * - Instant profile verification status update: "✓ Aadhaar KYC Verified"
 */
export function KycModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const { user, setUser } = useAuth();
  const { getLabel } = useLanguage();

  // Steps: 'aadhaar' | 'otp' | 'success'
  const [step, setStep] = useState("aadhaar");
  const [aadhaarRaw, setAadhaarRaw] = useState("");
  const [clientId, setClientId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [resendActive, setResendActive] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep("aadhaar");
      setAadhaarRaw("");
      setClientId("");
      setOtp("");
      setError("");
      setSuccessInfo(null);
      setResendTimer(30);
      setResendActive(false);
      setResendMessage("");
    }
  }, [isOpen]);

  // Countdown timer for Resend OTP (30s)
  useEffect(() => {
    let interval = null;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendActive(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  // Format Aadhaar with spaces: "XXXX XXXX XXXX"
  const handleAadhaarChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhaarRaw(val);
    setError("");
  };

  const formattedAadhaar = aadhaarRaw
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

  // Step 1: Send OTP via KrishiLink Backend -> Authorized Provider
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setResendMessage("");

    // Client-side Verhoeff and format check
    const validation = isValidAadhaar(aadhaarRaw);
    if (!validation.valid) {
      setError(validation.error || "Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/kyc/send-otp", {
        aadhaarNumber: aadhaarRaw,
      });

      const data = res.data?.data || {};
      setClientId(data.client_id);
      setSuccessInfo({
        aadhaarLast4: data.aadhaarLast4,
        maskedTarget: data.maskedTarget,
      });
      setStep("otp");
      setResendTimer(30);
      setResendActive(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to send OTP to the mobile registered with your Aadhaar. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP via Backend
  const handleResendOtp = async () => {
    if (!resendActive || !clientId) return;
    setLoading(true);
    setError("");
    setResendMessage("");
    try {
      const res = await api.post("/auth/kyc/resend-otp", {
        client_id: clientId,
      });
      setResendTimer(30);
      setResendActive(false);
      setOtp("");
      setResendMessage(res.data?.message || "OTP has been resent to your registered mobile.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP via KrishiLink Backend -> Authorized Provider
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/kyc/verify-otp", {
        client_id: clientId,
        otp: cleanOtp,
      });

      const updatedUser = res.data?.data?.user;
      if (updatedUser && setUser) {
        setUser(updatedUser);
      }

      const aadhaarLast4 = res.data?.data?.aadhaarLast4 || successInfo?.aadhaarLast4;
      setStep("success");

      if (onSuccess) {
        onSuccess({
          aadhaarLast4,
          verification: "VERIFIED",
          kycVerified: true,
          user: updatedUser,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Incorrect or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-modal-overlay animate-fadeIn" onClick={onClose}>
      <div className="kyc-modal-card animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="kyc-modal-header">
          <div className="kyc-header-title">
            <span className="kyc-badge-icon">🛡️</span>
            <div>
              <h3>{getLabel("Aadhaar e-KYC Verification", "आधार ई-केवाईसी सत्यापन", "आधार ई-केवायसी पडताळणी")}</h3>
              <small>{getLabel("Government Authorized Identity Verification", "सरकारी प्राधिकृत पहचान सत्यापन", "शासकीय प्राधिकृत ओळख पडताळणी")}</small>
            </div>
          </div>
          <button className="kyc-close-btn" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Visual Step Indicator */}
        <div className="kyc-stepper">
          <div className={`step-node ${step === "aadhaar" ? "active" : "done"}`}>
            <span className="step-num">1</span>
            <span>{getLabel("Aadhaar", "आधार", "आधार")}</span>
          </div>
          <div className="step-divider" />
          <div className={`step-node ${step === "otp" ? "active" : step === "success" ? "done" : ""}`}>
            <span className="step-num">2</span>
            <span>{getLabel("OTP Verify", "ओटीपी सत्यापन", "ओटीपी पडताळणी")}</span>
          </div>
          <div className="step-divider" />
          <div className={`step-node ${step === "success" ? "active done" : ""}`}>
            <span className="step-num">3</span>
            <span>{getLabel("Certified ✓", "प्रमाणित ✓", "प्रमाणित ✓")}</span>
          </div>
        </div>

        {error && <div className="kyc-error-banner">⚠️ {error}</div>}
        {resendMessage && <div className="kyc-success-banner">✓ {resendMessage}</div>}

        {/* STEP 1: AADHAAR INPUT */}
        {step === "aadhaar" && (
          <form onSubmit={handleSendOtp} className="kyc-form-body">
            <div className="kyc-info-box">
              <p>
                <strong>{getLabel("Why verify with Aadhaar?", "आधार से सत्यापन क्यों करें?", "आधार पडताळणी का करावी?")}</strong>
                <br />
                {getLabel(
                  "Verified profiles earn the green Verified ✓ trust badge, enabling direct trust, faster mandi settlement, and priority algorithmic buyer matching.",
                  "सत्यापित प्रोफाइल को हरा Verified ✓ ट्रस्ट बैज मिलता है, जिससे सीधा विश्वास, तेज़ भुगतान और प्राथमिकता मिलती है।",
                  "प्रमाणित प्रोफाइलला हिरवा Verified ✓ विश्वास बॅज मिळतो, ज्यामुळे थेट विश्वास आणि जलद व्यवहार होतात."
                )}
              </p>
            </div>

            <div className="kyc-input-group">
              <label htmlFor="aadhaarInput">
                {getLabel("Aadhaar Number", "आधार संख्या", "आधार क्रमांक")}
              </label>
              <div className="aadhaar-input-wrapper">
                <span className="id-icon">🪪</span>
                <input
                  id="aadhaarInput"
                  type="text"
                  inputMode="numeric"
                  placeholder="XXXX XXXX XXXX"
                  value={formattedAadhaar}
                  onChange={handleAadhaarChange}
                  maxLength={14} // 12 digits + 2 spaces
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                <small className="input-hint">
                  {aadhaarRaw.length}/12 {getLabel("digits entered", "अंक दर्ज", "अंक प्रविष्ट")}
                </small>
                {aadhaarRaw.length === 12 && (
                  <small style={{ color: "#16a34a", fontWeight: 700 }}>
                    ✓ {getLabel("Valid 12-digit format", "मान्य 12-अंक प्रारूप", "मान्य 12-अंकी स्वरूप")}
                  </small>
                )}
              </div>
            </div>

            <div className="kyc-demo-notice">
              <span>🔒 <strong>{getLabel("UIDAI Privacy & Security:", "यूआईडीएआई गोपनीयता एवं सुरक्षा:", "UIDAI गोपनीयता आणि सुरक्षा:")}</strong> {getLabel("Your Aadhaar number is verified through an authorized e-KYC provider. Full Aadhaar numbers are never permanently stored or displayed.", "आपकी आधार संख्या प्राधिकृत ई-केवाईसी प्रदाता द्वारा जांची जाती है। पूर्ण आधार संख्या कभी संग्रहीत नहीं की जाती।", "आपला आधार क्रमांक प्राधिकृत ई-केवायसी प्रदात्याद्वारे तपासला जातो. संपूर्ण आधार कधीही साठवला जात नाही.")}</span>
            </div>

            <div className="kyc-modal-actions">
              <button type="button" className="secondary" onClick={onClose}>
                {getLabel("Cancel", "रद्द करें", "रद्द करा")}
              </button>
              <button
                type="submit"
                className="primary"
                disabled={loading || aadhaarRaw.length !== 12}
              >
                {loading
                  ? getLabel("Requesting OTP…", "ओटीपी भेजा जा रहा है…", "ओटीपी पाठवत आहे…")
                  : getLabel("Send OTP →", "ओटीपी भेजें →", "ओटीपी पाठवा →")}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="kyc-form-body">
            <div className="kyc-otp-target-card">
              <div>
                <strong>{getLabel("Verify Aadhaar", "आधार सत्यापित करें", "आधार पडताळणी करा")}</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ink-secondary)" }}>
                  {getLabel(
                    "OTP has been sent to the mobile number registered with your Aadhaar.",
                    "आपके आधार से जुड़े पंजीकृत मोबाइल नंबर पर ओटीपी भेजा गया है।",
                    "आपल्या आधाराशी जोडलेल्या नोंदणीकृत मोबाईल क्रमांकावर ओटीपी पाठवला आहे."
                  )}
                  {successInfo?.maskedTarget && (
                    <span style={{ display: "block", marginTop: "4px", color: "#166534", fontWeight: 700 }}>
                      📱 {getLabel("OTP sent to", "ओटीपी भेजा गया:", "ओटीपी पाठवला:")} {successInfo.maskedTarget}
                    </span>
                  )}
                </p>
                <small style={{ color: "var(--muted)", display: "block", marginTop: "4px" }}>
                  Aadhaar Reference: <b>{successInfo?.aadhaarLast4 || `XXXX-XXXX-${aadhaarRaw.slice(-4)}`}</b>
                </small>
              </div>

            </div>

            <div className="kyc-input-group">
              <label htmlFor="otpInput">{getLabel("Enter OTP", "ओटीपी दर्ज करें", "ओटीपी प्रविष्ट करा")}</label>
              <div className="otp-input-wrapper">
                <input
                  id="otpInput"
                  type="text"
                  inputMode="numeric"
                  placeholder="_ _ _ _ _ _"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="kyc-resend-row">
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setStep("aadhaar");
                  setError("");
                  setResendMessage("");
                }}
              >
                ← {getLabel("Change Aadhaar number", "आधार संख्या बदलें", "आधार क्रमांक बदला")}
              </button>

              {resendActive ? (
                <button
                  type="button"
                  className="text-btn resend"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  🔄 {getLabel("Resend OTP", "ओटीपी पुनः भेजें", "ओटीपी पुन्हा पाठवा")}
                </button>
              ) : (
                <span className="resend-timer">
                  {getLabel("Resend OTP in", "ओटीपी पुनः भेजें", "ओटीपी पुन्हा पाठवा")} <b>{resendTimer}s</b>
                </span>
              )}
            </div>

            <div className="kyc-modal-actions">
              <button type="button" className="secondary" onClick={onClose}>
                {getLabel("Cancel", "रद्द करें", "रद्द करा")}
              </button>
              <button
                type="submit"
                className="primary"
                disabled={loading || otp.length !== 6}
              >
                {loading
                  ? getLabel("Verifying OTP…", "ओटीपी जांच रहे हैं…", "ओटीपी पडताळत आहे…")
                  : getLabel("Verify OTP ✓", "ओटीपी सत्यापित करें ✓", "ओटीपी पडताळणी करा ✓")}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "success" && (
          <div className="kyc-form-body kyc-success-view">
            <div className="kyc-success-animation">
              <span className="success-icon">✓</span>
            </div>

            <h2>{getLabel("✓ Aadhaar KYC Verified", "✓ आधार केवाईसी सत्यापित", "✓ आधार केवायसी प्रमाणित")}</h2>
            <p className="success-sub">
              {getLabel(
                "Your identity has been authenticated via authorized Aadhaar e-KYC. Your profile now carries the verified agricultural trust mark.",
                "आपकी पहचान प्राधिकृत आधार ई-केवाईसी द्वारा प्रमाणित हो गई है। आपकी प्रोफाइल पर अब सत्यापित विश्वास बैज सक्रिय है।",
                "आपली ओळख प्राधिकृत आधार ई-केवायसीद्वारे प्रमाणित झाली आहे. आपल्या प्रोफाइलवर आता प्रमाणित विश्वास बॅज सक्रिय आहे."
              )}
            </p>

            <div className="kyc-success-card">
              <div className="success-row">
                <span>{getLabel("Profile Status", "प्रोफाइल स्थिति", "प्रोफाइल स्थिती")}</span>
                <span className="verified-chip">KYC Verified ✓</span>
              </div>
              <div className="success-row">
                <span>{getLabel("Aadhaar Reference", "आधार संदर्भ", "आधार संदर्भ")}</span>
                <b>{successInfo?.aadhaarLast4 || `XXXX-XXXX-${aadhaarRaw.slice(-4)}`}</b>
              </div>
              <div className="success-row">
                <span>{getLabel("Authentication Provider", "प्रमाणीकरण प्रदाता", "प्रमाणीकरण प्रदाता")}</span>
                <b style={{ color: "#16a34a" }}>UIDAI Authorized e-KYC</b>
              </div>
              <div className="success-row">
                <span>{getLabel("Marketplace Trust Badge", "बाजार ट्रस्ट बैज", "बाजार विश्वास बॅज")}</span>
                <span className="badge-preview">✓ KYC Verified</span>
              </div>
            </div>

            <div className="kyc-modal-actions" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="primary"
                style={{ minWidth: "180px" }}
                onClick={onClose}
              >
                {getLabel("Done & Continue", "संपन्न एवं जारी रखें", "पूर्ण करा आणि पुढे चला")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KycModal;
