"""
analytics_routes.py
-------------------
GET /api/analytics/dashboard  — Full dashboard KPIs and chart data.
GET /api/analytics/summary    — Quick summary stats.
GET /api/analytics/segments   — Customer segment breakdown.
GET /api/analytics/model      — Model performance metrics.
"""

from flask import Blueprint, jsonify
import pandas as pd
import numpy as np
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.helpers import logger

analytics_bp = Blueprint("analytics", __name__)

BASE_DIR    = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET     = os.path.join(BASE_DIR, "dataset", "customer_churn.csv")
META_FILE   = os.path.join(BASE_DIR, "backend", "models", "model_meta.json")
_df_cache   = None


def _load_df():
    global _df_cache
    if _df_cache is None:
        df = pd.read_csv(DATASET)
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce").fillna(0)
        _df_cache = df
    return _df_cache.copy()


def _load_meta():
    with open(META_FILE) as f:
        return json.load(f)


@analytics_bp.route("/analytics/dashboard", methods=["GET", "OPTIONS"])
def dashboard():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    try:
        df     = _load_df()
        total  = len(df)
        churned = int((df["Churn"] == "Yes").sum())
        active  = total - churned

        # ── KPIs ──────────────────────────────────────────────────────────────
        kpis = {
            "total_customers":    total,
            "active_customers":   active,
            "churned_customers":  churned,
            "churn_rate":         round(churned / total * 100, 2),
            "retention_rate":     round(active / total * 100, 2),
            "revenue_at_risk":    round(df[df["Churn"] == "Yes"]["MonthlyCharges"].sum(), 2),
            "avg_monthly_charges":round(df["MonthlyCharges"].mean(), 2),
            "avg_tenure_months":  round(df["tenure"].mean(), 1),
            "total_monthly_revenue": round(df["MonthlyCharges"].sum(), 2),
            "senior_citizens":    int(df["SeniorCitizen"].sum()),
        }

        # ── Churn by Contract ─────────────────────────────────────────────────
        contract_churn = (
            df.groupby("Contract")["Churn"]
            .apply(lambda x: round((x == "Yes").sum() / len(x) * 100, 1))
            .to_dict()
        )

        # ── Churn by Internet Service ─────────────────────────────────────────
        internet_churn = (
            df.groupby("InternetService")["Churn"]
            .apply(lambda x: round((x == "Yes").sum() / len(x) * 100, 1))
            .to_dict()
        )

        # ── Churn by Tenure bucket ────────────────────────────────────────────
        df["tenure_group"] = pd.cut(
            df["tenure"],
            bins=[0, 6, 12, 24, 36, 72],
            labels=["0–6m", "7–12m", "13–24m", "25–36m", "36m+"],
        )
        tenure_churn = (
            df.groupby("tenure_group", observed=True)["Churn"]
            .apply(lambda x: round((x == "Yes").sum() / len(x) * 100, 1))
            .to_dict()
        )

        # ── Monthly charge distribution ───────────────────────────────────────
        bins   = [0, 30, 50, 65, 80, 95, 200]
        labels = ["<$30", "$30–50", "$50–65", "$65–80", "$80–95", "$95+"]
        df["charge_bucket"] = pd.cut(df["MonthlyCharges"], bins=bins, labels=labels)
        charge_groups = df.groupby("charge_bucket", observed=True)["Churn"]
        charge_dist = {}
        for bucket, group in charge_groups:
            total_b   = int(len(group))
            churned_b = int((group == "Yes").sum())
            charge_dist[str(bucket)] = {
                "total":   total_b,
                "churned": churned_b,
                "rate":    round(churned_b / total_b * 100, 1) if total_b else 0,
            }

        # ── Risk distribution ─────────────────────────────────────────────────
        high_risk   = int((df["MonthlyCharges"] > 75).sum())
        medium_risk = int(((df["MonthlyCharges"] >= 40) & (df["MonthlyCharges"] <= 75)).sum())
        low_risk    = total - high_risk - medium_risk

        # ── Customer segments ─────────────────────────────────────────────────
        segments = {
            "High Value":   int(((df["tenure"] >= 24) & (df["MonthlyCharges"] > 65) & (df["Churn"] == "No")).sum()),
            "At Risk":      churned,
            "Loyal":        int(((df["tenure"] >= 24) & (df["Churn"] == "No")).sum()),
            "New Customer": int((df["tenure"] <= 6).sum()),
            "Inactive":     int(((df["MonthlyCharges"] < 30) & (df["Churn"] == "No")).sum()),
        }

        # ── Payment method churn ──────────────────────────────────────────────
        payment_churn = (
            df.groupby("PaymentMethod")["Churn"]
            .apply(lambda x: round((x == "Yes").sum() / len(x) * 100, 1))
            .to_dict()
        )

        # ── Senior vs Non-senior churn ────────────────────────────────────────
        senior_churn = (
            df.groupby("SeniorCitizen")["Churn"]
            .apply(lambda x: round((x == "Yes").sum() / len(x) * 100, 1))
            .rename({0: "Non-Senior", 1: "Senior"})
            .to_dict()
        )

        # ── Model meta ────────────────────────────────────────────────────────
        meta = _load_meta()

        return jsonify({
            "success":          True,
            "kpis":             kpis,
            "contract_churn":   contract_churn,
            "internet_churn":   internet_churn,
            "tenure_churn":     {str(k): v for k, v in tenure_churn.items()},
            "charge_distribution": charge_dist,
            "risk_distribution": {"High": high_risk, "Medium": medium_risk, "Low": low_risk},
            "segments":         segments,
            "payment_churn":    payment_churn,
            "senior_churn":     senior_churn,
            "model_performance": {
                "accuracy":     meta["accuracy"],
                "roc_auc":      meta["roc_auc"],
                "cv_auc_mean":  meta["cv_auc_mean"],
                "cv_auc_std":   meta["cv_auc_std"],
                "top_features": meta["top_features"][:8],
                "n_train":      meta["n_train"],
                "n_test":       meta["n_test"],
            },
        })

    except Exception as e:
        import traceback
        logger.error(f"Dashboard error: {e}\n{traceback.format_exc()}")
        return jsonify({"success": False, "message": str(e)}), 500


@analytics_bp.route("/analytics/summary", methods=["GET", "OPTIONS"])
def summary():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    try:
        df      = _load_df()
        total   = len(df)
        churned = int((df["Churn"] == "Yes").sum())
        return jsonify({
            "success":        True,
            "total":          total,
            "churned":        churned,
            "churn_rate":     round(churned / total * 100, 2),
            "avg_monthly":    round(df["MonthlyCharges"].mean(), 2),
            "avg_tenure":     round(df["tenure"].mean(), 1),
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Missing import fix
from flask import request
