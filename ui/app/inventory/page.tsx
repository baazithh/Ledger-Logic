import path from 'path';
import { addProduct, updateStock, updateProductPrice } from '../action';
import { Plus, Minus, Package, Store, Check, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const Database = require('better-sqlite3');
  const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');
  const db = new Database(dbPath);

  // Fetch products for the table
  const products = db.prepare('SELECT * FROM products ORDER BY updated_at DESC').all() as any[];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 md:p-16 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* CV-Style Header */}
        <header className="mb-12 border-b border-white/10 pb-10">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">
            Ledger<span className="text-emerald-500">.</span>Inventory
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em] mt-3">
            Real-time Asset & Stock Management Engine
          </p>
        </header>

        {/* Structured Add Product Form */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-10 mb-16 backdrop-blur-3xl">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-8 flex items-center gap-2">
            <Package size={14} /> Register New Asset
          </h2>
          <form action={addProduct} className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-1">
              <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest mb-2 block">Product Name</label>
              <input name="product_name" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none transition-all font-medium" placeholder="Nexus Pro" />
            </div>

            <div className="md:col-span-1">
              <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest mb-2 block">Merchant</label>
              <input name="merchant_name" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none transition-all font-medium" placeholder="Global Ltd" />
            </div>

            <div>
              <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest mb-2 block">Price ($)</label>
              <input name="price" type="number" step="0.01" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-mono focus:border-emerald-500 outline-none transition-all" placeholder="0.00" />
            </div>

            <div>
              <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest mb-2 block">Opening Stock</label>
              <input name="quantity" type="number" required defaultValue="1" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-mono focus:border-emerald-500 outline-none transition-all" />
            </div>
            
            <div className="flex items-end">
              <button type="submit" className="w-full bg-white text-black hover:bg-emerald-500 hover:text-white font-black py-3 rounded-xl uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-white/5">
                Commit to Ledger
              </button>
            </div>
          </form>
        </div>

        {/* Formal Product Table */}
        <div className="border border-white/10 rounded-[2rem] overflow-hidden bg-white/[0.01] backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10 text-gray-500 uppercase text-[9px] font-black tracking-[0.3em]">
              <tr>
                <th className="p-8">Asset Specification</th>
                <th className="p-8">Merchant Partner</th>
                <th className="p-8">Unit Valuation</th>
                <th className="p-8 text-center">In-Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((product) => (
                <tr key={product.product_id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-8">
                    <p className="text-sm font-bold tracking-tight">{product.product_name}</p>
                    <p className="text-[9px] text-gray-600 font-mono mt-1 uppercase">UUID: {product.product_id}-A9</p>
                  </td>
                  <td className="p-8">
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-400 italic">
                      <Store size={14} className="text-emerald-500" /> {product.merchant_name}
                    </span>
                  </td>
                  
                  {/* EDITABLE PRICE CELL */}
                  <td className="p-8">
                    <form action={updateProductPrice} className="flex items-center gap-3">
                      <input type="hidden" name="product_id" value={product.product_id} />
                      <div className="relative group/price">
                        <DollarSign size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={product.price}
                          className="w-28 bg-white/5 border border-white/10 rounded-lg py-1.5 pl-7 pr-2 text-xs font-mono font-black text-emerald-400 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <button type="submit" className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-emerald-500 hover:bg-white/10 transition-all">
                        <Check size={14} />
                      </button>
                    </form>
                  </td>

                  <td className="p-8">
                    <div className="flex items-center justify-center gap-6">
                      <form action={async () => { 'use server'; await updateStock(product.product_id, product.quantity - 1); }}>
                        <button className="p-2 bg-white/5 hover:bg-red-500/20 rounded-full text-gray-500 hover:text-red-500 transition-all active:scale-90 border border-white/5"><Minus size={14} /></button>
                      </form>
                      <span className={`text-base font-black font-mono w-10 text-center ${product.quantity < 5 ? 'text-orange-500 animate-pulse' : 'text-white'}`}>
                        {product.quantity.toString().padStart(2, '0')}
                      </span>
                      <form action={async () => { 'use server'; await updateStock(product.product_id, product.quantity + 1); }}>
                        <button className="p-2 bg-white/5 hover:bg-emerald-500/20 rounded-full text-gray-500 hover:text-emerald-500 transition-all active:scale-90 border border-white/5"><Plus size={14} /></button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-24 text-center">
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em]">System status: null_ledger_records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}