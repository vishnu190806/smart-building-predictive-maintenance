import sqlite3
import os

DB_PATH = 'access_control.db'

def init_db():
    if os.path.exists(DB_PATH):
        print("Database already exists. Deleting to recreate...")
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Read schema
    with open('access_control/schema.sql', 'r') as f:
        schema_script = f.read()

    cursor.executescript(schema_script)
    print(f"Database initialized at {DB_PATH} with schema and sample data.")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
