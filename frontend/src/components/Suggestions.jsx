/**
 * Suggestions.jsx
 * ---------------
 * Grid of AI retention strategy cards with priority badges.
 */

const PRIORITY_COLORS = { High: "#f87171", Medium: "#fbbf24", Low: "#4ade80" };

function SuggestionCard({ action, priority, category, icon, impact, effort }) {
  const pc = PRIORITY_COLORS[priority] || "#94a3b8";
  return (
    <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14,
      padding: 18, display: "flex", gap: 14, alignItems: "flex-start" }}>
      <span style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: "#f1f5f9", marginBottom: 8, lineHeight: 1.4 }}>{action}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ background: pc + "22", color: pc, border: `1px solid ${pc}44`, borderRadius: 6, padding: "2px 10px", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
            {priority}
          </span>
          <span style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 6, padding: "2px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
            {category}
          </span>
          {effort && (
            <span style={{ background: "rgba(148,163,184,0.1)", color: "#94a3b8", borderRadius: 6, padding: "2px 10px", fontSize: 10, fontWeight: 600 }}>
              Effort: {effort}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{impact}</div>
      </div>
    </div>
  );
}

export default function Suggestions({ suggestions = [] }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {suggestions.map((s, i) => <SuggestionCard key={i} {...s} />)}
      </div>
      {suggestions.length === 0 && (
        <div style={{ textAlign: "center", color: "#64748b", padding: 40 }}>No suggestions available</div>
      )}
    </div>
  );
}
