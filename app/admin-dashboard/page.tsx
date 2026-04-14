"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/app/actions/db";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalMahasiswa: 0,
    totalMk: 0,
    totalDosen: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Re-use getDashboardStats temporarily or build custom for admin
      const data = await getDashboardStats();
      setStats({
        totalMahasiswa: data.totalMahasiswa,
        totalMk: data.totalMk,
        totalDosen: 0 // Will fetch later if needed
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-8 gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
          Ikhtisar Administrator
        </h1>
        <p className="text-slate-500 text-sm">
          Kelola master data Dosen dan Mata Kuliah untuk Sistem Informasi Akademik
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Dosen */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">group</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 text-sm font-medium">Manajemen Dosen</h3>
            <p className="text-sm text-slate-400 mt-1 mb-4">Tambahkan dosen pengampu dan akses login staf pengajar.</p>
            <Link href="/admin-dashboard/dosen" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              Buka Pengelolaan <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Mata Kuliah */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            {loading ? (
              <span className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"></span>
            ) : (
               <span className="text-2xl font-semibold text-slate-800">{stats.totalMk} MK</span>
            )}
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 text-sm font-medium">Mata Kuliah</h3>
            <p className="text-sm text-slate-400 mt-1 mb-4">Pemetaan mata kuliah dan relasi terhadap dosen.</p>
            <Link href="/admin-dashboard/mata-kuliah" className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
               Buka Pengelolaan <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
