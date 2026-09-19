import React from "react";
import { ShieldCheck, Clock, AlertCircle, Leaf } from "lucide-react";

/**
 * OrganicBadge:
 * Visually distinct badge for farming type and organic certification statuses:
 * - 🌱 Certified Organic ✓ (Green, verified certification)
 * - 🟡 Organic Verification Pending (Amber, awaiting review)
 * - ⚪ Organic – Not Verified (Gray, unverified claim)
 * - In-Conversion (Teal / Light Green)
 */
export function OrganicBadge({
  farmingType = "conventional",
  organicCertificationStatus = "not_verified",
  certificationType = "",
  compact = false,
  showConventional = false,
}) {
  const normType = String(farmingType || "conventional").toLowerCase();
  const normStatus = String(organicCertificationStatus || "not_verified").toLowerCase();

  if (normType === "conventional") {
    if (!showConventional) return null;
    return (
      <span className={`organic-badge conventional ${compact ? "compact" : ""}`}>
        <span className="badge-icon">🌾</span>
        <span className="badge-text">Conventional</span>
      </span>
    );
  }

  if (normType === "in_conversion") {
    return (
      <span className={`organic-badge in-conversion ${compact ? "compact" : ""}`} title="In-Conversion to Certified Organic (Year 1-3 transition)">
        <Leaf size={compact ? 12 : 14} className="badge-icon" />
        <span className="badge-text">🌱 In-Conversion</span>
      </span>
    );
  }

  if (normType === "organic") {
    if (normStatus === "verified") {
      return (
        <span className={`organic-badge certified-organic ${compact ? "compact" : ""}`} title={`Certified Organic verified under ${certificationType || "PGS-India / NPOP"}`}>
          <span className="badge-icon">🌱</span>
          <span className="badge-text">
            <b>Certified Organic ✓</b>
            {certificationType && <small className="cert-type-tag"> {certificationType}</small>}
          </span>
        </span>
      );
    }

    if (normStatus === "pending") {
      return (
        <span className={`organic-badge organic-pending ${compact ? "compact" : ""}`} title="Organic verification document submitted and under KVK review">
          <Clock size={compact ? 12 : 14} className="badge-icon" />
          <span className="badge-text">🟡 Organic Verification Pending</span>
        </span>
      );
    }

    // Unverified organic claim
    return (
      <span className={`organic-badge organic-unverified ${compact ? "compact" : ""}`} title="Organic claimed by farmer but not certified or verified">
        <AlertCircle size={compact ? 12 : 14} className="badge-icon" />
        <span className="badge-text">⚪ Organic – Not Verified</span>
      </span>
    );
  }

  return null;
}

export default OrganicBadge;
