import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

FEATURE_COLUMNS = [
    "Rotational speed [rpm]",
    "Process temperature [K]",
    "Torque [Nm]",
    "Tool wear [min]",
]

DATA_PATH = os.path.join("data", "ai4i2020.csv")
MODEL_DIR = "models"
SUP_MODEL_PATH = os.path.join(MODEL_DIR, "rf_supervised.pkl")

def main():
    df = pd.read_csv(DATA_PATH)

    X = df[FEATURE_COLUMNS].values
    y = df["Machine failure"].values  # 0 normal, 1 failure

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        class_weight="balanced",  # handle imbalance
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print(classification_report(y_test, y_pred))

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, SUP_MODEL_PATH)
    print("Saved supervised model to", SUP_MODEL_PATH)

if __name__ == "__main__":
    main()