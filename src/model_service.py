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
SUPERVISED_MODEL_PATH = os.path.join(MODEL_DIR, "rf_supervised.pkl")


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
    try:
        model: IsolationForest = joblib.load(MODEL_PATH)
        scaler: StandardScaler = joblib.load(SCALER_PATH)
        return model, scaler
    except FileNotFoundError:
        print("Model files not found. Training new model...")
        return train_and_save_model()

def load_supervised_model() -> Any:
    try:
        return joblib.load(SUPERVISED_MODEL_PATH)
    except FileNotFoundError:
        print("Supervised model not found.")
        return None

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
    print(f"DEBUG: Input={reading}")
    print(f"DEBUG: Scaled={X_scaled}")
    print(f"DEBUG: Score={score}, Pred={pred}")
    return {"is_anomaly": int(pred == -1), "anomaly_score": float(score), "model": "Isolation Forest"}

def predict_supervised_single(
    reading: dict[str, Any],
    model: Any | None = None,
) -> dict[str, Any]:
    if model is None:
        model = load_supervised_model()
        if model is None:
             return {"error": "Supervised model not available"}
    
    X = _validate_and_prepare_features(reading)
    # RF model was trained on raw features in supervised_train.py
    pred = model.predict(X)[0]
    probs = model.predict_proba(X)[0] 
    
    # Class 1 is failure, Class 0 is normal
    failure_prob = probs[1] if len(probs) > 1 else 0.0
    
    return {
        "is_anomaly": int(pred), # 1 per original training means failure
        "anomaly_score": float(failure_prob),
        "model": "Random Forest"
    }


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
    rf_model = load_supervised_model()

    sample_normal = {
        "Rotational speed [rpm]": 1500.0,
        "Process temperature [K]": 310.0,
        "Torque [Nm]": 40.0,
        "Tool wear [min]": 50.0,
    }
    print("Normal-like:", sample_normal)
    print("IF Prediction:", predict_single(sample_normal, model, scaler))
    if rf_model:
        print("RF Prediction:", predict_supervised_single(sample_normal, rf_model))

    sample_faulty = {
        "Rotational speed [rpm]": 3000.0,
        "Process temperature [K]": 340.0,
        "Torque [Nm]": 80.0,
        "Tool wear [min]": 250.0,
    }
    print("Faulty-like:", sample_faulty)
    print("IF Prediction:", predict_single(sample_faulty, model, scaler))
    if rf_model:
        print("RF Prediction:", predict_supervised_single(sample_faulty, rf_model))
