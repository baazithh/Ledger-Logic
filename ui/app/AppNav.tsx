"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "./action";

export default function AppNav() {
  const pathname = usePathname();

  // Hide shared nav on Home and Login pages.
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/5 backdrop-blur-lg border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-8">
      <Link href="/inventory" className="text-xs uppercase tracking-widest font-bold hover:text-emerald-400 transition-colors">
        Inventory
      </Link>
      <Link href="/sell" className="text-xs uppercase tracking-widest font-bold hover:text-emerald-400 transition-colors">
        Sell-BNPL
      </Link>
      <Link href="/transactions" className="text-xs uppercase tracking-widest font-bold hover:text-emerald-400 transition-colors">
        History
      </Link>

      <form action={signOut}>
        <button
          type="submit"
          className="text-xs uppercase tracking-widest font-bold text-white/90 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </form>
    </nav>
  );
}
