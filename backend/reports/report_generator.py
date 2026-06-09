"""
report_generator.py
--------------------
Generates a professional PDF churn analysis report using ReportLab.
Fix 1: Replaced all emoji icons with ASCII/text symbols ReportLab can render.
Fix 2: Widened Category column so "Engagement" etc. never truncate.
Fix 3: Severity badges use bold text colour instead of emoji prefix.
"""

import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table,
    TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT

# ── Colour palette ────────────────────────────────────────────────────────────
INDIGO = colors.HexColor("#4f52c9")
INDIGO_L = colors.HexColor("#6d72e8")
TEAL = colors.HexColor("#2a9d8f")
RED = colors.HexColor("#e05252")
AMBER = colors.HexColor("#c97d2e")
GREEN = colors.HexColor("#3a9e5a")
SLATE = colors.HexColor("#1e293b")
MUTED = colors.HexColor("#64748b")
BG_CARD = colors.HexColor("#f8fafc")
BG_HEAD = colors.HexColor("#e0e7ff")
WHITE = colors.white

SEVERITY_COLORS = {"High": RED, "Medium": AMBER,
                   "Low": GREEN, "Critical": colors.HexColor("#a855f7")}
RISK_COLORS = {"High": RED, "Medium": AMBER, "Low": GREEN}

# ── Icon replacements (ASCII only — no emoji) ─────────────────────────────────
ICON_MAP = {
    "💰": "[$$]", "🏷️": "[%%]", "📝": "[CTR]", "📞": "[TEL]",
    "🎫": "[TKT]", "🆕": "[NEW]", "📋": "[DOC]", "😞": "[LOW]",
    "😐": "[MED]", "🌐": "[NET]", "💳": "[PAY]", "🔒": "[SEC]",
    "👴": "[SEN]", "👤": "[USR]", "⚠️": "[!]",  "💡": "[TIP]",
    "⭐": "[*]",  "🏆": "[TOP]", "📉": "[DN]",  "🛡️": "[SHD]",
    "📅": "[CAL]", "👥": "[GRP]", "💸": "[RSK]", "🧠": "[AI]",
    "🎯": "[TGT]", "⚡": "[ZAP]", "💎": "[GEM]", "📄": "[PDF]",
    "🔮": "[ML]", "🎮": "[SIM]", "👑": "[VIP]", "🏠": "[HOM]",
    "✅": "[OK]", "❌": "[X]",   "►":  ">",
}


def _clean(text):
    """Replace emoji with ASCII labels; preserve all standard punctuation."""
    if not text:
        return ""
    result = str(text)
    for emoji, replacement in ICON_MAP.items():
        result = result.replace(emoji, replacement)
    # Replace em-dash and smart quotes with plain ASCII equivalents
    result = (result
              .replace("—", " - ")   # em dash -> hyphen
              .replace("–", "-")     # en dash -> hyphen
              .replace("‘", "'")     # left single quote
              .replace("’", "'")     # right single quote
              .replace("“", '"')     # left double quote
              .replace("”", '"')     # right double quote
              .replace("•", "*")     # bullet
              .replace("é", "e")     # e-accent
              )
    # Only strip characters truly outside latin-1 (codepoint > 255)
    return "".join(ch if ord(ch) < 256 else "?" for ch in result)


def _styles():
    s = getSampleStyleSheet()
    return {
        "title":    ParagraphStyle("T",  parent=s["Title"],   textColor=INDIGO,  fontSize=22, spaceAfter=4,  fontName="Helvetica-Bold"),
        "subtitle": ParagraphStyle("ST", parent=s["Normal"],  textColor=MUTED,   fontSize=11, spaceAfter=2),
        "h2":       ParagraphStyle("H2", parent=s["Heading2"], textColor=INDIGO,  fontSize=13, spaceBefore=14, spaceAfter=6,  fontName="Helvetica-Bold"),
        "body":     ParagraphStyle("B",  parent=s["Normal"],  textColor=SLATE,   fontSize=9,  leading=14),
        "small":    ParagraphStyle("SM", parent=s["Normal"],  textColor=MUTED,   fontSize=8,  leading=12),
        "footer":   ParagraphStyle("FT", parent=s["Normal"],  textColor=MUTED,   fontSize=8,  alignment=TA_CENTER),
        "sev_h":    ParagraphStyle("SH", parent=s["Normal"],  textColor=RED,     fontSize=9,  fontName="Helvetica-Bold"),
        "sev_m":    ParagraphStyle("SM2", parent=s["Normal"],  textColor=AMBER,   fontSize=9,  fontName="Helvetica-Bold"),
        "sev_l":    ParagraphStyle("SL", parent=s["Normal"],  textColor=GREEN,   fontSize=9,  fontName="Helvetica-Bold"),
        "pri_h":    ParagraphStyle("PH", parent=s["Normal"],  textColor=RED,     fontSize=9,  fontName="Helvetica-Bold"),
        "pri_m":    ParagraphStyle("PM", parent=s["Normal"],  textColor=AMBER,   fontSize=9,  fontName="Helvetica-Bold"),
        "pri_l":    ParagraphStyle("PL", parent=s["Normal"],  textColor=GREEN,   fontSize=9,  fontName="Helvetica-Bold"),
    }


def _info_table(rows, col_widths=None):
    col_widths = col_widths or [3.8*cm, 4.8*cm, 3.8*cm, 4.8*cm]
    t = Table(rows, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BG_CARD),
        ("BACKGROUND",    (0, 0), (0, -1),  BG_HEAD),
        ("BACKGROUND",    (2, 0), (2, -1),  BG_HEAD),
        ("FONTNAME",      (0, 0), (0, -1),  "Helvetica-Bold"),
        ("FONTNAME",      (2, 0), (2, -1),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("TEXTCOLOR",     (0, 0), (0, -1),  SLATE),
        ("TEXTCOLOR",     (2, 0), (2, -1),  SLATE),
        ("GRID",          (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1),
         [BG_CARD, colors.HexColor("#f1f5f9")]),
    ]))
    return t


def generate_pdf_report(full_result: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        topMargin=2*cm, bottomMargin=2*cm,
        leftMargin=2*cm, rightMargin=2*cm,
    )
    ST = _styles()
    story = []

    c = full_result.get("customer", {})
    pred = full_result.get("prediction", {})
    risk = full_result.get("risk", {})
    clv = full_result.get("clv", {})
    seg = full_result.get("segment", {})
    reasons = full_result.get("churn_reasons", [])
    suggestions = full_result.get("suggestions", [])

    churn_yes = pred.get("churn_prediction") == "Yes"
    churn_color = RED if churn_yes else GREEN
    risk_color = RISK_COLORS.get(risk.get("risk_level", "Low"), GREEN)

    # ── HEADER ────────────────────────────────────────────────────────────────
    story.append(Paragraph("Customer Churn Analysis Report", ST["title"]))
    story.append(Paragraph(
        "AI-Powered Retention Intelligence Platform  |  Confidential", ST["subtitle"]))
    story.append(HRFlowable(width="100%", thickness=2,
                 color=INDIGO, spaceAfter=10))

    # Verdict banner
    verdict_text = "WILL CHURN" if churn_yes else "WILL STAY"
    banner_data = [[
        Paragraph(f"<b>VERDICT: {verdict_text}</b>",
                  ParagraphStyle("V", fontSize=14, textColor=churn_color, fontName="Helvetica-Bold")),
        Paragraph(f"<b>Probability: {pred.get('churn_probability', 0):.1f}%</b>",
                  ParagraphStyle("VP", fontSize=12, textColor=churn_color, fontName="Helvetica-Bold", alignment=TA_CENTER)),
        Paragraph(f"<b>Risk: {risk.get('risk_level', '?')}  ({risk.get('risk_score', 0)}/100)</b>",
                  ParagraphStyle("VR", fontSize=12, textColor=risk_color, fontName="Helvetica-Bold", alignment=TA_RIGHT)),
    ]]
    bt = Table(banner_data, colWidths=[7*cm, 5.5*cm, 4.7*cm])
    bt.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#fafafa")),
        ("BOX",           (0, 0), (-1, -1), 1.5, churn_color),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
    ]))
    story.append(bt)
    story.append(Spacer(1, 0.5*cm))

    # ── 1. CUSTOMER INFORMATION ───────────────────────────────────────────────
    story.append(Paragraph("1. Customer Information", ST["h2"]))
    info_rows = [
        ["Customer ID",      _clean(c.get("customerID", "N/A")),
         "Gender",          _clean(c.get("gender", "N/A"))],
        ["Senior Citizen",   "Yes" if str(c.get("SeniorCitizen", "0")) in ["1", "Yes"] else "No",
         "Partner",         _clean(c.get("Partner", "N/A"))],
        ["Dependents",       _clean(c.get("Dependents", "N/A")),
         "Tenure",          f"{c.get('tenure', 'N/A')} months"],
        ["Contract Type",    _clean(c.get("Contract", "N/A")),
         "Payment",         _clean(c.get("PaymentMethod", "N/A"))],
        ["Monthly Charges",  f"${float(c.get('MonthlyCharges', 0)):.2f}",
         "Total Charges",   f"${float(c.get('TotalCharges', 0)):.2f}"],
        ["Internet Service", _clean(c.get("InternetService", "N/A")),
         "Phone Service",   _clean(c.get("PhoneService", "N/A"))],
        ["Streaming TV",     _clean(c.get("StreamingTV", "N/A")),
         "Streaming Movies", _clean(c.get("StreamingMovies", "N/A"))],
        ["Online Security",  _clean(c.get("OnlineSecurity", "N/A")),
         "Tech Support",    _clean(c.get("TechSupport", "N/A"))],
        ["Satisfaction",     f"{c.get('CustomerSatisfaction', 'N/A')}/5",
         "Support Tickets", str(c.get("SupportTickets", "N/A"))],
    ]
    story.append(_info_table(info_rows))
    story.append(Spacer(1, 0.4*cm))

    # ── 2. PREDICTION & RISK ──────────────────────────────────────────────────
    story.append(Paragraph("2. Prediction & Risk Analysis", ST["h2"]))
    pred_rows = [
        ["Churn Prediction",  pred.get("churn_prediction", "?"),
         "Churn Probability", f"{pred.get('churn_probability', 0):.1f}%"],
        ["Risk Level",        risk.get("risk_level", "?"),
         "Risk Score",        f"{risk.get('risk_score', 0)}/100"],
        ["Model Confidence",  f"{pred.get('confidence', 0):.1f}%",
         "Base Score",        f"{risk.get('base_score', 0)}/100"],
    ]
    story.append(_info_table(pred_rows))
    story.append(Spacer(1, 0.4*cm))

    # ── 3. CLV ────────────────────────────────────────────────────────────────
    story.append(Paragraph("3. Customer Lifetime Value Analysis", ST["h2"]))
    clv_rows = [
        ["CLV Estimate",      f"${clv.get('clv', 0):,.2f}",
         "Revenue at Risk",   f"${clv.get('revenue_risk', 0):,.2f}"],
        ["Monthly Revenue",   f"${clv.get('monthly_revenue', 0):.2f}",   "Expected Months",   str(
            clv.get('expected_months', 0))],
        ["Value Score",       f"{clv.get('value_score', 0)}/100",
         "Current Revenue",   f"${clv.get('current_revenue', 0):,.2f}"],
        ["Quarterly Risk",    f"${clv.get('quarterly_risk', 0):,.2f}",
         "Annual Risk",       f"${clv.get('annual_risk', 0):,.2f}"],
        ["Customer Segment",  _clean(seg.get("segment", "?")),
         "Segment Action",    _clean(seg.get("priority", "?"))],
    ]
    story.append(_info_table(clv_rows))
    story.append(Spacer(1, 0.4*cm))

    # ── 4. CHURN REASONS ──────────────────────────────────────────────────────
    if reasons:
        story.append(Paragraph("4. Churn Risk Driver Analysis", ST["h2"]))
        r_header = [
            Paragraph("<b>Risk Factor</b>",  ST["body"]),
            Paragraph("<b>Detail</b>",        ST["body"]),
            Paragraph("<b>Impact</b>",        ST["body"]),
            Paragraph("<b>Severity</b>",      ST["body"]),
        ]
        r_data = [r_header]
        for r in reasons:
            sev = r.get("severity", "Low")
            sev_style = ST.get(f"sev_{sev[0].lower()}", ST["body"])
            r_data.append([
                Paragraph(_clean(r.get("factor", "")),  ST["body"]),
                Paragraph(_clean(r.get("detail", "")),  ST["small"]),
                Paragraph(_clean(r.get("impact", "")),  ST["body"]),
                Paragraph(sev,                          sev_style),
            ])
        # Wider columns: Factor | Detail | Impact | Severity
        rt = Table(r_data, colWidths=[4.5*cm, 6.5*cm, 1.6*cm, 2.0*cm])
        rt.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0),  INDIGO),
            ("TEXTCOLOR",     (0, 0), (-1, 0),  WHITE),
            ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1),
             [BG_CARD, colors.HexColor("#f1f5f9")]),
            ("GRID",          (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
            ("FONTSIZE",      (0, 0), (-1, -1), 9),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(rt)
        story.append(Spacer(1, 0.4*cm))

    # ── 5. RETENTION SUGGESTIONS ──────────────────────────────────────────────
    if suggestions:
        story.append(
            Paragraph("5. AI Retention Strategy Recommendations", ST["h2"]))
        s_header = [
            Paragraph("<b>#</b>",               ST["body"]),
            Paragraph("<b>Recommended Action</b>", ST["body"]),
            Paragraph("<b>Priority</b>",         ST["body"]),
            Paragraph("<b>Category</b>",         ST["body"]),
            Paragraph("<b>Expected Impact</b>",  ST["body"]),
        ]
        s_data = [s_header]
        for i, s in enumerate(suggestions, 1):
            pri = s.get("priority", "Medium")
            pri_style = ST.get(f"pri_{pri[0].lower()}", ST["body"])
            s_data.append([
                Paragraph(str(i),                          ST["body"]),
                Paragraph(_clean(s.get("action", "")),      ST["body"]),
                Paragraph(pri,                             pri_style),
                Paragraph(_clean(s.get("category", "")),    ST["body"]),
                Paragraph(_clean(s.get("impact", "")),      ST["small"]),
            ])
        # Wider Category column (2.5cm) so "Engagement" never wraps oddly
        st_tbl = Table(s_data, colWidths=[
                       0.5*cm, 5.1*cm, 2.0*cm, 2.4*cm, 4.6*cm])
        st_tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0),  INDIGO),
            ("TEXTCOLOR",     (0, 0), (-1, 0),  WHITE),
            ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1),
             [BG_CARD, colors.HexColor("#f1f5f9")]),
            ("GRID",          (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
            ("FONTSIZE",      (0, 0), (-1, -1), 9),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(st_tbl)

    # ── FOOTER ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.8*cm))
    story.append(HRFlowable(width="100%", thickness=1, color=INDIGO))
    story.append(Spacer(1, 0.2*cm))
    story.append(Paragraph(
        "Generated by <b>ChurnIQ — Customer Churn Prediction &amp; Retention Intelligence Platform</b>  |  Confidential",
        ST["footer"]
    ))

    doc.build(story)
    return buf.getvalue()
