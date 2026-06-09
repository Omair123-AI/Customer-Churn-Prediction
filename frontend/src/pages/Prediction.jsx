/**
 * Prediction.jsx — Customer input form + full analysis results page
 */

import { useState } from "react";
import CustomerForm   from "../components/CustomerForm";
import ChurnResult    from "../components/ChurnResult";
import RiskCard       from "../components/RiskCard";
import Suggestions    from "../components/Suggestions";
import CustomerSegment from "../components/CustomerSegment";
import DownloadReport from "../components/DownloadReport";
import { predictChurn } from "../services/api";

const C = { text: "#f1f5f9", muted: "#94a3b8", bg: "#0f172a", panel: "#1e293b",
  border: "rgba(255,255,255,0.07)", accent: "#818cf8", accentDark: "#6366f1",
  accentGlow: "rgba(129,140,248,0.15)", borderAccent: "rgba(129,140,248,0.3)",
  teal: "#2dd4bf", red: "#f87171", amber: "#fbbf24", green: "#4ade80" };

const DEFAULT_FORM = {
  customerID:"CUST-0042", gender:"Male", SeniorCitizen:"0", Partner:"No",
  Dependents:"No", tenure:"3", PhoneService:"Yes", MultipleLines:"No",
  InternetService:"Fiber optic", OnlineSecurity:"No", OnlineBackup:"No",
  DeviceProtection:"No", TechSupport:"No", StreamingTV:"Yes", StreamingMovies:"Yes",
  Contract:"Month-to-month", PaperlessBilling:"Yes", PaymentMethod:"Electronic check",
  MonthlyCharges:"85.50", TotalCharges:"256.50", CustomerSatisfaction:"2", SupportTickets:"3",
};

const Section = ({ title, icon, children }) => (
  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, marginBottom: 24 }}>
    {title && (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
        paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
        <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{title}</span>
      </div>
    )}
    {children}
  </div>
);

const SEVERITY_COLORS = { High: C.red, Medium: C.amber, Low: C.green };

export default function Prediction() {
  const [form,    setForm]    = useState(DEFAULT_FORM);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState("form");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await predictChurn(form);
      setResult(res);
      setTab("result");
    } catch (err) {
      setError(err.message || "Prediction failed. Is the Flask server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setForm(DEFAULT_FORM); setResult(null); setError(null); setTab("form"); };

  const simData = result ? [
    { label: "Current Risk",    prob: result.simulator?.original_prob || 0,   color: C.red },
    { label: "10% Discount",    prob: result.simulator?.discount_10pct || 0,  color: C.amber },
    { label: "20% Discount",    prob: result.simulator?.discount_20pct || 0,  color: C.teal },
    { label: "Annual Contract", prob: result.simulator?.annual_contract || 0, color: C.accent },
    { label: "Full Package",    prob: result.simulator?.full_package || 0,    color: C.green },
  ] : [];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: C.text }}>Churn Prediction</h2>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Enter customer details to get an AI-powered churn analysis</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[["form","📋 Customer Form"], result && ["result","🎯 Analysis Results"]].filter(Boolean).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ background: tab===id ? C.accentGlow : C.panel, color: tab===id ? C.accent : C.muted,
              border: `1px solid ${tab===id ? C.borderAccent : C.border}`, borderRadius: 10,
              padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12,
          padding: "14px 20px", marginBottom: 20, color: C.red, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Form Tab */}
      {tab === "form" && (
        <CustomerForm form={form} onChange={handleChange} onSubmit={handleSubmit}
          onReset={handleReset} loading={loading} />
      )}

      {/* Results Tab */}
      {tab === "result" && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Verdict banner */}
          <Section>
            <ChurnResult prediction={result.prediction} customerId={form.customerID} />
          </Section>

          {/* Health Score banner */}
          <Section>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: "1 1 180px" }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Customer Health Score</div>
                <div style={{ fontSize: 44, fontWeight: 900, color: result.health_score >= 60 ? C.green : result.health_score >= 35 ? C.amber : C.red, fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>{result.health_score}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>out of 100</div>
              </div>
              <div style={{ flex: "2 1 300px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { l: "CLV Estimate",    v: `$${result.clv?.clv?.toLocaleString() || 0}`,               c: C.accent },
                  { l: "Revenue at Risk", v: `$${result.clv?.revenue_risk?.toLocaleString() || 0}`,      c: C.red },
                  { l: "Monthly Revenue", v: `$${result.clv?.monthly_revenue || 0}`,                     c: C.teal },
                  { l: "Value Score",     v: `${result.clv?.value_score || 0}/100`,                      c: C.amber },
                ].map((i) => (
                  <div key={i.l} style={{ background: C.panel, borderRadius: 12, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: i.c, fontFamily: "'DM Mono',monospace" }}>{i.v}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{i.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Risk + Segment side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 0 }}>
            <Section title="Risk Score Analysis" icon="⚡">
              <RiskCard riskScore={result.risk?.risk_score} riskLevel={result.risk?.risk_level}
                riskColor={result.risk?.risk_color} basedOn={result.risk} />
            </Section>
            <Section title="Customer Segment" icon="🎯">
              <CustomerSegment segment={result.segment} />
            </Section>
          </div>

          {/* Churn Reasons */}
          <Section title="Churn Risk Drivers" icon="🧬">
            {result.churn_reasons?.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0",
                borderBottom: i < result.churn_reasons.length-1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{r.factor}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{r.detail}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 5, fontStyle: "italic" }}>💡 {r.suggestion}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ background: (SEVERITY_COLORS[r.severity] || C.muted)+"22", color: SEVERITY_COLORS[r.severity] || C.muted,
                    border: `1px solid ${(SEVERITY_COLORS[r.severity]||C.muted)}44`, borderRadius: 6,
                    padding: "2px 10px", fontSize: 10, fontWeight: 800, display: "block", textTransform: "uppercase" }}>{r.severity}</span>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.red, marginTop: 6, fontFamily: "'DM Mono',monospace" }}>{r.impact}</div>
                </div>
              </div>
            ))}
          </Section>

          {/* Retention Campaign Simulator */}
          <Section title="Retention Campaign Simulator" icon="🎮">
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>How much does each intervention reduce churn probability?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {simData.map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 140, fontSize: 12, color: C.muted, fontWeight: 600, flexShrink: 0 }}>{s.label}</div>
                  <div style={{ flex: 1, background: C.panel, borderRadius: 8, height: 24, overflow: "hidden" }}>
                    <div style={{ width: `${s.prob}%`, height: "100%", background: s.color,
                      borderRadius: 8, transition: "width 0.8s ease",
                      minWidth: 4 }} />
                  </div>
                  <div style={{ width: 48, textAlign: "right", fontFamily: "'DM Mono',monospace",
                    fontSize: 13, fontWeight: 800, color: s.color }}>{s.prob}%</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, background: C.panel, borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Best intervention:</div>
              <div style={{ fontWeight: 800, color: C.green, fontSize: 14 }}>
                Full Package → {result.simulator?.full_package}% risk
                <span style={{ color: C.green, marginLeft: 8 }}>
                  (−{Math.round((result.simulator?.original_prob || 0) - (result.simulator?.full_package || 0))}% reduction)
                </span>
              </div>
            </div>
          </Section>

          {/* Retention Suggestions */}
          <Section title="AI Retention Strategy" icon="🎯">
            <Suggestions suggestions={result.suggestions} />
          </Section>

          {/* Download Report */}
          <Section title="Generate PDF Report" icon="📄">
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 18, lineHeight: 1.6 }}>
              Download a complete professional PDF report with all analysis sections, tables, and retention strategy recommendations.
            </p>
            <DownloadReport customerData={form} />
          </Section>

        </div>
      )}
    </div>
  );
}
