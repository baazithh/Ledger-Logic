import path from 'path';
import { ChevronLeft, Printer, CheckCircle2, CreditCard } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap the params Promise (Next.js 15 Requirement)
  const { id } = await params;

  const Database = require('better-sqlite3');
  const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');
  const db = new Database(dbPath);

  // 2. Fetch sale data and join with product info
  const sale = db.prepare(`
    SELECT s.*, p.product_name, p.merchant_name 
    FROM sales s 
    JOIN products p ON s.product_id = p.product_id 
    WHERE s.sale_id = ?
  `).get(id);

  if (!sale) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-mono">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-xl font-bold uppercase tracking-tighter">Error: 404_NOT_FOUND</p>
          <p className="text-gray-500">The invoice ID {id} does not exist in the ledger.</p>
          <Link href="/sell" className="inline-block border border-white/10 px-6 py-2 rounded-full text-xs uppercase font-bold">Return to Terminal</Link>
        </div>
      </div>
    );
  }

  // 3. Generate the installment schedule
  const schedule = [];
  for (let i = 1; i <= sale.installment_count; i++) {
    const dueDate = new Date(sale.start_date);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));
    schedule.push({
      month: i,
      date: dueDate.toISOString().split('T')[0],
      amount: sale.monthly_installment
    });
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-12 font-sans selection:bg-emerald-100">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation / Actions (Hidden during PDF print) */}
        <div className="flex justify-between items-center mb-16 print:hidden">
          <Link href="/sell" className="flex items-center gap-2 text-gray-400 hover:text-black transition-all text-sm font-bold uppercase tracking-widest">
            <ChevronLeft size={16} /> Back to Terminal
          </Link>
          <button 
            onClick={() => window.print()} 
            className="bg-black text-white px-8 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-black/10 font-bold text-xs uppercase tracking-widest"
          >
            <Printer size={16} /> Save as PDF
          </button>
        </div>

        {/* Branding & Status */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-[0.2em]">
              Verified Transaction
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic">LEDGER<span className="text-gray-300">/</span>DOC</h1>
            <p className="text-gray-400 font-mono text-[10px] mt-2 uppercase">Contract UUID: {sale.sale_id}-2026-MEDALLION</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase font-black tracking-widest text-gray-400">Merchant Partner</p>
            <p className="text-xl font-bold">{sale.merchant_name}</p>
          </div>
        </div>

        {/* Contract Summary Card */}
        <div className="grid grid-cols-2 gap-10 mb-16 p-10 bg-gray-50 rounded-[2.5rem]">
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-black tracking-widest mb-3 text-emerald-600">Purchaser</p>
            <p className="text-2xl font-bold tracking-tight">{sale.customer_name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-black tracking-widest mb-3 text-emerald-600">Asset Acquired</p>
            <p className="text-2xl font-bold tracking-tight">{sale.product_name}</p>
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 px-4">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Total Value</p>
            <p className="text-2xl font-black font-mono">${sale.total_price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Initial Pay</p>
            <p className="text-2xl font-black font-mono text-emerald-600">-${sale.down_payment.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Monthly</p>
            <p className="text-2xl font-black font-mono text-blue-600">${sale.monthly_installment.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Duration</p>
            <p className="text-2xl font-black font-mono">{sale.installment_count}M</p>
          </div>
        </div>

        {/* Repayment Roadmap */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-center text-gray-300">Repayment Timeline</h2>
          {schedule.map((item) => (
            <div key={item.month} className="flex justify-between items-center p-6 border-b border-gray-100 group hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-6">
                <span className="text-xs font-black text-gray-300 group-hover:text-black transition-colors italic">
                  #{item.month.toString().padStart(2, '0')}
                </span>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Scheduled Date</p>
                  <p className="font-bold">{new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-8">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Amount</p>
                  <p className="font-black font-mono text-lg">${item.amount.toFixed(2)}</p>
                </div>
                {item.month === 1 ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <div className="w-[18px] h-[18px] border-2 border-gray-100 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legal Footer */}
        <footer className="mt-24 pt-12 border-t border-gray-100 text-[10px] text-gray-400 text-center leading-relaxed max-w-xl mx-auto">
          This document serves as an electronic verification of debt for Mohammed Abdul Basith's Ledger Engine. 
          By completing the down payment, the purchaser agrees to the monthly installment schedule outlined above. 
          No physical signature required for this cloud-verified ledger entry.
        </footer>
      </div>
    </div>
  );
}