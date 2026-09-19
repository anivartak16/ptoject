import React, { useState, useEffect } from "react";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * KycModal: Clean Aadhaar + Mock OTP verification modal
 * Features:
 * - 12-digit Aadhaar input with auto-formatting
 * - Mobile number OTP target display
 * - Demo mock OTP support (123456)
 * - OTP countdown timer and resend capability
 * - Loading, error, and success states
 * - Secure prototype design: never stores full Aadhaar numbers
 */
export function KycModal({
  isOpen,
  onClose,
  onSuccess,
  initialPhone = "",
  userName = "",
}) {
  const { user, setUser } = useAuth();

  // Steps: 'aadhaar' | 'otp' | 'success'
  const [step, setStep] = useState("aadhaar");
  const [aadhaarRaw, setAadhaarRaw] = useState("");
  const [phone, setPhone] = useState(initialPhone || user?.phone || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [resendActive, setResendActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("aadhaar");
      setAadhaarRaw("");
      setOtp("");
      setError("");
      setSuccessInfo(null);
      setPhone(initialPhone || user?.phone || "");
    }
  }, [isOpen, initialPhone, user]);

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

  // Format Aadhaar with spaces: "1234 5678 9012"
  const handleAadhaarChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhaarRaw(val);
    setError("");
  };

  const formattedAadhaar = aadhaarRaw
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (aadhaarRaw.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/kyc/send-otp", {
        aadhaarNumber: aadhaarRaw,
        phone: phone || user?.phone || "9876543210",
      });

      setSuccessInfo({
        aadhaarLast4: res.data.data.aadhaarLast4,
        maskedTarget: res.data.data.maskedTarget,
      });
      setStep("otp");
      setResendTimer(30);
      setResendActive(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!resendActive) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/kyc/send-otp", {
        aadhaarNumber: aadhaarRaw,
        phone: phone || user?.phone || "9876543210",
      });
      setResendTimer(30);
      setResendActive(false);
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError("Please enter the OTP received");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/kyc/verify-otp", {
        otp: otp.trim(),
        aadhaarLast4: successInfo?.aadhaarLast4 || `XXXX-XXXX-${aadhaarRaw.slice(-4)}`,
        aadhaarNumber: aadhaarRaw,
      });

      const updatedUser = res.data.data?.user;
      if (updatedUser && setUser) {
        setUser(updatedUser);
      }

      setStep("success");
      if (onSuccess) {
        onSuccess({
          aadhaarLast4: successInfo?.aadhaarLast4 || `XXXX-XXXX-${aadhaarRaw.slice(-4)}`,
          verification: "VERIFIED",
          kycVerified: true,
          user: updatedUser,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Use demo OTP: 123456");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-modal-overlay" onClick={onClose}>
      <div className="kyc-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="kyc-modal-header">
          <div className="kyc-header-title">
            <span className="kyc-badge-icon">🛡️</span>
            <div>
              <h3>Aadhaar KYC Verification</h3>
              <small>Government Identity & Trust Certification</small>
            </div>
          </div>
          <button className="kyc-close-btn" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="kyc-stepper">
          <div className={`step-node ${step === "aadhaar" ? "active" : "done"}`}>
            <span className="step-num">1</span>
            <span>Aadhaar</span>
          </div>
          <div className="step-divider" />
          <div className={`step-node ${step === "otp" ? "active" : step === "success" ? "done" : ""}`}>
            <span className="step-num">2</span>
            <span>OTP Verify</span>
          </div>
          <div className="step-divider" />
          <div className={`step-node ${step === "success" ? "active done" : ""}`}>
            <span className="step-num">3</span>
            <span>Certified ✓</span>
          </div>
        </div>

        {error && <div className="kyc-error-banner">⚠️ {error}</div>}

        {/* STEP 1: AADHAAR INPUT */}
        {step === "aadhaar" && (
          <form onSubmit={handleSendOtp} className="kyc-form-body">
            <div className="kyc-info-box">
              <p>
                <strong>Why verify with Aadhaar?</strong>
                <br />
                Verified profiles receive a green <b>Verified ✓</b> badge, building trust between farmers and institutional buyers for rapid deal closures.
              </p>
            </div>

            <div className="kyc-input-group">
              <label htmlFor="aadhaarInput">
                Enter 12-Digit Aadhaar Number
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
              <small className="input-hint">
                {aadhaarRaw.length}/12 digits entered
              </small>
            </div>

            <div className="kyc-input-group">
              <label htmlFor="kycPhone">
                Registered Mobile Number (For OTP)
              </label>
              <input
                id="kycPhone"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <small className="input-hint">
                OTP will be simulated on this registered number.
              </small>
            </div>

            <div className="kyc-demo-notice">
              <span>🔒 <strong>Prototype / Demo Mode:</strong> Actual Aadhaar numbers are never stored in the database. Only masked numbers (e.g. <code>XXXX-XXXX-1234</code>) are recorded.</span>
            </div>

            <div className="kyc-modal-actions">
              <button type="button" className="secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="primary"
                disabled={loading || aadhaarRaw.length !== 12}
              >
                {loading ? "Sending OTP..." : "Send Verification OTP →"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="kyc-form-body">
            <div className="kyc-otp-target-card">
              <div>
                <strong>Enter OTP sent to your phone</strong>
                <p>
                  A 6-digit code was sent to registered mobile{" "}
                  <b>{successInfo?.maskedTarget || phone || "****3210"}</b> linked with Aadhaar{" "}
                  <b>{successInfo?.aadhaarLast4 || `XXXX-XXXX-${aadhaarRaw.slice(-4)}`}</b>.
                </p>
              </div>
              <div className="demo-otp-pill">
                💡 Demo OTP: <b>123456</b>
              </div>
            </div>

            <div className="kyc-input-group">
              <label htmlFor="otpInput">Enter 6-Digit OTP</label>
              <div className="otp-input-wrapper">
                <input
                  id="otpInput"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
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
                onClick={() => setStep("aadhaar")}
              >
                ← Change Aadhaar number
              </button>

              {resendActive ? (
                <button
                  type="button"
                  className="text-btn resend"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  🔄 Resend OTP
                </button>
              ) : (
                <span className="resend-timer">
                  Resend OTP in <b>{resendTimer}s</b>
                </span>
              )}
            </div>

            <div className="kyc-modal-actions">
              <button type="button" className="secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="primary"
                disabled={loading || otp.length < 6}
              >
                {loading ? "Verifying OTP..." : "Verify & Complete KYC ✓"}
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

            <h2>KYC Verification Successful ✓</h2>
            <p className="success-sub">
              Your identity has been verified via UIDAI mock authentication. Your profile now carries the verified agricultural trust mark.
            </p>

            <div className="kyc-success-card">
              <div className="success-row">
                <span>Account Status</span>
                <span className="verified-chip">Verified ✓</span>
              </div>
              <div className="success-row">
                <span>Aadhaar Reference</span>
                <b>{successInfo?.aadhaarLast4 || `XXXX-XXXX-${aadhaarRaw.slice(-4)}`}</b>
              </div>
              <div className="success-row">
                <span>KYC Tier</span>
                <b style={{ color: "#16a34a" }}>Tier 1 Full Trust Verified</b>
              </div>
              <div className="success-row">
                <span>Marketplace Badge</span>
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
                Done & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KycModal;
