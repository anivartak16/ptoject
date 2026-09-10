import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { Card } from "../components/common/Card.jsx";

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/analytics")
      .then((x) => setData(x.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load analytics.")
      );
  }, []);

  if (error)
    return (
      <section>
        <p className="error">{error}</p>
      </section>
    );

  if (!data)
    return (
      <section>
        <p>Loading analytics…</p>
      </section>
    );

  const total = (items = []) => items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section>
      <p className="eyebrow">PLATFORM INTELLIGENCE</p>
      <h1>Marketplace analytics</h1>
      <p>
        Operational health across users, inventory, procurement, trades, and
        payments.
      </p>

      <div className="grid">
        <Card a="USERS" b={total(data.users)} c="All registered roles" />
        <Card a="ACTIVE INVENTORY" b={total(data.lots)} c="Lot records by status" />
        <Card a="OFFERS" b={total(data.offers)} c="Negotiation activity" />
        <Card a="TRANSACTIONS" b={total(data.transactions)} c="Trade lifecycle records" />
      </div>

      <div className="two-col">
        {[
          ["Users by role", data.users],
          ["Inventory by status", data.lots],
          ["Transactions by status", data.transactions],
          ["Payments by status", data.payments],
        ].map(([title, items = []]) => (
          <div className="panel" key={title}>
            <h3>{title}</h3>
            {items.map((item) => (
              <div className="market-row" key={item._id}>
                <b>{item._id}</b>
                <span>{item.count}</span>
                {item.value !== undefined && (
                  <small>
                    Value ₹{Number(item.value || 0).toLocaleString("en-IN")}
                  </small>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default AnalyticsPage;
