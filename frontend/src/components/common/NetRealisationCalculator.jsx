import React, { useState } from "react";
import { Calculator, ArrowDown, Wallet, Truck, Landmark, ShieldCheck } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export function NetRealisationCalculator({
  initialPrice = 26, // ₹ / kg
  initialQuantity = 1000, // kg
  initialDistance = 25, // km
  cropName = "Wheat",
  compact = false,
}) {
  const { t, getLabel } = useLanguage();
  const [pricePerKg, setPricePerKg] = useState(initialPrice);
  const [quantityKg, setQuantityKg] = useState(initialQuantity);
  const [distanceKm, setDistanceKm] = useState(initialDistance);
  const [storageDays, setStorageDays] = useState(0);

  const grossRevenue = (Number(pricePerKg) || 0) * (Number(quantityKg) || 0);
  const mandiCess = Math.round(grossRevenue * 0.015); // 1.5% APMC cess
  const transportCost = Math.round(
    (Number(distanceKm) || 0) * 0.08 * (Number(quantityKg) || 0)
  );
  const storageCost = Math.round((Number(storageDays) || 0) * 0.05 * (Number(quantityKg) || 0));
  const handlingCost = Math.round((Number(quantityKg) || 0) * 0.2); // ₹0.20/kg loading

  const totalDeductions = mandiCess + transportCost + storageCost + handlingCost;
  const netEarnings = Math.max(0, grossRevenue - totalDeductions);
  const netPerKg = quantityKg > 0 ? +(netEarnings / quantityKg).toFixed(2) : 0;
  const netPerQtl = Math.round(netPerKg * 100);

  if (compact) {
    return (
      <div className="net-realisation-chip">
        <div className="net-chip-main">
          <Wallet size={14} color="#16a34a" />
          <span>
            {t("netRealisation", "Net Realisation")}: <strong>₹{netPerKg}/kg</strong>{" "}
            <small>(₹{netPerQtl}/qtl)</small>
          </span>
        </div>
        <small className="net-chip-deduction">
          ₹{pricePerKg} gross - ₹{(pricePerKg - netPerKg).toFixed(2)} transport & mandi fees
        </small>
      </div>
    );
  }

  return (
    <div className="net-realisation-card animate-fadeIn">
      <div className="card-header-row">
        <div className="header-left">
          <div className="calc-icon-wrap">
            <Calculator size={20} color="#15803d" />
          </div>
          <div>
            <h3 className="calc-title">{t("netRealisation", "Net Realisation Calculator")}</h3>
            <p className="calc-subtitle">
              {t(
                "netRealisationSubtitle",
                "Actual take-home returns after transport, APMC mandi fees and handling deductions"
              )}
            </p>
          </div>
        </div>
        <div className="realisation-hero-stat">
          <span className="hero-label">{t("takeHomeIncome", "Actual Farmer Take-Home")}</span>
          <div className="hero-value">
            ₹{netEarnings.toLocaleString("en-IN")}
            <small> (₹{netPerKg}/kg · ₹{netPerQtl}/qtl)</small>
          </div>
        </div>
      </div>

      <div className="calc-inputs-grid">
        <label>
          {t("grossPrice", "Gross Mandi Rate (₹/kg)")}
          <input
            type="number"
            min="1"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
          />
        </label>
        <label>
          {getLabel("Produce Weight (kg)", "उपज मात्रा (किग्रा)", "शेतमाल वजन (किलो)")}
          <input
            type="number"
            min="1"
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
          />
        </label>
        <label>
          {getLabel("Transport Distance (km)", "मंडी दूरी (किमी)", "बाजार अंतर (किमी)")}
          <input
            type="number"
            min="0"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
          />
        </label>
        <label>
          {getLabel("Storage Duration (Days)", "गोदाम दिन (यदि लागू हो)", "गोदाम दिवस")}
          <input
            type="number"
            min="0"
            value={storageDays}
            onChange={(e) => setStorageDays(e.target.value)}
          />
        </label>
      </div>

      {/* Breakdown Visualization */}
      <div className="breakdown-container">
        <div className="breakdown-bar">
          <div
            className="bar-segment earnings"
            style={{ width: `${Math.max(10, Math.min(100, (netEarnings / (grossRevenue || 1)) * 100))}%` }}
            title={`Net Take-Home: ₹${netEarnings}`}
          />
          <div
            className="bar-segment transport"
            style={{ width: `${Math.min(40, (transportCost / (grossRevenue || 1)) * 100)}%` }}
            title={`Transport: ₹${transportCost}`}
          />
          <div
            className="bar-segment cess"
            style={{ width: `${Math.min(20, (mandiCess / (grossRevenue || 1)) * 100)}%` }}
            title={`Mandi Cess: ₹${mandiCess}`}
          />
        </div>

        <div className="breakdown-legend">
          <div className="legend-item">
            <span className="dot dot-green" />
            <span>
              <strong>₹{grossRevenue.toLocaleString("en-IN")}</strong> {t("grossPrice", "Gross Value")}
            </span>
          </div>
          <div className="legend-item deduction">
            <span className="dot dot-orange" />
            <span>
              <Truck size={12} style={{ display: "inline", marginRight: "2px" }} />
              Transport (-₹{transportCost.toLocaleString("en-IN")})
            </span>
          </div>
          <div className="legend-item deduction">
            <span className="dot dot-red" />
            <span>
              <Landmark size={12} style={{ display: "inline", marginRight: "2px" }} />
              Mandi Fee 1.5% (-₹{mandiCess.toLocaleString("en-IN")})
            </span>
          </div>
          {storageCost > 0 && (
            <div className="legend-item deduction">
              <span className="dot dot-amber" />
              <span>Storage (-₹{storageCost.toLocaleString("en-IN")})</span>
            </div>
          )}
          <div className="legend-item net-final">
            <span className="dot dot-emerald" />
            <span>
              <ShieldCheck size={12} style={{ display: "inline", marginRight: "2px" }} />
              <strong>₹{netEarnings.toLocaleString("en-IN")}</strong> {t("netRealisation", "Net Realisation")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetRealisationCalculator;
