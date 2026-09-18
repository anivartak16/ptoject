import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { BuyerVerificationBadge } from "../components/common/BuyerVerificationBadge.jsx";
import { FarmerVerificationBadge } from "../components/common/FarmerVerificationBadge.jsx";
import { ConnectModal } from "../components/common/ConnectModal.jsx";
import {
  Sparkles,
  CheckCircle2,
  Building2,
  Send,
  Phone,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export function MatchesPage() {
  const { user } = useAuth();
  const { t, getLabel } = useLanguage();
  const isFpo = user?.role === "FPO";
  const isBuyer = user?.role === "BUYER";

  const [fpoData, setFpoData] = useState(null);
  const [demands, setDemands] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [connectDemand, setConnectDemand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      if (isFpo) {
        // Load dedicated FPO matches endpoint
        const res = await api.get("/fpo/matches");
        setFpoData(res.data?.data || null);
        setMatches(res.data?.data?.matches || []);
        setDemands(res.data?.data?.demands || []);
      } else {
        // Buyers and Farmers
        const res = await api.get("/demands");
        const list = res.data?.data || [];
        setDemands(list);
        if (list.length > 0) {
          loadMatchesForDemand(list[0]);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load matching data."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMatchesForDemand = async (demand) => {
    setSelectedDemand(demand);
    try {
      const res = await api.get(`/matches/${demand._id}`);
      const data = res.data?.data;
      const list = Array.isArray(data) ? data : data?.matches || [];
      setMatches(list);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load matches for demand."
      );
    }
  };

  useEffect(() => {
    loadData();
  }, [isFpo, isBuyer]);

  return (
    <section className="matches-page animate-fadeIn">
      <div className="section-header-row">
        <div>
          <p className="eyebrow">
            {isFpo ? "FPO COLLECTIVE MATCHING" : "EXPLAINABLE MATCHING ENGINE"}
          </p>
          <h1>
            {isFpo
              ? t("fpoSupplyMatching", "FPO Demand-Supply Matching")
              : isBuyer
              ? t("recommendations", "Recommended Lots")
              : "Demand-to-Lot Matching"}
          </h1>
          <p className="subtext">
            {isFpo
              ? "Algorithmic multi-factor pairing between your FPO member lots and active corporate buyer demands."
              : "100-point transparent scoring across commodity, volume, quality grade, geographic proximity and price alignment."}
          </p>
        </div>
      </div>

      {error && <div className="form-message error">{error}</div>}

      {/* FPO Overview Stats */}
      {isFpo && fpoData && (
        <div className="fpo-match-stats-grid">
          <div className="stat-card">
            <small>Active Buyer Demands</small>
            <strong>{fpoData.activeDemandsCount} Demands</strong>
          </div>
          <div className="stat-card">
            <small>FPO Available Lots</small>
            <strong>{fpoData.fpoLotsCount} Lots</strong>
          </div>
          <div className="stat-card highlight">
            <small>High Compatibility Matches</small>
            <strong>{matches.filter((m) => m.matchScore >= 70).length} Deals</strong>
          </div>
        </div>
      )}

      {loading ? (
        <div className="panel loading-state">
          <div className="spinner" />
          <p>{t("loading", "Evaluating multi-factor matches…")}</p>
        </div>
      ) : isFpo ? (
        /* FPO Dedicated Matching View */
        <div className="fpo-matches-container">
          {matches.length === 0 ? (
            <div className="panel empty-state">
              <h3>No matching lots found yet</h3>
              <p>
                Add member farmers and aggregate available produce lots to match with corporate buyers.
              </p>
            </div>
          ) : (
            <div className="matches-grid">
              {matches.map((m, idx) => {
                const demand = m.demand || {};
                const buyer = demand.buyer || {};
                const lot = m.lot || {};

                return (
                  <article className="match-card-full animate-fadeIn" key={lot._id || idx}>
                    <div className="match-header-row">
                      <div className="match-score-pill">
                        <Sparkles size={16} color="#16a34a" />
                        <strong>{m.matchScore}% Fair Match</strong>
                      </div>

                      <BuyerVerificationBadge
                        compact
                        verification={buyer.verification}
                        buyer={buyer}
                      />
                    </div>

                    <div className="match-body-grid">
                      {/* Demand side */}
                      <div className="demand-col">
                        <small className="col-label">BUYER DEMAND</small>
                        <h4>{demand.commodity}</h4>
                        <div className="spec-line">
                          <span>Quantity:</span> <b>{demand.requiredQuantity?.toLocaleString("en-IN")} kg</b>
                        </div>
                        <div className="spec-line">
                          <span>Max Budget:</span> <b>₹{demand.maxPrice}/kg</b>
                        </div>
                        <div className="spec-line">
                          <span>Quality:</span> <b>{demand.requiredQuality || "Grade A"}</b>
                        </div>
                        <div className="spec-line">
                          <span>Buyer:</span> <b>{buyer.organizationName || buyer.name || "Enterprise Buyer"}</b>
                        </div>
                      </div>

                      {/* Lot side */}
                      <div className="lot-col">
                        <small className="col-label">YOUR FPO PRODUCE</small>
                        <h4>{lot.commodity}</h4>
                        <div className="spec-line">
                          <span>Available:</span> <b>{lot.remainingQuantity?.toLocaleString("en-IN")} kg</b>
                        </div>
                        <div className="spec-line">
                          <span>Expected Rate:</span> <b>₹{lot.expectedPrice}/kg</b>
                        </div>
                        <div className="spec-line">
                          <span>Quality Grade:</span> <b>{lot.quality?.grade || "FAQ Grade"}</b>
                        </div>
                        <div className="spec-line">
                          <span>Location:</span> <b>{lot.location || "FPO Hub"}</b>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Progress Bars */}
                    <div className="match-breakdown-row">
                      <div className="breakdown-metric">
                        <small>Volume Fit ({m.breakdown?.quantity}/25)</small>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${(m.breakdown?.quantity / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="breakdown-metric">
                        <small>Quality Fit ({m.breakdown?.quality}/25)</small>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${(m.breakdown?.quality / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="breakdown-metric">
                        <small>Price Fit ({m.breakdown?.price}/25)</small>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${(m.breakdown?.price / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="breakdown-metric">
                        <small>Location ({m.breakdown?.location}/15)</small>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${(m.breakdown?.location / 15) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reasons list */}
                    <div className="reasons-pill-row">
                      {m.reasons?.map((r, i) => (
                        <span key={i} className="reason-pill">
                          ✓ {r}
                        </span>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="match-action-footer">
                      <button
                        type="button"
                        className="primary connect-action-btn"
                        onClick={() => setConnectDemand(demand)}
                      >
                        <Send size={15} />
                        <span>{t("connectWithBuyer", "Connect & Send Supply Proposal")}</span>
                      </button>

                      {buyer.phone && (
                        <a
                          href={`tel:${buyer.phone}`}
                          className="call-buyer-btn"
                          title="Call buyer directly"
                        >
                          <Phone size={14} />
                          <span>Call Buyer ({buyer.phone})</span>
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Standard Buyer & Farmer View */
        <div className="two-col matching-two-col">
          <div className="panel demands-sidebar-panel">
            <h3>Active Demands</h3>
            <p>Select a demand to calculate real-time compatibility scores.</p>
            <div className="demands-select-list">
              {demands.map((d) => (
                <div
                  key={d._id}
                  className={`demand-select-item ${
                    selectedDemand?._id === d._id ? "active" : ""
                  }`}
                  onClick={() => loadMatchesForDemand(d)}
                >
                  <div className="item-top">
                    <b>{d.commodity} · {d.requiredQuantity} kg</b>
                    <StatusBadge>{d.status}</StatusBadge>
                  </div>
                  <div className="item-sub">
                    <span>Max ₹{d.maxPrice}/kg</span>
                    <span>📍 {d.preferredLocation || "Regional"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel matches-results-panel">
            {selectedDemand ? (
              <>
                <div className="selected-demand-summary">
                  <div className="summary-left">
                    <h3>Matches for {selectedDemand.commodity} Demand</h3>
                    <p>
                      Required: <b>{selectedDemand.requiredQuantity} kg</b> · Max ₹
                      {selectedDemand.maxPrice}/kg · {selectedDemand.requiredQuality || "Grade A"}
                    </p>
                  </div>
                  <BuyerVerificationBadge
                    compact
                    verification={selectedDemand.buyer?.verification}
                    buyer={selectedDemand.buyer}
                  />
                </div>

                {matches.length === 0 ? (
                  <p>No matching available lots found for this criteria.</p>
                ) : (
                  <div className="ranked-matches-list">
                    {matches.map((m, i) => (
                      <div className="match-card-row" key={m.lot?._id || i}>
                        <div className="match-score-bubble">
                          <strong>{m.matchScore}%</strong>
                          <small>Match</small>
                        </div>
                        <div className="match-detail-wrap">
                          <div className="match-lot-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <b>
                                {m.lot?.commodity} · {m.lot?.remainingQuantity} kg available
                              </b>
                              {m.lot?.owner && (
                                <FarmerVerificationBadge compact farmer={m.lot.owner} verification={m.lot.owner?.verification} />
                              )}
                            </div>
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
                            {m.reasons?.map((r, idx) => (
                              <span key={idx}>✓ {r}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p>Select a demand to view ranked lot recommendations.</p>
            )}
          </div>
        </div>
      )}

      {/* Direct Connect Modal */}
      {connectDemand && (
        <ConnectModal
          demand={connectDemand}
          onClose={() => setConnectDemand(null)}
          onProposalSent={() => {
            loadData();
          }}
        />
      )}
    </section>
  );
}

export default MatchesPage;
