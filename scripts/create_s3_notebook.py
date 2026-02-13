import nbformat as nbf
import os

def create_s3_notebook():
    os.makedirs("notebooks", exist_ok=True)
    nb = nbf.v4.new_notebook()

    # Title
    title = nbf.v4.new_markdown_cell("""# Session 3: The Intelligent Engineer (Classification)
**Objective**: Apply supervised machine learning (KNN vs Decision Tree) to classify equipment health status.

## Task 3: Data Prep & KNN
Loading the AI4I Predictive Maintenance dataset and training a K-Nearest Neighbors model.
""")

    # Imports
    imports = nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

sns.set(style="whitegrid")
""")

    # Load Data
    load_data = nbf.v4.new_code_cell("""# Load AI4I Dataset
df = pd.read_csv('../data/ai4i2020.csv')

# Feature Selection
features = ['Rotational speed [rpm]', 'Process temperature [K]', 'Torque [Nm]', 'Tool wear [min]']
target = 'Machine failure'

X = df[features]
y = df[target]

print("Features:", X.shape)
print("Target Distribution:\\n", y.value_counts())
""")

    # Preprocessing
    preprocess = nbf.v4.new_code_cell("""# Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Scale Features (Critical for KNN)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
""")

    # Train KNN
    train_knn = nbf.v4.new_code_cell("""# 1. Train K-Nearest Neighbors (KNN)
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train_scaled, y_train)

y_pred_knn = knn.predict(X_test_scaled)

print("KNN Accuracy:", accuracy_score(y_test, y_pred_knn))
print("\\nKNN Classification Report:\\n", classification_report(y_test, y_pred_knn))
""")

    # Task 4: Decision Tree
    dt_header = nbf.v4.new_markdown_cell("""## Task 4: Decision Tree Classifier
Training a Decision Tree model and comparing performance.
""")

    train_dt = nbf.v4.new_code_cell("""# 2. Train Decision Tree
dt = DecisionTreeClassifier(max_depth=5, random_state=42)
dt.fit(X_train, y_train)  # Tree doesn't strictly need scaling, but we use raw features here

y_pred_dt = dt.predict(X_test)

print("Decision Tree Accuracy:", accuracy_score(y_test, y_pred_dt))
print("\\nDecision Tree Classification Report:\\n", classification_report(y_test, y_pred_dt))
""")

    # Comparison
    compare_header = nbf.v4.new_markdown_cell("""## Task 5: Model Selection
Comparing the two models.
""")

    compare_plot = nbf.v4.new_code_cell("""# Confusion Matrices
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

sns.heatmap(confusion_matrix(y_test, y_pred_knn), annot=True, fmt='d', cmap='Blues', ax=axes[0])
axes[0].set_title('KNN Confusion Matrix')

sns.heatmap(confusion_matrix(y_test, y_pred_dt), annot=True, fmt='d', cmap='Greens', ax=axes[1])
axes[1].set_title('Decision Tree Confusion Matrix')

plt.show()
""")

    conclusion = nbf.v4.new_markdown_cell("""### Conclusion
- **KNN**: Sensitive to feature scaling. Good for non-linear boundaries but slower at inference time with large datasets.
- **Decision Tree**: Highly interpretable (if-then rules). Fast inference. 
- **Recommendation**: For this dataset, observe which model has better Recall for class 1 (Failures). In maintenance, catching a failure (Recall) is often more important than overall Accuracy.
""")

    nb.cells = [title, imports, load_data, preprocess, train_knn, dt_header, train_dt, compare_header, compare_plot, conclusion]

    fname = "notebooks/Session3_Classification.ipynb"
    with open(fname, 'w') as f:
        nbf.write(nb, f)
    print(f"Created notebook: {fname}")

if __name__ == "__main__":
    create_s3_notebook()
