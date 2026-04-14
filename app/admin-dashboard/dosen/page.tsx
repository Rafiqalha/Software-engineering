"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import {
  FormField,
  SubmitButton,
  ErrorBanner,
  SuccessBanner,
} from "@/components/ui/FormField";
import {
  insertDosen,
  updateDosen,
  deleteDosen,
  getAllDosen,
} from "@/app/actions/db";

interface Dosen {
  dosen_id: string;
  nama: string;
  nip: string;
  email: string;
}

const EMPTY_FORM = {
  nama: "",
  nip: "",
  email: "",
};

export default function DosenPage() {
  const [list, setList] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Dosen | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getAllDosen();
    setList(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setSuccess(null);
    setModalMode("add");
  };

  const openEdit = (dsn: Dosen) => {
    setSelected(dsn);
    setForm({
      nama: dsn.nama,
      nip: dsn.nip,
      email: dsn.email || "",
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

  const handleSubmitAdd = () => {
    setError(null);
    startTransition(async () => {
      const res = await insertDosen(form);
      if (res.success) {
        setSuccess("Dosen berhasil ditambahkan! Password default adalah NIP mereka.");
        await fetchData();
        setTimeout(closeModal, 1500);
      } else {
        setError(res.error ?? "Gagal menyimpan.");
      }
    });
  };

  const handleSubmitEdit = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await updateDosen(selected.dosen_id, form);
      if (res.success) {
        setSuccess("Data dosen berhasil diperbarui!");
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
      const res = await deleteDosen(selected.dosen_id);
      if (res.success) {
        await fetchData();
        closeModal();
      } else {
        setError(res.error ?? "Gagal menghapus.");
      }
    });
  };

  const filtered = list.filter(
    (dsn) =>
      dsn.nama.toLowerCase().includes(search.toLowerCase()) ||
      dsn.nip.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Manajemen Dosen</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Kelola data staf pengajar dan akses sistem mereka.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Tambah Dosen
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 pointer-events-none">search</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan nama atau NIP..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-blue-500 text-[28px] animate-spin">progress_activity</span>
            <p className="text-slate-500 font-medium mt-3">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white border border-slate-200 rounded-xl">
            <span className="material-symbols-outlined text-slate-300 text-[48px] mb-3">group_off</span>
            <p className="text-slate-700 font-medium">Belum ada data dosen</p>
            <p className="text-slate-500 text-sm mt-1">
              Tambahkan dosen untuk memulai.
            </p>
          </div>
        ) : (
          filtered.map((dsn) => (
            <div
              key={dsn.dosen_id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between relative"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                        {dsn.nama.substring(0,2).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="font-semibold text-slate-800 text-[17px] leading-tight truncate">{dsn.nama}</h3>
                        <p className="text-[13px] text-slate-500 mt-0.5">NIP. {dsn.nip}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 text-sm text-slate-600 truncate">
                      <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">mail</span>
                      {dsn.email || '-'}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 bg-white/50 rounded-md p-1 border border-transparent group-hover:border-slate-200 group-hover:bg-slate-50 transition-all absolute top-4 right-4 shadow-sm opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(dsn)}
                    className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-white transition-colors border border-transparent hover:border-slate-200"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => { setSelected(dsn); setError(null); setModalMode("delete"); }}
                    className="p-1.5 rounded text-slate-500 hover:text-red-600 hover:bg-white transition-colors border border-transparent hover:border-slate-200"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── MODAL: TAMBAH ── */}
      <Modal
        isOpen={modalMode === "add"}
        onClose={closeModal}
        title="Tambah Dosen"
        subtitle="Sandi (password) default adalah NIP"
        size="md"
        icon="person_add"
      >
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />
          <FormField
            id="add-dsn-nama"
            label="Nama Lengkap (beserta gelar) *"
            value={form.nama}
            onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
            placeholder="Contoh: Dr. Budi Santoso"
            disabled={isPending}
          />
          <div className="grid grid-cols-1 gap-4">
            <FormField
              id="add-dsn-nip"
              label="NIP *"
              value={form.nip}
              onChange={(e) => setForm((f) => ({ ...f, nip: e.target.value }))}
              placeholder="Contoh: 19800101"
              disabled={isPending}
            />
            <FormField
              id="add-dsn-email"
              label="Email *"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="budi@kampus.ac.id"
              type="email"
              disabled={isPending}
            />
          </div>
          <div className="pt-2">
            <SubmitButton
              loading={isPending}
              disabled={!form.nama || !form.nip || !form.email}
              label="Tambah Dosen"
              onClick={handleSubmitAdd}
            />
          </div>
        </div>
      </Modal>

      {/* ── MODAL: EDIT ── */}
      <Modal
        isOpen={modalMode === "edit"}
        onClose={closeModal}
        title="Edit Dosen"
        subtitle={selected?.nip}
        size="md"
        icon="edit"
      >
        {selected && (
          <div className="space-y-4">
            <ErrorBanner message={error} />
            <SuccessBanner message={success} />
            <FormField
              id="edit-dsn-nama"
              label="Nama Lengkap"
              value={form.nama}
              onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
              disabled={isPending}
            />
            <FormField
              id="edit-dsn-nip"
              label="NIP"
              value={form.nip}
              onChange={(e) => setForm((f) => ({ ...f, nip: e.target.value }))}
              disabled={isPending}
            />
            <FormField
              id="edit-dsn-email"
              label="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              type="email"
              disabled={isPending}
            />
            <div className="pt-2">
              <SubmitButton
                loading={isPending}
                disabled={!form.nama || !form.nip || !form.email}
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
        title="Hapus Dosen"
        subtitle="Tindakan ini tidak dapat dibatalkan"
        size="sm"
        icon="delete_forever"
      >
        {selected && (
          <div className="space-y-4 mt-2">
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
               <p className="font-semibold text-slate-800 leading-tight">{selected.nama}</p>
               <p className="font-mono text-[13px] font-bold text-red-600 mt-1">{selected.nip}</p>
            </div>
            <p className="text-[14.5px] text-slate-600 leading-relaxed">
               Dosen yang dihapus tidak akan bisa *login* lagi. Data mata kuliah yang diampunya akan kehilangan referensi.
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
