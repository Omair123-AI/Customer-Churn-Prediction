"""
evaluate_model.py
-----------------
Loads the trained model and evaluates it on test data.
Generates performance metrics, confusion matrix, ROC curve data,
and feature importance rankings.
"""

import pandas as pd
import numpy as np
import json
import os
import joblib

from sklearn.metrics import (
    classification_report, roc_auc_score, roc_curve,
    confusion_matrix, accuracy_score, precision_score,
    recall_score, f1_score
)
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, LabelEncoder

BASE_DIR     = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "customer_churn.csv")
MODELS_DIR   = os.path.join(BASE_DIR, "backend", "models")


def load_test_data():
    """Rebuild test split identical to training (same random_state)."""
    df = pd.read_csv(DATASET_PATH)
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    df["TotalCharges"] = df["TotalCharges"].fillna(df["TotalCharges"].median())
    df.drop(columns=["customerID"], inplace=True)

    le = LabelEncoder()
    for col in ["gender","Partner","Dependents","PhoneService","PaperlessBilling","Churn"]:
        df[col] = le.fit_transform(df[col])

    multi_cats = ["MultipleLines","InternetService","OnlineSecurity","OnlineBackup",
                  "DeviceProtection","TechSupport","StreamingTV","StreamingMovies",
                  "Contract","PaymentMethod"]
    df = pd.get_dummies(df, columns=multi_cats, drop_first=True)
    df["charges_per_month"]   = df["TotalCharges"] / (df["tenure"] + 1)
    df["is_new_customer"]     = (df["tenure"] <= 3).astype(int)
    df["is_long_tenure"]      = (df["tenure"] >= 36).astype(int)
    df["high_monthly_charge"] = (df["MonthlyCharges"] > df["MonthlyCharges"].quantile(0.75)).astype(int)

    X = df.drop(columns=["Churn"])
    y = df["Churn"]
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    return X_test, y_test


def evaluate() -> dict:
    """Run full evaluation and return metrics dict."""
    model    = joblib.load(os.path.join(MODELS_DIR, "churn_model.pkl"))
    scaler   = joblib.load(os.path.join(MODELS_DIR, "scaler.pkl"))
    imputer  = joblib.load(os.path.join(MODELS_DIR, "imputer.pkl"))

    X_test, y_test = load_test_data()
    X_imp  = imputer.transform(X_test)
    X_s    = scaler.transform(X_imp)

    y_pred  = model.predict(X_s)
    y_proba = model.predict_proba(X_s)[:, 1]

    # ROC curve data (sampled for JSON size)
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    step = max(1, len(fpr) // 50)
    roc_data = [{"fpr": round(float(f),4), "tpr": round(float(t),4)}
                for f, t in zip(fpr[::step], tpr[::step])]

    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, output_dict=True)

    return {
        "accuracy":   round(accuracy_score(y_test, y_pred), 4),
        "roc_auc":    round(roc_auc_score(y_test, y_proba), 4),
        "precision":  round(precision_score(y_test, y_pred), 4),
        "recall":     round(recall_score(y_test, y_pred), 4),
        "f1_score":   round(f1_score(y_test, y_pred), 4),
        "confusion_matrix": cm,
        "roc_curve":  roc_data,
        "report":     report,
    }


if __name__ == "__main__":
    metrics = evaluate()
    print(json.dumps({k: v for k, v in metrics.items() if k != "roc_curve"}, indent=2))
