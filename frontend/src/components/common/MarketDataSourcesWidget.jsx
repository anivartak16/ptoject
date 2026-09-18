import React from "react";
import { Database, ShieldCheck, CheckCircle2, BarChart2, Radio } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export function MarketDataSourcesWidget({ commodity = "Wheat" }) {
  const { t, getLabel } = useLanguage();

  const dataSources = [
    {
      id: "agmarknet",
      title: "AGMARKNET (Ministry of Agriculture)",
      badge: "LIVE API SYNC",
      badgeColor: "#16a34a",
      desc: getLabel(
        "Direct API integration with 3,000+ national APMC mandis recording daily arrivals, min, max and modal price benchmarks.",
        "कृषि मंत्रालय के दैनिक पोर्टल से सीधा 3,000+ मंडियों का वास्तविक आवक व भाव सिंक।",
        "कृषी मंत्रालयाच्या ३,०००+ बाजार समित्यांचा थेट दैनंदिन आवक व दर डेटा."
      ),
      metric: "3,200+ Daily Mandis",
    },
    {
      id: "enam",
      title: "e-NAM Unified National Agriculture Market",
      badge: "PAN-INDIA",
      badgeColor: "#2563eb",
      desc: getLabel(
        "Inter-mandi electronic auction prices and pan-India trading liquidity benchmarks.",
        "राष्ट्रीय इलेक्ट्रॉनिक मंडी नेटवर्क के पारदर्शी ई-नीलामी व व्यापारिक भाव।",
        "राष्ट्रीय इलेक्ट्रॉनिक बाजारातील पारदर्शक ई-लिलाव व व्यापार दर."
      ),
      metric: "1,361 APMCs Linked",
    },
    {
      id: "msp",
      title: "Government MSP Reference (2024-25)",
      badge: "STATUTORY",
      badgeColor: "#d97706",
      desc: getLabel(
        "Official Cabinet Committee on Economic Affairs (CCEA) guaranteed floor prices.",
        "केंद्र सरकार द्वारा निर्धारित न्यूनतम समर्थन मूल्य (MSP) कानूनी बेंचमार्क।",
        "केंद्र सरकारचे हमीभाव (MSP) अधिकृत आधार दर."
      ),
      metric: "Official CCEA Rate",
    },
    {
      id: "krishilink_demand",
      title: "KrishiLink Regional Buyer Liquidity",
      badge: "BUYER DEMAND",
      badgeColor: "#7c3aed",
      desc: getLabel(
        "Aggregated volume requirements from verified corporate buyers, millers, and food processors.",
        "सत्यापित फूड प्रोसेसर्स, मिलर्स व खरीदारों की प्रत्यक्ष मांग मात्रा।",
        "प्रमाणित प्रक्रिया उद्योग, गिरणी मालक व खरेदीदारांची थेट मागणी."
      ),
      metric: "Live Escrow Demands",
    },
  ];

  return (
    <div className="market-data-sources-card animate-fadeIn">
      <div className="sources-header">
        <div className="sources-title-wrap">
          <Database size={18} color="#15803d" />
          <div>
            <h4>{t("multiSourceDataTitle", "Multi-Source Market Intelligence")}</h4>
            <small>
              {getLabel(
                "Algorithmic recommendations combine 4 verified data feeds to eliminate price guesswork",
                "सटीक सिफारिशों हेतु 4 स्वतंत्र सरकारी व डिजिटल स्रोतों का सम्मिश्रण",
                "अचूक शिफारशींसाठी ४ स्वतंत्र शासकीय व डिजिटल स्त्रोतांचा वापर"
              )}
            </small>
          </div>
        </div>
        <span className="live-pulse-badge">
          <span className="pulse-dot" /> Live Connected
        </span>
      </div>

      <div className="sources-grid">
        {dataSources.map((source) => (
          <div className="source-box" key={source.id}>
            <div className="source-box-top">
              <span
                className="source-tag"
                style={{ backgroundColor: `${source.badgeColor}15`, color: source.badgeColor, borderColor: `${source.badgeColor}40` }}
              >
                {source.badge}
              </span>
              <span className="source-metric">{source.metric}</span>
            </div>
            <strong>{source.title}</strong>
            <p>{source.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketDataSourcesWidget;
