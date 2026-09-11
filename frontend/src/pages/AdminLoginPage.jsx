import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../landing.css";
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../api/client.js";
import { useAuth, getDashboardPath } from "../context/AuthContext.jsx";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, ready, setUser } = useAuth();

  useEffect(() => {
    if (ready && user) {
      navigate(getDashboardPath(user.role || "ADMIN"), { replace: true });
    }
  }, [ready, user, navigate]);

  const [email, setEmail] = useState("admin@krishilink.com");
  const [password, setPassword] = useState("Demo@12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      localStorage.token = token;
      setUser(user);
      navigate(getDashboardPath(user.role || "ADMIN"), { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid administrator credentials. Please check email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@krishilink.com");
    setPassword("Demo@12345");
    setError("");
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Back to Home Link */}
        <Link to="/" className="admin-back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        {/* Header Icon and Title */}
        <div className="admin-login-header">
          <div className="admin-badge-icon">
            <Shield size={26} />
          </div>
          <h2>Admin Portal</h2>
          <p>Sign in to manage mandis, users, verification, and market operations</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="admin-error-box">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-email">Admin Email</label>
            <div className="admin-input-wrapper">
              <Mail size={17} className="admin-input-icon" />
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@krishilink.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-input-wrapper">
              <Lock size={17} className="admin-input-icon" />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-submit-btn"
          >
            <span>{loading ? "Verifying..." : "Sign In to Admin Console"}</span>
            <ArrowRight size={17} />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="admin-demo-box">
          <div className="admin-demo-header">
            <CheckCircle2 size={15} />
            <span>Demo Admin Credentials</span>
          </div>
          <p>
            Email: <code>admin@krishilink.com</code>
            <br />
            Password: <code>Demo@12345</code>
          </p>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="admin-fill-btn"
          >
            Fill Demo Credentials
          </button>
        </div>

        <div className="admin-footer-links">
          <span>Need regular access?</span>
          <Link to="/login">User Login</Link>
          <span>·</span>
          <Link to="/register/farmer">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
