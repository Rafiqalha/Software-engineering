"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion, Variants } from "framer-motion";
import { 
  ChatBubbleLeftRightIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  PaperClipIcon
} from "@heroicons/react/24/outline";

export default function SanggahPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [sanggahanList] = useState([
    { id: 1, nim: '19230045', nama: 'Budi Santoso', course: 'Kecerdasan Buatan', date: '2025-06-15 10:30', status: 'pending', reason: 'Nilai UAS kosong padahal saya hadir dan mengumpulkan.', proof: 'bukti_kehadiran.pdf' },
    { id: 2, nim: '19230012', nama: 'Siti Aminah', course: 'Rekayasa Perangkat Lunak', date: '2025-06-14 14:20', status: 'approved', reason: 'Salah input nilai tugas 3, seharusnya 90 tapi diinput 9.', proof: 'tugas3_rev.pdf' },
    { id: 3, nim: '19230088', nama: 'Ahmad Faisal', course: 'Pemrograman Web', date: '2025-06-12 09:15', status: 'rejected', reason: 'Ingin mengulang ujian karena sakit, tapi tidak ada surat dokter.', proof: null },
  ]);

  useEffect(() => {
    // GSAP used for outer structural staging
    const ctx = gsap.context(() => {
      gsap.from(".header-box", {
        y: -30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Framer Motion variants for cards
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants: Variants = {
    hidden: { x: -50, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="space-y-6 max-w-5xl" ref={containerRef}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
         <h1 className="text-3xl font-bold text-white tracking-tight">Manajemen Sanggah Nilai</h1>
         <p className="text-gray-400 mt-1">Tinjau dan respon pengajuan perbaikan nilai oleh mahasiswa.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
         <div className="header-box bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl"><ClockIcon className="w-6 h-6" /></div>
            <div>
               <p className="text-sm text-gray-400">Menunggu Review</p>
               <p className="text-2xl font-bold text-white">1</p>
            </div>
         </div>
         <div className="header-box bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl"><CheckCircleIcon className="w-6 h-6" /></div>
            <div>
               <p className="text-sm text-gray-400">Disetujui</p>
               <p className="text-2xl font-bold text-white">1</p>
            </div>
         </div>
         <div className="header-box bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-red-500/20 text-red-500 rounded-xl"><XCircleIcon className="w-6 h-6" /></div>
            <div>
               <p className="text-sm text-gray-400">Ditolak</p>
               <p className="text-2xl font-bold text-white">1</p>
            </div>
         </div>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="space-y-4"
      >
        {sanggahanList.map((item) => (
          <motion.div 
            key={item.id} 
            variants={cardVariants}
            className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6 transition-colors hover:border-white/10 group shadow-lg flex flex-col md:flex-row gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-200">{item.nama} <span className="text-gray-500 text-sm font-normal">({item.nim})</span></h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border
                  ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                  ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                  ${item.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                `}>
                  {item.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-indigo-400 font-medium">{item.course}</p>
              <div className="mt-4 p-4 bg-white/5 rounded-xl border-l-2 border-indigo-500">
                 <p className="text-sm text-gray-300">"{item.reason}"</p>
              </div>
              
              {item.proof && (
                 <div className="mt-4 flex items-center gap-2 text-sm text-blue-400 cursor-pointer hover:underline w-fit">
                    <PaperClipIcon className="w-4 h-4" /> Lihat Lampiran Bukti ({item.proof})
                 </div>
              )}
            </div>

            <div className="flex flex-row md:flex-col justify-center items-center md:items-end gap-3 md:border-l border-white/5 md:pl-6">
               <span className="text-xs text-gray-500 hidden md:block mb-auto">{item.date}</span>
               {item.status === 'pending' ? (
                 <>
                   <motion.button 
                     whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                     className="flex-1 md:flex-none w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors text-center shadow-lg shadow-emerald-900/20"
                   >
                     Setujui Berkas
                   </motion.button>
                   <motion.button 
                     whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                     className="flex-1 md:flex-none w-full px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors text-center"
                   >
                     Tolak
                   </motion.button>
                 </>
               ) : (
                 <motion.button 
                   whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                   className="w-full px-4 py-2 border border-white/10 text-gray-400 rounded-lg text-sm transition-colors text-center mt-auto"
                 >
                     Lihat Detail Riwayat
                 </motion.button>
               )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
