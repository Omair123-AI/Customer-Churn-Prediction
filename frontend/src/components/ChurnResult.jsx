/**
 * ChurnResult.jsx
 * ---------------
 * Bold prediction verdict banner with probability and confidence.
 */

export default function ChurnResult({ prediction = {}, customerId = "" }) {
  const isChurn = prediction.churn_prediction === "Yes";
  const color   = isChurn ? "#f87171" : "#4ade80";
  const bgColor = isChurn ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)";
  const border  = isChurn ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)";

  return (
    <div style={{ background: bgColor, border: `2px solid ${border}`, borderRadius: 20, padding: "24px 28px",
      display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
      <div style={{ flex: "1 1 200px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          Churn Prediction — {customerId}
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.04em" }}>
          {isChurn ? "WILL CHURN" : "WILL STAY"}
        </div>
        <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 14 }}>
          <span style={{ color, fontWeight: 800, fontSize: 20, fontFamily: "'DM Mono',monospace" }}>
            {prediction.churn_probability}%
          </span>{" "}
          churn probability &nbsp;·&nbsp; {prediction.confidence}% model confidence
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "12px 24px", background: "rgba(0,0,0,0.2)", borderRadius: 14 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color, fontFamily: "'DM Mono',monospace" }}>
          {prediction.churn_probability}%
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Probability</div>
      </div>
    </div>
  );
}
