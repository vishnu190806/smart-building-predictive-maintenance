import os
import pandas as pd

ai4i_path = os.path.join("data", "ai4i2020.csv")
out_path = os.path.join("data", "ai4i_training_phys.csv")

df = pd.read_csv(ai4i_path)

# train only on normal rows
df = df[df["Machine failure"] == 0]

df_4 = df[[
    "Rotational speed [rpm]",
    "Process temperature [K]",
    "Torque [Nm]",
    "Tool wear [min]",
]]

df_4.to_csv(out_path, index=False)
print("saved", out_path)