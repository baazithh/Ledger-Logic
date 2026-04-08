'use client';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-xl flex items-center gap-3 transition-all shadow-xl font-bold text-xs uppercase tracking-widest print:hidden"
    >
      <Printer size={16} /> Export Digital Ledger
    </button>
  );
}