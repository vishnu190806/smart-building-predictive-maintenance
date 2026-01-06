from typing import Any, Literal
import os
import numpy as np
import joblib
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict

from .model_service import load_model, predict_single

app = FastAPI(
    title="Smart Building Predictive Maintenance API",
    description="IsolationForest + RandomForest + K-Means clustering on AI4I data.",
    version="2.0.0",  # updated version
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

# ---------- EXISTING MODELS ----------
MODEL, SCALER = load_model()  # IsolationForest + scaler
SUP_MODEL_PATH = os.path.join("models", "rf_supervised.pkl")
RF_MODEL = joblib.load(SUP_MODEL_PATH)  # RandomForest

# ---------- NEW K-MEANS MODELS ----------
KMEANS_MODEL = joblib.load("models/kmeans_clustering.pkl")
KMEANS_SCALER = joblib.load("models/scaler_kmeans.pkl")

# Cluster info
CLUSTER_NAMES = {
    0: "Low-load operation",
    1: "Normal operation", 
    2: "High-load operation",
    3: "Extreme/stressed operation",
}
CLUSTER_RECS = {
    0: ["Less frequent checks", "Economical HVAC setting"],
    1: ["Standard monitoring", "Log KPIs"],
    2: ["Increase monitoring", "Plan maintenance soon"],
    3: ["Avoid max load", "Schedule maintenance ASAP"],
}

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
    anomaly_score: float
    # NEW FIELDS
    operating_mode_cluster: int
    cluster_name: str
    cluster_confidence: float
    cluster_recommendations: list[str]

@app.get("/health")
def health_check() -> dict[str, Any]:
    return {
        "status": "ok",
        "unsupervised_model_loaded": MODEL is not None,
        "supervised_model_loaded": RF_MODEL is not None,
        "kmeans_model_loaded": True,
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
            "'Torque [Nm]', 'Tool wear [min]'}. "
            "Returns failure risk + operating mode cluster."
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

    # ---------- COMMON FEATURES ----------
    features = np.array([[
        reading.rotational_speed_rpm,
        reading.process_temperature_k,
        reading.torque_nm,
        reading.tool_wear_min,
    ]])

    # ---------- FAILURE PREDICTION (existing logic) ----------
    if mode == "unsupervised":
        result = predict_single(reading_dict, model=MODEL, scaler=SCALER)
        is_anomaly = result["is_anomaly"]
        anomaly_score = result["anomaly_score"]
    else:  # supervised
        fail_scaled = SCALER.transform(features)  # reuse your scaler
        is_anomaly = int(RF_MODEL.predict(fail_scaled)[0])
        anomaly_score = float(RF_MODEL.predict_proba(fail_scaled)[0][1])

    # ---------- NEW: K-MEANS CLUSTERING (operating mode) ----------
    kmeans_scaled = KMEANS_SCALER.transform(features)
    cluster_id = int(KMEANS_MODEL.predict(kmeans_scaled)[0])
    
    # confidence based on distance to cluster center
    dists = np.linalg.norm(kmeans_scaled - KMEANS_MODEL.cluster_centers_, axis=1)
    confidence = float(1 / (1 + dists[cluster_id]))
    
    cluster_name = CLUSTER_NAMES.get(cluster_id, "Unknown")
    recommendations = CLUSTER_RECS.get(cluster_id, [])

    # ---------- RETURN ----------
    return PredictionResponse(
        is_anomaly=is_anomaly,
        anomaly_score=anomaly_score,
        operating_mode_cluster=cluster_id,
        cluster_name=cluster_name,
        cluster_confidence=confidence,
        cluster_recommendations=recommendations,
    )