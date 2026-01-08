@echo off
REM ============================================================
REM SISWACONNECT - Database Setup Script
REM Version: 3.0.0
REM ============================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           SISWACONNECT - Database Setup                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% NEQ 0 (
    echo ✗ ERROR: MySQL is not installed or not in PATH
    echo.
    echo Please install MySQL Server from:
    echo https://dev.mysql.com/downloads/mysql/
    echo.
    pause
    exit /b 1
)

echo ✓ MySQL found
echo.

REM Get current directory
set SCRIPT_DIR=%~dp0
set DB_DIR=%SCRIPT_DIR%..\database

echo Database files location:
echo %DB_DIR%
echo.

REM Get MySQL credentials
echo Please enter your MySQL credentials:
echo.
set /p MYSQL_USER="MySQL Username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASSWORD="MySQL Password: "

echo.
echo Testing MySQL connection...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -e "SELECT 1" >nul 2>&1
if %errorlevel% NEQ 0 (
    echo ✗ ERROR: Failed to connect to MySQL
    echo Please check your username and password
    echo.
    pause
    exit /b 1
)

echo ✓ MySQL connection successful
echo.

REM Create database and import schema
echo [1/3] Creating database and importing schema...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% < "%DB_DIR%\schema.sql" 2>error.log
if %errorlevel% NEQ 0 (
    echo ✗ ERROR: Failed to import schema
    echo See error.log for details
    pause
    exit /b 1
)
echo ✓ Schema imported successfully
echo.

REM Import seed data
echo [2/3] Importing seed data...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% siswa_connect < "%DB_DIR%\seed.sql" 2>>error.log
if %errorlevel% NEQ 0 (
    echo ✗ ERROR: Failed to import seed data
    echo See error.log for details
    pause
    exit /b 1
)
echo ✓ Seed data imported successfully
echo.

REM Verify installation
echo [3/3] Verifying installation...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -D siswa_connect -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'siswa_connect';" >nul 2>&1
if %errorlevel% NEQ 0 (
    echo ✗ ERROR: Verification failed
    pause
    exit /b 1
)
echo ✓ Database verified successfully
echo.

echo ════════════════════════════════════════════════════════════
echo                    INSTALLATION COMPLETE!
echo ════════════════════════════════════════════════════════════
echo.
echo Database Name: siswa_connect
echo Tables Created: 9 (users, teachers, classes, reports, etc.)
echo.
echo Default Login Credentials:
echo ────────────────────────────────────────────────────────────
echo Username         Password    Role
echo ────────────────────────────────────────────────────────────
echo superadmin       password    Super Admin
echo admin            password    Admin
echo operator         password    Operator
echo guru1            password    Teacher (Bpk. Joko Widodo)
echo guru2            password    Teacher (Ibu Sri Mulyani)
echo guru3            password    Teacher (Bpk. Ganjar Pranowo)
echo ────────────────────────────────────────────────────────────
echo.
echo ⚠ IMPORTANT SECURITY NOTICE:
echo Please change these default passwords after first login!
echo.
echo Next Steps:
echo 1. Run: setup-server.bat (Setup backend server)
echo 2. Configure server/.env file
echo 3. Start the server
echo.

if exist error.log del error.log

pause
