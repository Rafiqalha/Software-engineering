INSERT INTO dosen (dosen_id, nama, nip, email) VALUES
  ('DSN001', 'Dr. Ahmad Fauzi, M.Kom', '198501012010011001', 'ahmad.fauzi@evalora.ac.id'),
  ('DSN002', 'Prof. Siti Rahayu, Ph.D', '197603152000032002', 'siti.rahayu@evalora.ac.id'),
  ('DSN003', 'Ir. Budi Santoso, M.T', '198212202008011003', 'budi.santoso@evalora.ac.id'),
  ('DSN004', 'Dr. Dewi Lestari, M.Si', '198907112015042004', 'dewi.lestari@evalora.ac.id'),
  ('DSN005', 'Prof. Hendra Wijaya, M.Sc', '197401082001011005', 'hendra.wijaya@evalora.ac.id'),
  ('DSN006', 'Dr. Nurul Hidayah, M.Pd', '198508232012042006', 'nurul.hidayah@evalora.ac.id'),
  ('DSN007', 'Agus Prasetyo, S.T., M.Eng', '199002152018011007', 'agus.prasetyo@evalora.ac.id'),
  ('DSN008', 'Dr. Rina Kurniawati, M.Kom', '198310052006042008', 'rina.kurniawati@evalora.ac.id'),
  ('DSN009', 'Prof. Drs. Wahyu Saputra, Ph.D', '197208181997031009', 'wahyu.saputra@evalora.ac.id'),
  ('DSN010', 'Dr. Maya Indah Sari, M.Si', '199105302019042010', 'maya.sari@evalora.ac.id')
ON CONFLICT (dosen_id) DO NOTHING;
