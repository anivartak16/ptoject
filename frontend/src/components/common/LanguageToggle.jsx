import React from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export function LanguageToggle({ className = "", compact = false }) {
  const { language, setLanguage, languages } = useLanguage();

  return (
    <div className={`language-switch ${compact ? "compact" : ""} ${className}`} role="group" aria-label="Language selection">
      {languages.map((l) => {
        const isActive = language === l.code;
        return (
          <button
            key={l.code}
            type="button"
            className={isActive ? "active" : ""}
            onClick={() => setLanguage(l.code)}
            aria-pressed={isActive}
            title={l.label}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageToggle;
