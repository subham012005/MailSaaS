import sqlite3
import os

def update_db():
    db_path = 'decisions.db'
    if not os.path.exists(db_path):
        print("Database not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add send_mode column
        cursor.execute("ALTER TABLE delegations ADD COLUMN send_mode TEXT DEFAULT 'thread'")
        print("Added send_mode column to delegations table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column send_mode already exists.")
        else:
            print(f"Error: {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    update_db()
