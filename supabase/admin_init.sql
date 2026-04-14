ALTER TABLE administrator ADD COLUMN IF NOT EXISTS username VARCHAR UNIQUE;
ALTER TABLE administrator ADD COLUMN IF NOT EXISTS password_hash VARCHAR;
INSERT INTO administrator (admin_id, nama, email, username, password_hash)
VALUES ('admin1', 'Super Admin', 'admin@evalora.ac.id', 'admin', '$2a$10$XQxBj9HCJZ8Z8Z8Z8Z8Z8OjY3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z')
ON CONFLICT (admin_id) DO NOTHING;
