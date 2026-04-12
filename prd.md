# Product Requirements Document (PRD)
# EVALORA — Evaluation Learning Optimized & Result Analyzer

**Versi:** 1.0  
**Tanggal:** 2025  
**Stack:** React.js · Node.js · PostgreSQL  

---

## 1. Ringkasan Produk

EVALORA adalah platform web untuk mengotomatisasi proses evaluasi akademik dosen perguruan tinggi. Sistem ini menggantikan metode perhitungan nilai manual yang rentan terhadap kesalahan, menyediakan kalkulasi nilai akhir otomatis, konversi nilai huruf, jejak audit, dan ekspor laporan Excel secara massal.

---

## 2. Tujuan Produk

- Menghilangkan kesalahan manusia dalam perhitungan nilai akademik
- Menyediakan satu platform terpusat untuk manajemen nilai per mata kuliah
- Menjamin integritas dan akuntabilitas data nilai mahasiswa
- Mempercepat proses pelaporan nilai ke administrasi akademik

---

## 3. Pengguna & Peran

| Peran                  | Deskripsi                                                                 |
|------------------------|---------------------------------------------------------------------------|
| **Dosen**              | Pengguna utama: konfigurasi bobot, input nilai, ekspor laporan            |
| **Administrator Akademik** | Kelola sistem: pantau distribusi nilai global, maintenance DB, audit trail |
| **Mahasiswa**          | Self-service: lihat nilai real-time, ajukan sanggah nilai                 |

---

## 4. Fitur Utama

### 4.1 Konfigurasi Bobot Penilaian
- Dosen menetapkan persentase bobot untuk Tugas, UTS, dan UAS
- Sistem memvalidasi otomatis bahwa total bobot = 100%
- Mendukung pembuatan kolom tugas secara dinamis sesuai jumlah penugasan
- Konfigurasi disimpan permanen per mata kuliah di PostgreSQL

### 4.2 Input Nilai via Data Grid
- High-performance data grid dengan inline editing (pengalaman seperti spreadsheet)
- Navigasi penuh menggunakan keyboard (tombol panah, F2 untuk mode edit)
- Validasi real-time: sel berwarna merah jika nilai di luar rentang 0–100
- Mendukung impor massal dari file Excel / CSV

### 4.3 Kalkulasi Nilai Akhir Otomatis
- Formula: `NA = (W_tugas × rata-rata_tugas) + (W_uts × N_uts) + (W_uas × N_uas)`
- Capping otomatis: jika NA > 100, maka NA = 100
- Kalkulasi selesai < 500ms untuk 1 kelas berisi 100 mahasiswa
- Konversi otomatis ke nilai huruf berdasarkan standar nasional:

| Rentang | Nilai Huruf |
|---------|-------------|
| 85–100  | A           |
| 80–84   | B+          |
| 70–79   | B           |
| 65–69   | C+          |
| 55–64   | C           |
| 45–54   | D           |
| 0–44    | E           |

### 4.4 Jejak Audit (Audit Trail)
- Setiap perubahan nilai merekam: identitas pengguna, timestamp, nilai lama, nilai baru
- Data audit bersifat **immutable** — tidak dapat diubah atau dihapus
- Administrator dapat menelusuri riwayat nilai untuk keperluan sanggahan atau investigasi

### 4.5 Pengolahan Data Massal & Pembersihan NIM
- Impor data mahasiswa dan nilai via Excel / CSV
- Pembersihan otomatis karakter non-numerik pada NIM (contoh: prefix huruf "S")
- Laporan hasil impor: jumlah baris berhasil + daftar error untuk data tidak valid

### 4.6 Publikasi & Ekspor Laporan
- Dosen dapat mempublikasikan nilai agar dapat dilihat mahasiswa secara self-service
- Ekspor laporan ke format `.xlsx` menggunakan ExcelJS (server-side processing)
- Proses ekspor selesai < 3 detik pada kondisi beban normal

### 4.7 Manajemen Sanggah Nilai
- Mahasiswa dapat mengajukan sanggahan nilai disertai unggah bukti
- Notifikasi dikirim ke dosen saat sanggahan masuk
- Dosen mengelola dan merespons sanggahan melalui dashboard

### 4.8 Monitoring & Statistik (Administrator)
- Monitoring distribusi nilai secara global lintas mata kuliah
- Review jejak audit / audit trail seluruh sistem
- Manajemen akun dosen dan mahasiswa
- Maintenance database dan user management

---

## 5. Alur Sistem

```
Login (JWT Auth)
      ↓
Dashboard Sesuai Role
      ├── Dosen → Konfigurasi Bobot → Input Nilai → Kalkulasi → Publikasi → Ekspor Excel
      ├── Mahasiswa → Lihat Nilai → Ajukan Sanggah (jika ada ketidaksesuaian)
      └── Administrator → Monitoring → Audit Trail → Maintenance
```

---

## 6. Kebutuhan Non-Fungsional

### 6.1 Performa
| Operasi                              | Target              |
|--------------------------------------|---------------------|
| API response (simpan data sederhana) | < 200ms             |
| Kalkulasi nilai 1 kelas (100 mhs)    | < 500ms             |
| Ekspor file Excel massal             | < 3 detik           |

### 6.2 Keamanan
- Enkripsi SSL/TLS untuk semua komunikasi data (HTTPS)
- Row-Level Security (RLS) PostgreSQL: dosen hanya akses mata kuliah yang diampu
- Password hashing menggunakan **Bcrypt**
- Autentikasi dan otorisasi via **JWT**
- Semua query menggunakan **Prepared Statements** (mencegah SQL Injection)
- Rate limiting pada API (mencegah serangan DoS)

### 6.3 Keandalan & Ketersediaan
- Uptime target: **99,9%** terutama pada periode akhir semester
- Transaksi basis data bersifat **ACID** untuk mencegah kerusakan data saat gangguan daya

### 6.4 Kemudahan Penggunaan
- Dosen baru dapat memahami alur penilaian dalam < 10 menit
- Antarmuka responsif: dapat diakses dari PC, laptop, dan tablet
- Resolusi monitor minimal yang disarankan: 1280×720

### 6.5 Pemeliharaan
- Struktur kode Node.js modular
- Dokumentasi teknis lengkap
- Pembaruan kebijakan nilai dapat diimplementasikan dengan risiko minimal

---

## 7. Aturan Bisnis

- Total bobot penilaian (Tugas + UTS + UAS) **harus tepat 100%**
- Nilai akhir **tidak boleh melebihi 100** (capping wajib diterapkan)
- Finalisasi nilai hanya dapat dilakukan **satu kali per periode penilaian**
- Finalisasi hanya dapat dibuka kembali oleh **Administrator Akademik** atas alasan yang sah
- Seluruh data dalam sistem adalah **milik institusi** dan tidak boleh dibagikan ke pihak ketiga tanpa persetujuan

---

## 8. Batasan Teknis (Tech Stack)

| Layer       | Teknologi                          |
|-------------|------------------------------------|
| Frontend    | React.js                           |
| Backend     | Node.js + Express.js (RESTful API) |
| Database    | PostgreSQL 14+ dengan RLS          |
| Auth        | JSON Web Token (JWT)               |
| Ekspor File | ExcelJS                            |
| DB Driver   | node-postgres (parameterized query)|
| Protokol    | HTTPS + JSON                       |

---

## 9. Lingkungan Operasi

- **Server:** Node.js v18+, PostgreSQL v14+
- **Client:** Browser modern (Chrome, Firefox, Safari) dengan JavaScript aktif
- **Deployment:** Cloud atau server lokal universitas
- **Partisi DB:** Tabel dipartisi per semester/tahun akademik jika data > 100.000 baris

---

## 10. Dokumentasi yang Disertakan

- Manual pengguna (PDF): prosedur login, konfigurasi bobot, impor data massal
- Help Tooltips dan pesan error informatif di dalam aplikasi
- Dokumentasi API untuk kebutuhan integrasi administrator

---

## 11. Kriteria Keberhasilan (Definition of Done)

- [ ] Dosen dapat mengonfigurasi bobot dan total tervalidasi = 100%
- [ ] Kalkulasi nilai akhir akurat sesuai formula weighted average
- [ ] Capping nilai berjalan otomatis jika NA > 100
- [ ] Konversi nilai huruf sesuai standar nasional
- [ ] Setiap perubahan nilai terekam di audit log (immutable)
- [ ] Impor Excel/CSV berhasil dengan pembersihan NIM otomatis
- [ ] Ekspor laporan Excel selesai < 3 detik
- [ ] RLS memastikan dosen tidak dapat mengakses data mata kuliah lain
- [ ] Semua endpoint API dilindungi JWT dan rate limiting
- [ ] Uptime sistem ≥ 99,9% pada periode penilaian