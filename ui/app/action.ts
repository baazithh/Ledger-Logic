'use server'

import { revalidatePath } from 'next/cache';
import path from 'path';

// Define the path outside the function
const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');

export async function updateStock(productId: number, newQty: number) {
  // Import better-sqlite3 dynamically inside the action
  const Database = require('better-sqlite3');
  const db = new Database(dbPath);
  
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE product_id = ?
    `);
    
    stmt.run(newQty, productId);
    
    // Close the connection to prevent database locks on Arch
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
  const qty = parseInt(formData.get('quantity') as string);
  const price = parseFloat(formData.get('price') as string);

  try {
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