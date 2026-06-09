"""
train_model.py
--------------
Trains an ensemble churn prediction model on the Telco dataset.
Saves: churn_model.pkl, scaler.pkl, imputer.pkl, feature_names.pkl, model_meta.json
"""

import pandas as pd
import numpy as np
import joblib
import os
import json

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import (
    classification_report, roc_auc_score,
    confusion_matrix, accuracy_score, precision_recall_curve
)

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "customer_churn.csv")
MODELS_DIR   = os.path.join(BASE_DIR, "backend", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

print(f"Loading dataset from: {DATASET_PATH}")

# ── 1. Load & clean ───────────────────────────────────────────────────────────
df = pd.read_csv(DATASET_PATH)
print(f"Dataset shape: {df.shape}  |  Churn rate: {(df['Churn']=='Yes').mean()*100:.1f}%")

df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
df["TotalCharges"] = df["TotalCharges"].fillna(df["TotalCharges"].median())
df.drop(columns=["customerID"], inplace=True)

# ── 2. Encode ─────────────────────────────────────────────────────────────────
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
for col in ["gender", "Partner", "Dependents", "PhoneService", "PaperlessBilling", "Churn"]:
    df[col] = le.fit_transform(df[col])

multi_cats = [
    "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup",
    "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
    "Contract", "PaymentMethod",
]
df = pd.get_dummies(df, columns=multi_cats, drop_first=True)

# ── 3. Feature engineering ────────────────────────────────────────────────────
df["charges_per_month"]   = df["TotalCharges"] / (df["tenure"] + 1)
df["is_new_customer"]     = (df["tenure"] <= 3).astype(int)
df["is_long_tenure"]      = (df["tenure"] >= 36).astype(int)
df["high_monthly_charge"] = (df["MonthlyCharges"] > df["MonthlyCharges"].quantile(0.75)).astype(int)

# ── 4. Split ──────────────────────────────────────────────────────────────────
X = df.drop(columns=["Churn"])
y = df["Churn"]
feature_names = list(X.columns)
print(f"Features: {len(feature_names)}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
print(f"Train: {len(X_train)}  |  Test: {len(X_test)}")

# ── 5. Impute + Scale ─────────────────────────────────────────────────────────
imputer   = SimpleImputer(strategy="median")
X_train_i = imputer.fit_transform(X_train)
X_test_i  = imputer.transform(X_test)

scaler    = StandardScaler()
X_train_s = scaler.fit_transform(X_train_i)
X_test_s  = scaler.transform(X_test_i)

# ── 6. Build ensemble ─────────────────────────────────────────────────────────
rf = RandomForestClassifier(
    n_estimators=200, max_depth=10, min_samples_split=5,
    min_samples_leaf=2, random_state=42, n_jobs=-1, class_weight="balanced"
)
gb = GradientBoostingClassifier(
    n_estimators=150, learning_rate=0.08, max_depth=5,
    subsample=0.8, random_state=42
)
lr = LogisticRegression(C=1.0, max_iter=500, random_state=42, class_weight="balanced")

ensemble = VotingClassifier(
    estimators=[("rf", rf), ("gb", gb), ("lr", lr)],
    voting="soft",
    weights=[2, 2, 1],
)
print("\nTraining ensemble model...")
ensemble.fit(X_train_s, y_train)
print("Training complete.")

# ── 7. Evaluate ───────────────────────────────────────────────────────────────
y_pred  = ensemble.predict(X_test_s)
y_proba = ensemble.predict_proba(X_test_s)[:, 1]

acc  = accuracy_score(y_test, y_pred)
auc  = roc_auc_score(y_test, y_proba)
cm   = confusion_matrix(y_test, y_pred).tolist()
report = classification_report(y_test, y_pred, output_dict=True)

# Cross-validation
X_all_s   = scaler.transform(imputer.transform(X))
cv         = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores  = cross_val_score(ensemble, X_all_s, y, cv=cv, scoring="roc_auc")

print(f"\n{'='*45}")
print(f"  Accuracy  : {acc:.4f}")
print(f"  ROC-AUC   : {auc:.4f}")
print(f"  CV AUC    : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
print(f"{'='*45}")
print(classification_report(y_test, y_pred))

# ── 8. Feature importances ────────────────────────────────────────────────────
rf_fitted   = ensemble.named_estimators_["rf"]
importances = rf_fitted.feature_importances_
feat_imp    = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)

print("Top 10 features:")
for fn, fi in feat_imp[:10]:
    print(f"  {fn:<40} {fi:.4f}")

# ── 9. Save artefacts ─────────────────────────────────────────────────────────
joblib.dump(ensemble,      os.path.join(MODELS_DIR, "churn_model.pkl"))
joblib.dump(scaler,        os.path.join(MODELS_DIR, "scaler.pkl"))
joblib.dump(imputer,       os.path.join(MODELS_DIR, "imputer.pkl"))
joblib.dump(feature_names, os.path.join(MODELS_DIR, "feature_names.pkl"))

# Optimal threshold (maximize F1 for churn class)
precision, recall, thresholds = precision_recall_curve(y_test, y_proba)
f1_scores      = 2 * precision * recall / (precision + recall + 1e-10)
optimal_idx    = np.argmax(f1_scores)
optimal_thresh = float(thresholds[optimal_idx]) if optimal_idx < len(thresholds) else 0.5

meta = {
    "accuracy":              round(acc, 4),
    "roc_auc":               round(auc, 4),
    "cv_auc_mean":           round(float(cv_scores.mean()), 4),
    "cv_auc_std":            round(float(cv_scores.std()), 4),
    "optimal_threshold":     round(optimal_thresh, 4),
    "confusion_matrix":      cm,
    "classification_report": report,
    "top_features":          [[f, round(float(i), 5)] for f, i in feat_imp[:15]],
    "feature_names":         feature_names,
    "n_features":            len(feature_names),
    "n_train":               int(len(X_train)),
    "n_test":                int(len(X_test)),
    "model_type":            "VotingClassifier(RF+GB+LR, soft, weights=[2,2,1])",
    "churn_rate":            round(float(y.mean()), 4),
}
with open(os.path.join(MODELS_DIR, "model_meta.json"), "w") as f:
    json.dump(meta, f, indent=2)

print(f"\n✅ All artefacts saved to: {MODELS_DIR}")
print(f"   Optimal threshold: {optimal_thresh:.4f}")
