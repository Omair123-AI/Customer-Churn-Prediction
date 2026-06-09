"""
retention_engine.py
-------------------
Generates personalised retention strategy recommendations.
Combines rule-based logic with the 5,000-rule retention_strategies dataset.
"""

import csv
import os
import random

STRATEGIES_FILE = os.path.join(
    os.path.dirname(__file__), "..", "..", "dataset", "retention_strategies.csv"
)


def _load_strategies():
    """Load retention strategy dataset, grouped by severity."""
    strategies = {"High": [], "Medium": [], "Low": [], "Critical": []}
    try:
        with open(STRATEGIES_FILE, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                sev = row.get("severity", "Medium")
                if sev in strategies:
                    strategies[sev].append(row.get("suggestion", row.get("risk_factor", "")))
    except Exception:
        pass
    return strategies


_STRATEGY_POOL = _load_strategies()


def _pick_from_pool(severity: str, n: int = 1) -> list:
    """Pick n random suggestions from the dataset pool for a given severity."""
    pool = _STRATEGY_POOL.get(severity, [])
    if not pool:
        return []
    return random.sample(pool, min(n, len(pool)))


def get_retention_suggestions(customer: dict, churn_reasons: list, risk_score: float) -> list:
    """
    Build a ranked list of retention actions tailored to this customer.
    Returns max 6 suggestions, sorted by priority (High → Medium → Low).
    """
    suggestions = []

    monthly        = float(customer.get("MonthlyCharges", 50))
    contract       = customer.get("Contract", "Month-to-month")
    tenure         = float(customer.get("tenure", 12))
    satisfaction   = int(customer.get("CustomerSatisfaction", 3))
    support_tickets = int(customer.get("SupportTickets", 0))
    internet       = customer.get("InternetService", "DSL")
    payment        = customer.get("PaymentMethod", "")
    online_sec     = customer.get("OnlineSecurity", "No")
    senior         = int(customer.get("SeniorCitizen", 0))

    # ── Pricing interventions ─────────────────────────────────────────────────
    if monthly > 85:
        suggestions.append({
            "action":   "Offer 20% Loyalty Discount for 3 Months",
            "priority": "High",
            "category": "Pricing",
            "icon":     "🏷️",
            "impact":   "Reduces churn probability by ~20%",
            "effort":   "Low",
        })
    elif monthly > 65:
        suggestions.append({
            "action":   "Offer 15% Loyalty Discount",
            "priority": "High",
            "category": "Pricing",
            "icon":     "🏷️",
            "impact":   "Reduces churn probability by ~15%",
            "effort":   "Low",
        })

    # ── Contract upgrade ──────────────────────────────────────────────────────
    if contract == "Month-to-month":
        suggestions.append({
            "action":   "Upgrade to Annual Contract + 1 Free Month",
            "priority": "High",
            "category": "Contract",
            "icon":     "📝",
            "impact":   "Reduces churn probability by ~22%",
            "effort":   "Low",
        })
    elif contract == "One year":
        suggestions.append({
            "action":   "Upgrade to 2-Year Contract with Price Lock",
            "priority": "Medium",
            "category": "Contract",
            "icon":     "📝",
            "impact":   "Increases retention rate by ~18%",
            "effort":   "Low",
        })

    # ── Satisfaction & support ────────────────────────────────────────────────
    if satisfaction <= 3:
        suggestions.append({
            "action":   "Schedule Dedicated Customer Success Call",
            "priority": "High",
            "category": "Engagement",
            "icon":     "📞",
            "impact":   "Improves satisfaction score by ~35%",
            "effort":   "Medium",
        })

    if support_tickets >= 2:
        suggestions.append({
            "action":   "Resolve All Outstanding Complaints (Priority SLA)",
            "priority": "High",
            "category": "Support",
            "icon":     "🎫",
            "impact":   "Reduces complaint-driven churn by ~15%",
            "effort":   "Medium",
        })

    # ── Loyalty & engagement ──────────────────────────────────────────────────
    if tenure <= 12:
        suggestions.append({
            "action":   "Enroll in Loyalty Rewards Program",
            "priority": "Medium",
            "category": "Loyalty",
            "icon":     "⭐",
            "impact":   "Increases retention by ~12%",
            "effort":   "Low",
        })

    if tenure >= 12 and satisfaction >= 4:
        suggestions.append({
            "action":   "Nominate as Brand Ambassador / Referral Program",
            "priority": "Low",
            "category": "Loyalty",
            "icon":     "🏆",
            "impact":   "Deepens brand relationship and reduces churn ~8%",
            "effort":   "Low",
        })

    # ── Service upgrades ──────────────────────────────────────────────────────
    if online_sec == "No" and internet != "No":
        suggestions.append({
            "action":   "Free 3-Month Online Security Add-on Trial",
            "priority": "Medium",
            "category": "Service",
            "icon":     "🔒",
            "impact":   "Increases product stickiness by ~10%",
            "effort":   "Low",
        })

    if internet == "Fiber optic" and satisfaction <= 3:
        suggestions.append({
            "action":   "Proactive Network Quality Review",
            "priority": "Medium",
            "category": "Service",
            "icon":     "🌐",
            "impact":   "Resolves service dissatisfaction, reduces churn ~12%",
            "effort":   "High",
        })

    # ── Payment method ────────────────────────────────────────────────────────
    if payment == "Electronic check":
        suggestions.append({
            "action":   "Incentivise Switch to Auto-Pay (5% discount)",
            "priority": "Medium",
            "category": "Billing",
            "icon":     "💳",
            "impact":   "Auto-pay customers churn 18% less",
            "effort":   "Low",
        })

    # ── Senior-specific ───────────────────────────────────────────────────────
    if senior == 1:
        suggestions.append({
            "action":   "Assign Dedicated Senior Customer Manager",
            "priority": "Medium",
            "category": "Engagement",
            "icon":     "👴",
            "impact":   "Reduces senior churn by ~14%",
            "effort":   "Medium",
        })

    # ── Fill remaining slots from dataset pool ────────────────────────────────
    if len(suggestions) < 6:
        pool_items = _pick_from_pool("High", 2)
        for item in pool_items:
            if len(suggestions) >= 6:
                break
            if item and not any(s["action"] == item for s in suggestions):
                suggestions.append({
                    "action":   item,
                    "priority": "Medium",
                    "category": "General",
                    "icon":     "💡",
                    "impact":   "Based on high-risk customer profiles in dataset",
                    "effort":   "Medium",
                })

    # Sort: High → Medium → Low
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    suggestions.sort(key=lambda x: priority_order.get(x["priority"], 1))
    return suggestions[:6]
