import path from 'path';
import { processSale } from '../action';
import { ShoppingCart, User, Calendar, CreditCard, ReceiptIndianRupee } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SellPage() {
  const Database = require('better-sqlite3');
  const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');
  const db = new Database(dbPath);

  // Fetch only products that are actually in stock
  const products = db.prepare('SELECT * FROM products WHERE quantity > 0 ORDER BY product_name ASC').all() as any[];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-12 animate-in fade-in duration-1000">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            BNPL SALES TERMINAL
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Create installment contracts and update real-time ledger.</p>
        </header>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-500/5">
          <form action={processSale} className="space-y-10">
            
            {/* Row 1: Customer & Product */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 flex items-center gap-2">
                  <User size={14} className="text-emerald-400" /> Customer Name
                </label>
                <input 
                  name="customer_name" 
                  required 
                  placeholder="e.g. John Doe" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-500 transition-all text-sm placeholder:text-gray-700" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 flex items-center gap-2">
                  <ShoppingCart size={14} className="text-emerald-400" /> Select Product
                </label>
                <div className="relative">
                  <select 
                    name="product_id" 
                    required 
                    className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-500 text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="text-gray-500">Choose from inventory...</option>
                    {products.map(p => (
                      <option key={p.product_id} value={p.product_id} className="bg-black text-white">
                        {p.product_name} — ${Number(p.price).toFixed(2)} ({p.quantity} in stock)
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-4 pointer-events-none text-gray-600">
                    <CreditCard size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: BNPL Params */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Down Payment ($)</label>
                <input 
                  name="down_payment" 
                  type="number" 
                  step="0.01" 
                  required 
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500 font-mono text-sm" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Tenure (Months)</label>
                <select name="installments" className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500 text-sm cursor-pointer">
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="24">24 Months</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 flex items-center gap-2">
                  <Calendar size={14} /> Start Date
                </label>
                <input 
                  name="start_date" 
                  type="date" 
                  required 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500 text-sm [color-scheme:dark]" 
                />
              </div>
            </div>

            {/* Action Section */}
            <div className="pt-4">
              <button 
                type="submit" 
                className="group w-full bg-gradient-to-br from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-900/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <ReceiptIndianRupee size={18} />
                Generate Installment Plan
              </button>
              <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest font-bold">
                Note: This action will deduct stock and create a legal ledger entry.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}