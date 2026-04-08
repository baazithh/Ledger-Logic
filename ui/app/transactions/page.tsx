import path from 'path';
import Link from 'next/link';
import { ArrowUpRight, User, Package, CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const Database = require('better-sqlite3');
  const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');
  const db = new Database(dbPath);

  const sales = db.prepare(`
    SELECT s.*, p.product_name 
    FROM sales s 
    JOIN products p ON s.product_id = p.product_id 
    ORDER BY s.sale_date DESC
  `).all() as any[];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase "><span className="text-emerald-500">.</span>Ledger</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Global Transaction History</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Volume</p>
            <p className="text-2xl font-mono font-black text-emerald-500">${sales.reduce((acc, s) => acc + s.total_price, 0).toLocaleString()}</p>
          </div>
        </header>

        <div className="border border-white/10 rounded-[2rem] overflow-hidden bg-white/[0.02]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">
                <th className="p-6">Date</th>
                <th className="p-6">Customer</th>
                <th className="p-6">Product</th>
                <th className="p-6 text-right">Total Value</th>
                <th className="p-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sales.map((sale) => (
                <tr key={sale.sale_id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="p-6 font-mono text-xs text-gray-500">
                    {new Date(sale.sale_date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-6">
                    <Link href={`/invoice/${sale.sale_id}`} className="flex items-center gap-3 group-hover:text-emerald-400 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-sm">{sale.customer_name}</span>
                    </Link>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Package size={14} /> {sale.product_name}
                    </div>
                  </td>
                  <td className="p-6 text-right font-black font-mono">
                    ${sale.total_price.toFixed(2)}
                  </td>
                  <td className="p-6 text-center">
                    <Link href={`/invoice/${sale.sale_id}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/10 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition-all">
                      View Invoice <ArrowUpRight size={12} />
                    </Link>
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