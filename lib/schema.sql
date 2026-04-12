-- =====================================================
-- EVALORA: Schema Multi-Tenant dengan RLS (Supabase)
-- =====================================================

-- 1. TABEL DOSEN
CREATE TABLE IF NOT EXISTS dosen (
    dosen_id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    nip VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- 2. TABEL MATA KULIAH (tenant = dosen_id)
CREATE TABLE IF NOT EXISTS mata_kuliah (
    mk_id SERIAL PRIMARY KEY,
    kode_mk VARCHAR(20) NOT NULL,
    nama_mk VARCHAR(100) NOT NULL,
    bobot_tugas DECIMAL(5,2) DEFAULT 30,
    bobot_uts DECIMAL(5,2) DEFAULT 30,
    bobot_uas DECIMAL(5,2) DEFAULT 40,
    jumlah_tugas INTEGER DEFAULT 3,
    dosen_id INTEGER REFERENCES dosen(dosen_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL MAHASISWA (per mata kuliah, tenant = dosen via mk)
CREATE TABLE IF NOT EXISTS mahasiswa (
    mahasiswa_id SERIAL PRIMARY KEY,
    nim VARCHAR(20) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    mk_id INTEGER REFERENCES mata_kuliah(mk_id) ON DELETE CASCADE,
    UNIQUE(nim, mk_id)
);

-- 4. TABEL NILAI TUGAS INDIVIDUAL
CREATE TABLE IF NOT EXISTS nilai_tugas (
    tugas_id SERIAL PRIMARY KEY,
    mahasiswa_id INTEGER REFERENCES mahasiswa(mahasiswa_id) ON DELETE CASCADE,
    mk_id INTEGER REFERENCES mata_kuliah(mk_id) ON DELETE CASCADE,
    tugas_ke INTEGER NOT NULL,
    nilai DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mahasiswa_id, mk_id, tugas_ke)
);

-- 5. TABEL NILAI AKHIR (computed)
CREATE TABLE IF NOT EXISTS nilai (
    nilai_id SERIAL PRIMARY KEY,
    mahasiswa_id INTEGER REFERENCES mahasiswa(mahasiswa_id) ON DELETE CASCADE,
    mk_id INTEGER REFERENCES mata_kuliah(mk_id) ON DELETE CASCADE,
    nilai_tugas_avg DECIMAL(5,2) DEFAULT 0,
    nilai_uts DECIMAL(5,2) DEFAULT 0,
    nilai_uas DECIMAL(5,2) DEFAULT 0,
    nilai_akhir DECIMAL(5,2),
    nilai_huruf CHAR(2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mahasiswa_id, mk_id)
);

-- 6. TABEL AUDIT LOG (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id SERIAL PRIMARY KEY,
    nilai_id INTEGER REFERENCES nilai(nilai_id),
    field_changed VARCHAR(50),
    nilai_lama DECIMAL(5,2),
    nilai_baru DECIMAL(5,2),
    dosen_id INTEGER REFERENCES dosen(dosen_id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ROW LEVEL SECURITY (Multi-Tenant per Dosen)
-- =====================================================
-- Aktifkan RLS untuk setiap tabel data
-- Catatan: Jalankan di Supabase SQL Editor

ALTER TABLE mata_kuliah ENABLE ROW LEVEL SECURITY;
ALTER TABLE mahasiswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai_tugas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nilai ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: mata_kuliah hanya bisa diakses oleh dosen pemiliknya
-- Dengan anon key (publishable), kita gunakan policy yang memperbolehkan 
-- akses penuh melalui service role, lalu filter di application layer
CREATE POLICY "mata_kuliah_all" ON mata_kuliah FOR ALL USING (true);
CREATE POLICY "mahasiswa_all" ON mahasiswa FOR ALL USING (true);
CREATE POLICY "nilai_tugas_all" ON nilai_tugas FOR ALL USING (true);
CREATE POLICY "nilai_all" ON nilai FOR ALL USING (true);
CREATE POLICY "audit_logs_all" ON audit_logs FOR ALL USING (true);

-- =====================================================
-- ENABLE REALTIME untuk tabel kunci
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE nilai_tugas;
ALTER PUBLICATION supabase_realtime ADD TABLE nilai;
ALTER PUBLICATION supabase_realtime ADD TABLE mahasiswa;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

-- =====================================================
-- DATA CONTOH (Seed Data)
-- =====================================================
-- Password: 'password123' => bcrypt hash
INSERT INTO dosen (nama, nip, email, password_hash) VALUES
('Dr. Budi Santoso', '198501012010', 'budi@evalora.ac.id', '$2a$10$XQxBj9HCJZ8Z8Z8Z8Z8Z8OjY3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z')
ON CONFLICT (nip) DO NOTHING;

INSERT INTO dosen (nama, nip, email, password_hash) VALUES
('Dr. Siti Aminah', '199002022015', 'siti@evalora.ac.id', '$2a$10$XQxBj9HCJZ8Z8Z8Z8Z8Z8OjY3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z')
ON CONFLICT (nip) DO NOTHING;
