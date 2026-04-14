"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<"dosen" | "mahasiswa">("dosen");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = loginType === "dosen" ? "/api/auth/login" : "/api/auth/mahasiswa/login";
      const payload = loginType === "dosen" 
        ? { username, password } 
        : { nim: username, password };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('evalora_token', data.token);
        localStorage.setItem('evalora_role', data.role);
        localStorage.setItem('evalora_name', data.name);
        localStorage.setItem('evalora_dosen_id', String(data.dosenId || '1'));
        if (data.nim) {
          localStorage.setItem('evalora_mhs_nim', data.nim);
        }
        if (data.mataKuliah) {
          localStorage.setItem('evalora_mata_kuliah', JSON.stringify(data.mataKuliah));
        }

        if (data.role === "Dosen" || data.role === "Administrator Akademik") {
          router.push("/dashboard");
        } else {
          router.push("/mhs-dashboard");
        }
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      
      {/* Container */}
      <div className="w-full max-w-[450px] bg-white border border-slate-200 rounded-xl shadow-sm px-10 py-12 flex flex-col items-center">
        
        {/* Logos */}
        <div className="flex flex-col items-center mb-10 gap-4">
          <img src="/name-evalora.png" alt="EVALORA Logo" className="h-[120px] w-auto object-contain drop-shadow-md" />
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Masuk log</h1>
            <p className="text-slate-600 text-[15px] mt-1">
              Mulai kelola sistem akademik terpadu Anda.
            </p>
          </div>
        </div>

        {/* Toggle Login Type */}
        <div className="flex w-full mb-6 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setLoginType("dosen")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              loginType === "dosen" 
                ? "bg-white text-primary shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Dosen
          </button>
          <button
            type="button"
            onClick={() => setLoginType("mahasiswa")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              loginType === "mahasiswa" 
                ? "bg-white text-primary shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Mahasiswa
          </button>
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
                  {loginType === "dosen" ? "NIP Dosen" : "NIM Mahasiswa"}
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
                  {loginType === "mahasiswa" ? "Kata Sandi (Default: NIM)" : "Kata Sandi"}
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <p>{error}</p>
            </div>
          )}

          <div className="pt-4 pb-2 flex items-center justify-between">
            <button 
              type="button"
              className="text-primary text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Lupa sandi?
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Memuat...
                </>
              ) : (
                "Selanjutnya"
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 w-full text-center">
          <p className="text-xs text-slate-500">
            Login Trial Tanpa DB: dosen123 / password
          </p>
        </div>
      </div>

    </div>
  );
}
