import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";

export function OfferModal({ lot }) {
  const { getLabel } = useLanguage();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    setError("");
    try {
      await api.post("/offers", {
        lotId: lot._id,
        quantity: Math.min(1000, lot.remainingQuantity),
        pricePerUnit: lot.expectedPrice,
        message: "We can arrange pickup within 2 days.",
      });
      setMsg(getLabel("Offer sent successfully!", "ऑफर सफलतापूर्वक भेजा गया!", "खरेदी ऑफर यशस्वीपणे पाठवला!"));
    } catch (e) {
      setError(e.response?.data?.message || getLabel("Could not send offer.", "ऑफर नहीं भेजा जा सका।", "ऑफर पाठवता आला नाही."));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        className="primary"
        onClick={send}
        disabled={sending || !!msg}
      >
        {sending
          ? getLabel("Sending…", "भेजा जा रहा है…", "पाठवत आहे…")
          : msg
          ? getLabel("✓ Offer Sent", "✓ ऑफर भेजा गया", "✓ ऑफर पाठवला")
          : getLabel("Make Offer", "ऑफर भेजें", "खरेदी ऑफर द्या")}
      </button>
      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}
    </>
  );
}

export function LotsPage() {
  const { user } = useAuth();
  const { getLabel } = useLanguage();
  const [rows, setRows] = useState([]);
  const [show, setShow] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [f, setF] = useState({
    commodity: "Wheat",
    quantity: 1000,
    expectedPrice: 2450,
    location: "Indore",
  });

  const set = (key, value) => setF((x) => ({ ...x, [key]: value }));

  const load = () =>
    api
      .get("/lots" + (user.role === "BUYER" ? "" : "?mine=true"))
      .then((x) => setRows(x.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || getLabel("Could not load lots", "लॉट्स लोड नहीं हो सके", "शेतमाल लोड करता आला नाही"))
      );

  useEffect(() => {
    load();
  }, [user.role]);

  const [publishingId, setPublishingId] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await api.post("/lots", {
        ...f,
        quantity: +f.quantity,
        expectedPrice: +f.expectedPrice,
      });
      setShow(false);
      setNotice(
        getLabel(
          "Lot registered and submitted to Krishi Vigyan Kendra for quality testing! Once certified, you can list it on the marketplace.",
          "लॉट दर्ज किया गया और गुणवत्ता परीक्षण के लिए कृषि विज्ञान केंद्र भेजा गया! प्रमाणित होने के बाद, आप इसे बाजार में बिक्री हेतु लाइव कर सकते हैं।",
          "शेतमाल नोंदणी झाली असून गुणवत्ता तपासणीसाठी कृषी विज्ञान केंद्राकडे पाठवला आहे! प्रमाणपत्र मिळाल्यावर आपण बाजारात विक्रीसाठी उपलब्ध करू शकता."
        )
      );
      load();
    } catch (e) {
      setError(e.response?.data?.message || getLabel("Could not register this lot.", "यह लॉट दर्ज नहीं हो सका।", "हा शेतमाल नोंदवता आला नाही."));
    }
  };

  const publishToMarket = async (lotId) => {
    setPublishingId(lotId);
    setError("");
    try {
      await api.post(`/lots/${lotId}/publish`);
      setNotice(
        getLabel(
          "Produce lot has been published to the active marketplace! Buyers can now discover it and make offers.",
          "फसल लॉट सक्रिय बाजार में लाइव कर दिया गया है! खरीदार अब इसे देख सकते हैं और ऑफर दे सकते हैं।",
          "शेतमाल बाजारात विक्रीसाठी उपलब्ध झाला आहे! खरेदीदार आता पाहू शकतात व खरेदी ऑफर देऊ शकतात."
        )
      );
      load();
    } catch (err) {
      setError(err.response?.data?.message || getLabel("Could not publish lot.", "लॉट लाइव नहीं हो सका।", "शेतमाल बाजारात उपलब्ध करता आला नाही."));
    } finally {
      setPublishingId(null);
    }
  };

  const resubmitForVerification = async (lotId) => {
    setError("");
    try {
      await api.post(`/lots/${lotId}/verify-request`, {
        notes: "Resubmitted new harvest sample for re-testing",
      });
      setNotice(getLabel("Sample resubmitted to Krishi Vigyan Kendra for quality testing.", "पुनः परीक्षण हेतु नमूना कृषि विज्ञान केंद्र भेजा गया।", "पुन्हा तपासणीसाठी नमुना कृषी विज्ञान केंद्राकडे पाठवला आहे."));
      load();
    } catch (err) {
      setError(err.response?.data?.message || getLabel("Could not resubmit lot.", "पुनः नहीं भेजा जा सका।", "पुन्हा पाठवता आले नाही."));
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            {user.role === "BUYER"
              ? getLabel("MARKETPLACE", "बाजार", "शेतमाल बाजार")
              : getLabel("INVENTORY & KVK TESTING", "इन्वेंटरी व कृषि केंद्र जांच", "शेतमाल साठा व कृषी केंद्र तपासणी")}
          </p>
          <h1>
            {user.role === "BUYER"
              ? getLabel("Browse Available Lots", "उपलब्ध लॉट्स देखें", "उपलब्ध शेतमाल लॉट्स शोधा")
              : getLabel("My Produce Lots", "मेरे फसल लॉट्स", "माझे शेतमाल लॉट्स")}
          </h1>
          <p>
            {user.role === "BUYER"
              ? getLabel(
                  "Compare available produce, quality certificates and prices before making an offer.",
                  "ऑफर देने से पहले उपलब्ध उपज, गुणवत्ता प्रमाण पत्र और कीमतों की तुलना करें।",
                  "खरेदी ऑफर देण्यापूर्वी उपलब्ध शेतमाल, गुणवत्ता प्रमाणपत्रे व दरांची पडताळणी करा."
                )
              : getLabel(
                  "Register farm harvest, send samples to Krishi Vigyan Kendra for certification, and publish verified produce for verified buyers.",
                  "खेत की उपज दर्ज करें, प्रमाणन के लिए कृषि विज्ञान केंद्र को नमूने भेजें, और सत्यापित खरीदारों के लिए उपज लाइव करें।",
                  "शेतमाल नोंदवा, प्रमाणपत्रासाठी कृषी विज्ञान केंद्राकडे नमुने पाठवा आणि प्रमाणित शेतमाल थेट बाजारात विका."
                )}
          </p>
        </div>
        {user.role !== "BUYER" && (
          <button
            className="primary"
            onClick={() => {
              setShow(!show);
              setNotice("");
            }}
          >
            {show
              ? getLabel("Close Form", "फॉर्म बंद करें", "फॉर्म बंद करा")
              : getLabel("+ Register New Lot", "+ नया लॉट दर्ज करें", "+ नवीन शेतमाल नोंदवा")}
          </button>
        )}
      </div>

      {show && (
        <form className="form-card" onSubmit={save}>
          <div className="form-card-heading">
            <div>
              <h3>{getLabel("Register Produce for Quality Verification", "गुणवत्ता जांच हेतु उपज दर्ज करें", "गुणवत्ता तपासणीसाठी शेतमाल नोंदणी")}</h3>
              <p>
                {getLabel(
                  "Enter harvest details. All lots are submitted to your local Krishi Vigyan Kendra for laboratory testing and certification before going live on the marketplace.",
                  "फसल का विवरण दर्ज करें। बाजार में लाइव होने से पहले सभी लॉट प्रयोगशाला परीक्षण और प्रमाणन के लिए आपके स्थानीय कृषि विज्ञान केंद्र को भेजे जाते हैं।",
                  "कापणीचा तपशील नोंदवा. बाजारात उपलब्ध होण्यापूर्वी सर्व शेतमाल प्रयोगशाळा तपासणी व प्रमाणपत्रासाठी आपल्या स्थानिक कृषी विज्ञान केंद्राकडे पाठवला जातो."
                )}
              </p>
            </div>
            <StatusBadge>{getLabel("PENDING TESTING", "जांच लंबित", "तपासणी प्रलंबित")}</StatusBadge>
          </div>
          <div className="form-grid">
            <label>
              {getLabel("Commodity", "फसल / जींस", "शेतमाल / पीक")}
              <input
                value={f.commodity}
                onChange={(e) => set("commodity", e.target.value)}
                required
              />
            </label>
            <label>
              {getLabel("Available quantity (kg)", "उपलब्ध मात्रा (किलोग्राम)", "उपलब्ध प्रमाण (किलो)")}
              <input
                type="number"
                min="1"
                value={f.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                required
              />
            </label>
            <label>
              {getLabel("Expected price (₹ / kg)", "अपेक्षित मूल्य (₹ / किग्रा)", "अपेक्षित दर (₹ / किलो)")}
              <input
                type="number"
                min="1"
                value={f.expectedPrice}
                onChange={(e) => set("expectedPrice", e.target.value)}
                required
              />
            </label>
            <label>
              {getLabel("Location / Farm address", "स्थान / खेत का पता", "ठिकाण / शेताचा पत्ता")}
              <input
                value={f.location}
                onChange={(e) => set("location", e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setShow(false)}>
              {getLabel("Cancel", "रद्द करें", "रद्द करा")}
            </button>
            <button className="primary" type="submit">
              {getLabel("Submit to Krishi Vigyan Kendra for Testing →", "जांच हेतु कृषि विज्ञान केंद्र भेजें →", "तपासणीसाठी कृषी विज्ञान केंद्राकडे पाठवा →")}
            </button>
          </div>
        </form>
      )}

      {notice && <p className="form-message success">✓ {notice}</p>}
      {error && <p className="form-message error">{error}</p>}

      <div className="lots">
        {rows.length ? (
          rows.map((l) => (
            <article className="lot" key={l._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StatusBadge>{l.status}</StatusBadge>
                {l.quality?.grade && (
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>
                    {l.quality.grade}
                  </span>
                )}
              </div>
              <h3 style={{ marginTop: "8px" }}>
                {l.commodity} · {(l.remainingQuantity || l.quantity).toLocaleString("en-IN")} KG
              </h3>
              <p>
                <b>{getLabel("Expected", "अपेक्षित", "अपेक्षित")}: ₹{l.expectedPrice}/kg</b> (₹{(l.expectedPrice * 100).toLocaleString("en-IN")}/qtl)
              </p>
              <p>📍 {l.location || getLabel("Location not provided", "स्थान उपलब्ध नहीं", "ठिकाण नमूद नाही")}</p>

              {/* Status and Verification Box for Sellers */}
              {user.role !== "BUYER" && (
                <>
                  {l.status === "PENDING_VERIFICATION" && (
                    <div className="lot-verification-box pending">
                      <span>⏳ <b>{getLabel("Under Krishi Vigyan Kendra Testing", "कृषि विज्ञान केंद्र जांच जारी", "कृषी विज्ञान केंद्र तपासणी सुरू आहे")}</b></span>
                      <p>{getLabel("Sample submitted for lab moisture & purity inspection. Marketplace listing is locked until certified.", "नमूना प्रयोगशाला नमी व शुद्धता जांच हेतु भेजा गया है। प्रमाणन तक बाजार में बिक्री लॉक रहेगी।", "नमुना प्रयोगशाळा आर्द्रता व शुद्धता तपासणीसाठी पाठवला आहे. प्रमाणपत्र मिळेपर्यंत शेतमाल बाजारात लॉक राहील.")}</p>
                    </div>
                  )}

                  {l.status === "VERIFIED" && (
                    <div className="lot-verification-box verified">
                      <span>✓ <b>{getLabel("Krishi Vigyan Kendra Certified", "कृषि विज्ञान केंद्र प्रमाणित", "कृषी विज्ञान केंद्र प्रमाणित")}</b></span>
                      <p>
                        <b>{getLabel("Grade", "ग्रेड", "दर्जा")}:</b> {l.quality?.grade || "Grade A"} · <b>{getLabel("Moisture", "नमी", "आर्द्रता")}:</b> {l.quality?.moisture ?? "—"}% · <b>{getLabel("Defects", "दोष", "दोष")}:</b> {l.quality?.damagedPercentage ?? 0}%
                      </p>
                      {l.quality?.certification && <small>{l.quality.certification}</small>}
                      <button
                        className="primary"
                        style={{ marginTop: "10px", width: "100%", padding: "10px 14px", fontSize: "14px" }}
                        onClick={() => publishToMarket(l._id)}
                        disabled={publishingId === l._id}
                      >
                        {publishingId === l._id
                          ? getLabel("Publishing to Marketplace...", "बाजार में लाइव किया जा रहा है...", "बाजारात उपलब्ध करत आहे...")
                          : getLabel("🚀 List on Marketplace for Selling", "🚀 बाजार में बिक्री हेतु लाइव करें", "🚀 विक्रीसाठी बाजारात उपलब्ध करा")}
                      </button>
                    </div>
                  )}

                  {l.status === "REJECTED" && (
                    <div className="lot-verification-box rejected">
                      <span>✕ <b>{getLabel("Sample Rejected by Krishi Kendra", "कृषि केंद्र द्वारा नमूना अस्वीकृत", "कृषी केंद्राने नमुना अपात्र ठरवला")}</b></span>
                      <p>
                        {l.quality?.inspectionNotes || l.quality?.defects || getLabel("Did not meet required purity or moisture standards.", "आवश्यक शुद्धता या नमी मानकों को पूरा नहीं किया।", "आवश्यक शुद्धता किंवा आर्द्रतेचे निकष पूर्ण झाले नाहीत.")}
                      </p>
                      <button
                        type="button"
                        style={{ marginTop: "8px", padding: "6px 12px", fontSize: "12px", background: "#ffffff", border: "1px solid #f87171", borderRadius: "6px", color: "#991b1b", cursor: "pointer", fontWeight: 600 }}
                        onClick={() => resubmitForVerification(l._id)}
                      >
                        {getLabel("↺ Resubmit New Harvest Sample for Re-Testing", "↺ पुनः जांच हेतु नया नमूना भेजें", "↺ नवीन नमुना पुन्हा तपासणीसाठी पाठवा")}
                      </button>
                    </div>
                  )}

                  {(l.status === "AVAILABLE" || l.status === "PARTIALLY_SOLD") && (
                    <div className="lot-verification-box live">
                      <span>🟢 <b>{getLabel("Live on Marketplace", "बाजार में लाइव व उपलब्ध", "बाजारात विक्रीसाठी उपलब्ध")}</b></span>
                      <p>{getLabel("Verified produce actively visible to institutional buyers and aggregators.", "प्रमाणित उपज संस्थागत खरीदारों और व्यापारियों को सीधे दिखाई दे रही है।", "प्रमाणित शेतमाल थेट संस्थागत खरेदीदारांना व व्यापाऱ्यांना दिसत आहे.")}</p>
                      {l.quality?.certification && <small>✓ {l.quality.certification}</small>}
                    </div>
                  )}
                </>
              )}

              {/* Quality Preview Details */}
              {l.quality?.inspectionStatus === "VERIFIED" && user.role === "BUYER" && (
                <p className="verified-quality">
                  <b>✓ {getLabel("Krishi Kendra verified", "कृषि केंद्र प्रमाणित", "कृषी केंद्र प्रमाणित")}</b> · {l.quality.grade} · {getLabel("moisture", "नमी", "आर्द्रता")}{" "}
                  {l.quality.moisture}% · {getLabel("foreign matter", "कचरा/अन्य सामग्री", "कचरा/इतर पदार्थ")}{" "}
                  {l.quality.foreignMatter || 0}%
                </p>
              )}
              {l.quality?.grainImage && (
                <img
                  className="grain-preview"
                  src={l.quality.grainImage}
                  alt="Verified grain sample"
                />
              )}
              {user.role === "BUYER" && <OfferModal lot={l} />}
            </article>
          ))
        ) : (
          <div className="panel empty-panel">
            <h3>
              {user.role === "BUYER"
                ? getLabel("No lots are available yet", "अभी कोई लॉट उपलब्ध नहीं है", "सध्या कोणताही शेतमाल उपलब्ध नाही")
                : getLabel("No lots registered yet", "अभी कोई लॉट दर्ज नहीं है", "अद्याप कोणताही शेतमाल नोंदवला नाही")}
            </h3>
            <p>
              {user.role === "BUYER"
                ? getLabel(
                    "Check back shortly as farmers receive quality certification and list produce on the marketplace.",
                    "जल्द ही पुनः देखें जब किसान गुणवत्ता प्रमाणन प्राप्त कर बाजार में उपज लाइव करेंगे।",
                    "शेतकऱ्यांना गुणवत्ता प्रमाणपत्र मिळताच शेतमाल येथे विक्रीसाठी दिसेल."
                  )
                : getLabel(
                    "Register your first lot and send a sample to Krishi Vigyan Kendra for quality certification.",
                    "अपना पहला लॉट दर्ज करें और गुणवत्ता प्रमाणन के लिए कृषि विज्ञान केंद्र को नमूना भेजें।",
                    "आपला पहिला शेतमाल नोंदवा आणि गुणवत्ता प्रमाणपत्रासाठी कृषी विज्ञान केंद्राकडे नमुना पाठवा."
                  )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default LotsPage;
