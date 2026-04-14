"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('evalora_token', data.token);
        localStorage.setItem('evalora_role', data.role);
        localStorage.setItem('evalora_name', data.name);
        if (data.adminId) {
          localStorage.setItem('evalora_admin_id', data.adminId);
        }
        router.push("/admin-dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      
      {/* Container */}
      <div className="w-full max-w-[450px] bg-white border border-slate-200 rounded-xl shadow-2xl px-10 py-12 flex flex-col items-center relative overflow-hidden">
        
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>

        {/* Logos */}
        <div className="flex flex-col items-center mb-12">
          <img src="/name-evalora.png" alt="EVALORA Logo" className="h-[110px] w-auto mb-6 object-contain drop-shadow-md" />
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Portal Administrator</h1>
          <p className="text-slate-500 text-[14px] mt-1 text-center">
            Secured access for EVALORA.
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="text"
                  required
                  id="username"
                  className="peer w-full px-4 pt-6 pb-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-base"
                  placeholder=" "
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label 
                  htmlFor="username"
                  className="absolute left-4 top-4 text-slate-500 text-base transition-all duration-200 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary peer-valid:-translate-y-3 peer-valid:scale-75 origin-[0]"
                >
                  Username Admin
                </label>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type="password"
                  required
                  id="password"
                  className="peer w-full px-4 pt-6 pb-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-base"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label 
                  htmlFor="password"
                  className="absolute left-4 top-4 text-slate-500 text-base transition-all duration-200 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary peer-valid:-translate-y-3 peer-valid:scale-75 origin-[0]"
                >
                  Kata Sandi
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-700 text-sm bg-rose-50 p-3 rounded-md border border-rose-100">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <p>{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 text-white w-full hover:bg-slate-800 rounded-md px-6 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Otentikasi...
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 relative w-full text-center">
            <Link href="/" className="text-sm border-b border-transparent hover:border-slate-400 text-slate-500 transition-colors">
               &larr; Kembali ke halaman Portal Utama
            </Link>
        </div>
      </div>

    </div>
  );
}
