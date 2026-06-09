/**
 * RetentionChart.jsx
 * ------------------
 * Area chart showing churn rate trend across tenure buckets.
 * Also doubles as the contract/internet churn comparison chart.
 */

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const BG = "#1e293b";
const BORDER = "rgba(255,255,255,0.07)";

const CustomTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 14px" }}>
      <p style={{ color: "#f1f5f9", fontWeight: 700, margin: 0 }}>{label}</p>
      <p style={{ color: "#2dd4bf", margin: "4px 0 0", fontFamily: "'DM Mono',monospace" }}>
        Churn Rate: {payload[0].value}%
      </p>
    </div>
  ) : null;

export function TenureChurnChart({ data = {} }) {
  const chartData = Object.entries(data).map(([k, v]) => ({ name: k, rate: v }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ right: 10 }}>
        <defs>
          <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2dd4bf" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 60]} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="rate" stroke="#2dd4bf" strokeWidth={2.5}
          fill="url(#tealGrad)" dot={{ fill: "#2dd4bf", r: 4, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ContractChurnChart({ data = {} }) {
  const chartData = Object.entries(data).map(([k, v]) => ({ name: k.replace("Month-to-month", "M2M"), rate: v }));
  const COLORS = ["#f87171", "#fbbf24", "#4ade80"];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} barSize={50}>
        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 50]} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default TenureChurnChart;
