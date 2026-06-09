/**
 * Report.jsx — PDF report generation page
 */

import { useState } from "react";
import DownloadReport from "../components/DownloadReport";
import { predictChurn } from "../services/api";

const C = {
  text:"#f1f5f9", muted:"#94a3b8", faint:"#475569", bg:"#0f172a", panel:"#1e293b",
  border:"rgba(255,255,255,0.07)", accent:"#818cf8", accentDark:"#6366f1",
  accentGlow:"rgba(129,140,248,0.15)", borderAccent:"rgba(129,140,248,0.3)",
  teal:"#2dd4bf", red:"#f87171", amber:"#fbbf24", green:"#4ade80",
};

const Field = ({ label, name, type="text", value, onChange, options, min, max, step }) => {
  const base = {
    width:"100%", background:C.panel, border:`1px solid ${C.border}`,
    borderRadius:10, padding:"10px 14px", color:C.text, fontSize:13,
    outline:"none", fontFamily:"inherit", boxSizing:"border-box",
  };
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.06em",
        textTransform:"uppercase", display:"block", marginBottom:5 }}>{label}</label>
      {options
        ? <select name={name} value={value} onChange={onChange} style={base}>
            {options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
          </select>
        : <input type={type} name={name} value={value} onChange={onChange}
            min={min} max={max} step={step} style={base} />
      }
    </div>
  );
};

const REPORT_SECTIONS = [
  { icon:"👤", title:"Customer Information",        desc:"Full customer profile: demographics, account details, service usage" },
  { icon:"🔮", title:"Churn Prediction",            desc:"AI verdict, churn probability percentage, and confidence score" },
  { icon:"⚡", title:"Risk Score Analysis",         desc:"0–100 composite risk score with penalty factor breakdown" },
  { icon:"🧬", title:"Churn Risk Drivers",          desc:"Top 6 ranked churn factors with impact percentages and detail" },
  { icon:"🎯", title:"Retention Strategy",          desc:"Personalised 6-point action plan with priority and expected impact" },
  { icon:"👑", title:"Customer Segment",            desc:"Segment classification: High Value / At Risk / Loyal / New / Inactive" },
  { icon:"💎", title:"CLV Analysis",                desc:"Customer lifetime value, revenue at risk, quarterly and annual forecast" },
];

const DEFAULT_FORM = {
  customerID:"CUST-REPORT-01", gender:"Female", SeniorCitizen:"0",
  Partner:"Yes", Dependents:"No", tenure:"24",
  PhoneService:"Yes", MultipleLines:"Yes",
  InternetService:"Fiber optic", OnlineSecurity:"Yes", OnlineBackup:"Yes",
  DeviceProtection:"No", TechSupport:"No", StreamingTV:"Yes", StreamingMovies:"Yes",
  Contract:"One year", PaperlessBilling:"Yes", PaymentMethod:"Credit card (automatic)",
  MonthlyCharges:"79.95", TotalCharges:"1918.80",
  CustomerSatisfaction:"3", SupportTickets:"1",
};

export default function Report() {
  const [form,    setForm]    = useState(DEFAULT_FORM);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePreview = async () => {
    setLoading(true); setError(null);
    try {
      const res = await predictChurn(form);
      setPreview(res);
    } catch (err) {
      setError(err.message || "Failed to generate preview. Is the Flask server running?");
    } finally {
      setLoading(false);
    }
  };

  const YN  = [{ value:"Yes", label:"Yes"}, { value:"No", label:"No"}];

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.03em", color:C.text }}>PDF Report Generator</h2>
        <p style={{ color:C.muted, fontSize:14, marginTop:4 }}>Generate a professional churn analysis report for any customer</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:24 }}>

        {/* Left: Form */}
        <div>
          <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, padding:28, marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20,
              paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:20 }}>📋</span>
              <span style={{ fontWeight:800, fontSize:15, color:C.text }}>Customer Details</span>
            </div>
            <Field label="Customer ID"      name="customerID"      value={form.customerID}      onChange={handleChange} />
            <Field label="Tenure (months)"  name="tenure"          value={form.tenure}          onChange={handleChange} type="number" min="0" max="72" />
            <Field label="Contract"         name="Contract"        value={form.Contract}        onChange={handleChange}
              options={["Month-to-month","One year","Two year"]} />
            <Field label="Monthly Charges"  name="MonthlyCharges"  value={form.MonthlyCharges}  onChange={handleChange} type="number" step="0.01" />
            <Field label="Internet Service" name="InternetService" value={form.InternetService} onChange={handleChange}
              options={["DSL","Fiber optic","No"]} />
            <Field label="Payment Method"   name="PaymentMethod"   value={form.PaymentMethod}   onChange={handleChange}
              options={["Electronic check","Mailed check","Bank transfer (automatic)","Credit card (automatic)"]} />
            <Field label="Satisfaction (1–5)" name="CustomerSatisfaction" value={form.CustomerSatisfaction} onChange={handleChange} type="number" min="1" max="5" />
            <Field label="Support Tickets"  name="SupportTickets"  value={form.SupportTickets}  onChange={handleChange} type="number" min="0" />
            <Field label="Gender"           name="gender"          value={form.gender}          onChange={handleChange} options={["Male","Female"]} />
            <Field label="Partner"          name="Partner"         value={form.Partner}         onChange={handleChange} options={YN} />

            {error && (
              <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                borderRadius:10, padding:"12px 16px", marginBottom:16, color:C.red, fontSize:13 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button onClick={handlePreview} disabled={loading}
                style={{ flex:1, background:loading ? C.panel : `linear-gradient(135deg,${C.accentDark},#4f46e5)`,
                  color:loading ? C.faint : "#fff", border:"none", borderRadius:12,
                  padding:"13px", fontSize:14, fontWeight:800, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit" }}>
                {loading ? "⏳ Analysing..." : "🔍 Preview Analysis"}
              </button>
            </div>
          </div>

          {/* Report contents card */}
          <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18,
              paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:20 }}>📄</span>
              <span style={{ fontWeight:800, fontSize:15, color:C.text }}>Report Contents</span>
            </div>
            {REPORT_SECTIONS.map((s, i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0",
                borderBottom: i < REPORT_SECTIONS.length-1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{s.title}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2, lineHeight:1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Preview + Download */}
        <div>
          {preview ? (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* Prediction summary */}
              <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, padding:28 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18,
                  paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:20 }}>🔮</span>
                  <span style={{ fontWeight:800, fontSize:15, color:C.text }}>Analysis Preview</span>
                </div>

                {/* Verdict */}
                {(() => {
                  const isChurn = preview.prediction?.churn_prediction === "Yes";
                  const c = isChurn ? C.red : C.green;
                  return (
                    <div style={{ background:c+"15", border:`1px solid ${c}33`, borderRadius:14,
                      padding:"18px 22px", marginBottom:20 }}>
                      <div style={{ fontSize:11, color:C.muted, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Verdict</div>
                      <div style={{ fontSize:32, fontWeight:900, color:c, lineHeight:1.1, marginTop:4 }}>
                        {isChurn ? "WILL CHURN" : "WILL STAY"}
                      </div>
                      <div style={{ color:C.muted, fontSize:13, marginTop:6 }}>
                        <span style={{ color:c, fontWeight:800 }}>{preview.prediction?.churn_probability}%</span> probability
                      </div>
                    </div>
                  );
                })()}

                {/* Key metrics */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                  {[
                    { l:"Risk Score",   v:`${preview.risk?.risk_score}/100`,              c:preview.risk?.risk_color || C.amber },
                    { l:"Risk Level",   v:preview.risk?.risk_level,                       c:preview.risk?.risk_color || C.amber },
                    { l:"CLV",          v:`$${preview.clv?.clv?.toLocaleString()}`,       c:C.accent },
                    { l:"Revenue Risk", v:`$${preview.clv?.revenue_risk?.toLocaleString()}`, c:C.red },
                    { l:"Segment",      v:`${preview.segment?.icon} ${preview.segment?.segment}`, c:preview.segment?.color || C.accent },
                    { l:"Health Score", v:`${preview.health_score}/100`,                  c:preview.health_score >= 60 ? C.green : preview.health_score >= 35 ? C.amber : C.red },
                  ].map(i => (
                    <div key={i.l} style={{ background:C.panel, borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontSize:16, fontWeight:900, color:i.c, fontFamily:"'DM Mono',monospace" }}>{i.v}</div>
                      <div style={{ fontSize:10, color:C.muted, marginTop:3 }}>{i.l}</div>
                    </div>
                  ))}
                </div>

                {/* Top reasons */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.muted, letterSpacing:"0.05em",
                    textTransform:"uppercase", marginBottom:10 }}>Top Risk Drivers</div>
                  {(preview.churn_reasons || []).slice(0,3).map((r, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0",
                      borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                      <span>{r.icon}</span>
                      <span style={{ flex:1, fontSize:12, color:C.text }}>{r.factor}</span>
                      <span style={{ fontSize:11, fontWeight:800, color:C.red, fontFamily:"'DM Mono',monospace" }}>{r.impact}</span>
                    </div>
                  ))}
                </div>

                {/* Download button */}
                <DownloadReport customerData={form} />
              </div>

            </div>
          ) : (
            /* Placeholder */
            <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, padding:48,
              textAlign:"center", height:"100%", display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:16 }}>
              <div style={{ fontSize:56 }}>📄</div>
              <div style={{ fontWeight:800, fontSize:18, color:C.text }}>Report Preview</div>
              <div style={{ color:C.muted, fontSize:14, lineHeight:1.7, maxWidth:280 }}>
                Enter customer details and click <b style={{ color:C.accent }}>"Preview Analysis"</b> to
                see the prediction summary before downloading the PDF.
              </div>
              <div style={{ background:C.accentGlow, border:`1px solid ${C.borderAccent}`, borderRadius:12,
                padding:"10px 20px", fontSize:12, color:C.accent, fontWeight:600 }}>
                📊 Report includes 7 analysis sections
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
