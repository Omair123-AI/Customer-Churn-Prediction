/**
 * CustomerForm.jsx
 * ----------------
 * 4-section customer data entry form.
 * Sections: Personal Info | Account | Services | Engagement
 */

const C = {
  bgPanel: "#1e293b", border: "rgba(255,255,255,0.07)",
  text: "#f1f5f9", muted: "#94a3b8", accentDark: "#6366f1", accentGlow: "rgba(99,102,241,0.15)",
};

const Field = ({ label, name, type = "text", value, onChange, options, min, max, step, required }) => {
  const base = {
    width: "100%", background: "#0f172a", border: `1px solid ${C.border}`,
    borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 13,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
        {label}{required && <span style={{ color: "#f87171" }}> *</span>}
      </label>
      {options ? (
        <select name={name} value={value} onChange={onChange} style={base}>
          {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} min={min} max={max} step={step} style={base} />
      )}
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div style={{ background: "#0f172a", border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{title}</span>
    </div>
    {children}
  </div>
);

const YN  = [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }];
const YN3 = [...YN, { value: "No internet service", label: "No Internet Service" }];

export default function CustomerForm({ form, onChange, onSubmit, onReset, loading }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>

        <Section title="Personal Information" icon="👤">
          <Field label="Customer ID" name="customerID" value={form.customerID} onChange={onChange} />
          <Field label="Gender" name="gender" value={form.gender} onChange={onChange} options={["Male","Female"]} />
          <Field label="Senior Citizen" name="SeniorCitizen" value={form.SeniorCitizen} onChange={onChange}
            options={[{value:"0",label:"No"},{value:"1",label:"Yes"}]} />
          <Field label="Partner" name="Partner" value={form.Partner} onChange={onChange} options={YN} />
          <Field label="Dependents" name="Dependents" value={form.Dependents} onChange={onChange} options={YN} />
        </Section>

        <Section title="Account Information" icon="📋">
          <Field label="Tenure (months)" name="tenure" type="number" min="0" max="72"
            value={form.tenure} onChange={onChange} required />
          <Field label="Contract Type" name="Contract" value={form.Contract} onChange={onChange}
            options={["Month-to-month","One year","Two year"]} required />
          <Field label="Monthly Charges ($)" name="MonthlyCharges" type="number" step="0.01"
            value={form.MonthlyCharges} onChange={onChange} required />
          <Field label="Total Charges ($)" name="TotalCharges" type="number" step="0.01"
            value={form.TotalCharges} onChange={onChange} />
          <Field label="Payment Method" name="PaymentMethod" value={form.PaymentMethod} onChange={onChange}
            options={["Electronic check","Mailed check","Bank transfer (automatic)","Credit card (automatic)"]} />
          <Field label="Paperless Billing" name="PaperlessBilling" value={form.PaperlessBilling} onChange={onChange} options={YN} />
        </Section>

        <Section title="Service Usage" icon="🌐">
          <Field label="Internet Service" name="InternetService" value={form.InternetService} onChange={onChange}
            options={["DSL","Fiber optic","No"]} />
          <Field label="Phone Service" name="PhoneService" value={form.PhoneService} onChange={onChange} options={YN} />
          <Field label="Multiple Lines" name="MultipleLines" value={form.MultipleLines} onChange={onChange}
            options={["No","Yes","No phone service"]} />
          <Field label="Online Security" name="OnlineSecurity" value={form.OnlineSecurity} onChange={onChange} options={YN3} />
          <Field label="Online Backup" name="OnlineBackup" value={form.OnlineBackup} onChange={onChange} options={YN3} />
          <Field label="Device Protection" name="DeviceProtection" value={form.DeviceProtection} onChange={onChange} options={YN3} />
          <Field label="Tech Support" name="TechSupport" value={form.TechSupport} onChange={onChange} options={YN3} />
          <Field label="Streaming TV" name="StreamingTV" value={form.StreamingTV} onChange={onChange} options={YN3} />
          <Field label="Streaming Movies" name="StreamingMovies" value={form.StreamingMovies} onChange={onChange} options={YN3} />
        </Section>

        <Section title="Engagement & Satisfaction" icon="⭐">
          <Field label="Customer Satisfaction (1–5)" name="CustomerSatisfaction" type="number" min="1" max="5"
            value={form.CustomerSatisfaction} onChange={onChange} required />
          <Field label="Support Tickets Filed" name="SupportTickets" type="number" min="0"
            value={form.SupportTickets} onChange={onChange} />
        </Section>

      </div>

      {/* Submit row */}
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button onClick={onSubmit} disabled={loading}
          style={{ flex: 1, background: loading ? "#1e293b" : "linear-gradient(135deg,#6366f1,#4f46e5)", color: loading ? "#475569" : "#fff",
            border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
          {loading ? "🧠 Analysing..." : "🔮 Predict Churn"}
        </button>
        <button onClick={onReset}
          style={{ background: "#1e293b", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: "16px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Reset
        </button>
      </div>
    </div>
  );
}
