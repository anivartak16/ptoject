import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { MandiRateChart } from "../components/charts/MandiRateChart.jsx";
import MandiMap from "../components/map/MandiMap.jsx";
import { DemandsPage } from "./DemandsPage.jsx";
import { FpoAggregationPage } from "./FpoAggregationPage.jsx";
import { InspectionPage } from "./InspectionPage.jsx";
import { DisputesPage } from "./DisputesPage.jsx";
import { AnalyticsPage } from "./AnalyticsPage.jsx";
import { VerificationBadge } from "../components/common/VerificationBadge.jsx";
import { TrustProfileModal } from "../components/profile/TrustProfileModal.jsx";

export function OperationalPage({ title, type }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [note, setNote] = useState("");
  const [booking, setBooking] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingHistory, setBookingHistory] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const endpoint =
    type === "prices"
      ? "/markets/nearby?commodity=Wheat"
      : type === "storage"
        ? "/storage"
        : type === "logistics"
          ? "/logistics/providers"
          : type === "notifications"
            ? "/notifications"
            : type === "demands"
              ? "/demands"
              : type === "payments"
                ? "/payments"
                : type === "disputes"
                  ? "/disputes"
                  : type === "admin" && user?.role === "ADMIN"
                    ? "/admin/users"
                    : null;

  useEffect(() => {
    if (endpoint) {
      api
        .get(endpoint)
        .then((x) => setRows(x.data.data))
        .catch(() => setNote("No records available yet."));
    }
    if (type === "storage" || type === "logistics") {
      api
        .get(type === "storage" ? "/storage/bookings" : "/logistics/bookings")
        .then((x) => setBookingHistory(x.data.data))
        .catch(() => {});
    }
  }, [type, endpoint]);

  const submitBooking = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...booking.form };
      if (type === "storage") {
        payload.warehouseId = booking.id;
        payload.quantity = Number(payload.quantity);
        payload.days = Number(payload.days);
        await api.post("/storage/book", payload);
      } else {
        payload.providerId = booking.id;
        payload.quantity = Number(payload.quantity);
        payload.distanceKm = Number(payload.distanceKm);
        await api.post("/logistics/book", payload);
      }
      setBooking(null);
      setBookingMessage("Booking request created successfully.");
      const history = await api.get(
        type === "storage" ? "/storage/bookings" : "/logistics/bookings"
      );
      setBookingHistory(history.data.data);
    } catch (e) {
      setBookingMessage(
        e.response?.data?.message || "Could not create booking."
      );
    }
  };

  const displayRows =
    type === "prices"
      ? [
          ...new Map(
            rows.map((row) => [row.market?._id || row.market?.name, row])
          ).values(),
        ]
      : rows;

  if (type === "demands" && user?.role === "BUYER") return <DemandsPage />;
  if (type === "aggregation" && user?.role === "FPO")
    return <FpoAggregationPage />;
  if (type === "inspections" && user?.role === "KRISHI_KENDRA")
    return <InspectionPage />;
  if (type === "disputes") return <DisputesPage />;
  if (type === "analytics" && user?.role === "ADMIN")
    return <AnalyticsPage />;

  if (type === "admin" && user?.role === "ADMIN") {
    return (
      <section>
        <p className="eyebrow">ADMINISTRATION</p>
        <h1>{title}</h1>
        <p>Review registered accounts and verification state.</p>
        <div className="data-list">
          {rows.map((x) => (
            <div className="panel" key={x._id}>
              <StatusBadge>{x.verification}</StatusBadge>
              <h3>{x.name}</h3>
              <p>
                {x.email} · {x.role} · {x.location || "Location not provided"}
              </p>
              <button
                onClick={() =>
                  api
                    .patch(`/admin/users/${x._id}`, {
                      verification:
                        x.verification === "VERIFIED" ? "PENDING" : "VERIFIED",
                    })
                    .then(() =>
                      setRows((current) =>
                        current.map((row) =>
                          row._id === x._id
                            ? {
                                ...row,
                                verification:
                                  row.verification === "VERIFIED"
                                    ? "PENDING"
                                    : "VERIFIED",
                              }
                            : row
                        )
                      )
                    )
                }
              >
                Toggle verification
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const detail =
    type === "prices"
      ? "Compare current mandi modal prices, arrivals and price range before selling."
      : type === "storage"
        ? "Verified nearby storage options. Booking workflow is ready for provider integration."
        : type === "logistics"
          ? "Available transport providers for pickup and delivery coordination."
          : type === "notifications"
            ? "Offer, transaction, payment and logistics updates appear here."
            : type === "payments"
              ? "Prototype payment tracking — no external payment gateway is used."
              : type === "aggregation"
                ? "Select farmer lots and aggregate them into a larger FPO marketable lot."
                : type === "admin"
                  ? "Manage verification, marketplace governance and analytics from this control centre."
                  : "This workspace module is ready for the next marketplace record.";

  return (
    <section>
      <p className="eyebrow">OPERATIONS</p>
      <h1>{title}</h1>
      <p>{detail}</p>

      {type === "prices" && (
        <div className="panel mandi-rate-chart-panel">
          <MandiRateChart
            markets={displayRows}
            title="Latest rates by grain mandi"
            commodity="Wheat"
          />
        </div>
      )}

      {type === "prices" && (
        <div className="panel mandi-map-panel">
          <h3>Nearest mandi locations</h3>
          <p>
            Each pin corresponds to a mandi rate shown in the chart and cards
            below.
          </p>
          <MandiMap markets={displayRows} />
        </div>
      )}

      {type === "aggregation" && (
        <div className="panel">
          <h3>FPO aggregation workflow</h3>
          <div className="timeline">
            <span>1. Select farmer produce</span>
            <span>2. Review quality</span>
            <span>3. Aggregate quantity</span>
            <span>4. Publish FPO lot</span>
          </div>
          <Link className="primary" to="/fpo/lots">
            View aggregated lots
          </Link>
        </div>
      )}

      {type === "payments" && (
        <div className="panel">
          <h3>Payment transparency</h3>
          <p>
            Payments are created when an offer becomes a transaction. Status
            transitions are recorded as PENDING → PROCESSING → PAID.
          </p>
          <StatusBadge>PENDING</StatusBadge>
        </div>
      )}

      {bookingMessage && (
        <div className="form-message success">{bookingMessage}</div>
      )}

      {(type === "storage" || type === "logistics") &&
        bookingHistory.length > 0 && (
          <div className="panel booking-history">
            <h3>Your booking history</h3>
            {bookingHistory.map((item) => (
              <div className="market-row" key={item._id}>
                <b>
                  {type === "storage"
                    ? item.warehouse?.name
                    : item.provider?.name}
                </b>
                <span>{item.status}</span>
                <small>
                  {item.quantity} kg · ₹
                  {item.estimatedCost?.toLocaleString("en-IN")}
                </small>
              </div>
            ))}
          </div>
        )}

      {type === "admin" && (
        <div className="panel">
          <h3>Verification queue</h3>
          <p>
            Farmer, FPO and buyer verifications are represented in the database
            and are accessible only to the administrator role.
          </p>
          <StatusBadge>ADMIN ONLY</StatusBadge>
        </div>
      )}

      <div className="data-list">
        {displayRows.map((x) => (
          <div
            className="panel"
            key={x._id || x.market?._id || x.market?.name || x.name}
          >
            {type === "prices" && (
              <>
                <h3>{x.market?.name}</h3>
                <b>₹{x.modalPrice}/kg modal</b>
                <p>
                  Range ₹{x.minPrice}–₹{x.maxPrice} · Arrival {x.arrivalVolume}
                </p>
              </>
            )}

            {type === "storage" && (
              <>
                <h3>{x.name}</h3>
                <p>
                  {x.location} · {x.availableCapacity} kg available
                </p>
                <b>₹{x.pricePerUnitPerDay}/unit/day</b>
                <p>{x.facilities?.join(" · ")}</p>
                <button
                  className="primary"
                  onClick={() =>
                    setBooking({
                      id: x._id,
                      form: { quantity: "100", days: "3" },
                    })
                  }
                >
                  Book storage
                </button>
                {booking?.id === x._id && (
                  <form className="inline-form" onSubmit={submitBooking}>
                    <input
                      type="number"
                      min="1"
                      max={x.availableCapacity}
                      placeholder="Quantity"
                      value={booking.form.quantity}
                      onChange={(e) =>
                        setBooking({
                          ...booking,
                          form: { ...booking.form, quantity: e.target.value },
                        })
                      }
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Days"
                      value={booking.form.days}
                      onChange={(e) =>
                        setBooking({
                          ...booking,
                          form: { ...booking.form, days: e.target.value },
                        })
                      }
                      required
                    />
                    <button className="primary" type="submit">
                      Confirm booking
                    </button>
                  </form>
                )}
              </>
            )}

            {type === "logistics" && (
              <>
                <h3>{x.name}</h3>
                <p>
                  {x.vehicleType} · Capacity {x.capacity} kg
                </p>
                <b>₹{x.pricePerKm}/km</b>
                <p>{x.serviceAreas?.join(" · ")}</p>
                <button
                  className="primary"
                  onClick={() =>
                    setBooking({
                      id: x._id,
                      form: {
                        pickupLocation: user?.location || "",
                        deliveryLocation: "",
                        quantity: "100",
                        distanceKm: "20",
                      },
                    })
                  }
                >
                  Request transport
                </button>
                {booking?.id === x._id && (
                  <form className="inline-form" onSubmit={submitBooking}>
                    <input
                      placeholder="Pickup location"
                      value={booking.form.pickupLocation}
                      onChange={(e) =>
                        setBooking({
                          ...booking,
                          form: {
                            ...booking.form,
                            pickupLocation: e.target.value,
                          },
                        })
                      }
                      required
                    />
                    <input
                      placeholder="Delivery location"
                      value={booking.form.deliveryLocation}
                      onChange={(e) =>
                        setBooking({
                          ...booking,
                          form: {
                            ...booking.form,
                            deliveryLocation: e.target.value,
                          },
                        })
                      }
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={booking.form.quantity}
                      onChange={(e) =>
                        setBooking({
                          ...booking,
                          form: { ...booking.form, quantity: e.target.value },
                        })
                      }
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Distance (km)"
                      value={booking.form.distanceKm}
                      onChange={(e) =>
                        setBooking({
                          ...booking,
                          form: { ...booking.form, distanceKm: e.target.value },
                        })
                      }
                      required
                    />
                    <button className="primary" type="submit">
                      Confirm request
                    </button>
                  </form>
                )}
              </>
            )}

            {type === "notifications" && (
              <>
                <StatusBadge>{x.type}</StatusBadge>
                <h3>{x.message}</h3>
                <small>{new Date(x.createdAt).toLocaleString()}</small>
              </>
            )}

            {type === "payments" && x.transaction && (
              <>
                <StatusBadge>{x.status}</StatusBadge>
                <h3>{x.transaction.lot?.commodity || "Transaction"} payment</h3>
                <p>
                  ₹{x.amount?.toLocaleString("en-IN")} · {x.paymentMethod}
                </p>
                <small>Transaction status: {x.transaction.status}</small>
              </>
            )}

            {type === "demands" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <StatusBadge>{x.status}</StatusBadge>
                  {x.buyer && (
                    <VerificationBadge
                      status={x.buyer.verification}
                      kycVerified={x.buyer.kycVerified}
                      showKyc={true}
                      size="sm"
                    />
                  )}
                </div>
                <h3>
                  {x.commodity} · {x.requiredQuantity} kg
                </h3>
                <p>
                  Max ₹{x.maxPrice}/kg · {x.preferredLocation}
                </p>

                {x.buyer && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      margin: "8px 0",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      flexWrap: "wrap",
                      gap: "6px",
                    }}
                  >
                    <div>
                      <small style={{ color: "var(--muted)", display: "block" }}>Buyer Organization</small>
                      <b>{x.buyer.organizationName || x.buyer.name}</b>
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: "3px 8px",
                        fontSize: "11px",
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                      onClick={() => setSelectedUserId(x.buyer._id || x.buyer.id)}
                    >
                      🛡️ View Buyer Profile ↗
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      {note && <p>{note}</p>}

      <TrustProfileModal
        isOpen={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
        userId={selectedUserId}
      />
    </section>
  );
}

export default OperationalPage;
