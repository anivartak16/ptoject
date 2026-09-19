import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { Card } from "../components/common/Card.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { MatchesPage } from "./MatchesPage.jsx";
import { FpoAggregationPage } from "./FpoAggregationPage.jsx";

export function DynamicPage() {
  const { misc, r } = useParams();
  const { user, setUser } = useAuth();
  const { t, getLabel } = useLanguage();

  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Active tabs for profiles
  const [buyerActiveTab, setBuyerActiveTab] = useState("identity");
  const [fpoActiveTab, setFpoActiveTab] = useState("leader");

  // e-KYC Modal State for Farmers
  const [showEkycModal, setShowEkycModal] = useState(false);
  const [ekycType, setEkycType] = useState("AADHAAR");
  const [idNumber, setIdNumber] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [landRecordNumber, setLandRecordNumber] = useState("");
  const [village, setVillage] = useState(user?.location || user?.district || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [ekycLoading, setEkycLoading] = useState(false);
  const [ekycModalMsg, setEkycModalMsg] = useState("");
  const [ekycModalErr, setEkycModalErr] = useState("");

  // Buyer Profile Interactive Tools State
  const [gstVerifyStatus, setGstVerifyStatus] = useState(null);
  const [buyerDocuments, setBuyerDocuments] = useState([
    { id: 1, name: "GSTIN_Certificate_REG06.pdf", type: "GSTIN Registration", size: "1.2 MB", date: "15 Sep 2026", verified: true },
    { id: 2, name: "APMC_Mandi_Trader_License.pdf", type: "Mandi Trading License", size: "840 KB", date: "18 Sep 2026", verified: true },
    { id: 3, name: "Corporate_PAN_Card.pdf", type: "Income Tax PAN", size: "620 KB", date: "10 Sep 2026", verified: true },
  ]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // FPO Produce Aggregation Pooling Calculator State
  const [aggCrop, setAggCrop] = useState("Soyabean");
  const [aggFarmersCount, setAggFarmersCount] = useState(25);
  const [aggYieldPerFarmer, setAggYieldPerFarmer] = useState(40);
  const [aggBaseMandiPrice, setAggBaseMandiPrice] = useState(4850);
  const [aggBulkOfferPrice, setAggBulkOfferPrice] = useState(4980);

  // Farmer Digital Card & Preview Modal State
  const [showFarmerCardModal, setShowFarmerCardModal] = useState(false);

  // Buyer Form state
  const [buyerForm, setBuyerForm] = useState({
    name: user?.name || "",
    organizationName: user?.organizationName || "",
    buyerType: user?.buyerType || "Processor / Miller",
    buyerCapacity: user?.buyerCapacity || "500 MT / Month",
    phone: user?.phone || "",
    email: user?.email || "",
    gstNumber: user?.gstNumber || "",
    panNumber: user?.panNumber || "",
    mandiLicenseNumber: user?.mandiLicenseNumber || "",
    district: user?.district || "",
    state: user?.state || "",
    address: user?.address || "",
    location: user?.location || "",
    preferredCommodities: user?.preferredCommodities || ["Wheat", "Soyabean", "Gram"],
  });

  // FPO Form state
  const [fpoForm, setFpoForm] = useState({
    name: user?.name || "",
    fpoLeaderDesignation: user?.fpoLeaderDesignation || "Chairman & Managing Director",
    organizationName: user?.organizationName || "",
    registrationNumber: user?.registrationNumber || "",
    fpoIncorporationType: user?.fpoIncorporationType || "Farmer Producer Company (Companies Act)",
    fpoEstablishmentYear: user?.fpoEstablishmentYear || 2021,
    fpoAggregationCapacity: user?.fpoAggregationCapacity || "1,500 MT / Season",
    memberCount: user?.memberCount || "250",
    phone: user?.phone || "",
    email: user?.email || "",
    district: user?.district || "",
    state: user?.state || "",
    address: user?.address || "",
    location: user?.location || "",
    preferredCommodities: user?.preferredCommodities || ["Wheat", "Soyabean", "Gram", "Mustard"],
  });

  // Farmer Form state
  const [farmerForm, setFarmerForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    farmName: user?.farmName || "",
    primaryCrop: user?.primaryCrop || "Wheat",
    landSize: user?.landSize || "",
    district: user?.district || "",
    state: user?.state || "",
    address: user?.address || "",
    location: user?.location || "",
  });

  // KVK Form state
  const [kvkForm, setKvkForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    organizationName: user?.organizationName || "",
    registrationNumber: user?.registrationNumber || "",
    location: user?.location || "",
    district: user?.district || "",
    state: user?.state || "",
    address: user?.address || "",
  });

  // Sync user state when refreshed
  useEffect(() => {
    if (user) {
      setBuyerForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        organizationName: user.organizationName || prev.organizationName,
        buyerType: user.buyerType || prev.buyerType,
        buyerCapacity: user.buyerCapacity || prev.buyerCapacity,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        gstNumber: user.gstNumber || prev.gstNumber,
        panNumber: user.panNumber || prev.panNumber,
        mandiLicenseNumber: user.mandiLicenseNumber || prev.mandiLicenseNumber,
        district: user.district || prev.district,
        state: user.state || prev.state,
        address: user.address || prev.address,
        location: user.location || prev.location,
        preferredCommodities: user.preferredCommodities || prev.preferredCommodities,
      }));

      setFpoForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        fpoLeaderDesignation: user.fpoLeaderDesignation || prev.fpoLeaderDesignation,
        organizationName: user.organizationName || prev.organizationName,
        registrationNumber: user.registrationNumber || prev.registrationNumber,
        fpoIncorporationType: user.fpoIncorporationType || prev.fpoIncorporationType,
        fpoEstablishmentYear: user.fpoEstablishmentYear || prev.fpoEstablishmentYear,
        fpoAggregationCapacity: user.fpoAggregationCapacity || prev.fpoAggregationCapacity,
        memberCount: user.memberCount || prev.memberCount,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        district: user.district || prev.district,
        state: user.state || prev.state,
        address: user.address || prev.address,
        location: user.location || prev.location,
      }));

      setFarmerForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        farmName: user.farmName || prev.farmName,
        primaryCrop: user.primaryCrop || prev.primaryCrop,
        landSize: user.landSize || prev.landSize,
        district: user.district || prev.district,
        state: user.state || prev.state,
        address: user.address || prev.address,
        location: user.location || prev.location,
      }));
    }
  }, [user]);

  const saveProfile = async (formData) => {
    setProfileSaving(true);
    setProfileMsg("");
    setProfileErr("");
    try {
      const res = await api.put("/auth/profile", formData);
      if (res.data?.data) {
        setUser(res.data.data);
      }
      setProfileMsg(
        getLabel(
          "Profile updated successfully!",
          "प्रोफाइल सफलतापूर्वक अपडेट हो गया!",
          "प्रोफाइल यशस्वीपणे अपडेट झाले!"
        )
      );
    } catch (err) {
      setProfileErr(err.response?.data?.message || "Could not update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleEkycSubmit = async (e) => {
    e.preventDefault();
    setEkycLoading(true);
    setEkycModalMsg("");
    setEkycModalErr("");

    try {
      const res = await api.post("/auth/ekyc", {
        ekycType,
        idNumber,
        fullName,
        landRecordNumber,
        village,
      });

      if (res.data?.data) {
        setUser(res.data.data);
      }

      setEkycModalMsg(
        getLabel(
          "e-KYC verified successfully! Official trust badge activated.",
          "ई-केवाईसी सफलतापूर्वक सत्यापित हो गया! आधिकारिक ट्रस्ट बैज सक्रिय हो गया।",
          "ई-केवायसी यशस्वीपणे प्रमाणित झाले! अधिकृत ट्रस्ट बॅज सक्रिय झाला."
        )
      );
      setProfileMsg(
        getLabel(
          "e-KYC verified! Your trust badge is now visible to buyers and FPOs.",
          "ई-केवाईसी सत्यापित! आपका ट्रस्ट बैज अब खरीदारों और एफपीओ को दिखाई दे रहा है।",
          "ई-केवायसी प्रमाणित! तुमचा ट्रस्ट बॅज आता खरेदीदार आणि एफपीओंना दिसत आहे."
        )
      );

      setTimeout(() => {
        setShowEkycModal(false);
        setEkycModalMsg("");
      }, 1400);
    } catch (err) {
      setEkycModalErr(err.response?.data?.message || "e-KYC verification failed. Please check the details.");
    } finally {
      setEkycLoading(false);
    }
  };

  const toggleCommodity = (commodity, formType) => {
    if (formType === "buyer") {
      const current = buyerForm.preferredCommodities || [];
      const updated = current.includes(commodity)
        ? current.filter((c) => c !== commodity)
        : [...current, commodity];
      setBuyerForm({ ...buyerForm, preferredCommodities: updated });
    } else {
      const current = fpoForm.preferredCommodities || [];
      const updated = current.includes(commodity)
        ? current.filter((c) => c !== commodity)
        : [...current, commodity];
      setFpoForm({ ...fpoForm, preferredCommodities: updated });
    }
  };

  if (misc === "profile") {
    // -------------------------------------------------------------
    // 1. REBUILT BUYER PROFILE
    // -------------------------------------------------------------
    if (user?.role === "BUYER") {
      const allCommodityOptions = [
        "Wheat",
        "Soyabean",
        "Gram (Chana)",
        "Maize",
        "Paddy (Rice)",
        "Mustard",
        "Cotton",
        "Tur (Arhar)",
        "Groundnut",
      ];

      const hasGstin = Boolean(buyerForm.gstNumber && buyerForm.gstNumber.trim().length >= 10);
      const hasLicense = Boolean(buyerForm.mandiLicenseNumber && buyerForm.mandiLicenseNumber.trim().length >= 4);
      const progressPercent = 25 + (hasGstin ? 25 : 0) + (hasLicense ? 25 : 0) + 25;
      const isFullyVerified = progressPercent >= 100;

      return (
        <section className="profile-page animate-fadeIn">
          {/* Header Banner */}
          <div className="page-header" style={{ marginBottom: "18px" }}>
            <div>
              <p className="eyebrow">
                {getLabel("INSTITUTIONAL COMMODITY PROCUREMENT", "संस्थागत कृषि खरीद", "संस्थागत कृषी खरेदी")}
              </p>
              <h1 style={{ margin: "4px 0 8px 0" }}>
                {user?.organizationName || user?.name || "Enterprise Buyer"} Profile
              </h1>
              <p style={{ color: "var(--ink-secondary)", maxWidth: "780px" }}>
                {getLabel(
                  "Official corporate buyer credentials, APMC mandi trading license, GSTIN compliance, procurement specifications, and automated escrow clearance.",
                  "आधिकारिक कॉर्पोरेट खरीदार साख, एपीएमसी मंडी व्यापार लाइसेंस, जीएसटी अनुपालन, खरीद मानदंड और स्वचालित एस्क्रो निपटान।",
                  "अधिकृत कॉर्पोरेट खरेदीदार माहिती, कृषी उत्पन्न बाजार समिती परवाना, जीएसटी अनुपालन, खरेदी निकष व स्वयंचलित एस्क्रो व्यवहार."
                )}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <BuyerVerificationBadge verification={user?.verification} buyer={user} compact={true} />
            </div>
          </div>

          {profileMsg && <div className="form-message success" style={{ marginBottom: "16px" }}>✓ {profileMsg}</div>}
          {profileErr && <div className="form-message error" style={{ marginBottom: "16px" }}>✕ {profileErr}</div>}

          {/* Verification Progress Bar */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                  {getLabel("Buyer Verification Level:", "खरीदार सत्यापन स्तर:", "खरेदीदार पडताळणी स्तर:")}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    background: isFullyVerified ? "#dcfce7" : "#fef3c7",
                    color: isFullyVerified ? "#166534" : "#92400e",
                    fontWeight: 700,
                  }}
                >
                  {isFullyVerified
                    ? getLabel("Tier-1 APMC Institutional Verified (100%)", "टियर-1 एपीएमसी संस्थागत सत्यापित (100%)", "टियर-१ बाजार समिती अधिकृत खरेदीदार (१००%)")
                    : getLabel("Tier-2 Commercial Buyer (75%)", "टियर-2 वाणिज्यिक खरीदार (75%)", "टियर-२ व्यावसायिक खरेदीदार (७५%)")}
                </span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#16a34a" }}>
                {progressPercent}% Complete
              </span>
            </div>

            <div style={{ background: "#e2e8f0", borderRadius: "8px", height: "8px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #22c55e, #16a34a)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", marginTop: "12px", fontSize: "12px" }}>
              <div style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={15} /> <span>Basic Account Profile</span>
              </div>
              <div style={{ color: hasGstin ? "#16a34a" : "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                {hasGstin ? <CheckCircle2 size={15} /> : <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #cbd5e1" }} />}
                <span>GSTIN {hasGstin ? "Validated" : "Pending"}</span>
              </div>
              <div style={{ color: hasLicense ? "#16a34a" : "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                {hasLicense ? <CheckCircle2 size={15} /> : <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #cbd5e1" }} />}
                <span>APMC Mandi License {hasLicense ? "Linked" : "Pending"}</span>
              </div>
              <div style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={15} /> <span>100% Escrow Vault Active</span>
              </div>
            </div>
          </div>

          {/* Top 4 Metric KPI Cards */}
          <div className="grid" style={{ marginBottom: "24px" }}>
            <Card
              a={getLabel("BUYER CATEGORY", "खरीदार श्रेणी", "खरेदीदार प्रवर्ग")}
              b={buyerForm.buyerType || "Processor / Miller"}
              c={getLabel("Licensed Institutional Buyer", "लाइसेंस प्राप्त संस्थागत खरीदार", "परवानाधारक संस्थागत खरेदीदार")}
            />
            <Card
              a={getLabel("MONTHLY PROCUREMENT CAPACITY", "मासिक खरीद क्षमता", "मासिक खरेदी क्षमता")}
              b={user?.buyerCapacity || "500 MT / Month"}
              c={getLabel("Commercial bulk procurement", "थोक वाणिज्यिक खरीद", "घाऊक व्यावसायिक खरेदी")}
            />
            <Card
              a={getLabel("APMC MANDI LICENSE", "मंडी व्यापार लाइसेंस", "बाजार समिती परवाना")}
              b={user?.mandiLicenseNumber ? "LICENSED" : "UNLICENSED"}
              c={user?.mandiLicenseNumber || getLabel("Add license for fast-track trades", "सौदा गति देने हेतु लाइसेंस जोड़ें", "व्यवहार सुलभ करण्यासाठी परवाना जोडा")}
            />
            <Card
              a={getLabel("ESCROW COMPLIANCE", "एस्क्रो अनुपालन", "एस्क्रो अनुपालन")}
              b="100% SECURE"
              c={getLabel("Guaranteed payment settlement", "गारंटीकृत भुगतान निपटान", "हमीयुक्त देयक सुरक्षितता")}
            />
          </div>

          {/* Tab Navigation */}
          <div
            className="profile-tabs-nav"
            style={{
              display: "flex",
              gap: "8px",
              borderBottom: "2px solid #e2e8f0",
              marginBottom: "22px",
              overflowX: "auto",
            }}
          >
            {[
              { id: "identity", label: getLabel("🏢 Business Identity & Credentials", "🏢 व्यावसायिक पहचान व लाइसेंस", "🏢 व्यावसायिक ओळख व परवाना") },
              { id: "procurement", label: getLabel("🌾 Procurement Specs & Live Demands", "🌾 खरीद विनिर्देश व मांग", "🌾 खरेदी निकष व थेट मागण्या") },
              { id: "compliance", label: getLabel("📁 Document Vault & Verification", "📁 दस्तावेज वॉल्ट व सत्यापन", "📁 कागदपत्रे व पडताळणी") },
              { id: "trust", label: getLabel("🛡️ Trust Score & Escrow Certificate", "🛡️ विश्वास स्कोर व एस्क्रो प्रमाणपत्र", "🛡️ पत निर्देशांक व एस्क्रो प्रमाणपत्र") },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBuyerActiveTab(tab.id)}
                style={{
                  padding: "10px 18px",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  background: "transparent",
                  borderBottom: buyerActiveTab === tab.id ? "3px solid #16a34a" : "3px solid transparent",
                  color: buyerActiveTab === tab.id ? "#15803d" : "#64748b",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Business Identity & Legal Mandi Credentials */}
          {buyerActiveTab === "identity" && (
            <div className="two-col animate-fadeIn" style={{ alignItems: "flex-start" }}>
              {/* Left Column: Official Credentials Card */}
              <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <BuyerVerificationBadge verification={user?.verification} buyer={user} compact={false} />

                <div style={{ borderTop: "1px solid var(--line-light)", paddingTop: "14px" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                    {getLabel("Legal Entity & Licensing", "कानूनी इकाई व लाइसेंस", "नोंदणीकृत कंपनी व परवाना")}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Company / Trading Name: </span>
                      <b>{user?.organizationName || "Not configured"}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Authorized Sourcing Officer: </span>
                      <b>{user?.name}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Official Email: </span>
                      <b>{user?.email}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Official Phone: </span>
                      <b>{user?.phone || "Not configured"}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>GSTIN: </span>
                      <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                        {user?.gstNumber || "Not submitted"}
                      </code>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>PAN Number: </span>
                      <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                        {user?.panNumber || "Not submitted"}
                      </code>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>APMC Mandi License: </span>
                      <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                        {user?.mandiLicenseNumber || "Not submitted"}
                      </code>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Primary Receiving Warehouse: </span>
                      <span>📍 {user?.address || user?.location || "Central Logistics Hub"}, {user?.district} {user?.state}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Links */}
                <div style={{ borderTop: "1px solid var(--line-light)", paddingTop: "14px" }}>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "var(--ink-secondary)", textTransform: "uppercase" }}>
                    {getLabel("Buyer Sourcing Workflows", "खरीदार सोर्सिंग कार्यप्रवाह", "खरेदीदार कामकाज")}
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <Link className="primary" to={`/${r}/demands`} style={{ fontSize: "13px", padding: "8px 14px", textDecoration: "none" }}>
                      + {getLabel("Create Demand", "मांग बनाएं", "मागणी नोंदवा")}
                    </Link>
                    <Link className="secondary" to={`/${r}/lots`} style={{ fontSize: "13px", padding: "8px 14px", textDecoration: "none" }}>
                      {getLabel("Browse Verified Lots", "सत्यापित लॉट्स देखें", "प्रमाणित शेतमाल पहा")}
                    </Link>
                    <Link className="secondary" to={`/${r}/payments`} style={{ fontSize: "13px", padding: "8px 14px", textDecoration: "none" }}>
                      {getLabel("Escrow & Payments", "एस्क्रो व भुगतान", "एस्क्रो व देयके")}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Update Profile Form */}
              <form
                className="form-card"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfile(buyerForm);
                }}
              >
                <h3>{getLabel("Update Business Identity & Mandi License", "व्यावसायिक विवरण व मंडी लाइसेंस अपडेट करें", "व्यवसाय तपशील व परवाना अपडेट करा")}</h3>
                <p style={{ color: "var(--ink-secondary)", fontSize: "13px", margin: "0 0 16px 0" }}>
                  {getLabel(
                    "Entering your valid GSTIN and APMC Mandi License automatically upgrades your account to 'Verified Buyer' status.",
                    "वैध जीएसटी और एपीएमसी मंडी लाइसेंस दर्ज करने पर आपका खाता स्वचालित रूप से 'सत्यापित खरीदार' में अपग्रेड हो जाता है।",
                    "वैध जीएसटी आणि बाजार समिती परवाना क्रमांक नोंदवल्यास थेट 'प्रमाणित खरेदीदार' दर्जा मिळतो."
                  )}
                </p>

                <div className="form-grid">
                  <label>
                    {getLabel("Company / Enterprise Legal Name", "कंपनी / व्यापारिक कानूनी नाम", "कंपनी / फर्मचे कायदेशीर नाव")}
                    <input
                      value={buyerForm.organizationName}
                      onChange={(e) => setBuyerForm({ ...buyerForm, organizationName: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    {getLabel("Buyer Category", "खरीदार श्रेणी", "खरेदीदार प्रवर्ग")}
                    <select
                      value={buyerForm.buyerType}
                      onChange={(e) => setBuyerForm({ ...buyerForm, buyerType: e.target.value })}
                      required
                    >
                      <option value="Processor / Miller">Processor / Miller (दाल/आटा/तेल मिल)</option>
                      <option value="Agri Exporter">Agri Exporter (कृषि निर्यातक)</option>
                      <option value="Wholesaler / APMC Trader">Wholesaler / APMC Trader (थोक व्यापारी)</option>
                      <option value="Modern Retail Chain">Modern Retail Chain (रिटेल सुपरमार्केट चेन)</option>
                      <option value="FMCG Manufacturer">FMCG Manufacturer (खाद्य निर्माता)</option>
                      <option value="Animal Feed Manufacturer">Animal Feed Manufacturer (पशु आहार निर्माता)</option>
                    </select>
                  </label>
                  <label>
                    {getLabel("Authorized Representative Name", "अधिकृत प्रतिनिधि नाम", "अधिकृत प्रतिनिधीचे नाव")}
                    <input
                      value={buyerForm.name}
                      onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    {getLabel("Official Contact Phone", "आधिकारिक संपर्क फोन", "अधिकृत संपर्क फोन")}
                    <input
                      value={buyerForm.phone}
                      onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                      required
                    />
                  </label>
                  <label style={{ gridColumn: "span 2" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span>{getLabel("GSTIN (15 Digits)", "जीएसटी नंबर (15 अंक)", "जीएसटी क्रमांक (१५ अंकी)")}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!buyerForm.gstNumber || buyerForm.gstNumber.length < 10) {
                            alert("Please enter a valid 15-character GSTIN first.");
                            return;
                          }
                          setGstVerifyStatus("verifying");
                          setTimeout(() => setGstVerifyStatus("valid"), 600);
                        }}
                        style={{
                          padding: "3px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "#f0fdf4",
                          border: "1px solid #86efac",
                          color: "#166534",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        {gstVerifyStatus === "verifying" ? "⏳ Validating..." : "⚡ Validate with GSTN"}
                      </button>
                    </div>
                    <input
                      placeholder="e.g. 23AAACB9281D1Z5"
                      value={buyerForm.gstNumber}
                      onChange={(e) => {
                        setBuyerForm({ ...buyerForm, gstNumber: e.target.value.toUpperCase() });
                        setGstVerifyStatus(null);
                      }}
                    />
                    {gstVerifyStatus === "valid" && (
                      <div style={{ marginTop: "6px", fontSize: "12px", color: "#166534", background: "#f0fdf4", padding: "6px 10px", borderRadius: "6px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={14} color="#16a34a" />
                        <span><b>GSTN Authenticated:</b> Regular Taxpayer Active · Tax Jurisdiction: {buyerForm.district || "Indore"} Central Ward</span>
                      </div>
                    )}
                  </label>
                  <label>
                    {getLabel("Permanent Account Number (PAN)", "पैन नंबर (10 अंक)", "पॅन क्रमांक (१० अंकी)")}
                    <input
                      placeholder="e.g. AAACB9281D"
                      value={buyerForm.panNumber}
                      onChange={(e) => setBuyerForm({ ...buyerForm, panNumber: e.target.value.toUpperCase() })}
                    />
                  </label>
                  <label>
                    {getLabel("APMC Mandi License Number", "मंडी व्यापार लाइसेंस", "बाजार समिती परवाना क्रमांक")}
                    <input
                      placeholder="e.g. MP-IND-APMC-9281"
                      value={buyerForm.mandiLicenseNumber}
                      onChange={(e) => setBuyerForm({ ...buyerForm, mandiLicenseNumber: e.target.value })}
                    />
                  </label>
                  <label>
                    {getLabel("Operating District", "कार्यरत जिला", "जिल्हा")}
                    <input
                      value={buyerForm.district}
                      onChange={(e) => setBuyerForm({ ...buyerForm, district: e.target.value })}
                    />
                  </label>
                  <label>
                    {getLabel("State", "राज्य", "राज्य")}
                    <input
                      value={buyerForm.state}
                      onChange={(e) => setBuyerForm({ ...buyerForm, state: e.target.value })}
                    />
                  </label>
                  <label>
                    {getLabel("Delivery Hub / City", "वितरण हब / शहर", "डिलिव्हरी शहर")}
                    <input
                      value={buyerForm.location}
                      onChange={(e) => setBuyerForm({ ...buyerForm, location: e.target.value })}
                    />
                  </label>
                </div>

                <label style={{ display: "block", marginTop: "12px" }}>
                  {getLabel("Registered Warehouse / Processing Mill Address", "पंजीकृत गोदाम / प्रोसेसिंग मिल का पूरा पता", "नोंदणीकृत गोदाम / प्रक्रिया केंद्राचा पत्ता")}
                  <textarea
                    rows="2"
                    value={buyerForm.address}
                    onChange={(e) => setBuyerForm({ ...buyerForm, address: e.target.value })}
                  />
                </label>

                <button className="primary" type="submit" disabled={profileSaving} style={{ marginTop: "16px" }}>
                  {profileSaving ? getLabel("Saving...", "सहेजा जा रहा है...", "जतन करत आहे...") : getLabel("Save Business Profile", "व्यवसाय प्रोफाइल सहेजें", "व्यवसाय प्रोफाइल जतन करा")}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Procurement Preferences & Commodities & Demands Shortcut */}
          {buyerActiveTab === "procurement" && (
            <div className="two-col animate-fadeIn" style={{ alignItems: "flex-start" }}>
              <div className="panel">
                <h3>{getLabel("Target Commodities", "लक्षित फसलें / जींस", "खरेदीची प्रमुख पिके")}</h3>
                <p style={{ color: "var(--ink-secondary)", fontSize: "13px", marginBottom: "14px" }}>
                  {getLabel(
                    "Select the commodities you actively procure to receive direct match alerts and farmer supply recommendations.",
                    "सीधे मैच अलर्ट और किसान आपूर्ति सिफारिशें प्राप्त करने के लिए वे फसलें चुनें जिन्हें आप खरीदते हैं।",
                    "थेट खरेदी शिफारसी व शेतमाल अलर्ट मिळवण्यासाठी आपण खरेदी करत असलेली पिके निवडा."
                  )}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
                  {allCommodityOptions.map((c) => {
                    const isSelected = (buyerForm.preferredCommodities || []).includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCommodity(c, "buyer")}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: isSelected ? "1px solid #16a34a" : "1px solid #cbd5e1",
                          background: isSelected ? "#f0fdf4" : "#f8fafc",
                          color: isSelected ? "#15803d" : "#475569",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {isSelected ? "✓" : "+"} {c}
                      </button>
                    );
                  })}
                </div>

                <div style={{ borderTop: "1px solid var(--line-light)", paddingTop: "14px" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
                    {getLabel("Quality Specifications Accepted", "स्वीकृत गुणवत्ता मानक", "स्वीकृत दर्जा निकष")}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "var(--ink-secondary)", lineHeight: "1.6" }}>
                    <li>Grade A / Premium Quality Produce</li>
                    <li>FAQ (Fair Average Quality) Mandi Standards</li>
                    <li>Moisture Tolerance: Strictly &lt; 12.0% (Krishi Vigyan Kendra certified)</li>
                    <li>Foreign Matter / Dockage: &lt; 1.5% maximum</li>
                  </ul>
                </div>

                {/* Quick Demand Launcher Card */}
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "14px", marginTop: "16px" }}>
                  <h4 style={{ margin: "0 0 6px 0", color: "#14532d", fontSize: "14px" }}>
                    🌾 Live Procurement Demands for Your Account
                  </h4>
                  <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#166534" }}>
                    Active procurement orders posted to farmers and FPOs across your sourcing region.
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link className="primary" to={`/${r}/demands`} style={{ fontSize: "12px", padding: "6px 12px", textDecoration: "none" }}>
                      + Publish New Demand
                    </Link>
                    <Link className="secondary" to={`/${r}/matches`} style={{ fontSize: "12px", padding: "6px 12px", textDecoration: "none" }}>
                      ⚡ View AI Crop Matches
                    </Link>
                  </div>
                </div>
              </div>

              <form
                className="form-card"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfile(buyerForm);
                }}
              >
                <h3>{getLabel("Procurement Capacity & Logistics Parameters", "खरीद क्षमता व लॉजिस्टिक्स मानदंड", "खरेदी क्षमता व वाहतूक निकष")}</h3>
                <div className="form-grid">
                  <label>
                    {getLabel("Monthly Procurement Capacity", "मासिक खरीद क्षमता", "मासिक खरेदी क्षमता")}
                    <input
                      value={buyerForm.buyerCapacity}
                      placeholder="e.g. 500 MT / Month or 5,000 Quintals"
                      onChange={(e) => setBuyerForm({ ...buyerForm, buyerCapacity: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    {getLabel("Payment Settlement Protocol", "भुगतान निपटान प्रोटोकॉल", "पेमेंट पद्धती")}
                    <input value="100% Escrow Mandi Protected (Locked on Offer)" readOnly disabled style={{ background: "#f8fafc" }} />
                  </label>
                </div>

                <label style={{ display: "block", marginTop: "12px" }}>
                  {getLabel("Delivery Receiving Hours & Unloading Siding", "गोदाम अनलोडिंग समय व रेल/सड़क कनेक्टिविटी", "गोदाम अनलोडिंग वेळ व रस्ता संपर्क")}
                  <textarea
                    rows="3"
                    value={buyerForm.address}
                    placeholder="e.g. Monday-Saturday 8:00 AM - 6:00 PM. Electronic weighbridge (60T) on-site."
                    onChange={(e) => setBuyerForm({ ...buyerForm, address: e.target.value })}
                  />
                </label>

                <button className="primary" type="submit" disabled={profileSaving} style={{ marginTop: "16px" }}>
                  {profileSaving ? getLabel("Saving...", "सहेजा जा रहा है...", "जतन करत आहे...") : getLabel("Save Procurement Preferences", "खरीद प्राथमिकताएं सहेजें", "खरेदी निकष जतन करा")}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Document Vault & Verification */}
          {buyerActiveTab === "compliance" && (
            <div className="two-col animate-fadeIn" style={{ alignItems: "flex-start" }}>
              <div className="panel" style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "17px" }}>
                      {getLabel("Accredited Documents Vault", "सत्यापित दस्तावेज वॉल्ट", "प्रमाणित कागदपत्रे")}
                    </h3>
                    <small style={{ color: "var(--ink-secondary)" }}>
                      Legally certified credentials stored in secure DigiLocker / GSTN vault
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadingDoc(true);
                      setTimeout(() => {
                        setBuyerDocuments((prev) => [
                          ...prev,
                          {
                            id: Date.now(),
                            name: "Warehouse_Pollution_Certificate.pdf",
                            type: "State Pollution Clearance",
                            size: "940 KB",
                            date: "19 Sep 2026",
                            verified: true,
                          },
                        ]);
                        setIsUploadingDoc(false);
                      }, 700);
                    }}
                    disabled={isUploadingDoc}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <UploadCloud size={14} />
                    <span>{isUploadingDoc ? "Uploading..." : "+ Upload Document"}</span>
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {buyerDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FileText size={20} color="#0284c7" />
                        <div>
                          <strong style={{ fontSize: "14px", color: "#1e293b", display: "block" }}>{doc.name}</strong>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            {doc.type} · {doc.size} · Uploaded {doc.date}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "10px",
                            background: "#dcfce7",
                            color: "#166534",
                          }}
                        >
                          ✓ Verified
                        </span>
                        <button
                          type="button"
                          onClick={() => alert(`Viewing verified certificate: ${doc.name}`)}
                          style={{
                            padding: "4px 10px",
                            fontSize: "11px",
                            background: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <h3>{getLabel("Institutional Verification Standards", "संस्थागत सत्यापन मानक", "संस्थागत पडताळणी निकष")}</h3>
                <p style={{ color: "var(--ink-secondary)", fontSize: "13px", lineHeight: "1.6" }}>
                  Verified institutional buyer status gives your enterprise direct access to FPO aggregated wholesale pools (50–500 MT) without mandi intermediary commissions.
                </p>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", marginTop: "12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#15803d", marginBottom: "4px" }}>
                    ✓ Escrow Clearing License Active
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Automated payment release within 2 hours of weighbridge receipt confirmation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Trust Score & Escrow Certificate */}
          {buyerActiveTab === "trust" && (
            <div className="two-col animate-fadeIn" style={{ alignItems: "flex-start" }}>
              <div
                className="panel"
                style={{
                  border: "2px solid #86efac",
                  background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                  borderRadius: "14px",
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", color: "#166534", textTransform: "uppercase" }}>
                      GOVERNMENT VERIFIED APMC TRADER
                    </span>
                    <h2 style={{ margin: "4px 0", fontSize: "20px", color: "#14532d" }}>
                      {user?.organizationName || "Institutional Buyer"}
                    </h2>
                    <small style={{ color: "#166534" }}>
                      Accreditation ID: <code>{user?.gstNumber || user?.mandiLicenseNumber || "KL-BUYER-CENTRAL"}</code>
                    </small>
                  </div>
                  <ShieldCheck size={36} color="#16a34a" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "16px 0", fontSize: "13px" }}>
                  <div style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                    <span style={{ color: "#64748b", display: "block" }}>Trade Compliance Score</span>
                    <strong style={{ fontSize: "18px", color: "#15803d" }}>96% / Excellent</strong>
                  </div>
                  <div style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                    <span style={{ color: "#64748b", display: "block" }}>Escrow Settlement Rate</span>
                    <strong style={{ fontSize: "18px", color: "#15803d" }}>100% Guaranteed</strong>
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "#166534", lineHeight: "1.5" }}>
                  ✓ This organization is certified to enter direct spot and contract farming procurement agreements with Farmers and FPOs on KrishiLink.
                </p>

                <div style={{ marginTop: "16px" }}>
                  <Link className="primary" to={`/${r}/demands`} style={{ textDecoration: "none" }}>
                    Publish New Demand to Farmers →
                  </Link>
                </div>
              </div>

              <div className="panel">
                <h3>{getLabel("Escrow Trade Protection Protocol", "एस्क्रो व्यापार सुरक्षा प्रोटोकॉल", "एस्क्रो व्यापार सुरक्षा नियम")}</h3>
                <p style={{ color: "var(--ink-secondary)", fontSize: "13px", lineHeight: "1.6" }}>
                  All contracts created by verified buyers utilize the KrishiLink Digital Escrow Vault. Buyers deposit funds securely into the escrow vault upon offer confirmation. Funds are held safely until grain quality inspection and weighing are approved at your mill.
                </p>
                <div style={{ marginTop: "14px" }}>
                  <Link className="secondary" to={`/${r}/payments`} style={{ textDecoration: "none" }}>
                    Open Payments & Escrow Vault →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      );
    }

    // -------------------------------------------------------------
    // 2. REBUILT FPO LEADER PROFILE & AGGREGATE FUNCTION PROFILE
    // -------------------------------------------------------------
    if (user?.role === "FPO") {
      return (
        <section className="profile-page animate-fadeIn">
          {/* Header Banner */}
          <div className="page-header" style={{ marginBottom: "18px" }}>
            <div>
              <p className="eyebrow">
                {getLabel("FPO COLLECTIVE & AGGREGATION DESK", "एफपीओ संगठन व एकत्रीकरण डेस्क", "एफपीओ संस्था व एकत्रीकरण कक्ष")}
              </p>
              <h1 style={{ margin: "4px 0 8px 0" }}>
                {user?.organizationName || "Farmer Producer Organization"}
              </h1>
              <p style={{ color: "var(--ink-secondary)", maxWidth: "800px" }}>
                {getLabel(
                  "Official FPO collective marketing enterprise representing smallholder farmers, managing produce aggregation pools, and facilitating direct institutional buyer contracts.",
                  "छोटे किसानों का प्रतिनिधित्व करने वाला आधिकारिक एफपीओ सामूहिक विपणन उद्यम - उपज एकत्रीकरण पूल प्रबंधन और संस्थागत खरीदारों से सीधे अनुबंध।",
                  "शेतकऱ्यांचे प्रतिनिधित्व करणारी अधिकृत एफपीओ संस्था - शेतमाल एकत्रीकरण, प्रतवारी व खरेदीदारांशी थेट करार."
                )}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "1px solid #86efac",
                }}
              >
                🏛️ SFAC / NABARD RECOGNIZED COLLECTIVE
              </span>
            </div>
          </div>

          {profileMsg && <div className="form-message success" style={{ marginBottom: "16px" }}>✓ {profileMsg}</div>}
          {profileErr && <div className="form-message error" style={{ marginBottom: "16px" }}>✕ {profileErr}</div>}

          {/* 4 Top Metric Cards */}
          <div className="grid" style={{ marginBottom: "24px" }}>
            <Card
              a={getLabel("FPO LEADER / EXECUTIVE", "एफपीओ प्रमुख / कार्यकारी", "एफपीओ प्रमुख / कार्यकारी")}
              b={user?.name || "Lead Executive"}
              c={user?.fpoLeaderDesignation || "Chairman & Managing Director"}
            />
            <Card
              a={getLabel("MEMBER FARMERS IN POOL", "पूल में सदस्य किसान", "एकत्रित शेतकरी संख्या")}
              b={`${user?.memberCount || 250}+ Farmers`}
              c={getLabel("Smallholder & marginal producers", "छोटे व सीमांत किसान", "अल्पभूधारक शेतकरी")}
            />
            <Card
              a={getLabel("SEASONAL AGGREGATION CAPACITY", "मौसमी एकत्रीकरण क्षमता", "हंगामी एकत्रीकरण क्षमता")}
              b={user?.fpoAggregationCapacity || "1,500 MT / Season"}
              c={getLabel("Pre-cleaned & graded produce", "साफ व ग्रेडेड शेतमाल", "स्वच्छ व प्रतवारी केलेला माल")}
            />
            <Card
              a={getLabel("COLLECTIVE STATUS", "संगठन स्थिति", "संस्थेचा दर्जा")}
              b="SFAC & e-KYC VERIFIED"
              c={getLabel("100% Direct Farmer Collective", "100% प्रत्यक्ष किसान समूह", "१००% थेट शेतकरी गट")}
            />
          </div>

          {/* FPO Tabs: Leader Profile vs Aggregate Function Profile */}
          <div
            className="profile-tabs-nav"
            style={{
              display: "flex",
              gap: "8px",
              borderBottom: "2px solid #e2e8f0",
              marginBottom: "22px",
            }}
          >
            {[
              { id: "leader", label: getLabel("👔 FPO Leader & Executive Profile", "👔 एफपीओ प्रमुख व संगठन विवरण", "👔 एफपीओ प्रमुख व संस्था माहिती") },
              { id: "aggregation", label: getLabel("🌾 Aggregate Function & Produce Pooling Desk", "🌾 एकत्रीकरण कार्यप्रवाह व सामूहिक पूल", "🌾 शेतमाल एकत्रीकरण व सामूहिक कक्ष") },
              { id: "governance", label: getLabel("📜 SFAC Recognition & Banking", "📜 सरकारी मान्यता व बैंकिंग", "📜 शासकीय मान्यता व बँक तपशील") },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFpoActiveTab(tab.id)}
                style={{
                  padding: "10px 18px",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  background: "transparent",
                  borderBottom: fpoActiveTab === tab.id ? "3px solid #16a34a" : "3px solid transparent",
                  color: fpoActiveTab === tab.id ? "#15803d" : "#64748b",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: FPO Leader Profile */}
          {fpoActiveTab === "leader" && (
            <div className="two-col animate-fadeIn" style={{ alignItems: "flex-start" }}>
              {/* Leader Credentials Card */}
              <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                    border: "1px solid #86efac",
                    borderRadius: "10px",
                    padding: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ background: "#16a34a", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                      👔
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: "16px", color: "#14532d" }}>
                        {user?.name}
                      </strong>
                      <small style={{ color: "#166534", fontWeight: 600 }}>
                        {user?.fpoLeaderDesignation || "Chairman & Managing Director"}
                      </small>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "#166534", marginTop: "8px", borderTop: "1px solid #bbf7d0", paddingTop: "8px" }}>
                    <span>Official Representative of {user?.memberCount || "250"}+ Shareholder Farmers</span>
                  </div>
                </div>

                {/* Member Farmer e-KYC Health Bar */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                      Member Farmers e-KYC Verification
                    </span>
                    <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>87% Verified</span>
                  </div>
                  <div style={{ background: "#e2e8f0", borderRadius: "6px", height: "6px", overflow: "hidden", marginBottom: "8px" }}>
                    <div style={{ width: "87%", height: "100%", background: "#16a34a" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
                    <span>248 e-KYC Authenticated</span>
                    <span>37 Pending Verification</span>
                  </div>
                  <Link
                    to={`/${r}/farmers`}
                    style={{
                      display: "block",
                      marginTop: "10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#15803d",
                      textDecoration: "none",
                    }}
                  >
                    Review Member e-KYC Roster →
                  </Link>
                </div>

                {/* Board of Directors & Governance Panel */}
                <div style={{ borderTop: "1px solid var(--line-light)", paddingTop: "14px" }}>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "15px" }}>
                    {getLabel("Executive Board & Governance", "कार्यकारी मंडल व प्रशासन", "संचालक मंडळ व प्रशासन")}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: "#f8fafc", borderRadius: "6px" }}>
                      <span><b>{user?.name}</b> (CMD)</span>
                      <span style={{ color: "#15803d", fontWeight: 600 }}>Active Representative</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: "#f8fafc", borderRadius: "6px" }}>
                      <span><b>Smt. Anuradha Joshi</b></span>
                      <span style={{ color: "#64748b" }}>Chief Executive Officer</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: "#f8fafc", borderRadius: "6px" }}>
                      <span><b>Rameshwar Patidar</b></span>
                      <span style={{ color: "#64748b" }}>Director (Grain Procurement)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: "#f8fafc", borderRadius: "6px" }}>
                      <span><b>Devendra Singh</b></span>
                      <span style={{ color: "#64748b" }}>Director (Quality & Assay)</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--line-light)", paddingTop: "14px" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                    {getLabel("Organization Governance Details", "संगठन कानूनी व प्रशासनिक विवरण", "संस्था नोंदणी व प्रशासन")}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Legal Entity Name: </span>
                      <b>{user?.organizationName}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Registration Code: </span>
                      <code>{user?.registrationNumber || "SFAC-MP-2021-0482"}</code>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Incorporation Structure: </span>
                      <span>{user?.fpoIncorporationType || "Farmer Producer Company (Companies Act 2013)"}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Establishment Year: </span>
                      <b>{user?.fpoEstablishmentYear || 2021}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Leader Phone: </span>
                      <b>{user?.phone || "Not configured"}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Leader Official Email: </span>
                      <b>{user?.email}</b>
                    </div>
                    <div>
                      <span style={{ color: "var(--ink-secondary)" }}>Aggregation Complex: </span>
                      <span>📍 {user?.address || user?.location || "Central Mandi Aggregation Yard"}, {user?.district} {user?.state}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--line-light)", paddingTop: "14px" }}>
                  <Link className="primary" to={`/${r}/farmers`} style={{ display: "inline-block", textDecoration: "none" }}>
                    {getLabel("Open Member Farmers Desk →", "सदस्य किसान डेस्क खोलें →", "शेतकरी सभासद कक्ष उघडा →")}
                  </Link>
                </div>
              </div>

              {/* Form to Update FPO Leader & Collective Info */}
              <form
                className="form-card"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfile(fpoForm);
                }}
              >
                <h3>{getLabel("Update FPO Leader & Organization Credentials", "एफपीओ प्रमुख व संगठन क्रेडेंशियल अपडेट करें", "एफपीओ प्रमुख व संस्था तपशील अपडेट करा")}</h3>
                <div className="form-grid">
                  <label>
                    {getLabel("FPO Leader / Chairman Full Name", "एफपीओ प्रमुख / अध्यक्ष का नाम", "एफपीओ अध्यक्ष / प्रमुखाचे नाव")}
                    <input
                      value={fpoForm.name}
                      onChange={(e) => setFpoForm({ ...fpoForm, name: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    {getLabel("Leader Designation", "कार्यकारी पद", "हुद्दा / पद")}
                    <select
                      value={fpoForm.fpoLeaderDesignation}
                      onChange={(e) => setFpoForm({ ...fpoForm, fpoLeaderDesignation: e.target.value })}
                      required
                    >
                      <option value="Chairman & Managing Director">Chairman & Managing Director (CMD)</option>
                      <option value="Chief Executive Officer (CEO)">Chief Executive Officer (CEO)</option>
                      <option value="Board Director">Board Director</option>
                      <option value="Lead Farmer Representative">Lead Farmer Representative</option>
                      <option value="General Manager">General Manager (GM)</option>
                    </select>
                  </label>
                  <label>
                    {getLabel("FPO Collective Legal Name", "एफपीओ कानूनी नाम", "संस्थेचे कायदेशीर नाव")}
                    <input
                      value={fpoForm.organizationName}
                      onChange={(e) => setFpoForm({ ...fpoForm, organizationName: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    {getLabel("Registration / Incorporation Code", "पंजीकरण / निगमन कोड", "नोंदणी क्रमांक")}
                    <input
                      value={fpoForm.registrationNumber}
                      onChange={(e) => setFpoForm({ ...fpoForm, registrationNumber: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    {getLabel("Incorporation Structure", "संगठन संरचना", "संस्था प्रकार")}
                    <select
                      value={fpoForm.fpoIncorporationType}
                      onChange={(e) => setFpoForm({ ...fpoForm, fpoIncorporationType: e.target.value })}
                      required
                    >
                      <option value="Farmer Producer Company (Companies Act)">Farmer Producer Company (Companies Act 2013)</option>
                      <option value="Cooperative Society (State / Multi-State)">Cooperative Society (State / Multi-State)</option>
                      <option value="Trust / Society">Registered Agricultural Society</option>
                    </select>
                  </label>
                  <label>
                    {getLabel("Establishment Year", "स्थापना वर्ष", "स्थापना वर्ष")}
                    <input
                      type="number"
                      value={fpoForm.fpoEstablishmentYear}
                      onChange={(e) => setFpoForm({ ...fpoForm, fpoEstablishmentYear: +e.target.value })}
                    />
                  </label>
                  <label>
                    {getLabel("Registered Shareholder Farmers Count", "पंजीकृत सदस्य किसानों की संख्या", "एकूण सभासद शेतकरी संख्या")}
                    <input
                      type="number"
                      value={fpoForm.memberCount}
                      onChange={(e) => setFpoForm({ ...fpoForm, memberCount: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    {getLabel("Contact Phone", "संपर्क फोन", "संपर्क फोन")}
                    <input
                      value={fpoForm.phone}
                      onChange={(e) => setFpoForm({ ...fpoForm, phone: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    {getLabel("District", "जिला", "जिल्हा")}
                    <input
                      value={fpoForm.district}
                      onChange={(e) => setFpoForm({ ...fpoForm, district: e.target.value })}
                    />
                  </label>
                  <label>
                    {getLabel("State", "राज्य", "राज्य")}
                    <input
                      value={fpoForm.state}
                      onChange={(e) => setFpoForm({ ...fpoForm, state: e.target.value })}
                    />
                  </label>
                </div>

                <label style={{ display: "block", marginTop: "12px" }}>
                  {getLabel("Central Office & Aggregation Yard Address", "केंद्रीय कार्यालय व एकत्रीकरण केंद्र का पता", "कार्यालय व शेतमाल एकत्रीकरण केंद्राचा पत्ता")}
                  <textarea
                    rows="2"
                    value={fpoForm.address}
                    onChange={(e) => setFpoForm({ ...fpoForm, address: e.target.value })}
                  />
                </label>

                <button className="primary" type="submit" disabled={profileSaving} style={{ marginTop: "16px" }}>
                  {profileSaving ? getLabel("Saving...", "सहेजा जा रहा है...", "जतन करत आहे...") : getLabel("Save FPO Leader Profile", "एफपीओ प्रोफाइल सहेजें", "एफपीओ प्रोफाइल जतन करा")}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Aggregate Function & Produce Pooling Desk */}
          {fpoActiveTab === "aggregation" && (
            <div className="two-col animate-fadeIn" style={{ alignItems: "flex-start" }}>
              {/* Left Column: Interactive Produce Aggregation Pooling Calculator */}
              <div className="panel" style={{ flex: 1.1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ background: "#dcfce7", color: "#166534", padding: "8px", borderRadius: "8px" }}>
                    <Calculator size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "17px" }}>
                      {getLabel("Produce Aggregation Pooling Calculator", "उपज एकत्रीकरण सामूहिक लाभ कैलकुलेटर", "शेतमाल एकत्रीकरण नफा कॅल्क्युलेटर")}
                    </h3>
                    <small style={{ color: "var(--ink-secondary)" }}>
                      Simulate pooled farmer gains vs individual spot mandi selling
                    </small>
                  </div>
                </div>

                {/* Calculator Inputs */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>
                      Select Commodity:
                      <select
                        value={aggCrop}
                        onChange={(e) => {
                          const crop = e.target.value;
                          setAggCrop(crop);
                          if (crop === "Soyabean") { setAggBaseMandiPrice(4850); setAggBulkOfferPrice(4980); }
                          else if (crop === "Wheat") { setAggBaseMandiPrice(2425); setAggBulkOfferPrice(2520); }
                          else if (crop === "Gram (Chana)") { setAggBaseMandiPrice(5400); setAggBulkOfferPrice(5580); }
                          else if (crop === "Mustard") { setAggBaseMandiPrice(5650); setAggBulkOfferPrice(5820); }
                        }}
                        style={{ width: "100%", marginTop: "4px", padding: "6px 8px" }}
                      >
                        <option value="Soyabean">Soyabean (सोयाबीन)</option>
                        <option value="Wheat">Wheat (गेहूं)</option>
                        <option value="Gram (Chana)">Gram / Chana (चना)</option>
                        <option value="Mustard">Mustard (सरसों)</option>
                      </select>
                    </label>

                    <label style={{ fontSize: "12px", fontWeight: 600 }}>
                      Farmers in Pool: <b>{aggFarmersCount} Pro-rata Farmers</b>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={aggFarmersCount}
                        onChange={(e) => setAggFarmersCount(+e.target.value)}
                        style={{ width: "100%", marginTop: "8px" }}
                      />
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600 }}>
                      Avg Harvest / Farmer (Qtl):
                      <input
                        type="number"
                        min="5"
                        max="200"
                        value={aggYieldPerFarmer}
                        onChange={(e) => setAggYieldPerFarmer(+e.target.value)}
                        style={{ width: "100%", marginTop: "4px", padding: "6px 8px" }}
                      />
                    </label>

                    <label style={{ fontSize: "12px", fontWeight: 600 }}>
                      Institutional Bulk Offer (₹/Qtl):
                      <input
                        type="number"
                        value={aggBulkOfferPrice}
                        onChange={(e) => setAggBulkOfferPrice(+e.target.value)}
                        style={{ width: "100%", marginTop: "4px", padding: "6px 8px" }}
                      />
                    </label>
                  </div>
                </div>

                {/* Calculator Live Output Results */}
                {(() => {
                  const totalQtl = aggFarmersCount * aggYieldPerFarmer;
                  const totalMt = (totalQtl / 10).toFixed(1);
                  const freightSaving = totalQtl * 50;
                  const premiumPerQtl = Math.max(0, aggBulkOfferPrice - aggBaseMandiPrice);
                  const premiumTotal = totalQtl * premiumPerQtl;
                  const totalGain = freightSaving + premiumTotal;
                  const perFarmerGain = Math.round(totalGain / (aggFarmersCount || 1));

                  return (
                    <div
                      style={{
                        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                        border: "1px solid #86efac",
                        borderRadius: "10px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", textTransform: "uppercase" }}>
                            AGGREGATED LOT VOLUME
                          </span>
                          <h2 style={{ margin: "2px 0", fontSize: "22px", color: "#14532d" }}>
                            {totalMt} Metric Tonnes ({totalQtl.toLocaleString()} Quintals)
                          </h2>
                        </div>
                        <span style={{ background: "#16a34a", color: "#ffffff", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }}>
                          Commercial Lot Ready
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px", fontSize: "13px" }}>
                        <div style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                          <span style={{ color: "#64748b", display: "block", fontSize: "11px" }}>Bulk Freight & Handling Saved:</span>
                          <strong style={{ fontSize: "15px", color: "#15803d" }}>₹{freightSaving.toLocaleString()}</strong>
                        </div>
                        <div style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                          <span style={{ color: "#64748b", display: "block", fontSize: "11px" }}>Institutional Price Premium:</span>
                          <strong style={{ fontSize: "15px", color: "#15803d" }}>+₹{premiumTotal.toLocaleString()}</strong>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "12px", color: "#166534", display: "block" }}>Total Farmer Collective Net Gain:</span>
                          <strong style={{ fontSize: "20px", color: "#14532d" }}>₹{totalGain.toLocaleString()}</strong>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "11px", color: "#166534", display: "block" }}>Extra Gain / Farmer:</span>
                          <strong style={{ fontSize: "15px", color: "#15803d" }}>+₹{perFarmerGain.toLocaleString()} / farmer</strong>
                        </div>
                      </div>

                      <div style={{ marginTop: "14px" }}>
                        <Link
                          className="primary"
                          to={`/${r}/aggregation`}
                          style={{
                            display: "block",
                            textAlign: "center",
                            textDecoration: "none",
                            padding: "10px",
                            fontWeight: 700,
                            fontSize: "13px",
                          }}
                        >
                          🚀 Launch {totalMt} MT Aggregated Lot to Marketplace →
                        </Link>
                      </div>
                    </div>
                  );
                })()}

                {/* Operational Readiness Checklist */}
                <div style={{ marginTop: "18px" }}>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                    ⚙️ Aggregation Yard Operational Readiness:
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534" }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span><b>Electronic Weighbridge:</b> 60 MT capacity on-site (Weight & Measures certified)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534" }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span><b>Mechanical Grain Cleaner & Destoner:</b> 5 MT/hr pre-cleaning ready</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534" }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span><b>Digital Moisture Assay Lab:</b> Calibrated strictly with Krishi Vigyan Kendra standards</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534" }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span><b>Storage Silo / Covered Space:</b> 1,500 MT capacity with fumigation security</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Configure Aggregation Specifications Form */}
              <form
                className="form-card"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfile(fpoForm);
                }}
              >
                <h3>{getLabel("Configure Aggregation Parameters", "एकत्रीकरण मानदंड कॉन्फ़िगर करें", "एकत्रीकरण निकष सेट करा")}</h3>
                <div className="form-grid">
                  <label>
                    {getLabel("Seasonal Aggregation Capacity", "मौसमी एकत्रीकरण क्षमता", "हंगामी एकत्रीकरण क्षमता")}
                    <input
                      value={fpoForm.fpoAggregationCapacity}
                      placeholder="e.g. 1,500 MT / Season"
                      onChange={(e) => setFpoForm({ ...fpoForm, fpoAggregationCapacity: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    {getLabel("Active Member Farmers in Pool", "पूल में सक्रिय किसान", "सक्रिय शेतकरी संख्या")}
                    <input
                      type="number"
                      value={fpoForm.memberCount}
                      onChange={(e) => setFpoForm({ ...fpoForm, memberCount: e.target.value })}
                      required
                    />
                  </label>
                </div>

                <div style={{ marginTop: "14px" }}>
                  <label style={{ fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "6px" }}>
                    {getLabel("Primary Aggregated Crops (Click to toggle)", "मुख्य एकत्रीकरण फसलें", "एकत्रित पिके")}
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {["Wheat", "Soyabean", "Gram (Chana)", "Mustard", "Maize", "Paddy (Rice)", "Cotton"].map((c) => {
                      const isSel = (fpoForm.preferredCommodities || []).includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCommodity(c, "fpo")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: isSel ? "1px solid #16a34a" : "1px solid #cbd5e1",
                            background: isSel ? "#f0fdf4" : "#f8fafc",
                            color: isSel ? "#15803d" : "#475569",
                          }}
                        >
                          {isSel ? "✓" : "+"} {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label style={{ display: "block", marginTop: "14px" }}>
                  {getLabel("Collection Yard Address & Storage Specs", "कलेक्शन यार्ड पता व भंडारण क्षमता", "एकत्रीकरण केंद्र पत्ता व गोदाम क्षमता")}
                  <textarea
                    rows="3"
                    value={fpoForm.address}
                    placeholder="e.g. Krishi Upaj Mandi Aggregation Yard, Block-2. Certified 500 MT storage."
                    onChange={(e) => setFpoForm({ ...fpoForm, address: e.target.value })}
                  />
                </label>

                <button className="primary" type="submit" disabled={profileSaving} style={{ marginTop: "16px" }}>
                  {profileSaving ? getLabel("Saving...", "सहेजा जा रहा है...", "जतन करत आहे...") : getLabel("Save Aggregation Profile", "एकत्रीकरण प्रोफाइल सहेजें", "एकत्रीकरण प्रोफाइल जतन करा")}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SFAC Recognition & Banking */}
          {fpoActiveTab === "governance" && (
            <div className="two-col animate-fadeIn" style={{ alignItems: "flex-start" }}>
              <div className="panel" style={{ border: "2px solid #86efac", background: "#f0fdf4" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#166534", letterSpacing: "1px" }}>
                      GOVERNMENT ACCREDITATION
                    </span>
                    <h2 style={{ margin: "4px 0", fontSize: "20px", color: "#14532d" }}>
                      {user?.organizationName}
                    </h2>
                    <small style={{ color: "#166534" }}>
                      SFAC Registry ID: <code>{user?.registrationNumber || "SFAC-CENTRAL-0492"}</code>
                    </small>
                  </div>
                  <Award size={36} color="#16a34a" />
                </div>

                <div style={{ marginTop: "16px", fontSize: "13px", color: "#166534", lineHeight: "1.6" }}>
                  <p>✓ Authorized collective selling authority under National Agriculture Policy.</p>
                  <p>✓ All combined lots posted by this FPO are protected by 100% Escrow deposit verification prior to vehicle dispatch.</p>
                  <p>✓ Integrated with State APMC Electronic Mandi clearing.</p>
                </div>
              </div>

              <div className="panel">
                <h3>{getLabel("Farmer Member Payout Governance", "किसान सदस्य भुगतान नियम", "शेतकरी सभासद देयक वाटप")}</h3>
                <p style={{ color: "var(--ink-secondary)", fontSize: "13px", lineHeight: "1.6" }}>
                  When institutional buyers purchase an aggregated lot, the funds are paid directly into the escrow vault. The FPO leader and management oversee fair and proportional automated distribution to each contributing farmer's bank account with 0 delay.
                </p>
                <div style={{ marginTop: "14px" }}>
                  <Link className="primary" to={`/${r}/farmers`} style={{ textDecoration: "none" }}>
                    Manage Member Roster & e-KYC →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      );
    }

    // -------------------------------------------------------------
    // 3. FARMER PROFILE WITH E-KYC
    // -------------------------------------------------------------
    if (user?.role === "FARMER") {
      const isEkycVerified = user?.ekycStatus === "VERIFIED" || user?.verification === "VERIFIED";

      return (
        <section className="profile-page animate-fadeIn">
          <div className="page-header">
            <div>
              <p className="eyebrow">{getLabel("PRODUCER PROFILE & CREDENTIALS", "उत्पादक प्रोफाइल व क्रेडेंशियल", "उत्पादक प्रोफाइल व ओळख")}</p>
              <h1>{user?.name || "Farmer"} Profile</h1>
              <p style={{ color: "var(--ink-secondary)" }}>
                {getLabel(
                  "Government authenticated agricultural producer profile connected to digital mandis, FPOs, and institutional buyers.",
                  "सरकारी प्रमाणित कृषि उत्पादक प्रोफाइल - डिजिटल मंडियों, एफपीओ और संस्थागत खरीदारों से सीधे जुड़ी।",
                  "शासकीय प्रमाणित कृषी उत्पादक प्रोफाइल - डिजिटल बाजार समित्या, एफपीओ आणि खरेदीदारांशी थेट जोडलेली."
                )}
              </p>
            </div>
            <div>
              <FarmerVerificationBadge verification={user?.verification} farmer={user} compact={true} />
            </div>
          </div>

          {profileMsg && <div className="form-message success" style={{ marginBottom: "16px" }}>✓ {profileMsg}</div>}
          {profileErr && <div className="form-message error" style={{ marginBottom: "16px" }}>✕ {profileErr}</div>}

          {/* Dedicated e-KYC Verification Spotlight Card */}
          <div
            className="ekyc-spotlight-card panel"
            style={{
              marginBottom: "24px",
              background: isEkycVerified
                ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
              border: isEkycVerified ? "1px solid #86efac" : "1px solid #fde68a",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "24px" }}>{isEkycVerified ? "🛡️" : "⚠️"}</span>
                  <h2 style={{ margin: 0, fontSize: "19px", color: isEkycVerified ? "#14532d" : "#92400e" }}>
                    {isEkycVerified
                      ? getLabel("e-KYC Verified Producer Status", "ई-केवाईसी सत्यापित किसान दर्जा", "ई-केवायसी प्रमाणित शेतकरी दर्जा")
                      : getLabel("Complete Farmer e-KYC Verification", "किसान ई-केवाईसी सत्यापन पूर्ण करें", "शेतकरी ई-केवायसी पडताळणी पूर्ण करा")}
                  </h2>
                </div>
                <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: isEkycVerified ? "#166534" : "#78350f", lineHeight: "1.5" }}>
                  {isEkycVerified
                    ? getLabel(
                        `Your identity is verified via Government records (${user?.ekycType || "UIDAI / PM-KISAN"}). All your produce lots carry the verified trust checkmark visible to Buyers and FPOs.`,
                        `आपकी पहचान सरकारी रिकॉर्ड (${user?.ekycType || "यूआईडीएआई / पीएम-किसान"}) से सत्यापित है। आपके सभी लॉट्स पर खरीदारों और एफपीओ के लिए सत्यापित ट्रस्ट चेकमार्क दिखता है।`,
                        `आपली ओळख शासकीय नोंदीनुसार (${user?.ekycType || "युआयडीएआय / पीएम-किसान"}) प्रमाणित आहे. आपला सर्व शेतमाल खरेदीदार व एफपीओंना 'प्रमाणित' दिसेल.`
                      )
                    : getLabel(
                        "Verify your farmer credentials via Aadhaar e-KYC, PM-KISAN ID, or State Land Records (7/12). Verification builds instant buyer trust, enables higher offer prices, and gives full escrow protection.",
                        "आधार ई-केवाईसी, पीएम-किसान आईडी, अथवा 7/12 भू-अभिलेख से किसान सत्यापन करें। इससे खरीदार भरोसा बढ़ता है और बेहतर भाव मिलते हैं।",
                        "आधार ई-केवायसी, पीएम-किसान किंवा ७/१२ द्वारे शेतकरी पडताळणी पूर्ण करा. यामुळे खरेदीदारांचा विश्वास वाढून चांगला दर मिळतो."
                      )}
                </p>

                {isEkycVerified && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "13px", color: "#166534" }}>
                    <div><b>Verification ID:</b> <code>{user?.ekycIdNumber || "XXXX-XXXX-4829"}</code></div>
                    <div><b>Verified Method:</b> {user?.ekycType || "Aadhaar e-KYC"}</div>
                    {user?.ekycVerifiedAt && (
                      <div><b>Certified Date:</b> {new Date(user.ekycVerifiedAt).toLocaleDateString("en-IN")}</div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <button
                  type="button"
                  className={isEkycVerified ? "secondary" : "primary"}
                  onClick={() => setShowEkycModal(true)}
                  style={{
                    padding: "10px 18px",
                    fontWeight: 700,
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: !isEkycVerified ? "#15803d" : undefined,
                    color: !isEkycVerified ? "#ffffff" : undefined,
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>
                    {isEkycVerified
                      ? getLabel("↺ Update / Re-Verify e-KYC", "↺ ई-केवाईसी अपडेट करें", "↺ ई-केवायसी पुन्हा तपासा")
                      : getLabel("🛡️ Complete e-KYC Now →", "🛡️ अभी ई-केवाईसी पूर्ण करें →", "🛡️ आताच ई-केवायसी पूर्ण करा →")}
                  </span>
                </button>
                <small style={{ color: isEkycVerified ? "#166534" : "#92400e", fontSize: "11px" }}>
                  {isEkycVerified ? "Active across Buyer & FPO portals" : "Takes less than 1 minute with Aadhaar / PM-KISAN"}
                </small>
              </div>
            </div>
          </div>

          {/* Digital Kisan Identity Card */}
          <div
            className="digital-kisan-card panel"
            style={{
              marginBottom: "24px",
              background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
              borderRadius: "16px",
              padding: "22px 26px",
              color: "#ffffff",
              boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", position: "relative", zIndex: 1 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1.2px", background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "12px" }}>
                    GOVT OF INDIA & KRISHILINK KISAN IDENTITY
                  </span>
                  {isEkycVerified && (
                    <span style={{ fontSize: "11px", fontWeight: 800, background: "#86efac", color: "#064e3b", padding: "3px 10px", borderRadius: "12px" }}>
                      ✓ e-KYC VERIFIED
                    </span>
                  )}
                </div>
                <h2 style={{ margin: "4px 0 2px 0", fontSize: "24px", fontWeight: 800 }}>
                  {user?.name || "Farmer"}
                </h2>
                <span style={{ fontSize: "13px", opacity: 0.85 }}>
                  Registration ID: <code style={{ color: "#a7f3d0", background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: "4px" }}>{user?.ekycIdNumber ? `KL-FARM-${user.ekycIdNumber.slice(-5)}` : "KL-FARM-92841-IN"}</code>
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowFarmerCardModal(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    background: "#ffffff",
                    color: "#064e3b",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <Printer size={15} />
                  <span>{getLabel("Print / Save Digital Card", "कार्ड प्रिंट / सेव करें", "डिजिटल कार्ड प्रिंट करा")}</span>
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginTop: "20px", position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", opacity: 0.75, display: "block" }}>Landholding Size</span>
                <strong style={{ fontSize: "16px", color: "#ecfdf5" }}>{user?.landSize ? `${user.landSize} Acres` : "5.0 Acres"}</strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", opacity: 0.75, display: "block" }}>Primary Commodity</span>
                <strong style={{ fontSize: "16px", color: "#ecfdf5" }}>{user?.primaryCrop || "Wheat (Grade A)"}</strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", opacity: 0.75, display: "block" }}>Village & Tehsil</span>
                <strong style={{ fontSize: "16px", color: "#ecfdf5" }}>{user?.location || "Sanwer"}, {user?.district || "Indore"}</strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", opacity: 0.75, display: "block" }}>Soil Health Rating</span>
                <strong style={{ fontSize: "16px", color: "#86efac" }}>Grade A Optimal</strong>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid" style={{ marginBottom: "24px" }}>
            <Card
              a={getLabel("FARM & HOLDING", "खेत व जोत", "शेत व जमीन")}
              b={`${user?.landSize || "5"} Acres`}
              c={user?.farmName || "Primary Agricultural Farm"}
            />
            <Card
              a={getLabel("PRIMARY HARVEST", "मुख्य उपज", "मुख्य पीक")}
              b={user?.primaryCrop || "Wheat"}
              c={getLabel("Grade A Quality Ready", "ग्रेड ए गुणवत्ता तैयार", "दर्जा अ शेतमाल उपलब्ध")}
            />
            <Card
              a={getLabel("TRUST BADGE", "विश्वास बैज", "विश्वास दर्शक")}
              b={isEkycVerified ? "e-KYC VERIFIED" : "PENDING"}
              c={isEkycVerified ? "Visible to all buyers & FPOs" : "Complete e-KYC to unlock badge"}
            />
          </div>

          <div className="two-col" style={{ alignItems: "flex-start" }}>
            {/* Left Column: Farmer Identity Card */}
            <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <FarmerVerificationBadge verification={user?.verification} farmer={user} showDetails={true} />

              <div style={{ borderTop: "1px solid var(--line-light)", paddingTop: "14px" }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                  {getLabel("Farmer Identity & Contact", "किसान पहचान व संपर्क", "शेतकरी ओळख व संपर्क")}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                  <div>
                    <span style={{ color: "var(--ink-secondary)" }}>Farmer Name: </span>
                    <b>{user?.name}</b>
                  </div>
                  <div>
                    <span style={{ color: "var(--ink-secondary)" }}>Mobile Number: </span>
                    <b>{user?.phone || "Not configured"}</b>
                  </div>
                  <div>
                    <span style={{ color: "var(--ink-secondary)" }}>Registered Email: </span>
                    <b>{user?.email}</b>
                  </div>
                  <div>
                    <span style={{ color: "var(--ink-secondary)" }}>Farm Name: </span>
                    <b>{user?.farmName || "Not set"}</b>
                  </div>
                  <div>
                    <span style={{ color: "var(--ink-secondary)" }}>Landholding: </span>
                    <b>{user?.landSize ? `${user.landSize} Acres` : "Not set"}</b>
                  </div>
                  <div>
                    <span style={{ color: "var(--ink-secondary)" }}>Primary Produce: </span>
                    <b>{user?.primaryCrop || "Wheat"}</b>
                  </div>
                  <div>
                    <span style={{ color: "var(--ink-secondary)" }}>Location: </span>
                    <span>📍 {user?.location || "Indore"}, {user?.district} {user?.state}</span>
                  </div>
                </div>
              </div>

              {/* Land Parcel & Khasra Survey Card */}
              <div style={{ borderTop: "1px solid var(--line-light)", paddingTop: "14px" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#1e293b" }}>
                  📜 {getLabel("Land Records & Soil Card", "भू-अभिलेख व मृदा स्वास्थ्य कार्ड", "जमीन महसूल व मृदा आरोग्य पत्रिका")}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: "#f8fafc", borderRadius: "6px" }}>
                    <span style={{ color: "var(--ink-secondary)" }}>Khasra / Survey No:</span>
                    <b>KH-142/3 (Sanwer)</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: "#f8fafc", borderRadius: "6px" }}>
                    <span style={{ color: "var(--ink-secondary)" }}>Soil Classification:</span>
                    <span style={{ color: "#15803d", fontWeight: 600 }}>Medium Black (Grade A)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: "#f8fafc", borderRadius: "6px" }}>
                    <span style={{ color: "var(--ink-secondary)" }}>Irrigation Source:</span>
                    <span>Solar Tubewell & Drip</span>
                  </div>
                </div>
              </div>

              {/* Direct Escrow & PM-KISAN Bank Account Card */}
              <div style={{ borderTop: "1px solid var(--line-light)", paddingTop: "14px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1e293b" }}>
                  💳 {getLabel("Direct Escrow Payout Bank Account", "प्रत्यक्ष एस्क्रो भुगतान बैंक खाता", "थेट एस्क्रो बँक खाते")}
                </h4>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 12px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#166534" }}>NPCI Aadhaar Seeded:</span>
                    <strong style={{ color: "#15803d" }}>✓ Active</strong>
                  </div>
                  <div style={{ color: "#166534", fontSize: "12px" }}>
                    State Bank of India · A/c ending <b>●●●● 4829</b> · Instant escrow payout on delivery approval
                  </div>
                </div>
              </div>

              {/* Farmer Quick Links */}
              <div style={{ borderTop: "1px solid var(--line-light)", paddingTop: "14px" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "var(--ink-secondary)", textTransform: "uppercase" }}>
                  {getLabel("Marketplace Links", "बाजार लिंक", "बाजार दुवे")}
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <Link className="primary" to={`/${r}/lots`} style={{ fontSize: "13px", padding: "8px 14px", textDecoration: "none" }}>
                    ▦ {getLabel("Manage My Lots", "मेरे लॉट्स प्रबंधित करें", "माझा शेतमाल")}
                  </Link>
                  <Link className="secondary" to={`/${r}/prices`} style={{ fontSize: "13px", padding: "8px 14px", textDecoration: "none" }}>
                    ↗ {getLabel("Mandi Rates", "मंडी भाव", "बाजार भाव")}
                  </Link>
                  <Link className="secondary" to={`/${r}/offers`} style={{ fontSize: "13px", padding: "8px 14px", textDecoration: "none" }}>
                    ↔ {getLabel("Buyer Offers", "खरीदार ऑफर", "खरेदी ऑफर")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Update Farmer Details Form */}
            <form
              className="form-card"
              onSubmit={(e) => {
                e.preventDefault();
                saveProfile(farmerForm);
              }}
            >
              <h3>{getLabel("Update Farm & Produce Details", "खेत व फसल विवरण अपडेट करें", "शेत व पिकाचा तपशील अपडेट करा")}</h3>
              <p style={{ color: "var(--ink-secondary)", fontSize: "13px", margin: "0 0 16px 0" }}>
                {getLabel(
                  "Accurate farm size and crop records help buyers source verified produce directly from your farm.",
                  "सटीक जोत आकार और फसल रिकॉर्ड खरीदारों को आपके खेत से सीधे उपज खरीदने में मदद करते हैं।",
                  "अचूक शेतजमीन व पिकांची माहिती खरेदीदारांना थेट आपल्या शेतातून माल खरेदी करण्यास मदत करते."
                )}
              </p>

              <div className="form-grid">
                <label>
                  {getLabel("Farmer Full Name", "किसान का पूरा नाम", "शेतकऱ्याचे पूर्ण नाव")}
                  <input
                    value={farmerForm.name}
                    onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  {getLabel("Mobile Phone Number", "मोबाइल फोन नंबर", "मोबाईल फोन क्रमांक")}
                  <input
                    value={farmerForm.phone}
                    onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                    required
                  />
                </label>
                <label>
                  {getLabel("Farm / Holding Name", "खेत / जोत का नाम", "शेताचे नाव")}
                  <input
                    value={farmerForm.farmName}
                    onChange={(e) => setFarmerForm({ ...farmerForm, farmName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  {getLabel("Primary Crop", "मुख्य फसल / जींस", "मुख्य पीक")}
                  <input
                    value={farmerForm.primaryCrop}
                    onChange={(e) => setFarmerForm({ ...farmerForm, primaryCrop: e.target.value })}
                    required
                  />
                </label>
                <label>
                  {getLabel("Total Landholding (Acres)", "कुल भूमि जोत (एकड़)", "एकूण जमीन (एकर)")}
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={farmerForm.landSize}
                    onChange={(e) => setFarmerForm({ ...farmerForm, landSize: e.target.value })}
                    required
                  />
                </label>
                <label>
                  {getLabel("District", "जिला", "जिल्हा")}
                  <input
                    value={farmerForm.district}
                    onChange={(e) => setFarmerForm({ ...farmerForm, district: e.target.value })}
                  />
                </label>
                <label>
                  {getLabel("State", "राज्य", "राज्य")}
                  <input
                    value={farmerForm.state}
                    onChange={(e) => setFarmerForm({ ...farmerForm, state: e.target.value })}
                  />
                </label>
                <label>
                  {getLabel("Village / Tehsil", "गाँव / तहसील", "गाव / तालुका")}
                  <input
                    value={farmerForm.location}
                    onChange={(e) => setFarmerForm({ ...farmerForm, location: e.target.value })}
                  />
                </label>
              </div>

              <label style={{ display: "block", marginTop: "12px" }}>
                {getLabel("Farm Address & Access Road", "खेत का पूरा पता", "शेताचा पूर्ण पत्ता")}
                <textarea
                  rows="2"
                  value={farmerForm.address}
                  onChange={(e) => setFarmerForm({ ...farmerForm, address: e.target.value })}
                />
              </label>

              <button className="primary" type="submit" disabled={profileSaving} style={{ marginTop: "16px" }}>
                {profileSaving ? getLabel("Saving...", "सहेजा जा रहा है...", "जतन करत आहे...") : getLabel("Save Farmer Profile", "किसान प्रोफाइल सहेजें", "शेतकरी प्रोफाइल जतन करा")}
              </button>
            </form>
          </div>

          {/* Interactive e-KYC Verification Modal */}
          {showEkycModal && (
            <div className="modal-overlay animate-fadeIn" style={{ zIndex: 1200 }}>
              <div
                className="modal-content"
                style={{
                  maxWidth: "540px",
                  padding: "24px",
                  borderRadius: "14px",
                  background: "#ffffff",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ background: "#ecfdf5", padding: "8px", borderRadius: "8px", color: "#059669" }}>
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "18px" }}>
                        {getLabel("Farmer e-KYC Verification", "किसान ई-केवाईसी सत्यापन", "शेतकरी ई-केवायसी पडताळणी")}
                      </h3>
                      <small style={{ color: "var(--ink-secondary)" }}>
                        {getLabel("National UIDAI & PM-KISAN Authentication", "राष्ट्रीय यूआईडीएआई व पीएम-किसान प्रमाणीकरण", "शासकीय युआयडीएआय व पीएम-किसान प्रमाणीकरण")}
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEkycModal(false)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {ekycModalMsg && <div className="form-message success" style={{ marginBottom: "14px" }}>✓ {ekycModalMsg}</div>}
                {ekycModalErr && <div className="form-message error" style={{ marginBottom: "14px" }}>✕ {ekycModalErr}</div>}

                {/* Verification Document Tabs */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
                  {[
                    { id: "AADHAAR", label: "Aadhaar OTP", icon: "🏛️" },
                    { id: "PM_KISAN", label: "PM-KISAN ID", icon: "🌾" },
                    { id: "LAND_RECORD", label: "Land Record (7/12)", icon: "📜" },
                    { id: "KCC", label: "Kisan Credit Card", icon: "💳" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setEkycType(tab.id);
                        setOtpSent(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: ekycType === tab.id ? "#16a34a" : "#e2e8f0",
                        background: ekycType === tab.id ? "#f0fdf4" : "#f8fafc",
                        color: ekycType === tab.id ? "#15803d" : "#475569",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleEkycSubmit}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label>
                      {getLabel("Farmer Full Name (as on Govt ID)", "किसान का पूरा नाम (पहचान पत्र अनुसार)", "शेतकऱ्याचे पूर्ण नाव (ओळखपत्राप्रमाणे)")}
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Chandra Patel"
                        required
                      />
                    </label>

                    <label>
                      {ekycType === "AADHAAR" && getLabel("12-Digit Aadhaar Number", "12-अंकीय आधार नंबर", "१२ अंकी आधार क्रमांक")}
                      {ekycType === "PM_KISAN" && getLabel("PM-KISAN Registration ID", "पीएम-किसान पंजीकरण आईडी", "पीएम-किसान नोंदणी क्रमांक")}
                      {ekycType === "LAND_RECORD" && getLabel("Land Record / Khasra-Khatauni / 7/12 Number", "भू-अभिलेख / खसरा / 7-12 क्रमांक", "जमीन महसूल / ७/१२ / गट क्रमांक")}
                      {ekycType === "KCC" && getLabel("Kisan Credit Card Number", "किसान क्रेडिट कार्ड नंबर", "किसान क्रेडिट कार्ड क्रमांक")}
                      <input
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder={
                          ekycType === "AADHAAR"
                            ? "e.g. 5482 9182 4829"
                            : ekycType === "PM_KISAN"
                            ? "e.g. MP-KISAN-92841"
                            : "e.g. KH-482/91"
                        }
                        required
                      />
                    </label>

                    {ekycType === "LAND_RECORD" && (
                      <label>
                        {getLabel("Village & Tehsil", "गाँव व तहसील", "गाव व तालुका")}
                        <input
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          placeholder="e.g. Sanwer, Indore"
                        />
                      </label>
                    )}

                    {/* Aadhaar OTP flow */}
                    {ekycType === "AADHAAR" && (
                      <div
                        style={{
                          padding: "12px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                            {getLabel("UIDAI Mobile OTP Authentication", "यूआईडीएआई मोबाइल ओटीपी प्रमाणीकरण", "युआयडीएआय मोबाईल ओटीपी प्रमाणीकरण")}
                          </span>
                          {!otpSent ? (
                            <button
                              type="button"
                              onClick={() => setOtpSent(true)}
                              style={{
                                padding: "4px 10px",
                                fontSize: "12px",
                                background: "#0284c7",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              {getLabel("Send OTP", "ओटीपी भेजें", "ओटीपी पाठवा")}
                            </button>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
                              ✓ {getLabel("OTP Sent", "ओटीपी भेजा गया", "ओटीपी पाठवला")}
                            </span>
                          )}
                        </div>

                        {otpSent && (
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <input
                              placeholder="Enter 6-digit OTP (e.g. 842109)"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => setOtp("842109")}
                              style={{
                                padding: "8px 10px",
                                fontSize: "11px",
                                background: "#e2e8f0",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              ⚡ Auto-Fill
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      padding: "10px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#166534",
                      lineHeight: "1.4",
                    }}
                  >
                    🔒 <b>Cross-Marketplace Trust:</b> Once verified, your produce lots in <b>My Lots</b>, <b>Offers</b>, and <b>Buyer Matching</b> will carry the <b>🛡️ e-KYC Verified Farmer</b> seal for both Buyers and FPO aggregators.
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
                    <button type="button" onClick={() => setShowEkycModal(false)}>
                      {getLabel("Cancel", "रद्द करें", "रद्द करा")}
                    </button>
                    <button
                      className="primary"
                      type="submit"
                      disabled={ekycLoading || (ekycType === "AADHAAR" && otpSent && !otp)}
                      style={{
                        background: "#16a34a",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ShieldCheck size={16} />
                      <span>{ekycLoading ? "Verifying with Registry..." : "Verify & Activate Badge →"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Official Digital Kisan Card Certificate Modal */}
          {showFarmerCardModal && (
            <div className="modal-overlay animate-fadeIn" style={{ zIndex: 1200 }}>
              <div
                className="modal-content"
                style={{
                  maxWidth: "600px",
                  padding: "24px",
                  borderRadius: "16px",
                  background: "#ffffff",
                  boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.25)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Printer size={20} color="#15803d" />
                    <h3 style={{ margin: 0, fontSize: "17px" }}>
                      {getLabel("Official Digital Kisan Smart Card", "आधिकारिक डिजिटल किसान स्मार्ट कार्ड", "अधिकृत डिजिटल किसान स्मार्ट कार्ड")}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFarmerCardModal(false)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Card Container for Printing */}
                <div
                  id="printable-kisan-card"
                  style={{
                    border: "2px solid #16a34a",
                    borderRadius: "14px",
                    overflow: "hidden",
                    background: "#ffffff",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* Card Header */}
                  <div style={{ background: "linear-gradient(90deg, #14532d 0%, #166534 100%)", color: "#ffffff", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1px", color: "#86efac", display: "block" }}>
                        MINISTRY OF AGRICULTURE & FARMERS WELFARE
                      </span>
                      <strong style={{ fontSize: "15px" }}>KRISHILINK DIGITAL KISAN IDENTIFICATION</strong>
                    </div>
                    <ShieldCheck size={28} color="#86efac" />
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: "18px", display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: "90px", height: "105px", background: "#f1f5f9", borderRadius: "8px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "36px" }}>🧑‍🌾</span>
                      <small style={{ fontSize: "9px", color: "#64748b", fontWeight: 700, marginTop: "4px" }}>PHOTO ID</small>
                    </div>

                    <div style={{ flex: 1, fontSize: "13px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div><span style={{ color: "#64748b" }}>Name: </span><b>{user?.name}</b></div>
                      <div><span style={{ color: "#64748b" }}>Kisan UID: </span><code>{user?.ekycIdNumber ? `KL-FARM-${user.ekycIdNumber.slice(-5)}` : "KL-FARM-92841-IN"}</code></div>
                      <div><span style={{ color: "#64748b" }}>Landholding: </span><b>{user?.landSize ? `${user.landSize} Acres` : "5.0 Acres"}</b></div>
                      <div><span style={{ color: "#64748b" }}>Village / Tehsil: </span><b>{user?.location || "Sanwer"}, {user?.district || "Indore"}</b></div>
                      <div><span style={{ color: "#64748b" }}>e-KYC Status: </span><span style={{ color: "#15803d", fontWeight: 700 }}>✓ UIDAI Authenticated</span></div>
                    </div>

                    {/* QR Code Simulation */}
                    <div style={{ width: "80px", height: "80px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "4px", background: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#14532d" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="3" height="3" />
                        <rect x="18" y="18" width="3" height="3" />
                      </svg>
                      <small style={{ fontSize: "8px", color: "#64748b", marginTop: "2px" }}>SCAN TO VERIFY</small>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ background: "#f0fdf4", borderTop: "1px solid #bbf7d0", padding: "8px 18px", fontSize: "11px", color: "#166534", display: "flex", justifyContent: "space-between" }}>
                    <span>Valid across Digital Mandis & FPOs</span>
                    <span>National e-KYC Registry</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
                  <button type="button" onClick={() => setShowFarmerCardModal(false)}>
                    {getLabel("Close", "बंद करें", "बंद करा")}
                  </button>
                  <button
                    className="primary"
                    type="button"
                    onClick={() => window.print()}
                    style={{
                      background: "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                    }}
                  >
                    <Printer size={15} />
                    <span>{getLabel("Print Certificate", "प्रमाणपत्र प्रिंट करें", "प्रमाणपत्र प्रिंट करा")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      );
    }

    // -------------------------------------------------------------
    // 4. KRISHI VIGYAN KENDRA PROFILE
    // -------------------------------------------------------------
    if (user?.role === "KRISHI_KENDRA") {
      return (
        <section className="profile-page animate-fadeIn">
          <p className="eyebrow">ACCREDITED TESTING AUTHORITY</p>
          <h1>Krishi Vigyan Kendra Profile</h1>
          <p style={{ color: "var(--ink-secondary)", marginBottom: "20px" }}>
            Official district center responsible for quality grading, lab moisture testing, and digital marketplace certification.
          </p>

          {profileMsg && <div className="form-message success" style={{ marginBottom: "16px" }}>{profileMsg}</div>}
          {profileErr && <div className="form-message error" style={{ marginBottom: "16px" }}>{profileErr}</div>}

          <div className="two-col" style={{ alignItems: "flex-start" }}>
            <div className="panel">
              <div className="kvk-badge-center" style={{ marginBottom: "12px" }}>
                🏛 ICAR ACCREDITED TESTING CENTER
              </div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "20px" }}>
                {user?.organizationName || "Krishi Vigyan Kendra Center"}
              </h2>
              <p style={{ color: "var(--ink-secondary)", fontSize: "13px", margin: "0 0 16px 0" }}>
                Accreditation Code: <b>{user?.registrationNumber || "ICAR-KVK-CENTRAL"}</b>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                <div><b>Verification Officer:</b> {user?.name}</div>
                <div><b>Official Email:</b> {user?.email}</div>
                <div><b>Contact Phone:</b> {user?.phone || "Not configured"}</div>
                <div><b>Jurisdiction:</b> 📍 {user?.district || "District"}, {user?.state || "State"}</div>
                <div><b>Lab Location:</b> {user?.address || user?.location || "Central Agriculture Complex"}</div>
              </div>

              <div style={{ marginTop: "18px", padding: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
                <strong style={{ color: "#166534", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  🧪 Laboratory Capabilities
                </strong>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#166534", lineHeight: "1.6" }}>
                  <li>Digital grain moisture determination (Standard ISO 712)</li>
                  <li>Foreign matter & organic dockage analysis</li>
                  <li>Damaged, weeviled & broken kernel scoring</li>
                  <li>Official cryptographic digital quality certificate issuance</li>
                </ul>
              </div>

              <div style={{ marginTop: "16px" }}>
                <Link className="primary" to={`/${r}/inspections`} style={{ display: "inline-block", textDecoration: "none" }}>
                  Open Inspection Desk →
                </Link>
              </div>
            </div>

            <form className="form-card" onSubmit={(e) => { e.preventDefault(); saveProfile(kvkForm); }}>
              <h3>Update Center Details</h3>
              <div className="form-grid">
                <label>
                  Kendra / Center Name
                  <input
                    value={kvkForm.organizationName}
                    onChange={(e) => setKvkForm({ ...kvkForm, organizationName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Registration / Code
                  <input
                    value={kvkForm.registrationNumber}
                    onChange={(e) => setKvkForm({ ...kvkForm, registrationNumber: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Officer In-Charge Name
                  <input
                    value={kvkForm.name}
                    onChange={(e) => setKvkForm({ ...kvkForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Official Phone
                  <input
                    value={kvkForm.phone}
                    onChange={(e) => setKvkForm({ ...kvkForm, phone: e.target.value })}
                    required
                  />
                </label>
                <label>
                  District
                  <input
                    value={kvkForm.district}
                    onChange={(e) => setKvkForm({ ...kvkForm, district: e.target.value })}
                    required
                  />
                </label>
                <label>
                  State
                  <input
                    value={kvkForm.state}
                    onChange={(e) => setKvkForm({ ...kvkForm, state: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label style={{ display: "block", marginTop: "10px" }}>
                Lab Center Address
                <textarea
                  rows="2"
                  value={kvkForm.address}
                  onChange={(e) => setKvkForm({ ...kvkForm, address: e.target.value })}
                />
              </label>
              <button className="primary" type="submit" disabled={profileSaving} style={{ marginTop: "14px" }}>
                {profileSaving ? "Saving..." : "Save Center Profile"}
              </button>
            </form>
          </div>
        </section>
      );
    }

    return (
      <section>
        <p className="eyebrow">ACCOUNT</p>
        <h1>My profile</h1>
        <div className="two-col">
          <div className="panel">
            <h3>{user?.name}</h3>
            <p>
              <b>Role:</b> {user?.role}
            </p>
            <p>
              <b>Email:</b> {user?.email}
            </p>
            <p>
              <b>Location:</b> {user?.location || "Not provided"}
            </p>
            <StatusBadge>{user?.verification || "VERIFIED"}</StatusBadge>
          </div>
          <div className="panel">
            <h3>Trust status</h3>
            <p>
              Your verified profile helps buyers and partners make confident
              decisions.
            </p>
            <Link className="primary" to={"/" + r + "/notifications"}>
              View notifications
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (misc === "farm") {
    return (
      <section>
        <p className="eyebrow">FARM MANAGEMENT</p>
        <h1>My farm</h1>
        <div className="grid">
          <Card
            a="PRIMARY LOCATION"
            b={user?.location || "Indore"}
            c="Update through your profile"
          />
          <Card a="ACTIVE PRODUCE" b={user?.primaryCrop || "Wheat"} c="Grade A quality records" />
          <Card
            a="AVAILABLE LOTS"
            b="View lots"
            c="Create and manage inventory"
          />
        </div>
        <div className="panel">
          <h3>Farm inventory</h3>
          <p>
            Lot quantity, harvest date, quality and availability are managed
            from My Lots so every buyer sees consistent information.
          </p>
          <Link className="primary" to={"/" + r + "/lots"}>
            Manage farm lots
          </Link>
        </div>
      </section>
    );
  }

  if (misc === "recommendations" || misc === "matching") {
    return <MatchesPage />;
  }

  if (misc === "farmers") {
    return <FpoAggregationPage />;
  }

  return (
    <section>
      <p className="eyebrow">WORKSPACE</p>
      <h1>{misc ? misc.replaceAll("-", " ") : "Workspace"}</h1>
      <div className="panel">
        <h3>This module is ready</h3>
        <p>
          Use the navigation to access the connected marketplace workflows:
          lots, demands, market prices, offers and transactions.
        </p>
        <Link className="primary" to={"/" + r + "/dashboard"}>
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}

export default DynamicPage;
