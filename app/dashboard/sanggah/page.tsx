"use client";

import { useState } from "react";

export default function SanggahPage() {
  const [sanggahanList] = useState([
    { id: 1, nim: '19230045', nama: 'Budi Santoso', course: 'Kecerdasan Buatan', date: '2025-06-15 10:30', status: 'pending', reason: 'Nilai UAS kosong padahal saya hadir dan mengumpulkan.', proof: 'bukti_kehadiran.pdf' },
    { id: 2, nim: '19230012', nama: 'Siti Aminah', course: 'Rekayasa Perangkat Lunak', date: '2025-06-14 14:20', status: 'approved', reason: 'Salah input nilai tugas 3, seharusnya 90 tapi diinput 9.', proof: 'tugas3_rev.pdf' },
    { id: 3, nim: '19230088', nama: 'Ahmad Faisal', course: 'Pemrograman Web', date: '2025-06-12 09:15', status: 'rejected', reason: 'Ingin mengulang ujian karena sakit, tapi tidak ada surat dokter.', proof: null },
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
         <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Manajemen Sanggah Nilai</h1>
         <p className="text-slate-500 mt-1 text-sm">Tinjau dan respon pengajuan perbaikan nilai oleh mahasiswa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 mt-6">
         <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <span className="material-symbols-outlined text-[28px]">schedule</span>
            </div>
            <div>
               <p className="text-sm font-medium text-slate-500">Menunggu Review</p>
               <p className="text-2xl font-bold text-slate-800 tabular-nums">1</p>
            </div>
         </div>
         <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <div>
               <p className="text-sm font-medium text-slate-500">Disetujui</p>
               <p className="text-2xl font-bold text-slate-800 tabular-nums">1</p>
            </div>
         </div>
         <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                <span className="material-symbols-outlined text-[28px]">cancel</span>
            </div>
            <div>
               <p className="text-sm font-medium text-slate-500">Ditolak</p>
               <p className="text-2xl font-bold text-slate-800 tabular-nums">1</p>
            </div>
         </div>
      </div>

      <div className="space-y-4">
        {sanggahanList.map((item) => (
          <div 
            key={item.id} 
            className="bg-white border border-slate-200 rounded-xl p-6 transition-all hover:shadow-md group flex flex-col md:flex-row gap-6 shadow-sm"
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800">{item.nama} <span className="text-slate-500 text-sm font-normal">({item.nim})</span></h3>
                <span className={`px-2.5 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider
                  ${item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}
                  ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ''}
                  ${item.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                `}>
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-primary font-medium">{item.course}</p>
              
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border-l-4 border-primary/60 text-slate-700 italic">
                 <p className="text-sm leading-relaxed">"{item.reason}"</p>
              </div>
              
              {item.proof && (
                 <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium cursor-pointer hover:underline w-fit">
                    <span className="material-symbols-outlined text-[18px]">attachment</span>
                    Lihat Lampiran Bukti ({item.proof})
                 </div>
              )}
            </div>

            <div className="flex flex-row md:flex-col justify-center items-center md:items-end gap-3 md:border-l border-slate-100 md:pl-6 shrink-0">
               <span className="text-xs font-medium text-slate-400 hidden md:flex items-center gap-1.5 mb-auto">
                 <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                 {item.date}
               </span>
               {item.status === 'pending' ? (
                 <>
                   <button 
                     className="flex-1 md:flex-none w-full px-5 py-2 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-sm transition-colors shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                   >
                     Setujui
                   </button>
                   <button 
                     className="flex-1 md:flex-none w-full px-5 py-2 min-w-[140px] border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-md text-sm transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                   >
                     Tolak
                   </button>
                 </>
               ) : (
                 <button 
                   className="w-full px-5 py-2 min-w-[140px] border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium rounded-md text-sm transition-colors mt-auto"
                 >
                     Lihat Detail
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
