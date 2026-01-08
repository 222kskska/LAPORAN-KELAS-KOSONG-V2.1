-- ============================================================
-- SISWA CONNECT DATABASE SCHEMA - SQLite Version
-- Multi-User Classroom Empty Report System
-- Database: siswaconnect.db
-- Version: 3.0.0
-- ============================================================

-- Note: SQLite doesn't support CREATE DATABASE
-- The database file is created automatically when first accessed

-- ============================================================
-- 1. USERS TABLE
-- Stores user accounts for authentication and authorization
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'OPERATOR' CHECK(role IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'TEACHER', 'STUDENT')),
  name TEXT NOT NULL,
  nip TEXT NULL,
  mapel TEXT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ============================================================
-- 2. TEACHERS TABLE
-- Master data for teachers
-- ============================================================
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  mapel TEXT NOT NULL,
  nip TEXT NULL,
  nuptk TEXT NULL,
  email TEXT NULL,
  phone TEXT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_teachers_nama ON teachers(nama);
CREATE INDEX IF NOT EXISTS idx_teachers_nip ON teachers(nip);
CREATE INDEX IF NOT EXISTS idx_teachers_is_active ON teachers(is_active);

-- ============================================================
-- 3. CLASSES TABLE
-- Master data for classes
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kode TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL UNIQUE,
  wali_kelas_id INTEGER NULL,
  jumlah_siswa INTEGER DEFAULT 0,
  tahun_ajaran TEXT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (wali_kelas_id) REFERENCES teachers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_classes_nama ON classes(nama);
CREATE INDEX IF NOT EXISTS idx_classes_kode ON classes(kode);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON classes(is_active);

-- ============================================================
-- 4. REPORTS TABLE
-- Empty classroom reports submitted by students
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal TEXT NOT NULL,
  kelas TEXT NOT NULL,
  guru TEXT NOT NULL,
  waktu TEXT NOT NULL,
  keterangan TEXT NOT NULL,
  foto_base64 TEXT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'rejected')),
  verified_by INTEGER NULL,
  verified_at TEXT NULL,
  rejection_note TEXT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_tanggal ON reports(tanggal);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_kelas ON reports(kelas);
CREATE INDEX IF NOT EXISTS idx_reports_guru ON reports(guru);

-- ============================================================
-- 5. TEACHER_LEAVES TABLE
-- Teacher leave/absence requests
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_leaves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guru_id INTEGER NOT NULL,
  tanggal_mulai TEXT NOT NULL,
  tanggal_selesai TEXT NOT NULL,
  jenis_izin TEXT NOT NULL CHECK(jenis_izin IN ('SAKIT', 'IZIN', 'DINAS', 'CUTI', 'LAINNYA')),
  alasan TEXT NOT NULL,
  nomor_surat TEXT NULL,
  file_surat_base64 TEXT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'notified')),
  disetujui_oleh INTEGER NULL,
  tanggal_disetujui TEXT NULL,
  catatan TEXT NULL,
  catatan_penyampaian TEXT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (guru_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (disetujui_oleh) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_teacher_leaves_guru_id ON teacher_leaves(guru_id);
CREATE INDEX IF NOT EXISTS idx_teacher_leaves_status ON teacher_leaves(status);
CREATE INDEX IF NOT EXISTS idx_teacher_leaves_tanggal_mulai ON teacher_leaves(tanggal_mulai);
CREATE INDEX IF NOT EXISTS idx_teacher_leaves_tanggal_selesai ON teacher_leaves(tanggal_selesai);

-- ============================================================
-- 6. CLASS_ASSIGNMENTS TABLE
-- Class assignments when teacher is on leave
-- ============================================================
CREATE TABLE IF NOT EXISTS class_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leave_id INTEGER NOT NULL,
  kelas_id INTEGER NULL,
  nama_kelas TEXT NOT NULL,
  jam_pelajaran TEXT NOT NULL,
  mata_pelajaran TEXT NOT NULL,
  guru_pengganti TEXT NOT NULL,
  guru_pengganti_id INTEGER NULL,
  tugas TEXT NOT NULL,
  status_penyampaian TEXT DEFAULT 'belum' CHECK(status_penyampaian IN ('belum', 'sudah')),
  waktu_disampaikan TEXT NULL,
  disampaikan_oleh TEXT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (leave_id) REFERENCES teacher_leaves(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (guru_pengganti_id) REFERENCES teachers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_class_assignments_leave_id ON class_assignments(leave_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_status ON class_assignments(status_penyampaian);

-- ============================================================
-- 7. SESSIONS TABLE
-- Session management for logged in users (optional, for future use)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================
-- 8. ACTIVITY_LOGS TABLE
-- Audit trail for all user actions
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NULL,
  username TEXT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NULL,
  entity_id TEXT NULL,
  description TEXT NULL,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================================
-- 9. APP_SETTINGS TABLE
-- Application configuration settings
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NULL,
  description TEXT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_app_settings_setting_key ON app_settings(setting_key);

-- ============================================================
-- TRIGGERS
-- Auto-update timestamps
-- Note: SQLite triggers are different from MySQL
-- ============================================================

-- Trigger for updating updated_at on users
CREATE TRIGGER IF NOT EXISTS trigger_users_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for updating updated_at on teachers
CREATE TRIGGER IF NOT EXISTS trigger_teachers_update
AFTER UPDATE ON teachers
FOR EACH ROW
BEGIN
  UPDATE teachers SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for updating updated_at on classes
CREATE TRIGGER IF NOT EXISTS trigger_classes_update
AFTER UPDATE ON classes
FOR EACH ROW
BEGIN
  UPDATE classes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for updating updated_at on reports
CREATE TRIGGER IF NOT EXISTS trigger_reports_update
AFTER UPDATE ON reports
FOR EACH ROW
BEGIN
  UPDATE reports SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for updating updated_at on teacher_leaves
CREATE TRIGGER IF NOT EXISTS trigger_teacher_leaves_update
AFTER UPDATE ON teacher_leaves
FOR EACH ROW
BEGIN
  UPDATE teacher_leaves SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for updating updated_at on class_assignments
CREATE TRIGGER IF NOT EXISTS trigger_class_assignments_update
AFTER UPDATE ON class_assignments
FOR EACH ROW
BEGIN
  UPDATE class_assignments SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for updating updated_at on app_settings
CREATE TRIGGER IF NOT EXISTS trigger_app_settings_update
AFTER UPDATE ON app_settings
FOR EACH ROW
BEGIN
  UPDATE app_settings SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================
-- INITIAL CONFIGURATION
-- Insert default app settings
-- ============================================================

INSERT OR REPLACE INTO app_settings (setting_key, setting_value, description) VALUES
  ('app_name', 'SiswaConnect', 'Application name'),
  ('app_version', '3.0.0', 'Current application version'),
  ('school_name', 'SMP Negeri 4 Samarinda', 'School name'),
  ('session_timeout', '86400', 'Session timeout in seconds (24 hours)'),
  ('max_upload_size', '5242880', 'Max upload size in bytes (5MB)'),
  ('polling_interval', '30000', 'Polling interval in milliseconds (30s)'),
  ('db_type', 'sqlite', 'Database type (sqlite or mysql)');

-- ============================================================
-- VERIFICATION QUERIES
-- Run these to verify schema (uncomment to use)
-- ============================================================

-- SELECT name FROM sqlite_master WHERE type='table';
-- PRAGMA table_info(users);
-- PRAGMA table_info(teachers);
-- PRAGMA table_info(classes);
-- PRAGMA table_info(reports);
-- PRAGMA table_info(teacher_leaves);
-- PRAGMA table_info(class_assignments);
-- PRAGMA table_info(sessions);
-- PRAGMA table_info(activity_logs);
-- SELECT * FROM app_settings;
