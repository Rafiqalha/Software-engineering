"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
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
    <div className="space-y-1">
      <div className="flex rounded-full overflow-hidden h-2 bg-white/5">
        <motion.div
          className="bg-indigo-500 h-full"
          animate={{ width: `${tugas}%` }}
          transition={{ type: "spring", stiffness: 200 }}
        />
        <motion.div
          className="bg-purple-500 h-full"
          animate={{ width: `${uts}%` }}
          transition={{ type: "spring", stiffness: 200 }}
        />
        <motion.div
          className="bg-violet-400 h-full"
          animate={{ width: `${uas}%` }}
          transition={{ type: "spring", stiffness: 200 }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-600">
        <span className="text-indigo-400">T={tugas}%</span>
        <span className="text-purple-400">UTS={uts}%</span>
        <span className="text-violet-400">UAS={uas}%</span>
        <motion.span
          key={total}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`font-bold ${isValid ? "text-emerald-400" : "text-red-400"}`}
        >
          ∑={total}%
        </motion.span>
      </div>
    </div>
  );
}

// Live bobot indicator di dalam modal
function BobotLiveDisplay({ tugas, uts, uas }: { tugas: number; uts: number; uas: number }) {
  const total = tugas + uts + uas;
  const isValid = Math.abs(total - 100) < 0.01;
  return (
    <motion.div
      animate={{
        backgroundColor: isValid ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
        borderColor: isValid ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
      }}
      className="rounded-xl border p-3 space-y-2"
    >
      <div className="flex rounded-full overflow-hidden h-2.5 bg-white/5">
        <motion.div className="bg-indigo-500" animate={{ width: `${tugas}%` }} transition={{ type: "spring" }} style={{ height: "100%" }} />
        <motion.div className="bg-purple-500" animate={{ width: `${uts}%` }} transition={{ type: "spring" }} style={{ height: "100%" }} />
        <motion.div className="bg-violet-400" animate={{ width: `${uas}%` }} transition={{ type: "spring" }} style={{ height: "100%" }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-indigo-400">Tugas {tugas}%</span>
        <span className="text-purple-400">UTS {uts}%</span>
        <span className="text-violet-400">UAS {uas}%</span>
        <motion.span
          key={total}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className={`font-bold ${isValid ? "text-emerald-400" : "text-red-400"}`}
        >
          ∑ {total}% {isValid ? "✓" : "✗"}
        </motion.span>
      </div>
    </motion.div>
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
    setList(data || []);
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
        setTimeout(closeModal, 1200);
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
        setTimeout(closeModal, 1200);
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
      <div className="pt-2">
        <p className="text-sm font-medium text-gray-300 mb-3">Bobot Penilaian</p>
        <div className="space-y-4">
          <BobotSlider
            label="Tugas"
            value={form.bobot_tugas}
            onChange={(v) => setForm((f) => ({ ...f, bobot_tugas: v }))}
            color="text-indigo-400"
          />
          <BobotSlider
            label="UTS"
            value={form.bobot_uts}
            onChange={(v) => setForm((f) => ({ ...f, bobot_uts: v }))}
            color="text-purple-400"
          />
          <BobotSlider
            label="UAS"
            value={form.bobot_uas}
            onChange={(v) => setForm((f) => ({ ...f, bobot_uas: v }))}
            color="text-violet-400"
          />
        </div>
        <div className="mt-3">
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Master Mata Kuliah</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Atur mata kuliah, bobot penilaian, dan dosen pengampu.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          id="btn-tambah-mk"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all"
        >
          <PlusCircleIcon className="w-4 h-4" />
          Tambah Mata Kuliah
        </motion.button>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kode MK atau nama mata kuliah..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#0e0e10] border border-white/5 rounded-2xl">
            <BookOpenIcon className="w-12 h-12 mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400 font-medium">Belum ada mata kuliah</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((mk, idx) => (
              <motion.div
                key={mk.mk_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-[#0e0e10] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group relative overflow-hidden"
              >
                {/* bg glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 blur-2xl rounded-full translate-x-8 -translate-y-8 pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-violet-400 uppercase tracking-wider">{mk.mk_id}</p>
                    <p className="font-semibold text-white mt-0.5 truncate">{mk.nama_mk}</p>
                    {mk.dosen && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <UserIcon className="w-3 h-3 text-gray-600" />
                        <p className="text-xs text-gray-500 truncate">{mk.dosen.nama}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => openEdit(mk)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => { setSelected(mk); setError(null); setModalMode("delete"); }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <div className="mt-4">
                  <BobotBar
                    tugas={Number(mk.bobot_tugas)}
                    uts={Number(mk.bobot_uts)}
                    uas={Number(mk.bobot_uas)}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── MODAL: TAMBAH ── */}
      <Modal
        isOpen={modalMode === "add"}
        onClose={closeModal}
        title="Tambah Mata Kuliah"
        subtitle="Isi kode, nama MK, dan bobot penilaian"
        size="lg"
        icon={<BookOpenIcon className="w-5 h-5 text-white" />}
        accentColor="from-violet-500 to-purple-600"
      >
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />
          <div className="grid grid-cols-2 gap-3">
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
              className="col-span-1"
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
          <SubmitButton
            loading={isPending}
            disabled={!form.mk_id || !form.nama_mk || !form.dosen_id || !bobotValid}
            label="Tambah Mata Kuliah"
            onClick={handleSubmitAdd}
          />
        </div>
      </Modal>

      {/* ── MODAL: EDIT ── */}
      <Modal
        isOpen={modalMode === "edit"}
        onClose={closeModal}
        title="Edit Mata Kuliah"
        subtitle={selected?.mk_id}
        size="lg"
        icon={<PencilSquareIcon className="w-5 h-5 text-white" />}
        accentColor="from-sky-500 to-blue-600"
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
            <SubmitButton
              loading={isPending}
              disabled={!form.nama_mk || !bobotValid}
              label="Simpan Perubahan"
              onClick={handleSubmitEdit}
            />
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
        icon={<TrashIcon className="w-5 h-5 text-white" />}
        accentColor="from-red-600 to-rose-600"
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
              <p className="font-mono text-xs text-violet-400">{selected.mk_id}</p>
              <p className="font-medium text-white mt-0.5">{selected.nama_mk}</p>
            </div>
            <p className="text-sm text-gray-400">
              Semua data nilai yang terkait mata kuliah ini juga akan terhapus.
            </p>
            <ErrorBanner message={error} />
            <SubmitButton
              loading={isPending}
              label="Ya, Hapus Sekarang"
              loadingLabel="Menghapus..."
              onClick={handleDelete}
              variant="danger"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
