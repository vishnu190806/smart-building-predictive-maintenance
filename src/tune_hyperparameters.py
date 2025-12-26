import os
import pandas as pd
import numpy as np
from sklearn.metrics import f1_score, precision_score, recall_score
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

FEATURE_COLUMNS = [
    "Rotational speed [rpm]",
    "Process temperature [K]",
    "Torque [Nm]",
    "Tool wear [min]",
]

train_path = os.path.join("data", "ai4i_training_phys.csv")
eval_path = os.path.join("data", "ai4i2020.csv")

df_train = pd.read_csv(train_path)
df_eval = pd.read_csv(eval_path)

X_train = df_train[FEATURE_COLUMNS].values
X_eval = df_eval[FEATURE_COLUMNS].values
y_eval = df_eval["Machine failure"].values

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_eval_scaled = scaler.transform(X_eval)

contaminations = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08]
n_est = [200, 300, 400, 500]

results = []

for cont in contaminations:
    for nest in n_est:
        model = IsolationForest(
            n_estimators=nest,
            contamination=cont,
            random_state=42,
            n_jobs=-1,
        )
        model.fit(X_train_scaled)

        preds = model.predict(X_eval_scaled)
        y_pred = (preds == -1).astype(int)

        f1 = f1_score(y_eval, y_pred, zero_division=0)
        precision = precision_score(y_eval, y_pred, zero_division=0)
        recall = recall_score(y_eval, y_pred, zero_division=0)

        results.append({
            "contamination": cont,
            "n_estimators": nest,
            "f1": f1,
            "precision": precision,
            "recall": recall,
        })

results_df = pd.DataFrame(results)
results_df = results_df.sort_values("f1", ascending=False)

print(results_df.to_string())
print("\nBest settings (by F1-score):")
best = results_df.iloc[0]
print(f"contamination={best['contamination']}, n_estimators={best['n_estimators']}")
print(f"F1={best['f1']:.4f}, Precision={best['precision']:.4f}, Recall={best['recall']:.4f}")