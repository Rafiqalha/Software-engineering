"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import {
  FormField,
  BobotSlider,
  SelectField,
  SubmitButton,
  ErrorBanner,
  SuccessBanner,
} from "@/components/ui/FormField";
import {
  insertMataKuliah,
  updateMataKuliah,
  deleteMataKuliah,
  getAllDosen,
} from "@/app/actions/db";
import { createClient } from "@/utils/supabase/client";

interface MataKuliah {
  mk_id: string;
  nama_mk: string;
  bobot_tugas: number;
  bobot_uts: number;
  bobot_uas: number;
  dosen_id: string;
  dosen?: { nama: string; nip: string };
}

interface DosenOption {
  dosen_id: string;
  nama: string;
  nip: string;
  email: string;
}

const EMPTY_FORM = {
  mk_id: "",
  nama_mk: "",
  bobot_tugas: 30,
  bobot_uts: 30,
  bobot_uas: 40,
  dosen_id: "",
};

function BobotBar({ tugas, uts, uas }: { tugas: number; uts: number; uas: number }) {
  const total = tugas + uts + uas;
  const isValid = Math.abs(total - 100) < 0.01;
  return (
    <div className="space-y-1.5">
      <div className="flex rounded-full overflow-hidden h-2.5 bg-slate-100 ring-1 ring-slate-200 inset-ring">
        <div
          className="bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${tugas}%` }}
        />
        <div
          className="bg-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${uts}%` }}
        />
        <div
          className="bg-violet-400 transition-all duration-500 ease-out"
          style={{ width: `${uas}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] font-medium text-slate-500 tracking-tight">
        <span className="text-indigo-600">T={tugas}%</span>
        <span className="text-purple-600">UTS={uts}%</span>
        <span className="text-violet-600">UAS={uas}%</span>
        <span
          className={`font-bold ${isValid ? "text-emerald-600" : "text-red-500"}`}
        >
          ∑={total}%
        </span>
      </div>
    </div>
  );
}

// Live bobot indicator di dalam modal
function BobotLiveDisplay({ tugas, uts, uas }: { tugas: number; uts: number; uas: number }) {
  const total = tugas + uts + uas;
  const isValid = Math.abs(total - 100) < 0.01;
  return (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-colors ${
        isValid 
          ? "bg-emerald-50 border-emerald-200" 
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex rounded-full overflow-hidden h-2.5 bg-white ring-1 ring-slate-200">
        <div className="bg-indigo-500 transition-all duration-300" style={{ width: `${tugas}%`, height: "100%" }} />
        <div className="bg-purple-500 transition-all duration-300" style={{ width: `${uts}%`, height: "100%" }} />
        <div className="bg-violet-400 transition-all duration-300" style={{ width: `${uas}%`, height: "100%" }} />
      </div>
      <div className="flex justify-between text-[13px] font-medium">
        <span className="text-indigo-700">Tugas {tugas}%</span>
        <span className="text-purple-700">UTS {uts}%</span>
        <span className="text-violet-700">UAS {uas}%</span>
        <span
          className={`font-bold ${isValid ? "text-emerald-600" : "text-red-600"}`}
        >
          ∑ {total}% {isValid ? "✓" : "✗"}
        </span>
      </div>
    </div>
  );
}

export default function MataKuliahPage() {
  const [list, setList] = useState<MataKuliah[]>([]);
  const [dosenList, setDosenList] = useState<DosenOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<MataKuliah | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("mata_kuliah")
      .select("mk_id, nama_mk, bobot_tugas, bobot_uts, bobot_uas, dosen_id, dosen:dosen_id(nama, nip)")
      .order("mk_id");
    const formatted: MataKuliah[] = (data || []).map((item: any) => ({
      ...item,
      dosen: Array.isArray(item.dosen) ? item.dosen[0] : item.dosen,
    }));
    setList(formatted);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    getAllDosen().then(setDosenList);
  }, [fetchData]);

  const dosenOptions = dosenList.map((d) => ({
    value: d.dosen_id,
    label: `${d.nama} (${d.nip})`,
  }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setSuccess(null);
    setModalMode("add");
  };

  const openEdit = (mk: MataKuliah) => {
    setSelected(mk);
    setForm({
      mk_id: mk.mk_id,
      nama_mk: mk.nama_mk,
      bobot_tugas: Number(mk.bobot_tugas),
      bobot_uts: Number(mk.bobot_uts),
      bobot_uas: Number(mk.bobot_uas),
      dosen_id: mk.dosen_id || "",
    });
    setError(null);
    setSuccess(null);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
    setError(null);
    setSuccess(null);
  };

  const totalBobot = form.bobot_tugas + form.bobot_uts + form.bobot_uas;
  const bobotValid = Math.abs(totalBobot - 100) < 0.01;

  const handleSubmitAdd = () => {
    setError(null);
    startTransition(async () => {
      const res = await insertMataKuliah(form);
      if (res.success) {
        setSuccess("Mata kuliah berhasil ditambahkan!");
        await fetchData();
        setTimeout(closeModal, 1000);
      } else {
        setError(res.error ?? "Gagal menyimpan.");
      }
    });
  };

  const handleSubmitEdit = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await updateMataKuliah(selected.mk_id, {
        nama_mk: form.nama_mk,
        bobot_tugas: form.bobot_tugas,
        bobot_uts: form.bobot_uts,
        bobot_uas: form.bobot_uas,
        dosen_id: form.dosen_id,
      });
      if (res.success) {
        setSuccess("Mata kuliah berhasil diperbarui!");
        await fetchData();
        setTimeout(closeModal, 1000);
      } else {
        setError(res.error ?? "Gagal memperbarui.");
      }
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    startTransition(async () => {
      const res = await deleteMataKuliah(selected.mk_id);
      if (res.success) {
        await fetchData();
        closeModal();
      } else {
        setError(res.error ?? "Gagal menghapus.");
      }
    });
  };

  const filtered = list.filter(
    (mk) =>
      mk.nama_mk.toLowerCase().includes(search.toLowerCase()) ||
      mk.mk_id.toLowerCase().includes(search.toLowerCase())
  );

  const BobotForm = () => (
    <div className="space-y-4">
      <div className="pt-3 border-t border-slate-100">
        <p className="text-sm font-semibold text-slate-700 mb-4">Bobot Penilaian</p>
        <div className="space-y-5">
          <BobotSlider
            label="Tugas"
            value={form.bobot_tugas}
            onChange={(v) => setForm((f) => ({ ...f, bobot_tugas: v }))}
            color="text-indigo-600"
          />
          <BobotSlider
            label="UTS"
            value={form.bobot_uts}
            onChange={(v) => setForm((f) => ({ ...f, bobot_uts: v }))}
            color="text-purple-600"
          />
          <BobotSlider
            label="UAS"
            value={form.bobot_uas}
            onChange={(v) => setForm((f) => ({ ...f, bobot_uas: v }))}
            color="text-violet-600"
          />
        </div>
        <div className="mt-5">
          <BobotLiveDisplay
            tugas={form.bobot_tugas}
            uts={form.bobot_uts}
            uas={form.bobot_uas}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Master Mata Kuliah</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Atur mata kuliah, bobot penilaian, dan dosen pengampu.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Tambah Mata Kuliah
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 pointer-events-none">search</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kode MK atau nama mata kuliah..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-primary text-[28px] animate-spin">progress_activity</span>
            <p className="text-slate-500 font-medium mt-3">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white border border-slate-200 rounded-xl">
            <span className="material-symbols-outlined text-slate-300 text-[48px] mb-3">menu_book</span>
            <p className="text-slate-700 font-medium">Belum ada mata kuliah</p>
            <p className="text-slate-500 text-sm mt-1">
              Tambahkan mata kuliah untuk memulai.
            </p>
          </div>
        ) : (
          filtered.map((mk) => (
            <div
              key={mk.mk_id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider mb-2">
                    {mk.mk_id}
                  </span>
                  <h3 className="font-semibold text-slate-800 text-lg leading-tight mb-2 pr-2">{mk.nama_mk}</h3>
                  {mk.dosen ? (
                    <div className="flex items-center gap-2 mt-2 bg-slate-50 border border-slate-100 rounded-md py-1.5 px-3 w-fit max-w-full">
                      <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">person</span>
                      <p className="text-sm font-medium text-slate-600 truncate">{mk.dosen.nama}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600 mt-2 bg-amber-50 px-2 py-1 rounded w-fit">Dosen belum diatur</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 rounded-md p-1 border border-slate-200">
                  <button
                    onClick={() => openEdit(mk)}
                    className="p-1.5 rounded text-slate-500 hover:text-primary hover:bg-white transition-colors"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => { setSelected(mk); setError(null); setModalMode("delete"); }}
                    className="p-1.5 rounded text-slate-500 hover:text-destructive hover:bg-white transition-colors"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100">
                <BobotBar
                  tugas={Number(mk.bobot_tugas)}
                  uts={Number(mk.bobot_uts)}
                  uas={Number(mk.bobot_uas)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── MODAL: TAMBAH ── */}
      <Modal
        isOpen={modalMode === "add"}
        onClose={closeModal}
        title="Tambah Mata Kuliah"
        subtitle="Isi kode, nama MK, dan bobot penilaian"
        size="lg"
        icon="library_add"
      >
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="add-mk-id"
              label="Kode MK *"
              value={form.mk_id}
              onChange={(e) => setForm((f) => ({ ...f, mk_id: e.target.value }))}
              placeholder="Contoh: CS101"
              disabled={isPending}
            />
            <FormField
              id="add-mk-nama"
              label="Nama Mata Kuliah *"
              value={form.nama_mk}
              onChange={(e) => setForm((f) => ({ ...f, nama_mk: e.target.value }))}
              placeholder="Contoh: Rekayasa Perangkat Lunak"
              disabled={isPending}
            />
          </div>
          <SelectField
            label="Dosen Pengampu *"
            value={form.dosen_id}
            onChange={(v) => setForm((f) => ({ ...f, dosen_id: v }))}
            options={dosenOptions}
            placeholder="Pilih Dosen..."
            disabled={isPending}
          />
          <BobotForm />
          <div className="pt-2">
            <SubmitButton
              loading={isPending}
              disabled={!form.mk_id || !form.nama_mk || !form.dosen_id || !bobotValid}
              label="Tambah Mata Kuliah"
              onClick={handleSubmitAdd}
            />
          </div>
        </div>
      </Modal>

      {/* ── MODAL: EDIT ── */}
      <Modal
        isOpen={modalMode === "edit"}
        onClose={closeModal}
        title="Edit Mata Kuliah"
        subtitle={selected?.mk_id}
        size="lg"
        icon="edit_note"
      >
        {selected && (
          <div className="space-y-4">
            <ErrorBanner message={error} />
            <SuccessBanner message={success} />
            <FormField
              id="edit-mk-nama"
              label="Nama Mata Kuliah"
              value={form.nama_mk}
              onChange={(e) => setForm((f) => ({ ...f, nama_mk: e.target.value }))}
              disabled={isPending}
            />
            <SelectField
              label="Dosen Pengampu"
              value={form.dosen_id}
              onChange={(v) => setForm((f) => ({ ...f, dosen_id: v }))}
              options={dosenOptions}
              disabled={isPending}
            />
            <BobotForm />
            <div className="pt-2">
              <SubmitButton
                loading={isPending}
                disabled={!form.nama_mk || !bobotValid}
                label="Simpan Perubahan"
                onClick={handleSubmitEdit}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: DELETE ── */}
      <Modal
        isOpen={modalMode === "delete"}
        onClose={closeModal}
        title="Hapus Mata Kuliah"
        subtitle="Tindakan ini tidak dapat dibatalkan"
        size="sm"
        icon="delete_forever"
      >
        {selected && (
          <div className="space-y-4 mt-2">
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <p className="font-mono text-[13px] font-bold text-red-600 mb-1">{selected.mk_id}</p>
              <p className="font-semibold text-slate-800 leading-tight">{selected.nama_mk}</p>
            </div>
            <p className="text-[14.5px] text-slate-600 leading-relaxed">
              Semua data nilai dan ujian yang terkait dengan mata kuliah ini juga akan <strong className="font-semibold text-slate-800">terhapus secara permanen</strong>.
            </p>
            <ErrorBanner message={error} />
            <div className="pt-2">
              <SubmitButton
                loading={isPending}
                label="Ya, Hapus Sekarang"
                loadingLabel="Menghapus..."
                onClick={handleDelete}
                variant="danger"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
