# 🌌 Aurora Building Health – Smart Building Predictive Maintenance

A full‑stack web app for monitoring building HVAC assets and predicting failures using real sensor‑like data.  
The project combines a ⚡ FastAPI backend with 🤖 scikit‑learn models and a cinematic 🎛️ React/Vite dashboard UI.

---

## ✨ Features

- 🧠 **Dual ML models**
  - 🌲 IsolationForest for unsupervised **anomaly detection** on AI4I process data.
  - 🌳 RandomForest classifier for supervised **failure prediction** (Machine failure 0/1).
- 🎚️ **Real‑time telemetry controls**
  - Sliders for rotational speed, process temperature, torque, and component wear.
  - Per‑asset sensor states for:
    - ❄️ HVAC Unit A
    - 💧 Chilled Water Pump
    - 🌀 Supply Fan Cluster
- 💊 **Health metrics & insights**
  - Health status (✅ Healthy / ⚠️ At risk).
  - Risk score (0–100%) derived from model outputs.
  - ⏱️ Last checked timestamp.
  - 🧩 “System insight” recommendation text that changes with risk level.
- 📈 **History visualization**
  - Per‑asset sparkline chart showing recent anomaly/failure scores.
  - 📊 **Live Dashboard Chart**: Real-time scrolling chart for building energy consumption.
- 🎨 **Enhanced UI/UX**
  - 🌗 **Light/Dark Mode**: Fully adaptive themes (Aurora Dark & Crisp Light) with glassmorphism.
  - 🔍 **Global Search**: "Quick Look" modal to find systems (e.g., "HVAC", "Pump") instantly.
  - 🔔 **Notifications**: Dropdown for recent building alerts and system updates.
  - ℹ️ **About Page**: Dedicated team section for **TEAM-A02**.
- 🔌 **Status feedback**
  - API health pill (🟢 CONNECTED / 🔴 DISCONNECTED).
  - Asset cards with 💤 NOT CHECKED / ✅ HEALTHY / ⚠️ ANOMALY states.

---

## 🛠 Tech Stack

- **Frontend**
  - ⚛️ React + TypeScript (Vite)
  - 🎨 Custom CSS (glassmorphism, gradients, responsive layout)
  - 📊 Recharts (for data visualization)
  - 🔦 Lucide React (for iconography)
- **Backend**
  - 🧩 FastAPI
  - 🤖 scikit‑learn (IsolationForest, RandomForestClassifier)
  - 📦 joblib, 🧮 pandas, numpy
- **Data**
  - 📊 AI4I 2020 predictive maintenance dataset variants for training
  - 📁 Custom physical subset `ai4i_training_phys.csv` for the unsupervised model

---

## 🗂 Project Structure

```bash
├─ data/
│ ├─ ai4i_training_phys.csv # unsupervised training data
│ └─ ai4i2020.csv # supervised training data
├─ models/
│ ├─ isolation_forest.pkl # trained IsolationForest
│ ├─ scaler.pkl # StandardScaler for features
│ └─ rf_supervised.pkl # trained RandomForest classifier
├─ src/
│ ├─ api.py # FastAPI app (health + /predict)
│ ├─ model_service.py # IsolationForest train/load/predict
│ ├─ supervised_train.py # trains RandomForest failure model
│ ├─ compare_models.py # offline comparison of both models
│ └─ evaluate_model.py # IsolationForest evaluation script
│ └─ simulation_service.py # Real-time data simulation
├─ frontend/src/
│ ├─ App.tsx # main React dashboard
│ ├─ pages/
│ │ ├─ Dashboard.tsx # Overview with charts and stats
│ │ ├─ About.tsx # Team A02 information page
│ │ └─ ...
│ ├─ components/
│ │ ├─ layout/
│ │ │ ├─ Header.tsx # Search, Theme Toggle, Notifications
│ │ │ └─ Sidebar.tsx # Navigation
│ │ └─ ui/
│ │   ├─ GlassCard.tsx # Reusable glass container
│ │   └─ StatMetric.tsx # Dashboard metric component
├─ constants.ts # API base URL & config
├─ styles/theme.css # CSS variables for Light/Dark modes
└─ ...
```

---

## 🧬 How It Works

### 🔍 Models

- **Unsupervised (Anomaly Mode)** 🟣

  - Trained on `ai4i_training_phys.csv` using four features:
    - Rotational speed [rpm]
    - Process temperature [K]
    - Torque [Nm]
    - Tool wear [min]
  - IsolationForest learns “normal” behavior and flags outliers as anomalies.
  - The `decision_function` score is mapped to a 0–100% risk score.

- **Supervised (Failure Mode)** 🟠
  - Trained on `ai4i2020.csv` with label `Machine failure` (0 normal, 1 failure).
  - RandomForestClassifier outputs:
    - Predicted label (failure / no failure).
    - Failure probability, also mapped to a 0–100% risk score.

Both modes are served through a single `/predict` endpoint, controlled by a `mode` query parameter.

---

## 🔌 API

Base URL (dev):

http://127.0.0.1:8000

### 🩺 Health check

GET /health

Response:

{
"status": "ok",
"unsupervised_model_loaded": true,
"supervised_model_loaded": true
}

### 🤖 Predict

POST /predict?mode=unsupervised|supervised  
Content-Type: application/json

Body:

{
"Rotational speed [rpm]": 1500,
"Process temperature [K]": 305,
"Torque [Nm]": 40,
"Tool wear [min]": 50
}

Response (both modes):

{
"is_anomaly": 0,
"anomaly_score": 0.123
}

- In Anomaly mode:
  - is_anomaly = 1 → outlier.
  - anomaly_score = IsolationForest decision_function (higher = more normal).
- In Failure mode:
  - is_anomaly = 1 → predicted failure.
  - anomaly_score = failure probability P(y=1).

---

## 🚀 Setup & Run

### 1️⃣ Install dependencies

Create and activate a virtual environment, then:

pip install -r requirements.txt # or install FastAPI, uvicorn, scikit-learn, pandas, numpy, joblib  
npm install

### 2️⃣ Train models (one‑time)

# Train IsolationForest + StandardScaler

python -m src.model_service

# Train RandomForest supervised failure model

python -m src.supervised_train

### 3️⃣ Start the backend

uvicorn src.api:app --reload

The API will run at http://127.0.0.1:8000.

### 4️⃣ Start the frontend

npm run dev

Open the Vite URL (usually http://localhost:5173) in your browser.

---

## 📘 Usage

1. Choose an asset (❄️ HVAC, 💧 Pump, 🌀 Fan).
2. Adjust the sliders for speed, temperature, torque, and wear.
3. Select Anomaly or Failure mode using the toggle.
4. Click ANALYZE <ASSET>:
   - The dashboard calls /predict with the current telemetry.
   - Health status, risk score, and system insight update.
   - The history chart plots the new score for that asset.
5. Try normal vs extreme values to see how the risk and recommendations respond.
6. **Use the Theme Toggle** (Sun/Moon) to switch between Light and Dark modes.
7. **Use Search** (Command/Ctrl + K or click) to find "HVAC" or "Pump".

---

## 🔮 Possible Extensions

- 🔐 Add authentication and user roles (operator vs engineer).
- 🗄️ Log predictions to a database for long‑term trends.
- 🌐 Deploy the API and frontend to the cloud.
- 📡 Add more sensors and assets from the AI4I dataset.

---

## 📄 License

The project is for educational use only.
