-- ============================================================
-- SISWA CONNECT SEED DATA
-- Test data for development and initial deployment
-- Version: 3.0.0
-- ============================================================

USE siswa_connect;

-- Disable foreign key checks for clean insert
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (optional, uncomment if needed)
-- TRUNCATE TABLE activity_logs;
-- TRUNCATE TABLE class_assignments;
-- TRUNCATE TABLE teacher_leaves;
-- TRUNCATE TABLE reports;
-- TRUNCATE TABLE classes;
-- TRUNCATE TABLE teachers;
-- TRUNCATE TABLE users;
-- TRUNCATE TABLE sessions;

-- ============================================================
-- 1. USERS DATA
-- Password for all users: "password"
-- Hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ============================================================

INSERT INTO users (id, username, password_hash, role, name, nip, mapel, is_active) VALUES
  (1, 'superadmin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUPER_ADMIN', 'Super Administrator', NULL, NULL, TRUE),
  (2, 'admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'Admin Sekolah', NULL, NULL, TRUE),
  (3, 'operator', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'OPERATOR', 'Operator Piket', NULL, NULL, TRUE),
  (4, 'guru1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TEACHER', 'Bpk. Joko Widodo', '19610621 198503 1 001', 'Matematika', TRUE),
  (5, 'guru2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TEACHER', 'Ibu Sri Mulyani', '19620826 198703 2 005', 'Ekonomi', TRUE),
  (6, 'guru3', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TEACHER', 'Bpk. Ganjar Pranowo', NULL, 'Sejarah', TRUE)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash),
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- 2. TEACHERS DATA
-- 15 teachers with complete data
-- ============================================================

INSERT INTO teachers (id, nama, mapel, nip, nuptk, email, phone, is_active) VALUES
  (1, 'Bpk. Joko Widodo', 'Matematika', '19610621 198503 1 001', '1234567890123456', 'joko.widodo@smpn4smr.sch.id', '081234567801', TRUE),
  (2, 'Ibu Sri Mulyani', 'Ekonomi', '19620826 198703 2 005', '9876543210987654', 'sri.mulyani@smpn4smr.sch.id', '081234567802', TRUE),
  (3, 'Bpk. Ganjar Pranowo', 'Sejarah', '19681015 199203 1 003', '5566778899001122', 'ganjar.pranowo@smpn4smr.sch.id', '081234567803', TRUE),
  (4, 'Ibu Retno Marsudi', 'Bahasa Inggris', '19621127 198601 2 002', '1122334455667788', 'retno.marsudi@smpn4smr.sch.id', '081234567804', TRUE),
  (5, 'Bpk. Nadiem Makarim', 'TIK', '19840420 200901 1 004', '2233445566778899', 'nadiem.makarim@smpn4smr.sch.id', '081234567805', TRUE),
  (6, 'Ibu Tri Rismaharini', 'PKN', '19611120 198403 2 006', '3344556677889900', 'tri.rismaharini@smpn4smr.sch.id', '081234567806', TRUE),
  (7, 'Bpk. Anies Baswedan', 'Bahasa Indonesia', '19690507 199303 1 007', '4455667788990011', 'anies.baswedan@smpn4smr.sch.id', '081234567807', TRUE),
  (8, 'Ibu Susi Pudjiastuti', 'IPA', '19650115 198803 2 008', '5566778899001122', 'susi.pudjiastuti@smpn4smr.sch.id', '081234567808', TRUE),
  (9, 'Bpk. Erick Thohir', 'Olahraga', '19700516 199503 1 009', '6677889900112233', 'erick.thohir@smpn4smr.sch.id', '081234567809', TRUE),
  (10, 'Ibu Khofifah Indar', 'Agama Islam', '19650908 198703 2 010', '7788990011223344', 'khofifah.indar@smpn4smr.sch.id', '081234567810', TRUE),
  (11, 'Bpk. Ridwan Kamil', 'Seni Budaya', '19711004 199603 1 011', '8899001122334455', 'ridwan.kamil@smpn4smr.sch.id', '081234567811', TRUE),
  (12, 'Ibu Risma Hartati', 'IPS', '19630920 198803 2 012', '9900112233445566', 'risma.hartati@smpn4smr.sch.id', '081234567812', TRUE),
  (13, 'Bpk. Sandiaga Uno', 'Prakarya', '19690628 199403 1 013', '0011223344556677', 'sandiaga.uno@smpn4smr.sch.id', '081234567813', TRUE),
  (14, 'Ibu Najwa Shihab', 'Bahasa Inggris', '19770908 200001 2 014', '1122334455667788', 'najwa.shihab@smpn4smr.sch.id', '081234567814', TRUE),
  (15, 'Bpk. Gita Wirjawan', 'Ekonomi', '19650925 199003 1 015', '2233445566778899', 'gita.wirjawan@smpn4smr.sch.id', '081234567815', TRUE)
ON DUPLICATE KEY UPDATE 
  email = VALUES(email),
  phone = VALUES(phone),
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- 3. CLASSES DATA
-- 12 classes (VII-1 to IX-4) with homeroom teachers
-- ============================================================

INSERT INTO classes (id, kode, nama, wali_kelas_id, jumlah_siswa, tahun_ajaran, is_active) VALUES
  (1, '0071', 'VII-1', 1, 32, '2025/2026', TRUE),
  (2, '0072', 'VII-2', 2, 31, '2025/2026', TRUE),
  (3, '0073', 'VII-3', 3, 33, '2025/2026', TRUE),
  (4, '0074', 'VII-4', 4, 30, '2025/2026', TRUE),
  (5, '0081', 'VIII-1', 5, 28, '2025/2026', TRUE),
  (6, '0082', 'VIII-2', 6, 29, '2025/2026', TRUE),
  (7, '0083', 'VIII-3', 7, 31, '2025/2026', TRUE),
  (8, '0084', 'VIII-4', 8, 30, '2025/2026', TRUE),
  (9, '0091', 'IX-1', 9, 27, '2025/2026', TRUE),
  (10, '0092', 'IX-2', 10, 28, '2025/2026', TRUE),
  (11, '0093', 'IX-3', 11, 29, '2025/2026', TRUE),
  (12, '0094', 'IX-4', 12, 26, '2025/2026', TRUE)
ON DUPLICATE KEY UPDATE 
  wali_kelas_id = VALUES(wali_kelas_id),
  jumlah_siswa = VALUES(jumlah_siswa),
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- 4. REPORTS DATA
-- 8 sample empty classroom reports with various statuses
-- ============================================================

INSERT INTO reports (id, tanggal, kelas, guru, waktu, keterangan, foto_base64, status, verified_by, verified_at) VALUES
  (1, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'IX-1', 'Bpk. Joko Widodo', '1 - 2', 'Guru belum hadir sampai jam ke-1 berakhir (45 menit).', NULL, 'pending', NULL, NULL),
  (2, DATE_SUB(NOW(), INTERVAL 1 DAY), 'VIII-3', 'Ibu Sri Mulyani', '5 - 6', 'Hanya memberikan tugas lewat ketua kelas, guru ada rapat.', NULL, 'verified', 2, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
  (3, DATE_SUB(NOW(), INTERVAL 2 DAY), 'VII-2', 'Bpk. Ganjar Pranowo', '3 - 4', 'Guru tidak hadir tanpa keterangan.', NULL, 'verified', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (4, DATE_SUB(NOW(), INTERVAL 3 DAY), 'IX-4', 'Ibu Retno Marsudi', '1 - 2', 'Guru izin mendadak, tidak ada guru pengganti.', NULL, 'rejected', 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (5, DATE_SUB(NOW(), INTERVAL 4 DAY), 'VIII-1', 'Bpk. Nadiem Makarim', '7 - 8', 'Guru pulang lebih awal tanpa pemberitahuan.', NULL, 'verified', 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (6, NOW(), 'VII-4', 'Ibu Tri Rismaharini', '2 - 3', 'Guru terlambat 30 menit, kelas menunggu.', NULL, 'pending', NULL, NULL),
  (7, DATE_SUB(NOW(), INTERVAL 5 DAY), 'IX-2', 'Bpk. Anies Baswedan', '4 - 5', 'Guru ada tugas mendadak dari kepala sekolah.', NULL, 'verified', 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
  (8, DATE_SUB(NOW(), INTERVAL 6 DAY), 'VIII-2', 'Ibu Susi Pudjiastuti', '6 - 7', 'Guru memberikan tugas mandiri tanpa pendampingan.', NULL, 'verified', 2, DATE_SUB(NOW(), INTERVAL 5 DAY))
ON DUPLICATE KEY UPDATE 
  status = VALUES(status),
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- 5. TEACHER LEAVES DATA
-- 4 sample teacher leave requests with various statuses
-- ============================================================

INSERT INTO teacher_leaves (id, guru_id, tanggal_mulai, tanggal_selesai, jenis_izin, alasan, nomor_surat, status, disetujui_oleh, tanggal_disetujui, catatan) VALUES
  (1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'SAKIT', 'Flu berat, perlu istirahat total.', 'SK-001/2025', 'pending', NULL, NULL, NULL),
  (2, 2, DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'DINAS', 'Menghadiri workshop nasional di Jakarta.', 'SK-002/2025', 'approved', 1, NOW(), 'Disetujui. Pastikan tugas sudah disiapkan.'),
  (3, 3, CURDATE(), CURDATE(), 'IZIN', 'Keperluan keluarga mendesak.', NULL, 'rejected', 2, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'Ditolak. Sudah ada guru lain yang izin hari ini.'),
  (4, 4, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'CUTI', 'Cuti tahunan.', 'SK-004/2025', 'notified', 1, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Disetujui dan sudah disampaikan ke semua guru pengganti.')
ON DUPLICATE KEY UPDATE 
  status = VALUES(status),
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- 6. CLASS ASSIGNMENTS DATA
-- 7 sample class assignments for approved teacher leaves
-- ============================================================

INSERT INTO class_assignments (id, leave_id, kelas_id, nama_kelas, jam_pelajaran, mata_pelajaran, guru_pengganti, guru_pengganti_id, tugas, status_penyampaian, waktu_disampaikan, disampaikan_oleh) VALUES
  (1, 2, 1, 'VII-1', '1-2', 'Ekonomi', 'Bpk. Gita Wirjawan', 15, 'Bab 3: Pasar - latihan soal halaman 45-50', 'sudah', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'Admin Sekolah'),
  (2, 2, 5, 'VIII-1', '3-4', 'Ekonomi', 'Bpk. Gita Wirjawan', 15, 'Presentasi kelompok tentang sistem ekonomi', 'sudah', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'Admin Sekolah'),
  (3, 2, 9, 'IX-1', '5-6', 'Ekonomi', 'Bpk. Sandiaga Uno', 13, 'Review materi ujian bab 1-5', 'belum', NULL, NULL),
  (4, 4, 2, 'VII-2', '1-2', 'Bahasa Inggris', 'Ibu Najwa Shihab', 14, 'Chapter 5: Present Perfect Tense - exercises', 'sudah', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'Operator Piket'),
  (5, 4, 6, 'VIII-2', '3-4', 'Bahasa Inggris', 'Ibu Najwa Shihab', 14, 'Reading comprehension practice', 'sudah', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'Operator Piket'),
  (6, 4, 10, 'IX-2', '5-6', 'Bahasa Inggris', 'Ibu Najwa Shihab', 14, 'Essay writing: My Future Career', 'sudah', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'Operator Piket'),
  (7, 4, 4, 'VII-4', '7-8', 'Bahasa Inggris', 'Ibu Najwa Shihab', 14, 'Vocabulary quiz unit 1-3', 'sudah', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'Operator Piket')
ON DUPLICATE KEY UPDATE 
  status_penyampaian = VALUES(status_penyampaian),
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- 7. ACTIVITY LOGS DATA
-- 6 sample activity logs for audit trail
-- ============================================================

INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, description, ip_address) VALUES
  (1, 'superadmin', 'LOGIN', 'user', '1', 'User logged in successfully', '192.168.1.100'),
  (2, 'admin', 'LOGIN', 'user', '2', 'User logged in successfully', '192.168.1.101'),
  (2, 'admin', 'APPROVE_REPORT', 'report', '2', 'Verified report for VIII-3', '192.168.1.101'),
  (1, 'superadmin', 'APPROVE_LEAVE', 'teacher_leave', '2', 'Approved leave request for Ibu Sri Mulyani', '192.168.1.100'),
  (3, 'operator', 'LOGIN', 'user', '3', 'User logged in successfully', '192.168.1.102'),
  (3, 'operator', 'NOTIFY_ASSIGNMENT', 'class_assignment', '1', 'Notified class assignment to Bpk. Gita Wirjawan', '192.168.1.102')
ON DUPLICATE KEY UPDATE 
  created_at = CURRENT_TIMESTAMP;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check data counts
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'reports', COUNT(*) FROM reports
UNION ALL
SELECT 'teacher_leaves', COUNT(*) FROM teacher_leaves
UNION ALL
SELECT 'class_assignments', COUNT(*) FROM class_assignments
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs;

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
