import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { VerificationBadge } from "../common/VerificationBadge.jsx";
import { KycModal } from "./KycModal.jsx";
import { TrustProfileModal } from "./TrustProfileModal.jsx";

/**
 * ProfileManagement:
 * Complete management view for Farmer and Buyer profiles.
 * Features:
 * - Complete Farmer Profile (Name, Photo, Location, Crops, Quantity, Quality/Grade, FPO, Previous Transactions, KYC Status, Verified Badge)
 * - Complete Buyer Profile (Name, Business Type, Location, Required Crops, Required Quantity, Quality Requirements, Previous Transactions, KYC Status, Business Verification, Verified Badge)
 * - 3 Visual Verification Statuses (Verified ✓, Verification Pending ⏳, Unverified ⚠️)
 * - Trust & Transparency checklist and Public Trust Profile Modal preview
 * - Prototype Aadhaar + OTP KYC flow integration
 */
export function ProfileManagement() {
  const { r } = useParams();
  const { user, setUser } = useAuth();
  const { getLabel } = useLanguage();

  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isTrustPreviewOpen, setIsTrustPreviewOpen] = useState(false);
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
          if (data) {
            setTxCount(data.transactionCount || 0);
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

  const normStatus = String(user?.verification || "UNVERIFIED").toUpperCase();
  const isVerified = normStatus === "VERIFIED" || user?.kycVerified;
  const isPending = normStatus === "PENDING" || normStatus === "PENDING_VERIFICATION";

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileErr("Image size should be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

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

  const defaultAvatarEmoji = isBuyer ? "🏢" : "🧑‍🌾";
  const avatarPresets = isBuyer
    ? ["🏢", "🏬", "👔", "🤝", "🏪", "💼"]
    : ["🧑‍🌾", "🌾", "🚜", "🌽", "🌱", "👨‍🌾"];

  return (
    <section className="profile-management-view">
      <div className="profile-header-banner">
        <div>
          <p className="eyebrow">
            {getLabel(
              "MARKETPLACE PROFILE & TRUST MANAGEMENT",
              "कृषि बाजार प्रोफाइल एवं विश्वास प्रबंधन",
              "बाजारपेठ प्रोफाइल आणि विश्वास व्यवस्थापन"
            )}
          </p>
          <h1>
            {isBuyer
              ? getLabel("Buyer Organization Profile", "खरीदार संगठन प्रोफाइल", "खरेदीदार संस्था प्रोफाइल")
              : isFpo
              ? getLabel("FPO Representative Profile", "एफपीओ प्रतिनिधि प्रोफाइल", "एफपीओ प्रतिनिधी प्रोफाइल")
              : getLabel("Farmer Profile & Identity", "किसान प्रोफाइल एवं पहचान", "शेतकरी प्रोफाइल आणि ओळख")}
          </h1>
          <p className="profile-subheading">
            {isBuyer
              ? getLabel(
                  "Verified buyer credentials build trust with farmers and FPOs, accelerating grain procurement.",
                  "सत्यापित खरीदार साख किसानों और एफपीओ के साथ विश्वास बनाती है और खरीद तेज करती है।",
                  "प्रमाणित खरेदीदार माहितीमुळे शेतकरी आणि एफपीओमध्ये विश्वास वाढतो."
                )
              : getLabel(
                  "Complete your KYC and farm details to earn the verified badge and sell directly to verified buyers.",
                  "सत्यापित बैज पाने और सीधे सत्यापित खरीदारों को बेचने के लिए अपना केवाईसी और खेत विवरण पूरा करें।",
                  "प्रमाणित बॅज मिळवण्यासाठी आणि थेट खरेदीदारांना विक्री करण्यासाठी केवायसी पूर्ण करा."
                )}
          </p>
        </div>

        <div className="profile-header-status-card">
          <span className="status-caption">
            {getLabel("KYC VERIFICATION STATUS", "केवाईसी सत्यापन स्थिति", "केवायसी पडताळणी स्थिती")}
          </span>
          <VerificationBadge
            status={user?.verification}
            kycVerified={user?.kycVerified}
            showKyc={true}
            size="lg"
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
            {!isVerified && (
              <button
                type="button"
                className="primary verify-now-btn"
                onClick={() => setIsKycModalOpen(true)}
              >
                🛡️ {getLabel("Verify KYC Now", "अभी केवाईसी सत्यापित करें", "आता केवायसी पूर्ण करा")}
              </button>
            )}
            <button
              type="button"
              className="secondary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={() => setIsTrustPreviewOpen(true)}
            >
              👁️ {getLabel("View Public Trust Profile", "सार्वजनिक ट्रस्ट प्रोफाइल देखें", "सार्वजनिक प्रोफाइल पहा")}
            </button>
          </div>
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
                {form.profilePhoto && form.profilePhoto.startsWith("data:image") ? (
                  <img
                    src={form.profilePhoto}
                    alt={user?.name}
                    className="avatar-photo"
                  />
                ) : form.profilePhoto && form.profilePhoto.startsWith("http") ? (
                  <img
                    src={form.profilePhoto}
                    alt={user?.name}
                    className="avatar-photo"
                  />
                ) : (
                  <span className="avatar-icon">{form.profilePhoto || defaultAvatarEmoji}</span>
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

            {/* 3 Clear Verification Status Banners */}
            <div className={`verification-status-box ${isVerified ? "is-verified" : isPending ? "is-pending" : "is-unverified"}`}>
              <div className="status-box-header">
                <span className="box-icon">
                  {isVerified ? "✓" : isPending ? "⏳" : "⚠️"}
                </span>
                <div>
                  <strong>
                    {isVerified
                      ? "Verified ✓"
                      : isPending
                      ? "Verification Pending ⏳"
                      : "Unverified ⚠️"}
                  </strong>
                  <p>
                    {isVerified
                      ? "Identity and KYC verification completed. Your verified badge is visible to all counterparties across KrishiLink."
                      : isPending
                      ? "Your verification details are currently under processing. Complete OTP verification to finalize."
                      : "Your profile is not verified yet. Complete KYC now to build trust and unlock priority trading."}
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
                  🚀 {getLabel("Complete KYC Verification Now", "अभी केवाईसी सत्यापन पूरा करें", "आता केवायसी पूर्ण करा")}
                </button>
              )}
            </div>

            {/* Trust & Verification Checklist */}
            <div className="trust-checklist-card">
              <h4>
                {getLabel(
                  "Trust & Verification Checklist",
                  "विश्वास एवं सत्यापन चेकलिस्ट",
                  "विश्वास आणि पडताळणी यादी"
                )}
              </h4>
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
                <h3>
                  {getLabel(
                    "Update Profile Details",
                    "प्रोफाइल विवरण अपडेट करें",
                    "प्रोफाइल तपशील अपडेट करा"
                  )}
                </h3>
                <p>Ensure your contact, crop, and business details are accurate.</p>
              </div>
            </div>

            {/* Profile Photo & Avatar Selection */}
            <h4>
              {getLabel("Profile Photo & Avatar", "प्रोफाइल फोटो व अवतार", "प्रोफाइल फोटो आणि अवतार")}
            </h4>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  {avatarPresets.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, profilePhoto: emoji })}
                      style={{
                        fontSize: "20px",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: form.profilePhoto === emoji ? "2px solid var(--brand)" : "1px solid #cbd5e1",
                        background: form.profilePhoto === emoji ? "var(--brand-soft)" : "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--brand-deep)",
                    fontWeight: 600,
                  }}
                >
                  📁 Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />
                </label>
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

      {/* PUBLIC TRUST PROFILE MODAL PREVIEW */}
      <TrustProfileModal
        isOpen={isTrustPreviewOpen}
        onClose={() => setIsTrustPreviewOpen(false)}
        userId={user?._id}
        initialData={{
          ...user,
          ...form,
          crops: typeof form.crops === "string" ? form.crops.split(",").map((c) => c.trim()).filter(Boolean) : form.crops,
          requiredCrops: typeof form.requiredCrops === "string" ? form.requiredCrops.split(",").map((c) => c.trim()).filter(Boolean) : form.requiredCrops,
          transactionCount: txCount,
        }}
      />
    </section>
  );
}

export default ProfileManagement;
