import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, MapPin, Users } from "lucide-react";

export function LiveBidsSection({ language, buyerBids }) {
  return (
    <section className="enhanced-section bids-section">
      <div className="section-intro">
        <p className="eyebrow">
          <span className="live-dot" /> LIVE BUYER DEMAND
        </p>
        <h2>
          {language === "en"
            ? "Buyers are looking for your produce"
            : "खरीदार आपकी फसल की तलाश में हैं"}
        </h2>
        <p>
          {language === "en"
            ? "See active demand and competitive offers from marketplace buyers."
            : "Marketplace buyers की active demand और competitive offers देखें।"}
        </p>
      </div>

      <div className="bids-table">
        <div className="bid-header">
          <span>BUYER</span>
          <span>CROP</span>
          <span>OFFER</span>
          <span>QUANTITY</span>
          <span>LOCATION</span>
        </div>

        {buyerBids.map((bid) => (
          <div className="bid-row" key={bid.buyer}>
            <div className="buyer-name">
              <div className="buyer-avatar">
                <Users size={17} />
              </div>
              <div>
                <b>{bid.buyer}</b>
                {bid.verified && (
                  <small>
                    <BadgeCheck size={13} />
                    Verified buyer
                  </small>
                )}
              </div>
            </div>

            <span>{bid.crop}</span>
            <strong>{bid.price}</strong>
            <span>{bid.quantity}</span>
            <span>
              <MapPin size={14} />
              {bid.location}
            </span>
          </div>
        ))}
      </div>

      <div className="bid-cta">
        <p>
          {language === "en"
            ? "Have produce to sell?"
            : "क्या आपके पास बेचने के लिए फसल है?"}
        </p>
        <Link className="primary" to="/register/farmer">
          {language === "en" ? "List your produce" : "अपनी फसल लिस्ट करें"}
          <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}

export default LiveBidsSection;
