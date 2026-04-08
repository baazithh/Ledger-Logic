"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, X } from "lucide-react"; // Optional: for icons

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);

  // If middleware redirected here with a hint, show a full-page overlay.
  useEffect(() => {
    if (searchParams.get("auth") === "required") {
      setShowToast(true);
      // Clear the flag so refreshing doesn't re-trigger indefinitely.
      // (Don't wait: we want the overlay to render immediately.)
      router.replace("/login");
    }
  }, [router, searchParams]);

  // Auto-hide the message after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleRestrictedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Your login logic here (e.g., setting the ledger_auth cookie)
    document.cookie = "ledger_auth=true; path=/";
    router.push("/inventory");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Navigation (Same as Home Page but with restricted clicks) */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">LL</span>
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Ledger<span className="text-indigo-600">Logic</span>
          </span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-600">
          <button onClick={handleRestrictedClick} className="hover:text-indigo-600 transition-colors">Inventory</button>
          <button onClick={handleRestrictedClick} className="hover:text-indigo-600 transition-colors">Sell</button>
          <button onClick={handleRestrictedClick} className="hover:text-indigo-600 transition-colors">History</button>
        </div>
        
        <div className="w-[100px]"></div> {/* Spacer to keep layout consistent */}
      </nav>

      {/* Main Login Content */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Sign In</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Enter your credentials to access the ledger</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <input type="email" placeholder="Email" required className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-indigo-600" />
              <input type="password" placeholder="Password" required className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-indigo-600" />
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all active:scale-[0.98]">
              Login
            </button>
          </form>
        </div>
      </main>

      {/* Full-page overlay so the user understands login is required */}
      {showToast && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex items-start gap-3 bg-zinc-900 text-white px-6 py-5 rounded-2xl shadow-2xl border border-white/10 w-[min(520px,90vw)]">
            <AlertCircle className="text-indigo-400 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="text-sm font-black uppercase tracking-widest text-indigo-300">
                Login required
              </div>
              <div className="text-sm mt-2 font-medium text-zinc-200">
                You tried to access protected actions. Sign in to use Inventory, Sell, and History.
              </div>
            </div>
            <button onClick={() => setShowToast(false)} className="ml-3 hover:text-gray-300 shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}