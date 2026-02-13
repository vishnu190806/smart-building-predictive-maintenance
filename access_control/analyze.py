import sqlite3
import os

def run_analysis():
    # Create in-memory database
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()

    # Read and execute schema
    with open('access_control/schema.sql', 'r') as f:
        schema_script = f.read()
    cursor.executescript(schema_script)
    print("Database schema created and sample data inserted successfully.\n")

    # Read queries
    with open('access_control/queries.sql', 'r') as f:
        queries_content = f.read()

    # Split queries by semicolon to execute them one by one
    # Note: This is a simple splitter and might need robustness for complex SQL, but works for this task
    queries = [q.strip() for q in queries_content.split(';') if q.strip()]

    print("--- Execution Results ---\n")

    for i, query in enumerate(queries, 1):
        # Extract comment/description if available (simplified assumption)
        lines = query.split('\n')
        description = lines[0].replace('--', '').strip() if lines[0].startswith('--') else f"Query {i}"
        
        print(f"Executing: {description}")
        try:
            cursor.execute(query)
            results = cursor.fetchall()
            headers = [description[0] for description in cursor.description]
            
            # Print headers
            print(f"{' | '.join(headers)}")
            print("-" * 40)
            # Print rows
            for row in results:
                print(f"{' | '.join(map(str, row))}")
            print("\n")
        except sqlite3.Error as e:
            print(f"Error executing query: {e}\n")

    conn.close()

if __name__ == "__main__":
    run_analysis()
