/**
 * Home.jsx — Landing page
 */

const C = { accent: "#6d72e8", accentDark: "#4f52c9", teal: "#2a9d8f", red: "#e05252",
  text: "#f1f5f9", muted: "#94a3b8", faint: "#475569", bg: "#0f172a", panel: "#1e293b",
  border: "rgba(255,255,255,0.07)", accentGlow: "rgba(129,140,248,0.15)", borderAccent: "rgba(129,140,248,0.3)" };

const STATS = [
  { v: "84.4%", l: "Model ROC-AUC",       c: C.accent },
  { v: "7,043", l: "Customers Analysed",   c: C.teal },
  { v: "26.5%", l: "Baseline Churn Rate",  c: C.red },
  { v: "34",    l: "Predictive Features",  c: "#c97d2e" },
];

const FEATURES = [
  { icon:"🔮", title:"Churn Prediction",   desc:"Ensemble ML (RF + GB + LR) with 84.4% AUC. Instant churn probability and verdict." },
  { icon:"⚡", title:"Risk Scoring",       desc:"0–100 composite risk score with multi-factor penalty analysis." },
  { icon:"🧬", title:"Explainable AI",     desc:"Understand exactly why each customer is predicted to churn, with impact percentages." },
  { icon:"💎", title:"CLV Analysis",       desc:"Customer lifetime value, revenue at risk, and expected retention revenue." },
  { icon:"🎯", title:"Retention Engine",   desc:"Personalised 6-point action plans drawn from 5,000+ retention strategy rules." },
  { icon:"📊", title:"Analytics Dashboard",desc:"Real-time KPIs, churn trends, segment distribution, and model performance metrics." },
  { icon:"🎮", title:"Campaign Simulator", desc:"Model the impact of discounts and contract changes on churn probability." },
  { icon:"📄", title:"PDF Reports",        desc:"One-click professional PDF report with all analysis sections included." },
];

const TECH_STACK = [
  { cat: "Frontend",    items: ["React.js","Tailwind CSS","Recharts","Framer Motion","Axios"] },
  { cat: "Backend",     items: ["Flask","Gunicorn","Python 3.11","REST API"] },
  { cat: "ML",          items: ["Scikit-Learn","Random Forest","Gradient Boosting","LR Ensemble"] },
  { cat: "Data",        items: ["Pandas","NumPy","7,043 records","34 features"] },
  { cat: "Reports",     items: ["ReportLab","Matplotlib","PDF Generation"] },
  { cat: "Database",    items: ["SQLite","PostgreSQL ready"] },
];

export default function Home({ navigate }) {
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "60px 0 52px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% -10%, ${C.accentGlow}, transparent 65%)`, pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentGlow,
          border: `1px solid ${C.borderAccent}`, borderRadius: 100, padding: "6px 18px", marginBottom: 28 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3a9e5a",
            boxShadow: "0 0 10px #4ade80", display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>ML Model Active · 84.4% AUC · 7,043 Records</span>
        </div>

        <h1 style={{ fontSize: "clamp(32px,5.5vw,60px)", fontWeight: 900, lineHeight: 1.08,
          letterSpacing: "-0.04em", marginBottom: 18, color: C.text }}>
          Customer Churn<br />
          <span style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.teal})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Prediction Platform
          </span>
        </h1>

        <p style={{ fontSize: 17, color: C.muted, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.75 }}>
          AI-powered retention intelligence. Predict who's leaving, understand why,
          calculate the revenue impact, and take targeted action before it's too late.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("prediction")}
            style={{ background: `linear-gradient(135deg,${C.accentDark},#4f46e5)`, color: "#fff", border: "none",
              borderRadius: 14, padding: "14px 36px", fontSize: 15, fontWeight: 800, cursor: "pointer",
              fontFamily: "inherit", boxShadow: `0 4px 24px rgba(99,102,241,0.35)`, transition: "all 0.2s" }}>
            🔮 Predict Churn Now
          </button>
          <button onClick={() => navigate("dashboard")}
            style={{ background: C.panel, color: C.text, border: `1px solid ${C.border}`, borderRadius: 14,
              padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            📊 View Dashboard
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16, marginBottom: 48 }}>
        {STATS.map((s) => (
          <div key={s.l} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: s.c, fontFamily: "'DM Mono',monospace" }}>{s.v}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 5, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20, color: C.text }}>Platform Features</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 18, marginBottom: 48 }}>
        {FEATURES.map((f) => (
          <div key={f.title}
            style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22, transition: "all 0.3s", cursor: "default" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20, color: C.text }}>Tech Stack</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 14, marginBottom: 40 }}>
        {TECH_STACK.map((t) => (
          <div key={t.cat} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>{t.cat}</div>
            {t.items.map((item) => (
              <div key={item} style={{ fontSize: 12, color: C.muted, padding: "3px 0", borderBottom: `1px solid ${C.border}` }}>{item}</div>
            ))}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: `linear-gradient(135deg,rgba(99,102,241,0.12),${C.bg})`,
        border: `1px solid ${C.borderAccent}`, borderRadius: 22, padding: "36px", textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>🚀</div>
        <h3 style={{ fontWeight: 900, fontSize: 22, marginBottom: 10, color: C.text }}>Ready to reduce churn?</h3>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
          Enter any customer's data and receive a complete AI churn analysis in under 2 seconds.
        </p>
        <button onClick={() => navigate("prediction")}
          style={{ background: `linear-gradient(135deg,${C.accentDark},#4f46e5)`, color: "#fff", border: "none",
            borderRadius: 12, padding: "13px 32px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
          Get Started →
        </button>
      </div>
    </div>
  );
}