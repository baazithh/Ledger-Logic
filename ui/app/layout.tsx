import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a]">
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/5 backdrop-blur-lg border border-white/10 px-6 py-3 rounded-2xl flex gap-8">
          <Link href="/inventory" className="text-xs uppercase tracking-widest font-bold hover:text-blue-400 transition-colors">Inventory</Link>
          <Link href="/sell" className="text-xs uppercase tracking-widest font-bold hover:text-emerald-400 transition-colors">Sell (BNPL)</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}