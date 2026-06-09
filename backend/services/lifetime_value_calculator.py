"""
lifetime_value_calculator.py
-----------------------------
Calculates Customer Lifetime Value (CLV), revenue at risk,
and a 0-100 value score for each customer.
"""


# Average churn-free lifespans by contract type (in months)
LIFESPAN_MAP = {
    "Month-to-month": 18,
    "One year":       36,
    "Two year":       60,
}


def calculate_clv(customer: dict, churn_probability: float) -> dict:
    """
    CLV = MonthlyCharges × ExpectedRetentionMonths × MarginFactor

    ExpectedRetentionMonths = avg_lifespan × (1 - churn_probability)
    RevenueAtRisk = MonthlyCharges × avg_lifespan × churn_probability
    ValueScore = min(100, CLV / 50)  — normalised 0–100
    """
    monthly      = float(customer.get("MonthlyCharges", 50))
    tenure       = float(customer.get("tenure", 12))
    contract     = customer.get("Contract", "Month-to-month")
    satisfaction = int(customer.get("CustomerSatisfaction", 3))

    avg_lifespan = LIFESPAN_MAP.get(contract, 18)
    margin_factor = 0.70  # assumed 70% gross margin on subscription revenue

    # Satisfaction multiplier (satisfied customers stay longer)
    sat_multiplier = {1: 0.60, 2: 0.75, 3: 0.90, 4: 1.05, 5: 1.20}.get(satisfaction, 0.90)

    retention_prob     = max(0.01, 1 - churn_probability)
    expected_months    = round(avg_lifespan * retention_prob * sat_multiplier, 1)

    clv          = round(monthly * expected_months * margin_factor, 2)
    revenue_risk = round(monthly * avg_lifespan * churn_probability, 2)
    value_score  = min(100, round(clv / 50, 1))

    # Revenue forecast (next quarter / next year)
    monthly_revenue  = monthly
    quarterly_risk   = round(revenue_risk / (avg_lifespan / 3), 2)
    annual_risk      = round(revenue_risk / (avg_lifespan / 12), 2)
    current_revenue  = round(monthly * tenure, 2)

    return {
        "clv":              clv,
        "revenue_risk":     revenue_risk,
        "expected_months":  expected_months,
        "value_score":      value_score,
        "monthly_revenue":  monthly_revenue,
        "current_revenue":  current_revenue,
        "quarterly_risk":   quarterly_risk,
        "annual_risk":      min(annual_risk, revenue_risk),
        "avg_lifespan":     avg_lifespan,
        "retention_prob":   round(retention_prob, 4),
        "margin_factor":    margin_factor,
    }
