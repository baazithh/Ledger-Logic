import Database from 'better-sqlite3';
import path from 'path';
import { addProduct, updateStock } from '../actions';
import { Plus, Minus, Package, DollarSign, Store } from 'lucide-react';

export default async function InventoryPage() {
  // Fetch data directly in the Server Component
  const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');
  const db = new Database(dbPath);
  const products = db.prepare('SELECT * FROM products ORDER BY updated_at DESC').all() as any[];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Ledger Inventory Manager
          </h1>
          <p className="text-gray-400 mt-2">Real-time stock management for the BNPL ecosystem.</p>
        </header>

        {/* Glassmorphic Add Product Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl mb-12 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Package className="text-blue-400" size={20} /> New Inventory Item
          </h2>
          <form action={addProduct} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Product Name</label>
              <input name="product_name" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all" placeholder="e.g. iPhone 15" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Merchant</label>
              <input name="merchant_name" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all" placeholder="e.g. Apple Store" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Price ($)</label>
              <input name="price" type="number" step="0.01" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all" placeholder="999.99" />
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
            <thead className="bg-white/5 text-gray-400 uppercase text-xs tracking-widest">
              <tr>
                <th className="p-5 font-bold">Product</th>
                <th className="p-5 font-bold">Merchant</th>
                <th className="p-5 font-bold">Price</th>
                <th className="p-5 font-bold text-center">In Stock</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map((product) => (
                <tr key={product.product_id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5 font-medium">{product.product_name}</td>
                  <td className="p-5 text-gray-400">
                    <span className="flex items-center gap-2">
                      <Store size={14} /> {product.merchant_name}
                    </span>
                  </td>
                  <td className="p-5 text-blue-400 font-mono">${product.price.toFixed(2)}</td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-4">
                      <form action={async () => { 'use server'; await updateStock(product.product_id, product.quantity - 1); }}>
                        <button className="p-1 hover:text-red-400 transition-colors"><Minus size={18} /></button>
                      </form>
                      <span className="text-xl font-bold w-8 text-center">{product.quantity}</span>
                      <form action={async () => { 'use server'; await updateStock(product.product_id, product.quantity + 1); }}>
                        <button className="p-1 hover:text-green-400 transition-colors"><Plus size={18} /></button>
                      </form>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button className="text-xs text-gray-500 hover:text-white uppercase font-bold tracking-tighter">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}