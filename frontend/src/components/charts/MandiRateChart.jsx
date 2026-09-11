import React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function MandiRateChart({
  markets = [],
  title = "Nearby grain mandi rates",
  height = 280,
}) {
  const data = markets.map((row) => ({
    name: row.market?.name?.replace(/ Mandi$/, "") || "Mandi",
    modalPrice: row.modalPrice,
    location: row.market?.location,
    distanceKm: row.distanceKm,
  }));

  return (
    <>
      <div className="chart-heading">
        <div>
          <p className="eyebrow">
            <span className="live-dot" /> LIVE MANDI RATES
          </p>
          <h3>{title}</h3>
        </div>
        <span className="chart-change positive">{data.length} mandis</span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 14, right: 10, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            stroke="#e7eee8"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#718078" }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-22}
            textAnchor="end"
            height={48}
          />
          <YAxis
            domain={["dataMin - 15", "dataMax + 15"]}
            tick={{ fontSize: 11, fill: "#718078" }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            formatter={(value) => [
              `₹${Number(value).toLocaleString("en-IN")}/kg`,
              "Modal price",
            ]}
            labelFormatter={(label) => `${label} Mandi`}
            contentStyle={{
              border: "1px solid #dce8de",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(24, 62, 39, .12)",
            }}
          />
          <Line
            type="monotone"
            dataKey="modalPrice"
            stroke="#17804b"
            strokeWidth={3}
            dot={{ r: 5, fill: "#fff", strokeWidth: 2, stroke: "#17804b" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <small>
        Latest modal wheat price for each mandi near the farmer location.
      </small>
    </>
  );
}

export default MandiRateChart;
