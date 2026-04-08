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