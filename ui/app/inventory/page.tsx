import path from 'path';
import { addProduct, updateStock } from '../action';
import { Plus, Minus, Package, Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const Database = require('better-sqlite3');
  
  const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');
  const db = new Database(dbPath);

  // Fetch products for the table
  const products = db.prepare('SELECT * FROM products ORDER BY updated_at DESC').all() as any[];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Ledger Inventory Manager
          </h1>
          <p className="text-gray-400 mt-2">Real-time stock management for the BNPL ecosystem.</p>
        </header>

        {/* Glassmorphic Add Product Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl mb-12 shadow-2xl shadow-black/50">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Package className="text-blue-400" size={20} /> New Inventory Item
          </h2>
          <form action={addProduct} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Product Name</label>
              <input name="product_name" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm" placeholder="e.g. iPhone 15" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Merchant</label>
              <input 
                name="merchant_name" 
                required 
                placeholder="e.g. Tesla, Amazon"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Price ($)</label>
              <input name="price" type="number" step="0.01" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm font-mono" placeholder="999.99" />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Initial Stock</label>
              <input name="quantity" type="number" required defaultValue="1" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm font-mono" />
            </div>
            
            <div className="flex items-end">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                Add to Ledger
              </button>
            </div>
          </form>
        </div>

        {/* Product Table */}
        <div className="overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-[0.2em]">
              <tr>
                <th className="p-6 font-bold">Product</th>
                <th className="p-6 font-bold">Merchant</th>
                <th className="p-6 font-bold">Price</th>
                <th className="p-6 font-bold text-center">In Stock</th>
                <th className="p-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map((product) => (
                <tr key={product.product_id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6 text-sm font-medium">{product.product_name}</td>
                  <td className="p-6 text-gray-400">
                    <span className="flex items-center gap-2 text-xs">
                      <Store size={14} className="text-purple-400" /> {product.merchant_name}
                    </span>
                  </td>
                  <td className="p-6 text-blue-400 font-mono text-sm">${Number(product.price).toFixed(2)}</td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-4">
                      <form action={async () => { 'use server'; await updateStock(product.product_id, product.quantity - 1); }}>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-all"><Minus size={16} /></button>
                      </form>
                      <span className={`text-lg font-bold w-8 text-center ${product.quantity < 5 ? 'text-orange-400' : 'text-white'}`}>
                        {product.quantity}
                      </span>
                      <form action={async () => { 'use server'; await updateStock(product.product_id, product.quantity + 1); }}>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-green-400 transition-all"><Plus size={16} /></button>
                      </form>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-widest transition-all">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-20 text-center text-gray-600 italic font-mono text-sm">
              DATABASE_STATUS: EMPTY_LEDGER
            </div>
          )}
        </div>
      </div>
    </div>
  );
}