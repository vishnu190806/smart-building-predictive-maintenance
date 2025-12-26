import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest
import matplotlib.pyplot as plt

# ------------------------
# CONFIG
# ------------------------
N_SAMPLES = 10000
ANOMALY_RATIO = 0.02  # 2% anomalies
RANDOM_SEED = 42

OUTPUT_DIR = os.path.join("data")
os.makedirs(OUTPUT_DIR, exist_ok=True)
CSV_PATH = os.path.join(OUTPUT_DIR, "simulated_sensor_data.csv")
RESULT_CSV_PATH = os.path.join(OUTPUT_DIR, "simulated_with_anomalies.csv")


def generate_timestamp_series(n_samples: int, start: datetime) -> pd.Series:
    """
    Generate a sequence of timestamps at 1-minute intervals.
    """
    return pd.Series([start + timedelta(minutes=i) for i in range(n_samples)])


def simulate_normal_sensor_data(n_samples: int, random_state: int = 42) -> pd.DataFrame:
    """
    Simulate normal operating data for:
      - vibration (mm/s)
      - temperature (°C)
      - load (%)
      - power (kW)
    """
    rng = np.random.default_rng(random_state)

    # Reasonable ranges for normal HVAC/motor operation (rough example)
    vibration = rng.normal(loc=2.0, scale=0.5, size=n_samples)      # mm/s
    temperature = rng.normal(loc=40.0, scale=5.0, size=n_samples)   # °C
    load = rng.normal(loc=60.0, scale=10.0, size=n_samples)         # %
    power = rng.normal(loc=15.0, scale=3.0, size=n_samples)         # kW

    df = pd.DataFrame({
        "vibration": vibration,
        "temperature": temperature,
        "load": load,
        "power": power,
    })
    return df


def inject_anomalies(df: pd.DataFrame, anomaly_ratio: float, random_state: int = 42) -> pd.DataFrame:
    """
    Inject synthetic anomalies by:
      - boosting vibration & temperature (e.g., bearing issue)
      - increasing power at low load (inefficiency)
    """
    rng = np.random.default_rng(random_state)
    n_samples = len(df)
    n_anomalies = int(n_samples * anomaly_ratio)

    anomaly_indices = rng.choice(n_samples, size=n_anomalies, replace=False)

    df_anom = df.copy()

    for idx in anomaly_indices:
        # Randomly choose an anomaly type
        anomaly_type = rng.integers(0, 2)
        if anomaly_type == 0:
            # Overheating + high vibration
            df_anom.loc[idx, "vibration"] += rng.uniform(4.0, 8.0)   # big spike
            df_anom.loc[idx, "temperature"] += rng.uniform(10.0, 25.0)
        else:
            # Inefficient operation: high power, low load
            df_anom.loc[idx, "power"] += rng.uniform(8.0, 15.0)
            df_anom.loc[idx, "load"] -= rng.uniform(15.0, 30.0)

    # Clip some extreme negatives if any
    df_anom["load"] = df_anom["load"].clip(lower=0.0)
    df_anom["vibration"] = df_anom["vibration"].clip(lower=0.0)
    df_anom["power"] = df_anom["power"].clip(lower=0.0)

    return df_anom, anomaly_indices


def train_isolation_forest(X: pd.DataFrame, contamination: float = 0.02, random_state: int = 42):
    """
    Train IsolationForest for multivariate anomaly detection.
    Widely used for predictive maintenance where labels are limited.[web:22][web:23][web:36]
    """
    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        random_state=random_state,
        n_jobs=-1
    )
    model.fit(X)
    return model


def main():
    print("=== Simulating sensor data ===")

    # 1. Generate timestamps
    start_time = datetime.now().replace(second=0, microsecond=0)
    timestamps = generate_timestamp_series(N_SAMPLES, start_time)

    # 2. Generate normal sensor readings
    df_normal = simulate_normal_sensor_data(N_SAMPLES, random_state=RANDOM_SEED)

    # 3. Inject anomalies
    df_with_anom, anomaly_indices = inject_anomalies(
        df_normal,
        anomaly_ratio=ANOMALY_RATIO,
        random_state=RANDOM_SEED
    )

    # 4. Add timestamp + ground truth anomaly flag (for evaluation)
    df_with_anom.insert(0, "timestamp", timestamps)
    df_with_anom["ground_truth_anomaly"] = 0
    df_with_anom.loc[anomaly_indices, "ground_truth_anomaly"] = 1

    # Save raw simulated data
    df_with_anom.to_csv(CSV_PATH, index=False)
    print(f"Saved simulated data to {CSV_PATH}")

    # 5. Train Isolation Forest on features only (no labels)
    feature_cols = ["vibration", "temperature", "load", "power"]
    X = df_with_anom[feature_cols]

    print("=== Training Isolation Forest model ===")
    model = train_isolation_forest(X, contamination=ANOMALY_RATIO, random_state=RANDOM_SEED)

    # 6. Get anomaly scores & predictions
    scores = model.decision_function(X)  # higher = more normal, lower = more anomalous[web:23][web:36]
    preds = model.predict(X)             # 1 = normal, -1 = anomaly

    df_with_anom["anomaly_score"] = scores
    df_with_anom["is_anomaly"] = (preds == -1).astype(int)

    # Save results
    df_with_anom.to_csv(RESULT_CSV_PATH, index=False)
    print(f"Saved results with anomalies to {RESULT_CSV_PATH}")

    # 7. Basic evaluation: how many anomalies did we detect?
    n_true_anom = df_with_anom["ground_truth_anomaly"].sum()
    n_detected_anom = df_with_anom["is_anomaly"].sum()
    print(f"Ground truth anomalies: {n_true_anom}")
    print(f"Detected anomalies:    {n_detected_anom}")

    # Rough overlap check
    overlap = df_with_anom[
        (df_with_anom["ground_truth_anomaly"] == 1) &
        (df_with_anom["is_anomaly"] == 1)
    ]
    print(f"Correctly detected anomalies: {len(overlap)}")

    # 8. Quick visualization: vibration over time with anomalies
    plt.figure(figsize=(12, 5))
    normal_mask = df_with_anom["is_anomaly"] == 0
    anomaly_mask = df_with_anom["is_anomaly"] == 1

    plt.plot(
        df_with_anom.loc[normal_mask, "timestamp"],
        df_with_anom.loc[normal_mask, "vibration"],
        label="Normal",
        alpha=0.7
    )
    plt.scatter(
        df_with_anom.loc[anomaly_mask, "timestamp"],
        df_with_anom.loc[anomaly_mask, "vibration"],
        color="red",
        label="Detected anomalies",
        s=10
    )
    plt.xlabel("Time")
    plt.ylabel("Vibration (mm/s)")
    plt.title("Simulated Vibration with Detected Anomalies (Isolation Forest)")
    plt.legend()
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()