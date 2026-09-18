import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { BuyerVerificationBadge } from "../components/common/BuyerVerificationBadge.jsx";
import { FarmerVerificationBadge } from "../components/common/FarmerVerificationBadge.jsx";
import { NetRealisationCalculator } from "../components/common/NetRealisationCalculator.jsx";
import {
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Calculator,
  Wallet,
  Building2,
} from "lucide-react";

export function OffersPage() {
  const { user } = useAuth();
  const { t, getLabel } = useLanguage();
  const r = user?.role?.toLowerCase().replaceAll("_", "-") || "farmer";
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);

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
          {rows.map((o) => {
            const risk = o.riskAssessment || {};
            const net = o.netRealisation || {};
            const buyer = o.buyer || {};
            const isHighRisk = risk.riskLevel === "HIGH";
            const isMediumRisk = risk.riskLevel === "MEDIUM";

            return (
              <article
                className={`lot animate-fadeIn ${
                  isHighRisk ? "offer-high-risk" : isMediumRisk ? "offer-medium-risk" : ""
                }`}
                key={o._id}
              >
                {/* Header with Price & Verification */}
                <div className="offer-header-flex">
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>
                      {o.lot?.commodity || "Crop Lot"} · ₹{o.pricePerUnit}/kg
                    </h3>
                    <small className="offer-qtl-rate">
                      ₹{(o.pricePerUnit * 100).toLocaleString("en-IN")}/quintal
                    </small>
                  </div>

                  <div className="offer-badges-wrap">
                    <BuyerVerificationBadge
                      compact
                      verification={buyer.verification}
                      buyer={buyer}
                    />
                    {o.lot?.owner && (
                      <FarmerVerificationBadge
                        compact
                        farmer={o.lot.owner}
                        verification={o.lot.owner.verification}
                      />
                    )}
                    <StatusBadge>{o.status}</StatusBadge>
                  </div>
                </div>

                {/* Fake Offer Detection Warning Banner */}
                {isHighRisk && (
                  <div className="fake-offer-alert-box animate-fadeIn">
                    <div className="alert-head">
                      <AlertTriangle size={18} color="#dc2626" />
                      <strong>🚨 SUSPICIOUS OFFER ALERT / उच्च जोखिम चेतावनी</strong>
                    </div>
                    <p className="alert-desc">
                      {risk.warnings?.[0] ||
                        t(
                          "unrealisticPriceWarning",
                          "Abnormal price detected! Unverified buyers offering >35% above market rate may be fraudulent."
                        )}
                    </p>
                    <small className="escrow-notice">
                      🛡️ <strong>Safety Rule:</strong> Never dispatch or transport produce without 100% Escrow deposit confirmation.
                    </small>
                  </div>
                )}

                {/* Net Realisation Chip */}
                {net.netPerKg && (
                  <div className="offer-net-realisation-banner">
                    <Wallet size={15} color="#15803d" />
                    <div>
                      <span>
                        {t("netRealisation", "Net Realisation")}: <strong>₹{net.netPerKg}/kg</strong>{" "}
                        <small>(Take-home: ₹{net.netEarnings?.toLocaleString("en-IN")})</small>
                      </span>
                      <small className="net-sub-text">
                        After ₹{net.estimatedTransport} transport & ₹{net.mandiFee} mandi fees
                      </small>
                    </div>
                  </div>
                )}

                {/* Offer Details */}
                <div className="offer-details-row">
                  <div>
                    <span>Quantity:</span> <b>{o.quantity?.toLocaleString("en-IN")} kg</b>
                  </div>
                  <div>
                    <span>Total Deal Value:</span>{" "}
                    <strong style={{ color: "var(--brand-deep)" }}>
                      ₹{o.totalAmount?.toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div>
                    <span>Buyer:</span>{" "}
                    <b>{buyer.organizationName || buyer.name || "Enterprise Buyer"}</b>
                  </div>
                  {o.lot?.owner && (
                    <div>
                      <span>Farmer Seller:</span>{" "}
                      <b>{o.lot.owner.name || "Farmer Partner"}</b>
                    </div>
                  )}
                </div>

                {o.message && (
                  <p className="offer-message-quote">
                    "{o.message}"
                  </p>
                )}

                {/* Action Buttons */}
                <div className="offer-actions-row">
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
                    <div className="contract-active-actions">
                      <span className="contract-confirmed-pill">
                        <CheckCircle2 size={14} /> Contract Active (Escrow Locked)
                      </span>

                      {user?.role === "BUYER" && (
                        <Link
                          to={`/${r}/payments`}
                          className="primary pay-escrow-btn"
                        >
                          <CreditCard size={13} />
                          <span>Pay via Escrow</span>
                        </Link>
                      )}

                      <Link
                        to={`/${r}/transactions`}
                        className="secondary"
                      >
                        <span>Track Order</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default OffersPage;
