/**
 * Dashboard.jsx — Analytics dashboard with consistent, professional color palette
 */

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Legend
} from "recharts";
import { getDashboardData } from "../services/api";

// ── Consistent Color System ───────────────────────────────────────────────────
const C = {
  text: "#f1f5f9", muted: "#94a3b8", faint: "#475569",
  bg: "#0f172a", panel: "#1e293b", border: "rgba(255,255,255,0.07)",
  accent: "#818cf8", accentDark: "#6366f1",
  teal: "#2dd4bf", green: "#4ade80", red: "#f87171", amber: "#fbbf24",
  purple: "#c084fc", blue: "#60a5fa",
  accentGlow: "rgba(129,140,248,0.15)", borderAccent: "rgba(129,140,248,0.2)",
};

// Single unified palette — used consistently across ALL charts
const CHART_PALETTE = ["#818cf8", "#2dd4bf", "#f87171", "#4ade80", "#fbbf24", "#60a5fa", "#c084fc", "#fb923c"];
const RISK_COLORS = { High: "#f87171", Medium: "#fbbf24", Low: "#4ade80" };
const SEG_COLORS = { "At Risk": "#f87171", "High Value": "#818cf8", "Inactive": "#fb923c", "Loyal": "#4ade80", "New Customer": "#60a5fa" };

// ── Shared Tooltip ────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label, unit = "" }) =>
  active && payload?.length ? (
    <div style={{
      background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
    }}>
      {label && <p style={{ color: C.text, fontWeight: 700, margin: "0 0 6px" }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color || C.accent, margin: "2px 0", fontFamily: "monospace" }}>
          {p.name}: <b>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{unit}</b>
        </p>
      ))}
    </div>
  ) : null;

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KPICard = ({ label, value, icon, color = C.accent, sub }) => (
  <div style={{
    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16,
    padding: "20px 22px", position: "relative", overflow: "hidden"
  }}>
    <div style={{
      position: "absolute", top: 0, right: 0, width: 70, height: 70,
      background: `radial-gradient(circle at top right,${color}18,transparent 70%)`
    }} />
    <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontWeight: 600 }}>{label}</div>
    {sub && <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{sub}</div>}
  </div>
);

// ── Chart Card ────────────────────────────────────────────────────────────────
const Card = ({ title, icon, children }) => (
  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22 }}>
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
      paddingBottom: 12, borderBottom: `1px solid ${C.border}`
    }}>
      {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      <span style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{title}</span>
    </div>
    {children}
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardData()
      .then(res => { setData(res); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
      <div style={{ color: C.muted }}>Loading dashboard...</div>
    </div>
  );

  if (error) return (
    <div style={{
      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
      borderRadius: 16, padding: 32, textAlign: "center"
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <div style={{ color: C.red, fontWeight: 700, marginBottom: 8 }}>Failed to load dashboard</div>
      <div style={{ color: C.muted, fontSize: 13 }}>{error}</div>
    </div>
  );

  const { kpis, contract_churn, internet_churn, tenure_churn,
    risk_distribution, segments, charge_distribution,
    model_performance } = data;

  // ── Chart data prep ────────────────────────────────────────────────────────
  const riskData = Object.entries(risk_distribution)
    .map(([name, value]) => ({ name, value, fill: RISK_COLORS[name] || C.accent }));

  const segData = Object.entries(segments)
    .map(([name, value]) => ({ name, value }));

  const contractData = Object.entries(contract_churn)
    .map(([k, v]) => ({ name: k.replace("Month-to-month", "M2M"), rate: v }));

  const internetData = Object.entries(internet_churn)
    .map(([k, v]) => ({ name: k, rate: v }));

  const tenureData = Object.entries(tenure_churn)
    .map(([k, v]) => ({ name: k, rate: v }));

  // Clean charge distribution — filter malformed keys
  const chargeData = Object.entries(charge_distribution)
    .filter(([k]) => !k.includes("rate") && !k.includes("total") && k.length < 20)
    .map(([bucket, vals]) => ({
      name: bucket,
      Active: Math.max(0, (vals.total || 0) - (vals.churned || 0)),
      Churned: vals.churned || 0,
    }));

  const featureData = (model_performance.top_features || [])
    .map(([f, v]) => ({
      name: f.replace("InternetService_", "Net: ").replace("Contract_", "Ctr: ")
        .replace("PaymentMethod_", "Pay: ").replace("_", " "),
      importance: Math.round(v * 1000) / 10,
    }))
    .reverse(); // highest at top

  const kpiConfig = [
    { label: "Total Customers", value: kpis.total_customers.toLocaleString(), icon: "👥", color: C.accent, sub: "In dataset" },
    { label: "Churn Rate", value: `${kpis.churn_rate}%`, icon: "📉", color: C.red, sub: `${kpis.churned_customers.toLocaleString()} churned` },
    { label: "Retention Rate", value: `${kpis.retention_rate}%`, icon: "🛡️", color: C.green, sub: `${kpis.active_customers.toLocaleString()} active` },
    { label: "Revenue at Risk", value: `$${(kpis.revenue_at_risk / 1000).toFixed(0)}K`, icon: "💸", color: C.amber, sub: "Monthly MRR" },
    { label: "Avg Monthly Charge", value: `$${kpis.avg_monthly_charges}`, icon: "💰", color: C.teal, sub: "Per customer" },
    { label: "Avg Tenure", value: `${kpis.avg_tenure_months}mo`, icon: "📅", color: C.purple, sub: "Average age" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: C.text }}>Analytics Dashboard</h2>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
          Real-time insights from {kpis.total_customers.toLocaleString()} customer records
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
        {kpiConfig.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Model banner */}
      <div style={{
        background: `linear-gradient(135deg,rgba(99,102,241,0.1),${C.bg})`,
        border: `1px solid ${C.borderAccent}`, borderRadius: 14,
        padding: "16px 22px", marginBottom: 24,
        display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center"
      }}>
        <span style={{ fontSize: 20 }}>🧠</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            MODEL — ENSEMBLE (RF + GB + LR)
          </div>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 13, marginTop: 2 }}>
            Random Forest · Gradient Boosting · Logistic Regression (Soft Voting, weights [2,2,1])
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { l: "Accuracy", v: `${(model_performance.accuracy * 100).toFixed(1)}%`, c: C.accent },
            { l: "ROC-AUC", v: `${(model_performance.roc_auc * 100).toFixed(1)}%`, c: C.teal },
            { l: "CV AUC", v: `${(model_performance.cv_auc_mean * 100).toFixed(1)}%`, c: C.green },
          ].map(m => (
            <div key={m.l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 20, color: m.c }}>{m.v}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>

        {/* 1. Churned vs Active — clean 2-color donut */}
        <Card title="Churned vs Active" icon="🔵">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={[
                { name: "Active", value: kpis.active_customers },
                { name: "Churned", value: kpis.churned_customers },
              ]}
                cx="50%" cy="50%" innerRadius={65} outerRadius={95}
                stroke={C.bg} dataKey="value">
                <Cell fill={C.green} />
                <Cell fill={C.red} />
              </Pie>
              <Tooltip content={<ChartTip />} />
              <Legend
                iconType="circle" iconSize={10}
                payload={[
                  { value: "Active", type: "circle", color: C.green },
                  { value: "Churned", type: "circle", color: C.red },
                ]}
                formatter={v => <span style={{ color: C.muted, fontSize: 12 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* 2. Risk Distribution — 3 fixed colors */}
        <Card title="Risk Level Distribution" icon="⚡">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskData} layout="vertical" barSize={22} margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: C.muted, fontSize: 12 }}
                axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {riskData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 3. Customer Segments — consistent palette */}
        <Card title="Customer Segments" icon="🎯">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={segData} cx="50%" cy="50%"
                outerRadius={88} stroke={C.bg} dataKey="value">
                {segData.map((e, i) => (
                  <Cell key={i} fill={SEG_COLORS[e.name] || CHART_PALETTE[i % CHART_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTip />} />
              <Legend iconType="circle" iconSize={9}
                formatter={v => <span style={{ color: C.muted, fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* 4. Revenue by Charge Bucket */}
        <Card title="Revenue by Charge Bucket" icon="💰">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chargeData} barSize={14} barGap={2} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Legend formatter={v => <span style={{ color: C.muted, fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="Active" fill={C.green} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Churned" fill={C.red} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 5. Churn by Tenure — teal area */}
        <Card title="Churn Rate by Tenure" icon="📅">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={tenureData} margin={{ right: 10 }}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 60]} />
              <Tooltip content={<ChartTip unit="%" />} />
              <Area type="monotone" dataKey="rate" name="Churn Rate"
                stroke={C.teal} strokeWidth={2.5} fill="url(#tealGrad)"
                dot={{ fill: C.teal, r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 6. Churn by Contract — accent palette */}
        <Card title="Churn Rate by Contract Type" icon="📋">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={contractData} barSize={46}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 50]} />
              <Tooltip content={<ChartTip unit="%" />} />
              <Bar dataKey="rate" name="Churn Rate" radius={[5, 5, 0, 0]}>
                {contractData.map((_, i) => (
                  <Cell key={i} fill={[C.red, C.amber, C.green][i] || C.accent} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 7. Churn by Internet Service */}
        <Card title="Churn Rate by Internet Service" icon="🌐">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={internetData} barSize={54}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 50]} />
              <Tooltip content={<ChartTip unit="%" />} />
              <Bar dataKey="rate" name="Churn Rate" radius={[5, 5, 0, 0]}>
                {internetData.map((_, i) => (
                  <Cell key={i} fill={[C.red, C.amber, C.green][i] || C.accent} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 8. Feature Importance — gradient accent bars */}
        <Card title="Top Predictive Features" icon="🧠">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={featureData} layout="vertical" barSize={13} margin={{ left: 8, right: 20 }}>
              <XAxis type="number" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: C.muted, fontSize: 10 }}
                axisLine={false} tickLine={false} width={115} />
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <Tooltip content={<ChartTip unit="%" />} formatter={(v) => [`${v}%`, "Importance"]} />
              <Bar dataKey="importance" name="Importance" radius={[0, 5, 5, 0]}>
                {featureData.map((_, i) => (
                  <Cell key={i} fill={C.accent}
                    fillOpacity={1 - (i * 0.07)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </div>
    </div>
  );
}