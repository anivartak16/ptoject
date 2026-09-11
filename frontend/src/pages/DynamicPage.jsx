import React from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Card } from "../components/common/Card.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { MatchesPage } from "./MatchesPage.jsx";
import { FpoAggregationPage } from "./FpoAggregationPage.jsx";

export function DynamicPage() {
  const { misc, r } = useParams();
  const { user } = useAuth();

  const [profileMsg, setProfileMsg] = React.useState("");
  const [profileErr, setProfileErr] = React.useState("");
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [kvkForm, setKvkForm] = React.useState({
    name: user?.name || "",
    phone: user?.phone || "",
    organizationName: user?.organizationName || "",
    registrationNumber: user?.registrationNumber || "",
    location: user?.location || "",
    district: user?.district || "",
    state: user?.state || "",
    address: user?.address || "",
  });

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    setProfileErr("");
    try {
      const res = await api.put("/auth/profile", kvkForm);
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      setProfileErr(err.response?.data?.message || "Could not update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  if (misc === "profile") {
    if (user?.role === "KRISHI_KENDRA") {
      return (
        <section>
          <p className="eyebrow">ACCREDITED TESTING AUTHORITY</p>
          <h1>Krishi Vigyan Kendra Profile</h1>
          <p style={{ color: "var(--ink-secondary)", marginBottom: "20px" }}>
            Official district center responsible for quality grading, lab moisture testing, and digital marketplace certification.
          </p>

          {profileMsg && <div className="form-message success" style={{ marginBottom: "16px" }}>{profileMsg}</div>}
          {profileErr && <div className="form-message error" style={{ marginBottom: "16px" }}>{profileErr}</div>}

          <div className="two-col" style={{ alignItems: "flex-start" }}>
            <div className="panel">
              <div className="kvk-badge-center" style={{ marginBottom: "12px" }}>
                🏛 ICAR ACCREDITED TESTING CENTER
              </div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "20px" }}>
                {user?.organizationName || "Krishi Vigyan Kendra Center"}
              </h2>
              <p style={{ color: "var(--ink-secondary)", fontSize: "13px", margin: "0 0 16px 0" }}>
                Accreditation Code: <b>{user?.registrationNumber || "ICAR-KVK-CENTRAL"}</b>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                <div>
                  <b>Verification Officer:</b> {user?.name}
                </div>
                <div>
                  <b>Official Email:</b> {user?.email}
                </div>
                <div>
                  <b>Contact Phone:</b> {user?.phone || "Not configured"}
                </div>
                <div>
                  <b>Jurisdiction:</b> 📍 {user?.district || "District"}, {user?.state || "State"}
                </div>
                <div>
                  <b>Lab Location:</b> {user?.address || user?.location || "Central Agriculture Complex"}
                </div>
              </div>

              <div style={{ marginTop: "18px", padding: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
                <strong style={{ color: "#166534", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  🧪 Laboratory Capabilities
                </strong>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#166534", lineHeight: "1.6" }}>
                  <li>Digital grain moisture determination (Standard ISO 712)</li>
                  <li>Foreign matter & organic dockage analysis</li>
                  <li>Damaged, weeviled & broken kernel scoring</li>
                  <li>Official cryptographic digital quality certificate issuance</li>
                </ul>
              </div>

              <div style={{ marginTop: "16px" }}>
                <Link className="primary" to={`/${r}/inspections`} style={{ display: "inline-block", textDecoration: "none" }}>
                  Open Inspection Desk →
                </Link>
              </div>
            </div>

            <form className="form-card" onSubmit={saveProfile}>
              <h3>Update Center Details</h3>
              <div className="form-grid">
                <label>
                  Kendra / Center Name
                  <input
                    value={kvkForm.organizationName}
                    onChange={(e) => setKvkForm({ ...kvkForm, organizationName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Registration / Code
                  <input
                    value={kvkForm.registrationNumber}
                    onChange={(e) => setKvkForm({ ...kvkForm, registrationNumber: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Officer In-Charge Name
                  <input
                    value={kvkForm.name}
                    onChange={(e) => setKvkForm({ ...kvkForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Official Phone
                  <input
                    value={kvkForm.phone}
                    onChange={(e) => setKvkForm({ ...kvkForm, phone: e.target.value })}
                    required
                  />
                </label>
                <label>
                  District
                  <input
                    value={kvkForm.district}
                    onChange={(e) => setKvkForm({ ...kvkForm, district: e.target.value })}
                    required
                  />
                </label>
                <label>
                  State
                  <input
                    value={kvkForm.state}
                    onChange={(e) => setKvkForm({ ...kvkForm, state: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label style={{ display: "block", marginTop: "10px" }}>
                Lab Center Address
                <textarea
                  rows="2"
                  value={kvkForm.address}
                  onChange={(e) => setKvkForm({ ...kvkForm, address: e.target.value })}
                />
              </label>
              <button className="primary" type="submit" disabled={profileSaving} style={{ marginTop: "14px" }}>
                {profileSaving ? "Saving..." : "Save Center Profile"}
              </button>
            </form>
          </div>
        </section>
      );
    }

    return (
      <section>
        <p className="eyebrow">ACCOUNT</p>
        <h1>My profile</h1>
        <div className="two-col">
          <div className="panel">
            <h3>{user?.name}</h3>
            <p>
              <b>Role:</b> {user?.role}
            </p>
            <p>
              <b>Email:</b> {user?.email}
            </p>
            <p>
              <b>Location:</b> {user?.location || "Not provided"}
            </p>
            <StatusBadge>{user?.verification || "VERIFIED"}</StatusBadge>
          </div>
          <div className="panel">
            <h3>Trust status</h3>
            <p>
              Your verified profile helps buyers and partners make confident
              decisions.
            </p>
            <Link className="primary" to={"/" + r + "/notifications"}>
              View notifications
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (misc === "farm") {
    return (
      <section>
        <p className="eyebrow">FARM MANAGEMENT</p>
        <h1>My farm</h1>
        <div className="grid">
          <Card
            a="PRIMARY LOCATION"
            b={user?.location || "Indore"}
            c="Update through your profile"
          />
          <Card a="ACTIVE PRODUCE" b="Wheat" c="Grade A quality records" />
          <Card
            a="AVAILABLE LOTS"
            b="View lots"
            c="Create and manage inventory"
          />
        </div>
        <div className="panel">
          <h3>Farm inventory</h3>
          <p>
            Lot quantity, harvest date, quality and availability are managed
            from My Lots so every buyer sees consistent information.
          </p>
          <Link className="primary" to={"/" + r + "/lots"}>
            Manage farm lots
          </Link>
        </div>
      </section>
    );
  }

  if (misc === "recommendations" || misc === "matching") {
    return <MatchesPage />;
  }

  if (misc === "farmers") {
    return <FpoAggregationPage />;
  }

  return (
    <section>
      <p className="eyebrow">WORKSPACE</p>
      <h1>{misc ? misc.replaceAll("-", " ") : "Workspace"}</h1>
      <div className="panel">
        <h3>This module is ready</h3>
        <p>
          Use the navigation to access the connected marketplace workflows:
          lots, demands, market prices, offers and transactions.
        </p>
        <Link className="primary" to={"/" + r + "/dashboard"}>
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}

export default DynamicPage;
