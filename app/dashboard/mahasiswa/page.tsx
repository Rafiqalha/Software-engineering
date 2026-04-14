"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import {
  FormField,
  TextAreaField,
  SelectField,
  SubmitButton,
  ErrorBanner,
  SuccessBanner,
  AvatarInitial,
} from "@/components/ui/FormField";
import {
  insertMahasiswaAndEnroll,
  updateMahasiswa,
  deleteMahasiswa,
  getMahasiswaByDosen,
  getMataKuliahByDosen
} from "@/app/actions/db";

interface Mahasiswa {
  nim: string;
  nama: string;
  jurusan: string;
  alamat: string;
}

const EMPTY_FORM = { nim: "", nama: "", jurusan: "", alamat: "", mk_id: "" };

export default function MahasiswaPage() {
  const [list, setList] = useState<Mahasiswa[]>([]);
  const [mkList, setMkList] = useState<{value:string, label:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Mahasiswa | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const dosen_id = localStorage.getItem('evalora_dosen_id');
    if (!dosen_id) {
       setLoading(false);
       return;
    }
    
    // Fetch only Mahasiswa for this dosen
    const data = await getMahasiswaByDosen(dosen_id);
    setList(data || []);
    
    // Fetch Mata Kuliah for dropdown
    const mks = await getMataKuliahByDosen(dosen_id);
    setMkList(mks.map(mk => ({ value: mk.mk_id, label: mk.nama_mk })));
    
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
    setForm({ nim: m.nim, nama: m.nama, jurusan: m.jurusan, alamat: m.alamat, mk_id: "" });
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
      const res = await insertMahasiswaAndEnroll({
          nim: form.nim,
          nama: form.nama,
          jurusan: form.jurusan,
          alamat: form.alamat
      }, form.mk_id);
      
      if (res.success) {
        setSuccess("Mahasiswa berhasil ditambahkan dan didaftarkan!");
        await fetchData();
        setTimeout(closeModal, 1500);
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
        setTimeout(closeModal, 1000);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Mahasiswa Saya
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Kelola data mahasiswa yang mengambil mata kuliah Anda.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Tambah Mahasiswa
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Mahasiswa Anda", value: list.length, icon: "group", colorClass: "text-indigo-600 bg-indigo-50" },
          { label: "Mata Kuliah Anda", value: mkList.length, icon: "menu_book", colorClass: "text-violet-600 bg-violet-50" },
          { label: "Hasil Pencarian", value: filtered.length, icon: "search", colorClass: "text-sky-600 bg-sky-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${stat.colorClass}`}>
              <span className="material-symbols-outlined text-[28px]">{stat.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 tabular-nums leading-none tracking-tight">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 pointer-events-none">search</span>
        <input
          id="search-mahasiswa"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan NIM, nama, atau jurusan..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-primary text-[28px] animate-spin">progress_activity</span>
            <p className="text-slate-500 font-medium mt-3">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-slate-300 text-[48px] mb-3">person_off</span>
            <p className="text-slate-700 font-medium">Tidak ada data mahasiswa</p>
            <p className="text-slate-500 text-sm mt-1">
              Tambahkan mahasiswa dan gabungkan ke mata kuliah Anda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((m) => (
              <div
                key={m.nim}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <AvatarInitial name={m.nama} size={48} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{m.nama}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[13px] text-slate-500 font-mono tracking-tight">{m.nim}</span>
                      {m.jurusan && (
                        <>
                          <span className="material-symbols-outlined text-[14px] text-slate-300">chevron_right</span>
                          <span className="text-[13px] text-primary font-medium">{m.jurusan}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-4 pl-16 sm:pl-0 sm:w-1/3">
                  <div className="flex-1 min-w-0">
                    {m.alamat && (
                      <p className="text-[13px] text-slate-500 truncate max-w-xs">{m.alamat}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(m)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                      onClick={() => openDelete(m)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: TAMBAH ── */}
      <Modal
        isOpen={modalMode === "add"}
        onClose={closeModal}
        title="Daftarkan Mahasiswa"
        subtitle="Password default mereka akan sama dengan NIM"
        size="md"
        icon="person_add"
      >
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />
          
          <SelectField
            label="Pilih Mata Kuliah Anda *"
            value={form.mk_id}
            onChange={(v) => setForm((f) => ({ ...f, mk_id: v }))}
            options={mkList}
            placeholder="Pilih kelas..."
            disabled={isPending}
          />

          <div className="border-t border-slate-100 my-4"></div>

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
          <div className="grid grid-cols-2 gap-3">
             <FormField
               id="add-jurusan"
               label="Jurusan"
               value={form.jurusan}
               onChange={(e) => setForm((f) => ({ ...f, jurusan: e.target.value }))}
               placeholder="Teknik Informatika"
               disabled={isPending}
             />
             <FormField
               id="add-alamat"
               label="Alamat"
               value={form.alamat}
               onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
               placeholder="Jakarta"
               disabled={isPending}
             />
          </div>
          <div className="pt-2">
             <SubmitButton
               loading={isPending}
               disabled={!form.nim || !form.nama || !form.mk_id}
               label="Simpan dan Daftarkan"
               loadingLabel="Menyimpan..."
               onClick={handleSubmitAdd}
             />
          </div>
        </div>
      </Modal>

      {/* ── MODAL: EDIT ── */}
      <Modal
        isOpen={modalMode === "edit"}
        onClose={closeModal}
        title="Edit Mahasiswa"
        subtitle={selected?.nim}
        size="md"
        icon="edit"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <AvatarInitial name={selected.nama} size={44} />
              <div>
                <p className="font-semibold text-slate-800">{selected.nama}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selected.nim}</p>
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
        icon="delete_forever"
      >
        {selected && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg p-3">
              <AvatarInitial name={selected.nama} size={40} />
              <div>
                <p className="font-semibold text-slate-800 text-[15px] leading-tight">{selected.nama}</p>
                <p className="text-[13px] text-slate-500 font-mono mt-0.5">{selected.nim}</p>
              </div>
            </div>
            <p className="text-[14.5px] text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus mahasiswa ini beserta <strong className="font-semibold text-slate-800">seluruh data pendaftaran dan nilai</strong> secara permanen?
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
