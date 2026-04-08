'use server'
import Database from 'better-sqlite3';
import { revalidatePath } from 'next/cache';

const db = new Database('../data/ledger_raw.db');

export async function addProduct(formData: FormData) {
  const name = formData.get('name');
  const qty = formData.get('qty');
  const price = formData.get('price');

  // Logic to insert into a new 'products' table
  db.prepare('INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)')
    .run(name, qty, price);
    
  revalidatePath('/inventory');
}