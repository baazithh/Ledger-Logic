import sqlite3
import pandas as pd
import random
from datetime import datetime, timedelta

# 1. Connect to a local database file
conn = sqlite3.connect('data/ledger_raw.db')
cursor = conn.cursor()

# 2. Create the "Raw" ERP table
# This is "messy" data exactly as it happens in real-time.
cursor.execute('''
    CREATE TABLE IF NOT EXISTS raw_transactions (
        txn_id TEXT,
        cust_email TEXT,
        merchant_name TEXT,
        amount REAL,
        status TEXT,
        created_at TIMESTAMP
    )
''')

# 3. Generate fake data
merchants = ['Apple Store', 'Namshi', 'Jarir Bookstore']
for i in range(10):
    txn_id = f"TMR-{1000 + i}"
    # Randomly make some "FAILED" to test data quality later
    status = random.choice(['SUCCESS', 'SUCCESS', 'FAILED']) 
    cursor.execute("INSERT INTO raw_transactions VALUES (?, ?, ?, ?, ?, ?)",
                   (txn_id, f"user{i}@email.com", random.choice(merchants), 
                    1000.0, status, datetime.now() - timedelta(days=i)))

conn.commit()
print("✅ Raw ERP Data Generated!")
conn.close()