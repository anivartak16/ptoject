import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Download,
  Lock,
  Receipt,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export function PaymentPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { r: routeRole, transactionId } = useParams();
  const r = routeRole || user?.role?.toLowerCase().replaceAll("_", "-") || "buyer";

  const [paymentList, setPaymentList] = useState([]);
  const [activePayment, setActivePayment] = useState(null);
  const [activeTxn, setActiveTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(null);
  const [error, setError] = useState("");

  const [method, setMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("buyer@upi");
  const [bank, setBank] = useState("State Bank of India");
  const [simulateFail, setSimulateFail] = useState(false);

  // Load single transaction payment or all payments
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (transactionId) {
        const res = await api.get(`/payments/${transactionId}`);
        setActivePayment(res.data.data?.payment || null);
        setActiveTxn(res.data.data?.transaction || null);
        if (res.data.data?.payment?.status === "PAID") {
          setPaySuccess({
            payment: res.data.data?.payment,
            transaction: res.data.data?.transaction,
          });
        }
      } else {
        const res = await api.get("/payments");
        setPaymentList(res.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load payment information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [transactionId]);

  // Execute payment
  const handleProcessPayment = async (e) => {
    e?.preventDefault();
    if (!activeTxn) return;
    setProcessing(true);
    setError("");

    try {
      // Realistic escrow handshake delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const payload = {
        paymentMethod: method,
        remarks:
          method === "UPI"
            ? `UPI Settlement via ${upiId}`
            : method === "NET_BANKING"
              ? `NetBanking via ${bank}`
              : `${method} Escrow Settlement`,
        simulateFailure: simulateFail,
      };

      const res = await api.post(`/payments/${activeTxn._id}/process`, payload);
      setPaySuccess(res.data.data);
      setActivePayment(res.data.data.payment);
      setActiveTxn(res.data.data.transaction);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Payment authorization failed. Please check payment credentials or retry."
      );
    } finally {
      setProcessing(false);
    }
  };

  // Invoice calculations
  const produceAmount = activeTxn?.amount || 0;
  const escrowFee = Math.round(produceAmount * 0.01);
  const grandTotal = produceAmount + escrowFee;

  // Single Transaction Checkout View
  if (transactionId) {
    return (
      <div className="payment-portal-container">
        <div className="payment-top-bar">
          <Link to={`/${r}/transactions`} className="back-link">
            <ArrowLeft size={16} />
            <span>{t("back", "Back to Transactions")}</span>
          </Link>
          <div className="secure-badge">
            <Lock size={14} />
            <span>256-bit Encrypted Agri-Escrow Settlement</span>
          </div>
        </div>

        {loading ? (
          <div className="panel loading-state">
            <div className="spinner" />
            <p>{t("loading", "Loading secure checkout…")}</p>
          </div>
        ) : error && !activeTxn ? (
          <div className="panel error">
            <AlertTriangle size={24} />
            <p>{error}</p>
            <button className="primary" onClick={loadData}>
              {t("retry", "Try Again")}
            </button>
          </div>
        ) : paySuccess ? (
          // Payment Success Receipt
          <div className="payment-receipt-panel animate-fadeIn">
            <div className="receipt-badge-wrap">
              <div className="success-icon-circle">
                <CheckCircle2 size={44} color="#16a34a" />
              </div>
              <h2>{t("paymentSuccess", "Escrow Payment Confirmed!")}</h2>
              <p className="receipt-subtitle">
                Funds have been locked in <strong>KrishiLink Escrow</strong>. The seller has
                been notified to initiate dispatch.
              </p>
            </div>

            <div className="digital-receipt-card" id="printable-receipt">
              <div className="receipt-header">
                <div className="receipt-brand">
                  🌾 <strong>KrishiLink</strong>
                  <span className="escrow-pill">ESCROW SECURED</span>
                </div>
                <div className="receipt-ref">
                  <small>RECEIPT REF ID</small>
                  <b>{paySuccess.payment?.referenceId || "KL-PAY-CONFIRMED"}</b>
                </div>
              </div>

              <div className="receipt-grid">
                <div>
                  <small>Commodity</small>
                  <h4>{activeTxn?.lot?.commodity || "Produce"}</h4>
                </div>
                <div>
                  <small>Quantity</small>
                  <h4>{activeTxn?.quantity?.toLocaleString("en-IN")} kg</h4>
                </div>
                <div>
                  <small>Farmer / Seller</small>
                  <h4>{activeTxn?.seller?.name || "Verified Farmer"}</h4>
                  <small style={{ color: "#64748b" }}>{activeTxn?.seller?.district || ""}</small>
                </div>
                <div>
                  <small>Buyer Account</small>
                  <h4>{activeTxn?.buyer?.name || user?.name}</h4>
                  <small style={{ color: "#64748b" }}>{activeTxn?.buyer?.district || ""}</small>
                </div>
              </div>

              <div className="receipt-line-items">
                <div className="item-row">
                  <span>Crop Base Value</span>
                  <span>₹{produceAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="item-row">
                  <span>Escrow Assurance Fee (1%)</span>
                  <span>₹{escrowFee.toLocaleString("en-IN")}</span>
                </div>
                <div className="item-row total">
                  <span>Total Settled in Escrow</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="receipt-footer">
                <small>
                  Paid via: <strong>{paySuccess.payment?.paymentMethod || method}</strong> ·{" "}
                  {new Date(paySuccess.payment?.paidAt || Date.now()).toLocaleString("en-IN")}
                </small>
                <div className="qr-box">
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Verified by KrishiLink Digital Mandi System
                  </span>
                </div>
              </div>
            </div>

            <div className="receipt-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => window.print()}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Download size={16} />
                <span>{t("downloadReceipt", "Download / Print Receipt")}</span>
              </button>
              <Link
                to={`/${r}/transactions`}
                className="primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <span>{t("viewInTransactions", "Go to Transactions Timeline")}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          // Checkout Form
          <div className="checkout-two-col animate-fadeIn">
            {/* Left Col: Payment Method Selection */}
            <div className="checkout-methods-panel">
              <div className="sandbox-demo-banner">
                <Sparkles size={16} color="#d97706" />
                <div>
                  <strong>SIH Live Sandbox Mode</strong>
                  <p>
                    Test payments instantly with simulated bank settlement. No real card charge
                    will occur.
                  </p>
                </div>
              </div>

              {error && (
                <div className="form-message error" style={{ marginBottom: "16px" }}>
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleProcessPayment}>
                <h3 style={{ margin: "0 0 14px", fontSize: "18px" }}>
                  {t("paymentMethod", "Select Payment Method")}
                </h3>

                <div className="payment-method-tabs">
                  <button
                    type="button"
                    className={`method-tab ${method === "UPI" ? "active" : ""}`}
                    onClick={() => setMethod("UPI")}
                  >
                    <Smartphone size={20} />
                    <div>
                      <b>UPI Instant</b>
                      <small>GPay, PhonePe, Paytm</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`method-tab ${method === "NET_BANKING" ? "active" : ""}`}
                    onClick={() => setMethod("NET_BANKING")}
                  >
                    <Building2 size={20} />
                    <div>
                      <b>Escrow Net Banking</b>
                      <small>SBI, HDFC, ICICI</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`method-tab ${method === "CARD" ? "active" : ""}`}
                    onClick={() => setMethod("CARD")}
                  >
                    <CreditCard size={20} />
                    <div>
                      <b>RuPay / Debit Card</b>
                      <small>Kisan Card / Visa</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`method-tab ${method === "MANDI_DIRECT" ? "active" : ""}`}
                    onClick={() => setMethod("MANDI_DIRECT")}
                  >
                    <Receipt size={20} />
                    <div>
                      <b>Mandi Direct RTGS</b>
                      <small>Direct APMC Settlement</small>
                    </div>
                  </button>
                </div>

                {/* Method Specific Details */}
                <div className="method-details-box">
                  {method === "UPI" && (
                    <div className="upi-details">
                      <label>
                        Enter Virtual Payment Address (UPI ID)
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          required
                        />
                      </label>
                      <div className="upi-quick-apps">
                        <span className="app-badge">GPay</span>
                        <span className="app-badge">PhonePe</span>
                        <span className="app-badge">Paytm</span>
                        <span className="app-badge">BHIM UPI</span>
                      </div>
                    </div>
                  )}

                  {method === "NET_BANKING" && (
                    <div className="bank-details">
                      <label>
                        Choose Issuing Escrow Partner Bank
                        <select value={bank} onChange={(e) => setBank(e.target.value)}>
                          <option>State Bank of India</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Punjab National Bank</option>
                          <option>Bank of Baroda</option>
                          <option>Canara Bank</option>
                        </select>
                      </label>
                      <p className="helper-text">
                        Funds will be held securely in RBI-compliant escrow until goods inspection
                        and delivery.
                      </p>
                    </div>
                  )}

                  {method === "CARD" && (
                    <div className="card-mock-form">
                      <label>
                        Card Number
                        <input
                          type="text"
                          defaultValue="4123 •••• •••• 8821"
                          maxLength="19"
                          required
                        />
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <label>
                          Expiry (MM/YY)
                          <input type="text" defaultValue="08/29" maxLength="5" required />
                        </label>
                        <label>
                          CVV
                          <input type="password" defaultValue="•••" maxLength="3" required />
                        </label>
                      </div>
                    </div>
                  )}

                  {method === "MANDI_DIRECT" && (
                    <div className="mandi-direct-info">
                      <p style={{ margin: "0 0 8px" }}>
                        <strong>APMC Escrow Settlement Account:</strong>
                      </p>
                      <div className="code-block">
                        A/C: 4092184910283 (KrishiLink Escrow Nodal)
                        <br />
                        IFSC: SBIN0001248 (State Bank of India, Sagar)
                      </div>
                    </div>
                  )}

                  {/* Simulator failure checkbox for testing */}
                  <div className="simulator-toggle">
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", color: "#64748b" }}>
                      <input
                        type="checkbox"
                        checked={simulateFail}
                        onChange={(e) => setSimulateFail(e.target.checked)}
                      />
                      <span>Simulate Gateway Failure (Test error recovery state)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="primary pay-submit-btn"
                >
                  {processing ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <RotateCcw className="spinning-icon" size={18} />
                      <span>{t("paymentProcessing", "Securing Escrow Settlement…")}</span>
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <Lock size={16} />
                      <span>
                        {t("payButton", "Lock in Escrow & Confirm")} (₹
                        {grandTotal.toLocaleString("en-IN")})
                      </span>
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* Right Col: Itemized Order Summary */}
            <div className="checkout-summary-panel">
              <h3 style={{ margin: "0 0 16px", fontSize: "18px" }}>
                {t("orderSummary", "Order Summary")}
              </h3>

              <div className="order-produce-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "17px" }}>
                      {activeTxn?.lot?.commodity || "Agricultural Produce"}
                    </h4>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      Variety: {activeTxn?.lot?.variety || "Standard"}
                    </span>
                  </div>
                  <span className="kvk-seal-mini">KVK TESTED</span>
                </div>

                <div className="produce-meta-row">
                  <div>
                    <small>Quantity</small>
                    <b>{activeTxn?.quantity?.toLocaleString("en-IN")} kg</b>
                  </div>
                  <div>
                    <small>Agreed Rate</small>
                    <b>₹{Math.round(produceAmount / (activeTxn?.quantity || 1))}/kg</b>
                  </div>
                  <div>
                    <small>Seller</small>
                    <b>{activeTxn?.seller?.name}</b>
                  </div>
                </div>
              </div>

              <div className="bill-breakdown">
                <div className="breakdown-row">
                  <span>{t("produceTotal", "Produce Total")}</span>
                  <b>₹{produceAmount.toLocaleString("en-IN")}</b>
                </div>
                <div className="breakdown-row">
                  <span>{t("escrowFee", "Escrow Assurance Fee (1%)")}</span>
                  <b>₹{escrowFee.toLocaleString("en-IN")}</b>
                </div>
                <div className="breakdown-row">
                  <span>{t("gst", "Mandi Cess & GST")}</span>
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>Waived (0%)</span>
                </div>
                <div className="breakdown-row total">
                  <span>{t("grandTotal", "Total Payable")}</span>
                  <b>₹{grandTotal.toLocaleString("en-IN")}</b>
                </div>
              </div>

              <div className="escrow-guarantee-box">
                <ShieldCheck size={20} color="#166534" />
                <div>
                  <strong>Farmer Protection & Buyer Guarantee</strong>
                  <p>
                    Funds remain securely in escrow until delivery is confirmed by the buyer or
                    inspected at destination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // All Payments List View
  const totalVolume = paymentList.reduce((acc, p) => acc + (p.amount || 0), 0);
  const paidVolume = paymentList
    .filter((p) => p.status === "PAID")
    .reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingCount = paymentList.filter((p) => p.status === "PENDING").length;

  return (
    <section className="payment-list-page animate-fadeIn">
      <div className="page-header">
        <div>
          <p className="eyebrow">ESCROW SETTLEMENTS</p>
          <h1>{t("payments", "Payments & Escrow Management")}</h1>
          <p>
            Track transparent fund security from buyer payment through delivery release.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="payment-kpi-grid">
        <div className="kpi-card">
          <small>Total Escrow Volume</small>
          <h3>₹{totalVolume.toLocaleString("en-IN")}</h3>
          <span className="kpi-sub">Across all trade contracts</span>
        </div>
        <div className="kpi-card highlight-green">
          <small>Settled & Released</small>
          <h3>₹{paidVolume.toLocaleString("en-IN")}</h3>
          <span className="kpi-sub">Securely transferred to sellers</span>
        </div>
        <div className="kpi-card highlight-amber">
          <small>Pending Payment / Settlement</small>
          <h3>{pendingCount}</h3>
          <span className="kpi-sub">Awaiting buyer payment or release</span>
        </div>
      </div>

      {loading ? (
        <div className="panel loading-state">
          <div className="spinner" />
          <p>{t("loading", "Loading escrow payments…")}</p>
        </div>
      ) : error ? (
        <div className="panel error">
          <p>{error}</p>
          <button onClick={loadData}>{t("retry", "Try Again")}</button>
        </div>
      ) : paymentList.length === 0 ? (
        <div className="panel empty-state">
          <Receipt size={40} color="#94a3b8" />
          <h3>No payment records yet</h3>
          <p>
            When an offer is accepted and a transaction is created, payment records will appear
            here.
          </p>
          <Link to={`/${r}/offers`} className="primary" style={{ marginTop: "12px" }}>
            View Offers
          </Link>
        </div>
      ) : (
        <div className="payment-records-table-wrap">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Commodity / Lot</th>
                <th>Party Involved</th>
                <th>Amount (₹)</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentList.map((p) => {
                const txn = p.transaction;
                const isBuyer = String(txn?.buyer?._id || txn?.buyer) === String(user?._id);
                return (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.referenceId || "KL-ESCROW-" + p._id.slice(-6).toUpperCase()}</strong>
                      <br />
                      <small style={{ color: "#64748b" }}>
                        {new Date(p.createdAt).toLocaleDateString("en-IN")}
                      </small>
                    </td>
                    <td>
                      <b>{txn?.lot?.commodity || "Produce"}</b>
                      <br />
                      <small>{txn?.quantity?.toLocaleString("en-IN")} kg</small>
                    </td>
                    <td>
                      <div>
                        <small>Seller: </small>
                        <b>{txn?.seller?.name || "Farmer"}</b>
                      </div>
                      <div>
                        <small>Buyer: </small>
                        <b>{txn?.buyer?.name || "Buyer"}</b>
                      </div>
                    </td>
                    <td>
                      <span className="amount-pill">₹{p.amount?.toLocaleString("en-IN")}</span>
                    </td>
                    <td>
                      <span>{p.paymentMethod || "Escrow"}</span>
                    </td>
                    <td>
                      <StatusBadge>{p.status}</StatusBadge>
                    </td>
                    <td>
                      {isBuyer && p.status === "PENDING" && txn?._id ? (
                        <Link
                          to={`/${r}/payments/${txn._id}`}
                          className="primary"
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          {t("payNow", "Pay Now")}
                        </Link>
                      ) : (
                        <Link
                          to={`/${r}/transactions`}
                          className="secondary"
                          style={{
                            padding: "6px 10px",
                            fontSize: "12px",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          View Deal
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default PaymentPage;
