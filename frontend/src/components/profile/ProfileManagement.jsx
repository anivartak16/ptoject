import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { VerificationBadge } from "../common/VerificationBadge.jsx";
import { KycModal } from "./KycModal.jsx";

/**
 * ProfileManagement:
 * Complete management view for Farmer and Buyer profiles.
 * Features:
 * - Dynamic Farmer and Buyer views with all required fields
 * - KYC Verification status and "Verify Now" modal integration
 * - Trust checklist display
 * - Editable profile information
 * - Responsive UI matching KrishiLink theme
 */
export function ProfileManagement() {
  const { r } = useParams();
  const { user, setUser } = useAuth();

  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [txCount, setTxCount] = useState(0);

  // Form state initialized from current user
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    district: user?.district || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
    address: user?.address || "",

    // Farmer specific
    farmName: user?.farmName || "",
    landSize: user?.landSize || "",
    primaryCrop: user?.primaryCrop || "Wheat",
    crops: user?.crops?.length ? user.crops.join(", ") : user?.primaryCrop || "Wheat, Soybean",
    availableQuantity: user?.availableQuantity || 2500,
    cropQuality: user?.cropQuality || "Grade A",
    fpoAssociation: user?.fpoAssociation || "Narmada FPO",

    // Buyer specific
    organizationName: user?.organizationName || "",
    buyerType: user?.buyerType || "TRADER",
    requiredCrops: user?.requiredCrops?.length ? user.requiredCrops.join(", ") : "Wheat, Soybean",
    requiredQuantity: user?.requiredQuantity || 5000,
    qualityRequirements: user?.qualityRequirements || "Grade A / Moisture < 12%",

    // Profile photo avatar
    profilePhoto: user?.profilePhoto || "",
  });

  // Load transaction count and latest profile details
  useEffect(() => {
    if (user?._id) {
      api
        .get(`/auth/profile/${user._id}`)
        .then((res) => {
          const data = res.data.data;
          setTxCount(data.transactionCount || 0);
          if (data) {
            setForm((prev) => ({
              ...prev,
              name: data.name || prev.name,
              phone: data.phone || prev.phone,
              location: data.location || prev.location,
              district: data.district || prev.district,
              state: data.state || prev.state,
              pincode: data.pincode || prev.pincode,
              address: data.address || prev.address,
              farmName: data.farmName || prev.farmName,
              landSize: data.landSize || prev.landSize,
              primaryCrop: data.primaryCrop || prev.primaryCrop,
              crops: data.crops?.length ? data.crops.join(", ") : prev.crops,
              availableQuantity: data.availableQuantity || prev.availableQuantity,
              cropQuality: data.cropQuality || prev.cropQuality,
              fpoAssociation: data.fpoAssociation || prev.fpoAssociation,
              organizationName: data.organizationName || prev.organizationName,
              buyerType: data.buyerType || prev.buyerType,
              requiredCrops: data.requiredCrops?.length ? data.requiredCrops.join(", ") : prev.requiredCrops,
              requiredQuantity: data.requiredQuantity || prev.requiredQuantity,
              qualityRequirements: data.qualityRequirements || prev.qualityRequirements,
              profilePhoto: data.profilePhoto || prev.profilePhoto,
            }));
          }
        })
        .catch(() => {});
    }
  }, [user?._id]);

  const isFarmer = user?.role === "FARMER";
  const isBuyer = user?.role === "BUYER";
  const isFpo = user?.role === "FPO";
  const isVerified = user?.verification === "VERIFIED" || user?.kycVerified;
  const isPending = user?.verification === "PENDING";

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg("");
    setProfileErr("");

    try {
      const payload = {
        ...form,
        crops: form.crops.split(",").map((c) => c.trim()).filter(Boolean),
        requiredCrops: form.requiredCrops.split(",").map((c) => c.trim()).filter(Boolean),
        availableQuantity: Number(form.availableQuantity) || undefined,
        requiredQuantity: Number(form.requiredQuantity) || undefined,
        landSize: Number(form.landSize) || undefined,
      };

      const res = await api.put("/auth/profile", payload);
      setUser(res.data.data);
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      setProfileErr(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleKycSuccess = (result) => {
    setProfileMsg("🎉 KYC Verification completed successfully! Your profile is now verified.");
    if (result.user) {
      setUser(result.user);
    }
  };

  const avatarPlaceholder = isBuyer ? "🏢" : "🌾";

  return (
    <section className="profile-management-view">
      <div className="profile-header-banner">
        <div>
          <p className="eyebrow">MARKETPLACE PROFILE & TRUST MANAGEMENT</p>
          <h1>{isBuyer ? "Buyer Organization Profile" : "Farmer Profile & Identity"}</h1>
          <p className="profile-subheading">
            {isBuyer
              ? "Verified buyer credentials build trust with farmers and FPOs, accelerating grain procurement."
              : "Complete your KYC and farm details to earn the verified badge and sell directly to verified buyers."}
          </p>
        </div>

        <div className="profile-header-status-card">
          <span className="status-caption">KYC VERIFICATION STATUS</span>
          <VerificationBadge
            status={user?.verification}
            kycVerified={user?.kycVerified}
            showKyc={true}
            size="lg"
          />
          {!isVerified && (
            <button
              type="button"
              className="primary verify-now-btn"
              onClick={() => setIsKycModalOpen(true)}
            >
              🛡️ Verify KYC Now
            </button>
          )}
        </div>
      </div>

      {profileMsg && <div className="form-message success">{profileMsg}</div>}
      {profileErr && <div className="form-message error">{profileErr}</div>}

      <div className="profile-layout-grid">
        {/* LEFT COLUMN: VISUAL PROFILE CARD & TRUST CHECKLIST */}
        <div className="profile-left-col">
          {/* Identity & Verification Card */}
          <div className="panel profile-card-main">
            <div className="profile-card-top">
              <div className="profile-avatar-box">
                {form.profilePhoto ? (
                  <img
                    src={form.profilePhoto}
                    alt={user?.name}
                    className="avatar-photo"
                  />
                ) : (
                  <span className="avatar-icon">{avatarPlaceholder}</span>
                )}
                {isVerified && <span className="verified-check-pill" title="KYC Verified">✓</span>}
              </div>

              <div className="profile-name-area">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "22px" }}>
                    {isBuyer ? form.organizationName || user?.name : user?.name}
                  </h2>
                  <VerificationBadge
                    status={user?.verification}
                    kycVerified={user?.kycVerified}
                    showKyc={false}
                    size="sm"
                  />
                </div>

                <p className="profile-role-tag">
                  {isBuyer
                    ? `Buyer · ${form.buyerType}`
                    : isFpo
                    ? "FPO Representative"
                    : "Farmer Producer"}
                  {" · "}📍 {form.location || form.district || "Indore"}, {form.state || "Madhya Pradesh"}
                </p>

                {user?.aadhaarLast4 && (
                  <div className="aadhaar-badge-pill">
                    🔒 Aadhaar KYC Reference: <b>{user.aadhaarLast4}</b>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className={`verification-status-box ${isVerified ? "is-verified" : isPending ? "is-pending" : "is-unverified"}`}>
              <div className="status-box-header">
                <span className="box-icon">
                  {isVerified ? "✓" : isPending ? "⏳" : "⚠️"}
                </span>
                <div>
                  <strong>
                    {isVerified
                      ? "KYC Verified Profile"
                      : isPending
                      ? "Verification Pending Review"
                      : "Unverified Profile"}
                  </strong>
                  <p>
                    {isVerified
                      ? "Your Aadhaar identity has been verified. Verified buyers and farmers prioritize your transactions."
                      : isPending
                      ? "Your verification details are currently under processing. Complete OTP verification to finalize."
                      : "Unverified accounts have lower trust visibility in marketplace matching and negotiations."}
                  </p>
                </div>
              </div>

              {!isVerified && (
                <button
                  type="button"
                  className="primary"
                  style={{ width: "100%", marginTop: "10px" }}
                  onClick={() => setIsKycModalOpen(true)}
                >
                  🚀 Complete KYC Verification Now
                </button>
              )}
            </div>

            {/* Trust Checklist */}
            <div className="trust-checklist-card">
              <h4>Trust & Verification Checklist</h4>
              <div className="checklist-items">
                {isBuyer ? (
                  <>
                    <div className={`check-row ${isVerified ? "done" : ""}`}>
                      <span className="check-bullet">{isVerified ? "✓" : "○"}</span>
                      <div>
                        <b>KYC Verified</b>
                        <small>{isVerified ? "Aadhaar authentication verified" : "Action required: Complete KYC"}</small>
                      </div>
                    </div>
                    <div className={`check-row ${form.organizationName ? "done" : ""}`}>
                      <span className="check-bullet">{form.organizationName ? "✓" : "○"}</span>
                      <div>
                        <b>Business Details Verified</b>
                        <small>{form.organizationName ? `${form.organizationName} · ${form.buyerType}` : "Enter organization name"}</small>
                      </div>
                    </div>
                    <div className={`check-row ${form.location || form.district ? "done" : ""}`}>
                      <span className="check-bullet">{form.location || form.district ? "✓" : "○"}</span>
                      <div>
                        <b>Location Verified</b>
                        <small>{form.location || form.district || "Indore"}, {form.state || "Madhya Pradesh"}</small>
                      </div>
                    </div>
                    <div className={`check-row ${txCount > 0 ? "done" : ""}`}>
                      <span className="check-bullet">{txCount > 0 ? "✓" : "○"}</span>
                      <div>
                        <b>Payment / Transaction History Available</b>
                        <small>{txCount > 0 ? `${txCount} completed transactions` : "First trade will activate history"}</small>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`check-row ${isVerified ? "done" : ""}`}>
                      <span className="check-bullet">{isVerified ? "✓" : "○"}</span>
                      <div>
                        <b>KYC Verified</b>
                        <small>{isVerified ? "Aadhaar authentication verified" : "Action required: Complete KYC"}</small>
                      </div>
                    </div>
                    <div className={`check-row ${isVerified ? "done" : ""}`}>
                      <span className="check-bullet">{isVerified ? "✓" : "○"}</span>
                      <div>
                        <b>Identity Verified</b>
                        <small>{isVerified ? "UIDAI mock OTP confirmed" : "Verification pending"}</small>
                      </div>
                    </div>
                    <div className={`check-row ${form.location || form.district ? "done" : ""}`}>
                      <span className="check-bullet">{form.location || form.district ? "✓" : "○"}</span>
                      <div>
                        <b>Location Added</b>
                        <small>{form.location || form.district || "Indore"}, {form.state || "Madhya Pradesh"}</small>
                      </div>
                    </div>
                    <div className={`check-row ${form.fpoAssociation ? "done" : ""}`}>
                      <span className="check-bullet">{form.fpoAssociation ? "✓" : "○"}</span>
                      <div>
                        <b>FPO Verified (if applicable)</b>
                        <small>{form.fpoAssociation || "Associate with local FPO"}</small>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="profile-highlights-grid">
              <div className="highlight-cell">
                <small>COMPLETED TRADES</small>
                <b>{txCount} Orders</b>
              </div>
              <div className="highlight-cell">
                <small>{isBuyer ? "DEMAND VOLUME" : "HARVEST QUANTITY"}</small>
                <b>
                  {isBuyer
                    ? `${Number(form.requiredQuantity).toLocaleString("en-IN")} kg`
                    : `${Number(form.availableQuantity).toLocaleString("en-IN")} kg`}
                </b>
              </div>
              <div className="highlight-cell">
                <small>{isBuyer ? "QUALITY REQUIREMENT" : "CROP QUALITY"}</small>
                <b>{isBuyer ? form.qualityRequirements : form.cropQuality}</b>
              </div>
              <div className="highlight-cell">
                <small>{isBuyer ? "PROCUREMENT CROPS" : "ACTIVE CROPS"}</small>
                <b>{isBuyer ? form.requiredCrops : form.crops}</b>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EDIT PROFILE DETAILS */}
        <div className="profile-right-col">
          <form className="form-card profile-edit-card" onSubmit={handleSave}>
            <div className="form-card-heading">
              <div>
                <h3>Update Profile Details</h3>
                <p>Ensure your contact, crop and business details are accurate.</p>
              </div>
            </div>

            <h4>Contact & Identity</h4>
            <div className="form-grid">
              <label>
                Full Name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </label>

              <label>
                Village / City
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </label>

              <label>
                District
                <input
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  required
                />
              </label>

              <label>
                State
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                />
              </label>

              <label>
                PIN Code
                <input
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                />
              </label>
            </div>

            {/* FARMER SPECIFIC DETAILS */}
            {!isBuyer && (
              <>
                <h4 style={{ marginTop: "24px" }}>Farm & Crop Details</h4>
                <div className="form-grid">
                  <label>
                    Farm Name
                    <input
                      value={form.farmName}
                      onChange={(e) => setForm({ ...form, farmName: e.target.value })}
                      placeholder="e.g. Patel Krishi Farm"
                    />
                  </label>

                  <label>
                    Land Size (Acres)
                    <input
                      type="number"
                      step="0.1"
                      value={form.landSize}
                      onChange={(e) => setForm({ ...form, landSize: e.target.value })}
                    />
                  </label>

                  <label>
                    Crops Grown (Comma separated)
                    <input
                      value={form.crops}
                      onChange={(e) => setForm({ ...form, crops: e.target.value })}
                      placeholder="e.g. Wheat, Soybean, Gram"
                      required
                    />
                  </label>

                  <label>
                    Available Quantity (kg)
                    <input
                      type="number"
                      value={form.availableQuantity}
                      onChange={(e) => setForm({ ...form, availableQuantity: e.target.value })}
                      required
                    />
                  </label>

                  <label>
                    Crop Quality / Grade
                    <select
                      value={form.cropQuality}
                      onChange={(e) => setForm({ ...form, cropQuality: e.target.value })}
                    >
                      <option value="Grade A">Grade A (Premium / Export Quality)</option>
                      <option value="Grade B">Grade B (Standard Market Quality)</option>
                      <option value="Grade C">Grade C (Industrial / Feed Quality)</option>
                    </select>
                  </label>

                  <label>
                    FPO Association (if applicable)
                    <input
                      value={form.fpoAssociation}
                      onChange={(e) => setForm({ ...form, fpoAssociation: e.target.value })}
                      placeholder="e.g. Narmada Kisan FPO"
                    />
                  </label>
                </div>
              </>
            )}

            {/* BUYER SPECIFIC DETAILS */}
            {isBuyer && (
              <>
                <h4 style={{ marginTop: "24px" }}>Organization & Procurement Requirements</h4>
                <div className="form-grid">
                  <label>
                    Company / Organization Name
                    <input
                      value={form.organizationName}
                      onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                      required
                    />
                  </label>

                  <label>
                    Business Type
                    <select
                      value={form.buyerType}
                      onChange={(e) => setForm({ ...form, buyerType: e.target.value })}
                    >
                      <option value="TRADER">TRADER</option>
                      <option value="RETAILER">RETAILER</option>
                      <option value="PROCESSOR">PROCESSOR</option>
                      <option value="EXPORTER">EXPORTER</option>
                    </select>
                  </label>

                  <label>
                    Required Crops (Comma separated)
                    <input
                      value={form.requiredCrops}
                      onChange={(e) => setForm({ ...form, requiredCrops: e.target.value })}
                      placeholder="e.g. Wheat, Soybean, Maize"
                      required
                    />
                  </label>

                  <label>
                    Required Quantity (kg)
                    <input
                      type="number"
                      value={form.requiredQuantity}
                      onChange={(e) => setForm({ ...form, requiredQuantity: e.target.value })}
                      required
                    />
                  </label>

                  <label style={{ gridColumn: "1 / -1" }}>
                    Quality Requirements & Specifications
                    <input
                      value={form.qualityRequirements}
                      onChange={(e) => setForm({ ...form, qualityRequirements: e.target.value })}
                      placeholder="e.g. Grade A, Moisture < 12%, Foreign Matter < 1%"
                      required
                    />
                  </label>
                </div>
              </>
            )}

            <div className="form-actions" style={{ marginTop: "24px" }}>
              <button className="primary" type="submit" disabled={saving}>
                {saving ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* KYC MODAL */}
      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        onSuccess={handleKycSuccess}
        initialPhone={form.phone}
        userName={form.name}
      />
    </section>
  );
}

export default ProfileManagement;
