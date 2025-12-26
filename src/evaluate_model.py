import os
import pandas as pd
from sklearn.metrics import classification_report
from .model_service import FEATURE_COLUMNS, load_model, predict_batch

DATA_PATH = os.path.join("data", "ai4i2020.csv")  # <‑ your filename

def main() -> None:
    df = pd.read_csv(DATA_PATH)
    y_true = df["Machine failure"].values
    model, scaler = load_model()
    df_pred = predict_batch(df, model, scaler)
    y_pred = df_pred["is_anomaly"].values
    print(classification_report(y_true, y_pred))

if __name__ == "__main__":
    main()
