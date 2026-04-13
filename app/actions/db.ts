"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

// ================================================================
// Helper: generate UUID sederhana untuk primary key VARCHAR
// ================================================================
function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${ts}${rand}`;
}

// ================================================================
// MAHASISWA — INSERT
// ================================================================
export async function insertMahasiswa(formData: {
  nim: string;
  nama: string;
  jurusan: string;
  alamat: string;
}) {
  const supabase = createAdminClient();
  const { nim, nama, jurusan, alamat } = formData;

  if (!nim || !nama) {
    return { success: false, error: "NIM dan Nama wajib diisi." };
  }

  const { error } = await supabase.from("mahasiswa").insert({
    nim: nim.trim(),
    nama: nama.trim(),
    jurusan: jurusan.trim(),
    alamat: alamat.trim(),
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "NIM sudah terdaftar di sistem." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/mahasiswa");
  return { success: true };
}

// ================================================================
// MAHASISWA — UPDATE
// ================================================================
export async function updateMahasiswa(
  nim: string,
  formData: { nama: string; jurusan: string; alamat: string }
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("mahasiswa")
    .update({
      nama: formData.nama.trim(),
      jurusan: formData.jurusan.trim(),
      alamat: formData.alamat.trim(),
    })
    .eq("nim", nim);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/mahasiswa");
  return { success: true };
}

// ================================================================
// MAHASISWA — DELETE
// ================================================================
export async function deleteMahasiswa(nim: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("mahasiswa").delete().eq("nim", nim);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/mahasiswa");
  return { success: true };
}

// ================================================================
// DOSEN — GET ALL
// ================================================================
export async function getAllDosen() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dosen")
    .select("dosen_id, nama, nip, email")
    .order("nama");
  if (error) return [];
  return data || [];
}

// ================================================================
// MATA KULIAH — INSERT
// ================================================================
export async function insertMataKuliah(formData: {
  mk_id: string;
  nama_mk: string;
  bobot_tugas: number;
  bobot_uts: number;
  bobot_uas: number;
  dosen_id: string;
}) {
  const supabase = createAdminClient();
  const { mk_id, nama_mk, bobot_tugas, bobot_uts, bobot_uas, dosen_id } = formData;

  // Validasi bobot
  const totalBobot = bobot_tugas + bobot_uts + bobot_uas;
  if (Math.abs(totalBobot - 100) > 0.01) {
    return {
      success: false,
      error: `Total bobot harus 100%. Saat ini: ${totalBobot}%`,
    };
  }

  if (!mk_id || !nama_mk || !dosen_id) {
    return { success: false, error: "Kode MK, Nama MK, dan Dosen wajib diisi." };
  }

  const { error } = await supabase.from("mata_kuliah").insert({
    mk_id: mk_id.trim().toUpperCase(),
    nama_mk: nama_mk.trim(),
    bobot_tugas,
    bobot_uts,
    bobot_uas,
    dosen_id: dosen_id.trim(),
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Kode MK sudah terdaftar." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/mata-kuliah");
  return { success: true };
}

// ================================================================
// MATA KULIAH — UPDATE
// ================================================================
export async function updateMataKuliah(
  mk_id: string,
  formData: {
    nama_mk: string;
    bobot_tugas: number;
    bobot_uts: number;
    bobot_uas: number;
    dosen_id: string;
  }
) {
  const supabase = createAdminClient();
  const totalBobot = formData.bobot_tugas + formData.bobot_uts + formData.bobot_uas;
  if (Math.abs(totalBobot - 100) > 0.01) {
    return { success: false, error: `Total bobot harus 100%. Saat ini: ${totalBobot}%` };
  }

  const { error } = await supabase
    .from("mata_kuliah")
    .update({
      nama_mk: formData.nama_mk.trim(),
      bobot_tugas: formData.bobot_tugas,
      bobot_uts: formData.bobot_uts,
      bobot_uas: formData.bobot_uas,
      dosen_id: formData.dosen_id.trim(),
    })
    .eq("mk_id", mk_id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/mata-kuliah");
  return { success: true };
}

// ================================================================
// MATA KULIAH — DELETE
// ================================================================
export async function deleteMataKuliah(mk_id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("mata_kuliah")
    .delete()
    .eq("mk_id", mk_id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/mata-kuliah");
  return { success: true };
}

// ================================================================
// PENDAFTARAN — Daftarkan Mahasiswa ke Mata Kuliah
// ================================================================
export async function daftarkanMahasiswa(nim: string, mk_id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("pendaftaran").insert({ nim, mk_id });
  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Mahasiswa sudah terdaftar di mata kuliah ini." };
    }
    return { success: false, error: error.message };
  }
  revalidatePath("/dashboard/grades");
  return { success: true };
}

// ================================================================
// NILAI — UPSERT oleh Dosen
// Trigger DB akan auto-hitung nilai_akhir & nilai_huruf
// ================================================================
export async function upsertNilai(payload: {
  nilai_id?: string;
  nim: string;
  mk_id: string;
  dosen_id: string;
  nilai_tugas_avg: number;
  nilai_uts: number;
  nilai_uas: number;
  status_final?: string;
}) {
  const supabase = createAdminClient();

  const { nilai_id, nim, mk_id, dosen_id, nilai_tugas_avg, nilai_uts, nilai_uas, status_final } = payload;
  const id = nilai_id || generateId("nlai");

  // Cek apakah sudah ada record untuk dapat audit trail
  const { data: existing } = await supabase
    .from("nilai")
    .select("nilai_id, nilai_akhir")
    .eq("nim", nim)
    .eq("mk_id", mk_id)
    .maybeSingle();

  if (existing) {
    // UPDATE — trigger DB akan otomatis insert ke audit_logs
    const { error } = await supabase
      .from("nilai")
      .update({
        dosen_id,
        nilai_tugas_avg,
        nilai_uts,
        nilai_uas,
        status_final: status_final || "DRAFT",
        // nilai_akhir & nilai_huruf dihitung oleh trigger DB
      })
      .eq("nilai_id", existing.nilai_id);

    if (error) return { success: false, error: error.message };
  } else {
    // INSERT baru
    const { error } = await supabase.from("nilai").insert({
      nilai_id: id,
      nim,
      mk_id,
      dosen_id,
      nilai_tugas_avg,
      nilai_uts,
      nilai_uas,
      status_final: status_final || "DRAFT",
    });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/grades");
  return { success: true };
}

// ================================================================
// NILAI — GET list untuk halaman grades
// ================================================================
export async function getNilaiByMk(mk_id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("pendaftaran")
    .select(`
      nim,
      mahasiswa:nim ( nim, nama, jurusan ),
      nilai:nim ( nilai_id, nilai_tugas_avg, nilai_uts, nilai_uas, nilai_akhir, nilai_huruf, status_final, dosen_id )
    `)
    .eq("mk_id", mk_id)
    .order("nim");

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ================================================================
// DASHBOARD STATS
// ================================================================
export async function getDashboardStats() {
  const supabase = createAdminClient();

  const [{ count: totalMahasiswa }, { count: totalMk }, { data: nilaiData }] =
    await Promise.all([
      supabase.from("mahasiswa").select("*", { count: "exact", head: true }),
      supabase.from("mata_kuliah").select("*", { count: "exact", head: true }),
      supabase.from("nilai").select("nilai_huruf"),
    ]);

  const distribusi: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let totalNilaiA = 0;
  let totalNilai = 0;

  (nilaiData || []).forEach((n: any) => {
    const h = n.nilai_huruf?.trim();
    if (h && distribusi[h] !== undefined) distribusi[h]++;
    if (h === "A") totalNilaiA++;
    if (h) totalNilai++;
  });

  const rataA = totalNilai > 0 ? Math.round((totalNilaiA / totalNilai) * 100) : 0;

  return {
    totalMahasiswa: totalMahasiswa || 0,
    totalMk: totalMk || 0,
    rataA,
    distribusi,
  };
}
