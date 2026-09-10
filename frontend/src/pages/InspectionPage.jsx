import React, { useEffect, useState } from "react";
import api from "../api/client.js";

export function InspectionPage() {
  const [lots, setLots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    grade: "Grade A",
    moisture: "",
    foreignMatter: "",
    damagedPercentage: "",
    defects: "",
    inspectionNotes: "",
    inspectionStatus: "VERIFIED",
    grainImage: "",
  });

  const load = () =>
    api
      .get("/inspections/lots")
      .then((x) => setLots(x.data.data))
      .catch((e) =>
        setMessage(
          e.response?.data?.message || "Could not load inspection lots."
        )
      );

  useEffect(() => {
    load();
  }, []);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const image = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024)
      return setMessage("Choose an image smaller than 3 MB.");
    const reader = new FileReader();
    reader.onload = () => update("grainImage", reader.result);
    reader.readAsDataURL(file);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!selected) return setMessage("Select a farmer lot first.");
    try {
      await api.post("/inspections", { ...form, lotId: selected._id });
      setMessage("Inspection verified and quality record published.");
      setSelected(null);
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Could not save inspection.");
    }
  };

  return (
    <section>
      <p className="eyebrow">KRISHI KENDRA QUALITY DESK</p>
      <h1>Verify grain quality</h1>
      <p>
        Farmers bring samples here. Record measurable quality data so buyers and
        sellers can trade with confidence.
      </p>
      {message && <div className="form-message success">{message}</div>}
      <div className="two-col">
        <div className="panel">
          <h3>Farmer lots awaiting inspection</h3>
          {lots.length === 0 ? (
            <p>No eligible lots found.</p>
          ) : (
            lots.map((lot) => (
              <button
                className={`inspection-lot ${
                  selected?._id === lot._id ? "selected" : ""
                }`}
                key={lot._id}
                onClick={() => setSelected(lot)}
              >
                <b>
                  {lot.commodity} · {lot.remainingQuantity} kg
                </b>
                <small>
                  {lot.owner?.name} · {lot.location} ·{" "}
                  {lot.quality?.inspectionStatus || "PENDING"}
                </small>
              </button>
            ))
          )}
        </div>
        <form className="form-card" onSubmit={submit}>
          <h3>
            {selected
              ? `${selected.commodity} sample · ${selected.owner?.name}`
              : "Select a lot to inspect"}
          </h3>
          <div className="form-grid">
            <label>
              Grade
              <select
                value={form.grade}
                onChange={(e) => update("grade", e.target.value)}
              >
                <option>Grade A</option>
                <option>Grade B</option>
                <option>Grade C</option>
                <option>Reject</option>
              </select>
            </label>
            <label>
              Moisture (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.moisture}
                onChange={(e) => update("moisture", e.target.value)}
                required
              />
            </label>
            <label>
              Foreign matter (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.foreignMatter}
                onChange={(e) => update("foreignMatter", e.target.value)}
                required
              />
            </label>
            <label>
              Damaged grain (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.damagedPercentage}
                onChange={(e) => update("damagedPercentage", e.target.value)}
                required
              />
            </label>
          </div>
          <label>
            Defects
            <textarea
              rows="3"
              value={form.defects}
              onChange={(e) => update("defects", e.target.value)}
              placeholder="Broken grains, discoloration, pests..."
            />
          </label>
          <label>
            Inspection notes
            <textarea
              rows="3"
              value={form.inspectionNotes}
              onChange={(e) => update("inspectionNotes", e.target.value)}
            />
          </label>
          <label>
            Grain sample photo
            <input type="file" accept="image/*" onChange={image} />
          </label>
          {form.grainImage && (
            <img
              className="grain-preview"
              src={form.grainImage}
              alt="Grain sample preview"
            />
          )}
          <button className="primary" disabled={!selected} type="submit">
            Publish verified quality
          </button>
        </form>
      </div>
    </section>
  );
}

export default InspectionPage;
