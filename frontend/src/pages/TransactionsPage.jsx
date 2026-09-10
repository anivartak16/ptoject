import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";

export function TransactionsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

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

  const update = async (t, status) => {
    try {
      await api.patch("/transactions/" + t._id + "/status", {
        status,
        note: "Updated from KrishiLink dashboard",
      });
      if (status === "COMPLETED")
        await api.patch("/payments/" + t._id, { status: "PAID" });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Transaction update failed");
    }
  };

  return (
    <section>
      <p className="eyebrow">TRACEABILITY</p>
      <h1>Transactions</h1>
      <p>
        Follow each agreement from acceptance through logistics, delivery and
        payment.
      </p>
      {rows === null ? (
        <p>Loading transactions…</p>
      ) : error ? (
        <div className="panel error">
          {error}
          <br />
          <button onClick={load}>Try again</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="panel">
          <h3>No active transactions</h3>
          <p>
            Accepting a buyer offer will create a traceable transaction here.
          </p>
        </div>
      ) : (
        rows.map((t) => (
          <div className="panel" key={t._id}>
            <div className="section-head">
              <div>
                <h3>
                  {t.lot?.commodity} · ₹{t.amount?.toLocaleString("en-IN")}
                </h3>
                <StatusBadge>{t.status}</StatusBadge>
              </div>
              <select
                value={t.status}
                onChange={(e) => update(t, e.target.value)}
              >
                {[
                  "CREATED",
                  "CONFIRMED",
                  "IN_TRANSIT",
                  "DELIVERED",
                  "COMPLETED",
                  "CANCELLED",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
            <p>
              {t.quantity} kg · Buyer: {t.buyer?.name} · Seller:{" "}
              {t.seller?.name}
            </p>
            <div className="timeline">
              {t.events?.map((e) => (
                <span key={e._id || e.status}>✓ {e.status}</span>
              ))}
            </div>
            {t.status !== "COMPLETED" && t.status !== "CANCELLED" && (
              <Link
                className="text-action"
                to={`/${user?.role?.toLowerCase().replaceAll("_", "-")}/disputes`}
              >
                Raise a dispute ↗
              </Link>
            )}
          </div>
        ))
      )}
    </section>
  );
}

export default TransactionsPage;
