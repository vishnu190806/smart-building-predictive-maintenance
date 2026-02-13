import requests
import sys

API_URL = "http://127.0.0.1:8000"

def test_connection():
    try:
        print(f"Testing connection to {API_URL}...")
        response = requests.get(f"{API_URL}/")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend Connection Successful!")
            print(f"   Status: {data.get('status')}")
            print(f"   System: {data.get('system')}")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Backend. Is Uvicorn running?")
        print("   Run: uvicorn src.main:app --reload")
        return False

if __name__ == "__main__":
    success = test_connection()
    if not success:
        sys.exit(1)
