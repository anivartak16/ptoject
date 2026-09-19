import React, { useState } from "react";
import {
  X,
  Leaf,
  Sprout,
  ShieldCheck,
  Bug,
  Award,
  BookOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  ORGANIC_CROP_GUIDES,
  DEFAULT_ORGANIC_GUIDE,
  CERTIFICATION_GUIDANCE,
} from "../../data/organicFarmingData.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

export function OrganicFarmingModal({ isOpen, onClose, initialCrop = "Wheat" }) {
  const { getLabel } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [activeTab, setActiveTab] = useState("guide"); // guide | compost | inputs | pest | cert

  if (!isOpen) return null;

  const cropData = ORGANIC_CROP_GUIDES[selectedCrop] || DEFAULT_ORGANIC_GUIDE;

  const tabs = [
    {
      id: "guide",
      label: getLabel("Farming Guide", "कृषि मार्गदर्शिका", "शेती मार्गदर्शिका"),
      icon: <BookOpen size={16} />,
    },
    {
      id: "compost",
      label: getLabel("Natural Compost", "प्राकृतिक खाद", "सेंद्रिय खत"),
      icon: <Sprout size={16} />,
    },
    {
      id: "inputs",
      label: getLabel("Organic Inputs", "जैविक घटक", "सेंद्रिय निविष्ठा"),
      icon: <Leaf size={16} />,
    },
    {
      id: "pest",
      label: getLabel("Pest Management", "कीट प्रबंधन", "कीड व्यवस्थापन"),
      icon: <Bug size={16} />,
    },
    {
      id: "cert",
      label: getLabel("Certification", "प्रमाणन मार्गदर्शिका", "प्रमाणपत्र मार्गदर्शन"),
      icon: <Award size={16} />,
    },
  ];

  return (
    <div className="modal-backdrop animate-fadeIn" onClick={onClose}>
      <div
        className="modal-content organic-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="organic-modal-header">
          <div className="header-title-box">
            <div className="header-icon-circle">🌱</div>
            <div>
              <div className="header-kicker">
                {getLabel("KRISHILINK ORGANIC ADVISORY", "कृषिलिंक जैविक कृषि सलाह", "कृषिलिंक सेंद्रिय शेती सल्ला")}
              </div>
              <h2>
                {getLabel("Organic Farming & Natural Inputs", "जैविक खेती एवं प्राकृतिक पोषण", "सेंद्रिय शेती आणि नैसर्गिक पोषण")}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Crop Selector Bar */}
        <div className="organic-modal-crop-bar">
          <label className="crop-label">
            <span>{getLabel("Select Crop:", "फसल चुनें:", "पीक निवडा:")}</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="crop-select"
            >
              <option value="Wheat">🌾 Wheat (गेहूं / गहू)</option>
              <option value="Rice">🌾 Rice / Paddy (धान / तांदूळ)</option>
              <option value="Soybean">🫘 Soybean (सोयाबीन)</option>
              <option value="Onion">🧅 Onion (प्याज / कांदा)</option>
              <option value="General">🌱 General Crops (सामान्य फसलें)</option>
            </select>
          </label>
          <div className="crop-badge-indicator">
            {getLabel("Advisory customized for", "सलाह आधारित:", "सल्ला आधारित:")}{" "}
            <b>{cropData.label}</b>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="organic-modal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`organic-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="organic-modal-body">
          {/* TAB 1: ORGANIC FARMING GUIDE */}
          {activeTab === "guide" && (
            <div className="organic-tab-pane animate-fadeIn">
              <div className="pane-intro-banner">
                <Info size={18} className="intro-icon" />
                <p>
                  {getLabel(
                    "Standard organic practices for maximizing yield without synthetic chemical inputs. Follow scientific crop rotation and biological seed treatment for highest crop vigor.",
                    "बिना रासायनिक उर्वरकों के अधिकतम उपज हेतु मानक जैविक पद्धतियां। उत्तम गुणवत्ता हेतु बीज उपचार व फसल चक्र का पालन करें।",
                    "रासायनिक खतांचा वापर न करता भरपूर उत्पादनासाठी प्रमाणित सेंद्रिय पद्धती. चांगल्या गुणवत्तेसाठी बीजप्रक्रिया व पीक फेरपालट करा."
                  )}
                </p>
              </div>

              <div className="guidance-cards-grid">
                {cropData.practices.map((p, idx) => (
                  <div key={idx} className="guidance-card">
                    <div className="card-num-bullet">{idx + 1}</div>
                    <div className="card-content">
                      <h4>{p.title}</h4>
                      <p>{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {cropData.precautions?.length > 0 && (
                <div className="precautions-box">
                  <div className="precaution-header">
                    <AlertTriangle size={16} />
                    <b>{getLabel("Important Precautions", "महत्वपूर्ण सावधानियां", "महत्त्वाच्या सूचना")}</b>
                  </div>
                  <ul>
                    {cropData.precautions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NATURAL COMPOST */}
          {activeTab === "compost" && (
            <div className="organic-tab-pane animate-fadeIn">
              <div className="pane-intro-banner">
                <Sprout size={18} className="intro-icon" />
                <p>
                  {getLabel(
                    "Suitable natural compost and well-rotted manures for enriching soil organic carbon, water retention, and microbial biodiversity.",
                    "मृदा जैविक कार्बन, जलधारण क्षमता और सूक्ष्मजीव संवर्धन हेतु उपयुक्त प्राकृतिक एवं केंचुआ खाद।",
                    "मातीतील सेंद्रिय कर्ब, पाणी धरून ठेवण्याची क्षमता आणि उपयुक्त जिवाणू वाढीसाठी योग्य सेंद्रिय खत."
                  )}
                </p>
              </div>

              <div className="compost-cards-list">
                {cropData.compost.map((c, idx) => (
                  <div key={idx} className="compost-card">
                    <div className="compost-card-header">
                      <h4>🌱 {c.name}</h4>
                      <span className="dosage-pill">{c.dosage}</span>
                    </div>
                    <div className="compost-meta-grid">
                      <div>
                        <small>{getLabel("APPLICATION TIMING", "प्रयोग समय", "वापराची वेळ")}</small>
                        <b>{c.timing}</b>
                      </div>
                      <div>
                        <small>{getLabel("PURPOSE & BENEFIT", "उद्देश्य व लाभ", "फायदे")}</small>
                        <p>{c.purpose}</p>
                      </div>
                      <div className="full-width">
                        <small>{getLabel("APPLICATION GUIDANCE", "प्रयोग विधि", "वापर कसा करावा")}</small>
                        <p>{c.usage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORGANIC INPUTS */}
          {activeTab === "inputs" && (
            <div className="organic-tab-pane animate-fadeIn">
              <div className="pane-intro-banner">
                <Leaf size={18} className="intro-icon" />
                <p>
                  {getLabel(
                    "Farm-made natural liquid bio-stimulants and certified microbial inoculants to boost plant immunity and nutrient uptake.",
                    "खेत पर निर्मित प्राकृतिक तरल जीवामृत एवं प्रमाणित जैव-उर्वरक जो फसल रोग प्रतिरोधक क्षमता बढ़ाते हैं।",
                    "शेतात तयार करता येणारे नैसर्गिक जिवामृत व जैविक खते जे पिकांची रोगप्रतिकारशक्ती आणि अन्नद्रव्य शोषण वाढवतात."
                  )}
                </p>
              </div>

              <div className="inputs-cards-grid">
                {cropData.inputs.map((inp, idx) => (
                  <div key={idx} className="input-item-card">
                    <h4>🧪 {inp.name}</h4>
                    <div className="input-dosage-badge">{inp.dosage}</div>
                    <p className="input-purpose">{inp.purpose}</p>
                    <div className="input-timing-box">
                      <small>🕒 {inp.timing}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NATURAL PEST MANAGEMENT */}
          {activeTab === "pest" && (
            <div className="organic-tab-pane animate-fadeIn">
              <div className="pane-intro-banner">
                <Bug size={18} className="intro-icon" />
                <p>
                  {getLabel(
                    "Eco-friendly biological control agents, herbal repellents, and physical traps that suppress harmful insect pests while protecting pollinators.",
                    "पर्यावरण अनुकूल जैविक कीटनाशक, वानस्पतिक काढ़े और जाल जो मित्र कीटों को नुकसान पहुंचाए बिना हानिकारक कीटों को नियंत्रित करते हैं।",
                    "पर्यावरणपूरक जैविक कीटकनाशके, वनस्पति अर्क आणि चिकट सापळे जे मित्रकीटकांना हानी न पोहोचवता पिकांचे रक्षण करतात."
                  )}
                </p>
              </div>

              <div className="pest-table-wrapper">
                <table className="pest-table">
                  <thead>
                    <tr>
                      <th>{getLabel("Target Pest / Disease", "लक्षित कीट / रोग", "रोग / कीड")}</th>
                      <th>{getLabel("Natural Remedy & Dosage", "प्राकृतिक उपचार व मात्रा", "नैसर्गिक उपाय व प्रमाण")}</th>
                      <th>{getLabel("Application Guidance", "प्रयोग निर्देश", "सूचना")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cropData.pestManagement.map((pm, idx) => (
                      <tr key={idx}>
                        <td className="target-cell">
                          <b>⚠️ {pm.target}</b>
                        </td>
                        <td className="remedy-cell">{pm.remedy}</td>
                        <td className="guidance-cell">{pm.guidance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ORGANIC CERTIFICATION GUIDANCE */}
          {activeTab === "cert" && (
            <div className="organic-tab-pane animate-fadeIn">
              <div className="pane-intro-banner">
                <Award size={18} className="intro-icon" />
                <p>{CERTIFICATION_GUIDANCE.overview}</p>
              </div>

              <div className="cert-types-grid">
                {CERTIFICATION_GUIDANCE.types.map((ct) => (
                  <div key={ct.code} className="cert-type-card">
                    <div className="cert-card-top">
                      <span className="cert-code-tag">{ct.code}</span>
                      <h4>{ct.name}</h4>
                      <small className="cert-body">Authority: {ct.body}</small>
                    </div>

                    <div className="cert-detail-section">
                      <div className="cert-field">
                        <b>Ideal For:</b> {ct.bestFor}
                      </div>
                      <div className="cert-field">
                        <b>Certification Cost:</b> {ct.cost}
                      </div>
                    </div>

                    <div className="cert-stages-box">
                      <small>CONVERSION TIMELINE</small>
                      <ul>
                        {ct.stages.map((stg, i) => (
                          <li key={i}>{stg}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Steps to Certify */}
              <div className="steps-to-certify-section">
                <h3>{getLabel("4 Steps to Get Certified in India", "भारत में जैविक प्रमाणन के 4 सरल चरण", "भारतात सेंद्रिय प्रमाणपत्राचे ४ सोपे टप्पे")}</h3>
                <div className="steps-grid">
                  {CERTIFICATION_GUIDANCE.stepsToCertify.map((step) => (
                    <div key={step.step} className="step-card">
                      <div className="step-number">{step.step}</div>
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="organic-modal-footer">
          <div className="footer-tip">
            🌱 {getLabel(
              "Listing certified organic produce attracts verified premium institutional buyers on KrishiLink.",
              "प्रमाणित जैविक उपज लिस्ट करने से कृषिलिंक पर प्रीमियम संस्थागत खरीदार मिलते हैं।",
              "प्रमाणित सेंद्रिय शेतमाल नोंदणी केल्यास कृषिलिंकवर चांगला दर देणारे अधिकृत खरेदीदार मिळतात."
            )}
          </div>
          <button type="button" className="primary" onClick={onClose}>
            {getLabel("Close Advisory", "बंद करें", "बंद करा")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrganicFarmingModal;
