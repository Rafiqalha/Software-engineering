"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MahasiswaSettingsPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [nim, setNim] = useState("");

  useEffect(() => {
    const storedNim = localStorage.getItem('evalora_mhs_nim');
      
    if (storedNim) {
      setNim(storedNim);
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok.");
      return;
    }

    if (!nim) {
      setError("Sesi tidak valid. Silakan login kembali.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/mahasiswa/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, oldPassword, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password berhasil diubah!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Gagal mengubah password.");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Pengaturan Mahasiswa</h1>
        <p className="text-slate-500 mt-1">Ubah kata sandi dan kelola preferensi akun Anda.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-lg font-medium text-slate-800 tracking-tight mb-6 flex items-center gap-2">
           <span className="material-symbols-outlined text-[20px] text-primary">lock</span> 
           Ubah Kata Sandi
        </h2>
        
        <form onSubmit={handleChangePassword} className="space-y-5">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">
               Kata Sandi Saat Ini / Default (NIM)
             </label>
             <input
               type="password"
               required
               className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
               value={oldPassword}
               onChange={(e) => setOldPassword(e.target.value)}
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">
               Kata Sandi Baru
             </label>
             <input
               type="password"
               required
               className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">
               Konfirmasi Kata Sandi Baru
             </label>
             <input
               type="password"
               required
               className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
             />
           </div>

           {error && (
             <div className="p-3 text-sm text-rose-700 bg-rose-50 rounded-md border border-rose-200">
               {error}
             </div>
           )}

           {success && (
             <div className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
               {success}
             </div>
           )}

           <div className="pt-2">
             <button
               type="submit"
               disabled={loading}
               className="px-6 py-2 bg-primary text-white font-medium text-sm rounded-md hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
             >
               {loading ? "Menyimpan..." : "Simpan Perubahan"}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
}
