/**
 * RevenueChart.jsx
 * ----------------
 * Grouped bar: Active vs Churned customers per monthly-charge bucket.
 * Handles the backend dict format: { "$30-50": { total, churned, rate }, ... }
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const BG     = "#1e293b";
const BORDER = "rgba(255,255,255,0.08)";

const CustomTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div style={{ background:BG, border:`1px solid ${BORDER}`, borderRadius:8, padding:"10px 14px", fontSize:12 }}>
      <p style={{ color:"#f1f5f9", fontWeight:700, marginBottom:6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color:p.fill, margin:"2px 0", fontFamily:"monospace" }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  ) : null;

// Cleans bucket keys that sometimes come through as Python repr strings
function cleanLabel(raw) {
  if (!raw) return "?";
  // e.g. "$30-50" → "$30-50", already clean
  return String(raw).replace(/['"]/g, "").trim();
}

export default function RevenueChart({ data = {} }) {
  const chartData = Object.entries(data)
    .map(([bucket, vals]) => {
      const total   = typeof vals === "object" ? (vals.total   || 0) : 0;
      const churned = typeof vals === "object" ? (vals.churned || 0) : 0;
      return {
        name:    cleanLabel(bucket),
        Active:  Math.max(0, total - churned),
        Churned: churned,
      };
    })
    // Filter out malformed keys that are Python-repr artefacts
    .filter((d) => !d.name.includes("rate") && !d.name.includes("total") && d.name.length < 20);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} barSize={18} barGap={3} margin={{ left:4, right:4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
        <XAxis dataKey="name" tick={{ fill:"#94a3b8", fontSize:10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill:"#94a3b8", fontSize:10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(v) => <span style={{ color:"#94a3b8", fontSize:11 }}>{v}</span>} />
        <Bar dataKey="Active"  fill="#4ade80" radius={[4,4,0,0]} />
        <Bar dataKey="Churned" fill="#f87171" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
