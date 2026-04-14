"use client";

import { useEffect, useState } from "react";
import { getNilaiMahasiswa } from "@/app/actions/db";

export default function MahasiswaDashboardOverview() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nim, setNim] = useState("");

  useEffect(() => {
    const storedNim = localStorage.getItem('evalora_mhs_nim');
      
    if (storedNim) {
      setNim(storedNim);
      fetchGrades(storedNim);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchGrades = async (studentNim: string) => {
    setLoading(true);
    const { data } = await getNilaiMahasiswa(studentNim);
    if (data) {
      setGrades(data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Transkrip & Nilai</h1>
        <p className="text-slate-500 mt-1">NIM: {nim || "Memuat..."}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         {loading ? (
            <div className="p-12 flex justify-center items-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary/40">progress_activity</span>
            </div>
          ) : grades.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
               <p>Belum ada data mata kuliah yang terdaftar untuk NIM Anda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                    <th className="font-semibold py-4 px-6 rounded-tl-xl whitespace-nowrap">Mata Kuliah</th>
                    <th className="font-semibold py-4 px-6 whitespace-nowrap">Dosen Pengampu</th>
                    <th className="font-semibold py-4 px-6 whitespace-nowrap text-right">Tugas</th>
                    <th className="font-semibold py-4 px-6 whitespace-nowrap text-right">UTS</th>
                    <th className="font-semibold py-4 px-6 whitespace-nowrap text-right">UAS</th>
                    <th className="font-semibold py-4 px-6 whitespace-nowrap text-right">Nilai Akhir</th>
                    <th className="font-semibold py-4 px-6 rounded-tr-xl whitespace-nowrap text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                       <td className="py-4 px-6">
                         <div className="font-medium text-slate-800">{item.nama_mk}</div>
                         <div className="text-xs text-slate-500 mt-0.5">{item.mk_id}</div>
                       </td>
                       <td className="py-4 px-6">
                         <span className="text-slate-700 text-sm bg-slate-100 px-2.5 py-1 rounded-md">{item.dosen}</span>
                       </td>
                       <td className="py-4 px-6 text-right text-slate-700 font-medium">
                         {item.nilai?.nilai_tugas_avg !== undefined && item.nilai?.nilai_tugas_avg !== null ? Number(item.nilai.nilai_tugas_avg).toFixed(1) : '-'}
                         <span className="text-[10px] text-slate-400 block font-normal">bobot {item.bobot?.tugas}%</span>
                       </td>
                       <td className="py-4 px-6 text-right text-slate-700 font-medium">
                         {item.nilai?.nilai_uts !== undefined && item.nilai?.nilai_uts !== null ? Number(item.nilai.nilai_uts).toFixed(1) : '-'}
                         <span className="text-[10px] text-slate-400 block font-normal">bobot {item.bobot?.uts}%</span>
                       </td>
                       <td className="py-4 px-6 text-right text-slate-700 font-medium">
                         {item.nilai?.nilai_uas !== undefined && item.nilai?.nilai_uas !== null ? Number(item.nilai.nilai_uas).toFixed(1) : '-'}
                         <span className="text-[10px] text-slate-400 block font-normal">bobot {item.bobot?.uas}%</span>
                       </td>
                       <td className="py-4 px-6 text-right">
                          <span className={`font-semibold ${item.nilai?.nilai_akhir ? 'text-slate-800' : 'text-slate-400'}`}>
                            {item.nilai?.nilai_akhir !== undefined && item.nilai?.nilai_akhir !== null ? Number(item.nilai.nilai_akhir).toFixed(2) : 'Belum dinilai'}
                          </span>
                       </td>
                       <td className="py-4 px-6 text-center">
                          {item.nilai?.nilai_huruf ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-sm ${
                              ['A','B'].includes(item.nilai.nilai_huruf) ? 'bg-emerald-100 text-emerald-700' :
                              item.nilai.nilai_huruf === 'C' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {item.nilai.nilai_huruf}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
