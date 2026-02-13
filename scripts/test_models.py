import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_prediction(model_type, name):
    print(f"\n--- Testing {name} ({model_type}) ---")
    payload = {
        "Rotational speed [rpm]": 1500,
        "Process temperature [K]": 310,
        "Torque [Nm]": 40,
        "Tool wear [min]": 50,
        "model_type": model_type
    }
    
    try:
        response = requests.post(f"{BASE_URL}/predict", json=payload)
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"   Model Used: {result.get('model')}")
            print(f"   Anomaly/Failure: {result.get('is_anomaly')}")
            print(f"   Score: {result.get('anomaly_score'):.4f}")
        else:
            print(f"❌ Failed (Status {response.status_code})")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_prediction("isolation_forest", "Anomaly Detection")
    test_prediction("random_forest", "Failure Classification")
