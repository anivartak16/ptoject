import React, { Component } from "react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const fallbackCenter = [22.7196, 75.8577];

const createMandiPin = (price, marketName, isNearest = false) => {
  const displayName = marketName ? marketName.replace(/\s*Mandi$/i, "") : "";
  const pinFill = isNearest ? "#16a34a" : "#1e293b";
  const centerFill = isNearest ? "#facc15" : "#38bdf8";

  return L.divIcon({
    className: `mandi-pin-leaflet-icon ${isNearest ? "is-nearest" : ""}`,
    html: `
      <div class="mandi-pin-wrapper">
        ${isNearest ? '<div class="mandi-pin-radar"></div>' : ""}
        <div class="mandi-pin-badge">
          ${isNearest ? '<span class="mandi-pin-star">★</span>' : ""}
          <span class="mandi-pin-price">₹${Math.round(price || 0)}</span>
          ${displayName ? `<span class="mandi-pin-name">${displayName}</span>` : ""}
        </div>
        <div class="mandi-pin-needle">
          <svg viewBox="0 0 32 42" width="32" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z"
                  fill="${pinFill}"
                  stroke="#ffffff"
                  stroke-width="2.5" />
            <circle cx="16" cy="15" r="6" fill="#ffffff" />
            <circle cx="16" cy="15" r="3.2" fill="${centerFill}" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -46],
  });
};

const userFarmPin = () =>
  L.divIcon({
    className: "mandi-pin-leaflet-icon is-farm",
    html: `
      <div class="mandi-pin-wrapper">
        <div class="mandi-pin-badge farm-badge">
          <span>🏡 Your Farm</span>
        </div>
        <div class="mandi-pin-needle">
          <svg viewBox="0 0 32 42" width="32" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z"
                  fill="#ea580c"
                  stroke="#ffffff"
                  stroke-width="2.5" />
            <circle cx="16" cy="15" r="6.5" fill="#ffffff" />
            <circle cx="16" cy="15" r="3.2" fill="#ea580c" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -46],
  });

class MapErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="map-unavailable">
          Map is temporarily unavailable. Market prices and nearby mandi details
          remain available below.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MandiMap({ markets = [], userLocation, compact = false }) {
  const pinnedMarkets = markets.filter((row) => {
    const coordinates = row.market?.geo?.coordinates || row.geo?.coordinates;
    return Array.isArray(coordinates) && coordinates.length === 2;
  });
  const firstMarket = pinnedMarkets[0]?.market || pinnedMarkets[0];
  const center = firstMarket
    ? [...firstMarket.geo.coordinates].reverse()
    : fallbackCenter;
  const nearest = pinnedMarkets.find((row) => row.isNearest) || pinnedMarkets[0];

  if (!pinnedMarkets.length) {
    return (
      <div className="map-unavailable">
        No mapped mandi coordinates are available yet. Run the demo seed once to
        load them.
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <div className={`mandi-map ${compact ? "mandi-map--compact" : ""}`}>
        <MapContainer
          center={center}
          zoom={compact ? 7 : 6}
          scrollWheelZoom={false}
          zoomControl={false}
          aria-label="Nearest mandi map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          {userLocation?.length === 2 && (
            <Marker
              position={[userLocation[1], userLocation[0]]}
              icon={userFarmPin()}
            >
              <Popup>
                <strong>🏡 Your farm location</strong>
                <br />
                Nearest grain mandis and transport distances are measured from here.
              </Popup>
            </Marker>
          )}
          {pinnedMarkets.map((row) => {
            const market = row.market || row;
            const [longitude, latitude] = market.geo.coordinates;
            const isNearest = row === nearest || row.isNearest;
            return (
              <Marker
                key={row._id || market._id || market.name}
                position={[latitude, longitude]}
                icon={createMandiPin(
                  row.modalPrice,
                  market.name || market.location,
                  isNearest
                )}
              >
                <Popup>
                  <strong>
                    {isNearest ? "★ Nearest grain mandi · " : ""}
                    {market.name}
                  </strong>
                  <br />
                  {market.location} · {row.commodity || "Market price"}
                  <br />
                  <b>₹{row.modalPrice}/kg</b> · {row.arrivalVolume ?? "—"} qtl
                  arrivals
                  {Number.isFinite(row.distanceKm) && (
                    <>
                      <br />
                      {row.distanceKm} km away
                    </>
                  )}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        <span className="map-caption">
          📍 {nearest
            ? `Nearest: ${nearest.market?.name || nearest.name || "Indore Mandi"} pinned`
            : `${pinnedMarkets.length} nearby mandis pinned`}
        </span>
      </div>
    </MapErrorBoundary>
  );
}
