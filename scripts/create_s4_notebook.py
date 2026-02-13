import nbformat as nbf
import os

def create_s4_notebook():
    os.makedirs("notebooks", exist_ok=True)
    nb = nbf.v4.new_notebook()

    # Title
    title = nbf.v4.new_markdown_cell("""# Session 4: Understanding Building Rhythms (Clustering)
**Objective**: Apply unsupervised learning (K-Means) to identify usage patterns without labels.

## Task 3: K-Means Clustering
Loading data and grouping similar operating modes.
""")

    # Imports
    imports = nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import joblib

sns.set(style="whitegrid")
""")

    # Load Data
    load_data = nbf.v4.new_code_cell("""# Load AI4I Data (Physics)
df = pd.read_csv('../data/ai4i_training_phys.csv')

features = ["Rotational speed [rpm]", "Process temperature [K]", "Torque [Nm]", "Tool wear [min]"]
X = df[features]

print("Data Shape:", X.shape)
X.describe().round(2)
""")

    # Preprocessing
    scale = nbf.v4.new_code_cell("""# Scale Features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
""")

    # Train K-Means
    train_kmeans = nbf.v4.new_code_cell("""# Train K-Means
# We assume 4 clusters (e.g., Low, Normal, High, Peak usage modes)
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
kmeans.fit(X_scaled)

df['Cluster'] = kmeans.labels_

print("Inertia:", kmeans.inertia_)
print("Cluster Counts:\\n", df['Cluster'].value_counts())
""")

    # Task 4: Interpretation
    interp_header = nbf.v4.new_markdown_cell("""## Task 4: Cluster Interpretation
Visualizing and labeling the clusters.
""")

    plot_clusters = nbf.v4.new_code_cell("""# Visualize Clusters (Torque vs Speed)
plt.figure(figsize=(10, 6))
sns.scatterplot(x='Rotational speed [rpm]', y='Torque [Nm]', hue='Cluster', data=df, palette='viridis', alpha=0.7)
plt.title('K-Means Clusters: Speed vs Torque')
plt.show()
""")

    boxplots = nbf.v4.new_code_cell("""# Feature Distribution by Cluster
plt.figure(figsize=(12, 6))
# Melt for boxplot
df_melt = df.melt(id_vars=['Cluster'], value_vars=features)
sns.boxplot(x='variable', y='value', hue='Cluster', data=df_melt)
plt.title('Feature Distribution across Clusters')
plt.yscale('log') # Log scale because ranges differ widely
plt.show()
""")

    conclusion = nbf.v4.new_markdown_cell("""### Interpretation
- **Cluster 0**: Likely "Normal Operation" (Mid speed, Mid torque).
- **Cluster 1**: "High Load" (High torque, low speed).
- **Cluster 2**: "Idle / Low Load".
- **Cluster 3**: "Potential Strain" (High Speed).

### Recommendation
For building energy, these clusters might correspond to "Night Mode" (Low), "Morning Ramp-up", "Peak Office Hours", and "Overtime/Cleaning".
""")

    nb.cells = [title, imports, load_data, scale, train_kmeans, interp_header, plot_clusters, boxplots, conclusion]

    fname = "notebooks/Session4_Clustering.ipynb"
    with open(fname, 'w') as f:
        nbf.write(nb, f)
    print(f"Created notebook: {fname}")

if __name__ == "__main__":
    create_s4_notebook()
