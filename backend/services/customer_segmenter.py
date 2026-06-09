"""
customer_segmenter.py
---------------------
Classifies a customer into one of 5 segments based on value, risk, and tenure.
Segments: High Value | At Risk | Loyal | New Customer | Inactive
"""


SEGMENTS = {
    "High Value":   {"color": "#818cf8", "icon": "👑", "priority": "Retain"},
    "At Risk":      {"color": "#f87171", "icon": "⚠️", "priority": "Intervene"},
    "Loyal":        {"color": "#4ade80", "icon": "🏆", "priority": "Reward"},
    "New Customer": {"color": "#60a5fa", "icon": "🆕", "priority": "Nurture"},
    "Inactive":     {"color": "#94a3b8", "icon": "😴", "priority": "Re-engage"},
    "Stable":       {"color": "#fbbf24", "icon": "📊", "priority": "Monitor"},
}


def segment_customer(customer: dict, churn_probability: float, clv: float) -> dict:
    """
    Determine customer segment using a decision-tree logic.

    Priority order:
    1. High Value  — high CLV, low churn risk
    2. At Risk     — high churn probability
    3. Loyal       — long tenure, stable profile
    4. New Customer — recently joined
    5. Inactive    — low engagement / low value
    6. Stable      — average profile
    """
    tenure       = float(customer.get("tenure", 12))
    monthly      = float(customer.get("MonthlyCharges", 50))
    satisfaction = int(customer.get("CustomerSatisfaction", 3))
    contract     = customer.get("Contract", "Month-to-month")

    # 1. High Value
    if clv > 4000 and churn_probability < 0.30 and tenure >= 12:
        segment = "High Value"
        description = "Premium customer with strong retention profile and high lifetime value."

    # 2. At Risk
    elif churn_probability >= 0.60:
        segment = "At Risk"
        description = "High churn probability — immediate retention action required."

    # 3. Loyal
    elif tenure >= 24 and churn_probability < 0.35 and satisfaction >= 3:
        segment = "Loyal"
        description = "Long-tenured, satisfied customer with stable engagement."

    # 4. New Customer
    elif tenure <= 6:
        segment = "New Customer"
        description = "Recently onboarded — in critical early loyalty-building phase."

    # 5. Inactive
    elif satisfaction <= 2 or (monthly < 25 and tenure > 12):
        segment = "Inactive"
        description = "Low engagement signals. May need re-activation campaign."

    # 6. Stable (catch-all)
    else:
        segment = "Stable"
        description = "Average risk and value profile. Monitor and grow relationship."

    meta = SEGMENTS[segment]
    return {
        "segment":     segment,
        "description": description,
        "color":       meta["color"],
        "icon":        meta["icon"],
        "priority":    meta["priority"],
        "all_segments": list(SEGMENTS.keys()),
    }
