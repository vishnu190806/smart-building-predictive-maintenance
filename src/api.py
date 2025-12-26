from typing import Any, Literal

import os
import numpy as np
import joblib
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict

from .model_service import load_model, predict_single


app = FastAPI(
    title="Smart Building Predictive Maintenance API",
    description="IsolationForest anomaly detection + RandomForest failure classification on AI4I data.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Unsupervised model (IsolationForest) + scaler
MODEL, SCALER = load_model()

# Supervised model (RandomForest) trained in supervised_train.py
SUP_MODEL_PATH = os.path.join("models", "rf_supervised.pkl")
RF_MODEL = joblib.load(SUP_MODEL_PATH)


class SensorReading(BaseModel):
    rotational_speed_rpm: float = Field(alias="Rotational speed [rpm]")
    process_temperature_k: float = Field(alias="Process temperature [K]")
    torque_nm: float = Field(alias="Torque [Nm]")
    tool_wear_min: float = Field(alias="Tool wear [min]")

    model_config = ConfigDict(
        validate_by_name=True,
        populate_by_name=True,
    )


class PredictionResponse(BaseModel):
    is_anomaly: Literal[0, 1]
    anomaly_score: float  # anomaly score OR failure probability, depending on mode


@app.get("/health")
def health_check() -> dict[str, Any]:
    return {
        "status": "ok",
        "unsupervised_model_loaded": MODEL is not None,
        "supervised_model_loaded": RF_MODEL is not None,
    }


@app.options("/predict")
def options_predict() -> dict[str, Any]:
    return {}


@app.get("/predict")
def get_predict_info() -> dict[str, str]:
    return {
        "detail": (
            "Use POST /predict?mode=unsupervised|supervised with JSON body "
            "{'Rotational speed [rpm]', 'Process temperature [K]', "
            "'Torque [Nm]', 'Tool wear [min]'}."
        )
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(
    reading: SensorReading,
    mode: Literal["unsupervised", "supervised"] = Query("unsupervised"),
) -> PredictionResponse:
    reading_dict = {
        "Rotational speed [rpm]": reading.rotational_speed_rpm,
        "Process temperature [K]": reading.process_temperature_k,
        "Torque [Nm]": reading.torque_nm,
        "Tool wear [min]": reading.tool_wear_min,
    }

    if mode == "unsupervised":
        # IsolationForest path
        result = predict_single(reading_dict, model=MODEL, scaler=SCALER)
        return PredictionResponse(
            is_anomaly=result["is_anomaly"],
            anomaly_score=result["anomaly_score"],
        )

    # supervised mode (RandomForest classifier)
    features = [
        reading_dict["Rotational speed [rpm]"],
        reading_dict["Process temperature [K]"],
        reading_dict["Torque [Nm]"],
        reading_dict["Tool wear [min]"],
    ]
    X = np.array(features, dtype=float).reshape(1, -1)

    pred_label = int(RF_MODEL.predict(X)[0])              # 0 normal, 1 failure
    prob_failure = float(RF_MODEL.predict_proba(X)[0][1])  # P(y=1)

    # Map to same response fields so frontend code stays simple:
    # is_anomaly = 1 means predicted failure, anomaly_score = failure probability.
    return PredictionResponse(
        is_anomaly=pred_label,
        anomaly_score=prob_failure,
    )