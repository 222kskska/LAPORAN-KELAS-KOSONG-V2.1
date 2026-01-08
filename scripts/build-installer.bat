@echo off
echo ============================================
echo  Building SiswaConnect Hybrid Installer
echo ============================================
echo.

REM Build frontend
echo [1/4] Building frontend...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

REM Build server
echo [2/4] Building server...
cd server
call npm run build
cd ..
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Server build failed
    pause
    exit /b 1
)
echo ✓ Server built successfully
echo.

REM Install production dependencies
echo [3/4] Installing production dependencies...
call npm install --production
cd server
call npm install --production
cd ..
echo ✓ Dependencies installed
echo.

REM Build Electron installer
echo [4/4] Building Electron installer...
call npm run build:electron
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Electron build failed
    pause
    exit /b 1
)
echo.

echo ============================================
echo  Build complete!
echo  Output: release/SiswaConnect Setup.exe
echo ============================================
pause
