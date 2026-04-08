import path from 'path';
import { ChevronLeft, Hash, Calendar, ShieldCheck, Globe } from 'lucide-react';
import Link from 'next/link';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const Database = require('better-sqlite3');
  const dbPath = path.resolve(process.cwd(), '../data/ledger_raw.db');
  const db = new Database(dbPath);

  const sale = db.prepare(`
    SELECT s.*, p.product_name, p.merchant_name 
    FROM sales s 
    JOIN products p ON s.product_id = p.product_id 
    WHERE s.sale_id = ?
  `).get(id);

  if (!sale) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-mono">ERR: NULL_POINTER_SALE_ID</div>;

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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 md:p-16 font-sans print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-16 print:hidden">
          <Link href="/sell" className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em]">
            <ChevronLeft size={14} /> Back to Terminal
          </Link>
          <PrintButton />
        </div>

        {/* CV Style Layout Starts Here */}
        <div className="border border-white/10 rounded-[2rem] overflow-hidden bg-white/[0.02] backdrop-blur-3xl print:border-black print:rounded-none">
          
          {/* Top Banner: Formal Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/10 print:border-black">
            <div className="p-10 border-r border-white/10 print:border-black bg-white/[0.03]">
              <h1 className="text-3xl font-black tracking-tighter mb-1 uppercase italic">Ledger<span className="text-emerald-500">.</span></h1>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Transaction Certificate</p>
            </div>
            <div className="p-10 col-span-2 flex flex-col justify-center">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Contract Hash</p>
                  <p className="font-mono text-sm uppercase">{sale.sale_id}-BASITH-2026-X9</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Generated On</p>
                  <p className="text-sm">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Entity Details (The "CV Header" equivalent) */}
          <div className="grid grid-cols-1 md:grid-cols-2 p-10 gap-10 border-b border-white/10 print:border-black">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6 flex items-center gap-2">
                <ShieldCheck size={12} /> Merchant Profile
              </h2>
              <p className="text-2xl font-bold tracking-tight">{sale.merchant_name}</p>
              <p className="text-gray-500 text-xs mt-1">Authorized Distribution Partner</p>
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6 flex items-center gap-2">
                <Globe size={12} /> Purchaser Identity
              </h2>
              <p className="text-2xl font-bold tracking-tight">{sale.customer_name}</p>
              <p className="text-gray-500 text-xs mt-1">Verified Consumer Segment</p>
            </div>
          </div>

          {/* Section 2: Asset Specification */}
          <div className="p-10 border-b border-white/10 print:border-black bg-white/[0.01]">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-8">Purchase Metadata</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Selected Item</p>
                <p className="font-bold text-sm">{sale.product_name}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Gross Value</p>
                <p className="font-bold text-sm font-mono">${sale.total_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Down-Payment</p>
                <p className="font-bold text-sm font-mono text-emerald-400">${sale.down_payment.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Repayment Period</p>
                <p className="font-bold text-sm">{sale.installment_count} Months</p>
              </div>
            </div>
          </div>

          {/* Section 3: The Installment Ledger (CV Table style) */}
          <div className="p-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-8">Installment Roadmap (BNPL)</h2>
            <div className="w-full border border-white/5 rounded-2xl overflow-hidden print:border-black">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 print:bg-gray-100">
                  <tr className="text-[9px] uppercase font-black tracking-widest text-gray-500 print:text-black">
                    <th className="p-4 border-b border-white/5 print:border-black text-center w-20">Sequence</th>
                    <th className="p-4 border-b border-white/5 print:border-black">Due Date</th>
                    <th className="p-4 border-b border-white/5 print:border-black text-right">Amount Payable</th>
                    <th className="p-4 border-b border-white/5 print:border-black text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-black">
                  {schedule.map((item) => (
                    <tr key={item.month} className="hover:bg-white/[0.02] transition-colors text-xs font-medium">
                      <td className="p-4 text-center font-mono text-gray-500">{item.month.toString().padStart(2, '0')}</td>
                      <td className="p-4 font-mono">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="p-4 text-right font-black font-mono text-emerald-400 print:text-black">${item.amount.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className="text-[9px] uppercase tracking-widest px-3 py-1 border border-white/10 rounded-full opacity-40">Unpaid</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Footer */}
          <div className="p-10 bg-white/[0.03] border-t border-white/10 print:border-black text-center">
            <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em] font-bold">
              Verification Engine: Mohammed Abdul Basith | Medallion Lakehouse | 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}