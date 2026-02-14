
# 🌌 Aurora Building Health - Smart Building Predictive Maintenance
## Presentation Outline

This document outlines the content for a 10-slide presentation for the "Aurora Building Health" project.

---

### Slide 1: Title Slide
*   **Project Title:** **Aurora Building Health** – Smart Building Predictive Maintenance
*   **Components:**
    *   **Frontend:** React + TypeScript + Vite
    *   **Backend:** FastAPI + Python
    *   **ML:** Scikit-learn (Isolation Forest & Random Forest)
*   **Presenter Name:** [Your Name]
*   **Visuals:** A screenshot of the dashboard showing the "Aurora" theme (dark mode, glassmorphism) or a high-quality relevant background image.

---

### Slide 2: Objective
*   **Primary Goal:** To develop a full-stack web application for monitoring HVAC assets and predicting equipment failures using machine learning.
*   **Key Objectives:**
    *   **Proactive Maintenance:** Move from reactive repairs to predictive insights.
    *   **Anomaly Detection:** Identify unusual behavior before failure occurs.
    *   **Real-time Monitoring:** Provide live visualization of sensor data.
    *   **User-Centric Design:** Deliver complex ML insights through an intuitive, modern dashboard.

---

### Slide 3: Problem Statement
*   **Current Challenge:**
    *   Traditional maintenance relies on scheduled checks or waiting for breakdown (Reactive).
    *   Unplanned downtime leads to high costs and operational disruption.
    *   Difficulty in manually analyzing complex sensor data streams.
*   **Impact:**
    *   Increased repair costs.
    *   Reduced equipment lifespan.
    *   Inefficient resource allocation.

---

### Slide 4: System Architecture
*   **High-Level Overview:**
    *   **Frontend:** React + TypeScript + Vite (Modern, responsive UI).
    *   **Backend:** FastAPI (High-performance Python API).
    *   **ML Engine:** scikit-learn (Machine Learning models).
    *   **Data Flow:** User Input → API → ML Model → Prediction → Dashboard Visualization.
*   **Visual Representation:** A simple block diagram:
    *   `[React UI]` <--> `[FastAPI Server]` <--> `[ML Models (Isolation Forest, Random Forest)]`

---

### Slide 5: Data & Methodology
*   **Dataset:** AI4I 2020 Predictive Maintenance Dataset.
*   **Key Features (Sensors):**
    1.  **Rotational Speed [rpm]:** Motor speed.
    2.  **Process Temperature [K]:** Operating heat level.
    3.  **Torque [Nm]:** Force applied.
    4.  **Tool Wear [min]:** Cumulative usage time.
*   **Data Preprocessing:**
    *   Scaling features (StandardScaler) for model consistency.
    *   Splitting data for training (supervised vs unsupervised).

---

### Slide 6: Machine Learning Models
*   **Dual-Model Approach:**
    1.  **Unsupervised Learning (Anomaly Detection):**
        *   **Algorithm:** **Isolation Forest**.
        *   **Purpose:** Detects outliers/anomalies without needing labeled failure data.
        *   **Output:** Anomaly Score (Normal vs Abnormal behavior).
    2.  **Supervised Learning (Failure Prediction):**
        *   **Algorithm:** **Random Forest Classifier**.
        *   **Purpose:** Predicts specific failure probability based on historical failure patterns.
        *   **Output:** Risk Probability (0-100%).
    3.  **Clustering (Operational Analysis):**
        *   **Algorithm:** **K-Means Clustering**.
        *   **Purpose:** Categorize operating conditions (e.g., "Normal", "High Load", "Stressed").

---

### Slide 7: Application Features
*   **Interactive Dashboard:**
    *   Real-time telemetry sliders to simulate sensor inputs.
    *   Selectable Assets: HVAC Unit, Chilled Water Pump, Supply Fan.
*   **Visualization:**
    *   Sparkline charts for historical trends.
    *   Status Indicators: Health Pill (Healthy/At Risk), Risk Score Gauge.
*   **Smart Insights:**
    *   Dynamic recommendations based on risk level (e.g., "Schedule maintenance ASAP").
*   **Design:** Modern "Glassmorphism" UI for enhanced user experience.

---

### Slide 8: Implementation Details (Tech Stack)
*   **Backend (Python):**
    *   **FastAPI:** For robust and fast API endpoints (`/predict`, `/health`).
    *   **Joblib:** For efficient model serialization/loading.
    *   **Pandas/Numpy:** For data manipulation.
*   **Frontend (TypeScript):**
    *   **React:** Component-based architecture.
    *   **TailwindCSS:** For styling the premium UI.
    *   **Recharts:** For data visualization.
*   **Deployment:** (Mention if applicable, or local dev setup).

---

### Slide 9: Future Scope
*   **Cloud Deployment:** Host on AWS/Azure for remote access.
*   **IoT Integration:** Connect to physical sensors (MQTT/Kafka) instead of simulated sliders.
*   **Database Integration:** Store historical predictions for long-term trend analysis.
*   **Authentication:** Implement user roles (Admin vs Operator) for secure access.

---

### Slide 10: Conclusion (Expected Outcome)
*   **Conclusion:**
    *   Successfully built a comprehensive predictive maintenance solution.
    *   Demonstrated the power of combining modern web tech with advanced ML.
*   **Expected Outcome:**
    *   **Reduced Downtime:** Early detection prevents catastrophic failures.
    *   **Cost Savings:** Targeted maintenance instead of routine checks.
    *   **Operational Efficiency:** Data-driven decisions for facility management.
*   **Final Thought:** "Moving from *fixing what's broken* to *fixing what's about to break*."
