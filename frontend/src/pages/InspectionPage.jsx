import React, { useEffect, useState, useMemo } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Card } from "../components/common/Card.jsx";

export function InspectionPage() {
  const { user } = useAuth();
  const [lots, setLots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [retesting, setRetesting] = useState(false);

  const [form, setForm] = useState({
    grade: "Grade A",
    moisture: "",
    foreignMatter: "",
    damagedPercentage: "",
    defects: "",
    inspectionNotes: "",
    grainImage: "",
  });

  const load = () => {
    api
      .get("/inspections/lots")
      .then((x) => {
        setLots(x.data.data || []);
      })
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load inspection lots.")
      );
  };

  useEffect(() => {
    load();
  }, []);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const selectLot = (lot) => {
    setSelected(lot);
    setRetesting(false);
    setMessage("");
    setError("");
    if (lot.quality) {
      setForm({
        grade: lot.quality.grade || "Grade A",
        moisture: lot.quality.moisture !== undefined ? String(lot.quality.moisture) : "",
        foreignMatter: lot.quality.foreignMatter !== undefined ? String(lot.quality.foreignMatter) : "",
        damagedPercentage: lot.quality.damagedPercentage !== undefined ? String(lot.quality.damagedPercentage) : "",
        defects: lot.quality.defects || "",
        inspectionNotes: lot.quality.inspectionNotes || "",
        grainImage: lot.quality.grainImage || "",
      });
    } else {
      setForm({
        grade: "Grade A",
        moisture: "",
        foreignMatter: "",
        damagedPercentage: "",
        defects: "",
        inspectionNotes: "",
        grainImage: "",
      });
    }
  };

  const image = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024)
      return setError("Choose an image smaller than 3 MB.");
    const reader = new FileReader();
    reader.onload = () => update("grainImage", reader.result);
    reader.readAsDataURL(file);
  };

  const submitInspection = async (statusDecision) => {
    if (!selected) return setError("Select a farmer lot first.");
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await api.post("/inspections", {
        ...form,
        lotId: selected._id,
        inspectionStatus: statusDecision,
      });

      setMessage(
        statusDecision === "VERIFIED"
          ? `✓ Lot for ${selected.commodity} verified and certified as ${form.grade}! The farmer has been notified and can now publish it to the marketplace.`
          : `✕ Lot inspection recorded as Rejected. Notice sent to ${selected.owner?.name || "the farmer"}.`
      );
      setSelected(null);
      setRetesting(false);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not save inspection.");
    } finally {
      setSubmitting(false);
    }
  };

  // Metric Computations
  const pendingLots = useMemo(
    () =>
      lots.filter(
        (l) =>
          l.status === "PENDING_VERIFICATION" ||
          l.quality?.inspectionStatus === "PENDING" ||
          (!l.quality && l.status !== "AVAILABLE")
      ),
    [lots]
  );

  const verifiedLots = useMemo(
    () =>
      lots.filter(
        (l) =>
          l.status === "VERIFIED" ||
          l.status === "AVAILABLE" ||
          l.status === "PARTIALLY_SOLD" ||
          l.quality?.inspectionStatus === "VERIFIED"
      ),
    [lots]
  );

  const rejectedLots = useMemo(
    () =>
      lots.filter(
        (l) =>
          l.status === "REJECTED" || l.quality?.inspectionStatus === "REJECTED"
      ),
    [lots]
  );

  const farmersServed = useMemo(() => {
    const ids = new Set();
    verifiedLots.forEach((l) => {
      if (l.owner?._id) ids.add(String(l.owner._id));
    });
    return ids.size;
  }, [verifiedLots]);

  // Filtered lots based on activeTab and searchTerm
  const filteredLots = useMemo(() => {
    let list = lots;
    if (activeTab === "PENDING") list = pendingLots;
    else if (activeTab === "VERIFIED") list = verifiedLots;
    else if (activeTab === "REJECTED") list = rejectedLots;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (l) =>
          l.commodity?.toLowerCase().includes(q) ||
          l.owner?.name?.toLowerCase().includes(q) ||
          l.location?.toLowerCase().includes(q) ||
          l.owner?.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [lots, activeTab, pendingLots, verifiedLots, rejectedLots, searchTerm]);

  const kvkCenterName =
    user?.organizationName || "Krishi Vigyan Kendra District Center";
  const kvkRegNumber = user?.registrationNumber || "ICAR-KVK-CENTRAL";
  const kvkOfficerName = user?.name || "Agricultural Quality Officer";
  const kvkJurisdiction = [
    user?.district ? user.district.toUpperCase() : null,
    user?.state ? user.state.toUpperCase() : null,
  ]
    .filter(Boolean)
    .join(", ") || "Central Region";

  const isSelectedVerified =
    selected &&
    !retesting &&
    (selected.status === "VERIFIED" ||
      selected.status === "AVAILABLE" ||
      selected.quality?.inspectionStatus === "VERIFIED");

  return (
    <section>
      {/* KVK Center Profile & Quality Authority Card */}
      <div className="kvk-header-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="kvk-badge-center">
              🏛 ICAR & MINISTERIAL ACCREDITED LABORATORY
            </div>
            <h1 style={{ margin: "4px 0 6px 0", fontSize: "24px" }}>{kvkCenterName}</h1>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "var(--ink-secondary)" }}>
              <span><b>Center Code:</b> {kvkRegNumber}</span>
              <span><b>Officer In-Charge:</b> {kvkOfficerName}</span>
              <span><b>Jurisdiction:</b> 📍 {kvkJurisdiction}</span>
              <span><b>Contact:</b> 📞 {user?.phone || "+91-9876543210"}</span>
            </div>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", textAlign: "right" }}>
            <span style={{ fontWeight: 700, color: "#166534", display: "block" }}>✓ Mandatory Quality Authority</span>
            <small style={{ color: "var(--ink-secondary)" }}>Produce requires KVK certification before marketplace listing</small>
          </div>
        </div>
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed #bbf7d0", display: "flex", gap: "10px", flexWrap: "wrap", fontSize: "12px", color: "#166534", fontWeight: 600 }}>
          <span>🧪 Digital Moisture Analysis</span>
          <span>·</span>
          <span>🔬 Foreign Matter & Purity Testing</span>
          <span>·</span>
          <span>🌱 Seed Germination & Defect Rating</span>
          <span>·</span>
          <span>📜 AGMARK & IS-1488 Compliance</span>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid" style={{ marginBottom: "20px" }}>
        <Card
          a="PENDING INSPECTIONS"
          b={pendingLots.length}
          c="Farmer harvest samples awaiting lab testing"
        />
        <Card
          a="CERTIFIED & VERIFIED"
          b={verifiedLots.length}
          c="Quality verified lots approved for market"
        />
        <Card
          a="REJECTED SAMPLES"
          b={rejectedLots.length}
          c="Failed moisture or purity standards"
        />
        <Card
          a="FARMERS SERVED"
          b={farmersServed}
          c="Distinct regional farmers certified"
        />
      </div>

      {/* Notification Banners */}
      {message && <div className="form-message success" style={{ marginBottom: "16px" }}>{message}</div>}
      {error && <div className="form-message error" style={{ marginBottom: "16px" }}>{error}</div>}

      {/* Queue Filter Tabs */}
      <div className="kvk-tab-bar">
        <button
          type="button"
          className={`kvk-tab ${activeTab === "PENDING" ? "active" : ""}`}
          onClick={() => setActiveTab("PENDING")}
        >
          ⏳ Awaiting Verification ({pendingLots.length})
        </button>
        <button
          type="button"
          className={`kvk-tab ${activeTab === "VERIFIED" ? "active" : ""}`}
          onClick={() => setActiveTab("VERIFIED")}
        >
          ✓ Certified Lots ({verifiedLots.length})
        </button>
        <button
          type="button"
          className={`kvk-tab ${activeTab === "REJECTED" ? "active" : ""}`}
          onClick={() => setActiveTab("REJECTED")}
        >
          ✕ Rejected Samples ({rejectedLots.length})
        </button>
        <button
          type="button"
          className={`kvk-tab ${activeTab === "ALL" ? "active" : ""}`}
          onClick={() => setActiveTab("ALL")}
        >
          All Samples ({lots.length})
        </button>
      </div>

      {/* Two Column Layout: Samples Queue List + Inspection/Certificate View */}
      <div className="two-col" style={{ alignItems: "flex-start" }}>
        {/* Left Column: Sample Queue */}
        <div className="panel" style={{ maxHeight: "720px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>
              {activeTab === "PENDING"
                ? "Samples Awaiting Testing"
                : activeTab === "VERIFIED"
                ? "Certified Lots"
                : activeTab === "REJECTED"
                ? "Rejected Samples"
                : "All Registered Lots"}
            </h3>
            <span style={{ fontSize: "12px", color: "var(--ink-secondary)", fontWeight: 600 }}>
              {filteredLots.length} items
            </span>
          </div>

          <input
            type="text"
            placeholder="Search crop, farmer name, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: "13px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "12px", boxSizing: "border-box" }}
          />

          {filteredLots.length === 0 ? (
            <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--ink-secondary)", fontSize: "14px" }}>
              No produce lots found matching this filter.
            </div>
          ) : (
            filteredLots.map((lot) => {
              const isPending =
                lot.status === "PENDING_VERIFICATION" ||
                lot.quality?.inspectionStatus === "PENDING";
              const isVer =
                lot.status === "VERIFIED" ||
                lot.status === "AVAILABLE" ||
                lot.quality?.inspectionStatus === "VERIFIED";
              const isRej =
                lot.status === "REJECTED" ||
                lot.quality?.inspectionStatus === "REJECTED";

              return (
                <button
                  type="button"
                  key={lot._id}
                  className={`inspection-lot-card ${selected?._id === lot._id ? "selected" : ""}`}
                  onClick={() => selectLot(lot)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                      {lot.commodity} · {(lot.remainingQuantity || lot.quantity).toLocaleString("en-IN")} kg
                    </strong>
                    <span
                      className={`kvk-cert-badge ${
                        isPending
                          ? "kvk-cert-pending"
                          : isVer
                          ? "kvk-cert-verified"
                          : isRej
                          ? "kvk-cert-rejected"
                          : "kvk-cert-pending"
                      }`}
                    >
                      {isPending
                        ? "⏳ PENDING"
                        : isVer
                        ? `✓ ${lot.quality?.grade || "VERIFIED"}`
                        : "✕ REJECTED"}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink-secondary)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div>
                      👨‍🌾 <b>Farmer:</b> {lot.owner?.name || "Unknown"} {lot.owner?.phone ? `(${lot.owner.phone})` : ""}
                    </div>
                    <div>
                      📍 <b>Location:</b> {lot.location || lot.owner?.location || lot.owner?.district || "Regional"}
                    </div>
                    {lot.quality?.moisture !== undefined && (
                      <div>
                        💧 <b>Moisture:</b> {lot.quality.moisture}% · <b>Defects:</b> {lot.quality.damagedPercentage || 0}%
                      </div>
                    )}
                    <small style={{ marginTop: "2px" }}>
                      Registered: {new Date(lot.createdAt).toLocaleDateString("en-IN")}
                    </small>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Lab Testing Form OR Digital Certificate */}
        <div style={{ width: "100%" }}>
          {isSelectedVerified ? (
            /* Digital Certificate of Analysis View */
            <div className="digital-certificate-box">
              <div className="digital-certificate-header">
                <div>
                  <span className="digital-certificate-seal">✓ OFFICIAL QUALITY CERTIFICATE</span>
                  <h3 style={{ margin: "6px 0 2px 0", fontSize: "18px" }}>
                    Certificate of Agricultural Analysis
                  </h3>
                  <small style={{ color: "var(--ink-secondary)" }}>
                    Issued by {kvkCenterName} (Accreditation: {kvkRegNumber})
                  </small>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>
                    CERTIFICATE ID
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 800, fontFamily: "monospace" }}>
                    KVK-MP-{selected._id.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "var(--ink-secondary)" }}>Produce Commodity:</span>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>{selected.commodity}</div>
                </div>
                <div>
                  <span style={{ color: "var(--ink-secondary)" }}>Certified Volume:</span>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>{(selected.remainingQuantity || selected.quantity).toLocaleString("en-IN")} KG</div>
                </div>
                <div>
                  <span style={{ color: "var(--ink-secondary)" }}>Farmer / Producer:</span>
                  <div style={{ fontWeight: 700 }}>{selected.owner?.name}</div>
                  <small>{selected.owner?.phone} · {selected.location || selected.owner?.location}</small>
                </div>
                <div>
                  <span style={{ color: "var(--ink-secondary)" }}>Certification Date:</span>
                  <div style={{ fontWeight: 700 }}>
                    {new Date(selected.quality?.inspectionDate || selected.updatedAt).toLocaleDateString("en-IN")}
                  </div>
                  <small>Tested by: {kvkOfficerName}</small>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", marginBottom: "14px", textAlign: "center" }}>
                <div style={{ background: "#dcfce7", padding: "10px", borderRadius: "6px" }}>
                  <small style={{ color: "#166534", fontWeight: 700, display: "block" }}>GRADE</small>
                  <strong style={{ fontSize: "16px", color: "#166534" }}>{selected.quality?.grade || "Grade A"}</strong>
                </div>
                <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "6px" }}>
                  <small style={{ color: "#475569", fontWeight: 700, display: "block" }}>MOISTURE</small>
                  <strong style={{ fontSize: "16px", color: "#0f172a" }}>{selected.quality?.moisture ?? "—"}%</strong>
                </div>
                <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "6px" }}>
                  <small style={{ color: "#475569", fontWeight: 700, display: "block" }}>FOREIGN MATTER</small>
                  <strong style={{ fontSize: "16px", color: "#0f172a" }}>{selected.quality?.foreignMatter ?? 0}%</strong>
                </div>
                <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "6px" }}>
                  <small style={{ color: "#475569", fontWeight: 700, display: "block" }}>DAMAGED GRAIN</small>
                  <strong style={{ fontSize: "16px", color: "#0f172a" }}>{selected.quality?.damagedPercentage ?? 0}%</strong>
                </div>
              </div>

              {selected.quality?.inspectionNotes && (
                <div style={{ fontSize: "13px", marginBottom: "12px", background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                  <b>Lab Observations:</b> {selected.quality.inspectionNotes}
                </div>
              )}

              {selected.quality?.grainImage && (
                <div style={{ marginBottom: "14px" }}>
                  <small style={{ fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: "4px" }}>
                    Verified Grain Sample Photo:
                  </small>
                  <img
                    src={selected.quality.grainImage}
                    alt="Verified sample"
                    className="grain-preview"
                  />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: "12px", marginTop: "12px" }}>
                <span style={{ fontSize: "12px", color: "#166534", fontWeight: 600 }}>
                  ✓ Digital Certificate is cryptographically linked to marketplace lot
                </span>
                <button
                  type="button"
                  style={{ padding: "6px 12px", fontSize: "12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => setRetesting(true)}
                >
                  Edit / Re-Inspect Lot
                </button>
              </div>
            </div>
          ) : (
            /* Lab Testing & Certification Input Form */
            <form className="form-card" onSubmit={(e) => { e.preventDefault(); submitInspection("VERIFIED"); }}>
              <div className="form-card-heading">
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>
                    {selected
                      ? `Laboratory Inspection: ${selected.commodity}`
                      : "Select a Produce Sample to Inspect"}
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ink-secondary)" }}>
                    {selected
                      ? `Farmer: ${selected.owner?.name} · ${(selected.remainingQuantity || selected.quantity).toLocaleString("en-IN")} kg · Location: ${selected.location || selected.owner?.location || "Regional"}`
                      : "Choose a farmer produce lot from the queue on the left to begin quality testing."}
                  </p>
                </div>
                {selected && (
                  <span className="kvk-cert-badge kvk-cert-pending">
                    {selected.status}
                  </span>
                )}
              </div>

              {selected ? (
                <>
                  <div className="form-grid">
                    <label>
                      Quality Grade
                      <select
                        value={form.grade}
                        onChange={(e) => update("grade", e.target.value)}
                        required
                      >
                        <option value="Grade A">Grade A (Premium Export Quality)</option>
                        <option value="Grade B">Grade B (Standard Market Grade)</option>
                        <option value="Grade C">Grade C (Fair Average Quality - FAQ)</option>
                        <option value="Reject">Reject (Substandard / Defective)</option>
                      </select>
                    </label>

                    <label>
                      Moisture Content (%)
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="e.g. 11.5 (ideal < 12%)"
                        value={form.moisture}
                        onChange={(e) => update("moisture", e.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Foreign Matter (%)
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="e.g. 0.5 (max 1.5%)"
                        value={form.foreignMatter}
                        onChange={(e) => update("foreignMatter", e.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Damaged / Discolored Grain (%)
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="e.g. 1.0 (max 2.0%)"
                        value={form.damagedPercentage}
                        onChange={(e) => update("damagedPercentage", e.target.value)}
                        required
                      />
                    </label>
                  </div>

                  <label style={{ display: "block", marginTop: "10px" }}>
                    Defects or Infestation
                    <input
                      type="text"
                      placeholder="e.g. None, slight weevil infestation, broken kernels..."
                      value={form.defects}
                      onChange={(e) => update("defects", e.target.value)}
                    />
                  </label>

                  <label style={{ display: "block", marginTop: "10px" }}>
                    Lab Inspection Notes & Recommendations
                    <textarea
                      rows="2"
                      placeholder="Testing equipment used, remarks for buyers and storage guidelines..."
                      value={form.inspectionNotes}
                      onChange={(e) => update("inspectionNotes", e.target.value)}
                    />
                  </label>

                  <label style={{ display: "block", marginTop: "10px" }}>
                    Grain Sample Digital Photo (Optional)
                    <input type="file" accept="image/*" onChange={image} style={{ marginTop: "4px" }} />
                  </label>

                  {form.grainImage && (
                    <div style={{ marginTop: "8px" }}>
                      <small style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}>Sample Preview:</small>
                      <img
                        className="grain-preview"
                        src={form.grainImage}
                        alt="Grain sample preview"
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                    <button
                      type="submit"
                      className="primary"
                      disabled={submitting}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      {submitting ? "Publishing Certificate..." : "✓ Verify & Issue Quality Certificate"}
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        border: "1px solid #f87171",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      onClick={() => submitInspection("REJECTED")}
                    >
                      ✕ Reject Sample
                    </button>

                    <button
                      type="button"
                      onClick={() => { setSelected(null); setRetesting(false); }}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-secondary)" }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔬</div>
                  <h4 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>Select a sample to inspect</h4>
                  <p style={{ margin: 0, fontSize: "13px" }}>
                    Click any lot awaiting testing from the queue on the left to record moisture, foreign matter, and grade certifications.
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default InspectionPage;

