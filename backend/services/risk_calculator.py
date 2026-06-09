"""
risk_calculator.py
------------------
Computes a 0-100 risk score from customer attributes + churn probability.
Risk levels: Low (0-30), Medium (31-70), High (71-100)
"""


RISK_BANDS = {
    "Low":    {"min": 0,  "max": 30,  "color": "#22c55e", "label": "Low Risk"},
    "Medium": {"min": 31, "max": 70,  "color": "#f59e0b", "label": "Medium Risk"},
    "High":   {"min": 71, "max": 100, "color": "#ef4444", "label": "High Risk"},
}


def calculate_risk_score(customer: dict, churn_probability: float) -> dict:
    """
    Calculate a composite risk score using churn probability + rule-based penalties.

    Penalty factors:
    - Tenure: new customers are higher risk
    - Contract type: M2M highest risk
    - Monthly charges: high charges = higher churn propensity
    - Internet service: fiber optic has highest churn historically
    - Support tickets: complaints signal dissatisfaction
    - Customer satisfaction: low scores = high risk
    - Payment method: electronic check = highest churn payment type
    """
    base_score = churn_probability * 100
    penalties  = 0

    tenure         = float(customer.get("tenure", 12))
    monthly        = float(customer.get("MonthlyCharges", 50))
    contract       = customer.get("Contract", "Month-to-month")
    internet       = customer.get("InternetService", "DSL")
    support_tickets = int(customer.get("SupportTickets", 0))
    satisfaction   = int(customer.get("CustomerSatisfaction", 3))
    payment        = customer.get("PaymentMethod", "")
    senior         = int(customer.get("SeniorCitizen", 0))

    # Tenure penalties
    if tenure <= 3:
        penalties += 12
    elif tenure <= 6:
        penalties += 8
    elif tenure <= 12:
        penalties += 4

    # Contract penalties
    contract_penalties = {
        "Month-to-month": 10,
        "One year":        3,
        "Two year":        0,
    }
    penalties += contract_penalties.get(contract, 5)

    # Charge penalties
    if monthly > 90:
        penalties += 9
    elif monthly > 75:
        penalties += 6
    elif monthly > 60:
        penalties += 3

    # Internet service
    if internet == "Fiber optic":
        penalties += 6

    # Support tickets
    if support_tickets >= 4:
        penalties += 10
    elif support_tickets >= 3:
        penalties += 7
    elif support_tickets >= 2:
        penalties += 4
    elif support_tickets >= 1:
        penalties += 2

    # Satisfaction score (1=lowest, 5=highest)
    sat_penalties = {1: 12, 2: 8, 3: 4, 4: 1, 5: 0}
    penalties += sat_penalties.get(satisfaction, 4)

    # Payment method
    if payment == "Electronic check":
        penalties += 5

    # Senior citizen
    if senior == 1:
        penalties += 3

    # Final score: base (from ML prob) + fraction of rule penalties
    final_score = min(100, round(base_score + penalties * 0.28, 1))

    # Determine risk level
    if final_score >= 71:
        risk_level = "High"
    elif final_score >= 31:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    band = RISK_BANDS[risk_level]

    return {
        "risk_score":      final_score,
        "risk_level":      risk_level,
        "risk_color":      band["color"],
        "risk_label":      band["label"],
        "base_score":      round(base_score, 1),
        "penalty_points":  penalties,
        "bands":           RISK_BANDS,
    }
