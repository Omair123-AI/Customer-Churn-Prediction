"""
predictor.py
------------
Runs inference on a single customer record.
Returns churn prediction, probability, and risk level.
"""

import numpy as np
from .preprocess import get_artifacts, preprocess_input


def predict_churn(customer_data: dict) -> dict:
    """
    Given a raw customer dict, return full prediction output.

    Returns:
        dict with keys: churn_prediction, churn_probability, risk_level, raw_probability
    """
    model, scaler, imputer, feature_names = get_artifacts()

    df    = preprocess_input(customer_data, feature_names)
    X_imp = imputer.transform(df)
    X_s   = scaler.transform(X_imp)

    prob  = float(model.predict_proba(X_s)[0][1])
    pred  = int(model.predict(X_s)[0])

    # Risk level thresholds
    if prob >= 0.70:
        risk_level = "High"
    elif prob >= 0.35:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "churn_prediction":  "Yes" if pred == 1 else "No",
        "churn_probability": round(prob * 100, 2),
        "risk_level":        risk_level,
        "raw_probability":   prob,
        "confidence":        round(max(prob, 1 - prob) * 100, 1),
    }
