"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
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
  BookOpenIcon,
  PencilSquareIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import Modal from "@/components/ui/Modal";
import {
  FormField,
  SubmitButton,
  ErrorBanner,
  SuccessBanner,
  AvatarInitial,
} from "@/components/ui/FormField";
import { upsertNilai } from "@/app/actions/db";
import { createClient } from "@/utils/supabase/client";

// ================================================================
// Formula (tetap di frontend untuk preview live di popup)
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
  let huruf = "E";
  if (na >= 80) huruf = "A";
  else if (na >= 70) huruf = "B";
  else if (na >= 60) huruf = "C";
  else if (na >= 50) huruf = "D";
  return {
    tugasAvg: parseFloat(tugasAvg.toFixed(2)),
    na: parseFloat(na.toFixed(2)),
    huruf,
  };
}

interface MataKuliah {
  mk_id: string;
  nama_mk: string;
  bobot_tugas: number;
  bobot_uts: number;
  bobot_uas: number;
}

interface GradeRecord {
  nilai_id?: string;
  nim: string;
  nama: string;
  dosen_id?: string;
  tugasAvg: number;
  nilai_uts: number;
  nilai_uas: number;
  na: number;
  huruf: string;
  status_final?: string;
  isDirty?: boolean;
}

// ============================================================
// Komponen: Pop-up Input Nilai Premium per-mahasiswa
// ============================================================
function NilaiInputModal({
  isOpen,
  onClose,
  record,
  mk,
  dosenId,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  record: GradeRecord | null;
  mk: MataKuliah | null;
  dosenId: string;
  onSaved: () => void;
}) {
  const [tugasInput, setTugasInput] = useState("");
  const [uts, setUts] = useState(0);
  const [uas, setUas] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Komputasi live di popup
  const bobot = mk
    ? { tugas: Number(mk.bobot_tugas), uts: Number(mk.bobot_uts), uas: Number(mk.bobot_uas) }
    : { tugas: 30, uts: 30, uas: 40 };

  // Parsing tugas rata2 dari input textarea/comma
  const tugasValues = tugasInput
    .split(/[,\s]+/)
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v) && v >= 0 && v <= 100);

  const preview = calcGradeResult(tugasValues, uts, uas, bobot);

  useEffect(() => {
    if (record && isOpen) {
      setTugasInput(record.tugasAvg > 0 ? String(record.tugasAvg) : "");
      setUts(record.nilai_uts || 0);
      setUas(record.nilai_uas || 0);
      setError(null);
      setSuccess(null);
    }
  }, [record, isOpen]);

  const hurufColor: Record<string, string> = {
    A: "text-emerald-400",
    B: "text-indigo-400",
    C: "text-amber-400",
    D: "text-orange-400",
    E: "text-red-400",
  };

  const handleSave = () => {
    if (!record || !mk) return;
    setError(null);
    startTransition(async () => {
      const res = await upsertNilai({
        nilai_id: record.nilai_id,
        nim: record.nim,
        mk_id: mk.mk_id,
        dosen_id: dosenId,
        nilai_tugas_avg: preview.tugasAvg,
        nilai_uts: uts,
        nilai_uas: uas,
        status_final: "DRAFT",
      });
      if (res.success) {
        setSuccess("Nilai berhasil disimpan! Database ter-update.");
        onSaved();
        setTimeout(onClose, 1400);
      } else {
        setError(res.error ?? "Gagal menyimpan.");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Nilai Mahasiswa"
      subtitle={record?.nama ?? ""}
      size="md"
      icon={<PencilSquareIcon className="w-5 h-5 text-white" />}
      accentColor="from-indigo-500 to-violet-600"
    >
      {record && mk && (
        <div className="space-y-5">
          {/* Profile */}
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/[0.07]">
            <AvatarInitial name={record.nama} size={52} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-base truncate">{record.nama}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{record.nim}</p>
              <p className="text-xs text-indigo-400 mt-1 truncate">{mk.nama_mk}</p>
            </div>
            {/* Nilai sekarang */}
            {record.huruf && (
              <div className="text-right flex-shrink-0">
                <p className={`text-3xl font-black ${hurufColor[record.huruf] ?? "text-gray-400"}`}>
                  {record.huruf}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">Nilai saat ini</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">
                Nilai Tugas (pisahkan dengan koma)
              </label>
              <textarea
                value={tugasInput}
                onChange={(e) => setTugasInput(e.target.value)}
                placeholder="Contoh: 85, 90, 78, 92"
                rows={2}
                className="w-full py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm transition-all duration-200 outline-none resize-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
              />
              <p className="text-xs text-gray-600 mt-1">
                {tugasValues.length} nilai tugas · rata-rata: <span className="text-indigo-400 font-mono">{preview.tugasAvg}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">UTS</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={uts}
                  onChange={(e) => setUts(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-center font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">UAS</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={uas}
                  onChange={(e) => setUas(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 text-center font-bold tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <motion.div
            animate={{
              borderColor: preview.huruf === "A"
                ? "rgba(16,185,129,0.4)"
                : preview.huruf === "E"
                ? "rgba(239,68,68,0.4)"
                : "rgba(99,102,241,0.4)",
            }}
            className="rounded-2xl border bg-white/[0.03] p-4"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Pratinjau Nilai Akhir</p>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Tugas ({bobot.tugas}%)</span>
                  <span className="text-white font-mono">{preview.tugasAvg} → {(preview.tugasAvg * bobot.tugas / 100).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>UTS ({bobot.uts}%)</span>
                  <span className="text-white font-mono">{uts} → {(uts * bobot.uts / 100).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>UAS ({bobot.uas}%)</span>
                  <span className="text-white font-mono">{uas} → {(uas * bobot.uas / 100).toFixed(1)}</span>
                </div>
              </div>
              <div className="text-right">
                <motion.p
                  key={preview.huruf}
                  initial={{ scale: 1.4, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-5xl font-black ${hurufColor[preview.huruf] ?? "text-gray-400"}`}
                >
                  {preview.huruf}
                </motion.p>
                <motion.p
                  key={preview.na}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-bold text-white mt-0.5 tabular-nums"
                >
                  {preview.na}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          <SubmitButton
            loading={isPending}
            label="Simpan & Perbarui DB"
            loadingLabel="Menyimpan ke Supabase..."
            onClick={handleSave}
          />
        </div>
      )}
    </Modal>
  );
}

// ================================================================
// Main: GradesPage
// ================================================================
export default function GradesPage() {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
  const [activeMk, setActiveMk] = useState<MataKuliah | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState<string | null>(null);
  const [dosenId, setDosenId] = useState("");

  // Modal state
  const [modalRecord, setModalRecord] = useState<GradeRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Ambil dosenId dari localStorage (set saat login)
  useEffect(() => {
    const id = localStorage.getItem("evalora_dosen_id") || "";
    setDosenId(id);
  }, []);

  // ============================
  // FETCH dari Supabase langsung
  // ============================
  const fetchMataKuliah = useCallback(async () => {
    const { data } = await supabase
      .from("mata_kuliah")
      .select("mk_id, nama_mk, bobot_tugas, bobot_uts, bobot_uas")
      .order("mk_id");
    setMataKuliahList(data || []);
    return data || [];
  }, []);

  const fetchGrades = useCallback(async (mk: MataKuliah) => {
    setLoading(true);
    try {
      const { data: pendaftaran } = await supabase
        .from("pendaftaran")
        .select(`
          nim,
          mahasiswa:nim ( nim, nama ),
          nilai:nim ( nilai_id, nilai_tugas_avg, nilai_uts, nilai_uas, nilai_akhir, nilai_huruf, status_final, dosen_id, mk_id )
        `)
        .eq("mk_id", mk.mk_id)
        .order("nim");

      const bobot = {
        tugas: Number(mk.bobot_tugas),
        uts: Number(mk.bobot_uts),
        uas: Number(mk.bobot_uas),
      };

      const processed: GradeRecord[] = (pendaftaran || []).map((row: any) => {
        const mhs = row.mahasiswa;
        // nilai adalah array, filter yang mk_id-nya cocok
        const nilaiRow = Array.isArray(row.nilai)
          ? row.nilai.find((n: any) => n.mk_id === mk.mk_id)
          : row.nilai;

        const tugasAvg = nilaiRow ? parseFloat(nilaiRow.nilai_tugas_avg) || 0 : 0;
        const nilai_uts = nilaiRow ? parseFloat(nilaiRow.nilai_uts) || 0 : 0;
        const nilai_uas = nilaiRow ? parseFloat(nilaiRow.nilai_uas) || 0 : 0;
        const na = nilaiRow ? parseFloat(nilaiRow.nilai_akhir) || 0 : 0;
        const huruf = nilaiRow?.nilai_huruf?.trim() || "-";

        return {
          nilai_id: nilaiRow?.nilai_id,
          nim: mhs?.nim || row.nim,
          nama: mhs?.nama || "—",
          dosen_id: nilaiRow?.dosen_id || "",
          tugasAvg,
          nilai_uts,
          nilai_uas,
          na,
          huruf,
          status_final: nilaiRow?.status_final || "DRAFT",
        };
      });

      setGrades(processed);

      setTimeout(() => {
        gsap.from(".grade-row", {
          y: 16,
          opacity: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: "power2.out",
        });
      }, 80);
    } catch (err) {
      console.error("fetchGrades error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMataKuliah().then((mks) => {
      if (mks.length > 0) {
        setActiveMk(mks[0]);
        fetchGrades(mks[0]);
      } else {
        setLoading(false);
      }
    });
  }, [fetchMataKuliah, fetchGrades]);

  // Realtime subscriptions
  useSupabaseRealtime({
    table: "nilai",
    filter: activeMk ? `mk_id=eq.${activeMk.mk_id}` : undefined,
    enabled: !!activeMk,
    onUpdate: () => {
      setRealtimeConnected(true);
      setLastRealtimeEvent(`Update: ${new Date().toLocaleTimeString()}`);
      if (activeMk) fetchGrades(activeMk);
    },
    onInsert: () => {
      setRealtimeConnected(true);
      if (activeMk) fetchGrades(activeMk);
    },
  });

  const hurufColor: Record<string, string> = {
    A: "text-emerald-400 bg-emerald-500/10",
    B: "text-indigo-400 bg-indigo-500/10",
    C: "text-amber-400 bg-amber-500/10",
    D: "text-orange-400 bg-orange-500/10",
    E: "text-red-400 bg-red-500/10",
    "-": "text-gray-600 bg-white/5",
  };

  return (
    <div className="space-y-5 relative" ref={containerRef}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Input Nilai</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Klik <span className="text-indigo-400">tombol pensil</span> di tiap baris untuk input nilai via pop-up.
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition flex items-center gap-2">
            <ArrowUpTrayIcon className="w-4 h-4" /> Import
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export
          </motion.button>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-3"
      >
        <div className="flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-indigo-400" />
          <select
            value={activeMk?.mk_id || ""}
            onChange={(e) => {
              const mk = mataKuliahList.find((m) => m.mk_id === e.target.value);
              if (mk) { setActiveMk(mk); fetchGrades(mk); }
            }}
            className="bg-white/10 border border-white/10 rounded-lg text-sm text-white px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {mataKuliahList.map((mk) => (
              <option key={mk.mk_id} value={mk.mk_id} className="bg-[#1a1a1a]">
                {mk.mk_id} — {mk.nama_mk}
              </option>
            ))}
            {mataKuliahList.length === 0 && (
              <option className="bg-[#1a1a1a]">Belum ada Mata Kuliah</option>
            )}
          </select>
        </div>

        {activeMk && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Bobot: T={activeMk.bobot_tugas}% | UTS={activeMk.bobot_uts}% | UAS={activeMk.bobot_uas}%</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <SignalIcon className={`w-4 h-4 ${realtimeConnected ? "text-emerald-400 animate-pulse" : "text-gray-600"}`} />
          <span className="text-xs text-gray-500">
            {realtimeConnected ? "Real-time aktif" : "Menunggu koneksi..."}
          </span>
        </div>
      </motion.div>

      {/* Table */}
      <div className="bg-[#0f0f11] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5">
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3 w-28">NIM</th>
                <th className="p-3">Mahasiswa</th>
                <th className="p-3 text-center w-20">Tugas Avg</th>
                <th className="p-3 text-center w-16">UTS</th>
                <th className="p-3 text-center w-16">UAS</th>
                <th className="p-3 text-center w-16">NA</th>
                <th className="p-3 text-center w-16">Huruf</th>
                <th className="p-3 text-center w-20">Status</th>
                <th className="p-3 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-3">Memuat dari Supabase...</p>
                  </td>
                </tr>
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
                    <BookOpenIcon className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                    <p className="text-gray-400 font-medium">Belum ada mahasiswa terdaftar</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Daftarkan mahasiswa ke mata kuliah ini di halaman{" "}
                      <span className="text-indigo-400">Master Mahasiswa</span>.
                    </p>
                  </td>
                </tr>
              ) : (
                grades.map((row, idx) => (
                  <tr
                    key={row.nim}
                    className="grade-row border-b border-white/5 hover:bg-white/[0.025] transition-colors group"
                  >
                    <td className="p-3 text-center text-gray-600">{idx + 1}</td>
                    <td className="p-3 font-mono text-gray-400 text-xs">{row.nim}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <AvatarInitial name={row.nama} size={30} />
                        <span className="text-gray-200 font-medium">{row.nama}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-indigo-400 font-semibold tabular-nums">
                      {row.tugasAvg || "—"}
                    </td>
                    <td className="p-3 text-center text-gray-300 tabular-nums">
                      {row.nilai_uts || "—"}
                    </td>
                    <td className="p-3 text-center text-gray-300 tabular-nums">
                      {row.nilai_uas || "—"}
                    </td>
                    <td className="p-3 text-center font-bold text-indigo-400 tabular-nums">
                      <motion.span key={row.na} initial={{ scale: 1.3, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}>
                        {row.na || "—"}
                      </motion.span>
                    </td>
                    <td className="p-3 text-center">
                      <motion.span
                        key={row.huruf}
                        initial={{ scale: 1.4, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black ${hurufColor[row.huruf] ?? hurufColor["-"]}`}
                      >
                        {row.huruf}
                      </motion.span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          row.status_final === "FINAL"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : row.status_final === "REVISI"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-white/5 text-gray-500"
                        }`}
                      >
                        {row.status_final || "DRAFT"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setModalRecord(row); setModalOpen(true); }}
                        className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/15 transition-colors"
                        title="Input Nilai"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <p>{grades.length} mahasiswa terdaftar</p>
        {lastRealtimeEvent && (
          <div className="flex items-center gap-2 text-emerald-400/70">
            <SignalIcon className="w-3 h-3" />
            {lastRealtimeEvent}
          </div>
        )}
      </div>

      {/* Modal Pop-up Input Nilai Premium */}
      <NilaiInputModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setModalRecord(null); }}
        record={modalRecord}
        mk={activeMk}
        dosenId={dosenId}
        onSaved={() => { if (activeMk) fetchGrades(activeMk); }}
      />
    </div>
  );
}
