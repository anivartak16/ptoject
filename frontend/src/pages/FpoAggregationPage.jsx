import React, { useEffect, useState } from "react";
import api from "../api/client.js";

export function FpoAggregationPage() {
  const [members, setMembers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [lots, setLots] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [m, l] = await Promise.all([
        api.get("/fpo/members"),
        api.get("/fpo/lots"),
      ]);
      setMembers(m.data.data);
      setLots(l.data.data);
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not load FPO members and lots."
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const findFarmers = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      setFarmers([]);
      return;
    }
    try {
      const x = await api.get(
        "/fpo/farmers?search=" + encodeURIComponent(value)
      );
      setFarmers(x.data.data);
    } catch {
      setFarmers([]);
    }
  };

  const addMember = async (id) => {
    try {
      await api.post("/fpo/members", { farmerId: id });
      setMessage("Farmer added to your FPO.");
      setSearch("");
      setFarmers([]);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not add farmer.");
    }
  };

  const removeMember = async (id) => {
    try {
      await api.delete("/fpo/members/" + id);
      setMessage("Farmer removed from your FPO.");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not remove member.");
    }
  };

  const toggleLot = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );

  const aggregate = async (event) => {
    event.preventDefault();
    if (selected.length < 2) {
      setError("Select at least two farmer lots to create an aggregation.");
      return;
    }
    try {
      await api.post("/fpo/aggregate", {
        lotIds: selected,
        expectedPrice: Number(price),
      });
      setMessage("Combined lot published successfully.");
      setSelected([]);
      setPrice("");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not create aggregate lot.");
    }
  };

  return (
    <section>
      <p className="eyebrow">FPO COLLECTIVE SELLING</p>
      <h1>Build your farmer pool</h1>
      <p>
        Add farmers, select their available produce, and publish one larger lot
        with stronger market volume.
      </p>

      {error && (
        <div className="form-message error">
          {error}
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}
      {message && <div className="form-message success">{message}</div>}

      <div className="two-col">
        <div className="panel">
          <h3>Add farmers to your FPO</h3>
          <p>Search by name, email, or location.</p>
          <input
            value={search}
            placeholder="Search farmers"
            onChange={(e) => findFarmers(e.target.value)}
          />
          {farmers.map((farmer) => (
            <div className="member-row" key={farmer._id}>
              <div>
                <b>{farmer.name}</b>
                <small>
                  {farmer.location} · {farmer.primaryCrop || "Crop not set"}
                </small>
              </div>
              <button
                className="primary"
                onClick={() => addMember(farmer._id)}
              >
                Add
              </button>
            </div>
          ))}
          <h3 className="subheading">Your members ({members.length})</h3>
          {members.length === 0 ? (
            <p>No farmers added yet.</p>
          ) : (
            members.map((member) => (
              <div className="member-row" key={member._id}>
                <div>
                  <b>{member.name}</b>
                  <small>
                    {member.location} · {member.email}
                  </small>
                </div>
                <button onClick={() => removeMember(member._id)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <div className="section-head">
            <div>
              <h3>Select produce to aggregate</h3>
              <small>
                {selected.length} lot{selected.length === 1 ? "" : "s"} selected
              </small>
            </div>
          </div>
          {lots.length === 0 ? (
            <p>Add farmers with available lots to begin.</p>
          ) : (
            lots.map((lot) => (
              <label
                className={`select-lot ${
                  selected.includes(lot._id) ? "selected" : ""
                }`}
                key={lot._id}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(lot._id)}
                  onChange={() => toggleLot(lot._id)}
                />
                <span>
                  <b>
                    {lot.commodity} · {lot.remainingQuantity} kg
                  </b>
                  <small>
                    {lot.owner?.name} · {lot.location} ·{" "}
                    {lot.quality?.grade || "Quality pending"}
                  </small>
                </span>
                <strong>₹{lot.expectedPrice}/kg</strong>
              </label>
            ))
          )}
          <form className="inline-form" onSubmit={aggregate}>
            <input
              type="number"
              min="1"
              placeholder="Blended selling price per kg"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <button className="primary" type="submit">
              Aggregate selected produce
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default FpoAggregationPage;
