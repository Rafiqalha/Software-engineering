SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict bHNlkP07lPBGFr734FkQ2CnOPdbBLOcCa5E9buU1zj6tg9Sucd8vjSfRLJCutIg

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: administrator; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."administrator" ("admin_id", "nama", "email", "username", "password_hash") VALUES
	('admin1', 'Super Admin', 'admin@example.com', 'admin', '$2b$10$5klnnfYgxJie9GIChsOr1eCLj4aeXVv.ODXIQD8vTqxT3X.jGlFfW');


--
-- Data for Name: dosen; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."dosen" ("dosen_id", "nama", "nip", "email", "password_hash") VALUES
	('DSN001', 'Dr. Ahmad Fauzi, M.Kom', '198501012010011001', 'ahmad.fauzi@evalora.ac.id', NULL),
	('DSN002', 'Prof. Siti Rahayu, Ph.D', '197603152000032002', 'siti.rahayu@evalora.ac.id', NULL),
	('DSN003', 'Ir. Budi Santoso, M.T', '198212202008011003', 'budi.santoso@evalora.ac.id', NULL),
	('DSN004', 'Dr. Dewi Lestari, M.Si', '198907112015042004', 'dewi.lestari@evalora.ac.id', NULL),
	('DSN005', 'Prof. Hendra Wijaya, M.Sc', '197401082001011005', 'hendra.wijaya@evalora.ac.id', NULL),
	('DSN006', 'Dr. Nurul Hidayah, M.Pd', '198508232012042006', 'nurul.hidayah@evalora.ac.id', NULL),
	('DSN008', 'Dr. Rina Kurniawati, M.Kom', '198310052006042008', 'rina.kurniawati@evalora.ac.id', NULL),
	('DSN009', 'Prof. Drs. Wahyu Saputra, Ph.D', '197208181997031009', 'wahyu.saputra@evalora.ac.id', NULL),
	('DSN007', 'Agus Prasetyo, S.T., M.Eng', '199002152018011007', 'agus.prasetyo@evalora.ac.id', '$2b$10$YPCHWpQXuzoBYbidBykA2ePYTys7VGUO0dB1MSd4ieSTodut/9S/2'),
	('DSN010', 'Dr. Maya Indah Sari, M.Si', '199105302019042010', 'maya.sari@evalora.ac.id', '$2b$10$v.Svlku2YVEKgJ7oMQJopuYrbPrpFkUy6wfQ2VL.6AT2H6wZTtbnC');


--
-- Data for Name: mahasiswa; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."mahasiswa" ("nim", "nama", "jurusan", "alamat", "password_hash") VALUES
	('240605110001', 'Arin Tresna Penggalih', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110002', 'Pandhu Syach Aryanto', 'Teknik Informatika', 'Malang', NULL),
	('240605110003', 'Lailatul Maisurotul Al Auwaliyah', 'Teknik Informatika', 'Tanjung Selor', NULL),
	('240605110004', 'Selfiana', 'Teknik Informatika', 'Tuban', NULL),
	('240605110005', 'Arum Nayla Farhani', 'Teknik Informatika', 'Maumere', NULL),
	('240605110006', 'Mohammad Zaky Abdur Rosyid', 'Teknik Informatika', 'Ngawi', NULL),
	('240605110007', 'Fatimah Habibah Az-Zahra', 'Teknik Informatika', 'Kota Sungai Penuh, Prov. Jambi', NULL),
	('240605110008', 'Ashlahul Umam', 'Teknik Informatika', 'Pati', NULL),
	('240605110009', 'Zakka Yogaraksa', 'Teknik Informatika', 'Kediri', NULL),
	('240605110010', 'Mursiyah Dwi Erlena', 'Teknik Informatika', 'Trenggalek', NULL),
	('240605110011', 'Mochammad Zidney Mas''ariellah', 'Teknik Informatika', 'Sidoarjo', NULL),
	('240605110012', 'Didan Febru Afriza', 'Teknik Informatika', 'Jombang', NULL),
	('240605110013', 'Ghofran', 'Teknik Informatika', 'Pekanbaru, Riau', NULL),
	('240605110015', 'Zentica Putri Destani', 'Teknik Informatika', 'Lumajang', NULL),
	('240605110016', 'Muh Burhanuddin Akbar', 'Teknik Informatika', 'Gresik Bawean Sangkapura', NULL),
	('240605110017', 'Muhammad Raffi Fahlevi', 'Teknik Informatika', 'Palangka Raya', NULL),
	('240605110018', 'Retno Jumilah', 'Teknik Informatika', 'Bima', NULL),
	('240605110019', 'Izza Zulfa Atikah', 'Teknik Informatika', 'Kota Bima', NULL),
	('240605110020', 'Ahmad Ainur Rafi', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110021', 'Mahdi Bawazir', 'Teknik Informatika', 'Jakarta', NULL),
	('240605110022', 'M. Fahrizal Mufti Ash-Shidqi Ad', 'Teknik Informatika', 'Nganjuk', NULL),
	('240605110023', 'Naila Zahrotus Sa''adah', 'Teknik Informatika', 'Tembilahan', NULL),
	('240605110024', 'Muhammad Rifael Satria', 'Teknik Informatika', 'Kuta Lombok Tengah NTB', NULL),
	('240605110025', 'Nur Zidan Ramadhani Oktaviano Putra', 'Teknik Informatika', 'Malang', NULL),
	('240605110026', 'Ria Kurniawati', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110027', 'Muthia Tsany Maghfira', 'Teknik Informatika', 'Pacitan', NULL),
	('240605110028', 'Dika Larasati', 'Teknik Informatika', 'Malang', NULL),
	('240605110029', 'Muhammad Syafi''ul Mubarok', 'Teknik Informatika', 'Jombang', NULL),
	('240605110030', 'Nor Khairina', 'Teknik Informatika', 'Amuntai', NULL),
	('240605110031', 'Nacita Putri Widya Pratiwi', 'Teknik Informatika', 'Tuban', NULL),
	('240605110032', 'Ismy Maziyyatul Aziz', 'Teknik Informatika', 'Indramayu', NULL),
	('240605110033', 'Kurnia Salwa Zakia', 'Teknik Informatika', 'Blitar', NULL),
	('240605110034', 'Louis Ainur Rofiq Prayoga', 'Teknik Informatika', 'Tuban', NULL),
	('240605110035', 'Raditya Idris', 'Teknik Informatika', 'Gorontalo', NULL),
	('240605110036', 'Abdul Aziz Maftuh', 'Teknik Informatika', 'Probolinggo', NULL),
	('240605110037', 'Suci La Arman', 'Teknik Informatika', 'Maluku Tengah', NULL),
	('240605110038', 'Ichlasul Amal', 'Teknik Informatika', 'Bima', NULL),
	('240605110039', 'Reisyal Pandapotan Silalahi', 'Teknik Informatika', 'Kotawaringin Timur', NULL),
	('240605110040', 'Noval Dwi Pamungkas', 'Teknik Informatika', 'Banyuwangi', NULL),
	('240605110041', 'Naufal Mubarok', 'Teknik Informatika', 'Lumajang', NULL),
	('240605110042', 'Rahmatulloh', 'Teknik Informatika', 'Ngawi', NULL),
	('240605110043', 'Muhammad Faiz Lidinillah', 'Teknik Informatika', 'Jombang', NULL),
	('240605110044', 'Fawwaz Abdillah Adiyatma', 'Teknik Informatika', 'Kota Probolinggo', NULL),
	('240605110045', 'Tsabita Rima Syahrojah', 'Teknik Informatika', 'Banyumas', NULL),
	('240605110046', 'Ghizaratul Aisyah', 'Teknik Informatika', 'Mojokerto', NULL),
	('240605110047', 'Naswa Vifda Zalianti', 'Teknik Informatika', 'Lamongan', NULL),
	('240605110048', 'Dimas Setia Adi', 'Teknik Informatika', 'Jombang', NULL),
	('240605110049', 'Nur Iftita Aulia', 'Teknik Informatika', 'Madiun', NULL),
	('240605110050', 'Nabila Najwazzahroh', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110051', 'Panji Fajar Perdana', 'Teknik Informatika', 'Jakarta', NULL),
	('240605110052', 'Alfiatu Nurfaizah', 'Teknik Informatika', 'Malang', NULL),
	('240605110053', 'Kahfiyya Nurzahra Hartono', 'Teknik Informatika', 'Demak', NULL),
	('240605110054', 'Fidian Trisnawati', 'Teknik Informatika', 'Magetan', NULL),
	('240605110055', 'Alzainap Lariza K', 'Teknik Informatika', 'Bajawa', NULL),
	('240605110056', 'Muhammad Irzya Tirtana', 'Teknik Informatika', 'Surabaya', NULL),
	('240605110057', 'Syahla Talitha Darin Atika', 'Teknik Informatika', 'Malang', NULL),
	('240605110058', 'Achmad Farhan Maulana', 'Teknik Informatika', 'Bondowoso', NULL),
	('240605110059', 'Febriana Mariyatul Qibtiyah', 'Teknik Informatika', 'Gresik', NULL),
	('240605110060', 'Najwarizqa Aryandri', 'Teknik Informatika', 'Tuban', NULL),
	('240605110061', 'Keyshayara Qanita Kamila', 'Teknik Informatika', 'Malang', NULL),
	('240605110062', 'Kamila Trihapsari', 'Teknik Informatika', 'Blitar', NULL),
	('240605110063', 'Muhammad Nurrohmad Mujahidin', 'Teknik Informatika', 'Malang', NULL),
	('240605110064', 'Bahrul Ulum Azhari', 'Teknik Informatika', 'Tulungagung', NULL),
	('240605110065', 'Wildan Fikri Zain', 'Teknik Informatika', 'Bangkalan', NULL),
	('240605110066', 'Ahmad Muzakky Halim', 'Teknik Informatika', 'Lumajang', NULL),
	('240605110067', 'Muhammad Alhamdani Rizqi Priyanto', 'Teknik Informatika', 'Makassar', NULL),
	('240605110069', 'Nisriina Almaas Tsabita', 'Teknik Informatika', 'Kintamani', NULL),
	('240605110070', 'Rafli Luqman Santoso', 'Teknik Informatika', 'Mojokerto', NULL),
	('240605110072', 'Muhammad Fahmi Yusuf', 'Teknik Informatika', 'Surabaya', NULL),
	('240605110073', 'Alivia Wahyu Riandini', 'Teknik Informatika', 'Soe NTT', NULL),
	('240605110074', 'Safitri Suryandari', 'Teknik Informatika', 'Malang', NULL),
	('240605110075', 'Mutia Ardelia Rokhima', 'Teknik Informatika', 'Kediri', NULL),
	('240605110076', 'Nisaul Bilad Ismi', 'Teknik Informatika', 'Kudus', NULL),
	('240605110077', 'M. Taufiq Muzakky', 'Teknik Informatika', 'Jombang', NULL),
	('240605110078', 'Nur Azizah Riska Rajabiy', 'Teknik Informatika', 'Sumenep', NULL),
	('240605110079', 'Erlangga Andi Saputra', 'Teknik Informatika', 'Jakarta', NULL),
	('240605110080', 'Dimas Bagus Hari Murti', 'Teknik Informatika', 'Trenggalek', NULL),
	('240605110081', 'Nabilla Suci Rahmawati', 'Teknik Informatika', 'Kotabumi', NULL),
	('240605110082', 'Muhammad Alif Mujaddid', 'Teknik Informatika', 'Lamongan', NULL),
	('240605110083', 'Firman Fadilah Noor', 'Teknik Informatika', 'Tulungagung', NULL),
	('240605110084', 'Safri Firzan Sururi', 'Teknik Informatika', 'Pamekasan', NULL),
	('240605110085', 'Rayya Naura Zahira', 'Teknik Informatika', 'Sampang', NULL),
	('240605110086', 'Alif Fakhrul Hakim', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110087', 'Faril Isra Albiansyah', 'Teknik Informatika', 'Malang', NULL),
	('240605110088', 'Erai Bagusalim', 'Teknik Informatika', 'Tangerang', NULL),
	('240605110089', 'Rahmah Rizqina Mardlotillah', 'Teknik Informatika', 'Gresik', NULL),
	('240605110090', 'Setyo Pratama Putra Wibowo', 'Teknik Informatika', 'Magelang', NULL),
	('240605110091', 'Muhammad Afif Shohibulloh', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110092', 'Theo Septian Nur Muhammad Sakti', 'Teknik Informatika', 'Nganjuk', NULL),
	('240605110093', 'Sugeng Jayadi', 'Teknik Informatika', 'Mataram NTB', NULL),
	('240605110094', 'Raihan Akbar Bachtiar', 'Teknik Informatika', 'Sidoarjo', NULL),
	('240605110095', 'Irfan Satya Abinaya', 'Teknik Informatika', 'Kota Malang', NULL),
	('240605110096', 'Sultan Krishna Nugraha', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110097', 'Muhammad Naufal Hanif', 'Teknik Informatika', 'Malang', NULL),
	('240605110098', 'Muhammad Rasya Faiz Fajar Nabil', 'Teknik Informatika', 'Tuban', NULL),
	('240605110099', 'Ghazy Praba Aryasatya', 'Teknik Informatika', 'Depok', NULL),
	('240605110100', 'Muhammad Bagus Kurniawan', 'Teknik Informatika', 'Tanah Bumbu', NULL),
	('240605110101', 'Muhamad Faqih Assya''roni', 'Teknik Informatika', 'Ds. Tempuran Kec. Pungging Kab. Mojokerto', NULL),
	('240605110102', 'Muhammad Rizqullah Saputra', 'Teknik Informatika', 'Tangerang', NULL),
	('240605110103', 'Mukhammad Miqdad Ibnu Sabil', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110104', 'Vanya Nyssa Maulida', 'Teknik Informatika', 'Medan', NULL),
	('240605110105', 'Bagas Prio Nugroho', 'Teknik Informatika', 'Cimahi', NULL),
	('240605110106', 'Habib Syaiful Aulia''', 'Teknik Informatika', 'Surabaya', NULL),
	('240605110107', 'Devandriya Athallah Putrayana', 'Teknik Informatika', 'Tuban', NULL),
	('240605110108', 'Muhammad Fauzan Aryahusein', 'Teknik Informatika', 'Bekasi', NULL),
	('240605110109', 'Sulthan Adam Rahmadi', 'Teknik Informatika', 'Bogor', NULL),
	('240605110110', 'Geraldy Putra Fazrian', 'Teknik Informatika', 'Malang', NULL),
	('240605110111', 'Yusuf Maulana Nur Rasidi', 'Teknik Informatika', 'Bondowoso', NULL),
	('240605110112', 'Muhammad Hasan Al Asy''ari', 'Teknik Informatika', 'Malang', NULL),
	('240605110113', 'Mutiara Putri Faradilla', 'Teknik Informatika', 'Jakarta', NULL),
	('240605110114', 'Maulvi Ilmullah Faturrahman Al Afghani', 'Teknik Informatika', 'Jayapura', NULL),
	('240605110115', 'Muhammad Murtaqi Yahya', 'Teknik Informatika', 'Malang', NULL),
	('240605110116', 'M. Ikhwan Fahmi', 'Teknik Informatika', 'Malang', NULL),
	('240605110117', 'Radyt Guruh Handika', 'Teknik Informatika', 'Magetan', NULL),
	('240605110118', 'Muafa Hanif Prayogo', 'Teknik Informatika', 'Malang', NULL),
	('240605110119', 'Hilmi Aziz', 'Teknik Informatika', 'Kota Pasuruan', NULL),
	('240605110120', 'Mochammad Rafie Rasydan Al Rifqi', 'Teknik Informatika', 'Ketapang', NULL),
	('240605110121', 'Abdul Rochim', 'Teknik Informatika', 'Tuban', NULL),
	('240605110122', 'Ramanda Oktaviano Ahmad Deanova', 'Teknik Informatika', 'Bekasi', NULL),
	('240605110123', 'R Muhammad Hanif Yasir Putra Susilandaru', 'Teknik Informatika', 'Malang', NULL),
	('240605110124', 'Fahrama Yordan Kesuma Putra', 'Teknik Informatika', 'Kediri', NULL),
	('240605110125', 'Imam Abdul Hakim', 'Teknik Informatika', 'Indramayu', NULL),
	('240605110126', 'Zidnia Ilma Arifa', 'Teknik Informatika', 'Sidoarjo', NULL),
	('240605110127', 'Ilham Sinda Firmansyah', 'Teknik Informatika', 'Malang', NULL),
	('240605110128', 'Moch. Rasya Irgiawan', 'Teknik Informatika', 'Malang', NULL),
	('240605110129', 'Moh Roghil Affan Ramadani', 'Teknik Informatika', 'Pamekasan', NULL),
	('240605110130', 'Arfa''izza Rayhani Azzahra', 'Teknik Informatika', 'Palangka Raya', NULL),
	('240605110131', 'Ulin Ni''matil Khamidiyah', 'Teknik Informatika', 'Kediri', NULL),
	('240605110132', 'Mauluda Aminaditya', 'Teknik Informatika', 'Malang', NULL),
	('240605110133', 'Mochammad Rafi''Ikmal Muchlisin', 'Teknik Informatika', 'Malang', NULL),
	('240605110134', 'Ivandhiem Al Khowwaash', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110135', 'Karina Eka Septiana', 'Teknik Informatika', 'Grobogan', NULL),
	('240605110136', 'Nadia Tria Almuqoffa', 'Teknik Informatika', 'Blora', NULL),
	('240605110137', 'Adinda Nilam Cahya Putri Sina', 'Teknik Informatika', 'Blitar', NULL),
	('240605110138', 'Ahmad Faisal Ferdyansah', 'Teknik Informatika', 'Probolinggo', NULL),
	('240605110139', 'Muhammad Abdul Aziiz', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110140', 'Zulki Ade Agustino', 'Teknik Informatika', 'Probolinggo', NULL),
	('240605110141', 'Athallah Rajendra Putra Juniarto', 'Teknik Informatika', 'Bondowoso', NULL),
	('240605110142', 'Rizaldi Saputra', 'Teknik Informatika', 'Blitar', NULL),
	('240605110143', 'Saleh Basyaib', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110144', 'Siti Alfinahur Salsabila', 'Teknik Informatika', 'Sidoarjo', NULL),
	('240605110145', 'Sarafina Saquita', 'Teknik Informatika', 'Blitar', NULL),
	('240605110146', 'Arinda Noer Agit', 'Teknik Informatika', 'Melak', NULL),
	('240605110147', 'Muhammad Akmalul Fikri', 'Teknik Informatika', 'Lamongan', NULL),
	('240605110148', 'Muhammad Rafi Ammar Gerald', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110149', 'Ahmad Rizky Zakiyyah', 'Teknik Informatika', 'Malang', NULL),
	('240605110150', 'Ryan Athallah Subekti', 'Teknik Informatika', 'Malang', NULL),
	('240605110151', 'Ega Fikri Prayoga', 'Teknik Informatika', 'Malang', NULL),
	('240605110152', 'Ahmed Yasser Luma'' Nahsril Ilah', 'Teknik Informatika', 'Probolinggo', NULL),
	('240605110153', 'Hafiz Fiqul Ahmad', 'Teknik Informatika', 'Wonogiri', NULL),
	('240605110154', 'Muhammad Farras Mufadhdhal', 'Teknik Informatika', 'Bukittinggi', NULL),
	('240605110155', 'Faiz Fatiha Anwar', 'Teknik Informatika', 'Makale', NULL),
	('240605110156', 'Febriami Zahra Guhir', 'Teknik Informatika', 'Kalabahi', NULL),
	('240605110157', 'Rahmat Rafi Indrayani', 'Teknik Informatika', 'Bojonegoro', NULL),
	('240605110158', 'Dika Muhammad Iqbal Marangga', 'Teknik Informatika', 'Kediri', NULL),
	('240605110159', 'Sri Mustika Indah Permata Putri', 'Teknik Informatika', 'Parepare, Sulawesi Selatan', NULL),
	('240605110160', 'Muhammad Nailul Ghufron Majid', 'Teknik Informatika', 'Arso', NULL),
	('240605110161', 'Naufal Ghali Rahadi', 'Teknik Informatika', 'Malang', NULL),
	('240605110162', 'Sholeh Afandi Al Hakim', 'Teknik Informatika', 'Bogor', NULL),
	('240605110163', 'Toni Abiyu Daffa', 'Teknik Informatika', 'Probolinggo', NULL),
	('240605110164', 'Rahul Surya Wibowo', 'Teknik Informatika', 'Tulang Bawang', NULL),
	('240605110165', 'Alia Julyanti', 'Teknik Informatika', 'Blitar', NULL),
	('240605110166', 'Nadya Clarisa Az-Zahra', 'Teknik Informatika', 'Jombang', NULL),
	('240605110167', 'Raditya Bintang Maulana', 'Teknik Informatika', 'Karawang', NULL),
	('240605110168', 'Arzaki Muhamad Fadil', 'Teknik Informatika', 'Karanganyar', NULL),
	('240605110169', 'Syech Zulfikar Luthfi Al Khawarizmi', 'Teknik Informatika', 'Lhokseumawe', NULL),
	('240605110170', 'Wahyu Rizki Yanuari', 'Teknik Informatika', 'Probolinggo', NULL),
	('240605110171', 'Ahmad Faiz Habibillah', 'Teknik Informatika', 'Mojokerto', NULL),
	('240605110172', 'Muhammad Aditya Dermawan', 'Teknik Informatika', 'Lubuklinggau', NULL),
	('240605110173', 'Hayyi Al Ghifari', 'Teknik Informatika', 'Ulee Kareng, Aceh', NULL),
	('240605110174', 'Muhammad Langgeng Zainul Irsyad Tsalis', 'Teknik Informatika', 'Jambi', NULL),
	('240605110175', 'Muhammad Fachri Hafizh Saleh', 'Teknik Informatika', 'Jakarta', NULL),
	('240605110176', 'Farrel Faiziaulhaq Azmi', 'Teknik Informatika', 'Kota Madiun', NULL),
	('240605110177', 'Ahmad Harits Albaihaqi', 'Teknik Informatika', 'Tulungagung', NULL),
	('240605110179', 'Muhammad Abdul Rochim', 'Teknik Informatika', 'Jombang', NULL),
	('240605110180', 'Muhammad Abdillah Kais Al Akmal', 'Teknik Informatika', 'Mojokerto', NULL),
	('240605110181', 'Sofwan Hakim Sayyidan', 'Teknik Informatika', 'Sukabumi', NULL),
	('240605110182', 'Muktibaskara Kusbianto', 'Teknik Informatika', 'Palangkaraya, Kalimantan Tengah', NULL),
	('240605110183', 'Agni Galuh Essa Vandriya', 'Teknik Informatika', 'Nganjuk', NULL),
	('240605110184', 'Gading Satrya Pratama', 'Teknik Informatika', 'Malang', NULL),
	('240605110185', 'Ivan Ghozali', 'Teknik Informatika', 'Pekanbaru', NULL),
	('240605110186', 'Dhamar Abinaya Fikra', 'Teknik Informatika', 'Surabaya', NULL),
	('240605110187', 'Ahmad Zakky Ilyas Fanani', 'Teknik Informatika', 'Malang', NULL),
	('240605110188', 'Wahyu Aji Laksono', 'Teknik Informatika', 'Jakarta', NULL),
	('240605110189', 'Dian Febrian Nur Cahyo', 'Teknik Informatika', 'Batu', NULL),
	('240605110190', 'Redhita Annora Manggarani', 'Teknik Informatika', 'Malang', NULL),
	('240605110191', 'Palmeda Abigail Yunta Paris', 'Teknik Informatika', 'Kediri', NULL),
	('240605110192', 'Jovian Resha Maulana Imam', 'Teknik Informatika', 'Malang', NULL),
	('240605110193', 'Daffa Ali Darajat Satriyo Pamburitan', 'Teknik Informatika', 'Sidoarjo', NULL),
	('240605110194', 'Azmil Muzacky Qilmi', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110195', 'Muhammad Dzulkarnain Aji Pamungkas Asy-Syafe''i', 'Teknik Informatika', 'Bogor', NULL),
	('240605110196', 'Muh. Reza Zulfikar', 'Teknik Informatika', 'Barru', NULL),
	('240605110197', 'Farah Aufa Huwaidah', 'Teknik Informatika', 'Madiun', NULL),
	('240605110198', 'Ahmad Firdaus Nur Kahfi', 'Teknik Informatika', 'Malang', NULL),
	('240605110199', 'Muhammad Ihsan Anshorudin', 'Teknik Informatika', 'Malang', NULL),
	('240605110200', 'Muhammad Rafiul Kholid', 'Teknik Informatika', 'Desa Hangtuah', NULL),
	('240605110201', 'Satria Badrus Salam Al Muhibbin', 'Teknik Informatika', 'Malang', NULL),
	('240605110202', 'Jihan Nabilah Falahi', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110203', 'Siti Maimunah', 'Teknik Informatika', 'Kediri', NULL),
	('240605110204', 'Diva Zahira Aulia Salsabila', 'Teknik Informatika', 'Tulungagung', NULL),
	('240605110205', 'Maharani Azzahra', 'Teknik Informatika', 'Batu', NULL),
	('240605110206', 'Afzaal Abrar Hidayat', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110207', 'M. Fajar Maulana Afidiyanto', 'Teknik Informatika', 'Brebes', NULL),
	('240605110208', 'Ahmad Kholishun Ni''am', 'Teknik Informatika', 'Kemuja', NULL),
	('240605110209', 'Mahsa Muhammad Razaqtani', 'Teknik Informatika', 'Kudus', NULL),
	('240605110210', 'Nafilla Afania Safitri', 'Teknik Informatika', 'Bogor', NULL),
	('240605110211', 'Yahya Ayyasy Al-Muhandis', 'Teknik Informatika', 'Ponorogo', NULL),
	('240605110212', 'Roudhotul Janah', 'Teknik Informatika', 'Magetan', NULL),
	('240605110213', 'Nurul Safika', 'Teknik Informatika', 'Banyuwangi', NULL),
	('240605110214', 'Muh. Firdaus', 'Teknik Informatika', 'Makassar', NULL),
	('240605110215', 'Herlinda Agustina', 'Teknik Informatika', 'Banyuwangi', NULL),
	('240605110216', 'Ahmad Zamroni', 'Teknik Informatika', 'Bangkalan', NULL),
	('240605110217', 'Ahmad Danish Raditya', 'Teknik Informatika', 'Tuban', NULL),
	('240605110218', 'Muhammad Hikmal Nur Khariri', 'Teknik Informatika', 'Malang', NULL),
	('240605110219', 'Naufal Rafi Hibatullah', 'Teknik Informatika', 'Malang', NULL),
	('240605110220', 'Ahmad Damar Amrullah', 'Teknik Informatika', 'Blitar', NULL),
	('240605110221', 'M Fahd Khulloh', 'Teknik Informatika', 'Malang', NULL),
	('240605110222', 'Tia Izzati Widyana', 'Teknik Informatika', 'Jakarta', NULL),
	('240605110223', 'Muhammad Fadhil Zusna Arrafi', 'Teknik Informatika', 'Blitar', NULL),
	('240605110224', 'Alda Fuadiyah Maghfuroh Sumarno', 'Teknik Informatika', 'Malang', NULL),
	('240605110225', 'Mochammad Hafidz Wido Mulyawan', 'Teknik Informatika', 'Malang', NULL),
	('240605110226', 'Salman Ramadhan Zein', 'Teknik Informatika', 'Surabaya', NULL),
	('240605110227', 'Arya Kharisudin Irfani', 'Teknik Informatika', 'Kediri', NULL),
	('240605110228', 'Aldza Salwatul Aisy', 'Teknik Informatika', 'Lamongan', NULL),
	('240605110229', 'Ach. Fajar Asy''ari', 'Teknik Informatika', 'Sumenep', NULL),
	('240605110230', 'Fristya Nira Wianingrum', 'Teknik Informatika', 'Sragen', NULL),
	('240605110231', 'Moh. Isro'' Ridzaul Karim', 'Teknik Informatika', 'Pamekasan', NULL),
	('240605110232', 'Muhammad Refki Andesta', 'Teknik Informatika', 'Tangerang', NULL),
	('240605110233', 'Alfin Najah Hasan', 'Teknik Informatika', 'Sumenep', NULL),
	('240605110234', 'Nafisatus Zahra', 'Teknik Informatika', 'Sumenep', NULL),
	('240605110235', 'Muhammad Jalaluddin', 'Teknik Informatika', 'Majalengka', NULL),
	('240605110236', 'Rizyallatul Nurvita Meindika Putri', 'Teknik Informatika', 'Ngawi', NULL),
	('240605110237', 'Narendra Rafi Firdousi', 'Teknik Informatika', 'Malang', NULL),
	('240605110238', 'Hasmi', 'Teknik Informatika', 'Sumenep', NULL),
	('240605110239', 'Fahmi Zaki Darmawan', 'Teknik Informatika', 'Bangkalan', NULL),
	('240605110240', 'Nazwa Umrotul Afiah', 'Teknik Informatika', 'Sidoarjo', NULL),
	('240605110241', 'Veronica Aisyah Nabilla', 'Teknik Informatika', 'Trenggalek', NULL),
	('240605110242', 'Salsabilla Fadillah Safina', 'Teknik Informatika', 'Malang', NULL),
	('240605110243', 'Muhamad Farel Nabil', 'Teknik Informatika', 'Malang', NULL),
	('240605110244', 'Abdul Syukur Saleh Saban', 'Teknik Informatika', 'Kambara', NULL),
	('240605110245', 'Dwi Ahmad Reski', 'Teknik Informatika', 'Makassar', NULL),
	('240605110246', 'Muhammad Ainul Yakhin', 'Teknik Informatika', 'Denpasar Bali', NULL),
	('240605110247', 'Maulana Muhammad Iqbal', 'Teknik Informatika', 'Malang', NULL),
	('240605110248', 'Moh. Wirdiyan Wadudi', 'Teknik Informatika', 'Sumenep', NULL),
	('240605110249', 'Umi Lutfiyah', 'Teknik Informatika', 'Nganjuk', NULL),
	('240605110250', 'Tria Nur Hidayah', 'Teknik Informatika', 'Jombang', NULL),
	('240605110251', 'Dwi Zahra Nabilah Hadi', 'Teknik Informatika', 'Ge''tengan', NULL),
	('240605110252', 'Muhamad Kevin Dwi Arisandi', 'Teknik Informatika', 'Malang', NULL),
	('240605110253', 'Yusuf Mahaputra Mukti', 'Teknik Informatika', 'Malang', NULL),
	('240605110254', 'Tu Bagus Muhammad Zaka Ibnu Yazid', 'Teknik Informatika', 'Mojokerto', NULL),
	('240605110255', 'Mochamad Raihan Fitrianto', 'Teknik Informatika', 'Lhokseumawe', NULL),
	('240605110256', 'Ahmad Naqib Asy-Syibly', 'Teknik Informatika', 'Malang', NULL),
	('240605110257', 'Moh. Azka Fariqi', 'Teknik Informatika', 'Nganjuk', NULL),
	('240605110258', 'Yasmin Winda Masruroh', 'Teknik Informatika', 'Sidoarjo', NULL),
	('240605110259', 'Mukhammad Nuruddin Al Haffaf', 'Teknik Informatika', 'Pasuruan', NULL),
	('240605110260', 'Khadijah', 'Teknik Informatika', 'Sampang', NULL),
	('240605110261', 'Muhammad Fadhillah Rizqi Akbar', 'Teknik Informatika', 'Denpasar', NULL),
	('240605110262', 'Mochammad Agus Rozakhy', 'Teknik Informatika', 'Malang', NULL),
	('240605110263', 'Abdul Hamid Dehana Friandana', 'Teknik Informatika', 'Lamongan', NULL),
	('240605110178', 'Rafiq Alhariri Andriansyah', 'Teknik Informatika', 'Malang', '$2b$10$LgGfa/XJ4YA.htVeTz7QJOOX0FI08H4C9BvB.qPQuewn6pAswdzTe');


--
-- Data for Name: mata_kuliah; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."mata_kuliah" ("mk_id", "nama_mk", "bobot_tugas", "bobot_uts", "bobot_uas", "dosen_id") VALUES
	('SE26', 'Software Engineering', 10.00, 50.00, 40.00, 'DSN007'),
	('CS001', 'Computer System', 30.00, 30.00, 40.00, 'DSN010');


--
-- Data for Name: nilai; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: pendaftaran; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."pendaftaran" ("nim", "mk_id") VALUES
	('240605110178', 'SE26'),
	('240605110178', 'CS001');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict bHNlkP07lPBGFr734FkQ2CnOPdbBLOcCa5E9buU1zj6tg9Sucd8vjSfRLJCutIg

RESET ALL;
