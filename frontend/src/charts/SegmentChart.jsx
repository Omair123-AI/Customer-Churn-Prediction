/**
 * SegmentChart.jsx
 * ----------------
 * Donut chart of customer segment distribution.
 */

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const SEG_COLORS = {
  "High Value":   "#818cf8",
  "At Risk":      "#f87171",
  "Loyal":        "#4ade80",
  "New Customer": "#60a5fa",
  "Inactive":     "#94a3b8",
};

export default function SegmentChart({ data = {} }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
          {chartData.map((e) => (
            <Cell key={e.name} fill={SEG_COLORS[e.name] || "#818cf8"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8 }}
          formatter={(v, n) => [v.toLocaleString(), n]}
        />
        <Legend
          iconType="circle" iconSize={10}
          formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
