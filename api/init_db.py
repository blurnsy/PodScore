import sqlite3
from pathlib import Path

def init_db():
    db_path = Path(__file__).parent / "podcast_reviews.db"
    schema_path = Path(__file__).parent / "schema.sql"
    
    # Read schema
    with open(schema_path, 'r') as f:
        schema = f.read()
    
    # Connect to database and create tables
    conn = sqlite3.connect(db_path)
    conn.executescript(schema)
    conn.commit()
    conn.close()
    
    print(f"Database initialized at {db_path}")

if __name__ == "__main__":
    init_db() 