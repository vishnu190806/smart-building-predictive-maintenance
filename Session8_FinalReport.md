# Session 8: Final Project Report
## Smart Building Infrastructure - The Future Guardian

**Project Title:** Aurora Building Health - Smart Predictive Maintenance System  
**Course:** Artificial Intelligence in Smart Buildings Infrastructure  
**Date:** February 2026

---

### 1. Project Overview
This project aimed to build a comprehensive AI-powered system to enhance the safety, efficiency, and sustainability of smart building operations. Over 8 sessions, we evolved from basic problem identification to deployment of a full-stack predictive maintenance application (`Aurora Building Health`).

**Core Objectives:**
*   **Predictive Maintenance:** Detect HVAC anomalies before failure using Isolation Forest.
*   **Automation:** Trigger instant alerts for critical events (Overcrowding, fire risk) using Rule-Based Logic.
*   **User Interface:** Provide real-time visualization via a React Dashboard.

---

### 2. System Architecture

The system follows a hybrid 3-tier architecture:

#### A. Data Layer (The Foundation)
*   **DBMS:** SQLite for structured access logs (`Users`, `Access_Logs`).
*   **Data Source:** AI4I 2020 Predictive Maintenance Dataset (Sensors: Torque, RPM, Temp, Tool Wear).

#### B. Logic Layer (The Brain)
*   **Rule-Based Engine (Fast Response):**
    *   *If Occupancy > 20 -> Alert Security.*
    *   *If Temp > 40°C -> Trigger Fire Protocol.*
    *   *Implemented in:* SQL-style Python Logic (Session 7).
*   **AI Engine (Deep Analysis):**
    *   **Isolation Forest:** Unsupervised anomaly detection for unknown failure modes.
    *   **Random Forest:** Supervised classification for known failure patterns (Power Failure, Overstrain).
    *   *Implemented in:* Scikit-learn models (Session 3-5).

#### C. Presentation Layer (The Interface)
*   **Frontend:** React + Vite + TailwindCSS (Glassmorphism UI).
*   **API:** FastAPI backend serving predictions and health status.

---

### 3. Stress Test & Performance Analysis
In Session 8, we subjected the system to simulated stress scenarios ("Chaos Engineering").

| Scenario | Simulated Input | System Response | Outcome |
| :--- | :--- | :--- | :--- |
| **Heatwave** | Temp > 45°C | `[FIRE RISK] Temp Critical` | **PASS** (Alert Triggered Instantly) |
| **Sensor Fail** | Reading = 0/NULL | `[MAINTENANCE] Sensor Offline` | **PASS** (Maintenance Team Notified) |
| **Crowd Surge** | Occupancy > 50 | `[SECURITY] Room Overcrowded` | **PASS** (HVAC Load Adjusted) |

**Key Finding:** The hybrid approach (Rules + AI) is superior. Rules catch immediate dangers (Fire/Crowds) in milliseconds, while AI predicts subtle long-term degradation (Machine Wear) over days.

---

### 4. Future Enhancements & Scalability
To deploy this system in real-world Indian infrastructure (e.g., Metro Stations, IT Parks):

1.  **IoT Integration:** Replace simulated CSV data with live MQTT streams from physical sensors (ESP32 / Zigbee).
2.  **Cloud Deployment:** Host the centralized API on AWS/Azure for multi-building management.
3.  **Edge AI:** Deploy lightweight models directly on edge devices (Raspberry Pi) to reduce latency.
4.  **Energy Optimization:** Integrate with Smart Grid data to consume power during off-peak hours combined with our occupancy predictions.

---

### 5. Conclusion
The "Aurora" project successfully demonstrates that smart buildings are not just about "connecting devices" but about "intelligent decision making." By combining robust **SQL data structures** with **Agile AI models**, we created a system that is both **reactive** (to emergencies) and **proactive** (to maintenance needs), fulfilling the vision of a self-aware structure.
