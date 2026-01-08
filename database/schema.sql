-- ============================================================
-- SISWA CONNECT DATABASE SCHEMA
-- Multi-User Classroom Empty Report System
-- Database: siswa_connect
-- Version: 3.0.0
-- ============================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS siswa_connect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE siswa_connect;

-- ============================================================
-- 1. USERS TABLE
-- Stores user accounts for authentication and authorization
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'TEACHER', 'STUDENT') NOT NULL DEFAULT 'OPERATOR',
  name VARCHAR(100) NOT NULL,
  nip VARCHAR(20) NULL,
  mapel VARCHAR(50) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. TEACHERS TABLE
-- Master data for teachers
-- ============================================================
CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  mapel VARCHAR(50) NOT NULL,
  nip VARCHAR(20) NULL,
  nuptk VARCHAR(20) NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(20) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_nama (nama),
  INDEX idx_nip (nip),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. CLASSES TABLE
-- Master data for classes
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(10) NOT NULL UNIQUE,
  nama VARCHAR(20) NOT NULL UNIQUE,
  wali_kelas_id INT NULL,
  jumlah_siswa INT DEFAULT 0,
  tahun_ajaran VARCHAR(10) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (wali_kelas_id) REFERENCES teachers(id) ON DELETE SET NULL,
  INDEX idx_nama (nama),
  INDEX idx_kode (kode),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. REPORTS TABLE
-- Empty classroom reports submitted by students
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tanggal DATETIME NOT NULL,
  kelas VARCHAR(20) NOT NULL,
  guru VARCHAR(100) NOT NULL,
  waktu VARCHAR(20) NOT NULL,
  keterangan TEXT NOT NULL,
  foto_base64 LONGTEXT NULL,
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  verified_by INT NULL,
  verified_at TIMESTAMP NULL,
  rejection_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_tanggal (tanggal),
  INDEX idx_status (status),
  INDEX idx_kelas (kelas),
  INDEX idx_guru (guru)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. TEACHER_LEAVES TABLE
-- Teacher leave/absence requests
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guru_id INT NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  jenis_izin ENUM('SAKIT', 'IZIN', 'DINAS', 'CUTI', 'LAINNYA') NOT NULL,
  alasan TEXT NOT NULL,
  nomor_surat VARCHAR(50) NULL,
  file_surat_base64 LONGTEXT NULL,
  status ENUM('pending', 'approved', 'rejected', 'notified') DEFAULT 'pending',
  disetujui_oleh INT NULL,
  tanggal_disetujui TIMESTAMP NULL,
  catatan TEXT NULL,
  catatan_penyampaian TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (guru_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (disetujui_oleh) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_guru_id (guru_id),
  INDEX idx_status (status),
  INDEX idx_tanggal_mulai (tanggal_mulai),
  INDEX idx_tanggal_selesai (tanggal_selesai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. CLASS_ASSIGNMENTS TABLE
-- Class assignments when teacher is on leave
-- ============================================================
CREATE TABLE IF NOT EXISTS class_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  leave_id INT NOT NULL,
  kelas_id INT NULL,
  nama_kelas VARCHAR(20) NOT NULL,
  jam_pelajaran VARCHAR(50) NOT NULL,
  mata_pelajaran VARCHAR(50) NOT NULL,
  guru_pengganti VARCHAR(100) NOT NULL,
  guru_pengganti_id INT NULL,
  tugas TEXT NOT NULL,
  status_penyampaian ENUM('belum', 'sudah') DEFAULT 'belum',
  waktu_disampaikan TIMESTAMP NULL,
  disampaikan_oleh VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (leave_id) REFERENCES teacher_leaves(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (guru_pengganti_id) REFERENCES teachers(id) ON DELETE SET NULL,
  INDEX idx_leave_id (leave_id),
  INDEX idx_status_penyampaian (status_penyampaian)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. SESSIONS TABLE
-- Session management for logged in users (optional, for future use)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_token (session_token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. ACTIVITY_LOGS TABLE
-- Audit trail for all user actions
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  username VARCHAR(50) NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id VARCHAR(50) NULL,
  description TEXT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity_type (entity_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TRIGGERS
-- Auto-update timestamps and activity logging
-- ============================================================

-- Trigger for updating updated_at on users
DELIMITER //
CREATE TRIGGER before_users_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- ============================================================
-- INITIAL CONFIGURATION
-- ============================================================

-- App settings table (optional, for future use)
CREATE TABLE IF NOT EXISTS app_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default app settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
  ('app_name', 'SiswaConnect', 'Application name'),
  ('app_version', '3.0.0', 'Current application version'),
  ('school_name', 'SMP Negeri 4 Samarinda', 'School name'),
  ('session_timeout', '86400', 'Session timeout in seconds (24 hours)'),
  ('max_upload_size', '5242880', 'Max upload size in bytes (5MB)'),
  ('polling_interval', '30000', 'Polling interval in milliseconds (30s)')
ON DUPLICATE KEY UPDATE 
  setting_value = VALUES(setting_value),
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- VERIFICATION QUERIES
-- Run these after import to verify schema
-- ============================================================

-- SHOW TABLES;
-- DESCRIBE users;
-- DESCRIBE teachers;
-- DESCRIBE classes;
-- DESCRIBE reports;
-- DESCRIBE teacher_leaves;
-- DESCRIBE class_assignments;
-- DESCRIBE sessions;
-- DESCRIBE activity_logs;
-- SELECT * FROM app_settings;
