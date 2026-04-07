# 💳 Ledger Logic: BNPL Analytics Engine

### 🎯 Objective
To transform raw ERP transaction logs into an **AI-ready Star Schema** for a Buy Now, Pay Later (BNPL) ecosystem.

### 🏗️ Architecture
- **Raw Layer:** Simulated ERP logs via Python.
- **Silver Layer:** Structured SQL models (Fact & Dimension tables).
- **Gold Layer:** AI-Semantic views for automated reporting.

### 🛠️ Key Features
- **Installment Logic:** Automatically calculates 1/4th payment splits.
- **Data Quality Suite:** Includes automated checks for null values and financial discrepancies.
- **AI-Ready Documentation:** YAML-based glossary for LLM grounding.

### 🚀 How to Run
1. `python scripts/generate_erp.py`
2. `sqlite3 data/ledger_raw.db < scripts/model_data.sql`
3. `python scripts/quality_check.py`