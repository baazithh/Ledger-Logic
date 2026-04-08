'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-black text-white px-8 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-black/10 font-bold text-xs uppercase tracking-widest print:hidden"
    >
      <Printer size={16} /> Save as PDF
    </button>
  );
}