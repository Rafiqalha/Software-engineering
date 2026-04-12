"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DocumentCheckIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  ExclamationCircleIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  SignalIcon,
  BookOpenIcon
} from "@heroicons/react/24/outline";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";

// ================================================================
// Pure function — lives outside component so it never causes
// a dependency-chain re-render.  bobot is passed as a parameter.
// ================================================================
function calcGradeResult(
  tugasValues: number[],
  uts: number,
  uas: number,
  bobot: { tugas: number; uts: number; uas: number }
) {
  const tugasAvg =
    tugasValues.length > 0
      ? tugasValues.reduce((sum, v) => sum + v, 0) / tugasValues.length
      : 0;

  const na = Math.min(
    tugasAvg * (bobot.tugas / 100) +
      uts * (bobot.uts / 100) +
      uas * (bobot.uas / 100),
    100
  );

  let huruf = 'E';
  if (na >= 85) huruf = 'A';
  else if (na >= 80) huruf = 'B+';
  else if (na >= 75) huruf = 'B';
  else if (na >= 70) huruf = 'C+';
  else if (na >= 61) huruf = 'C';
  else if (na >= 50) huruf = 'D';

  return {
    tugasAvg: parseFloat(tugasAvg.toFixed(2)),
    na: parseFloat(na.toFixed(2)),
    huruf,
  };
}


interface MataKuliah {
  mk_id: number;
  kode_mk: string;
  nama_mk: string;
  bobot_tugas: number;
  bobot_uts: number;
  bobot_uas: number;
  jumlah_tugas: number;
}

interface GradeRecord {
  id: number;
  nim: string;
  name: string;
  tugasValues: number[];
  tugasAvg: number;
  uts: number;
  uas: number;
  na: number;
  huruf: string;
  nilaiId?: number | null;
  isDirty?: boolean;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [jumlahTugas, setJumlahTugas] = useState(4);
  const [bobot, setBobot] = useState({ tugas: 30, uts: 30, uas: 40 });
  
  // Multi-tenant: MK selector
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
  const [activeMkId, setActiveMkId] = useState<number | null>(null);
  
  // Real-time indicator
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState<string | null>(null);
  
  // Grid State
  const [focusedCell, setFocusedCell] = useState<{row: number, col: string} | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ================================
  // BUSINESS LOGIC — uses pure fn above
  // Use a ref for bobot so fetchGrades never
  // needs bobot in its dependency array
  // ================================
  const bobotRef = useRef(bobot);
  useEffect(() => { bobotRef.current = bobot; }, [bobot]);

  const calculateGrades = useCallback(
    (tugasValues: number[], uts: number, uas: number) =>
      calcGradeResult(tugasValues, uts, uas, bobotRef.current),
    [] // stable — reads bobot via ref, not state
  );

  // ================================
  // EDITABLE COLUMNS
  // ================================

  const getEditableCols = useCallback((): string[] => {
    const cols: string[] = [];
    for (let i = 0; i < jumlahTugas; i++) cols.push(`tugas_${i}`);
    cols.push('uts', 'uas');
    return cols;
  }, [jumlahTugas]);

  // ================================
  // FETCH DATA (multi-tenant)
  // ================================

  const fetchGrades = useCallback(async (mkId?: number) => {
    setLoading(true);
    try {
      const url = mkId ? `/api/grades?mk_id=${mkId}` : '/api/grades';
      const res = await fetch(url);
      const data = await res.json();

      // Read bobot from response before calling setBobot so we can
      // compute grades immediately using the correct weights without
      // waiting for the state update (and triggering another render).
      const newBobot = data.bobot || { tugas: 30, uts: 30, uas: 40 };
      bobotRef.current = newBobot;     // sync ref first
      setBobot(newBobot);              // then update state for display

      setMataKuliahList(data.mataKuliah || []);
      setActiveMkId(data.activeMkId || null);
      setJumlahTugas(data.jumlahTugas || 4);

      const processed: GradeRecord[] = (data.grades || []).map((d: any) => {
        const tv = d.tugasValues || [];
        const calc = calcGradeResult(tv, d.uts || 0, d.uas || 0, newBobot);
        return { ...d, tugasValues: tv, ...calc };
      });
      setGrades(processed);

      setTimeout(() => {
        gsap.from(".grid-row", {
          y: 20, opacity: 0, duration: 0.4, stagger: 0.05, ease: "power2.out"
        });
      }, 100);
    } catch (err) {
      console.error('Failed to fetch grades:', err);
    } finally {
      setLoading(false);
    }
  }, []); // stable — no state deps, uses refs

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  // ================================
  // SUPABASE REAL-TIME SUBSCRIPTIONS
  // ================================

  // Listen to nilai_tugas changes for this MK
  useSupabaseRealtime({
    table: 'nilai_tugas',
    filter: activeMkId ? `mk_id=eq.${activeMkId}` : undefined,
    enabled: !!activeMkId,
    onInsert: (payload) => {
      setRealtimeConnected(true);
      setLastRealtimeEvent(`Tugas baru: ${new Date().toLocaleTimeString()}`);
      fetchGrades(activeMkId || undefined);
    },
    onUpdate: (payload) => {
      setRealtimeConnected(true);
      setLastRealtimeEvent(`Update tugas: ${new Date().toLocaleTimeString()}`);
      // Update in-place without full refetch if possible
      const updated = payload.new;
      setGrades(prev => {
        const newGrades = [...prev];
        const idx = newGrades.findIndex(g => g.id === updated.mahasiswa_id);
        if (idx >= 0 && updated.tugas_ke >= 1) {
          const record = { ...newGrades[idx] };
          record.tugasValues = [...record.tugasValues];
          record.tugasValues[updated.tugas_ke - 1] = parseFloat(updated.nilai) || 0;
          const calc = calculateGrades(record.tugasValues, record.uts, record.uas);
          newGrades[idx] = { ...record, ...calc };
        }
        return newGrades;
      });
    }
  });

  // Listen to nilai (UTS/UAS/NA) changes
  useSupabaseRealtime({
    table: 'nilai',
    filter: activeMkId ? `mk_id=eq.${activeMkId}` : undefined,
    enabled: !!activeMkId,
    onUpdate: (payload) => {
      setRealtimeConnected(true);
      setLastRealtimeEvent(`Update nilai: ${new Date().toLocaleTimeString()}`);
      const updated = payload.new;
      setGrades(prev => {
        const newGrades = [...prev];
        const idx = newGrades.findIndex(g => g.id === updated.mahasiswa_id);
        if (idx >= 0) {
          const record = { ...newGrades[idx] };
          record.uts = parseFloat(updated.nilai_uts) || 0;
          record.uas = parseFloat(updated.nilai_uas) || 0;
          record.na = parseFloat(updated.nilai_akhir) || 0;
          record.huruf = updated.nilai_huruf || 'E';
          newGrades[idx] = record;
        }
        return newGrades;
      });
    }
  });

  // ================================
  // FOCUS & EDIT
  // ================================

  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editMode]);

  const getCellValue = (record: GradeRecord, col: string): number => {
    if (col === 'uts') return record.uts;
    if (col === 'uas') return record.uas;
    if (col.startsWith('tugas_')) {
      const idx = parseInt(col.split('_')[1]);
      return record.tugasValues[idx] ?? 0;
    }
    return 0;
  };

  const saveCellChange = (valStr: string) => {
    if (!focusedCell) return;
    let val = parseFloat(valStr);
    if (isNaN(val)) val = 0;
    if (val > 100) val = 100;
    if (val < 0) val = 0;
  
    const { row, col } = focusedCell;
    const newData = [...grades];
    const record = { ...newData[row] };

    if (col === 'uts') record.uts = val;
    else if (col === 'uas') record.uas = val;
    else if (col.startsWith('tugas_')) {
      const idx = parseInt(col.split('_')[1]);
      record.tugasValues = [...record.tugasValues];
      record.tugasValues[idx] = val;
    }

    const calc = calculateGrades(record.tugasValues, record.uts, record.uas);
    newData[row] = { ...record, ...calc, isDirty: true };
    setGrades(newData);
    setEditMode(false);
  };

  // ================================
  // KEYBOARD NAV
  // ================================

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!focusedCell) return;
    const { row, col } = focusedCell;
    const editableCols = getEditableCols();
    const colIndex = editableCols.indexOf(col);

    if (editMode) {
      if (e.key === 'Enter') {
        saveCellChange(editValue);
        if (row < grades.length - 1) setFocusedCell({ row: row + 1, col });
        else { setEditMode(false); setFocusedCell(null); }
      } else if (e.key === 'Escape') setEditMode(false);
      return;
    }

    if (e.key === 'F2' || e.key === 'Enter') {
      e.preventDefault();
      setEditMode(true);
      setEditValue(String(getCellValue(grades[row], col)));
      return;
    }

    switch (e.key) {
      case 'ArrowUp': e.preventDefault(); if (row > 0) setFocusedCell({ row: row - 1, col }); break;
      case 'ArrowDown': e.preventDefault(); if (row < grades.length - 1) setFocusedCell({ row: row + 1, col }); break;
      case 'ArrowLeft': e.preventDefault(); if (colIndex > 0) setFocusedCell({ row, col: editableCols[colIndex - 1] }); break;
      case 'ArrowRight': e.preventDefault(); if (colIndex < editableCols.length - 1) setFocusedCell({ row, col: editableCols[colIndex + 1] }); break;
    }
  }, [focusedCell, editMode, editValue, grades, getEditableCols]);

  // ================================
  // SAVE TO SUPABASE
  // ================================

  const saveAll = async () => {
    const dirty = grades.filter(g => g.isDirty);
    if (dirty.length === 0) return;
    setSaving(true);
    gsap.to(".save-icon", { rotation: 360, duration: 1, ease: "linear", repeat: -1 });
    
    try {
      await fetch('/api/grades', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mkId: activeMkId,
          updates: dirty.map(d => ({
            id: d.id,
            tugasValues: d.tugasValues,
            uts: d.uts,
            uas: d.uas
          }))
        })
      });
      setGrades(grades.map(g => ({ ...g, isDirty: false })));
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      gsap.killTweensOf(".save-icon");
      gsap.set(".save-icon", { rotation: 0 });
      setSaving(false);
    }
  };

  // ================================
  // ADD / REMOVE TUGAS
  // ================================

  const addTugasColumn = () => {
    const newJt = jumlahTugas + 1;
    setJumlahTugas(newJt);
    setGrades(prev => prev.map(g => {
      const newTv = [...g.tugasValues, 0];
      const calc = calculateGrades(newTv, g.uts, g.uas);
      return { ...g, tugasValues: newTv, ...calc, isDirty: true };
    }));
  };

  const removeTugasColumn = () => {
    if (jumlahTugas <= 1) return;
    const newJt = jumlahTugas - 1;
    setJumlahTugas(newJt);
    setGrades(prev => prev.map(g => {
      const newTv = g.tugasValues.slice(0, newJt);
      const calc = calculateGrades(newTv, g.uts, g.uas);
      return { ...g, tugasValues: newTv, ...calc, isDirty: true };
    }));
  };

  const handleCellClick = (rowIndex: number, colName: string) => {
    setFocusedCell({ row: rowIndex, col: colName });
    setEditMode(false);
  };

  // ================================
  // RENDER
  // ================================

  const wTugas = bobot.tugas;
  const wUts = bobot.uts;
  const wUas = bobot.uas;

  return (
    <div className="space-y-5 relative" ref={containerRef} onKeyDown={handleKeyDown} tabIndex={0} style={{ outline: 'none' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Input Nilai</h1>
           <p className="text-gray-400 mt-1">Masukkan nilai per tugas. Rata-rata dihitung otomatis oleh sistem.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition flex items-center gap-2">
             <ArrowUpTrayIcon className="w-4 h-4" /> Import
           </motion.button>
           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition flex items-center gap-2">
             <ArrowDownTrayIcon className="w-4 h-4" /> Export
           </motion.button>
           <motion.button 
             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
             onClick={saveAll} disabled={!grades.some(g => g.isDirty) || saving}
             className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg
              ${grades.some(g => g.isDirty) ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'}
             `}
           >
             <DocumentCheckIcon className="w-4 h-4 save-icon" /> {saving ? 'Menyimpan...' : 'Simpan'} {grades.some(g => g.isDirty) && "*"}
           </motion.button>
        </div>
      </motion.div>

      {/* MK Selector + Tugas Controls + RT Status */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
        
        {/* Mata Kuliah Selector */}
        <div className="flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-indigo-400" />
          <select 
            value={activeMkId || ''} 
            onChange={(e) => { 
              const id = parseInt(e.target.value); 
              setActiveMkId(id); 
              fetchGrades(id); 
            }}
            className="bg-white/10 border border-white/10 rounded-lg text-sm text-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {mataKuliahList.map(mk => (
              <option key={mk.mk_id} value={mk.mk_id} className="bg-[#1a1a1a]">
                {mk.kode_mk} — {mk.nama_mk}
              </option>
            ))}
            {mataKuliahList.length === 0 && <option className="bg-[#1a1a1a]">Demo Mode</option>}
          </select>
        </div>

        <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

        {/* Jumlah Tugas */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Jumlah Tugas:</span>
          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={removeTugasColumn} disabled={jumlahTugas <= 1} className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed"><MinusCircleIcon className="w-5 h-5" /></motion.button>
          <motion.span key={jumlahTugas} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-white font-bold text-lg w-6 text-center">{jumlahTugas}</motion.span>
          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={addTugasColumn} className="text-emerald-400 hover:text-emerald-300"><PlusCircleIcon className="w-5 h-5" /></motion.button>
        </div>

        <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

        {/* Bobot Display */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Bobot: T={wTugas}% | UTS={wUts}% | UAS={wUas}%</span>
        </div>

        {/* Real-time status */}
        <div className="ml-auto flex items-center gap-2">
          <SignalIcon className={`w-4 h-4 ${realtimeConnected ? 'text-emerald-400 animate-pulse' : 'text-gray-600'}`} />
          <span className="text-xs text-gray-500">
            {realtimeConnected ? 'Real-time aktif' : 'Menunggu koneksi...'}
          </span>
        </div>
      </motion.div>

      {/* Data Grid */}
      <div className="bg-[#0f0f11] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5">
                <th className="p-3 font-semibold w-12 text-center sticky left-0 bg-[#0f0f11] z-20">No</th>
                <th className="p-3 font-semibold w-28 sticky left-12 bg-[#0f0f11] z-20">NIM</th>
                <th className="p-3 font-semibold w-40 sticky left-[7rem] bg-[#0f0f11] z-20">Nama</th>
                
                {Array.from({ length: jumlahTugas }).map((_, i) => (
                  <th key={`th_t${i}`} className="p-3 font-semibold w-[72px] text-center">
                    <span className="text-indigo-400">T{i + 1}</span>
                  </th>
                ))}

                <th className="p-3 font-semibold w-20 text-center bg-indigo-500/10">
                  <span className="text-indigo-300">Rata²</span>
                  <div className="text-[9px] text-indigo-400/60 mt-0.5">{wTugas}%</div>
                </th>
                <th className="p-3 font-semibold w-[72px] text-center">
                  UTS
                  <div className="text-[9px] text-gray-500 mt-0.5">{wUts}%</div>
                </th>
                <th className="p-3 font-semibold w-[72px] text-center">
                  UAS
                  <div className="text-[9px] text-gray-500 mt-0.5">{wUas}%</div>
                </th>
                <th className="p-3 font-semibold w-16 text-center">NA</th>
                <th className="p-3 font-semibold w-16 text-center">Huruf</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={jumlahTugas + 7} className="p-8 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent mx-auto rounded-full animate-spin"></div>
                    <p className="mt-2">Memuat data dari Supabase...</p>
                  </td>
                </tr>
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan={jumlahTugas + 7} className="p-12 text-center text-gray-500">
                    <BookOpenIcon className="w-12 h-12 mx-auto text-gray-700 mb-4" />
                    <p className="text-lg font-medium text-gray-400">Belum ada data mahasiswa</p>
                    <p className="text-sm mt-1">Tambahkan mahasiswa ke mata kuliah ini melalui Supabase Dashboard.</p>
                  </td>
                </tr>
              ) : grades.map((row, rowIndex) => (
                <tr key={row.id} className="grid-row border-b border-white/5 hover:bg-white/[0.02] transition-colors relative">
                  <td className="p-3 text-center text-gray-500 sticky left-0 bg-[#0f0f11] z-10">{rowIndex + 1}</td>
                  <td className="p-3 font-medium text-gray-300 sticky left-12 bg-[#0f0f11] z-10">{row.nim}</td>
                  <td className="p-3 text-gray-200 sticky left-[7rem] bg-[#0f0f11] z-10">
                     {row.name}
                     <AnimatePresence>
                       {row.isDirty && (
                         <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block w-2 h-2 ml-2 rounded-full bg-indigo-500" />
                       )}
                     </AnimatePresence>
                  </td>
                  
                  {/* INDIVIDUAL TUGAS CELLS */}
                  {row.tugasValues.map((tv, tIdx) => {
                    const colKey = `tugas_${tIdx}`;
                    const isFocused = focusedCell?.row === rowIndex && focusedCell?.col === colKey;
                    const isInvalid = tv < 0 || tv > 100;
                    
                    return (
                      <td key={colKey} className={`p-0 relative font-medium w-[72px] h-12 ${isInvalid && !isFocused ? 'text-red-400 bg-red-500/10' : ''}`}
                        onClick={() => handleCellClick(rowIndex, colKey)}
                        onDoubleClick={() => { setFocusedCell({ row: rowIndex, col: colKey }); setEditMode(true); setEditValue(String(tv)); }}
                      >
                        {isFocused && <motion.div layoutId="focusOutline" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} className="absolute inset-0 border-2 border-indigo-500 bg-indigo-500/10 z-10 pointer-events-none" />}
                        {isFocused && editMode ? (
                          <input ref={inputRef} className="absolute inset-0 w-full h-full text-center bg-indigo-950 text-white outline-none z-20 font-bold" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveCellChange(editValue)} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center cursor-cell z-0 pointer-events-none">{tv}</div>
                        )}
                      </td>
                    );
                  })}

                  {/* RATA-RATA (read-only) */}
                  <td className="p-3 text-center font-semibold bg-indigo-500/5">
                    <motion.span key={row.tugasAvg} initial={{ scale: 1.2, color: "#818cf8" }} animate={{ scale: 1, color: "#a5b4fc" }}>
                      {row.tugasAvg}
                    </motion.span>
                  </td>

                  {/* UTS & UAS */}
                  {['uts', 'uas'].map((colKey) => {
                    const isFocused = focusedCell?.row === rowIndex && focusedCell?.col === colKey;
                    const valNum = colKey === 'uts' ? row.uts : row.uas;
                    const isInvalid = valNum < 0 || valNum > 100;
                    return (
                      <td key={colKey} className={`p-0 relative font-medium w-[72px] h-12 ${isInvalid && !isFocused ? 'text-red-400 bg-red-500/10' : ''}`}
                        onClick={() => handleCellClick(rowIndex, colKey)}
                        onDoubleClick={() => { setFocusedCell({ row: rowIndex, col: colKey }); setEditMode(true); setEditValue(String(valNum)); }}
                      >
                        {isFocused && <motion.div layoutId="focusOutline" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} className="absolute inset-0 border-2 border-indigo-500 bg-indigo-500/10 z-10 pointer-events-none" />}
                        {isFocused && editMode ? (
                          <input ref={inputRef} className="absolute inset-0 w-full h-full text-center bg-indigo-950 text-white outline-none z-20 font-bold" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveCellChange(editValue)} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center cursor-cell z-0 pointer-events-none">{valNum}</div>
                        )}
                      </td>
                    );
                  })}

                  {/* NA */}
                  <td className="p-3 text-center font-bold text-indigo-400">
                    <motion.div key={row.na} initial={{ scale: 1.5, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}>
                      {row.na}
                      {row.na === 100 && <span title="Capped to 100"><ExclamationCircleIcon className="inline w-4 h-4 ml-1 text-yellow-500" /></span>}
                    </motion.div>
                  </td>
                  
                  {/* HURUF */}
                  <td className="p-3 text-center font-bold text-white text-lg drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    <motion.div key={row.huruf} initial={{ scale: 1.5, color: "#a5b4fc" }} animate={{ scale: 1, color: "#ffffff" }}>
                      {row.huruf}
                    </motion.div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-gray-500">
         <p>Menampilkan {grades.length} mahasiswa · {jumlahTugas} tugas</p>
         <div className="flex items-center gap-5">
           <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-md bg-indigo-500/20 border border-indigo-500 inline-block"></span> Sel Aktif</div>
           <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-md bg-indigo-500/10 border border-indigo-400/30 inline-block"></span> Rata² Auto</div>
           <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-md bg-red-500/20 border border-red-500 inline-block"></span> Tidak Valid</div>
           {lastRealtimeEvent && (
             <div className="flex items-center gap-2 text-emerald-400/70">
               <SignalIcon className="w-3 h-3" /> {lastRealtimeEvent}
             </div>
           )}
         </div>
      </div>
    </div>
  );
}
