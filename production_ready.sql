-- EVALORA PRODUCTION READY MIGRATION
-- Consolidated Schema + Data (Clean)

-- 1. CLEANUP (Optional - Uncomment if you want to start fresh)
-- DROP TABLE IF EXISTS audit_logs;
-- DROP TABLE IF EXISTS nilai;
-- DROP TABLE IF EXISTS pendaftaran;
-- DROP TABLE IF EXISTS mata_kuliah;
-- DROP TABLE IF EXISTS mahasiswa;
-- DROP TABLE IF EXISTS dosen;
-- DROP TABLE IF EXISTS administrator;

-- 2. SCHEMA DEFINITION

-- Tabel Administrator
CREATE TABLE IF NOT EXISTS administrator (
  admin_id      VARCHAR PRIMARY KEY,
  nama          VARCHAR NOT NULL,
  email         VARCHAR UNIQUE,
  username      VARCHAR UNIQUE,
  password_hash VARCHAR
);

-- Tabel Dosen
CREATE TABLE IF NOT EXISTS dosen (
  dosen_id      VARCHAR PRIMARY KEY,
  nama          VARCHAR NOT NULL,
  nip           VARCHAR UNIQUE,
  email         VARCHAR UNIQUE,
  password_hash VARCHAR
);

-- Tabel Mahasiswa
CREATE TABLE IF NOT EXISTS mahasiswa (
  nim           VARCHAR PRIMARY KEY,
  nama          VARCHAR NOT NULL,
  jurusan       VARCHAR,
  alamat        VARCHAR,
  password_hash VARCHAR
);

-- Tabel Mata Kuliah
CREATE TABLE IF NOT EXISTS mata_kuliah (
  mk_id         VARCHAR PRIMARY KEY,
  nama_mk       VARCHAR NOT NULL,
  bobot_tugas   DECIMAL(5,2) NOT NULL,
  bobot_uts     DECIMAL(5,2) NOT NULL,
  bobot_uas     DECIMAL(5,2) NOT NULL,
  dosen_id      VARCHAR REFERENCES dosen(dosen_id) ON DELETE SET NULL,
  CONSTRAINT chk_bobot CHECK (bobot_tugas + bobot_uts + bobot_uas = 100)
);

-- Tabel Pendaftaran
CREATE TABLE IF NOT EXISTS pendaftaran (
  nim           VARCHAR REFERENCES mahasiswa(nim) ON DELETE CASCADE,
  mk_id         VARCHAR REFERENCES mata_kuliah(mk_id) ON DELETE CASCADE,
  PRIMARY KEY (nim, mk_id)
);

-- Tabel Nilai
CREATE TABLE IF NOT EXISTS nilai (
  nilai_id        VARCHAR PRIMARY KEY,
  nim             VARCHAR REFERENCES mahasiswa(nim) ON DELETE CASCADE,
  mk_id           VARCHAR REFERENCES mata_kuliah(mk_id) ON DELETE CASCADE,
  dosen_id        VARCHAR REFERENCES dosen(dosen_id) ON DELETE SET NULL,
  nilai_tugas_avg DECIMAL(5,2) DEFAULT 0,
  nilai_uts       DECIMAL(5,2) DEFAULT 0,
  nilai_uas       DECIMAL(5,2) DEFAULT 0,
  nilai_akhir     DECIMAL(5,2),
  nilai_huruf     VARCHAR(2),
  status_final    VARCHAR DEFAULT 'DRAFT'
);

-- Tabel Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id        VARCHAR PRIMARY KEY,
  nilai_id      VARCHAR REFERENCES nilai(nilai_id) ON DELETE CASCADE,
  nilai_lama    DECIMAL(5,2),
  nilai_baru    DECIMAL(5,2),
  timestamp     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. FUNCTIONS & TRIGGERS

-- Function: hitung_nilai_akhir
CREATE OR REPLACE FUNCTION hitung_nilai_akhir() 
RETURNS TRIGGER AS $$
DECLARE
    v_bobot_tugas DECIMAL(5,2);
    v_bobot_uts   DECIMAL(5,2);
    v_bobot_uas   DECIMAL(5,2);
BEGIN
    SELECT bobot_tugas, bobot_uts, bobot_uas 
    INTO v_bobot_tugas, v_bobot_uts, v_bobot_uas
    FROM mata_kuliah WHERE mk_id = NEW.mk_id;

    IF FOUND THEN
        NEW.nilai_akhir := (NEW.nilai_tugas_avg * (v_bobot_tugas / 100.0)) + 
                           (NEW.nilai_uts * (v_bobot_uts / 100.0)) + 
                           (NEW.nilai_uas * (v_bobot_uas / 100.0));

        IF NEW.nilai_akhir >= 80 THEN NEW.nilai_huruf := 'A';
        ELSIF NEW.nilai_akhir >= 70 THEN NEW.nilai_huruf := 'B';
        ELSIF NEW.nilai_akhir >= 60 THEN NEW.nilai_huruf := 'C';
        ELSIF NEW.nilai_akhir >= 50 THEN NEW.nilai_huruf := 'D';
        ELSE NEW.nilai_huruf := 'E';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: trg_hitung_nilai_akhir
DROP TRIGGER IF EXISTS trg_hitung_nilai_akhir ON nilai;
CREATE TRIGGER trg_hitung_nilai_akhir
BEFORE INSERT OR UPDATE ON nilai
FOR EACH ROW EXECUTE FUNCTION hitung_nilai_akhir();

-- Function: log_audit_nilai
CREATE OR REPLACE FUNCTION log_audit_nilai() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (log_id, nilai_id, nilai_lama, nilai_baru, timestamp)
    VALUES (gen_random_uuid()::varchar, NEW.nilai_id, OLD.nilai_akhir, NEW.nilai_akhir, CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: trg_audit_nilai
DROP TRIGGER IF EXISTS trg_audit_nilai ON nilai;
CREATE TRIGGER trg_audit_nilai
AFTER UPDATE ON nilai
FOR EACH ROW EXECUTE FUNCTION log_audit_nilai();

-- 4. DATA MIGRATION

-- Data for Administrator
INSERT INTO administrator (admin_id, nama, email, username, password_hash) VALUES
  ('ADM001', 'Super Admin Evalora', 'admin@evalora.id', 'admin', '$2b$10$96R1E5851OQnL.YOfpAsnO6XunXyvEqbVbU1tZ5XWvS4u3o5K6u7W')
ON CONFLICT (admin_id) DO NOTHING;

-- Data for Dosen
INSERT INTO dosen (dosen_id, nama, nip, email, password_hash) VALUES
  ('DSN001', 'Dr. Maya Indah Sari, M.Si', '198503122010122001', 'maya.indah@university.ac.id', NULL),
  ('DSN002', 'Budi Santoso, Ph.D', '197805202005011002', 'budi.santoso@university.ac.id', NULL),
  ('DSN007', 'Agus Prayitno, M.Kom', '199001012015011007', 'agus.p@univ.ac.id', '$2a$10$vN9.7tPzU89E3vL4P8I6Ie.6zW.8h8vR2fG7p0K8w.2mC9pD3rE1S'),
  ('DSN010', 'Dini Aminarti, M.T', '199208152018032010', 'dini.aminarti@univ.ac.id', NULL)
ON CONFLICT (dosen_id) DO NOTHING;

-- Data for Mahasiswa
INSERT INTO mahasiswa (nim, nama, jurusan, alamat, password_hash) VALUES
  ('240605110178', 'Rafiq Alhariri Andriansyah', 'Teknik Informatika', 'Malang', '$2b$10$LgGfa/XJ4YA.htVeTz7QJOOX0FI08H4C9BvB.qPQuewn6pAswdzTe')
ON CONFLICT (nim) DO NOTHING;

-- Data for Mata Kuliah
INSERT INTO "mata_kuliah" ("mk_id", "nama_mk", "bobot_tugas", "bobot_uts", "bobot_uas", "dosen_id") VALUES
  ('SE26', 'Software Engineering', 10.00, 50.00, 40.00, 'DSN007'),
  ('CS001', 'Computer System', 30.00, 30.00, 40.00, 'DSN010')
ON CONFLICT (mk_id) DO NOTHING;

-- Data for Pendaftaran
INSERT INTO "pendaftaran" ("nim", "mk_id") VALUES
  ('240605110178', 'SE26'),
  ('240605110178', 'CS001')
ON CONFLICT (nim, mk_id) DO NOTHING;

-- Note: Nilai and Audit Logs are currently empty in your local dump.
