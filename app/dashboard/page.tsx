"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";

interface DashboardStats {
  totalMahasiswa: number;
  totalMk: number;
  rataA: number;
  distribusi: Record<string, number>;
  auditTrail: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMahasiswa: 0,
    totalMk: 0,
    rataA: 0,
    distribusi: { 'E': 0, 'D': 0, 'C': 0, 'C+': 0, 'B': 0, 'B+': 0, 'A': 0 },
    auditTrail: []
  });
  const [loading, setLoading] = useState(true);
  const [rtActive, setRtActive] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Real-time: refresh dashboard when audit_logs get new entries
  useSupabaseRealtime({
    table: 'audit_logs',
    onInsert: () => {
      setRtActive(true);
      fetchStats();
    }
  });

  // Real-time: refresh when nilai is updated
  useSupabaseRealtime({
    table: 'nilai',
    onInsert: () => { setRtActive(true); fetchStats(); },
    onUpdate: () => { setRtActive(true); fetchStats(); }
  });

  const statCards = [
    { title: "Total Mahasiswa", value: stats.totalMahasiswa.toString(), icon: "group", colorClass: "text-blue-600 bg-blue-50" },
    { title: "Mata Kuliah Aktif", value: stats.totalMk.toString(), icon: "menu_book", colorClass: "text-indigo-600 bg-indigo-50" },
    { title: "Sanggahan Aktif", value: "0", icon: "warning", colorClass: "text-amber-600 bg-amber-50" },
    { title: "Rata-rata Nilai A", value: `${stats.rataA}%`, icon: "trending_up", colorClass: "text-emerald-600 bg-emerald-50" },
  ];

  const recentActivities = [
    { course: "Rekayasa Perangkat Lunak", action: "Perubahan Nilai UAS", time: "10 menit yang lalu" },
    { course: "Kecerdasan Buatan", action: "Impor Data Mahasiswa (Excel)", time: "2 jam yang lalu" },
    { course: "Pemrograman Web", action: "Sanggahan Masuk: NIM 19230001", time: "5 jam yang lalu" },
  ];

  const chartLabels = ['E', 'D', 'C', 'C+', 'B', 'B+', 'A'];
  const chartData = chartLabels.map(label => ({
    label,
    ht: stats.distribusi[label] || 0,
    highlight: label === 'A'
  }));
  const maxHt = Math.max(...chartData.map(d => d.ht), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end pb-2 border-b border-slate-200">
        <div>
           <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Ikhtisar</h1>
           <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
             Ringkasan aktivitas akademik Anda semester ini.
             {rtActive && (
               <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                 <span className="material-symbols-outlined text-[14px]">sensors</span> Langsung
               </span>
             )}
           </p>
        </div>
        <button 
          className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus:ring-2 focus:ring-primary/20 rounded-md text-sm font-medium text-slate-700 transition-colors flex items-center gap-2"
        >
           <span className="material-symbols-outlined text-[18px]">download</span> Unduh Laporan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-3xl font-semibold text-slate-800 mt-1">
                  {loading ? <span className="w-12 h-8 bg-slate-100 rounded animate-pulse inline-block"></span> : stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.colorClass}`}>
                <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-6">Distribusi Nilai (Semester Ganjil)</h3>
          <div className="h-64 flex items-end justify-between gap-4 pt-4 border-b border-slate-100 pb-2 relative">
             {!loading && chartData.map((bar, i) => {
               const pct = maxHt > 0 ? (bar.ht / maxHt) * 100 : 0;
               return (
                 <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                   <div 
                     style={{ height: `${Math.max(pct, 2)}%` }}
                     className={`w-full rounded-t-md transition-all duration-500 ease-out relative shadow-sm
                       ${bar.highlight ? 'bg-primary' : 'bg-slate-200 hover:bg-slate-300'}
                     `}
                   >
                     <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold ${bar.highlight ? 'text-primary' : 'text-slate-500'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                       {bar.ht}
                     </span>
                   </div>
                   <span className="mt-2 text-sm text-slate-600 font-medium">{bar.label}</span>
                 </div>
               );
             })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-slate-800 mb-6">Aktivitas Terakhir</h3>
          <div className="flex-1 flex flex-col gap-6 relative">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="relative flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10 mt-1 z-10"></div>
                  {i !== recentActivities.length - 1 && (
                    <div className="w-px h-full border-l border-slate-200 absolute top-3"></div>
                  )}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-slate-800">{act.action}</p>
                  <p className="text-sm text-slate-500">{act.course}</p>
                  <p className="text-xs text-slate-400 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 border border-slate-200 hover:bg-slate-50 rounded-md text-sm text-primary font-medium transition-colors">
            Lihat Semua Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
