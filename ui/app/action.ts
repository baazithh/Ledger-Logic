'use server' // This is CRITICAL. It tells Next.js to run this ONLY on the server.

import Database from 'better-sqlite3';
import { revalidatePath } from 'next/cache';
import path from 'path';

// We use path.resolve to make sure it finds your DB outside the 'ui' folder
const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');
const db = new Database(dbPath);

export async function updateStock(productId: number, newQty: number) {
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE product_id = ?
    `);
    
    stmt.run(newQty, productId);
    
    // This tells Next.js to refresh the inventory page data immediately
    revalidatePath('/inventory'); 
    
    return { success: true };
  } catch (error) {
    console.error("Database Update Error:", error);
    return { success: false, error: "Failed to update stock" };
  }
}

export async function addProduct(formData: FormData) {
  const name = formData.get('product_name') as string;
  const merchant = formData.get('merchant_name') as string;
  const qty = parseInt(formData.get('quantity') as string);
  const price = parseFloat(formData.get('price') as string);

  try {
    db.prepare(`
      INSERT INTO products (merchant_name, product_name, quantity, price) 
      VALUES (?, ?, ?, ?)
    `).run(merchant, name, qty, price);

    revalidatePath('/inventory');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}