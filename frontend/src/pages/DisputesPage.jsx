import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";

export function DisputesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    transactionId: "",
    reason: "",
    description: "",
  });
  const [message, setMessage] = useState("");

  const load = () =>
    Promise.all([api.get("/disputes"), api.get("/transactions")])
      .then(([d, t]) => {
        setRows(d.data.data);
        setTransactions(t.data.data);
      })
      .catch((e) =>
        setMessage(e.response?.data?.message || "Could not load disputes.")
      );

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/disputes", form);
      setMessage("Dispute raised and sent for review.");
      setForm({ transactionId: "", reason: "", description: "" });
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Could not raise dispute.");
    }
  };

  const resolve = async (id, status) => {
    try {
      await api.patch("/disputes/" + id, {
        status,
        resolution:
          status === "RESOLVED"
            ? "Reviewed and resolved by marketplace administration."
            : "Dispute closed after review.",
      });
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Could not update dispute.");
    }
  };

  return (
    <section>
      <p className="eyebrow">TRUST & RESOLUTION</p>
      <h1>Dispute management</h1>
      <p>
        Keep transaction issues documented, visible to the right participants,
        and resolved by an administrator.
      </p>

      {message && <div className="form-message success">{message}</div>}

      {user?.role !== "ADMIN" && (
        <form className="form-card" onSubmit={submit}>
          <div className="form-card-heading">
            <div>
              <h3>Raise a dispute</h3>
              <p>Choose one of your transactions and describe the issue.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Transaction
              <select
                value={form.transactionId}
                onChange={(e) =>
                  setForm({ ...form, transactionId: e.target.value })
                }
                required
              >
                <option value="">Select transaction</option>
                {transactions.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.lot?.commodity} · ₹{t.amount?.toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Reason
              <input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Quality, payment, delivery..."
                required
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows="4"
              required
            />
          </label>
          <div className="form-actions">
            <button className="primary" type="submit">
              Submit dispute
            </button>
          </div>
        </form>
      )}

      <div className="data-list">
        {rows.length === 0 ? (
          <div className="panel">
            <h3>No disputes</h3>
            <p>Open issues will appear here.</p>
          </div>
        ) : (
          rows.map((d) => (
            <div className="panel" key={d._id}>
              <StatusBadge>{d.status}</StatusBadge>
              <h3>{d.reason}</h3>
              <p>{d.description}</p>
              <small>
                {d.raisedBy?.name} · Transaction:{" "}
                {d.transaction?.lot?.commodity || "Marketplace transaction"}
              </small>
              {user?.role === "ADMIN" &&
                d.status !== "RESOLVED" &&
                d.status !== "REJECTED" && (
                  <div className="form-actions">
                    <button onClick={() => resolve(d._id, "UNDER_REVIEW")}>
                      Start review
                    </button>
                    <button
                      className="primary"
                      onClick={() => resolve(d._id, "RESOLVED")}
                    >
                      Resolve
                    </button>
                    <button onClick={() => resolve(d._id, "REJECTED")}>
                      Reject
                    </button>
                  </div>
                )}
              {d.resolution && (
                <p>
                  <b>Resolution:</b> {d.resolution}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default DisputesPage;
