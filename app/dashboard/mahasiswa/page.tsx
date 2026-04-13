"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/components/ui/Modal";
import {
  FormField,
  TextAreaField,
  SubmitButton,
  ErrorBanner,
  SuccessBanner,
  AvatarInitial,
} from "@/components/ui/FormField";
import {
  insertMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from "@/app/actions/db";
import { createClient } from "@/utils/supabase/client";

interface Mahasiswa {
  nim: string;
  nama: string;
  jurusan: string;
  alamat: string;
}

const EMPTY_FORM = { nim: "", nama: "", jurusan: "", alamat: "" };

export default function MahasiswaPage() {
  const [list, setList] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Mahasiswa | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("mahasiswa")
      .select("nim, nama, jurusan, alamat")
      .order("nama");
    setList(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setSuccess(null);
    setModalMode("add");
  };

  const openEdit = (m: Mahasiswa) => {
    setSelected(m);
    setForm({ nim: m.nim, nama: m.nama, jurusan: m.jurusan, alamat: m.alamat });
    setError(null);
    setSuccess(null);
    setModalMode("edit");
  };

  const openDelete = (m: Mahasiswa) => {
    setSelected(m);
    setError(null);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmitAdd = () => {
    setError(null);
    startTransition(async () => {
      const res = await insertMahasiswa(form);
      if (res.success) {
        setSuccess("Mahasiswa berhasil ditambahkan!");
        await fetchData();
        setTimeout(closeModal, 1200);
      } else {
        setError(res.error || "Gagal menyimpan.");
      }
    });
  };

  const handleSubmitEdit = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await updateMahasiswa(selected.nim, {
        nama: form.nama,
        jurusan: form.jurusan,
        alamat: form.alamat,
      });
      if (res.success) {
        setSuccess("Data berhasil diperbarui!");
        await fetchData();
        setTimeout(closeModal, 1200);
      } else {
        setError(res.error || "Gagal memperbarui.");
      }
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    startTransition(async () => {
      const res = await deleteMahasiswa(selected.nim);
      if (res.success) {
        await fetchData();
        closeModal();
      } else {
        setError(res.error || "Gagal menghapus.");
      }
    });
  };

  const filtered = list.filter(
    (m) =>
      m.nama.toLowerCase().includes(search.toLowerCase()) ||
      m.nim.toLowerCase().includes(search.toLowerCase()) ||
      m.jurusan?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Master Mahasiswa
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Kelola data mahasiswa yang terdaftar di sistem EVALORA.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          id="btn-tambah-mahasiswa"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
        >
          <UserPlusIcon className="w-4 h-4" />
          Tambah Mahasiswa
        </motion.button>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        {[
          { label: "Total Mahasiswa", value: list.length, icon: UserGroupIcon, color: "text-indigo-400" },
          { label: "Jurusan Tercatat", value: [...new Set(list.map((m) => m.jurusan).filter(Boolean))].length, icon: AcademicCapIcon, color: "text-violet-400" },
          { label: "Hasil Pencarian", value: filtered.length, icon: MagnifyingGlassIcon, color: "text-sky-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          id="search-mahasiswa"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan NIM, nama, atau jurusan..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40 transition-all"
        />
      </div>

      {/* List */}
      <div className="bg-[#0e0e10] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 text-sm mt-3">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserGroupIcon className="w-12 h-12 mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400 font-medium">Tidak ada data mahasiswa</p>
            <p className="text-gray-600 text-sm mt-1">
              {search ? "Coba ubah kata kunci pencarian." : "Tambahkan mahasiswa baru menggunakan tombol di atas."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {filtered.map((m, idx) => (
                <motion.div
                  key={m.nim}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors group"
                >
                  <AvatarInitial name={m.nama} size={42} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{m.nama}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500 font-mono">{m.nim}</span>
                      {m.jurusan && (
                        <>
                          <ChevronRightIcon className="w-3 h-3 text-gray-700" />
                          <span className="text-xs text-indigo-400">{m.jurusan}</span>
                        </>
                      )}
                    </div>
                    {m.alamat && (
                      <p className="text-xs text-gray-600 truncate mt-0.5">{m.alamat}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openEdit(m)}
                      className="p-2 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openDelete(m)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Hapus"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── MODAL: TAMBAH ── */}
      <Modal
        isOpen={modalMode === "add"}
        onClose={closeModal}
        title="Tambah Mahasiswa"
        subtitle="Isi data lengkap mahasiswa baru"
        size="md"
        icon={<UserPlusIcon className="w-5 h-5 text-white" />}
        accentColor="from-indigo-500 to-violet-600"
      >
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />
          <FormField
            id="add-nim"
            label="NIM *"
            value={form.nim}
            onChange={(e) => setForm((f) => ({ ...f, nim: e.target.value }))}
            placeholder="Contoh: 22101001"
            disabled={isPending}
          />
          <FormField
            id="add-nama"
            label="Nama Lengkap *"
            value={form.nama}
            onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
            placeholder="Contoh: Budi Santoso"
            disabled={isPending}
          />
          <FormField
            id="add-jurusan"
            label="Jurusan"
            value={form.jurusan}
            onChange={(e) => setForm((f) => ({ ...f, jurusan: e.target.value }))}
            placeholder="Contoh: Teknik Informatika"
            disabled={isPending}
          />
          <TextAreaField
            id="add-alamat"
            label="Alamat"
            value={form.alamat}
            onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
            placeholder="Alamat lengkap mahasiswa"
            rows={2}
            disabled={isPending}
          />
          <SubmitButton
            loading={isPending}
            disabled={!form.nim || !form.nama}
            label="Tambah Mahasiswa"
            loadingLabel="Menyimpan..."
            onClick={handleSubmitAdd}
          />
        </div>
      </Modal>

      {/* ── MODAL: EDIT ── */}
      <Modal
        isOpen={modalMode === "edit"}
        onClose={closeModal}
        title="Edit Mahasiswa"
        subtitle={selected?.nim}
        size="md"
        icon={<PencilSquareIcon className="w-5 h-5 text-white" />}
        accentColor="from-sky-500 to-blue-600"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-white/5">
              <AvatarInitial name={selected.nama} size={44} />
              <div>
                <p className="font-semibold text-white">{selected.nama}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{selected.nim}</p>
              </div>
            </div>
            <ErrorBanner message={error} />
            <SuccessBanner message={success} />
            <FormField
              id="edit-nama"
              label="Nama Lengkap *"
              value={form.nama}
              onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
              disabled={isPending}
            />
            <FormField
              id="edit-jurusan"
              label="Jurusan"
              value={form.jurusan}
              onChange={(e) => setForm((f) => ({ ...f, jurusan: e.target.value }))}
              disabled={isPending}
            />
            <TextAreaField
              id="edit-alamat"
              label="Alamat"
              value={form.alamat}
              onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
              rows={2}
              disabled={isPending}
            />
            <SubmitButton
              loading={isPending}
              disabled={!form.nama}
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
        title="Hapus Mahasiswa"
        subtitle="Tindakan ini tidak dapat dibatalkan"
        size="sm"
        icon={<TrashIcon className="w-5 h-5 text-white" />}
        accentColor="from-red-600 to-rose-600"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
              <AvatarInitial name={selected.nama} size={40} />
              <div>
                <p className="font-medium text-white">{selected.nama}</p>
                <p className="text-xs text-gray-500 font-mono">{selected.nim}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Mahasiswa ini beserta seluruh data pendaftaran dan nilainya akan dihapus secara permanen.
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
