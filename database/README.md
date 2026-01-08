# Database Setup Guide

This directory contains the MySQL database schema and seed data for SiswaConnect Multi-User System.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Database Schema](#database-schema)
- [Quick Setup](#quick-setup)
- [Manual Setup](#manual-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Backup & Restore](#backup--restore)

## Prerequisites

- MySQL Server 5.7+ or MariaDB 10.3+
- MySQL Client (mysql command line or MySQL Workbench)
- Administrative access to MySQL server

## Database Schema

The database consists of 8 main tables:

1. **users** - User accounts for authentication (6 seed users)
2. **teachers** - Master data for teachers (15 teachers)
3. **classes** - Master data for classes (12 classes: VII-1 to IX-4)
4. **reports** - Empty classroom reports (8 sample reports)
5. **teacher_leaves** - Teacher leave/absence requests (4 samples)
6. **class_assignments** - Class assignments when teacher is on leave (7 samples)
7. **sessions** - Session management (empty, for future use)
8. **activity_logs** - Audit trail for all actions (6 sample logs)

## Quick Setup

### Windows (Using MySQL Command Line)

1. **Open Command Prompt as Administrator**

2. **Login to MySQL**
   ```cmd
   mysql -u root -p
   ```

3. **Import Schema**
   ```sql
   source C:\path\to\database\schema.sql
   ```

4. **Import Seed Data**
   ```sql
   source C:\path\to\database\seed.sql
   ```

### Using Auto Installer (Recommended)

```cmd
cd installer
setup-database.bat
```

The installer will:
- Check if MySQL is running
- Prompt for MySQL credentials
- Create the database
- Import schema and seed data
- Display default login credentials

## Manual Setup

### Step 1: Create Database

```sql
CREATE DATABASE IF NOT EXISTS siswa_connect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Step 2: Import Schema

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p siswa_connect < schema.sql
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your server
3. File → Run SQL Script
4. Select `schema.sql`
5. Click "Run"

### Step 3: Import Seed Data

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p siswa_connect < seed.sql
```

**Option B: Using MySQL Workbench**
1. File → Run SQL Script
2. Select `seed.sql`
3. Click "Run"

## Verification

### Check Tables

```sql
USE siswa_connect;
SHOW TABLES;
```

Expected output:
```
+-------------------------+
| Tables_in_siswa_connect |
+-------------------------+
| activity_logs           |
| app_settings            |
| class_assignments       |
| classes                 |
| reports                 |
| sessions                |
| teacher_leaves          |
| teachers                |
| users                   |
+-------------------------+
```

### Check Data Counts

```sql
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
SELECT 'class_assignments', COUNT(*) FROM class_assignments;
```

Expected counts:
- users: 6
- teachers: 15
- classes: 12
- reports: 8
- teacher_leaves: 4
- class_assignments: 7

### Test Login Credentials

```sql
SELECT id, username, role, name 
FROM users 
WHERE is_active = TRUE;
```

Default credentials (all with password: "password"):
- `superadmin` - Super Administrator
- `admin` - Admin Sekolah
- `operator` - Operator Piket
- `guru1` - Bpk. Joko Widodo (Teacher)
- `guru2` - Ibu Sri Mulyani (Teacher)
- `guru3` - Bpk. Ganjar Pranowo (Teacher)

### Verify Relationships

```sql
-- Check classes with homeroom teachers
SELECT c.nama, t.nama as wali_kelas
FROM classes c
LEFT JOIN teachers t ON c.wali_kelas_id = t.id;

-- Check reports with verification status
SELECT id, kelas, guru, status, verified_at
FROM reports
ORDER BY tanggal DESC;

-- Check teacher leaves with assignments
SELECT 
  tl.id,
  t.nama as guru,
  tl.jenis_izin,
  tl.status,
  COUNT(ca.id) as jumlah_penugasan
FROM teacher_leaves tl
JOIN teachers t ON tl.guru_id = t.id
LEFT JOIN class_assignments ca ON ca.leave_id = tl.id
GROUP BY tl.id;
```

## Troubleshooting

### Error: Database already exists

If you need to recreate the database:

```sql
DROP DATABASE IF EXISTS siswa_connect;
```

Then run the schema import again.

### Error: Access denied

Make sure your MySQL user has proper privileges:

```sql
GRANT ALL PRIVILEGES ON siswa_connect.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: Foreign key constraint fails

This usually happens when importing data in wrong order. Solution:

```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Import your data
SET FOREIGN_KEY_CHECKS = 1;
```

The seed.sql already includes this.

### Character encoding issues

If you see garbled text, ensure UTF-8 encoding:

```sql
ALTER DATABASE siswa_connect 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
```

### Can't connect from remote server

For development, you may need to allow remote connections:

```sql
CREATE USER 'siswa_connect'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON siswa_connect.* TO 'siswa_connect'@'%';
FLUSH PRIVILEGES;
```

**Warning:** Never use '%' in production. Always restrict to specific IPs.

## Backup & Restore

### Backup Database

```bash
# Full backup
mysqldump -u root -p siswa_connect > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only
mysqldump -u root -p --no-data siswa_connect > schema_backup.sql

# Data only
mysqldump -u root -p --no-create-info siswa_connect > data_backup.sql
```

### Restore Database

```bash
mysql -u root -p siswa_connect < backup_20250108_120000.sql
```

### Automated Backup (Windows Task Scheduler)

Create a batch file `backup.bat`:

```bat
@echo off
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
mysqldump -u root -p[PASSWORD] siswa_connect > "C:\backups\siswa_connect_%TIMESTAMP%.sql"
```

Schedule it to run daily via Task Scheduler.

## Database Maintenance

### Optimize Tables

```sql
OPTIMIZE TABLE users, teachers, classes, reports, teacher_leaves, class_assignments;
```

### Check Table Status

```sql
SHOW TABLE STATUS FROM siswa_connect;
```

### Analyze Tables

```sql
ANALYZE TABLE users, teachers, classes, reports;
```

## Security Notes

1. **Change Default Password**: The seed data uses bcrypt hash for "password". Change this immediately in production.

2. **Create Dedicated User**: Don't use root for the application.
   ```sql
   CREATE USER 'siswa_app'@'localhost' IDENTIFIED BY 'strong_password_here';
   GRANT SELECT, INSERT, UPDATE, DELETE ON siswa_connect.* TO 'siswa_app'@'localhost';
   ```

3. **Regular Backups**: Schedule automated backups daily.

4. **Monitor Logs**: Check activity_logs table regularly for suspicious activities.

5. **SSL Connection**: Use SSL/TLS for database connections in production.

## Performance Tips

1. **Indexes**: The schema includes optimized indexes for common queries.

2. **Connection Pool**: Use connection pooling in your application (mysql2/promise does this).

3. **Query Optimization**: Use EXPLAIN to analyze slow queries.

4. **Regular Maintenance**: Run OPTIMIZE and ANALYZE monthly.

## Support

For issues or questions:
- Check [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)
- Review MySQL error logs: `/var/log/mysql/error.log` (Linux) or MySQL data directory (Windows)
- Contact system administrator

---

**Database Version:** 3.0.0  
**Last Updated:** January 2026  
**Compatible with:** MySQL 5.7+, MariaDB 10.3+
