
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

  useEffect(() => {
    if (reg) {
      setF((x) => ({ ...x, role: selectedRole }));
    }
  }, [reg, selectedRole]);

  // Automatically detect user's location during registration
  useEffect(() => {
    if (!reg) return;

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setErr("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus("detecting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setF((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        setLocationStatus("success");
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
      setErr("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus("detecting");
    setErr("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setF((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        setLocationStatus("success");
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

    if (
      reg &&
      (f.latitude === "" ||
        f.longitude === "" ||
        f.latitude === null ||
        f.longitude === null)
    ) {
      setErr(
        "Location is required. Please allow location access and try again."
      );
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

        <h3>Location</h3>

        <div className="location-box">
          {locationStatus === "detecting" && (
            <p>📍 Detecting your location...</p>
          )}

          {locationStatus === "success" && (
            <p>
              ✅ Location detected successfully
              <br />
              <small>
                Latitude: {Number(f.latitude).toFixed(6)} | Longitude:{" "}
                {Number(f.longitude).toFixed(6)}
              </small>
            </p>
          )}

          {locationStatus === "denied" && (
            <div>
              <p>⚠️ Location permission was denied.</p>

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
            <div>
              <p>⚠️ Unable to detect your location.</p>

              <button
                type="button"
                onClick={detectLocation}
                className="secondary"
              >
                Detect Location
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
