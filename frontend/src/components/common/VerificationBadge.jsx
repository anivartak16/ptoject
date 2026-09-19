import React from "react";

/**
 * VerificationBadge renders visually distinct statuses:
 * - Verified ✓
 * - Verification Pending ⏳
 * - Unverified ⚠️
 *
 * It also supports showing "KYC Verified" or masked Aadhaar.
 */
export function VerificationBadge({
  status = "UNVERIFIED",
  kycVerified = false,
  showKyc = true,
  size = "md",
  className = "",
  style = {},
}) {
  const normStatus = String(status || "").toUpperCase();
  const isVerified = normStatus === "VERIFIED" || kycVerified;
  const isPending = normStatus === "PENDING" || normStatus === "PENDING_VERIFICATION";

  let badgeClass = "verification-badge";
  let label = "Unverified ⚠️";
  let icon = "⚠️";

  if (isVerified) {
    badgeClass += " verified";
    label = "Verified ✓";
    icon = "✓";
  } else if (isPending) {
    badgeClass += " pending";
    label = "Verification Pending ⏳";
    icon = "⏳";
  } else {
    badgeClass += " unverified";
    label = "Unverified ⚠️";
    icon = "⚠️";
  }

  if (size === "sm") badgeClass += " badge-sm";
  if (size === "lg") badgeClass += " badge-lg";

  return (
    <div className={`verification-badge-container ${className}`} style={style}>
      <span className={badgeClass} title={`Status: ${label}`}>
        <span className="badge-icon">{icon}</span>
        <span className="badge-label">{label}</span>
      </span>

      {showKyc && isVerified && (
        <span className="kyc-verified-tag" title="Aadhaar KYC Verified">
          KYC Verified ✓
        </span>
      )}
    </div>
  );
}

export default VerificationBadge;
