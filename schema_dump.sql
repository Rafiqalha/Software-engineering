


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."hitung_nilai_akhir"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."hitung_nilai_akhir"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_audit_nilai"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."log_audit_nilai"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."administrator" (
    "admin_id" character varying NOT NULL,
    "nama" character varying NOT NULL,
    "email" character varying,
    "username" character varying,
    "password_hash" character varying
);


ALTER TABLE "public"."administrator" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "log_id" character varying NOT NULL,
    "nilai_id" character varying,
    "nilai_lama" numeric(5,2),
    "nilai_baru" numeric(5,2),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dosen" (
    "dosen_id" character varying NOT NULL,
    "nama" character varying NOT NULL,
    "nip" character varying,
    "email" character varying,
    "password_hash" character varying
);


ALTER TABLE "public"."dosen" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mahasiswa" (
    "nim" character varying NOT NULL,
    "nama" character varying NOT NULL,
    "jurusan" character varying,
    "alamat" character varying,
    "password_hash" character varying
);


ALTER TABLE "public"."mahasiswa" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mata_kuliah" (
    "mk_id" character varying NOT NULL,
    "nama_mk" character varying NOT NULL,
    "bobot_tugas" numeric(5,2) NOT NULL,
    "bobot_uts" numeric(5,2) NOT NULL,
    "bobot_uas" numeric(5,2) NOT NULL,
    "dosen_id" character varying,
    CONSTRAINT "chk_bobot" CHECK (((("bobot_tugas" + "bobot_uts") + "bobot_uas") = (100)::numeric))
);


ALTER TABLE "public"."mata_kuliah" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nilai" (
    "nilai_id" character varying NOT NULL,
    "nim" character varying,
    "mk_id" character varying,
    "dosen_id" character varying,
    "nilai_tugas_avg" numeric(5,2) DEFAULT 0,
    "nilai_uts" numeric(5,2) DEFAULT 0,
    "nilai_uas" numeric(5,2) DEFAULT 0,
    "nilai_akhir" numeric(5,2),
    "nilai_huruf" character varying(2),
    "status_final" character varying DEFAULT 'DRAFT'::character varying
);


ALTER TABLE "public"."nilai" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pendaftaran" (
    "nim" character varying NOT NULL,
    "mk_id" character varying NOT NULL
);


ALTER TABLE "public"."pendaftaran" OWNER TO "postgres";


ALTER TABLE ONLY "public"."administrator"
    ADD CONSTRAINT "administrator_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."administrator"
    ADD CONSTRAINT "administrator_pkey" PRIMARY KEY ("admin_id");



ALTER TABLE ONLY "public"."administrator"
    ADD CONSTRAINT "administrator_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("log_id");



ALTER TABLE ONLY "public"."dosen"
    ADD CONSTRAINT "dosen_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."dosen"
    ADD CONSTRAINT "dosen_nip_key" UNIQUE ("nip");



ALTER TABLE ONLY "public"."dosen"
    ADD CONSTRAINT "dosen_pkey" PRIMARY KEY ("dosen_id");



ALTER TABLE ONLY "public"."mahasiswa"
    ADD CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("nim");



ALTER TABLE ONLY "public"."mata_kuliah"
    ADD CONSTRAINT "mata_kuliah_pkey" PRIMARY KEY ("mk_id");



ALTER TABLE ONLY "public"."nilai"
    ADD CONSTRAINT "nilai_pkey" PRIMARY KEY ("nilai_id");



ALTER TABLE ONLY "public"."pendaftaran"
    ADD CONSTRAINT "pendaftaran_pkey" PRIMARY KEY ("nim", "mk_id");



CREATE OR REPLACE TRIGGER "trg_audit_nilai" AFTER UPDATE ON "public"."nilai" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_nilai"();



CREATE OR REPLACE TRIGGER "trg_hitung_nilai_akhir" BEFORE INSERT OR UPDATE ON "public"."nilai" FOR EACH ROW EXECUTE FUNCTION "public"."hitung_nilai_akhir"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_nilai_id_fkey" FOREIGN KEY ("nilai_id") REFERENCES "public"."nilai"("nilai_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mata_kuliah"
    ADD CONSTRAINT "mata_kuliah_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("dosen_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."nilai"
    ADD CONSTRAINT "nilai_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("dosen_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."nilai"
    ADD CONSTRAINT "nilai_mk_id_fkey" FOREIGN KEY ("mk_id") REFERENCES "public"."mata_kuliah"("mk_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nilai"
    ADD CONSTRAINT "nilai_nim_fkey" FOREIGN KEY ("nim") REFERENCES "public"."mahasiswa"("nim") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pendaftaran"
    ADD CONSTRAINT "pendaftaran_mk_id_fkey" FOREIGN KEY ("mk_id") REFERENCES "public"."mata_kuliah"("mk_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pendaftaran"
    ADD CONSTRAINT "pendaftaran_nim_fkey" FOREIGN KEY ("nim") REFERENCES "public"."mahasiswa"("nim") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."hitung_nilai_akhir"() TO "anon";
GRANT ALL ON FUNCTION "public"."hitung_nilai_akhir"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."hitung_nilai_akhir"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_audit_nilai"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_audit_nilai"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_audit_nilai"() TO "service_role";


















GRANT ALL ON TABLE "public"."administrator" TO "anon";
GRANT ALL ON TABLE "public"."administrator" TO "authenticated";
GRANT ALL ON TABLE "public"."administrator" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."dosen" TO "anon";
GRANT ALL ON TABLE "public"."dosen" TO "authenticated";
GRANT ALL ON TABLE "public"."dosen" TO "service_role";



GRANT ALL ON TABLE "public"."mahasiswa" TO "anon";
GRANT ALL ON TABLE "public"."mahasiswa" TO "authenticated";
GRANT ALL ON TABLE "public"."mahasiswa" TO "service_role";



GRANT ALL ON TABLE "public"."mata_kuliah" TO "anon";
GRANT ALL ON TABLE "public"."mata_kuliah" TO "authenticated";
GRANT ALL ON TABLE "public"."mata_kuliah" TO "service_role";



GRANT ALL ON TABLE "public"."nilai" TO "anon";
GRANT ALL ON TABLE "public"."nilai" TO "authenticated";
GRANT ALL ON TABLE "public"."nilai" TO "service_role";



GRANT ALL ON TABLE "public"."pendaftaran" TO "anon";
GRANT ALL ON TABLE "public"."pendaftaran" TO "authenticated";
GRANT ALL ON TABLE "public"."pendaftaran" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































