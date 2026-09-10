import React from "react";
import { Link } from "react-router-dom";

export function RolesSection({ language }) {
  return (
    <section className="role-strip">
      <div>
        <p className="eyebrow">ONE MARKET, DIFFERENT ROLES</p>
        <h2>
          {language === "en"
            ? "Choose your side of the trade."
            : "व्यापार में अपनी भूमिका चुनें।"}
        </h2>
      </div>

      <div className="role-links">
        <Link to="/register/farmer">
          <span>01</span>
          <b>{language === "en" ? "Farmer" : "किसान"}</b>
          <small>
            {language === "en"
              ? "List produce at a visible rate"
              : "अपनी फसल की कीमत के साथ लिस्ट करें"}
          </small>
          ↗
        </Link>

        <Link to="/register/fpo">
          <span>02</span>
          <b>FPO</b>
          <small>
            {language === "en"
              ? "Pool supply and sell together"
              : "फसल को एक साथ बेचें"}
          </small>
          ↗
        </Link>

        <Link to="/register/buyer">
          <span>03</span>
          <b>{language === "en" ? "Buyer" : "खरीदार"}</b>
          <small>
            {language === "en"
              ? "Place demand and source lots"
              : "Demand रखें और lots खरीदें"}
          </small>
          ↗
        </Link>
      </div>
    </section>
  );
}

export default RolesSection;
