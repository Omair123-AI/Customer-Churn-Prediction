"""
preprocess.py
-------------
Handles all feature engineering and transformation for the churn model.
Converts raw customer dict/DataFrame into model-ready feature matrix.
"""

import pandas as pd
import numpy as np
import joblib
import os

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def get_artifacts():
    """Load all saved model artifacts from disk."""
    model         = joblib.load(os.path.join(MODELS_DIR, "churn_model.pkl"))
    scaler        = joblib.load(os.path.join(MODELS_DIR, "scaler.pkl"))
    imputer       = joblib.load(os.path.join(MODELS_DIR, "imputer.pkl"))
    feature_names = joblib.load(os.path.join(MODELS_DIR, "feature_names.pkl"))
    return model, scaler, imputer, feature_names


def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Full preprocessing pipeline for a raw DataFrame (used in training).
    Encodes, engineers features, and returns clean DataFrame.
    """
    df = df.copy()

    # Clean TotalCharges
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    df["TotalCharges"] = df["TotalCharges"].fillna(df["TotalCharges"].median())

    # Drop customerID if present
    if "customerID" in df.columns:
        df.drop(columns=["customerID"], inplace=True)

    # Binary encode
    binary_map = {"Yes": 1, "No": 0, "Male": 1, "Female": 0}
    binary_cols = ["gender", "Partner", "Dependents", "PhoneService", "PaperlessBilling"]
    if "Churn" in df.columns:
        binary_cols.append("Churn")
    for col in binary_cols:
        if col in df.columns:
            df[col] = df[col].map(binary_map).fillna(0).astype(int)

    # One-hot encode multi-class categoricals
    multi_cats = [
        "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup",
        "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
        "Contract", "PaymentMethod",
    ]
    existing = [c for c in multi_cats if c in df.columns]
    df = pd.get_dummies(df, columns=existing, drop_first=True)

    # Feature engineering
    df["charges_per_month"]   = df["TotalCharges"] / (df["tenure"] + 1)
    df["is_new_customer"]     = (df["tenure"] <= 3).astype(int)
    df["is_long_tenure"]      = (df["tenure"] >= 36).astype(int)
    df["high_monthly_charge"] = (df["MonthlyCharges"] > df["MonthlyCharges"].quantile(0.75)).astype(int)

    return df


# Categorical dummy column mapping (mirrors training one-hot encoding)
DUMMY_MAP = {
    "MultipleLines": {
        "No phone service": "MultipleLines_No phone service",
        "Yes":              "MultipleLines_Yes",
    },
    "InternetService": {
        "Fiber optic": "InternetService_Fiber optic",
        "No":          "InternetService_No",
    },
    "OnlineSecurity": {
        "No internet service": "OnlineSecurity_No internet service",
        "Yes":                 "OnlineSecurity_Yes",
    },
    "OnlineBackup": {
        "No internet service": "OnlineBackup_No internet service",
        "Yes":                 "OnlineBackup_Yes",
    },
    "DeviceProtection": {
        "No internet service": "DeviceProtection_No internet service",
        "Yes":                 "DeviceProtection_Yes",
    },
    "TechSupport": {
        "No internet service": "TechSupport_No internet service",
        "Yes":                 "TechSupport_Yes",
    },
    "StreamingTV": {
        "No internet service": "StreamingTV_No internet service",
        "Yes":                 "StreamingTV_Yes",
    },
    "StreamingMovies": {
        "No internet service": "StreamingMovies_No internet service",
        "Yes":                 "StreamingMovies_Yes",
    },
    "Contract": {
        "One year":  "Contract_One year",
        "Two year":  "Contract_Two year",
    },
    "PaymentMethod": {
        "Credit card (automatic)": "PaymentMethod_Credit card (automatic)",
        "Electronic check":        "PaymentMethod_Electronic check",
        "Mailed check":            "PaymentMethod_Mailed check",
    },
}

BINARY_MAP = {"Yes": 1, "No": 0, "Male": 1, "Female": 0, "yes": 1, "no": 0, "1": 1, "0": 0}


def preprocess_input(data: dict, feature_names: list) -> pd.DataFrame:
    """
    Transform a single raw customer dict into a model-ready DataFrame row.
    Aligns all columns to the training feature set.
    """
    row = {fn: 0 for fn in feature_names}  # start all zeros

    # Scalar features
    row["gender"]           = BINARY_MAP.get(str(data.get("gender", "Male")), 1)
    row["SeniorCitizen"]    = int(data.get("SeniorCitizen", 0))
    row["Partner"]          = BINARY_MAP.get(str(data.get("Partner", "No")), 0)
    row["Dependents"]       = BINARY_MAP.get(str(data.get("Dependents", "No")), 0)
    row["tenure"]           = float(data.get("tenure", 12))
    row["PhoneService"]     = BINARY_MAP.get(str(data.get("PhoneService", "Yes")), 1)
    row["PaperlessBilling"] = BINARY_MAP.get(str(data.get("PaperlessBilling", "Yes")), 1)
    row["MonthlyCharges"]   = float(data.get("MonthlyCharges", 50))
    row["TotalCharges"]     = float(data.get("TotalCharges", row["MonthlyCharges"] * row["tenure"]))

    # Derived features
    row["charges_per_month"]   = row["TotalCharges"] / (row["tenure"] + 1)
    row["is_new_customer"]     = int(row["tenure"] <= 3)
    row["is_long_tenure"]      = int(row["tenure"] >= 36)
    row["high_monthly_charge"] = int(row["MonthlyCharges"] > 65)

    # One-hot categoricals
    cat_fields = {
        "MultipleLines":    data.get("MultipleLines", "No"),
        "InternetService":  data.get("InternetService", "DSL"),
        "OnlineSecurity":   data.get("OnlineSecurity", "No"),
        "OnlineBackup":     data.get("OnlineBackup", "No"),
        "DeviceProtection": data.get("DeviceProtection", "No"),
        "TechSupport":      data.get("TechSupport", "No"),
        "StreamingTV":      data.get("StreamingTV", "No"),
        "StreamingMovies":  data.get("StreamingMovies", "No"),
        "Contract":         data.get("Contract", "Month-to-month"),
        "PaymentMethod":    data.get("PaymentMethod", "Electronic check"),
    }
    for field, value in cat_fields.items():
        if field in DUMMY_MAP and value in DUMMY_MAP[field]:
            col = DUMMY_MAP[field][value]
            if col in row:
                row[col] = 1

    df = pd.DataFrame([row])[feature_names]
    return df
