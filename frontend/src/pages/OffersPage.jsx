import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";

export function OffersPage() {
  const { user } = useAuth();
  const { t, getLabel } = useLanguage();
  const r = user?.role?.toLowerCase().replaceAll("_", "-") || "farmer";
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api
      .get("/offers")
      .then((x) => setRows(x.data.data))
      .catch((e) => {
        setRows([]);
        setError(e.response?.data?.message || "Could not load offers");
      });
  };

  useEffect(() => {
    load();
  }, []);

  const accept = async (id) => {
    setActionLoading(id);
    try {
      await api.patch("/offers/" + id + "/accept");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Offer could not be accepted");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <section className="offers-page animate-fadeIn">
      <div className="section-header-row">
        <div>
          <p className="eyebrow">TRADE AGREEMENTS & CONTRACTS</p>
          <h1>{t("offers", "Offers & Bids")}</h1>
          <p className="subtext">
            Review agreed prices, quantities, buyer verification status, net farmer realisation, and fraud safety checks.
          </p>
        </div>

        <button
          type="button"
          className="secondary"
          onClick={() => setShowCalculator(!showCalculator)}
        >
          <Calculator size={15} />
          <span>{showCalculator ? "Hide Calculator" : t("netRealisation", "Net Realisation Calculator")}</span>
        </button>
      </div>

      {showCalculator && (
        <div style={{ marginBottom: "24px" }}>
          <NetRealisationCalculator initialPrice={26} initialQuantity={2000} />
        </div>
      )}

      {rows === null ? (
        <div className="panel loading-state">
          <div className="spinner" />
          <p>{t("loading", "Loading offers…")}</p>
        </div>
      ) : error ? (
        <div className="panel error">
          <p>{error}</p>
          <button onClick={load}>{t("retry", "Try Again")}</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="panel empty-state">
          <Clock size={40} color="#94a3b8" />
          <h3>No offers yet</h3>
          <p>
            {user?.role === "BUYER"
              ? "Browse available lots to make purchase offers."
              : "Buyer purchase offers will appear here when submitted against your lots."}
          </p>
          <Link className="primary" to={`/${r}/lots`} style={{ marginTop: "12px" }}>
            {t("browseLots", "Browse lots")}
          </Link>
        </div>
      ) : (
        <div className="lots">
          {rows.map((o) => (
            <article className="lot" key={o._id}>
              <StatusBadge>{o.status}</StatusBadge>
              <h3>
                {o.lot?.commodity} · ₹{o.pricePerUnit}/kg
              </h3>
              <p>
                <b>{o.quantity} kg</b> · Total ₹
                {o.totalAmount?.toLocaleString("en-IN")}
              </p>
              <p>Buyer: {o.buyer?.name} · Reliability: 92/100</p>
              <p>{o.message}</p>
              {user.role !== "BUYER" && o.status === "PENDING" && (
                <button className="primary" onClick={() => accept(o._id)}>
                  Accept & create transaction
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      <TrustProfileModal
        isOpen={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
        userId={selectedUserId}
      />
    </section>
  );
}

export default OffersPage;
