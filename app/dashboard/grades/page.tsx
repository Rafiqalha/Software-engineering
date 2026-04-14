"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import Modal from "@/components/ui/Modal";
import {
  SubmitButton,
  ErrorBanner,
  SuccessBanner,
  AvatarInitial,
} from "@/components/ui/FormField";
import { upsertNilai } from "@/app/actions/db";
import { createClient } from "@/utils/supabase/client";

// ================================================================
// Formula
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
}

// ============================================================
// Komponen: Pop-up Input Nilai
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

  const bobot = mk
    ? { tugas: Number(mk.bobot_tugas), uts: Number(mk.bobot_uts), uas: Number(mk.bobot_uas) }
    : { tugas: 30, uts: 30, uas: 40 };

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
    A: "text-emerald-600",
    B: "text-indigo-600",
    C: "text-amber-600",
    D: "text-orange-600",
    E: "text-red-600",
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
        setSuccess("Nilai berhasil disimpan!");
        onSaved();
        setTimeout(onClose, 1000);
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
      icon="edit_square"
    >
      {record && mk && (
        <div className="space-y-5">
          {/* Profile */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <AvatarInitial name={record.nama} size={48} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-base truncate">{record.nama}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{record.nim}</p>
              <p className="text-xs text-primary mt-1 truncate">{mk.nama_mk}</p>
            </div>
            {/* Nilai sekarang */}
            {record.huruf && (
              <div className="text-right flex-shrink-0">
                <p className={`text-3xl font-bold ${hurufColor[record.huruf] ?? "text-slate-400"}`}>
                  {record.huruf}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Saat ini</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Nilai Tugas (pisahkan dengan koma)
              </label>
              <textarea
                value={tugasInput}
                onChange={(e) => setTugasInput(e.target.value)}
                placeholder="Contoh: 85, 90, 78, 92"
                rows={2}
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <p className="text-xs text-slate-500 mt-1">
                {tugasValues.length} nilai tugas · rata-rata: <span className="text-primary font-medium">{preview.tugasAvg}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">UTS</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={uts}
                  onChange={(e) => setUts(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-md text-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center font-semibold tabular-nums transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">UAS</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={uas}
                  onChange={(e) => setUas(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-md text-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center font-semibold tabular-nums transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div
            className={`rounded-xl border p-4 bg-slate-50 ${
               preview.huruf === "A" ? "border-emerald-200 bg-emerald-50/50" : 
               preview.huruf === "E" ? "border-red-200 bg-red-50/50" : 
               "border-primary/20 bg-primary/5"
            }`}
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">Pratinjau Nilai Akhir</p>
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-20">Tugas ({bobot.tugas}%)</span>
                  <span className="text-slate-900 font-medium">{preview.tugasAvg} → {(preview.tugasAvg * bobot.tugas / 100).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-20">UTS ({bobot.uts}%)</span>
                  <span className="text-slate-900 font-medium">{uts} → {(uts * bobot.uts / 100).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-20">UAS ({bobot.uas}%)</span>
                  <span className="text-slate-900 font-medium">{uas} → {(uas * bobot.uas / 100).toFixed(1)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${hurufColor[preview.huruf] ?? "text-slate-400"}`}>
                  {preview.huruf}
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
                  {preview.na}
                </p>
              </div>
            </div>
          </div>

          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          <SubmitButton
            loading={isPending}
            label="Simpan Nilai"
            loadingLabel="Menyimpan..."
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

  const [modalRecord, setModalRecord] = useState<GradeRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const id = localStorage.getItem("evalora_dosen_id") || "";
    setDosenId(id);
  }, []);

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

      const processed: GradeRecord[] = (pendaftaran || []).map((row: any) => {
        const mhs = row.mahasiswa;
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
    A: "text-emerald-700 bg-emerald-50 border-emerald-200",
    B: "text-indigo-700 bg-indigo-50 border-indigo-200",
    C: "text-amber-700 bg-amber-50 border-amber-200",
    D: "text-orange-700 bg-orange-50 border-orange-200",
    E: "text-red-700 bg-red-50 border-red-200",
    "-": "text-slate-600 bg-slate-100 border-slate-200",
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Input Nilai</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Klik ikon <span className="font-medium text-slate-700">edit</span> di tiap baris untuk input nilai.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 transition hover:bg-slate-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">publish</span> Import
          </button>
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 transition hover:bg-slate-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span> Export
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[22px]">menu_book</span>
          <select
            value={activeMk?.mk_id || ""}
            onChange={(e) => {
              const mk = mataKuliahList.find((m) => m.mk_id === e.target.value);
              if (mk) { setActiveMk(mk); fetchGrades(mk); }
            }}
            className="bg-transparent border border-slate-300 rounded-md text-sm text-slate-800 px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[200px]"
          >
            {mataKuliahList.map((mk) => (
              <option key={mk.mk_id} value={mk.mk_id}>
                {mk.mk_id} — {mk.nama_mk}
              </option>
            ))}
            {mataKuliahList.length === 0 && (
              <option>Belum ada Mata Kuliah</option>
            )}
          </select>
        </div>

        {activeMk && (
          <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            <span>Bobot: T={activeMk.bobot_tugas}% | UTS={activeMk.bobot_uts}% | UAS={activeMk.bobot_uas}%</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className={`material-symbols-outlined text-[18px] ${realtimeConnected ? "text-emerald-500 animate-pulse" : "text-slate-400"}`}>
            sensors
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {realtimeConnected ? "Tersinkronisasi" : "Menunggu koneksi..."}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 tracking-wider border-b border-slate-200 uppercase">
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5 w-28 text-slate-500">NIM</th>
                <th className="p-3.5 text-slate-500">Mahasiswa</th>
                <th className="p-3.5 text-center w-24">Tugas Avg</th>
                <th className="p-3.5 text-center w-20">UTS</th>
                <th className="p-3.5 text-center w-20">UAS</th>
                <th className="p-3.5 text-center w-20">NA</th>
                <th className="p-3.5 text-center w-20">Huruf</th>
                <th className="p-3.5 text-center w-24">Status</th>
                <th className="p-3.5 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
                    <span className="material-symbols-outlined text-primary text-[28px] animate-spin">progress_activity</span>
                    <p className="text-slate-500 text-sm mt-3">Memuat data dari database...</p>
                  </td>
                </tr>
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-16 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-[48px] mb-3">group_off</span>
                    <p className="text-slate-700 font-medium">Belum ada mahasiswa terdaftar</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Daftarkan mahasiswa ke mata kuliah ini di halaman Master Mahasiswa.
                    </p>
                  </td>
                </tr>
              ) : (
                grades.map((row, idx) => (
                  <tr
                    key={row.nim}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="p-3.5 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-3.5 font-mono text-slate-500 text-xs">{row.nim}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <AvatarInitial name={row.nama} size={28} />
                        <span className="text-slate-800 font-medium">{row.nama}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center text-primary font-medium tabular-nums">
                      {row.tugasAvg || "—"}
                    </td>
                    <td className="p-3.5 text-center text-slate-700 tabular-nums">
                      {row.nilai_uts || "—"}
                    </td>
                    <td className="p-3.5 text-center text-slate-700 tabular-nums">
                      {row.nilai_uas || "—"}
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-900 tabular-nums">
                      {row.na || "—"}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded border font-bold text-sm ${hurufColor[row.huruf] ?? hurufColor["-"]}`}
                      >
                        {row.huruf}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                          row.status_final === "FINAL"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : row.status_final === "REVISI"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {row.status_final || "DRAFT"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => { setModalRecord(row); setModalOpen(true); }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit Nilai"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-slate-500 pl-1">
        <p>{grades.length} mahasiswa terdaftar</p>
        {lastRealtimeEvent && (
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {lastRealtimeEvent}
          </div>
        )}
      </div>

      {/* Modal Pop-up Input Nilai */}
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
