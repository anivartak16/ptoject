import React from "react";
import { Link } from "react-router-dom";

export function CropPriceTable() {
  return (
    <section className="agri-market-board">
      <div className="agri-market-heading">
        <div>
          <p className="eyebrow">LIVE AGRI MARKET</p>
          <h2>The market is moving. Stay ahead.</h2>
          <p>
            Compare crop prices, daily movement and buyer demand before you
            decide where to sell.
          </p>
        </div>

        <div className="market-index">
          <span className="market-live-dot" />
          MARKET OPEN
        </div>
      </div>

      {/* MARKET SUMMARY */}
      <div className="market-summary">
        <div>
          <small>RISING CROPS</small>
          <strong className="green-text">↑ 8</strong>
        </div>

        <div>
          <small>FALLING CROPS</small>
          <strong>↓ 2</strong>
        </div>

        <div>
          <small>HIGHEST DEMAND</small>
          <strong>🌶️ Chilli</strong>
        </div>

        <div>
          <small>MARKET VOLUME</small>
          <strong>5,842 qtl</strong>
        </div>
      </div>

      {/* PRICE TABLE */}
      <div className="agri-price-table">
        <div className="agri-table-header">
          <span>CROP</span>
          <span>CURRENT PRICE</span>
          <span>TODAY</span>
          <span>PRICE MOVEMENT</span>
          <span>DEMAND</span>
          <span></span>
        </div>

        {/* WHEAT */}
        <div className="agri-price-row">
          <div className="agri-crop">
            <span className="agri-crop-icon">🌾</span>
            <div>
              <strong>Wheat</strong>
              <small>Cereal</small>
            </div>
          </div>
          <strong className="agri-price">₹2,558/qtl</strong>
          <span className="price-up">▲ 1.97%</span>
          <div className="mini-trend">
            <svg viewBox="0 0 100 35" preserveAspectRatio="none">
              <polyline points="0,28 12,22 25,25 38,14 50,19 63,9 76,15 88,5 100,10" />
            </svg>
          </div>
          <span className="demand-badge high">HIGH</span>
          <Link to="/register/buyer" className="market-arrow">
            →
          </Link>
        </div>

        {/* SOYBEAN */}
        <div className="agri-price-row">
          <div className="agri-crop">
            <span className="agri-crop-icon">🌱</span>
            <div>
              <strong>Soybean</strong>
              <small>Oilseed</small>
            </div>
          </div>
          <strong className="agri-price">₹4,620/qtl</strong>
          <span className="price-up">▲ 0.84%</span>
          <div className="mini-trend">
            <svg viewBox="0 0 100 35" preserveAspectRatio="none">
              <polyline points="0,28 12,22 25,25 38,14 50,19 63,9 76,15 88,5 100,10" />
            </svg>
          </div>
          <span className="demand-badge high">HIGH</span>
          <Link to="/register/buyer" className="market-arrow">
            →
          </Link>
        </div>

        {/* MAIZE */}
        <div className="agri-price-row">
          <div className="agri-crop">
            <span className="agri-crop-icon">🌽</span>
            <div>
              <strong>Maize</strong>
              <small>Cereal</small>
            </div>
          </div>
          <strong className="agri-price">₹2,180/qtl</strong>
          <span className="price-down">▼ 0.42%</span>
          <div className="mini-trend">
            <svg viewBox="0 0 100 35" preserveAspectRatio="none">
              <polyline points="0,28 12,22 25,25 38,14 50,19 63,9 76,15 88,5 100,10" />
            </svg>
          </div>
          <span className="demand-badge medium">MEDIUM</span>
          <Link to="/register/buyer" className="market-arrow">
            →
          </Link>
        </div>

        {/* GRAM */}
        <div className="agri-price-row">
          <div className="agri-crop">
            <span className="agri-crop-icon">🫘</span>
            <div>
              <strong>Gram</strong>
              <small>Pulse</small>
            </div>
          </div>
          <strong className="agri-price">₹5,420/qtl</strong>
          <span className="price-up">▲ 1.21%</span>
          <div className="mini-trend">
            <svg viewBox="0 0 100 35" preserveAspectRatio="none">
              <polyline points="0,28 12,22 25,25 38,14 50,19 63,9 76,15 88,5 100,10" />
            </svg>
          </div>
          <span className="demand-badge high">HIGH</span>
          <Link to="/register/buyer" className="market-arrow">
            →
          </Link>
        </div>

        {/* ONION */}
        <div className="agri-price-row">
          <div className="agri-crop">
            <span className="agri-crop-icon">🧅</span>
            <div>
              <strong>Onion</strong>
              <small>Vegetable</small>
            </div>
          </div>
          <strong className="agri-price">₹2,840/qtl</strong>
          <span className="price-up">▲ 2.10%</span>
          <div className="mini-trend">
            <svg viewBox="0 0 100 35" preserveAspectRatio="none">
              <polyline points="0,28 12,22 25,25 38,14 50,19 63,9 76,15 88,5 100,10" />
            </svg>
          </div>
          <span className="demand-badge high">HIGH</span>
          <Link to="/register/buyer" className="market-arrow">
            →
          </Link>
        </div>

        {/* CHILLI */}
        <div className="agri-price-row featured-crop">
          <div className="agri-crop">
            <span className="agri-crop-icon">🌶️</span>
            <div>
              <strong>Chilli</strong>
              <small>Spice</small>
            </div>
          </div>
          <strong className="agri-price">₹8,200/qtl</strong>
          <span className="price-up">▲ 3.42%</span>
          <div className="mini-trend">
            <svg viewBox="0 0 100 35" preserveAspectRatio="none">
              <polyline points="0,28 12,22 25,25 38,14 50,19 63,9 76,15 88,5 100,10" />
            </svg>
          </div>
          <span className="demand-badge very-high">VERY HIGH</span>
          <Link to="/register/buyer" className="market-arrow">
            →
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <div className="market-board-footer">
        <span>Prices shown are indicative market rates</span>
        <Link to="/register/farmer">Explore full market →</Link>
      </div>
    </section>
  );
}

export default CropPriceTable;
