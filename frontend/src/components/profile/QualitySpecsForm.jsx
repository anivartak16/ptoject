import React from "react";
import {
  CROP_QUALITY_CONFIG,
  DEFAULT_CROP_CONFIG,
  getCropConfig,
  validateQualitySpecs,
  formatQualityRequirements,
} from "./qualityConfig.js";

export {
  CROP_QUALITY_CONFIG,
  DEFAULT_CROP_CONFIG,
  getCropConfig,
  validateQualitySpecs,
  formatQualityRequirements,
};

/**
 * QualitySpecsForm Component:
 * Clean, crop-specific, validated form replacing the free-text input.
 */
export function QualitySpecsForm({
  selectedCrop,
  onCropChange,
  availableCrops = [],
  specs,
  onChange,
  errors = {},
  getLabel = (en) => en,
}) {
  const currentConfig = getCropConfig(selectedCrop);

  const handleFieldChange = (fieldKey, value) => {
    onChange({
      ...specs,
      [fieldKey]: value,
    });
  };

  const handleNumericChange = (fieldKey, value, fieldConfig) => {
    // Reject non-numeric characters (allow decimal point)
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }
    handleFieldChange(fieldKey, value);
  };

  const cropList = Array.from(
    new Set([
      ...availableCrops,
      "Wheat",
      "Rice",
      "Soybean",
      "Maize",
      "Onion",
      "Tomato",
      "Cotton",
      "Gram",
    ])
  ).filter(Boolean);

  const formattedSummary = formatQualityRequirements(specs, selectedCrop);

  return (
    <div className="quality-specs-section">
      <div className="quality-specs-header">
        <div className="header-badge-row">
          <span className="quality-kicker-badge">
            {getLabel("STRUCTURED QUALITY SPECIFICATIONS", "मानकीकृत गुणवत्ता मानदंड", "प्रमाणित गुणवत्ता निकष")}
          </span>
          <span className="protocol-badge">e-NAM / Agmarknet Standard</span>
        </div>
        <p className="quality-subtitle">
          {getLabel(
            "Select your procurement commodity to configure verified crop-specific quality parameters. These parameters are directly used by the AI matching engine to pair you with certified farmers and FPOs.",
            "सत्यापित फसल-विशिष्ट गुणवत्ता मानकों को कॉन्फ़िगर करने के लिए अपनी खरीद फसल चुनें। इन मापदंडों का उपयोग किसानों और एफपीओ से मिलान के लिए किया जाता है।",
            "प्रमाणित शेतमाल दर्जा निकष निश्चित करण्यासाठी खरेदी पीक निवडा. हे निकष थेट शेतकरी आणि एफपीओ जुळवणीसाठी वापरले जातात."
          )}
        </p>
      </div>

      {/* CROP SELECTOR */}
      <div className="crop-selector-bar">
        <label className="crop-select-label">
          <span>{getLabel("Configure Quality for Crop:", "फसल के लिए गुणवत्ता निर्धारित करें:", "पिकासाठी गुणवत्ता निकष:")}</span>
          <select
            value={selectedCrop}
            onChange={(e) => onCropChange(e.target.value)}
            className="crop-dropdown-select"
          >
            {cropList.map((c) => (
              <option key={c} value={c}>
                {CROP_QUALITY_CONFIG[c]?.label || c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* FORM GRID */}
      <div className="quality-form-grid">
        {/* 1. Quality Grade (Predefined Dropdown) */}
        <div className="quality-field-group">
          <label className="field-label">
            <span>{getLabel("Quality Grade", "गुणवत्ता श्रेणी", "दर्जा श्रेणी")} *</span>
          </label>
          <select
            value={specs.grade || ""}
            onChange={(e) => handleFieldChange("grade", e.target.value)}
            className={`quality-input-select ${errors.grade ? "input-has-error" : ""}`}
            required
          >
            <option value="">-- {getLabel("Select Grade", "ग्रेड चुनें", "ग्रेड निवडा")} --</option>
            {currentConfig.grades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {errors.grade && <span className="error-message-text">⚠ {errors.grade}</span>}
        </div>

        {/* 2. Variety (Predefined Dropdown) */}
        <div className="quality-field-group">
          <label className="field-label">
            <span>{getLabel("Crop Variety", "फसल किस्म", "पिकाची जात")} *</span>
          </label>
          <select
            value={specs.variety || ""}
            onChange={(e) => handleFieldChange("variety", e.target.value)}
            className={`quality-input-select ${errors.variety ? "input-has-error" : ""}`}
            required
          >
            <option value="">-- {getLabel("Select Variety", "किस्म चुनें", "जात निवडा")} --</option>
            {currentConfig.varieties.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          {errors.variety && <span className="error-message-text">⚠ {errors.variety}</span>}
        </div>

        {/* 3. Colour / Appearance (Predefined Dropdown) */}
        <div className="quality-field-group">
          <label className="field-label">
            <span>{getLabel("Colour & Appearance", "रंग व रूप", "रंग आणि स्वरूप")}</span>
          </label>
          <select
            value={specs.colorAppearance || ""}
            onChange={(e) => handleFieldChange("colorAppearance", e.target.value)}
            className="quality-input-select"
          >
            <option value="">-- {getLabel("Standard / Any Appearance", "सामान्य / कोई भी रूप", "सामान्य / कोणतेही")} --</option>
            {currentConfig.colors.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Grain Size / Type (Predefined Dropdown) */}
        <div className="quality-field-group">
          <label className="field-label">
            <span>{getLabel("Grain / Produce Size", "दाना आकार / प्रकार", "दाण्याचा आकार / प्रकार")}</span>
          </label>
          <select
            value={specs.sizeType || ""}
            onChange={(e) => handleFieldChange("sizeType", e.target.value)}
            className="quality-input-select"
          >
            <option value="">-- {getLabel("Standard / Any Size", "सामान्य / कोई भी आकार", "सामान्य / कोणताही आकार")} --</option>
            {currentConfig.sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* 5. CROP-SPECIFIC MEASURABLE PARAMETERS */}
        {currentConfig.measurable.map((param) => (
          <div className="quality-field-group" key={param.key}>
            <label className="field-label">
              <span>{param.label} {param.required ? "*" : ""}</span>
              <small className="field-param-range">
                ({param.min}{param.unit} - {param.max}{param.unit})
              </small>
            </label>
            <div className="input-with-unit-wrapper">
              <input
                type="text"
                inputMode="decimal"
                value={specs[param.key] ?? ""}
                onChange={(e) => handleNumericChange(param.key, e.target.value, param)}
                placeholder={`e.g. ${param.default}`}
                className={`quality-num-input ${errors[param.key] ? "input-has-error" : ""}`}
                required={param.required}
              />
              <span className="unit-pill-badge">{param.unit}</span>
            </div>
            {errors[param.key] ? (
              <span className="error-message-text">⚠ {errors[param.key]}</span>
            ) : (
              <span className="field-helper-hint">{param.help}</span>
            )}
          </div>
        ))}

        {/* 6. OPTIONAL OTHER REQUIREMENTS */}
        <div className="quality-field-group full-width">
          <div className="other-req-header">
            <label className="field-label">
              <span>{getLabel("Other Quality / Packaging Notes (Optional)", "अन्य गुणवत्ता/पैकेजिंग विवरण (वैकल्पिक)", "इतर गुणवत्ता / पॅकेजिंग नोंदी (पर्यायी)")}</span>
            </label>
            <span className="char-count-text">
              {200 - (specs.otherRequirements?.length || 0)} {getLabel("chars left", "अक्षर शेष", "अक्षरे शिल्लक")}
            </span>
          </div>
          <textarea
            value={specs.otherRequirements || ""}
            onChange={(e) => {
              if (e.target.value.length <= 200) {
                handleFieldChange("otherRequirements", e.target.value);
              }
            }}
            placeholder="e.g. 50kg HDPE gunny bags required, machine-cleaned, moisture meter lab certificate required upon dispatch."
            rows={2}
            className={`quality-notes-textarea ${errors.otherRequirements ? "input-has-error" : ""}`}
          />
          {errors.otherRequirements && (
            <span className="error-message-text">⚠ {errors.otherRequirements}</span>
          )}
          <small className="field-helper-hint">
            {getLabel(
              "Note: Do not enter core specifications here. Use this strictly for packing, bag type, or certification requests.",
              "नोट: मुख्य विनिर्देश यहाँ न लिखें। इसका उपयोग केवल पैकिंग व प्रमाणन के लिए करें।",
              "टीप: मुख्य गुणवत्ता निकष येथे लिहू नका. याचा वापर फक्त पॅकिंग व प्रमाणपत्रासाठी करा."
            )}
          </small>
        </div>
      </div>

      {/* LIVE SPECIFICATION SUMMARY CARD */}
      <div className="standardized-preview-card">
        <div className="preview-card-header">
          <span className="preview-title">
            📋 {getLabel("Compiled Specification Preview", "मानकीकृत विवरण पूर्वावलोकन", "प्रमाणित गुणवत्ता तपशील पूर्वावलोकन")}
          </span>
          <span className="status-tag active">
            ✓ {getLabel("Standardized & Machine-Comparable", "मानकीकृत एवं तुलनीय", "मानकीकृत व तुलनायोग्य")}
          </span>
        </div>
        <p className="preview-content-string">{formattedSummary}</p>
        <div className="preview-tags-row">
          <span className="badge-chip">🌾 {selectedCrop}</span>
          {specs.grade && <span className="badge-chip">🏷️ {specs.grade}</span>}
          {specs.variety && <span className="badge-chip">🌱 {specs.variety}</span>}
          {specs.moisturePercent && (
            <span className="badge-chip">💧 Moisture ≤ {specs.moisturePercent}%</span>
          )}
          {specs.foreignMatterPercent && (
            <span className="badge-chip">🍂 Foreign Matter ≤ {specs.foreignMatterPercent}%</span>
          )}
          {specs.damagedGrainsPercent && (
            <span className="badge-chip">⚠️ Damaged ≤ {specs.damagedGrainsPercent}%</span>
          )}
        </div>
      </div>
    </div>
  );
}
