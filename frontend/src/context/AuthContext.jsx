import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

export const AuthContext = createContext(null);

export const getDashboardPath = (role) =>
  "/" + (role || "").toLowerCase().replaceAll("_", "-") + "/dashboard";

export const path = getDashboardPath;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        if (localStorage.token) {
          const res = await api.get("/auth/me");
          setUser(res.data.data);
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        setReady(true);
      }
    };
    restoreSession();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        ready,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const useA = useAuth;
export default AuthContext;
