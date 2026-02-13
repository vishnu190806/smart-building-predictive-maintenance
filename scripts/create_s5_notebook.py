import nbformat as nbf
import os

def create_s5_notebook():
    os.makedirs("notebooks", exist_ok=True)
    nb = nbf.v4.new_notebook()

    # Title
    title = nbf.v4.new_markdown_cell("""# Session 5: The Energy Oracle (Ensemble Learning)
**Objective**: Apply ensemble learning techniques (Bagging & Boosting) to improve prediction accuracy.

## Task 2: Models
We will compare:
1. **Random Forest** (Bagging)
2. **AdaBoost** (Boosting)
3. **Gradient Boosting** (Boosting)
""")

    # Imports
    imports = nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, f1_score, accuracy_score

sns.set(style="whitegrid")
""")

    # Load Data
    load_data = nbf.v4.new_code_cell("""# Load Data
df = pd.read_csv('../data/ai4i2020.csv')

features = ['Rotational speed [rpm]', 'Process temperature [K]', 'Torque [Nm]', 'Tool wear [min]']
target = 'Machine failure'

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print("Data Split:", X_train.shape, X_test.shape)
""")

    # Task 3: Random Forest
    rf_task = nbf.v4.new_markdown_cell("""## Task 3: Random Forest (Bagging)
Training a Random Forest Classifier.
""")

    train_rf = nbf.v4.new_code_cell("""# 1. Random Forest
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)

f1_rf = f1_score(y_test, y_pred_rf)
print(f"Random Forest F1-Score: {f1_rf:.4f}")
print(classification_report(y_test, y_pred_rf))
""")

    # Task 4: Boosting
    boost_task = nbf.v4.new_markdown_cell("""## Task 4: Boosting Models
Experimenting with AdaBoost and Gradient Boosting.
""")

    train_boost = nbf.v4.new_code_cell("""# 2. AdaBoost
ada = AdaBoostClassifier(n_estimators=100, random_state=42)
ada.fit(X_train, y_train)
y_pred_ada = ada.predict(X_test)

# 3. Gradient Boosting
gb = GradientBoostingClassifier(n_estimators=100, random_state=42)
gb.fit(X_train, y_train)
y_pred_gb = gb.predict(X_test)

print(f"AdaBoost F1-Score: {f1_score(y_test, y_pred_ada):.4f}")
print(f"Gradient Boosting F1-Score: {f1_score(y_test, y_pred_gb):.4f}")
""")

    # Task 5: Comparison
    comp_task = nbf.v4.new_markdown_cell("""## Task 5: Model Comparison & Conclusion
Comparing the performance of all three ensemble methods.
""")

    plot_comp = nbf.v4.new_code_cell("""# Visualization
models = ['Random Forest', 'AdaBoost', 'Gradient Boosting']
f1_scores = [f1_score(y_test, y_pred_rf), f1_score(y_test, y_pred_ada), f1_score(y_test, y_pred_gb)]

plt.figure(figsize=(8, 5))
sns.barplot(x=models, y=f1_scores, palette='magma')
plt.ylabel('F1 Score (Higher is Better)')
plt.title('Ensemble Model Comparison')
plt.ylim(0, 1)
for i, v in enumerate(f1_scores):
    plt.text(i, v + 0.02, f"{v:.3f}", ha='center')
plt.show()
""")

    conclusion = nbf.v4.new_markdown_cell("""### Recommendation
- **Random Forest**: Generally robust and parallelizable (fast training). Often strictly better than simple bagging.
- **Gradient Boosting**: Often achieves highest accuracy but slower to train sequentially. Sensitive to noise.
- **AdaBoost**: Good baseline for boosting but often outperformed by Gradient Boosting/XGBoost.

**Verdict**: Use **Gradient Boosting** if accuracy is paramount and you can afford training time. Use **Random Forest** for a good balance of speed and performance.
""")

    nb.cells = [title, imports, load_data, rf_task, train_rf, boost_task, train_boost, comp_task, plot_comp, conclusion]

    fname = "notebooks/Session5_Ensemble.ipynb"
    with open(fname, 'w') as f:
        nbf.write(nb, f)
    print(f"Created notebook: {fname}")

if __name__ == "__main__":
    create_s5_notebook()
