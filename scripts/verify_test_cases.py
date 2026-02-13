import requests
import json
import pandas as pd

BASE_URL = "http://127.0.0.1:8000"

test_cases = [
    {"name": "1. Normal Operation", "data": {"Rotational speed [rpm]": 1500, "Process temperature [K]": 310, "Torque [Nm]": 40, "Tool wear [min]": 10}},
    {"name": "2. High Temp Alert", "data": {"Rotational speed [rpm]": 1500, "Process temperature [K]": 345, "Torque [Nm]": 40, "Tool wear [min]": 10}},
    {"name": "3. High Torque (Strain)", "data": {"Rotational speed [rpm]": 1500, "Process temperature [K]": 310, "Torque [Nm]": 90, "Tool wear [min]": 10}},
    {"name": "4. Worn Tool", "data": {"Rotational speed [rpm]": 1500, "Process temperature [K]": 310, "Torque [Nm]": 40, "Tool wear [min]": 230}},
    {"name": "5. Critical Failure", "data": {"Rotational speed [rpm]": 2900, "Process temperature [K]": 340, "Torque [Nm]": 80, "Tool wear [min]": 250}},
]

results = []

print(f"{'Test Case':<25} | {'Isolation Forest':<20} | {'Random Forest':<20}")
print("-" * 75)

for case in test_cases:
    # Test Isolation Forest
    payload_if = case["data"].copy()
    payload_if["model_type"] = "isolation_forest"
    try:
        resp_if = requests.post(f"{BASE_URL}/predict", json=payload_if).json()
        res_if = "Anomaly" if resp_if["is_anomaly"] else "Normal"
    except:
        res_if = "Error"

    # Test Random Forest
    payload_rf = case["data"].copy()
    payload_rf["model_type"] = "random_forest"
    try:
        resp_rf = requests.post(f"{BASE_URL}/predict", json=payload_rf).json()
        res_rf = "Failure" if resp_rf["is_anomaly"] else "Optimal"
    except:
        res_rf = "Error"
    
    print(f"{case['name']:<25} | {res_if:<20} | {res_rf:<20}")
