"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import faviconPng from "./favicon.png";
import { signOut } from "./action";

export default function Home() {
  const router = useRouter();

  // Keep initial SSR/CSR render identical, then resolve auth on mount.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoggedIn(document.cookie.includes("ledger_auth"));
      setIsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // This handles Inventory, Sell, and History buttons
  const protectedNavigate = (path: string) => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      router.push(path);
    }
  };

  const startLogout = () => {
    setIsLoggingOut(true);
    // Submit the existing server-action form after UI updates so user sees loader.
    const timer = setTimeout(() => {
      const form = document.getElementById("home-logout-form") as HTMLFormElement | null;
      form?.requestSubmit();
    }, 120);
    return () => clearTimeout(timer);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => protectedNavigate("/inventory")}>
          <div className="w-8 h-8 flex items-center justify-center">
            <Image
              src={faviconPng}
              alt="Ledger Inventory"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg"
              priority
            />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-50">
            Ledger<span className="text-emerald-500">.</span>Logic
          </span>
        </div>

        {/* Nav Buttons with Protection */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <button
            onClick={() => protectedNavigate("/inventory")}
            className="hover:text-emerald-500 transition-colors"
          >
            Inventory
          </button>
          <button
            onClick={() => protectedNavigate("/sell")}
            className="hover:text-emerald-500 transition-colors"
          >
            Sell
          </button>
          <button
            onClick={() => protectedNavigate("/history")}
            className="hover:text-emerald-500 transition-colors"
          >
            History
          </button>
        </div>

        {/* Top Right Auth Button */}
        {isReady && isLoggedIn ? (
          <form id="home-logout-form" action={signOut}>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="px-5 py-2 text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-50 dark:text-black rounded-full hover:opacity-90 transition-opacity min-w-[100px]"
            >
              <span suppressHydrationWarning>Logout</span>
            </button>
          </form>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2 text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-50 dark:text-black rounded-full hover:opacity-90 transition-opacity min-w-[100px]"
          >
            <span suppressHydrationWarning>Sign In</span>
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 text-center lg:text-left lg:flex-row lg:px-24 gap-12 py-20">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              {isLoggedIn ? "Session Active" : "Secure Ledger System"}
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50 leading-[1.1]">
            Financial clarity <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-violet-500">
              powered by logic.
            </span>
          </h1>

          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Record every sale, track your stock, and analyze your history with automated insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => protectedNavigate("/inventory")}
              className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* UI Mockup Placeholder */}
        <div className="flex-1 w-full max-w-2xl">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-video bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-4">
              <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 rounded-lg flex flex-col p-4 gap-4">
                <div className="h-8 w-1/3 bg-zinc-200 dark:bg-zinc-700 rounded shadow-sm"></div>
                <div className="flex gap-4 h-full">
                  <div className="w-2/3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  <div className="w-1/3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-8 py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
        <p className="text-center text-sm text-zinc-500">
          © 2026 Ledger Logic. Efficient, fast, and secure.
        </p>
      </footer>

      {/* Custom in-page logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="w-[min(420px,90vw)] rounded-2xl border border-white/10 bg-zinc-900 text-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold tracking-tight">Do you really want to log out?</h3>
            <p className="mt-2 text-sm text-zinc-300">
              You will be signed out and returned to the home page.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No
              </button>
              <button
                type="button"
                onClick={startLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-80 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoggingOut && (
                  <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                )}
                {isLoggingOut ? "Logging out..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}