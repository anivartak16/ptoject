import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { FarmerVerificationBadge } from "../components/common/FarmerVerificationBadge.jsx";
import { BuyerVerificationBadge } from "../components/common/BuyerVerificationBadge.jsx";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  FileText,
  CreditCard,
  AlertCircle,
  Download,
  X,
} from "lucide-react";

export function TransactionsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const r = user?.role?.toLowerCase().replaceAll("_", "-") || "farmer";

  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [actionLoading, setActionLoading] = useState("");

  const load = () => {
    setError("");
    api
      .get("/transactions")
      .then((x) => setRows(x.data.data))
      .catch((e) => {
        setRows([]);
        setError(e.response?.data?.message || "Could not load transactions");
      });
  };

  useEffect(load, []);

  const updateStatus = async (tObj, nextStatus) => {
    setActionLoading(tObj._id);
    try {
      await api.patch(`/transactions/${tObj._id}/status`, {
        status: nextStatus,
        note: `Status updated to ${nextStatus} via KrishiLink control centre`,
      });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Transaction status update failed.");
    } finally {
      setActionLoading("");
    }
  };

  // KPIs
  const totalVolume = (rows || []).reduce((acc, t) => acc + (t.amount || 0), 0);
  const completedCount = (rows || []).filter((t) => t.status === "COMPLETED").length;
  const inTransitCount = (rows || []).filter((t) => t.status === "IN_TRANSIT").length;
  const pendingPayCount = (rows || []).filter((t) => t.status === "CREATED").length;

  // Filter & search logic
  const filteredRows = (rows || [])
    .filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const commodity = (item.lot?.commodity || "").toLowerCase();
        const buyer = (item.buyer?.name || "").toLowerCase();
        const seller = (item.seller?.name || "").toLowerCase();
        const id = (item._id || "").toLowerCase();
        return (
          commodity.includes(q) ||
          buyer.includes(q) ||
          seller.includes(q) ||
          id.includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "NEWEST") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "OLDEST") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "AMOUNT_HIGH") return (b.amount || 0) - (a.amount || 0);
      if (sortBy === "AMOUNT_LOW") return (a.amount || 0) - (b.amount || 0);
      return 0;
    });

  const getStatusIcon = (st) => {
    switch (st) {
      case "CREATED":
        return <Clock size={16} color="#d97706" />;
      case "CONFIRMED":
        return <CheckCircle2 size={16} color="#16a34a" />;
      case "IN_TRANSIT":
        return <Truck size={16} color="#2563eb" />;
      case "DELIVERED":
        return <PackageCheck size={16} color="#0891b2" />;
      case "COMPLETED":
        return <CheckCircle2 size={16} color="#166534" />;
      case "CANCELLED":
        return <XCircle size={16} color="#dc2626" />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <section className="transactions-command-page animate-fadeIn">
      <div className="page-header">
        <div>
          <p className="eyebrow">TRADE FULFILLMENT & AUDIT</p>
          <h1>{t("transactions", "Transactions & Trade Orders")}</h1>
          <p>
            Track each signed agreement end-to-end: payment escrow, transit coordination,
            delivery verification and final release.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="payment-kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="kpi-card">
          <small>Total Trade Volume</small>
          <h3>₹{totalVolume.toLocaleString("en-IN")}</h3>
          <span className="kpi-sub">Total contract value</span>
        </div>
        <div className="kpi-card highlight-green">
          <small>Deals Completed & Settled</small>
          <h3>{completedCount}</h3>
          <span className="kpi-sub">Successful farmer payouts</span>
        </div>
        <div className="kpi-card highlight-blue">
          <small>In Logistics Transit</small>
          <h3>{inTransitCount}</h3>
          <span className="kpi-sub">Vehicles en-route to buyers</span>
        </div>
        <div className="kpi-card highlight-amber">
          <small>Awaiting Payment</small>
          <h3>{pendingPayCount}</h3>
          <span className="kpi-sub">Pending escrow locking</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="transactions-toolbar">
        <div className="search-box-wrap">
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder={t("search", "Search by commodity, buyer, seller, or txn ID…")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="toolbar-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="NEWEST">Sort: Newest First</option>
            <option value="OLDEST">Sort: Oldest First</option>
            <option value="AMOUNT_HIGH">Amount: High to Low</option>
            <option value="AMOUNT_LOW">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="status-filter-tabs">
        {[
          { key: "ALL", label: t("all", "All Deals") },
          { key: "CREATED", label: "Awaiting Payment" },
          { key: "CONFIRMED", label: "Escrow Locked" },
          { key: "IN_TRANSIT", label: "In Transit" },
          { key: "DELIVERED", label: "Delivered" },
          { key: "COMPLETED", label: "Completed" },
          { key: "CANCELLED", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-chip ${statusFilter === tab.key ? "active" : ""}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main List */}
      {rows === null ? (
        <div className="panel loading-state">
          <div className="spinner" />
          <p>{t("loading", "Loading trade agreements…")}</p>
        </div>
      ) : error ? (
        <div className="panel error">
          <p>{error}</p>
          <button onClick={load}>{t("retry", "Try Again")}</button>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="panel empty-state">
          <Clock size={40} color="#94a3b8" />
          <h3>No transactions match the selected criteria</h3>
          <p>
            {search || statusFilter !== "ALL"
              ? "Try resetting your search query or status filter."
              : "Accepting a buyer offer creates a traceable trade contract here."}
          </p>
          <button
            className="secondary"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
            style={{ marginTop: "12px" }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="transactions-list">
          {filteredRows.map((tItem) => {
            const isBuyer =
              String(tItem.buyer?._id || tItem.buyer) === String(user?._id) ||
              user?.role === "BUYER";
            const isSeller =
              String(tItem.seller?._id || tItem.seller) === String(user?._id) ||
              user?.role === "FARMER" ||
              user?.role === "FPO";

            return (
              <div className="transaction-card panel animate-fadeIn" key={tItem._id}>
                {/* Header Row */}
                <div className="txn-card-header">
                  <div className="txn-header-left">
                    <span className="txn-status-icon">{getStatusIcon(tItem.status)}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "17px" }}>
                        {tItem.lot?.commodity || "Agricultural Produce"}
                      </h3>
                      <span className="txn-id-tag">
                        Txn #{tItem._id.slice(-6).toUpperCase()} ·{" "}
                        {new Date(tItem.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="txn-header-right">
                    <div className="txn-amount-badge">
                      <span>Total: </span>
                      <b>₹{tItem.amount?.toLocaleString("en-IN")}</b>
                    </div>
                    <StatusBadge>{tItem.status}</StatusBadge>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="txn-details-grid">
                  <div>
                    <small>Contract Quantity</small>
                    <b>{tItem.quantity?.toLocaleString("en-IN")} kg</b>
                  </div>
                  <div>
                    <small>Unit Rate</small>
                    <b>₹{Math.round(tItem.amount / (tItem.quantity || 1))}/kg</b>
                  </div>
                  <div>
                    <small>Seller (Farmer / FPO)</small>
                    <b>{tItem.seller?.name || "Farmer Partner"}</b>
                    <small style={{ display: "block", color: "#64748b", marginBottom: "4px" }}>
                      {tItem.seller?.district || tItem.seller?.location || "Indore"}
                    </small>
                    <FarmerVerificationBadge compact farmer={tItem.seller} verification={tItem.seller?.verification} />
                  </div>
                  <div>
                    <small>Buyer (Trader / Miller)</small>
                    <b>{tItem.buyer?.name || "Procurement Buyer"}</b>
                    <small style={{ display: "block", color: "#64748b", marginBottom: "4px" }}>
                      {tItem.buyer?.district || tItem.buyer?.location || "Bhopal"}
                    </small>
                    <BuyerVerificationBadge compact buyer={tItem.buyer} verification={tItem.buyer?.verification} />
                  </div>
                </div>

                {/* Event Timeline */}
                <div className="txn-timeline-horizontal">
                  {[
                    { st: "CREATED", label: "Agreement" },
                    { st: "CONFIRMED", label: "Escrow Paid" },
                    { st: "IN_TRANSIT", label: "In Transit" },
                    { st: "DELIVERED", label: "Delivered" },
                    { st: "COMPLETED", label: "Released" },
                  ].map((step, idx, arr) => {
                    const eventReached = (tItem.events || []).some(
                      (e) => e.status === step.st
                    );
                    const isCurrent = tItem.status === step.st;
                    return (
                      <div
                        key={step.st}
                        className={`timeline-step ${
                          eventReached ? "completed" : ""
                        } ${isCurrent ? "current" : ""}`}
                      >
                        <div className="step-node">
                          {eventReached ? "✓" : idx + 1}
                        </div>
                        <span className="step-label">{step.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Interactive Action Bar */}
                <div className="txn-actions-footer">
                  <div className="txn-left-actions">
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => setSelectedTxn(tItem)}
                    >
                      <FileText size={15} />
                      <span>View Receipt & Invoice</span>
                    </button>

                    {tItem.status !== "COMPLETED" && tItem.status !== "CANCELLED" && (
                      <Link
                        className="text-btn dispute-btn"
                        to={`/${r}/disputes`}
                      >
                        <AlertCircle size={15} />
                        <span>Raise Dispute</span>
                      </Link>
                    )}
                  </div>

                  <div className="txn-right-actions">
                    {/* Buyer Action: Complete Payment */}
                    {isBuyer && tItem.status === "CREATED" && (
                      <Link
                        to={`/${r}/payments/${tItem._id}`}
                        className="primary action-btn-highlight"
                      >
                        <CreditCard size={15} />
                        <span>Pay via Escrow (₹{tItem.amount?.toLocaleString("en-IN")})</span>
                      </Link>
                    )}

                    {/* Seller/Buyer Action: Mark In Transit */}
                    {(isSeller || isBuyer) && tItem.status === "CONFIRMED" && (
                      <button
                        type="button"
                        className="primary"
                        disabled={actionLoading === tItem._id}
                        onClick={() => updateStatus(tItem, "IN_TRANSIT")}
                      >
                        <Truck size={15} />
                        <span>Mark In Transit</span>
                      </button>
                    )}

                    {/* Buyer Action: Confirm Delivery */}
                    {isBuyer && tItem.status === "IN_TRANSIT" && (
                      <button
                        type="button"
                        className="primary"
                        disabled={actionLoading === tItem._id}
                        onClick={() => updateStatus(tItem, "DELIVERED")}
                      >
                        <PackageCheck size={15} />
                        <span>Confirm Delivery</span>
                      </button>
                    )}

                    {/* Buyer or Seller Action: Release Escrow & Complete */}
                    {tItem.status === "DELIVERED" && (
                      <button
                        type="button"
                        className="primary btn-complete"
                        disabled={actionLoading === tItem._id}
                        onClick={() => updateStatus(tItem, "COMPLETED")}
                      >
                        <CheckCircle2 size={15} />
                        <span>Release Escrow & Complete Deal</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Detail & Printable Invoice Modal */}
      {selectedTxn && (
        <div className="modal-overlay" onClick={() => setSelectedTxn(null)}>
          <div
            className="modal-content animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}
          >
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={20} color="#166534" />
                <h3 style={{ margin: 0 }}>Trade Agreement & Tax Invoice</h3>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setSelectedTxn(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="invoice-box" id="printable-modal-invoice">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, color: "#166534" }}>KrishiLink</h2>
                    <small style={{ color: "#64748b" }}>National Digital Mandi Network</small>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <StatusBadge>{selectedTxn.status}</StatusBadge>
                    <small style={{ display: "block", marginTop: "4px" }}>
                      ID: #{selectedTxn._id}
                    </small>
                  </div>
                </div>

                <div className="invoice-parties-grid">
                  <div>
                    <small>SELLER (FARMER / FPO)</small>
                    <b>{selectedTxn.seller?.name || "Farmer Partner"}</b>
                    <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748b" }}>
                      {selectedTxn.seller?.farmName ? `${selectedTxn.seller.farmName}, ` : ""}
                      {selectedTxn.seller?.location || selectedTxn.seller?.district || "Madhya Pradesh"}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                      {selectedTxn.seller?.phone || "+91-9876543210"}
                    </p>
                  </div>

                  <div>
                    <small>BUYER (TRADER / MILLER)</small>
                    <b>{selectedTxn.buyer?.name || "Verified Buyer"}</b>
                    <p style={{ margin: "2px 0", fontSize: "12px", color: "#64748b" }}>
                      {selectedTxn.buyer?.organizationName ? `${selectedTxn.buyer.organizationName}, ` : ""}
                      {selectedTxn.buyer?.district || "Bhopal, MP"}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                      {selectedTxn.buyer?.phone || "+91-9826012345"}
                    </p>
                  </div>
                </div>

                <table className="invoice-items-table" style={{ width: "100%", margin: "16px 0" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                      <th style={{ padding: "8px" }}>Produce Commodity</th>
                      <th style={{ padding: "8px" }}>Weight (kg)</th>
                      <th style={{ padding: "8px" }}>Unit Price</th>
                      <th style={{ padding: "8px", textAlign: "right" }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "8px" }}>
                        <b>{selectedTxn.lot?.commodity || "Produce"}</b>
                        <br />
                        <small style={{ color: "#64748b" }}>
                          KVK Quality Certified · Grade {selectedTxn.lot?.grade || "A"}
                        </small>
                      </td>
                      <td style={{ padding: "8px" }}>
                        {selectedTxn.quantity?.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "8px" }}>
                        ₹{Math.round(selectedTxn.amount / (selectedTxn.quantity || 1))}/kg
                      </td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        ₹{selectedTxn.amount?.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td colSpan="3" style={{ padding: "8px", textAlign: "right" }}>
                        KrishiLink Escrow Fee (1%):
                      </td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        ₹{Math.round(selectedTxn.amount * 0.01).toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr style={{ fontWeight: "bold", borderTop: "2px solid #166534" }}>
                      <td colSpan="3" style={{ padding: "8px", textAlign: "right" }}>
                        Grand Total Settled in Escrow:
                      </td>
                      <td style={{ padding: "8px", textAlign: "right", color: "#166534" }}>
                        ₹{Math.round(selectedTxn.amount * 1.01).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Audit Event History */}
                <div style={{ marginTop: "14px" }}>
                  <small style={{ fontWeight: 700, textTransform: "uppercase" }}>
                    Audit Trail & Events
                  </small>
                  <ul style={{ margin: "6px 0 0", paddingLeft: "18px", fontSize: "12px", color: "#475569" }}>
                    {(selectedTxn.events || []).map((e, idx) => (
                      <li key={idx}>
                        <strong>{e.status}</strong> — {e.note || "Updated"} (
                        {new Date(e.at || selectedTxn.createdAt).toLocaleString("en-IN")})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                type="button"
                className="secondary"
                onClick={() => window.print()}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Download size={15} />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => setSelectedTxn(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TransactionsPage;
