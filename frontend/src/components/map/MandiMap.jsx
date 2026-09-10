import React, { Component } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const fallbackCenter = [22.7196, 75.8577];

const markerIcon = (price) =>
  L.divIcon({
    className: "mandi-marker-wrap",
    html: `<span class="mandi-marker">₹<small>${Math.round(price || 0)}</small></span>`,
    iconSize: [52, 34],
    iconAnchor: [26, 34],
    popupAnchor: [0, -34],
  });

const nearestIcon = (price) =>
  L.divIcon({
    className: "mandi-marker-wrap mandi-marker-wrap--nearest",
    html: `<span class="mandi-marker">₹<small>${Math.round(price || 0)}</small></span>`,
    iconSize: [58, 38],
    iconAnchor: [29, 38],
    popupAnchor: [0, -38],
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
            <CircleMarker
              center={[userLocation[1], userLocation[0]]}
              radius={8}
              pathOptions={{
                color: "#1f5f3b",
                fillColor: "#f1b24a",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <strong>Your farm location</strong>
                <br />
                Nearest grain mandis are measured from here.
              </Popup>
            </CircleMarker>
          )}
          {pinnedMarkets.map((row) => {
            const market = row.market || row;
            const [longitude, latitude] = market.geo.coordinates;
            const isNearest = row === nearest || row.isNearest;
            return (
              <Marker
                key={row._id || market._id || market.name}
                position={[latitude, longitude]}
                icon={
                  isNearest
                    ? nearestIcon(row.modalPrice)
                    : markerIcon(row.modalPrice)
                }
              >
                <Popup>
                  <strong>
                    {isNearest ? "Nearest grain mandi · " : ""}
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
          {nearest
            ? "Nearest grain mandi pinned"
            : `${pinnedMarkets.length} nearby mandi${
                pinnedMarkets.length === 1 ? "" : "s"
              } pinned`}
        </span>
      </div>
    </MapErrorBoundary>
  );
}
