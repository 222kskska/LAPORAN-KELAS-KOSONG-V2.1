@echo off
REM ============================================================
REM SISWACONNECT - Server Setup Script
REM Version: 3.0.0
REM ============================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           SISWACONNECT - Server Setup                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% NEQ 0 (
    echo ✗ ERROR: Node.js is not installed
    echo.
    echo Please install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js found: %NODE_VERSION%
echo.

REM Check npm
npm --version >nul 2>&1
if %errorlevel% NEQ 0 (
    echo ✗ ERROR: npm is not available
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm found: %NPM_VERSION%
echo.

REM Get server directory
set SCRIPT_DIR=%~dp0
set SERVER_DIR=%SCRIPT_DIR%..\server

echo Server directory: %SERVER_DIR%
echo.

REM Check if server directory exists
if not exist "%SERVER_DIR%" (
    echo ✗ ERROR: Server directory not found
    echo Expected: %SERVER_DIR%
    pause
    exit /b 1
)

REM Navigate to server directory
cd /d "%SERVER_DIR%"

REM Install dependencies
echo [1/4] Installing server dependencies...
echo This may take a few minutes...
echo.
call npm install
if %errorlevel% NEQ 0 (
    echo ✗ ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo [2/4] Creating .env configuration file...
    copy .env.example .env >nul
    echo ✓ Created .env file from template
    echo.
    echo ⚠ IMPORTANT: Please configure .env file with your settings
    echo Opening .env file for editing...
    echo.
    timeout /t 2 >nul
    notepad .env
) else (
    echo [2/4] .env file already exists
    echo ✓ Using existing configuration
    echo.
)

REM Build TypeScript
echo [3/4] Building TypeScript code...
call npm run build
if %errorlevel% NEQ 0 (
    echo ✗ ERROR: Failed to build TypeScript
    pause
    exit /b 1
)
echo ✓ TypeScript build successful
echo.

REM Installation complete
echo [4/4] Setup complete!
echo.
echo ════════════════════════════════════════════════════════════
echo                    INSTALLATION COMPLETE!
echo ════════════════════════════════════════════════════════════
echo.
echo Server installed successfully!
echo.
echo Configuration File: server/.env
echo ────────────────────────────────────────────────────────────
echo Please verify the following settings in .env:
echo   • DB_HOST=localhost
echo   • DB_USER=root
echo   • DB_PASSWORD=your_mysql_password
echo   • DB_NAME=siswa_connect
echo   • PORT=1991
echo   • JWT_SECRET=(change to a secure random string)
echo ────────────────────────────────────────────────────────────
echo.
echo To start the server:
echo   Development:  npm run dev
echo   Production:   npm start
echo.
echo Server will run on: http://localhost:1991
echo.
echo Next Steps:
echo 1. Verify .env configuration
echo 2. Ensure database is set up (run setup-database.bat if not)
echo 3. Start the server: npm start
echo 4. Test API: http://localhost:1991/api/health
echo.
echo Do you want to start the server now? (Y/N)
set /p START_NOW="> "

if /i "%START_NOW%"=="Y" (
    echo.
    echo Starting server...
    echo Press Ctrl+C to stop the server
    echo.
    call npm start
) else (
    echo.
    echo Server installation complete but not started.
    echo Run 'npm start' from the server directory to start.
)

echo.
pause
