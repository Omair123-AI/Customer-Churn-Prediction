/**
 * RiskBarChart.jsx — Horizontal bars: risk level distribution (no glow)
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = { High: "#f87171", Medium: "#fbbf24", Low: "#4ade80" };
const BG     = "#1e293b";
const BORDER = "rgba(255,255,255,0.08)";

const CustomTooltip = ({ active, payload }) =>
  active && payload?.length ? (
    <div style={{ background:BG, border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 14px", fontSize:12 }}>
      <p style={{ color:"#f1f5f9", fontWeight:700, margin:0 }}>{payload[0].payload.name} Risk</p>
      <p style={{ color:payload[0].fill, margin:"4px 0 0", fontFamily:"monospace" }}>
        {payload[0].value.toLocaleString()} customers
      </p>
    </div>
  ) : null;

export default function RiskBarChart({ data = { High: 1320, Medium: 2850, Low: 2873 } }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" barSize={24} margin={{ left:10, right:20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
        <XAxis type="number" tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fill:"#94a3b8", fontSize:12 }} axisLine={false} tickLine={false} width={60} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[0,6,6,0]}>
          {chartData.map((e) => <Cell key={e.name} fill={COLORS[e.name] || "#818cf8"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
