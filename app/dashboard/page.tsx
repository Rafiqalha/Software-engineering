"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserGroupIcon, 
  DocumentChartBarIcon, 
  ExclamationCircleIcon, 
  ArrowTrendingUpIcon, 
  ArrowTopRightOnSquareIcon,
  SignalIcon
} from "@heroicons/react/24/outline";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";

interface DashboardStats {
  totalMahasiswa: number;
  totalMk: number;
  rataA: number;
  distribusi: Record<string, number>;
  auditTrail: any[];
}

export default function DashboardPage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [showBars, setShowBars] = useState(false);
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

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.from(".stat-card", {
          y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)"
        });
      }, cardsRef);
      setTimeout(() => setShowBars(true), 300);
      return () => ctx.revert();
    }
  }, [loading]);

  // Real-time: refresh dashboard when audit_logs get new entries
  useSupabaseRealtime({
    table: 'audit_logs',
    onInsert: () => {
      setRtActive(true);
      fetchStats(); // Auto-refresh stats on any grade change
    }
  });

  // Real-time: refresh when nilai is updated
  useSupabaseRealtime({
    table: 'nilai',
    onInsert: () => { setRtActive(true); fetchStats(); },
    onUpdate: () => { setRtActive(true); fetchStats(); }
  });

  const statCards = [
    { title: "Total Mahasiswa", value: stats.totalMahasiswa.toString(), icon: UserGroupIcon, color: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-400", border: "border-blue-500/20" },
    { title: "Mata Kuliah Aktif", value: stats.totalMk.toString(), icon: DocumentChartBarIcon, color: "from-indigo-500/20 to-indigo-600/10", iconColor: "text-indigo-400", border: "border-indigo-500/20" },
    { title: "Sanggahan Aktif", value: "0", icon: ExclamationCircleIcon, color: "from-amber-500/20 to-amber-600/10", iconColor: "text-amber-400", border: "border-amber-500/20" },
    { title: "Rata-rata Nilai A", value: `${stats.rataA}%`, icon: ArrowTrendingUpIcon, color: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-400", border: "border-emerald-500/20" },
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
    <div className="space-y-8" ref={cardsRef}>
      <motion.div 
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        className="flex justify-between items-end"
      >
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
           <p className="text-gray-400 mt-1 flex items-center gap-2">
             Ringkasan aktivitas akademik Anda semester ini.
             {rtActive && (
               <span className="flex items-center gap-1 text-emerald-400 text-xs">
                 <SignalIcon className="w-3 h-3 animate-pulse" /> Live
               </span>
             )}
           </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2 group"
        >
           Unduh Laporan <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} whileHover={{ y: -5 }} className={`stat-card relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.border} p-6 backdrop-blur-sm cursor-pointer`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {loading ? <span className="w-12 h-8 bg-white/10 rounded animate-pulse inline-block"></span> : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-white/5 ${stat.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 bg-[#0d0d0d] border border-white/5 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Distribusi Nilai (Semester Ganjil)</h3>
          <div className="h-64 flex items-end justify-between gap-4 pt-4 border-b border-white/10 pb-4 relative">
             <AnimatePresence>
               {showBars && chartData.map((bar, i) => {
                 const pct = maxHt > 0 ? (bar.ht / maxHt) * 100 : 0;
                 return (
                   <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${Math.max(pct, 2)}%` }}
                       transition={{ type: "spring", bounce: 0.4, duration: 1, delay: i * 0.05 }}
                       className={`w-full rounded-t-lg transition-colors duration-300 cursor-pointer relative
                         ${bar.highlight ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/10 group-hover:bg-white/20'}
                       `}
                     >
                       <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         {bar.ht}
                       </span>
                     </motion.div>
                     <span className="mt-4 text-sm text-gray-400 font-medium">{bar.label}</span>
                   </div>
                 );
               })}
             </AnimatePresence>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Aktivitas Terakhir</h3>
          <div className="flex-1 flex flex-col gap-6">
            {recentActivities.map((act, i) => (
              <motion.div key={i} whileHover={{ x: 5 }} className="flex gap-4 group cursor-pointer">
                <div className="relative flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all z-10"></div>
                  {i !== recentActivities.length - 1 && (
                    <div className="w-px h-full border-l-2 border-dashed border-white/10 absolute top-3"></div>
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-medium text-gray-200">{act.action}</p>
                  <p className="text-xs text-indigo-400 mt-1">{act.course}</p>
                  <p className="text-xs text-gray-500 mt-1">{act.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.button whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }} className="w-full mt-6 py-2 border border-white/10 rounded-lg text-sm text-gray-400 transition-colors">
            Lihat Semua Audit Trail
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
