@echo off
REM ============================================================
REM SISWACONNECT - System Requirements Checker
REM Version: 3.0.0
REM ============================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║        SISWACONNECT - System Requirements Check           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check MySQL
echo [1/3] Checking MySQL installation...
mysql --version >nul 2>&1
if %errorlevel%==0 (
    echo ✓ MySQL is installed
    for /f "tokens=*" %%i in ('mysql --version') do set MYSQL_VERSION=%%i
    echo   Version: %MYSQL_VERSION%
) else (
    echo ✗ MySQL is NOT installed
    echo   Please install MySQL Server from: https://dev.mysql.com/downloads/
)
echo.

REM Check MySQL Service
echo [2/3] Checking MySQL service status...
sc query MySQL >nul 2>&1
if %errorlevel%==0 (
    sc query MySQL | find "RUNNING" >nul 2>&1
    if %errorlevel%==0 (
        echo ✓ MySQL service is RUNNING
    ) else (
        echo ⚠ MySQL service is installed but NOT running
        echo   Start it with: net start MySQL
    )
) else (
    echo ⚠ MySQL service not found
    echo   The service might be named differently (e.g., MySQL80, MySQL57)
)
echo.

REM Check Node.js
echo [3/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js is installed
    echo   Version: %NODE_VERSION%
    
    REM Check version number
    for /f "tokens=1 delims=v." %%a in ("%NODE_VERSION%") do set NODE_MAJOR=%%a
    if %NODE_MAJOR% LSS 16 (
        echo   ⚠ Warning: Node.js version is less than 16.x
        echo   Recommended: Node.js 16.x or higher
    )
) else (
    echo ✗ Node.js is NOT installed
    echo   Please install Node.js from: https://nodejs.org/
    echo   Recommended: LTS version (16.x or higher)
)
echo.

REM Check npm
echo Checking npm (Node Package Manager)...
npm --version >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✓ npm is installed
    echo   Version: %NPM_VERSION%
) else (
    echo ⚠ npm is NOT available
)
echo.

echo ════════════════════════════════════════════════════════════
echo                       SUMMARY
echo ════════════════════════════════════════════════════════════
echo.
echo Required Software:
echo   • MySQL Server 5.7+  - Database
echo   • Node.js 16+        - Backend runtime
echo   • npm 8+             - Package manager
echo.
echo Optional:
echo   • Git                - Version control
echo   • Visual Studio Code - Code editor
echo.
echo Next Steps:
echo   1. Install any missing software
echo   2. Run: setup-database.bat (Setup database)
echo   3. Run: setup-server.bat (Setup backend server)
echo.

pause
