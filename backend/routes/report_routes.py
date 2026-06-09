"""
report_routes.py
----------------
POST /api/report/generate  — Generate & return PDF report for a customer.

Fix: send_file() with as_attachment=True doesn't always inherit the CORS
headers added by after_request. We manually attach them here so the browser
accepts the blob response across origins.
"""

from utils.helpers import validate_customer_data, logger
from reports.report_generator import generate_pdf_report
from services.lifetime_value_calculator import calculate_clv
from services.customer_segmenter import segment_customer
from services.retention_engine import get_retention_suggestions
from services.churn_reason_analyzer import analyze_churn_reasons
from services.risk_calculator import calculate_risk_score
from ml.predictor import predict_churn
from flask import Blueprint, request, jsonify, send_file, make_response
import io
import sys
import os
import traceback

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


report_bp = Blueprint("report", __name__)

CORS_HEADERS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Expose-Headers": "Content-Disposition",
}


@report_bp.route("/report/generate", methods=["POST", "OPTIONS"])
def generate_report():
    # ── Preflight ─────────────────────────────────────────────────────────────
    if request.method == "OPTIONS":
        resp = make_response("", 200)
        for k, v in CORS_HEADERS.items():
            resp.headers[k] = v
        return resp

    try:
        data = request.get_json(force=True, silent=True)
        is_valid, err = validate_customer_data(data)
        if not is_valid:
            return jsonify({"success": False, "message": err}), 400

        logger.info(
            f"PDF report requested for: {data.get('customerID', 'unknown')}")

        prediction = predict_churn(data)
        prob = prediction["raw_probability"]
        clv_data = calculate_clv(data, prob)

        full_result = {
            "customer":      data,
            "prediction":    prediction,
            "risk":          calculate_risk_score(data, prob),
            "clv":           clv_data,
            "segment":       segment_customer(data, prob, clv_data["clv"]),
            "churn_reasons": analyze_churn_reasons(data, prob),
            "suggestions":   get_retention_suggestions(data, [], 0),
        }

        pdf_bytes = generate_pdf_report(full_result)
        cid = data.get("customerID", "customer").replace(" ", "_")
        filename = f"churn_report_{cid}.pdf"

        logger.info(f"PDF generated for {cid} ({len(pdf_bytes):,} bytes)")

        # ── Build response manually so CORS headers are guaranteed ────────────
        resp = make_response(pdf_bytes)
        resp.headers["Content-Type"] = "application/pdf"
        resp.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
        resp.headers["Content-Length"] = str(len(pdf_bytes))
        for k, v in CORS_HEADERS.items():
            resp.headers[k] = v
        return resp

    except Exception as e:
        logger.error(f"Report error: {e}\n{traceback.format_exc()}")
        err_resp = make_response(
            jsonify({"success": False, "message": str(e)}).get_data(), 500
        )
        err_resp.headers["Content-Type"] = "application/json"
        for k, v in CORS_HEADERS.items():
            err_resp.headers[k] = v
        return err_resp
