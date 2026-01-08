-- ============================================================
-- SISWA CONNECT SEED DATA - SQLite Version
-- Test data for development and initial deployment
-- Version: 3.0.0
-- ============================================================

-- Note: SQLite doesn't have ON DUPLICATE KEY UPDATE
-- Using INSERT OR REPLACE instead

-- ============================================================
-- 1. USERS DATA
-- Password for all users: "password"
-- Hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- 
-- ⚠️ SECURITY WARNING:
-- These are DEVELOPMENT/TESTING credentials only!
-- ============================================================

INSERT OR REPLACE INTO users (id, username, password_hash, role, name, nip, mapel, is_active) VALUES
  (1, 'superadmin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUPER_ADMIN', 'Super Administrator', NULL, NULL, 1),
  (2, 'admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'Admin Sekolah', NULL, NULL, 1),
  (3, 'operator', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'OPERATOR', 'Operator Piket', NULL, NULL, 1),
  (4, 'guru1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TEACHER', 'Bpk. Joko Widodo', '19610621 198503 1 001', 'Matematika', 1),
  (5, 'guru2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TEACHER', 'Ibu Sri Mulyani', '19620826 198703 2 005', 'Ekonomi', 1),
  (6, 'guru3', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TEACHER', 'Bpk. Ganjar Pranowo', NULL, 'Sejarah', 1);

-- ============================================================
-- 2. TEACHERS DATA
-- ============================================================

INSERT OR REPLACE INTO teachers (id, nama, mapel, nip, nuptk, email, phone, is_active) VALUES
  (1, 'Bpk. Joko Widodo', 'Matematika', '19610621 198503 1 001', '1234567890123456', 'joko.widodo@smpn4smr.sch.id', '081234567801', 1),
  (2, 'Ibu Sri Mulyani', 'Ekonomi', '19620826 198703 2 005', '9876543210987654', 'sri.mulyani@smpn4smr.sch.id', '081234567802', 1),
  (3, 'Bpk. Ganjar Pranowo', 'Sejarah', '19681015 199203 1 003', '5566778899001122', 'ganjar.pranowo@smpn4smr.sch.id', '081234567803', 1),
  (4, 'Ibu Retno Marsudi', 'Bahasa Inggris', '19621127 198601 2 002', '1122334455667788', 'retno.marsudi@smpn4smr.sch.id', '081234567804', 1),
  (5, 'Bpk. Nadiem Makarim', 'TIK', '19840420 200901 1 004', '2233445566778899', 'nadiem.makarim@smpn4smr.sch.id', '081234567805', 1),
  (6, 'Ibu Tri Rismaharini', 'PKN', '19611120 198403 2 006', '3344556677889900', 'tri.rismaharini@smpn4smr.sch.id', '081234567806', 1),
  (7, 'Bpk. Anies Baswedan', 'Bahasa Indonesia', '19690507 199303 1 007', '4455667788990011', 'anies.baswedan@smpn4smr.sch.id', '081234567807', 1),
  (8, 'Ibu Susi Pudjiastuti', 'IPA', '19650115 198803 2 008', '5566778899001122', 'susi.pudjiastuti@smpn4smr.sch.id', '081234567808', 1),
  (9, 'Bpk. Erick Thohir', 'Olahraga', '19700516 199503 1 009', '6677889900112233', 'erick.thohir@smpn4smr.sch.id', '081234567809', 1),
  (10, 'Ibu Khofifah Indar', 'Agama Islam', '19650908 198703 2 010', '7788990011223344', 'khofifah.indar@smpn4smr.sch.id', '081234567810', 1),
  (11, 'Bpk. Ridwan Kamil', 'Seni Budaya', '19711004 199603 1 011', '8899001122334455', 'ridwan.kamil@smpn4smr.sch.id', '081234567811', 1),
  (12, 'Ibu Risma Hartati', 'IPS', '19630920 198803 2 012', '9900112233445566', 'risma.hartati@smpn4smr.sch.id', '081234567812', 1),
  (13, 'Bpk. Sandiaga Uno', 'Prakarya', '19690628 199403 1 013', '0011223344556677', 'sandiaga.uno@smpn4smr.sch.id', '081234567813', 1),
  (14, 'Ibu Najwa Shihab', 'Bahasa Inggris', '19740908 200001 2 014', '1122334455667788', 'najwa.shihab@smpn4smr.sch.id', '081234567814', 1),
  (15, 'Bpk. Gita Wirjawan', 'Ekonomi', '19650925 199003 1 015', '2233445566778899', 'gita.wirjawan@smpn4smr.sch.id', '081234567815', 1);

-- ============================================================
-- 3. CLASSES DATA
-- ============================================================

INSERT OR REPLACE INTO classes (id, kode, nama, wali_kelas_id, jumlah_siswa, tahun_ajaran, is_active) VALUES
  (1, '0071', 'VII-1', 1, 32, '2025/2026', 1),
  (2, '0072', 'VII-2', 2, 31, '2025/2026', 1),
  (3, '0073', 'VII-3', 3, 33, '2025/2026', 1),
  (4, '0074', 'VII-4', 4, 30, '2025/2026', 1),
  (5, '0081', 'VIII-1', 5, 28, '2025/2026', 1),
  (6, '0082', 'VIII-2', 6, 29, '2025/2026', 1),
  (7, '0083', 'VIII-3', 7, 31, '2025/2026', 1),
  (8, '0084', 'VIII-4', 8, 30, '2025/2026', 1),
  (9, '0091', 'IX-1', 9, 27, '2025/2026', 1),
  (10, '0092', 'IX-2', 10, 28, '2025/2026', 1),
  (11, '0093', 'IX-3', 11, 29, '2025/2026', 1),
  (12, '0094', 'IX-4', 12, 26, '2025/2026', 1);

-- ============================================================
-- DEFAULT LOGIN CREDENTIALS (for reference)
-- ============================================================
-- Username: superadmin | Password: password | Role: SUPER_ADMIN
-- Username: admin      | Password: password | Role: ADMIN
-- Username: operator   | Password: password | Role: OPERATOR
-- Username: guru1      | Password: password | Role: TEACHER
-- Username: guru2      | Password: password | Role: TEACHER
-- Username: guru3      | Password: password | Role: TEACHER
-- ============================================================
