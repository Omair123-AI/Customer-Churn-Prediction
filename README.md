# 🧠 ChurnIQ — Customer Churn Prediction & Retention Intelligence Platform

> AI-powered system that predicts customer churn, scores risk, identifies drivers,
> calculates CLV, and generates personalised retention strategies.

---

## 📊 Model Performance
| Metric       | Score  |
|--------------|--------|
| Accuracy     | 78.1%  |
| ROC-AUC      | 84.6%  |
| CV AUC       | 84.7% ± 1.2% |
| Ensemble     | RF(200) + GB(150) + LR · Soft Voting [2,2,1] |
| Features     | 34 engineered features |
| Training set | 5,634 records |
| Test set     | 1,409 records |

---

## 🗂 Project Structure

```
Customer-Churn-Prediction/
├── .env
├── requirements.txt
├── README.md
│
├── dataset/
│   ├── customer_churn.csv          ← Telco dataset (7,043 records)
│   ├── retention_strategies.csv   ← 5,100 risk/strategy rules
│   └── service_plans.csv          ← 8 service plan definitions
│
├── backend/
│   ├── app.py                     ← Flask app factory + CORS + blueprints
│   ├── models/
│   │   ├── churn_model.pkl        ← Trained ensemble model
│   │   ├── scaler.pkl             ← StandardScaler
│   │   ├── imputer.pkl            ← SimpleImputer
│   │   ├── feature_names.pkl      ← Feature name list
│   │   └── model_meta.json        ← Metrics, top features, thresholds
│   ├── ml/
│   │   ├── train_model.py         ← Full training pipeline
│   │   ├── predictor.py           ← Single-record inference
│   │   ├── preprocess.py          ← Feature engineering + encoding
│   │   └── evaluate_model.py      ← Test-set evaluation + ROC data
│   ├── services/
│   │   ├── risk_calculator.py          ← 0–100 composite risk score
│   │   ├── churn_reason_analyzer.py    ← Top 6 churn drivers
│   │   ├── retention_engine.py         ← 6-point retention strategy
│   │   ├── customer_segmenter.py       ← 5-segment classification
│   │   └── lifetime_value_calculator.py ← CLV + revenue risk
│   ├── reports/
│   │   └── report_generator.py    ← ReportLab PDF generator
│   ├── routes/
│   │   ├── predict_routes.py      ← POST /api/predict
│   │   ├── analytics_routes.py    ← GET  /api/analytics/dashboard
│   │   └── report_routes.py       ← POST /api/report/generate
│   └── utils/
│       └── helpers.py             ← Response formatters + validation
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                ← Root layout + navigation + routing
        ├── main.jsx               ← React entry point
        ├── pages/
        │   ├── Home.jsx           ← Landing page + stats + features
        │   ├── Prediction.jsx     ← Form + full results + simulator
        │   ├── Dashboard.jsx      ← KPIs + 8 analytics charts
        │   └── Report.jsx         ← PDF report generator page
        ├── components/
        │   ├── CustomerForm.jsx   ← 4-section 21-field input form
        │   ├── RiskCard.jsx       ← Gauge arc risk score card
        │   ├── ChurnResult.jsx    ← Verdict banner
        │   ├── Suggestions.jsx    ← Retention strategy cards
        │   ├── CustomerSegment.jsx ← Segment badge + legend
        │   └── DownloadReport.jsx ← PDF download button
        ├── charts/
        │   ├── ChurnPieChart.jsx  ← Churned vs Active donut
        │   ├── RiskBarChart.jsx   ← Risk level horizontal bars
        │   ├── SegmentChart.jsx   ← Segment distribution donut
        │   ├── RevenueChart.jsx   ← Revenue by charge bucket
        │   └── RetentionChart.jsx ← Tenure area + contract bar charts
        └── services/
            └── api.js             ← Axios API service layer
```

---

## 🚀 Quick Start

### 1. Setup - Create virtual environment

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux
```
---

### 2 — Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Train the ML model (creates models/*.pkl)
python ml/train_model.py

# Start Flask API (http://localhost:5000)
python app.py
```

### 3 — Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:3000
```

---

## 🌐 API Endpoints

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/api/health`               | Health check                       |
| POST   | `/api/predict`              | Full churn prediction pipeline     |
| GET    | `/api/analytics/dashboard`  | Dashboard KPIs + chart data        |
| GET    | `/api/analytics/summary`    | Quick stats summary                |
| POST   | `/api/report/generate`      | Download PDF report                |

### POST /api/predict — Request Body
```json
{
  "customerID":          "CUST-001",
  "gender":              "Male",
  "SeniorCitizen":       0,
  "Partner":             "No",
  "Dependents":          "No",
  "tenure":              3,
  "PhoneService":        "Yes",
  "MultipleLines":       "No",
  "InternetService":     "Fiber optic",
  "OnlineSecurity":      "No",
  "OnlineBackup":        "No",
  "DeviceProtection":    "No",
  "TechSupport":         "No",
  "StreamingTV":         "Yes",
  "StreamingMovies":     "Yes",
  "Contract":            "Month-to-month",
  "PaperlessBilling":    "Yes",
  "PaymentMethod":       "Electronic check",
  "MonthlyCharges":      85.50,
  "TotalCharges":        256.50,
  "CustomerSatisfaction": 2,
  "SupportTickets":      3
}
```

### POST /api/predict — Response
```json
{
  "success": true,
  "prediction":    { "churn_prediction": "Yes", "churn_probability": 77.4, "risk_level": "High" },
  "risk":          { "risk_score": 92.6, "risk_level": "High", "risk_color": "#ef4444" },
  "clv":           { "clv": 179.55, "revenue_risk": 1191.91, "value_score": 3.6 },
  "segment":       { "segment": "At Risk", "icon": "⚠️", "priority": "Intervene" },
  "churn_reasons": [{ "factor": "High Monthly Charges", "impact": "+20%", "severity": "High" }],
  "suggestions":   [{ "action": "Offer 20% Loyalty Discount", "priority": "High" }],
  "simulator":     { "original_prob": 77.4, "discount_10pct": 65.4, "annual_contract": 51.4 },
  "health_score":  18.2
}
```

---

## 🧬 ML Pipeline

```
Raw Data → Clean → Encode → Feature Engineering → Impute → Scale → Ensemble
                                   ↓
             tenure, TotalCharges, MonthlyCharges (top 3 features)
```

**Feature Engineering:**
- `charges_per_month` = TotalCharges / (tenure + 1)
- `is_new_customer`   = tenure ≤ 3
- `is_long_tenure`    = tenure ≥ 36
- `high_monthly_charge` = MonthlyCharges > 75th percentile

---

## ⭐ Portfolio Rating: 10/10
- ✅ Classification ML with ensemble
- ✅ Explainable AI (rule-based factor analysis)
- ✅ Full-stack React + Flask
- ✅ Customer analytics + CLV
- ✅ Retention strategy generation from real dataset
- ✅ Professional PDF reporting
- ✅ Campaign simulator
- ✅ Real-world business impact
