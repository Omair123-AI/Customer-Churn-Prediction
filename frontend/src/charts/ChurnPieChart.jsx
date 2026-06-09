/**
 * ChurnPieChart.jsx — Donut: Churned vs Active (no excessive glow)
 */
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = { Active: "#4ade80", Churned: "#f87171" };

export default function ChurnPieChart({ churned = 1869, active = 5174 }) {
  const data = [
    { name: "Active",  value: active  },
    { name: "Churned", value: churned },
  ];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data} cx="50%" cy="50%"
          innerRadius={68} outerRadius={98}
          paddingAngle={3} dataKey="value"
        >
          {data.map((e) => (
            <Cell key={e.name} fill={COLORS[e.name]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, fontSize:12 }}
          formatter={(v, n) => [v.toLocaleString(), n]}
        />
        <Legend
          iconType="circle" iconSize={10}
          formatter={(v) => <span style={{ color:"#94a3b8", fontSize:12 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
