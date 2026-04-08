'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import path from 'path';

// Define the path relative to the root ledger-logic folder
const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');

/**
 * Updates stock quantity for a specific product
 */
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

/**
 * Adds a new product and auto-registers the merchant if missing
 */
export async function addProduct(formData: FormData) {
  const Database = require('better-sqlite3');
  const db = new Database(dbPath);

  const name = formData.get('product_name') as string;
  const merchant = formData.get('merchant_name') as string;
  const qty = parseInt(formData.get('quantity') as string) || 0;
  const price = parseFloat(formData.get('price') as string) || 0.0;

  try {
    db.prepare(`
      INSERT OR IGNORE INTO dim_merchants (merchant_name, category) 
      VALUES (?, 'General')
    `).run(merchant);

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

/**
 * Processes a BNPL Sale: Checks stock, calculates installments, and records transaction
 */
export async function processSale(formData: FormData) {
  const Database = require('better-sqlite3');
  const db = new Database(dbPath);

  const productId = parseInt(formData.get('product_id') as string);
  const customerName = formData.get('customer_name') as string;
  const downPayment = parseFloat(formData.get('down_payment') as string) || 0;
  const installments = parseInt(formData.get('installments') as string);
  const startDateStr = formData.get('start_date') as string;

  let newSaleId: number | bigint;

  try {
    // 1. Fetch product to verify stock and price
    const product = db.prepare('SELECT * FROM products WHERE product_id = ?').get(productId);
    
    if (!product || product.quantity <= 0) {
      db.close();
      return { success: false, error: "Item is out of stock" };
    }

    // 2. BNPL Logic Calculations
    const totalAmount = product.price;
    const remainingBalance = totalAmount - downPayment;
    const monthlyAmount = remainingBalance / installments;
    
    const start = new Date(startDateStr);
    const end = new Date(new Date(startDateStr).setMonth(start.getMonth() + installments));
    const endDateStr = end.toISOString().split('T')[0];

    // 3. Atomic Transaction
    const runSaleTransaction = db.transaction(() => {
      db.prepare('UPDATE products SET quantity = quantity - 1 WHERE product_id = ?').run(productId);
      
      const info = db.prepare(`
        INSERT INTO sales (
          product_id, customer_name, total_price, down_payment, 
          installment_count, monthly_installment, start_date, end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        productId, 
        customerName, 
        totalAmount, 
        downPayment, 
        installments, 
        monthlyAmount, 
        startDateStr, 
        endDateStr
      );

      // Capture the ID of the sale we just created
      newSaleId = info.lastInsertRowid;
    });

    runSaleTransaction();
    db.close();
    
    revalidatePath('/inventory');
    revalidatePath('/sell');
    
  } catch (error) {
    console.error("Sale Processing Error:", error);
    return { success: false, error: "Transaction failed" };
  }

  // Redirect the user to their fresh invoice page
  redirect(`/invoice/${newSaleId}`);
}