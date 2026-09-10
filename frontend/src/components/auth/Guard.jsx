import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth, getDashboardPath } from "../../context/AuthContext.jsx";
import Shell from "../layout/Shell.jsx";

export function Guard({ children }) {
  const { user, ready } = useAuth();
  const { r } = useParams();

  if (ready && user && r && r.toUpperCase().replaceAll("-", "_") !== user.role) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  if (!ready) {
    return <div className="boot">Restoring your secure session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Shell>{children}</Shell>;
}

export default Guard;
