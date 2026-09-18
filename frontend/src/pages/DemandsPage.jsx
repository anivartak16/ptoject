import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { BuyerVerificationBadge } from "../components/common/BuyerVerificationBadge.jsx";
import { ConnectModal } from "../components/common/ConnectModal.jsx";
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  Send,
  PlusCircle,
} from "lucide-react";

export function DemandsPage() {
  const { user } = useAuth();
  const { t, getLabel } = useLanguage();
  const isBuyer = user?.role === "BUYER";

  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterCrop, setFilterCrop] = useState("all");
  const [activeMatches, setActiveMatches] = useState({});
  const [loadingMatchId, setLoadingMatchId] = useState("");
  const [connectDemand, setConnectDemand] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form for buyers creating demands
  const [form, setForm] = useState({
    commodity: "Wheat",
    variety: "Sharbati",
    requiredQuantity: 5000,
    requiredQuality: "Grade A",
    maxMoisture: 12,
    maxPrice: 2650,
    preferredLocation: "Indore",
    deliveryLocation: "Indore APMC Warehouse",
    paymentTerms: "100% Escrow Secured",
    notes: "Requires KVK moisture test certificate. Immediate escrow settlement on delivery.",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadDemands = async () => {
    setLoading(true);
    setError("");
    try {
      // Buyers view their own demands; Farmers/FPOs view all active demands
      const endpoint = isBuyer ? "/demands?mine=true" : "/demands";
      const res = await api.get(endpoint);
      setDemands(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load buyer demands.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemands();
  }, [isBuyer]);

  const handleCreateDemand = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError("");

    try {
      await api.post("/demands", {
        ...form,
        requiredQuantity: Number(form.requiredQuantity),
        maxPrice: Number(form.maxPrice),
        maxMoisture: Number(form.maxMoisture),
      });
      setShowCreateForm(false);
      loadDemands();
    } catch (err) {
      setError(err.response?.data?.message || "Could not publish demand.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const fetchMatches = async (demandId) => {
    if (activeMatches[demandId]) {
      // Toggle off if already showing
      setActiveMatches((prev) => {
        const next = { ...prev };
        delete next[demandId];
        return next;
      });
      return;
    }

    setLoadingMatchId(demandId);
    try {
      const res = await api.get(`/matches/${demandId}`);
      const data = res.data?.data;
      const list = Array.isArray(data) ? data : data?.matches || [];
      setActiveMatches((prev) => ({
        ...prev,
        [demandId]: list,
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load ranked matches.");
    } finally {
      setLoadingMatchId("");
    }
  };

  const filteredDemands = demands.filter((d) => {
    if (filterCrop === "all") return true;
    return (d.commodity || "").toLowerCase() === filterCrop.toLowerCase();
  });

  return (
    <section className="demands-page animate-fadeIn">
      <div className="section-header-row">
        <div>
          <p className="eyebrow">
            {isBuyer ? "ENTERPRISE DEMAND DESK" : "DIRECT BUYER DEMANDS"}
          </p>
          <h1>{t("buyerDemands", "Buyer Demands")}</h1>
          <p className="subtext">
            {isBuyer
              ? "Publish your crop requirements, volume, quality specs and maximum purchase budget."
              : "Direct purchase requirements from verified commercial buyers, food processors and millers with escrow payment guarantee."}
          </p>
        </div>

        {isBuyer && (
          <button
            type="button"
            className="primary new-demand-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <PlusCircle size={16} />
            <span>
              {showCreateForm ? "Close Form" : "Post New Buyer Demand"}
            </span>
          </button>
        )}
      </div>

      {error && <div className="form-message error">{error}</div>}

      {/* Buyer Create Demand Form */}
      {isBuyer && showCreateForm && (
        <form
          className="panel create-demand-form animate-fadeIn"
          onSubmit={handleCreateDemand}
        >
          <div className="form-head">
            <h3>Post Crop Procurement Demand</h3>
            <small>
              Verified farmers and FPOs will receive your demand and match their
              lots.
            </small>
          </div>

          <div className="form-grid">
            <label>
              {t("cropCommodity", "Crop Commodity")}
              <select
                value={form.commodity}
                onChange={(e) =>
                  setForm({ ...form, commodity: e.target.value })
                }
              >
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Gram">Chana / Gram (चना)</option>
                <option value="Paddy">Paddy / Rice (धान)</option>
                <option value="Maize">Maize / Corn (मक्का)</option>
                <option value="Mustard">Mustard (सरसों)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Onion">Onion (प्याज)</option>
                <option value="Potato">Potato (आलू)</option>
              </select>
            </label>

            <label>
              {getLabel("Specific Variety", "विशिष्ट किस्म", "विशिष्ट वाण")}
              <input
                value={form.variety}
                onChange={(e) => setForm({ ...form, variety: e.target.value })}
                placeholder="E.g. Sharbati, Lokwan, JS-335"
              />
            </label>

            <label>
              {t("quantityKg", "Required Quantity (kg)")}
              <input
                type="number"
                min="100"
                value={form.requiredQuantity}
                onChange={(e) =>
                  setForm({ ...form, requiredQuantity: e.target.value })
                }
                required
              />
            </label>

            <label>
              {getLabel("Required Quality Grade", "आवश्यक गुणवत्ता ग्रेड", "आवश्यक गुणवत्ता दर्जा")}
              <select
                value={form.requiredQuality}
                onChange={(e) =>
                  setForm({ ...form, requiredQuality: e.target.value })
                }
              >
                <option value="Grade A">Grade A (Premium FAQ)</option>
                <option value="Grade B">Grade B (Standard Market)</option>
                <option value="Organic">Certified Organic</option>
              </select>
            </label>

            <label>
              {getLabel("Maximum Moisture %", "अधिकतम नमी प्रतिशत", "कमाल आर्द्रता %")}
              <input
                type="number"
                min="5"
                max="25"
                value={form.maxMoisture}
                onChange={(e) =>
                  setForm({ ...form, maxMoisture: e.target.value })
                }
              />
            </label>

            <label>
              {getLabel("Max Buying Budget (₹/kg)", "अधिकतम बजट दर (₹/किग्रा)", "जास्तीत जास्त दर (₹/किलो)")}
              <input
                type="number"
                min="1"
                value={form.maxPrice}
                onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                required
              />
            </label>

            <label>
              {getLabel("Preferred Procurement Location", "प्राथमिक खरीदी क्षेत्र", "प्राधान्य खरेदी ठिकाण")}
              <input
                value={form.preferredLocation}
                onChange={(e) =>
                  setForm({ ...form, preferredLocation: e.target.value })
                }
                placeholder="District or APMC Mandi"
              />
            </label>

            <label>
              {getLabel("Delivery Destination / Warehouse", "वितरण स्थान / वेयरहाउस", "डिलिव्हरी ठिकाण")}
              <input
                value={form.deliveryLocation}
                onChange={(e) =>
                  setForm({ ...form, deliveryLocation: e.target.value })
                }
                placeholder="Warehouse or APMC yard"
              />
            </label>
          </div>

          <label style={{ marginTop: "10px" }}>
            {getLabel("Special Quality or Packaging Notes", "विशेष गुणवत्ता व पैकेजिंग शर्तें", "विशेष अटी")}
            <textarea
              rows="2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>

          <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="submit"
              className="primary"
              disabled={formSubmitting}
            >
              {formSubmitting ? "Publishing…" : "Publish Demand to Marketplace"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="demands-filter-bar">
        <div className="filter-item">
          <Filter size={15} color="#64748b" />
          <span>{getLabel("Filter by Crop:", "फसल चुनें:", "पीक निवडा:")}</span>
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
          >
            <option value="all">All Crops (सभी फसलें)</option>
            <option value="Wheat">Wheat (गेहूं)</option>
            <option value="Soybean">Soybean (सोयाबीन)</option>
            <option value="Gram">Chana (चना)</option>
            <option value="Paddy">Paddy (धान)</option>
            <option value="Maize">Maize (मक्का)</option>
            <option value="Mustard">Mustard (सरसों)</option>
          </select>
        </div>

        <div className="demands-count-pill">
          {filteredDemands.length} {t("buyerDemands", "Active Demands")}
        </div>
      </div>

      {loading ? (
        <div className="panel loading-state">
          <div className="spinner" />
          <p>{t("loading", "Loading buyer demands…")}</p>
        </div>
      ) : filteredDemands.length === 0 ? (
        <div className="panel empty-state">
          <p>{t("noRecords", "No active buyer demands found for this selection.")}</p>
        </div>
      ) : (
        <div className="demands-grid">
          {filteredDemands.map((demand) => {
            const buyer = demand.buyer || {};
            const qtl = Math.round(demand.requiredQuantity / 100);
            const priceQtl = Math.round(demand.maxPrice * 100);
            const matches = activeMatches[demand._id];
            const isMatchingOpen = Boolean(matches);

            return (
              <article className="demand-card animate-fadeIn" key={demand._id}>
                {/* Header: Commodity & Verification Badge */}
                <div className="demand-top-row">
                  <div>
                    <span className="demand-crop-badge">
                      {demand.commodity}
                    </span>
                    <h3 className="demand-title">
                      {demand.requiredQuantity?.toLocaleString("en-IN")} kg
                      <small className="qtl-text"> ({qtl} Quintals / {demand.variety || "Standard"})</small>
                    </h3>
                  </div>

                  <BuyerVerificationBadge
                    compact
                    verification={buyer.verification}
                    buyer={buyer}
                  />
                </div>

                {/* Buyer & Price Info */}
                <div className="demand-specs-grid">
                  <div className="spec-box price-spec">
                    <small>{t("maxBudgetPrice", "Maximum Budget")}</small>
                    <strong>₹{demand.maxPrice}/kg</strong>
                    <span>(₹{priceQtl.toLocaleString("en-IN")}/qtl)</span>
                  </div>

                  <div className="spec-box quality-spec">
                    <small>{getLabel("Required Quality", "गुणवत्ता मानक", "गुणवत्ता दर्जा")}</small>
                    <strong>{demand.requiredQuality || "Grade A"}</strong>
                    <span>Max {demand.maxMoisture || 12}% Moisture</span>
                  </div>

                  <div className="spec-box location-spec">
                    <small>{getLabel("Delivery Destination", "डिलीवरी स्थान", "वितरण ठिकाण")}</small>
                    <strong>{demand.preferredLocation || demand.deliveryLocation || "Regional Mandi"}</strong>
                    <span>📍 APMC Center</span>
                  </div>

                  <div className="spec-box buyer-spec">
                    <small>{getLabel("Procuring Buyer", "खरीदार विवरण", "खरेदीदार माहिती")}</small>
                    <strong>{buyer.organizationName || buyer.name || "Enterprise Buyer"}</strong>
                    <span>{buyer.district ? `${buyer.district}, ` : ""}{buyer.state || "National Buyer"}</span>
                  </div>
                </div>

                {demand.notes && (
                  <p className="demand-notes">
                    <strong>Note:</strong> {demand.notes}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="demand-actions-row">
                  <button
                    type="button"
                    className="match-btn"
                    onClick={() => fetchMatches(demand._id)}
                    disabled={loadingMatchId === demand._id}
                  >
                    <Sparkles size={14} color="#16a34a" />
                    <span>
                      {loadingMatchId === demand._id
                        ? "Calculating Fit…"
                        : isMatchingOpen
                        ? "Hide Matches"
                        : "Show Ranked Lot Matches"}
                    </span>
                  </button>

                  {!isBuyer && (
                    <button
                      type="button"
                      className="primary connect-btn"
                      onClick={() => setConnectDemand(demand)}
                    >
                      <Send size={14} />
                      <span>{t("connectWithBuyer", "Connect & Send Proposal")}</span>
                    </button>
                  )}
                </div>

                {/* Ranked Matches Drawer */}
                {isMatchingOpen && (
                  <div className="demand-matches-panel animate-fadeIn">
                    <div className="matches-head">
                      <h4>
                        <Sparkles size={16} color="#16a34a" />
                        <span>Explainable Ranked Lot Matches ({matches.length})</span>
                      </h4>
                      <small>Scored by Commodity, Quantity, Quality, Location & Price</small>
                    </div>

                    {matches.length === 0 ? (
                      <p className="no-matches-text">
                        No active lots currently match this demand. Register or aggregate a new lot to fulfill this request.
                      </p>
                    ) : (
                      <div className="matches-list">
                        {matches.map((m, idx) => (
                          <div className="match-card-row" key={m.lot?._id || idx}>
                            <div className="match-score-bubble">
                              <strong>{m.matchScore}%</strong>
                              <small>Match</small>
                            </div>

                            <div className="match-detail-wrap">
                              <div className="match-lot-title">
                                <b>
                                  {m.lot?.commodity} · {m.lot?.remainingQuantity} kg available
                                </b>
                                <span className="lot-price">
                                  ₹{m.lot?.expectedPrice}/kg
                                </span>
                              </div>

                              <div className="match-breakdown-chips">
                                {Object.entries(m.breakdown || {}).map(
                                  ([k, v]) => (
                                    <span key={k} className="chip">
                                      {k}: <b>{v} pts</b>
                                    </span>
                                  )
                                )}
                              </div>

                              <div className="match-reasons-line">
                                {m.reasons?.slice(0, 3).map((r, i) => (
                                  <span key={i}>✓ {r}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Connect Modal for Direct Communication */}
      {connectDemand && (
        <ConnectModal
          demand={connectDemand}
          onClose={() => setConnectDemand(null)}
          onProposalSent={() => {
            loadDemands();
          }}
        />
      )}
    </section>
  );
}

export default DemandsPage;
