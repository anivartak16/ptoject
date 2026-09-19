import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check, Search, Plus } from "lucide-react";

/**
 * Standard Indian Grain & Crop Varieties grouped by commodity.
 */
export const GRAIN_VARIETIES_CATALOG = [
  {
    group: "Wheat (गेहूं / गहू)",
    icon: "🌾",
    varieties: [
      "Wheat (Sharbati)",
      "Wheat (Lokwan)",
      "Wheat (Mill Quality / Tukdi)",
      "Wheat (Malavraj / Durum)",
      "Wheat (Desi / Khapli)",
      "Wheat (Sujata)",
      "Wheat (GW 322)",
      "Wheat (GW 496)",
    ],
  },
  {
    group: "Rice / Paddy (धान / तांदूळ)",
    icon: "🌾",
    varieties: [
      "Rice (Basmati 1121)",
      "Rice (Pusa Basmati)",
      "Rice (Sona Masoori)",
      "Rice (Kolam)",
      "Rice (IR 64)",
      "Rice (Parmal)",
      "Rice (Swarna)",
      "Rice (Gobindobhog)",
    ],
  },
  {
    group: "Soybean (सोयाबीन)",
    icon: "🫘",
    varieties: [
      "Soybean (JS 335)",
      "Soybean (JS 9560)",
      "Soybean (JS 20-34)",
      "Soybean (NRC 37)",
      "Soybean (RVS 2001-4)",
      "Soybean (Yellow Standard)",
    ],
  },
  {
    group: "Gram / Chana (चना / हरभरा)",
    icon: "🫘",
    varieties: [
      "Gram (Desi Chana)",
      "Gram (Kabuli / Dollar Chana)",
      "Gram (JG 11)",
      "Gram (Vishal / Digvijay)",
    ],
  },
  {
    group: "Maize / Corn (मक्का / मका)",
    icon: "🌽",
    varieties: [
      "Maize (Yellow Dent)",
      "Maize (Flint Corn)",
      "Maize (Hybrid Pioneer)",
      "Maize (Sweet Corn)",
    ],
  },
  {
    group: "Cotton (कपास / कापूस)",
    icon: "☁️",
    varieties: [
      "Cotton (Bt Cotton)",
      "Cotton (Shankar 6)",
      "Cotton (MCU 5)",
      "Cotton (DCH 32)",
    ],
  },
  {
    group: "Onion (प्याज / कांदा)",
    icon: "🧅",
    varieties: [
      "Onion (Nashik Red)",
      "Onion (Garwa / Rabi)",
      "Onion (White Onion)",
      "Onion (Pusa Red)",
    ],
  },
  {
    group: "Tomato (टमाटर / टोमॅटो)",
    icon: "🍅",
    varieties: [
      "Tomato (Hybrid Abhinav)",
      "Tomato (Vaishali)",
      "Tomato (Himsona)",
      "Tomato (Desi)",
    ],
  },
  {
    group: "Mustard (सरसों / मोहरी)",
    icon: "🌼",
    varieties: [
      "Mustard (Pusa Bold)",
      "Mustard (Kranti)",
      "Mustard (Giriraj)",
    ],
  },
  {
    group: "Tur / Arhar (तुअर / तूर)",
    icon: "🫘",
    varieties: [
      "Tur (Maruti)",
      "Tur (Asha)",
      "Tur (BDN 711)",
    ],
  },
];

export function CropVarietyMultiSelect({
  value = "",
  onChange,
  getLabel = (en) => en,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customInput, setCustomInput] = useState("");
  const dropdownRef = useRef(null);

  // Normalize current selected varieties from comma-separated string or array
  const selectedVarieties = Array.isArray(value)
    ? value
    : String(value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleVariety = (variety) => {
    let next;
    if (selectedVarieties.includes(variety)) {
      next = selectedVarieties.filter((v) => v !== variety);
    } else {
      next = [...selectedVarieties, variety];
    }
    onChange(next.join(", "));
  };

  const removeVariety = (variety, e) => {
    e.stopPropagation();
    const next = selectedVarieties.filter((v) => v !== variety);
    onChange(next.join(", "));
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed && !selectedVarieties.includes(trimmed)) {
      const next = [...selectedVarieties, trimmed];
      onChange(next.join(", "));
      setCustomInput("");
    }
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange("");
  };

  // Filter catalog by search term
  const filteredCatalog = GRAIN_VARIETIES_CATALOG.map((grp) => {
    const matches = grp.varieties.filter(
      (v) =>
        v.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grp.group.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...grp, varieties: matches };
  }).filter((grp) => grp.varieties.length > 0);

  return (
    <div className="crop-multi-select-container" ref={dropdownRef}>
      <label className="crop-multi-label">
        <span>
          {getLabel(
            "Crops & Grain Varieties Grown",
            "उगाई जाने वाली फसलें एवं अनाज किस्में",
            "पिकवलेली पिके आणि धान्याच्या जाती"
          )}{" "}
          *
        </span>
        <small className="crop-multi-counter">
          {selectedVarieties.length}{" "}
          {getLabel("selected", "चयनित", "निवडले")}
        </small>
      </label>

      {/* Trigger Box with Selected Chips */}
      <div
        className={`crop-multi-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="selected-chips-box">
          {selectedVarieties.length === 0 ? (
            <span className="placeholder-text">
              {getLabel(
                "Click to select crops & grain varieties (e.g. Wheat Lokwan, Soybean JS 335)...",
                "फसल व अनाज किस्में चुनने के लिए क्लिक करें (उदा. गेहूं लोकवन, सोयाबीन JS 335)...",
                "पिके आणि धान्याच्या जाती निवडण्यासाठी क्लिक करा (उदा. गहू लोकवन, सोयाबीन JS 335)..."
              )}
            </span>
          ) : (
            selectedVarieties.map((v) => (
              <span key={v} className="variety-chip">
                <span>{v}</span>
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={(e) => removeVariety(v, e)}
                  title={`Remove ${v}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="trigger-actions">
          {selectedVarieties.length > 0 && (
            <button
              type="button"
              className="clear-all-chips-btn"
              onClick={clearAll}
              title="Clear all"
            >
              <X size={14} />
            </button>
          )}
          <span className={`trigger-chevron ${isOpen ? "rotate" : ""}`}>
            <ChevronDown size={18} />
          </span>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="crop-multi-dropdown animate-fadeIn">
          {/* Search Header */}
          <div className="dropdown-search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={getLabel(
                "Search grain varieties (e.g. Sharbati, Basmati, JS 335, Desi)...",
                "किस्म खोजें (उदा. शरबती, बासमती, JS 335, देसी)...",
                "जात शोधा (उदा. शरबती, बासमती, JS 335, गावरान)..."
              )}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Varieties List */}
          <div className="dropdown-varieties-list">
            {filteredCatalog.length === 0 ? (
              <div className="no-varieties-found">
                <p>
                  {getLabel(
                    "No standard variety found matching",
                    "कोई मानक किस्म नहीं मिली",
                    "कोणतीही प्रमाणित जात आढळली नाही"
                  )}{" "}
                  "{searchTerm}".
                </p>
                <p className="hint">
                  {getLabel(
                    "You can add it as a custom variety below.",
                    "आप इसे नीचे कस्टम किस्म के रूप में जोड़ सकते हैं।",
                    "तुम्ही ते खाली स्वतःची जात म्हणून जोडू शकता."
                  )}
                </p>
              </div>
            ) : (
              filteredCatalog.map((grp) => (
                <div key={grp.group} className="variety-group">
                  <div className="group-header">
                    <span>{grp.icon}</span>
                    <span>{grp.group}</span>
                  </div>
                  <div className="group-items">
                    {grp.varieties.map((item) => {
                      const isSelected = selectedVarieties.includes(item);
                      return (
                        <div
                          key={item}
                          className={`variety-option-row ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleVariety(item)}
                        >
                          <div className={`checkbox-box ${isSelected ? "checked" : ""}`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="variety-name">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Custom Variety Footer */}
          <div className="dropdown-custom-footer" onClick={(e) => e.stopPropagation()}>
            <div className="custom-input-row">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom(e);
                  }
                }}
                placeholder={getLabel(
                  "+ Add other custom grain variety...",
                  "+ अन्य अनाज किस्म जोड़ें...",
                  "+ इतर स्वतःची जात जोडा..."
                )}
              />
              <button
                type="button"
                className="add-custom-btn"
                onClick={handleAddCustom}
                disabled={!customInput.trim()}
              >
                <Plus size={14} />
                <span>{getLabel("Add", "जोड़ें", "जोडा")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CropVarietyMultiSelect;
