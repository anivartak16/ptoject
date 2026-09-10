import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";

export function MatchesPage() {
  const { user } = useAuth();
  const [demands, setDemands] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    api
      .get("/demands")
      .then((x) => setDemands(x.data.data))
      .catch(() => {});
  }, []);

  return (
    <section>
      <p className="eyebrow">EXPLAINABLE MATCHING</p>
      <h1>
        {user?.role === "BUYER" ? "Recommended lots" : "Demand-to-lot matching"}
      </h1>
      <p>
        Scores use commodity, quantity, quality, location, price and deadline
        criteria—never a black box.
      </p>

      <div className="lots">
        {demands.map((d) => (
          <article className="lot" key={d._id}>
            <StatusBadge>{d.status}</StatusBadge>
            <h3>
              {d.commodity} · {d.requiredQuantity} kg
            </h3>
            <p>
              Maximum ₹{d.maxPrice}/kg · {d.preferredLocation}
            </p>
            <button
              className="primary"
              onClick={() =>
                api
                  .get("/matches/" + d._id)
                  .then((x) => setMatches(x.data.data))
              }
            >
              Show ranked matches
            </button>
          </article>
        ))}
      </div>

      {matches.map((m) => (
        <div className="match" key={m.lot?._id || m.matchScore}>
          <div className="match-heading">
            <b>{m.matchScore}% fair match</b>
            <span>
              {m.lot?.commodity} · {m.lot?.remainingQuantity} kg · ₹
              {m.lot?.expectedPrice}/kg
            </span>
          </div>
          <div className="match-breakdown">
            {Object.entries(m.breakdown || {}).map(([key, value]) => (
              <span key={key}>
                <b>{value}</b>/ {key}
              </span>
            ))}
          </div>
          <p>{m.reasons?.map((x) => "✓ " + x).join(" · ")}</p>
        </div>
      ))}
    </section>
  );
}

export default MatchesPage;
