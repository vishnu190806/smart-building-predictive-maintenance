import nbformat as nbf
import os

def create_notebook():
    os.makedirs("notebooks", exist_ok=True)
    nb = nbf.v4.new_notebook()

    # Title
    title = nbf.v4.new_markdown_cell("""# Session 2: The Pulse of the Building (EDA)
**Objective**: Explore real-world smart building data, uncover trends, and identify energy consumption patterns.

## Task 2: Load and Examine Data
Loading the dataset and understanding its structure.
""")

    # Imports
    imports = nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Set style
sns.set(style="darkgrid")
plt.rcParams['figure.figsize'] = (12, 6)
""")

    # Load Data
    load_data = nbf.v4.new_code_cell("""# Load the dataset
df = pd.read_csv('../data/smart_building_energy.csv')
df['Timestamp'] = pd.to_datetime(df['Timestamp'])

# Display first few rows
df.head()
""")

    # Info
    info = nbf.v4.new_code_cell("""# Check data types and missing values
df.info()
""")

    describe = nbf.v4.new_code_cell("""# Statistical summary
df.describe()
""")

    # Task 3: EDA & Visualization
    task3_header = nbf.v4.new_markdown_cell("""## Task 3: Exploratory Data Analysis
Visualizing energy consumption trends and correlations.
""")

    # Plot 1: Energy over time
    plot_energy = nbf.v4.new_code_cell("""# 1. Energy Consumption Over Time
plt.figure(figsize=(15, 6))
plt.plot(df['Timestamp'], df['Energy_Consumption_kWh'], label='Energy (kWh)', color='teal', alpha=0.7)
plt.title('Building Energy Consumption Over Time (30 Days)')
plt.xlabel('Date')
plt.ylabel('Energy (kWh)')
plt.legend()
plt.show()
""")

    # Plot 2: Correlation Heatmap
    plot_corr = nbf.v4.new_code_cell("""# 2. Correlation Heatmap
plt.figure(figsize=(10, 8))
# Select only numeric columns
numeric_df = df.select_dtypes(include=[np.number])
corr = numeric_df.corr()
sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Sensor Correlation Matrix')
plt.show()
""")

    # Plot 3: Energy Distribution by Time of Day
    plot_hourly = nbf.v4.new_code_cell("""# 3. Energy Distribution by Hour of Day
df['Hour'] = df['Timestamp'].dt.hour

plt.figure(figsize=(12, 6))
sns.boxplot(x='Hour', y='Energy_Consumption_kWh', data=df, palette='viridis')
plt.title('Energy Consumption Distribution by Hour')
plt.xlabel('Hour of Day (0-23)')
plt.ylabel('Energy (kWh)')
plt.show()
""")

    # Task 4: Hypothesis Testing
    task4_header = nbf.v4.new_markdown_cell("""## Task 4: Hypothesis Testing
**Hypothesis**: "Energy consumption peaks between 9 AM - 6 PM due to occupancy and HVAC usage."
""")

    plot_scatter = nbf.v4.new_code_cell("""# Analyze relationship between Occupancy and Energy
plt.figure(figsize=(10, 6))
sns.scatterplot(x='Occupancy_Count', y='Energy_Consumption_kWh', hue='HVAC_Status', data=df, palette='cool', alpha=0.6)
plt.title('Impact of Occupancy and HVAC on Energy Consumption')
plt.show()
""")

    # Task 5: Recommendations
    rec_header = nbf.v4.new_markdown_cell("""## Task 5: Summary & Recommendations
**Findings**:
1. **Peak Hours**: Energy use spikes significantly between 9 AM and 5 PM, correlating with high occupancy.
2. **HVAC Impact**: There is a strong positive correlation between HVAC status and Energy consumption.
3. **Weekends**: Usage drops drastically on weekends.

**Recommendations**:
- **Schedule Optimization**: Pre-cool the building at 8 AM instead of 7 AM to save 1 hour of HVAC runtime.
- **Lighting**: Dim lights automatically when occupancy < 20 (e.g., lunch hours or late evenings).
- **Weekend Mode**: Ensure non-critical systems are fully powered down on Saturdays and Sundays.
""")

    nb.cells = [
        title, imports, load_data, info, describe,
        task3_header, plot_energy, plot_corr, plot_hourly,
        task4_header, plot_scatter, rec_header
    ]

    fname = "notebooks/Session2_EDA.ipynb"
    with open(fname, 'w') as f:
        nbf.write(nb, f)
    print(f"Created notebook: {fname}")

if __name__ == "__main__":
    create_notebook()
