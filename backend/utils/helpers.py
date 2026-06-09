"""
helpers.py
----------
Shared utility functions for the Flask backend.
Response formatting, validation, logging helpers.
"""

import json
import datetime
import logging
import os

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(levelname)s]  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("churn_api")


# ── Response helpers ──────────────────────────────────────────────────────────

def success_response(data: dict, message: str = "OK") -> dict:
    return {
        "success":   True,
        "message":   message,
        "data":      data,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }


def error_response(message: str, code: int = 400):
    body = json.dumps({
        "success": False,
        "message": message,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    })
    return body, code, {"Content-Type": "application/json"}


# ── Validation ────────────────────────────────────────────────────────────────

REQUIRED_FIELDS = ["tenure", "MonthlyCharges", "Contract", "InternetService"]


def validate_customer_data(data: dict) -> tuple:
    """
    Returns (is_valid: bool, error_message: str | None).
    """
    if not data:
        return False, "Request body is empty."

    for field in REQUIRED_FIELDS:
        if field not in data:
            return False, f"Missing required field: '{field}'"

    try:
        tenure = float(data["tenure"])
        if tenure < 0 or tenure > 120:
            return False, "Tenure must be between 0 and 120 months."
    except (ValueError, TypeError):
        return False, "Tenure must be a number."

    try:
        monthly = float(data["MonthlyCharges"])
        if monthly < 0 or monthly > 1000:
            return False, "MonthlyCharges must be between 0 and 1000."
    except (ValueError, TypeError):
        return False, "MonthlyCharges must be a number."

    valid_contracts = ["Month-to-month", "One year", "Two year"]
    if data["Contract"] not in valid_contracts:
        return False, f"Contract must be one of: {valid_contracts}"

    return True, None


# ── Formatting ────────────────────────────────────────────────────────────────

def format_currency(value: float) -> str:
    return f"${value:,.2f}"


def format_percentage(value: float) -> str:
    return f"{value:.1f}%"
