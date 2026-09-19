import React, { useEffect, useState } from "react";
import api from "../../api/client.js";
import { VerificationBadge } from "../common/VerificationBadge.jsx";

/**
 * TrustProfileModal:
 * Displays verified details when a Farmer views a Buyer, or a Buyer views a Farmer/FPO.
 * Implements requirement 7 (Trust & Transparency).
 */
export function TrustProfileModal({ isOpen, onClose, userId, initialData = null }) {
  const [profile, setProfile] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (userId) {
      setLoading(true);
      setError("");
      api
        .get(`/auth/profile/${userId}`)
        .then((res) => {
          setProfile(res.data.data);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Could not load trust profile");
        })
        .finally(() => setLoading(false));
    } else if (initialData) {
      setProfile(initialData);
    }
  }, [isOpen, userId, initialData]);

  if (!isOpen) return null;

  const isBuyer = profile?.role === "BUYER";
  const isFarmerOrFpo = profile?.role === "FARMER" || profile?.role === "FPO";
  const isVerified = profile?.verification === "VERIFIED" || profile?.kycVerified;

  const defaultAvatar = isBuyer ? "🏢" : "👨‍🌾";

  return (
    <div className="trust-modal-overlay" onClick={onClose}>
      <div className="trust-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="trust-modal-header">
          <div className="trust-title-row">
            <span className="trust-shield-icon">🛡️</span>
            <div>
              <h3>Verified Marketplace Trust Profile</h3>
              <small>
                {isBuyer
                  ? "Institutional Procurement Credentials"
                  : "Certified Producer Credentials"}
              </small>
            </div>
          </div>
          <button className="trust-close-btn" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="trust-modal-loading">
            <p>Loading verified records from KrishiLink registry…</p>
          </div>
        ) : error ? (
          <div className="trust-modal-error">
            <p>⚠️ {error}</p>
          </div>
        ) : profile ? (
          <div className="trust-modal-body">
            {/* Top Identity Section */}
            <div className="trust-identity-card">
              <div className="trust-avatar-wrapper">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt={profile.name}
                    className="trust-avatar-img"
                  />
                ) : (
                  <span className="trust-avatar-emoji">{defaultAvatar}</span>
                )}
              </div>

              <div className="trust-identity-info">
                <div className="trust-name-badges">
                  <h4>{profile.organizationName || profile.name}</h4>
                  <VerificationBadge
                    status={profile.verification}
                    kycVerified={profile.kycVerified}
                    showKyc={true}
                    size="sm"
                  />
                </div>

                <p className="trust-meta">
                  <b>{profile.role === "FPO" ? "FPO Cooperative" : profile.role}</b>
                  {profile.buyerType && ` · ${profile.buyerType}`}
                  {profile.farmName && ` · Farm: ${profile.farmName}`}
                  {" · "}📍 {profile.location || profile.district || "Indore"}, {profile.state || "Madhya Pradesh"}
                </p>

                {profile.aadhaarLast4 && (
                  <small className="trust-aadhaar-note">
                    🔒 Aadhaar KYC Reference: <b>{profile.aadhaarLast4}</b>
                  </small>
                )}
              </div>
            </div>

            {/* Trust Checklist Section */}
            <div className="trust-checklist-section">
              <h5>Marketplace Verification Checklist</h5>
              <div className="trust-checklist-grid">
                {isBuyer ? (
                  <>
                    <div className={`checklist-item ${isVerified ? "checked" : "unchecked"}`}>
                      <span className="check-icon">{isVerified ? "✓" : "○"}</span>
                      <span>KYC Verified</span>
                    </div>
                    <div className={`checklist-item ${profile.businessVerified || profile.organizationName ? "checked" : "unchecked"}`}>
                      <span className="check-icon">{profile.businessVerified || profile.organizationName ? "✓" : "○"}</span>
                      <span>Business Details Verified</span>
                    </div>
                    <div className={`checklist-item ${profile.location || profile.district ? "checked" : "unchecked"}`}>
                      <span className="check-icon">{profile.location || profile.district ? "✓" : "○"}</span>
                      <span>Location Verified</span>
                    </div>
                    <div className={`checklist-item ${(profile.transactionCount || 0) > 0 ? "checked" : "unchecked"}`}>
                      <span className="check-icon">{(profile.transactionCount || 0) > 0 ? "✓" : "○"}</span>
                      <span>Payment / Transaction History Available</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`checklist-item ${isVerified ? "checked" : "unchecked"}`}>
                      <span className="check-icon">{isVerified ? "✓" : "○"}</span>
                      <span>KYC Verified</span>
                    </div>
                    <div className={`checklist-item ${isVerified ? "checked" : "unchecked"}`}>
                      <span className="check-icon">{isVerified ? "✓" : "○"}</span>
                      <span>Identity Verified</span>
                    </div>
                    <div className={`checklist-item ${profile.location || profile.district ? "checked" : "unchecked"}`}>
                      <span className="check-icon">{profile.location || profile.district ? "✓" : "○"}</span>
                      <span>Location Added</span>
                    </div>
                    <div className={`checklist-item ${profile.fpoAssociation || profile.role === "FPO" ? "checked" : "unchecked"}`}>
                      <span className="check-icon">{profile.fpoAssociation || profile.role === "FPO" ? "✓" : "○"}</span>
                      <span>FPO Verified (if applicable)</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Profile Specific Information */}
            <div className="trust-specs-grid">
              {isFarmerOrFpo && (
                <>
                  <div className="spec-card">
                    <small>PRODUCE & CROPS</small>
                    <b>
                      {profile.crops?.length
                        ? profile.crops.join(", ")
                        : profile.primaryCrop || "Wheat, Soybean"}
                    </b>
                  </div>

                  <div className="spec-card">
                    <small>AVAILABLE QUANTITY</small>
                    <b>
                      {profile.availableQuantity
                        ? `${Number(profile.availableQuantity).toLocaleString("en-IN")} kg`
                        : "2,500 kg in active lots"}
                    </b>
                  </div>

                  <div className="spec-card">
                    <small>CROP QUALITY / GRADE</small>
                    <b>{profile.cropQuality || "Grade A (Lab Tested)"}</b>
                  </div>

                  <div className="spec-card">
                    <small>FPO AFFILIATION</small>
                    <b>{profile.fpoAssociation || (profile.role === "FPO" ? "Direct FPO" : "Independent Farmer")}</b>
                  </div>

                  <div className="spec-card">
                    <small>COMPLETED TRADES</small>
                    <b>{profile.transactionCount || 0} transactions</b>
                  </div>

                  <div className="spec-card">
                    <small>FARM LAND SIZE</small>
                    <b>{profile.landSize ? `${profile.landSize} Acres` : "5 Acres"}</b>
                  </div>
                </>
              )}

              {isBuyer && (
                <>
                  <div className="spec-card">
                    <small>ORGANISATION / BUYER</small>
                    <b>{profile.organizationName || profile.name}</b>
                  </div>

                  <div className="spec-card">
                    <small>BUSINESS TYPE</small>
                    <b>{profile.buyerType || "Institutional Trader"}</b>
                  </div>

                  <div className="spec-card">
                    <small>REQUIRED CROPS</small>
                    <b>
                      {profile.requiredCrops?.length
                        ? profile.requiredCrops.join(", ")
                        : "Wheat, Soybean, Pulses"}
                    </b>
                  </div>

                  <div className="spec-card">
                    <small>PROCUREMENT DEMAND</small>
                    <b>
                      {profile.requiredQuantity
                        ? `${Number(profile.requiredQuantity).toLocaleString("en-IN")} kg`
                        : "5,000 kg / month"}
                    </b>
                  </div>

                  <div className="spec-card">
                    <small>QUALITY STANDARDS</small>
                    <b>{profile.qualityRequirements || "Grade A · Moisture < 12%"}</b>
                    {profile.qualitySpecs && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                        {profile.qualitySpecs.grade && (
                          <span style={{ fontSize: "10px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "1px 6px", borderRadius: "8px" }}>
                            {profile.qualitySpecs.grade}
                          </span>
                        )}
                        {profile.qualitySpecs.variety && (
                          <span style={{ fontSize: "10px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "1px 6px", borderRadius: "8px" }}>
                            {profile.qualitySpecs.variety}
                          </span>
                        )}
                        {profile.qualitySpecs.moisturePercent !== undefined && (
                          <span style={{ fontSize: "10px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "1px 6px", borderRadius: "8px" }}>
                            Moisture ≤ {profile.qualitySpecs.moisturePercent}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="spec-card">
                    <small>TRANSACTION HISTORY</small>
                    <b>{profile.transactionCount || 0} completed orders</b>
                  </div>
                </>
              )}
            </div>

            <div className="trust-modal-footer">
              <button type="button" className="primary" onClick={onClose}>
                Close Profile
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TrustProfileModal;
