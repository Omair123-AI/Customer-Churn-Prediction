/**
 * RiskCard.jsx — Gauge arc risk score card (subtle styling, no heavy glow)
 */

const RISK_COLORS = { High: "#f87171", Medium: "#fbbf24", Low: "#4ade80" };

function GaugeArc({ score, color, size = 180 }) {
  const r   = 65; const cx = 90; const cy = 90;
  const pct = Math.min(score / 100, 1);
  const dash = pct * Math.PI * r;
  const total = Math.PI * r;
  return (
    <svg width={size} height={Math.round(size * 0.64)} viewBox="0 0 180 116">
      {/* Track */}
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
        fill="none" stroke="#1e293b" strokeWidth={15} />
      {/* Value arc */}
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
        fill="none" stroke={color} strokeWidth={15}
        strokeDasharray={`${dash} ${total}`}
        strokeLinecap="round"
        style={{ transition:"stroke-dasharray 0.9s ease" }}
      />
      {/* Score text */}
      <text x={cx} y={cy - 6}  textAnchor="middle" fill={color}   fontSize={28} fontWeight={800} fontFamily="monospace">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize={11}>/ 100</text>
    </svg>
  );
}

export default function RiskCard({ riskScore = 0, riskLevel = "Low", riskColor, basedOn = {} }) {
  const color = riskColor || RISK_COLORS[riskLevel] || "#4ade80";
  return (
    <div style={{ textAlign:"center" }}>
      <GaugeArc score={riskScore} color={color} />
      <div style={{ marginTop:10 }}>
        <span style={{
          background:   color + "1a",
          color,
          border:       `1px solid ${color}33`,
          borderRadius: 8,
          padding:      "4px 16px",
          fontSize:     12,
          fontWeight:   800,
          letterSpacing:"0.05em",
          textTransform:"uppercase",
        }}>
          {riskLevel} Risk
        </span>
      </div>
      <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[
          { l:"Base Score", v:`${basedOn.base_score  || 0}` },
          { l:"Penalties",  v:`+${basedOn.penalty_points || 0}` },
        ].map((i) => (
          <div key={i.l} style={{ background:"#1e293b", borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
            <div style={{ fontSize:17, fontWeight:800, color, fontFamily:"monospace" }}>{i.v}</div>
            <div style={{ fontSize:10, color:"#64748b", marginTop:3 }}>{i.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
