"""
churn_reason_analyzer.py
------------------------
Identifies the top churn risk drivers for a specific customer.
Returns ranked list of factors with impact percentages and severity.
"""


SEVERITY_WEIGHTS = {"High": 3, "Medium": 2, "Low": 1}


def analyze_churn_reasons(customer: dict, churn_probability: float) -> list:
    """
    Rule-based churn reason analysis. Each rule checks customer attributes
    and appends a factor dict if the condition is met.

    Returns list sorted by severity (High → Medium → Low), max 6 items.
    """
    reasons = []

    monthly        = float(customer.get("MonthlyCharges", 50))
    tenure         = float(customer.get("tenure", 12))
    contract       = customer.get("Contract", "Month-to-month")
    internet       = customer.get("InternetService", "DSL")
    satisfaction   = int(customer.get("CustomerSatisfaction", 3))
    support_tickets = int(customer.get("SupportTickets", 0))
    senior         = int(customer.get("SeniorCitizen", 0))
    payment        = customer.get("PaymentMethod", "")
    paperless      = customer.get("PaperlessBilling", "No")
    online_sec     = customer.get("OnlineSecurity", "No")
    tech_support   = customer.get("TechSupport", "No")
    streaming_tv   = customer.get("StreamingTV", "No")
    streaming_mv   = customer.get("StreamingMovies", "No")
    dependents     = customer.get("Dependents", "No")
    partner        = customer.get("Partner", "No")

    # ── High Severity ──────────────────────────────────────────────────────────
    if monthly > 85:
        reasons.append({
            "factor":      "Very High Monthly Charges",
            "detail":      f"${monthly:.2f}/mo is well above average ($64.76)",
            "impact":      "+20%",
            "severity":    "High",
            "icon":        "💰",
            "suggestion":  "Offer 15–20% discount or plan downgrade",
        })
    elif monthly > 70:
        reasons.append({
            "factor":      "High Monthly Charges",
            "detail":      f"${monthly:.2f}/mo exceeds the high-risk threshold",
            "impact":      "+14%",
            "severity":    "High",
            "icon":        "💰",
            "suggestion":  "Offer loyalty pricing or bundle discount",
        })

    if tenure <= 3:
        reasons.append({
            "factor":      "Very Low Tenure — New Customer",
            "detail":      f"Only {tenure:.0f} months — highest churn window",
            "impact":      "+18%",
            "severity":    "High",
            "icon":        "🆕",
            "suggestion":  "Activate onboarding program & check-in call",
        })
    elif tenure <= 12:
        reasons.append({
            "factor":      "Short Tenure",
            "detail":      f"{tenure:.0f} months — still in early loyalty phase",
            "impact":      "+10%",
            "severity":    "Medium",
            "icon":        "📅",
            "suggestion":  "Enroll in loyalty rewards program",
        })

    if contract == "Month-to-month":
        reasons.append({
            "factor":      "Month-to-Month Contract",
            "detail":      "No long-term commitment — easiest to cancel",
            "impact":      "+15%",
            "severity":    "High",
            "icon":        "📋",
            "suggestion":  "Offer annual contract with 1 free month incentive",
        })

    if satisfaction <= 2:
        reasons.append({
            "factor":      "Low Customer Satisfaction",
            "detail":      f"Score {satisfaction}/5 — critically low satisfaction",
            "impact":      "+16%",
            "severity":    "High",
            "icon":        "😞",
            "suggestion":  "Immediate customer success intervention required",
        })
    elif satisfaction == 3:
        reasons.append({
            "factor":      "Below-Average Satisfaction",
            "detail":      f"Score {satisfaction}/5 — at risk of disengagement",
            "impact":      "+8%",
            "severity":    "Medium",
            "icon":        "😐",
            "suggestion":  "Schedule proactive check-in and gather feedback",
        })

    if support_tickets >= 3:
        reasons.append({
            "factor":      "Frequent Support Complaints",
            "detail":      f"{support_tickets} tickets filed — high frustration signal",
            "impact":      "+12%",
            "severity":    "High",
            "icon":        "🎫",
            "suggestion":  "Escalate to senior support; resolve all open tickets",
        })

    # ── Medium Severity ────────────────────────────────────────────────────────
    if internet == "Fiber optic":
        reasons.append({
            "factor":      "Fiber Optic Service",
            "detail":      "Fiber optic customers churn at 41.9% vs 19% for DSL",
            "impact":      "+8%",
            "severity":    "Medium",
            "icon":        "🌐",
            "suggestion":  "Review service quality and offer tech support upgrade",
        })

    if payment == "Electronic check":
        reasons.append({
            "factor":      "High-Risk Payment Method",
            "detail":      "Electronic check has highest churn rate among payment types",
            "impact":      "+6%",
            "severity":    "Medium",
            "icon":        "💳",
            "suggestion":  "Incentivize switch to auto-pay (bank transfer/card)",
        })

    if online_sec == "No" and internet != "No":
        reasons.append({
            "factor":      "No Online Security Add-on",
            "detail":      "Missing security service reduces perceived value",
            "impact":      "+4%",
            "severity":    "Medium",
            "icon":        "🔒",
            "suggestion":  "Offer 3 months free online security trial",
        })

    # ── Low Severity ───────────────────────────────────────────────────────────
    if senior == 1:
        reasons.append({
            "factor":      "Senior Citizen Profile",
            "detail":      "Senior citizens show elevated churn propensity",
            "impact":      "+5%",
            "severity":    "Low",
            "icon":        "👴",
            "suggestion":  "Assign dedicated customer success manager",
        })

    if dependents == "No" and partner == "No":
        reasons.append({
            "factor":      "Single Household",
            "detail":      "Customers without family ties churn more often",
            "impact":      "+3%",
            "severity":    "Low",
            "icon":        "👤",
            "suggestion":  "Highlight personal value-add features",
        })

    if not reasons:
        reasons.append({
            "factor":      "Combined Moderate Risk Factors",
            "detail":      f"No single dominant driver — overall probability {churn_probability*100:.1f}%",
            "impact":      "+5%",
            "severity":    "Low",
            "icon":        "⚠️",
            "suggestion":  "Monitor engagement and proactively reach out",
        })

    # Sort: High → Medium → Low, take top 6
    reasons.sort(key=lambda x: SEVERITY_WEIGHTS.get(x["severity"], 0), reverse=True)
    return reasons[:6]
