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

  const save = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await api.post("/lots", {
        ...f,
        quantity: +f.quantity,
        expectedPrice: +f.expectedPrice,
        quality: { grade: "Grade A", moisture: 11 },
      });
      setShow(false);
      setNotice("Lot published successfully. Buyers can now discover it.");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not publish this lot.");
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            {user.role === "BUYER" ? "MARKETPLACE" : "INVENTORY"}
          </p>
          <h1>{user.role === "BUYER" ? "Browse available lots" : "My lots"}</h1>
          <p>
            {user.role === "BUYER"
              ? "Compare available produce, quality and prices before making an offer."
              : "Publish available produce so verified buyers can find and contact you."}
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
            {show ? "Close form" : "+ Create lot"}
          </button>
        )}
      </div>

      {show && (
        <form className="form-card" onSubmit={save}>
          <div className="form-card-heading">
            <div>
              <h3>Publish a new lot</h3>
              <p>
                Enter the produce details buyers need to make an informed offer.
              </p>
            </div>
            <StatusBadge>DRAFT</StatusBadge>
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
              Location
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
              Publish lot
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
              <StatusBadge>{l.status}</StatusBadge>
              <h3>
                {l.commodity} · {l.quality?.grade || "Quality pending"}
              </h3>
              <p>
                <b>{l.remainingQuantity} KG</b> · ₹{l.expectedPrice}/kg
              </p>
              <p>📍 {l.location || "Location not provided"}</p>
              {l.quality?.inspectionStatus === "VERIFIED" && (
                <p className="verified-quality">
                  <b>✓ Krishi Kendra verified</b> · {l.quality.grade} · moisture{" "}
                  {l.quality.moisture}% · defects{" "}
                  {l.quality.damagedPercentage || 0}%
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
                : "No lots published yet"}
            </h3>
            <p>
              {user.role === "BUYER"
                ? "Check back shortly as farmers add produce to the marketplace."
                : "Create your first lot to begin receiving buyer offers."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default LotsPage;
