import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";

export function OffersPage() {
  const { user } = useAuth();
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
    try {
      await api.patch("/offers/" + id + "/accept");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Offer could not be accepted");
    }
  };

  return (
    <section>
      <p className="eyebrow">NEGOTIATION</p>
      <h1>Offers</h1>
      <p>
        Review price, quantity, buyer reliability and validity before accepting.
      </p>
      {rows === null ? (
        <p>Loading offers…</p>
      ) : error ? (
        <div className="panel error">
          {error}
          <br />
          <button onClick={load}>Try again</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="panel">
          <h3>No offers yet</h3>
          <p>
            Buyer offers will appear here when they are made against your lots.
          </p>
          <Link
            className="primary"
            to={"/" + user.role.toLowerCase().replaceAll("_", "-") + "/lots"}
          >
            View lots
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
    </section>
  );
}

export default OffersPage;
