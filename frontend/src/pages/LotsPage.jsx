import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";

export function OfferModal({ lot }) {
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
      setMsg("Offer sent");
    } catch (e) {
      setError(e.response?.data?.message || "Could not send offer.");
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
        {sending ? "Sending…" : msg ? "Offer sent" : "Make offer"}
      </button>
      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}
    </>
  );
}

export function LotsPage() {
  const { user } = useAuth();
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
        setError(e.response?.data?.message || "Could not load lots")
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
        "Lot registered and submitted to Krishi Vigyan Kendra for quality testing! Once certified, you can list it on the marketplace.",
      );
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not register this lot.");
    }
  };

  const publishToMarket = async (lotId) => {
    setPublishingId(lotId);
    setError("");
    try {
      await api.post(`/lots/${lotId}/publish`);
      setNotice(
        "Produce lot has been published to the active marketplace! Buyers can now discover it and make offers.",
      );
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not publish lot.");
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
      setNotice("Sample resubmitted to Krishi Vigyan Kendra for quality testing.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not resubmit lot.");
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            {user.role === "BUYER" ? "MARKETPLACE" : "INVENTORY & KVK TESTING"}
          </p>
          <h1>{user.role === "BUYER" ? "Browse available lots" : "My Produce Lots"}</h1>
          <p>
            {user.role === "BUYER"
              ? "Compare available produce, quality certificates and prices before making an offer."
              : "Register farm harvest, send samples to Krishi Vigyan Kendra for certification, and publish verified produce for verified buyers."}
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
            {show ? "Close form" : "+ Register new lot"}
          </button>
        )}
      </div>

      {show && (
        <form className="form-card" onSubmit={save}>
          <div className="form-card-heading">
            <div>
              <h3>Register produce for quality verification</h3>
              <p>
                Enter harvest details. All lots are submitted to your local Krishi Vigyan Kendra for laboratory testing and certification before going live on the marketplace.
              </p>
            </div>
            <StatusBadge>PENDING TESTING</StatusBadge>
          </div>
          <div className="form-grid">
            <label>
              Commodity
              <input
                value={f.commodity}
                onChange={(e) => set("commodity", e.target.value)}
                required
              />
            </label>
            <label>
              Available quantity (kg)
              <input
                type="number"
                min="1"
                value={f.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                required
              />
            </label>
            <label>
              Expected price (₹ / kg)
              <input
                type="number"
                min="1"
                value={f.expectedPrice}
                onChange={(e) => set("expectedPrice", e.target.value)}
                required
              />
            </label>
            <label>
              Location / Farm address
              <input
                value={f.location}
                onChange={(e) => set("location", e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setShow(false)}>
              Cancel
            </button>
            <button className="primary" type="submit">
              Submit to Krishi Vigyan Kendra for Testing →
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
                <b>Expected: ₹{l.expectedPrice}/kg</b> (₹{(l.expectedPrice * 100).toLocaleString("en-IN")}/qtl)
              </p>
              <p>📍 {l.location || "Location not provided"}</p>

              {/* Status and Verification Box for Sellers */}
              {user.role !== "BUYER" && (
                <>
                  {l.status === "PENDING_VERIFICATION" && (
                    <div className="lot-verification-box pending">
                      <span>⏳ <b>Under Krishi Vigyan Kendra Testing</b></span>
                      <p>Sample submitted for lab moisture & purity inspection. Marketplace listing is locked until certified.</p>
                    </div>
                  )}

                  {l.status === "VERIFIED" && (
                    <div className="lot-verification-box verified">
                      <span>✓ <b>Krishi Vigyan Kendra Certified</b></span>
                      <p>
                        <b>Grade:</b> {l.quality?.grade || "Grade A"} · <b>Moisture:</b> {l.quality?.moisture ?? "—"}% · <b>Defects:</b> {l.quality?.damagedPercentage ?? 0}%
                      </p>
                      {l.quality?.certification && <small>{l.quality.certification}</small>}
                      <button
                        className="primary"
                        style={{ marginTop: "10px", width: "100%", padding: "10px 14px", fontSize: "14px" }}
                        onClick={() => publishToMarket(l._id)}
                        disabled={publishingId === l._id}
                      >
                        {publishingId === l._id ? "Publishing to Marketplace..." : "🚀 List on Marketplace for Selling"}
                      </button>
                    </div>
                  )}

                  {l.status === "REJECTED" && (
                    <div className="lot-verification-box rejected">
                      <span>✕ <b>Sample Rejected by Krishi Kendra</b></span>
                      <p>
                        {l.quality?.inspectionNotes || l.quality?.defects || "Did not meet required purity or moisture standards."}
                      </p>
                      <button
                        type="button"
                        style={{ marginTop: "8px", padding: "6px 12px", fontSize: "12px", background: "#ffffff", border: "1px solid #f87171", borderRadius: "6px", color: "#991b1b", cursor: "pointer", fontWeight: 600 }}
                        onClick={() => resubmitForVerification(l._id)}
                      >
                        ↺ Resubmit New Harvest Sample for Re-Testing
                      </button>
                    </div>
                  )}

                  {(l.status === "AVAILABLE" || l.status === "PARTIALLY_SOLD") && (
                    <div className="lot-verification-box live">
                      <span>🟢 <b>Live on Marketplace</b></span>
                      <p>Verified produce actively visible to institutional buyers and aggregators.</p>
                      {l.quality?.certification && <small>✓ {l.quality.certification}</small>}
                    </div>
                  )}
                </>
              )}

              {/* Quality Preview Details */}
              {l.quality?.inspectionStatus === "VERIFIED" && user.role === "BUYER" && (
                <p className="verified-quality">
                  <b>✓ Krishi Kendra verified</b> · {l.quality.grade} · moisture{" "}
                  {l.quality.moisture}% · foreign matter{" "}
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
                ? "No lots are available yet"
                : "No lots registered yet"}
            </h3>
            <p>
              {user.role === "BUYER"
                ? "Check back shortly as farmers receive quality certification and list produce on the marketplace."
                : "Register your first lot and send a sample to Krishi Vigyan Kendra for quality certification."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default LotsPage;
