import React from "react";

export function StatusBadge({ children }) {
  return <b className="status">{children}</b>;
}

export const S = StatusBadge;
export default StatusBadge;
