import os
import pandas as pd
from sklearn.metrics import classification_report
import joblib
from .model_service import FEATURE_COLUMNS, load_model, predict_batch

DATA_PATH = os.path.join("data", "ai4i2020.csv")
SUP_MODEL_PATH = os.path.join("models", "rf_supervised.pkl")

df = pd.read_csv(DATA_PATH)
X = df[FEATURE_COLUMNS].values
y = df["Machine failure"].values

# Unsupervised
model, scaler = load_model()
df_unsup = predict_batch(df, model, scaler)
y_pred_unsup = df_unsup["is_anomaly"].values
print("IsolationForest (unsupervised)")
print(classification_report(y, y_pred_unsup))

# Supervised
rf = joblib.load(SUP_MODEL_PATH)
y_pred_sup = rf.predict(X)
print("RandomForest (supervised)")
print(classification_report(y, y_pred_sup))
