import nbformat as nbf
import os

def create_s7_notebook():
    os.makedirs("notebooks", exist_ok=True)
    nb = nbf.v4.new_notebook()

    # Title
    title = nbf.v4.new_markdown_cell("""# Session 7: The Self-Aware Structure (Rule-Based Automation)
**Objective**: Simulate smart building automation using database tables and SQL logic.

## Task 1 & 2: Industry Context
**How Real Companies Use Rules:**
- **L&T**: `IF usage_hours > limit THEN trigger_maintenance_alert`
- **Godrej Construction**: `IF energy_consumption > threshold THEN reduce_lighting_intensity`
- **Tata Projects**: `IF design_conflict_found THEN notify_planning_team`
- **Procore**: `IF work_progress < expected THEN trigger_delay_warning`

*Summary*: Instead of complex AI "black boxes", many critical building systems rely on deterministic **IF-THEN** rules stored in relational databases (DBMS) to ensure reliability and speed.
""")
    # Imports
    imports = nbf.v4.new_code_cell("""import sqlite3
import pandas as pd
import time

# Use in-memory database for simulation
conn = sqlite3.connect(':memory:')
cursor = conn.cursor()
print("Database Connection Established.")
""")

    # Task 3: table creation
    task3_header = nbf.v4.new_markdown_cell("""## Task 3: Room Status Table
Creating a basic table to track room conditions.

**Schema:**
- `Room_ID` (INT)
- `Occupancy_Count` (INT)
- `AC_Status` (TEXT)
- `Lights_Status` (TEXT)
- `Last_Updated` (TIMESTAMP)
""")

    create_table = nbf.v4.new_code_cell("""# Create Table
create_query = \"\"\"
CREATE TABLE Room_Status (
    Room_ID INTEGER PRIMARY KEY,
    Occupancy_Count INTEGER,
    AC_Status TEXT,
    Lights_Status TEXT,
    Last_Updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\"\"\"
cursor.execute(create_query)

# Insert Sample Data
sample_data = [
    (101, 0,  'ON', 'ON'),   # Empty room, but stuff is ON (Waste!)
    (102, 3,  'ON', 'ON'),   # Low occupancy
    (103, 25, 'ON', 'ON'),   # Overcrowded?
    (104, 0,  'OFF', 'OFF'), # Efficient room
    (105, 50, 'ON', 'ON')    # Conference hall
]

cursor.executemany("INSERT INTO Room_Status (Room_ID, Occupancy_Count, AC_Status, Lights_Status) VALUES (?, ?, ?, ?)", sample_data)
conn.commit()

# Display Initial State
print("--- Initial Room Status ---")
pd.read_sql_query("SELECT * FROM Room_Status", conn)
""")

    # Task 4: Rules
    task4_header = nbf.v4.new_markdown_cell("""## Task 4: Automation Rules
We will now apply SQL updates to simulate automation.

**Rules:**
1. **Energy Saver**: `IF Occupancy = 0 THEN Turn Lights OFF`
2. **Eco Mode**: `IF Occupancy < 5 THEN Set AC to 'LOW POWER'`
3. **Safety Alert**: `IF Occupancy > 20 THEN Flag as 'OVERCROWDED'`
""")

    apply_rules = nbf.v4.new_code_cell("""# Rule 1: Energy Saver (Lights OFF if Empty)
cursor.execute(\"\"\"
    UPDATE Room_Status 
    SET Lights_Status = 'OFF' 
    WHERE Occupancy_Count = 0;
\"\"\")

# Rule 2: Eco Mode (Low Power AC if < 5 people)
cursor.execute(\"\"\"
    UPDATE Room_Status 
    SET AC_Status = 'LOW POWER' 
    WHERE Occupancy_Count > 0 AND Occupancy_Count < 5;
\"\"\")

# Rule 3: Safety Alert (We'll verify this by querying)
overcrowded_query = \"SELECT Room_ID, Occupancy_Count FROM Room_Status WHERE Occupancy_Count > 20\"
overcrowded_rooms = pd.read_sql_query(overcrowded_query, conn)

print("--- Rules Applied ---")
if not overcrowded_rooms.empty:
    print("⚠️ ALERT: The following rooms are overcrowded:")
    print(overcrowded_rooms)
""")

    verify_results = nbf.v4.new_code_cell("""# Display Final State
print("\\n--- Final Room Status (Post-Automation) ---")
final_df = pd.read_sql_query("SELECT * FROM Room_Status", conn)
display(final_df)
""")

    # Task 5: Explanation
    task5_header = nbf.v4.new_markdown_cell("""## Task 5: The "Smart" Explanation

**How this mimics a Smart Building:**
1. **Sensors** (Input) write data to the `Occupancy_Count` column in the database.
2. **The Logic** (SQL Rules) runs periodically (or via triggers).
3. **Actuators** (Output) read the updated `AC_Status` or `Lights_Status` and physically toggle changes.

This loop (Sense -> DB -> Logic -> Actuate) is the foundational architecture of most Building Management Systems (BMS), demonstrating that "Intelligence" often starts with simple, robust rules before needing complex AI.
""")

    nb.cells = [title, imports, task3_header, create_table, task4_header, apply_rules, verify_results, task5_header]

    fname = "notebooks/Session7_RuleBasedAutomation.ipynb"
    with open(fname, 'w') as f:
        nbf.write(nb, f)
    print(f"Created notebook: {fname}")

if __name__ == "__main__":
    create_s7_notebook()
