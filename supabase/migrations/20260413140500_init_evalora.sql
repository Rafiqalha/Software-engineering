-- Migration: init_evalora
-- Deskripsi: Skema awal untuk sistem EVALORA sesuai dengan Master Prompt (Strict Conceptual ERD).

-- 1. Tabel Dosen
CREATE TABLE dosen (
  dosen_id    VARCHAR PRIMARY KEY,
  nama        VARCHAR NOT NULL,
  nip         VARCHAR UNIQUE,
  email       VARCHAR UNIQUE
);

-- 2. Tabel Mahasiswa
CREATE TABLE mahasiswa (
  nim         VARCHAR PRIMARY KEY,
  nama        VARCHAR NOT NULL,
  jurusan     VARCHAR,
  alamat      VARCHAR
);

-- 3. Tabel Mata Kuliah
CREATE TABLE mata_kuliah (
  mk_id       VARCHAR PRIMARY KEY,
  nama_mk     VARCHAR NOT NULL,
  bobot_tugas DECIMAL(5,2) NOT NULL,
  bobot_uts   DECIMAL(5,2) NOT NULL,
  bobot_uas   DECIMAL(5,2) NOT NULL,
  dosen_id    VARCHAR REFERENCES dosen(dosen_id) ON DELETE SET NULL,
  CONSTRAINT chk_bobot CHECK (bobot_tugas + bobot_uts + bobot_uas = 100)
);

-- 4. Tabel Pendaftaran (Junction Table M:N Mahasiswa - Mata Kuliah)
CREATE TABLE pendaftaran (
  nim         VARCHAR REFERENCES mahasiswa(nim) ON DELETE CASCADE,
  mk_id       VARCHAR REFERENCES mata_kuliah(mk_id) ON DELETE CASCADE,
  PRIMARY KEY (nim, mk_id)
);

-- 5. Tabel Nilai
CREATE TABLE nilai (
  nilai_id        VARCHAR PRIMARY KEY,
  nim             VARCHAR REFERENCES mahasiswa(nim) ON DELETE CASCADE,
  mk_id           VARCHAR REFERENCES mata_kuliah(mk_id) ON DELETE CASCADE,
  dosen_id        VARCHAR REFERENCES dosen(dosen_id) ON DELETE SET NULL,
  nilai_tugas_avg DECIMAL(5,2) DEFAULT 0,
  nilai_uts       DECIMAL(5,2) DEFAULT 0,
  nilai_uas       DECIMAL(5,2) DEFAULT 0,
  nilai_akhir     DECIMAL(5,2),  -- Computed/Derived field
  nilai_huruf     VARCHAR(2),    -- Computed/Derived field
  status_final    VARCHAR DEFAULT 'DRAFT'
);

-- 6. Tabel Administrator
CREATE TABLE administrator (
  admin_id    VARCHAR PRIMARY KEY,
  nama        VARCHAR NOT NULL,
  email       VARCHAR UNIQUE
);

-- 7. Tabel Audit Logs
CREATE TABLE audit_logs (
  log_id      VARCHAR PRIMARY KEY,
  nilai_id    VARCHAR REFERENCES nilai(nilai_id) ON DELETE CASCADE,
  nilai_lama  DECIMAL(5,2),
  nilai_baru  DECIMAL(5,2),
  timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------------------------
-- FUNGI DAN TRIGGER (BUSINESS RULES)
-- --------------------------------------------------------------------------------------

-- Rule 1: Auto-calculate `nilai_akhir` dan `nilai_huruf` sebelum INSERT atau UPDATE Nilai
CREATE OR REPLACE FUNCTION hitung_nilai_akhir() 
RETURNS TRIGGER AS $$
DECLARE
    v_bobot_tugas DECIMAL(5,2);
    v_bobot_uts   DECIMAL(5,2);
    v_bobot_uas   DECIMAL(5,2);
BEGIN
    -- Ambil bobot mata kuliah terkait
    SELECT bobot_tugas, bobot_uts, bobot_uas 
    INTO v_bobot_tugas, v_bobot_uts, v_bobot_uas
    FROM mata_kuliah WHERE mk_id = NEW.mk_id;

    -- Jika bobot undefined (contoh relasi tidak ditemukan), tidak dihitung
    IF FOUND THEN
        -- Menghitung nilai_akhir berdasarkan prosentase bobot dari 100 (sesuai constraint chk_bobot = 100)
        NEW.nilai_akhir := (NEW.nilai_tugas_avg * (v_bobot_tugas / 100.0)) + 
                           (NEW.nilai_uts * (v_bobot_uts / 100.0)) + 
                           (NEW.nilai_uas * (v_bobot_uas / 100.0));

        -- Konversi nilai_huruf
        IF NEW.nilai_akhir >= 80 THEN 
            NEW.nilai_huruf := 'A';
        ELSIF NEW.nilai_akhir >= 70 THEN 
            NEW.nilai_huruf := 'B';
        ELSIF NEW.nilai_akhir >= 60 THEN 
            NEW.nilai_huruf := 'C';
        ELSIF NEW.nilai_akhir >= 50 THEN 
            NEW.nilai_huruf := 'D';
        ELSE 
            NEW.nilai_huruf := 'E';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hitung_nilai_akhir
BEFORE INSERT OR UPDATE ON nilai
FOR EACH ROW 
EXECUTE FUNCTION hitung_nilai_akhir();


-- Rule 2: Audit trail otomatis setiap kali record Nilai di-UPDATE
CREATE OR REPLACE FUNCTION log_audit_nilai() 
RETURNS TRIGGER AS $$
BEGIN
    -- Hanya audit-log apabila memang terjadi update (dari nilai_akhir lama ke nilai_akhir baru)
    -- Peraturan spesifik: Setiap kali di-UPDATE (bukan insert) wajib dicatat.
    INSERT INTO audit_logs (log_id, nilai_id, nilai_lama, nilai_baru, timestamp)
    VALUES (
        gen_random_uuid()::varchar, -- Generate unique ID
        NEW.nilai_id,
        OLD.nilai_akhir,
        NEW.nilai_akhir,
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_nilai
AFTER UPDATE ON nilai
FOR EACH ROW
EXECUTE FUNCTION log_audit_nilai();

-- Info: Untuk Business Rule 3 (Hanya dosen yang bisa update nilai), 
-- Hal ini akan ditegakkan dari sisi Backend/Service Layer saat pemanggilan endpoint karena 
-- ERD mendefinisikan ketiadaan table users/roles/auth, sehingga RLS Supabase tanpa token tidak bisa diikat ke session database dengan mudah secara sejati.
