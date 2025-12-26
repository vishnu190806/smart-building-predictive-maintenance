import os
from typing import Any
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
FEATURE_COLUMNS = [
    "Rotational speed [rpm]",
    "Process temperature [K]",
    "Torque [Nm]",
    "Tool wear [min]",
]

MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")


def train_and_save_model(
    csv_path: str = os.path.join("data", "ai4i_training_phys.csv"),
    contamination: float = 0.07,
    random_state: int = 42,
) -> tuple[IsolationForest, StandardScaler]:
    df = pd.read_csv(csv_path)
    missing = [c for c in FEATURE_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")
    X = df[FEATURE_COLUMNS].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        random_state=random_state,
        n_jobs=-1,
    )
    model.fit(X_scaled)
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    return model, scaler


def load_model() -> tuple[IsolationForest, StandardScaler]:
    model: IsolationForest = joblib.load(MODEL_PATH)
    scaler: StandardScaler = joblib.load(SCALER_PATH)
    return model, scaler


def _validate_and_prepare_features(reading: dict[str, Any]) -> np.ndarray:
    for col in FEATURE_COLUMNS:
        if col not in reading:
            raise ValueError(f"Missing feature '{col}' in input")
    values = [float(reading[col]) for col in FEATURE_COLUMNS]
    return np.array(values, dtype=float).reshape(1, -1)


def predict_single(
    reading: dict[str, Any],
    model: IsolationForest | None = None,
    scaler: StandardScaler | None = None,
) -> dict[str, Any]:
    if model is None or scaler is None:
        model, scaler = load_model()
    X = _validate_and_prepare_features(reading)
    X_scaled = scaler.transform(X)
    score = model.decision_function(X_scaled)[0]
    pred = model.predict(X_scaled)[0]
    return {"is_anomaly": int(pred == -1), "anomaly_score": float(score)}


def predict_batch(
    df: pd.DataFrame,
    model: IsolationForest | None = None,
    scaler: StandardScaler | None = None,
) -> pd.DataFrame:
    if model is None or scaler is None:
        model, scaler = load_model()
    missing = [c for c in FEATURE_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"DataFrame is missing required columns: {missing}")
    X = df[FEATURE_COLUMNS].values
    X_scaled = scaler.transform(X)
    scores = model.decision_function(X_scaled)
    preds = model.predict(X_scaled)
    out = df.copy()
    out["anomaly_score"] = scores
    out["is_anomaly"] = (preds == -1).astype(int)
    return out


if __name__ == "__main__":
    default_csv = os.path.join("data", "ai4i_training_phys.csv")
    model, scaler = train_and_save_model(default_csv)
    sample_normal = {
        "Rotational speed [rpm]": 1500.0,
        "Process temperature [K]": 310.0,
        "Torque [Nm]": 40.0,
        "Tool wear [min]": 50.0,
    }
    print("Normal-like:", sample_normal)
    print("Prediction:", predict_single(sample_normal, model, scaler))
    sample_faulty = {
        "Rotational speed [rpm]": 3000.0,
        "Process temperature [K]": 340.0,
        "Torque [Nm]": 80.0,
        "Tool wear [min]": 250.0,
    }
    print("Faulty-like:", sample_faulty)
    print("Prediction:", predict_single(sample_faulty, model, scaler))