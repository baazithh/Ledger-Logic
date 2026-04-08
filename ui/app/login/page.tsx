'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Set your password here
      document.cookie = "ledger_auth=true; path=/";
      router.push('/inventory');
    } else {
      alert("Invalid Access Code");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <form onSubmit={handleLogin} className="p-10 border border-white/10 rounded-[2rem] bg-white/[0.02] backdrop-blur-3xl w-full max-w-sm text-center">
        <h1 className="text-2xl font-black italic mb-6 uppercase tracking-tighter text-white">Ledger<span className="text-emerald-500">.</span>Auth</h1>
        <input 
          type="password" 
          placeholder="Enter Access Key" 
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-emerald-500 mb-4 transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-xs tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all">
          Authorize Session
        </button>
      </form>
    </div>
  );
}