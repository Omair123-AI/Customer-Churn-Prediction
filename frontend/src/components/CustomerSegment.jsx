/**
 * CustomerSegment.jsx
 * -------------------
 * Segment badge + description card with all-segments legend.
 */

const ALL_SEGMENTS = [
  { name: "High Value",   icon: "👑", color: "#818cf8", desc: "High CLV, low churn risk" },
  { name: "At Risk",      icon: "⚠️", color: "#f87171", desc: "Needs immediate retention action" },
  { name: "Loyal",        icon: "🏆", color: "#4ade80", desc: "Long tenure, stable profile" },
  { name: "New Customer", icon: "🆕", color: "#60a5fa", desc: "Early onboarding phase" },
  { name: "Inactive",     icon: "😴", color: "#94a3b8", desc: "Low engagement signals" },
  { name: "Stable",       icon: "📊", color: "#fbbf24", desc: "Average risk profile" },
];

export default function CustomerSegment({ segment = {} }) {
  const { segment: name, description, color, icon, priority } = segment;

  return (
    <div>
      {/* Current segment */}
      <div style={{ background: color ? color + "15" : "#1e293b", border: `2px solid ${color || "#818cf8"}44`,
        borderRadius: 16, padding: 20, marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 40 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: color, letterSpacing: "-0.02em" }}>{name}</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{description}</div>
          {priority && (
            <div style={{ marginTop: 8 }}>
              <span style={{ background: "#818cf822", color: "#818cf8", border: "1px solid #818cf844",
                borderRadius: 8, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>
                Action: {priority}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Segment legend */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
        {ALL_SEGMENTS.map((s) => (
          <div key={s.name}
            style={{ background: name === s.name ? s.color + "20" : "#1e293b",
              border: `1px solid ${name === s.name ? s.color + "44" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: name === s.name ? s.color : "#94a3b8" }}>{s.name}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
