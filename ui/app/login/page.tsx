"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertCircle, X } from "lucide-react"; // Optional: for icons
import faviconPng from "../favicon.png";
import { signIn, signUp } from "../action";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(urlMode);
  const [manualOverlay, setManualOverlay] = useState<{ title: string; body: string } | null>(null);

  const authHint = searchParams.get("auth");
  const error = searchParams.get("error");

  const paramOverlay = useMemo(() => {
    if (authHint === "required") {
      return {
        title: "Login required",
        body: "You tried to access protected actions. Sign in to use Inventory, Sell, and History.",
      };
    }

    if (!error) return null;

    return {
      title: "Sign in required",
      body:
        error === "invalid_credentials"
          ? "Invalid email or password."
          : error === "email_exists"
            ? "An account with this email already exists. Please sign in."
            : error === "weak_password"
              ? "Password must be at least 8 characters."
              : error === "missing_fields"
                ? "Please fill in all required fields."
                : "Something went wrong. Please try again.",
    };
  }, [authHint, error]);

  // Clear redirect hints from the URL (so refresh doesn't re-trigger overlays).
  useEffect(() => {
    if (!paramOverlay) return;
    router.replace(urlMode === "signup" ? "/login?mode=signup" : "/login");
  }, [paramOverlay, router, urlMode]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Navigation (Same as Home Page but with restricted clicks) */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
          {/* Keep the same 32x32 size as the previous square logo */}
          <div className="w-8 h-8 flex items-center justify-center">
            <Image
              src={faviconPng}
              alt="Ledger Logic"
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

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
          <button
            onClick={() =>
              setManualOverlay({
                title: "Login required",
                body: "Sign in to use Inventory, Sell, and History.",
              })
            }
            className="hover:text-emerald-500 transition-colors"
          >
            Inventory
          </button>
          <button
            onClick={() =>
              setManualOverlay({
                title: "Login required",
                body: "Sign in to use Inventory, Sell, and History.",
              })
            }
            className="hover:text-emerald-500 transition-colors"
          >
            Sell
          </button>
          <button
            onClick={() =>
              setManualOverlay({
                title: "Login required",
                body: "Sign in to use Inventory, Sell, and History.",
              })
            }
            className="hover:text-emerald-500 transition-colors"
          >
            History
          </button>
        </div>
        
        <div className="w-[100px]"></div> {/* Spacer to keep layout consistent */}
      </nav>

      {/* Main Login Content */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {mode === "signup" ? "Create Account" : "Sign In"}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {mode === "signup"
                ? "Create an account once, then log in anytime."
                : "Enter your credentials to access the ledger."}
            </p>
          </div>

          <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-colors ${
                mode === "signin"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-colors ${
                mode === "signup"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Sign up
            </button>
          </div>

          <form className="mt-4 space-y-6" action={mode === "signup" ? signUp : signIn}>
            <div className="space-y-4">
              {mode === "signup" && (
                <input
                  name="full_name"
                  type="text"
                  placeholder="Full name (optional)"
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-600"
                />
              )}
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all active:scale-[0.98]">
              {mode === "signup" ? "Create account" : "Login"}
            </button>
          </form>
        </div>
      </main>

      {/* Close Button Redirecting to Home */}
      <button 
        onClick={() => router.push("/")}
        className="fixed top-8 right-8 z-[60] p-2.5 text-white hover:bg-emerald-600 rounded-xl transition-all duration-200 group active:scale-90"
        aria-label="Close and return to home"
      >
        <X size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Full-page overlay so the user understands login is required */}
      {(paramOverlay || manualOverlay) && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex items-start gap-3 bg-zinc-900 text-white px-6 py-5 rounded-2xl shadow-2xl border border-white/10 w-[min(520px,90vw)]">
            <AlertCircle className="text-emerald-400 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="text-sm font-black uppercase tracking-widest text-emerald-300">
                {(paramOverlay || manualOverlay)!.title}
              </div>
              <div className="text-sm mt-2 font-medium text-zinc-200">
                {(paramOverlay || manualOverlay)!.body}
              </div>
            </div>
            <button onClick={() => setManualOverlay(null)} className="ml-3 hover:text-gray-300 shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}