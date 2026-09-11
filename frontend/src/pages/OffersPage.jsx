import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { CheckCircle2, ArrowRight, CreditCard, Clock } from "lucide-react";

export function OffersPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const r = user?.role?.toLowerCase().replaceAll("_", "-") || "farmer";
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

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
      <p className="eyebrow">TRADE AGREEMENTS</p>
      <h1>{t("offers", "Offers & Bids")}</h1>
      <p>
        Review agreed prices, quantities, buyer credentials and contract validity.
      </p>

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
            <article className="lot animate-fadeIn" key={o._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "17px" }}>
                  {o.lot?.commodity} · ₹{o.pricePerUnit}/kg
                </h3>
                <StatusBadge>{o.status}</StatusBadge>
              </div>

              <p>
                <b>{o.quantity?.toLocaleString("en-IN")} kg</b> · Total{" "}
                <strong style={{ color: "var(--brand-deep)", fontSize: "16px" }}>
                  ₹{o.totalAmount?.toLocaleString("en-IN")}
                </strong>
              </p>

              <div style={{ fontSize: "13px", color: "#475569", margin: "6px 0" }}>
                <div>Buyer: <strong>{o.buyer?.name || "Verified Buyer"}</strong></div>
                {o.message && <div style={{ fontStyle: "italic", marginTop: "4px" }}>"{o.message}"</div>}
              </div>

              <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {user.role !== "BUYER" && o.status === "PENDING" && (
                  <button
                    className="primary"
                    disabled={actionLoading === o._id}
                    onClick={() => accept(o._id)}
                  >
                    {actionLoading === o._id ? "Processing…" : "Accept & Create Contract"}
                  </button>
                )}

                {o.status === "ACCEPTED" && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={14} /> Contract Active
                    </span>

                    {user?.role === "BUYER" && (
                      <Link
                        to={`/${r}/payments`}
                        className="primary"
                        style={{ padding: "6px 12px", fontSize: "12px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <CreditCard size={13} />
                        <span>Pay via Escrow</span>
                      </Link>
                    )}

                    <Link
                      to={`/${r}/transactions`}
                      className="secondary"
                      style={{ padding: "6px 10px", fontSize: "12px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <span>Track Order</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OffersPage;

