import React, { useState } from "react";
import api from "../../api/client.js";
import { X, Send, Phone, MessageSquare, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { BuyerVerificationBadge } from "./BuyerVerificationBadge.jsx";

export function ConnectModal({ demand, onClose, onProposalSent }) {
  const { t, getLabel } = useLanguage();
  const [price, setPrice] = useState(demand?.maxPrice || "");
  const [quantity, setQuantity] = useState(demand?.requiredQuantity || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!demand) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/fpo/connect", {
        demandId: demand._id,
        proposedPrice: Number(price),
        proposedQuantity: Number(quantity),
        message,
      });

      setSuccess(true);
      if (onProposalSent) onProposalSent();
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not send supply proposal to buyer."
      );
    } finally {
      setLoading(false);
    }
  };

  const buyer = demand.buyer || {};
  const phone = demand.contactPhone || buyer.phone || "";

  return (
    <div className="modal-backdrop-fixed" onClick={onClose}>
      <div
        className="connect-modal animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-top">
          <div className="modal-title-wrap">
            <MessageSquare size={20} color="#15803d" />
            <div>
              <h3>{t("connectWithBuyer", "Connect with Buyer")}</h3>
              <small>
                {demand.commodity} · {demand.requiredQuantity} kg demand
              </small>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Buyer Profile Summary */}
        <div className="modal-buyer-summary">
          <div className="buyer-name-line">
            <strong>{buyer.organizationName || buyer.name || "Verified Enterprise Buyer"}</strong>
            <BuyerVerificationBadge
              compact
              verification={buyer.verification}
              buyer={buyer}
            />
          </div>
          <p className="buyer-sub">
            📍 {demand.preferredLocation || demand.deliveryLocation || buyer.location || "Regional Mandi Hub"}
            {buyer.tradeRating && ` · ⭐ ${buyer.tradeRating}/5 Trust Rating`}
          </p>
        </div>

        {/* Direct Phone / Contact Bar */}
        {phone && (
          <div className="direct-contact-bar">
            <div className="contact-info">
              <Phone size={15} color="#16a34a" />
              <span>
                {getLabel("Direct Inquiry Line:", "प्रत्यक्ष संपर्क नंबर:", "थेट संपर्क क्रमांक:")}{" "}
                <b>{phone}</b>
              </span>
            </div>
            <a
              href={`tel:${phone}`}
              className="quick-call-btn"
              title="Call Buyer"
            >
              📞 {getLabel("Call", "कॉल करें", "कॉल करा")}
            </a>
          </div>
        )}

        {success ? (
          <div className="modal-success-state animate-fadeIn">
            <CheckCircle2 size={42} color="#16a34a" />
            <h4>
              {getLabel(
                "Proposal Sent Successfully!",
                "आपूर्ति प्रस्ताव सफलतापूर्वक भेजा गया!",
                "पुरवठा प्रस्ताव यशस्वीरीत्या पाठवला गेला!"
              )}
            </h4>
            <p>
              {getLabel(
                "The buyer has been notified. When they accept, an escrow contract will be generated in your Offers tab.",
                "खरीदार को सूचित कर दिया गया है। स्वीकार करने पर 'Offers' टैब में अनुबंध बन जाएगा।",
                "खरेदीदाराला सूचना पाठवली आहे. संमती मिळाल्यावर 'Offers' मध्ये करार तयार होईल."
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="proposal-form">
            {error && <div className="form-message error">{error}</div>}

            <div className="two-col-inputs">
              <label>
                {getLabel("Proposed Price (₹/kg)", "प्रस्तावित दर (₹/किग्रा)", "प्रस्तावित दर (₹/किलो)")}
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={`Buyer max ₹${demand.maxPrice}/kg`}
                  required
                />
              </label>

              <label>
                {getLabel("Supply Quantity (kg)", "आपूर्ति मात्रा (किग्रा)", "पुरवठा वजन (किलो)")}
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`Demand: ${demand.requiredQuantity} kg`}
                  required
                />
              </label>
            </div>

            <label>
              {getLabel("Message / Terms / Dispatch Timeframe", "संदेश / शर्तें / डिलीवरी समय", "संदेश / अटी / डिलिव्हरी वेळ")}
              <textarea
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={getLabel(
                  "E.g., We have lab-tested Grade A Wheat available for immediate dispatch from our Indore warehouse...",
                  "उदा. हमारे पास इंदौर वेयरहाउस में तत्काल डिलीवरी हेतु प्रमाणित ग्रेड A गेहूं उपलब्ध है...",
                  "उदा. आमच्याकडे प्रमाणित ग्रेड A गहू त्वरित डिलिव्हरीसाठी उपलब्ध आहे..."
                )}
              />
            </label>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                {t("cancel", "Cancel")}
              </button>
              <button type="submit" disabled={loading} className="primary send-btn">
                <Send size={14} />
                <span>{loading ? "Sending…" : t("sendProposal", "Send Proposal")}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ConnectModal;
