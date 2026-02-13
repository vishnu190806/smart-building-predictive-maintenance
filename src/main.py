import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sys
import os
import sqlite3
import random
from datetime import datetime
from typing import List, Optional

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model_service import load_model, predict_single, predict_supervised_single, load_supervised_model

app = FastAPI(title="Aurora Smart Building API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Connection ---
DB_PATH = 'access_control.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# --- ML Model ---
model = None
scaler = None
rf_model = None

# --- Pydantic Models for Access Control ---
class AccessLog(BaseModel):
    Log_ID: int
    User_Name: str
    Role: str
    Door_Location: str
    Access_Time: str
    Access_Status: str
    Door_Zone: str

class AccessStat(BaseModel):
    total_entries: int
    security_alerts: int
    active_doors: int

# --- ML Input Model ---
class MachineReading(BaseModel):
    rotational_speed: float = Field(..., alias="Rotational speed [rpm]")
    temperature: float = Field(..., alias="Process temperature [K]")
    torque: float = Field(..., alias="Torque [Nm]")
    tool_wear: float = Field(..., alias="Tool wear [min]")
    model_type: str = "isolation_forest" # "isolation_forest" or "random_forest"

    class Config:
        populate_by_name = True

@app.on_event("startup")
async def startup_event():
    global model, scaler, rf_model
    try:
        model, scaler = load_model()
        print("Anomaly Model loaded.")
        rf_model = load_supervised_model()
        if rf_model:
            print("Supervised Model loaded.")
    except Exception as e:
        print(f"Warning: ML Model failed to load: {e}")
    
    if not os.path.exists(DB_PATH):
        print("Initializing Database...")
        try:
            from init_db import init_db
            init_db()
        except ImportError:
            print("Could not import init_db script.")

@app.get("/")
def read_root():
    return {"status": "online", "system": "Aurora Building Health API"}

# --- Access Control Endpoints ---

@app.get("/api/access/logs", response_model=List[AccessLog])
def get_access_logs(limit: int = 50):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    query = """
        SELECT 
            AL.Log_ID, 
            U.User_Name, 
            U.Access_Level as Role, 
            D.Door_Location, 
            AL.Access_Time, 
            AL.Access_Status,
            D.Zone as Door_Zone
        FROM Access_Logs AL
        JOIN Users U ON AL.User_ID = U.User_ID
        JOIN Doors D ON AL.Door_ID = D.Door_ID
        ORDER BY AL.Access_Time DESC
        LIMIT ?
    """
    cursor.execute(query, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/access/stats", response_model=AccessStat)
def get_access_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM Access_Logs")
    total_entries = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM Access_Logs WHERE Access_Status = 'Denied'")
    security_alerts = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM Doors")
    active_doors = cursor.fetchone()[0]
    
    conn.close()
    return {
        "total_entries": total_entries,
        "security_alerts": security_alerts,
        "active_doors": active_doors
    }

# --- Simulation Service Integration ---
from simulation_service import simulation

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    return simulation.get_dashboard_stats()

@app.get("/api/dashboard/chart")
def get_dashboard_chart():
    return simulation.get_dashboard_chart()

@app.get("/api/energy/chart")
def get_energy_chart():
    return simulation.get_energy_chart()

@app.get("/api/reports")
def get_reports():
    return simulation.get_reports()

@app.post("/api/reports/generate")
def generate_report():
    # Simulate report generation
    import time
    time.sleep(1) # Fake processing delay
    return {
        "id": f"REP-2024-{random.randint(100,999)}",
        "name": "On-Demand System Audit",
        "date": datetime.now().strftime("%b %d, %Y"),
        "type": "PDF",
        "status": "Ready"
    }

# --- Prediction Endpoint ---

@app.post("/predict")
def predict_anomaly(reading: MachineReading):
    global model, scaler, rf_model
    
    if reading.model_type == "random_forest":
        if rf_model is None:
            # Try lazy load
            rf_model = load_supervised_model()
            if rf_model is None:
                raise HTTPException(status_code=503, detail="Random Forest model unavailable")
        
        data = reading.dict(by_alias=True)
        return predict_supervised_single(data, rf_model)
        
    else:
        # Default to Isolation Forest
        if model is None:
            raise HTTPException(status_code=503, detail="Isolation Forest model unavailable")
        
        data = reading.dict(by_alias=True)
        return predict_single(data, model, scaler)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
