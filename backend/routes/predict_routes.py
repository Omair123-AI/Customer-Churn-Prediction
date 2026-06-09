"""
predict_routes.py
-----------------
POST /api/predict  — Full churn prediction pipeline.
Returns: prediction, risk score, CLV, segment, churn reasons, retention suggestions.
"""

from flask import Blueprint, request, jsonify
import sys, os, traceback
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ml.predictor                       import predict_churn
from services.risk_calculator           import calculate_risk_score
from services.churn_reason_analyzer     import analyze_churn_reasons
from services.retention_engine          import get_retention_suggestions
from services.customer_segmenter        import segment_customer
from services.lifetime_value_calculator import calculate_clv
from utils.helpers                      import validate_customer_data, logger

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        data = request.get_json(force=True, silent=True)

        is_valid, err = validate_customer_data(data)
        if not is_valid:
            return jsonify({"success": False, "message": err}), 400

        logger.info(f"Prediction request for customer: {data.get('customerID','unknown')}")

        # Run ML prediction
        prediction  = predict_churn(data)
        prob        = prediction["raw_probability"]

        # Run all service layers
        risk        = calculate_risk_score(data, prob)
        clv         = calculate_clv(data, prob)
        segment     = segment_customer(data, prob, clv["clv"])
        reasons     = analyze_churn_reasons(data, prob)
        suggestions = get_retention_suggestions(data, reasons, risk["risk_score"])

        # Retention campaign simulator
        simulator = {
            "original_prob":    round(prob * 100, 1),
            "discount_10pct":   round(max(0.03, prob - 0.12) * 100, 1),
            "discount_20pct":   round(max(0.02, prob - 0.22) * 100, 1),
            "annual_contract":  round(max(0.02, prob - 0.26) * 100, 1),
            "full_package":     round(max(0.01, prob - 0.35) * 100, 1),
        }

        # Customer health score (0-100, higher = healthier)
        health_score = round(max(0, min(100,
            (1 - prob) * 40 +
            min(40, float(data.get("tenure", 0)) * 0.6) +
            int(data.get("CustomerSatisfaction", 3)) * 4
        )), 1)

        logger.info(f"Prediction done — churn={prediction['churn_prediction']}, "
                    f"prob={prediction['churn_probability']}%, risk={risk['risk_level']}")

        return jsonify({
            "success":     True,
            "customer":    data,
            "prediction":  prediction,
            "risk":        risk,
            "clv":         clv,
            "segment":     segment,
            "churn_reasons":    reasons,
            "suggestions":      suggestions,
            "simulator":        simulator,
            "health_score":     health_score,
        })

    except Exception as e:
        logger.error(f"Prediction error: {e}\n{traceback.format_exc()}")
        return jsonify({"success": False, "message": str(e)}), 500
