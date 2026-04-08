'use server'

import { revalidatePath } from 'next/cache';
import path from 'path';

// Define the path relative to the root ledger-logic folder
const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');

export async function updateStock(productId: number, newQty: number) {
  const Database = require('better-sqlite3');
  const db = new Database(dbPath);
  
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE product_id = ?
    `);
    
    stmt.run(newQty, productId);
    db.close();
    
    revalidatePath('/inventory');
    return { success: true };
  } catch (error) {
    console.error("Database Update Error:", error);
    return { success: false, error: "Failed to update stock" };
  }
}

export async function addProduct(formData: FormData) {
  const Database = require('better-sqlite3');
  const db = new Database(dbPath);

  const name = formData.get('product_name') as string;
  const merchant = formData.get('merchant_name') as string;
  const qty = parseInt(formData.get('quantity') as string) || 0;
  const price = parseFloat(formData.get('price') as string) || 0.0;

  try {
    // STEP 1: Auto-register the merchant if it's new
    // 'INSERT OR IGNORE' keeps the Foreign Key happy without crashing if it exists
    db.prepare(`
      INSERT OR IGNORE INTO dim_merchants (merchant_name, category) 
      VALUES (?, 'General')
    `).run(merchant);

    // STEP 2: Now add the product safely
    db.prepare(`
      INSERT INTO products (merchant_name, product_name, quantity, price) 
      VALUES (?, ?, ?, ?)
    `).run(merchant, name, qty, price);

    db.close();
    revalidatePath('/inventory');
    return { success: true };
  } catch (error) {
    console.error("Database Insert Error:", error);
    return { success: false };
  }
}