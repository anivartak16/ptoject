import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Cell,
} from "recharts";

const COLORS = {
  min: "#94a3b8",
  modal: "#16a34a",
  max: "#0284c7",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload || {};
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dce8de",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(24,62,39,.12)",
        padding: "10px 14px",
        fontSize: 12,
        minWidth: 180,
      }}
    >
      <strong style={{ display: "block", marginBottom: 4, color: "#0f172a" }}>
        {item.name}
      </strong>
      {item.location && (
        <span style={{ display: "block", color: "#64748b", fontSize: 11, marginBottom: 6 }}>
          {item.location}
        </span>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ color: COLORS.modal, fontWeight: 700 }}>
          Modal: ₹{Number(item.modalPrice).toLocaleString("en-IN")}/qtl
        </span>
        {item.minPrice && (
          <span style={{ color: COLORS.min }}>
            Min: ₹{Number(item.minPrice).toLocaleString("en-IN")}/qtl
          </span>
        )}
        {item.maxPrice && (
          <span style={{ color: COLORS.max }}>
            Max: ₹{Number(item.maxPrice).toLocaleString("en-IN")}/qtl
          </span>
        )}
        {item.arrivalDate && (
          <span style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
            Arrival: {new Date(item.arrivalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        )}
        {item.source && (
          <span style={{ color: "#94a3b8", fontSize: 11 }}>
            Source: {item.source}
          </span>
        )}
      </div>
    </div>
  );
}

export function MandiRateChart({
  markets = [],
  title = "Nearby grain mandi rates",
  height = 280,
  commodity = "",
}) {
  // Build chart data directly from real DB values in ₹/quintal
  const data = markets
    .filter((row) => row.market?.name && row.modalPricePerQtl > 0)
    .map((row) => {
      // Prefer raw per-qtl fields; fall back gracefully
      const modalQtl = row.modalPricePerQtl || row.modalPrice * 100;
      const minQtl =
        row.minPrice && row.minPrice > 150
          ? row.minPrice            // already in qtl
          : row.minPriceQtl || (row.minPrice ? row.minPrice * 100 : undefined);
      const maxQtl =
        row.maxPrice && row.maxPrice > 150
          ? row.maxPrice
          : row.maxPriceQtl || (row.maxPrice ? row.maxPrice * 100 : undefined);

      const shortName = (row.market?.name || "Mandi")
        .replace(/ APMC$/, "")
        .replace(/ Mandi$/, "")
        .replace(/ Krishi Mandi$/, "");

      return {
        name: shortName,
        modalPrice: Math.round(modalQtl),
        minPrice: minQtl ? Math.round(minQtl) : undefined,
        maxPrice: maxQtl ? Math.round(maxQtl) : undefined,
        location: row.market?.location || row.market?.district,
        arrivalDate: row.arrivalDate,
        source: row.source,
        distanceKm: row.distanceKm,
        netPrice: row.netPrice,
      };
    });

  const displayCommodity = commodity || "Grain";

  if (data.length === 0) {
    return (
      <>
        <div className="chart-heading">
          <div>
            <p className="eyebrow">
              <span className="live-dot" /> LIVE MANDI RATES
            </p>
            <h3>{title}</h3>
          </div>
        </div>
        <div style={{ padding: "32px 0", textAlign: "center", color: "#718078", fontSize: 14 }}>
          No nearby mandis currently reporting live trades for {displayCommodity}.
        </div>
      </>
    );
  }

  // Dynamic Y-axis domain
  const allVals = data.flatMap((d) =>
    [d.modalPrice, d.minPrice, d.maxPrice].filter(Boolean)
  );
  const yMin = Math.max(0, Math.min(...allVals) - 100);
  const yMax = Math.max(...allVals) + 150;

  return (
    <>
      <div className="chart-heading">
        <div>
          <p className="eyebrow">
            <span className="live-dot" /> LIVE MANDI RATES · ₹/QUINTAL
          </p>
          <h3>{title}</h3>
        </div>
        <span className="chart-change positive">{data.length} mandis</span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 14, right: 10, left: 0, bottom: 24 }}
          barGap={2}
          barCategoryGap="30%"
        >
          <CartesianGrid
            stroke="#e7eee8"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#718078" }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={52}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 11, fill: "#718078" }}
            tickLine={false}
            axisLine={false}
            width={62}
            tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
          />
          {data.some((d) => d.minPrice) && (
            <Bar dataKey="minPrice" name="Min Price" fill={COLORS.min} radius={[3, 3, 0, 0]} />
          )}
          <Bar dataKey="modalPrice" name="Modal Price" fill={COLORS.modal} radius={[3, 3, 0, 0]} />
          {data.some((d) => d.maxPrice) && (
            <Bar dataKey="maxPrice" name="Max Price" fill={COLORS.max} radius={[3, 3, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
      <small style={{ color: "#718078" }}>
        Live AGMARKNET arrival prices for {displayCommodity} (₹/quintal) — each bar group is one mandi.
      </small>
    </>
  );
}

export default MandiRateChart;