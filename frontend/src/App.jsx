/**
 * App.jsx
 * -------
 * Root component — navigation, layout, page routing.
 * Pages: Home | Prediction | Dashboard | Report
 */

import { useState } from "react";
import Home       from "./pages/Home";
import Prediction from "./pages/Prediction";
import Dashboard  from "./pages/Dashboard";
import Report     from "./pages/Report";

const C = {
  bg:"#0a0f1e", bgCard:"#0f172a", panel:"#1e293b",
  accent:"#818cf8", accentDark:"#6366f1", accentGlow:"rgba(129,140,248,0.15)",
  teal:"#2dd4bf", text:"#f1f5f9", muted:"#94a3b8",
  border:"rgba(255,255,255,0.07)", borderAccent:"rgba(129,140,248,0.3)",
};

const NAV_ITEMS = [
  { id:"home",       label:"Home",       icon:"🏠" },
  { id:"prediction", label:"Predict",    icon:"🔮" },
  { id:"dashboard",  label:"Dashboard",  icon:"📊" },
  { id:"report",     label:"Reports",    icon:"📄" },
];

export default function App() {
  const [page,   setPage]   = useState("home");
  const [animIn, setAnimIn] = useState(true);

  const navigate = (p) => {
    if (p === page) return;
    setAnimIn(false);
    setTimeout(() => { setPage(p); setAnimIn(true); }, 140);
  };

  const pageProps = { navigate };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'Outfit','Segoe UI',sans-serif", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${C.bg}; }
        ::-webkit-scrollbar-thumb { background:${C.panel}; border-radius:3px; }
        select option { background:${C.panel}; }
        .nav-item { transition:all 0.18s ease; }
        .nav-item:hover { background:${C.accentGlow} !important; color:${C.accent} !important; }
        .card-hover { transition:transform 0.22s ease, box-shadow 0.22s ease; }
        .card-hover:hover { transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,0.3) !important; }
        .fade-in { animation:fadeIn 0.28s ease forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        input:focus, select:focus { border-color:${C.accentDark} !important; box-shadow:0 0 0 3px rgba(99,102,241,0.2); }
        button:active { transform:scale(0.98); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:200,
        background:"rgba(10,15,30,0.90)", backdropFilter:"blur(18px)",
        borderBottom:`1px solid ${C.border}`,
        padding:"0 28px", display:"flex", alignItems:"center", height:62,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginRight:"auto", cursor:"pointer" }}
          onClick={() => navigate("home")}>
          <div style={{ width:34, height:34, borderRadius:11,
            background:`linear-gradient(135deg,${C.accentDark},${C.teal})`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>
            🧠
          </div>
          <div>
            <span style={{ fontWeight:900, fontSize:16, letterSpacing:"-0.03em" }}>ChurnIQ</span>
            <span style={{ fontSize:10, color:C.muted, display:"block", lineHeight:1, marginTop:1 }}>Retention Intelligence</span>
          </div>
          <span style={{ background:"rgba(45,212,191,0.15)", color:C.teal, border:"1px solid rgba(45,212,191,0.3)",
            borderRadius:100, padding:"2px 10px", fontSize:10, fontWeight:700 }}>v1.0</span>
        </div>

        {/* Nav links */}
        <div style={{ display:"flex", gap:4 }}>
          {NAV_ITEMS.map((n) => (
            <button key={n.id} className="nav-item" onClick={() => navigate(n.id)}
              style={{
                background: page === n.id ? C.accentGlow : "transparent",
                color:      page === n.id ? C.accent     : C.muted,
                border:     `1px solid ${page === n.id ? C.borderAccent : "transparent"}`,
                borderRadius:10, padding:"7px 16px", fontSize:13, fontWeight:700,
                cursor:"pointer", fontFamily:"inherit",
                display:"flex", alignItems:"center", gap:6,
              }}>
              {n.icon} {n.label}
            </button>
          ))}
        </div>

        {/* Status pill */}
        <div style={{ marginLeft:20, display:"flex", alignItems:"center", gap:7,
          background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)",
          borderRadius:100, padding:"5px 14px" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80",
            boxShadow:"none", display:"inline-block" }} />
          <span style={{ fontSize:11, fontWeight:700, color:"#4ade80" }}>Model Active</span>
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main className={animIn ? "fade-in" : ""}
        style={{ maxWidth:1320, margin:"0 auto", padding:"36px 24px" }}>
        {page === "home"       && <Home       {...pageProps} />}
        {page === "prediction" && <Prediction {...pageProps} />}
        {page === "dashboard"  && <Dashboard  {...pageProps} />}
        {page === "report"     && <Report     {...pageProps} />}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${C.border}`, marginTop:60, padding:"24px 28px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexWrap:"wrap", gap:12, maxWidth:1320, margin:"60px auto 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>🧠</span>
          <span style={{ fontWeight:800, fontSize:13 }}>ChurnIQ</span>
          <span style={{ color:C.muted, fontSize:12 }}>— Customer Churn Prediction &amp; Retention Intelligence Platform</span>
        </div>
        <div style={{ fontSize:12, color:C.muted }}>
          Model: RF + GB + LR Ensemble &nbsp;·&nbsp; AUC: 84.4% &nbsp;·&nbsp; 7,043 Records &nbsp;·&nbsp; 34 Features
        </div>
      </footer>
    </div>
  );
}
