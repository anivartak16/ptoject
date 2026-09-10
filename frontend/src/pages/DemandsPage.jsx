import React, { useEffect, useState } from "react";
import api from "../api/client.js";

export function DemandsPage() {
  const [rows, setRows] = useState([]);
  const [matches, setMatches] = useState([]);
  const [f, setF] = useState({
    commodity: "Wheat",
    requiredQuantity: 3000,
    requiredQuality: "Grade A",
    preferredLocation: "Indore",
    maxPrice: 2600,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () =>
    api
      .get("/demands?mine=true")
      .then((x) => setRows(x.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load demands.")
      );

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/demands", {
        ...f,
        requiredQuantity: +f.requiredQuantity,
        maxPrice: +f.maxPrice,
      });
      load();
    } catch (x) {
      setError(x.response?.data?.message || "Could not create demand.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Buyer Demand & Explainable Matching</h2>
      {error && <p className="form-message error">{error}</p>}
      <form className="inline-form" onSubmit={save}>
        {Object.keys(f).map((k) => (
          <input
            key={k}
            placeholder={k}
            value={f[k]}
            onChange={(e) => setF({ ...f, [k]: e.target.value })}
          />
        ))}
        <button className="primary" disabled={loading} type="submit">
          {loading ? "Creating…" : "Create demand"}
        </button>
      </form>
      {rows.map((d) => (
        <article className="lot" key={d._id}>
          <h3>
            {d.commodity} · {d.requiredQuantity} KG
          </h3>
          <button
            onClick={() =>
              api
                .get("/matches/" + d._id)
                .then((x) => setMatches(x.data.data))
                .catch((x) =>
                  setError(x.response?.data?.message || "Could not find matches.")
                )
            }
          >
            Find matches
          </button>
        </article>
      ))}
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

export default DemandsPage;
