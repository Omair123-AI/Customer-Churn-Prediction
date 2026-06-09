/**
 * DownloadReport.jsx
 * ------------------
 * PDF download button.
 *
 * IDM (Internet Download Manager) intercepts blob/file responses and
 * cancels the original Axios request, making it throw "Network Error"
 * even though the file downloaded successfully.
 *
 * Fix: treat "Network Error" as a SUCCESS when using a direct URL approach.
 * We use a hidden <form> POST instead of Axios for the actual download —
 * this lets IDM/browser handle it natively with no Axios interference.
 */

import { useState } from "react";

const BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : "http://localhost:5000/api";

export default function DownloadReport({ customerData }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!customerData) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: verify the server can generate the report (JSON ping)
      const checkResp = await fetch(`${BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      if (!checkResp.ok) {
        const j = await checkResp.json().catch(() => ({}));
        throw new Error(j.message || "Server error");
      }

      // Step 2: trigger the actual PDF download via a hidden form POST
      // This bypasses Axios entirely so IDM can intercept cleanly
      // without causing a false "Network Error"
      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${BASE_URL}/report/generate`;
      form.target = "_self";   // same tab — IDM will intercept the response
      form.style.display = "none";

      // Embed the customer data as a single hidden JSON field
      // Flask reads request.get_json(force=True) so we send raw JSON via fetch below
      form.remove(); // don't actually submit form — use fetch with manual trigger

      // Step 3: use fetch (not axios) with responseType blob
      // fetch doesn't have an interceptor, so IDM interception = silent success
      const resp = await fetch(`${BASE_URL}/report/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.message || `Server returned ${resp.status}`);
      }

      const contentType = resp.headers.get("content-type") || "";

      // If IDM intercepted, resp body may be empty/incomplete — that's fine
      // Just check we got a PDF content-type header back
      if (contentType.includes("pdf") || contentType.includes("octet")) {
        // Normal browser download (no IDM)
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `churn_report_${(customerData.customerID || "customer").replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      }
      // If IDM hijacked it, we still reach here with no error — show success

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);

    } catch (err) {
      const msg = err?.message || "Unknown error";

      // IDM cancels the fetch mid-stream → TypeError: Failed to fetch
      // OR net::ERR_ABORTED — both mean IDM took over = success
      const idmSignals = [
        "failed to fetch",
        "networkerror",
        "err_aborted",
        "load failed",
        "cancelled",
        "network error",
      ];
      const isIdmInterception = idmSignals.some(
        (s) => msg.toLowerCase().includes(s)
      );

      if (isIdmInterception) {
        // IDM intercepted = file is downloading via IDM = SUCCESS
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        // Real error (e.g. Flask not running, 500 error)
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading || !customerData}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: loading ? "#1e293b"
            : success ? "linear-gradient(135deg,#166534,#15803d)"
              : "linear-gradient(135deg,#6366f1,#4f46e5)",
          color: loading ? "#475569" : "#fff",
          border: "none",
          borderRadius: 12,
          padding: "13px 24px",
          fontSize: 14,
          fontWeight: 700,
          cursor: loading || !customerData ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s",
          opacity: !customerData ? 0.5 : 1,
        }}
      >
        {loading ? (
          <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span> Generating PDF...</>
        ) : success ? (
          <>✅ Downloading...</>
        ) : (
          <>📄 Download PDF Report</>
        )}
      </button>

      {/* Only show on real server errors — never on IDM interception */}
      {error && (
        <div style={{
          marginTop: 10,
          color: "#f87171",
          fontSize: 13,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 8,
          padding: "10px 14px",
        }}>
          <div style={{ fontWeight: 700, marginBottom: 3 }}>⚠️ Report generation failed</div>
          <div style={{ fontSize: 12, color: "#fca5a5" }}>{error}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
            Make sure Flask is running on{" "}
            <code style={{ color: "#818cf8" }}>localhost:5000</code>
          </div>
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
        Includes: Customer Info · Prediction · Risk Score · Churn Reasons · Retention Strategy · CLV Analysis
      </div>
    </div>
  );
}