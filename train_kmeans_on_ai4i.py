# train_kmeans_on_ai4i.py
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import joblib

os.makedirs("models", exist_ok=True)

# 1. LOAD YOUR EXISTING DATA
df = pd.read_csv("data/ai4i_training_phys.csv")

# adjust these names if your columns differ
FEATURE_COLUMNS = [
    "Rotational speed [rpm]",
    "Process temperature [K]",
    "Torque [Nm]",
    "Tool wear [min]",
]

X = df[FEATURE_COLUMNS].copy()

print("✅ Loaded ai4i_training_phys.csv")
print(X.describe().round(2))

# 2. SCALE FEATURES
scaler_kmeans = StandardScaler()
X_scaled = scaler_kmeans.fit_transform(X)

print("\n✅ Standardized features for K-Means")

# 3. TRAIN K-MEANS (K = 4 OPERATING MODES)
kmeans = KMeans(
    n_clusters=4,
    init="k-means++",
    max_iter=300,
    random_state=42,
    n_init=10,
)
kmeans.fit(X_scaled)

print("\n✅ Trained K-Means on AI4I data")
print(f"   Inertia: {kmeans.inertia_:.2f}")
print(f"   Iterations: {kmeans.n_iter_}")

# 4. OPTIONALLY INSPECT CLUSTER COUNTS
labels = kmeans.labels_
(unique, counts) = np.unique(labels, return_counts=True)
print("\nCluster sizes:")
for cid, cnt in zip(unique, counts):
    print(f"  Cluster {cid}: {cnt} samples")

# 5. SAVE MODEL + SCALER
joblib.dump(kmeans, "models/kmeans_clustering.pkl")
joblib.dump(scaler_kmeans, "models/scaler_kmeans.pkl")

print("\n✅ Saved:")
print("  models/kmeans_clustering.pkl")
print("  models/scaler_kmeans.pkl")
