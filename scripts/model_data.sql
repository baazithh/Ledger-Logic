-- STEP 1: Create the Dimension Table (The "Details")
-- Using IF NOT EXISTS so the script doesn't crash on re-runs.
CREATE TABLE IF NOT EXISTS dim_merchants AS
SELECT DISTINCT 
    merchant_name,
    CASE 
        WHEN merchant_name = 'Apple Store' THEN 'Electronics'
        WHEN merchant_name = 'Namshi' THEN 'Fashion'
        ELSE 'General'
    END AS category
FROM raw_transactions;

-- STEP 2: Create the Fact Table (The "Numbers")
-- We include merchant_name as the "Join Key" (Bridge).
CREATE TABLE IF NOT EXISTS fact_payments AS
SELECT 
    txn_id,
    merchant_name, 
    amount,
    amount / 4 AS installment_value, 
    created_at
FROM raw_transactions
WHERE status = 'SUCCESS';

-- STEP 3: Create a "Semantic View" for AI/Analytics
-- We DROP and CREATE to ensure the view always reflects the latest logic.
DROP VIEW IF EXISTS v_collection_summary;

CREATE VIEW v_collection_summary AS
SELECT 
    m.category,
    SUM(p.amount) as total_volume,
    COUNT(p.txn_id) as successful_orders
FROM fact_payments p
JOIN dim_merchants m ON p.merchant_name = m.merchant_name
GROUP BY 1;
-- STEP 4: Inventory Management Table
-- This table will store the data coming from your Next.js UI.
CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_name TEXT,
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    price REAL DEFAULT 0.0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Linking to our Dimension table
    FOREIGN KEY (merchant_name) REFERENCES dim_merchants(merchant_name)
);

-- Optional: Add a few starting products so your UI isn't empty
INSERT INTO products (merchant_name, product_name, quantity, price)
SELECT 'Apple Store', 'iPhone 15', 10, 999.00
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'iPhone 15');

-- STEP 5: Sales Tracking Table for BNPL Transactions
CREATE TABLE IF NOT EXISTS sales (
    sale_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    customer_name TEXT,
    total_price REAL,
    down_payment REAL,
    installment_count INTEGER,
    monthly_installment REAL,
    start_date TEXT,
    end_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);