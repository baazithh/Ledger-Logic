'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import path from 'path';
import crypto from 'crypto';
import Database from 'better-sqlite3';

// Define the path relative to the root ledger-logic folder
const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');

function ensureAuthSchema(db: Database.Database) {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

function hashPassword(password: string, saltHex: string) {
  const salt = Buffer.from(saltHex, 'hex');
  const hash = crypto.pbkdf2Sync(password, salt, 120_000, 32, 'sha256');
  return hash.toString('hex');
}

function setAuthCookie(userId: number) {
  // "ledger_auth" just needs to exist for middleware; we store user_id for future use.
  cookies().set('ledger_auth', String(userId), {
    // Keep readable by client UI so Home can show Sign In/Logout state.
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function signUp(formData: FormData) {
  const db = new Database(dbPath);

  const fullName = (formData.get('full_name') as string | null)?.trim() ?? '';
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  if (!email || !password) {
    db.close();
    redirect('/login?error=missing_fields');
  }

  if (password.length < 8) {
    db.close();
    redirect('/login?mode=signup&error=weak_password');
  }

  try {
    ensureAuthSchema(db);

    const saltHex = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, saltHex);

    const info = db.prepare(`
      INSERT INTO users (email, full_name, password_salt, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(email, fullName || null, saltHex, passwordHash);

    const userId = Number(info.lastInsertRowid);
    db.close();

    setAuthCookie(userId);
    redirect('/inventory');
  } catch (error: unknown) {
    db.close();
    // SQLite UNIQUE constraint violation
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes('unique')) {
      redirect('/login?mode=signin&error=email_exists');
    }
    console.error('Sign Up Error:', error);
    redirect('/login?mode=signup&error=unknown');
  }
}

export async function signIn(formData: FormData) {
  const db = new Database(dbPath);

  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  if (!email || !password) {
    db.close();
    redirect('/login?error=missing_fields');
  }

  try {
    ensureAuthSchema(db);
    const user = db
      .prepare('SELECT user_id, password_salt, password_hash FROM users WHERE email = ?')
      .get(email) as { user_id: number; password_salt: string; password_hash: string } | undefined;

    if (!user) {
      db.close();
      redirect('/login?mode=signin&error=invalid_credentials');
    }

    const computed = hashPassword(password, user!.password_salt);
    if (computed !== user!.password_hash) {
      db.close();
      redirect('/login?mode=signin&error=invalid_credentials');
    }

    db.close();
    setAuthCookie(user!.user_id);
    redirect('/inventory');
  } catch (error) {
    db.close();
    console.error('Sign In Error:', error);
    redirect('/login?mode=signin&error=unknown');
  }
}

export async function signOut() {
  cookies().set('ledger_auth', '', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  redirect('/');
}

/**
 * Updates stock quantity for a specific product
 */
export async function updateStock(productId: number, newQty: number) {
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
    
    // Refresh the UI
    revalidatePath('/inventory');
    
    // NOTE: We don't return anything here. 
    // This makes the function return Promise<void>, 
    // which clears the TypeScript error in your page.tsx.
  } catch (error) {
    console.error("Database Insert Error:", error);
    db.close();
    // If you need to show an error, you'd typically 
    // use a redirect to an error page or use useFormState.
  }
}
/**
 * Processes a BNPL Sale: Checks stock, calculates installments, and records transaction
 */
export async function processSale(formData: FormData) {
  const db = new Database(dbPath);

  const productId = parseInt(formData.get('product_id') as string);
  const customerName = formData.get('customer_name') as string;
  const downPayment = parseFloat(formData.get('down_payment') as string) || 0;
  const installments = parseInt(formData.get('installments') as string);
  const startDateStr = formData.get('start_date') as string;

  let newSaleId: number | bigint = 0;

  try {
    const product = db.prepare('SELECT * FROM products WHERE product_id = ?').get(productId);
    
    if (!product || product.quantity <= 0) {
      db.close();
      console.error("Stock check failed.");
      return; // Returns Promise<void> - Fixes the UI error
    }

    const totalAmount = product.price;
    const remainingBalance = totalAmount - downPayment;
    const monthlyAmount = remainingBalance / installments;
    
    const start = new Date(startDateStr);
    const end = new Date(new Date(startDateStr).setMonth(start.getMonth() + installments));
    const endDateStr = end.toISOString().split('T')[0];

    const runSaleTransaction = db.transaction(() => {
      db.prepare('UPDATE products SET quantity = quantity - 1 WHERE product_id = ?').run(productId);
      
      const info = db.prepare(`
        INSERT INTO sales (
          product_id, customer_name, total_price, down_payment, 
          installment_count, monthly_installment, start_date, end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        productId, customerName, totalAmount, downPayment, 
        installments, monthlyAmount, startDateStr, endDateStr
      );

      newSaleId = info.lastInsertRowid;
    });

    runSaleTransaction();
    db.close();
    
    revalidatePath('/inventory');
    revalidatePath('/sell');
    revalidatePath('/transactions'); // Added this to refresh your history page

  } catch (error) {
    if (db) db.close();
    console.error("Sale Processing Error:", error);
    return; // Returns Promise<void> - Fixes the UI error
  }

  // Redirect happens outside the try/catch
  if (newSaleId !== 0) {
    redirect(`/invoice/${newSaleId}`);
  }
}
export async function updateProductPrice(formData: FormData) {
  const db = new Database(dbPath);

  const productId = parseInt(formData.get('product_id') as string);
  const newPrice = parseFloat(formData.get('price') as string);

  try {
    db.prepare('UPDATE products SET price = ? WHERE product_id = ?')
      .run(newPrice, productId);
    
    db.close();
    revalidatePath('/inventory');
  } catch (error) {
    console.error("Price Update Error:", error);
    if (db) db.close();
  }
}