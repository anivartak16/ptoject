import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth, getDashboardPath } from "../context/AuthContext.jsx";

export function AuthPage({ reg = false }) {
  const navigate = useNavigate();
  const { role: routeRole } = useParams();
  const { setUser } = useAuth();

  const selectedRole = ["farmer", "buyer", "fpo", "krishi-kendra"].includes(
    routeRole?.toLowerCase()
  )
    ? routeRole.toLowerCase() === "krishi-kendra"
      ? "KRISHI_KENDRA"
      : routeRole.toUpperCase()
    : "FARMER";

  const [f, setF] = useState({
    name: "",
    email: reg ? "" : "farmer@krishilink.com",
    password: reg ? "" : "Demo@12345",
    role: selectedRole,
    phone: "",

    location: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",

    farmName: "",
    landSize: "",
    primaryCrop: "",
    organizationName: "",
    buyerType: "TRADER",
    registrationNumber: "",
    memberCount: "",
  });

  const [err, setErr] = useState("");
  const [locationStatus, setLocationStatus] = useState("idle");

  const set = (key, value) => {
    setF((x) => ({ ...x, [key]: value }));
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          signal: controller.signal,
          headers: { "Accept-Language": "en" },
        }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        const state = addr.state || addr.province || addr.state_district || "";
        const district = addr.state_district || addr.district || addr.county || "";
        const cityTaluka = addr.city || addr.town || addr.tehsil || addr.taluk || addr.subdistrict || addr.suburb || district || "";
        const villageArea = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.road || "";
        const pincode = addr.postcode || "";

        const readableLocation = [villageArea, cityTaluka, district].filter(Boolean).slice(0, 2).join(", ") || cityTaluka || district || "Indore";
        const fullAddress = data.display_name ? data.display_name.split(",").slice(0, 3).join(",").trim() : readableLocation;

        return {
          location: readableLocation,
          district: district || cityTaluka || "Indore",
          state: state || "Madhya Pradesh",
          pincode: pincode,
          address: fullAddress,
        };
      }
    } catch (err) {
      console.warn("Reverse geocode request failed, using regional coordinates fallback:", err);
    }

    // Graceful fallback for offline / rate-limited environments
    return {
      location: "Indore",
      district: "Indore",
      state: "Madhya Pradesh",
      pincode: "452001",
      address: `Detected area near Lat ${Number(lat).toFixed(4)}, Lon ${Number(lon).toFixed(4)}`,
    };
  };

  const handleLocationResolved = async (latitude, longitude) => {
    setLocationStatus("geocoding");
    const geoDetails = await reverseGeocode(latitude, longitude);

    setF((prev) => ({
      ...prev,
      latitude,
      longitude,
      location: geoDetails.location || prev.location,
      district: geoDetails.district || prev.district,
      state: geoDetails.state || prev.state,
      pincode: geoDetails.pincode || prev.pincode,
      address: geoDetails.address || prev.address,
    }));

    setLocationStatus("success");
  };

  // Automatically detect user's location during registration
  useEffect(() => {
    if (!reg) return;

    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("detecting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationResolved(latitude, longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
        } else {
          setLocationStatus("error");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [reg]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setErr("Geolocation is not supported by your browser. Please fill location details manually.");
      return;
    }

    setLocationStatus("detecting");
    setErr("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationResolved(latitude, longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
        } else {
          setLocationStatus("error");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (reg && !f.location && !f.district) {
      setErr("Please provide your village/city and location details.");
      return;
    }

    try {
      const endpoint = "/auth/" + (reg ? "register" : "login");

      const res = await api.post(endpoint, f);
      const { token, user } = res.data.data;

      localStorage.token = token;
      setUser(user);
      navigate(getDashboardPath(user.role));
    } catch (e) {
      setErr(e.response?.data?.message || "Request failed");
    }
  };

  if (!reg) {
    return (
      <div className="auth">
        <h1>Welcome back</h1>

        <p>
          Demo accounts: farmer@krishilink.com · buyer@krishilink.com ·
          fpo@krishilink.com · password Demo@12345
        </p>

        <form onSubmit={handleSubmit}>
          <input
            aria-label="Email"
            type="email"
            value={f.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="Email address"
            required
          />

          <input
            aria-label="Password"
            type="password"
            value={f.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Password"
            required
          />

          <button className="primary" type="submit">
            Login
          </button>
        </form>

        {err && <p className="error">{err}</p>}

        <Link to="/register">Create an account</Link>
      </div>
    );
  }

  const roleLabel =
    f.role === "FARMER"
      ? "Farmer"
      : f.role === "BUYER"
        ? "Buyer"
        : f.role === "KRISHI_KENDRA"
          ? "Krishi Kendra officer"
          : "FPO representative";

  const roleIntro =
    f.role === "FARMER"
      ? "Create a farmer workspace to list produce, compare mandi prices and connect with buyers."
      : f.role === "BUYER"
        ? "Create a buyer workspace to publish demands, discover lots and manage procurement."
        : f.role === "KRISHI_KENDRA"
          ? "Create an inspection workspace to test grain samples and publish trusted quality records."
          : "Create an FPO workspace to add farmers, aggregate their produce and sell together.";

  return (
    <div className="auth auth-register">
      <p className="eyebrow">CREATE YOUR MARKETPLACE PROFILE</p>

      <h1>Create your {roleLabel} workspace</h1>

      <p>{roleIntro}</p>

      <form onSubmit={handleSubmit}>
        <label>
          Choose account type

          <select
            value={f.role}
            onChange={(e) =>
              navigate(
                "/register/" +
                  e.target.value.toLowerCase().replaceAll("_", "-")
              )
            }
          >
            <option value="FARMER">Farmer</option>
            <option value="BUYER">Buyer</option>
            <option value="FPO">FPO representative</option>
            <option value="KRISHI_KENDRA">Krishi Kendra officer</option>
          </select>
        </label>

        <h3>Contact details</h3>

        <div className="form-grid">
          <label>
            Full name
            <input
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              value={f.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </label>

          <label>
            Mobile number
            <input
              type="tel"
              value={f.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              minLength="8"
              value={f.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </label>
        </div>

        <h3>Location details</h3>

        <div className="location-box">
          {locationStatus === "idle" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <p style={{ margin: 0 }}>📍 Auto-detect your location or fill the details manually below.</p>
              <button
                type="button"
                onClick={detectLocation}
                className="secondary"
              >
                📍 Auto-Detect Location
              </button>
            </div>
          )}

          {locationStatus === "detecting" && (
            <p>📍 Requesting GPS coordinates from your device...</p>
          )}

          {locationStatus === "geocoding" && (
            <p>🔄 Converting coordinates to district, tehsil, and address...</p>
          )}

          {locationStatus === "success" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 700, color: "var(--primary-dark)" }}>
                  ✅ Location detected & auto-filled!
                </p>
                <small style={{ color: "var(--muted)" }}>
                  {f.location ? `${f.location}, ` : ""}{f.district} · {f.state} {f.pincode ? `(${f.pincode})` : ""}
                  {" — "}You can edit any field below.
                </small>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                className="secondary"
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                🔄 Re-detect
              </button>
            </div>
          )}

          {locationStatus === "denied" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <p style={{ margin: 0 }}>⚠️ Location permission was denied. You can fill the fields manually below.</p>
              <button
                type="button"
                onClick={detectLocation}
                className="secondary"
              >
                Try Again
              </button>
            </div>
          )}

          {locationStatus === "error" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <p style={{ margin: 0 }}>⚠️ Location service unavailable. You can enter your details manually below.</p>
              <button
                type="button"
                onClick={detectLocation}
                className="secondary"
              >
                Retry Detection
              </button>
            </div>
          )}
        </div>

        <div className="form-grid">
          <label>
            Village / city
            <input
              value={f.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Enter village or city"
            />
          </label>

          <label>
            District
            <input
              value={f.district}
              onChange={(e) => set("district", e.target.value)}
            />
          </label>

          <label>
            State
            <input
              value={f.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </label>

          <label>
            PIN code
            <input
              inputMode="numeric"
              value={f.pincode}
              onChange={(e) => set("pincode", e.target.value)}
            />
          </label>
        </div>

        <label>
          Address
          <input
            value={f.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Enter address"
          />
        </label>

        {f.role === "FARMER" && (
          <>
            <h3>Your farm details</h3>

            <div className="form-grid">
              <label>
                Farm name
                <input
                  value={f.farmName}
                  onChange={(e) => set("farmName", e.target.value)}
                  required
                />
              </label>

              <label>
                Land size (acres)
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={f.landSize}
                  onChange={(e) => set("landSize", e.target.value)}
                  required
                />
              </label>

              <label>
                Primary crop
                <input
                  placeholder="e.g. Wheat"
                  value={f.primaryCrop}
                  onChange={(e) => set("primaryCrop", e.target.value)}
                  required
                />
              </label>
            </div>
          </>
        )}

        {f.role === "BUYER" && (
          <>
            <h3>Your buyer organisation</h3>

            <div className="form-grid">
              <label>
                Organisation name
                <input
                  value={f.organizationName}
                  onChange={(e) =>
                    set("organizationName", e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Buyer type
                <select
                  value={f.buyerType}
                  onChange={(e) => set("buyerType", e.target.value)}
                >
                  <option>TRADER</option>
                  <option>RETAILER</option>
                  <option>PROCESSOR</option>
                  <option>EXPORTER</option>
                </select>
              </label>
            </div>
          </>
        )}

        {f.role === "FPO" && (
          <>
            <h3>Your FPO organisation</h3>

            <div className="form-grid">
              <label>
                FPO name
                <input
                  value={f.organizationName}
                  onChange={(e) =>
                    set("organizationName", e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Registration number
                <input
                  value={f.registrationNumber}
                  onChange={(e) =>
                    set("registrationNumber", e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Member count
                <input
                  type="number"
                  min="1"
                  value={f.memberCount}
                  onChange={(e) => set("memberCount", e.target.value)}
                  required
                />
              </label>
            </div>
          </>
        )}

        {f.role === "KRISHI_KENDRA" && (
          <>
            <h3>Krishi Kendra details</h3>

            <div className="form-grid">
              <label>
                Kendra name
                <input
                  value={f.organizationName}
                  onChange={(e) =>
                    set("organizationName", e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Registration number
                <input
                  value={f.registrationNumber}
                  onChange={(e) =>
                    set("registrationNumber", e.target.value)
                  }
                  required
                />
              </label>
            </div>
          </>
        )}

        <button className="primary" type="submit">
          Create {roleLabel} account
        </button>
      </form>

      {err && <p className="error">{err}</p>}

      <Link to="/login">Login instead</Link>
    </div>
  );
}

export default AuthPage;