-- STEP 1: Create the Dimension Table (The "Details")
-- We extract unique merchants from the raw data.
CREATE TABLE dim_merchants AS
SELECT DISTINCT 
    merchant_name,
    CASE 
        WHEN merchant_name = 'Apple Store' THEN 'Electronics'
        WHEN merchant_name = 'Namshi' THEN 'Fashion'
        ELSE 'General'
    END AS category
FROM raw_transactions;

-- STEP 2: Create the Fact Table (The "Numbers")
-- UPDATED: Added merchant_name so we can JOIN later.
CREATE TABLE fact_payments AS
SELECT 
    txn_id,
    merchant_name, -- This is the "Foreign Key" or Bridge
    amount,
    amount / 4 AS installment_value, 
    created_at
FROM raw_transactions
WHERE status = 'SUCCESS';

-- STEP 3: Create a "Semantic View" for AI
-- This is a "Metric" that an AI or Manager can easily read.
CREATE VIEW v_collection_summary AS
SELECT 
    m.category,
    SUM(p.amount) as total_volume,
    COUNT(p.txn_id) as successful_orders
FROM fact_payments p
JOIN dim_merchants m ON p.merchant_name = m.merchant_name
GROUP BY 1;