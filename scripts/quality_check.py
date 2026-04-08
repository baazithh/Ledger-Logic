import sqlite3

conn = sqlite3.connect('data/ledger_raw.db')
cursor = conn.cursor()

print("🔍 Starting Data Quality Audit...")

# TEST 1: Check for $0 or Negative Payments
# If a BNPL installment is 0, the company loses money!
cursor.execute("SELECT count(*) FROM fact_payments WHERE installment_value <= 0")
zeros = cursor.fetchone()[0]

# TEST 2: Orphaned Transactions
# Check if any payment exists without a valid Merchant
cursor.execute("""
    SELECT count(*) FROM fact_payments p 
    LEFT JOIN dim_merchants m ON p.merchant_name = m.merchant_name 
    WHERE m.merchant_name IS NULL
""")
orphans = cursor.fetchone()[0]

# Output Results
if zeros == 0 and orphans == 0:
    print("✅ PASS: All financial records are valid.")
else:
    print(f"❌ FAIL: Found {zeros} invalid amounts and {orphans} orphaned records.")

conn.close()