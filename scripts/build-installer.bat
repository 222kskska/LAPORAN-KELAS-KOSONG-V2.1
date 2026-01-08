@echo off
echo ============================================
echo  Building SiswaConnect Hybrid Installer
echo ============================================
echo.

REM Build frontend
echo [1/5] Building frontend...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

REM Build server
echo [2/5] Building server...
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

REM Verify server dist exists
IF NOT EXIST "server\dist" (
    echo ERROR: server\dist folder not found after build
    pause
    exit /b 1
)
echo ✓ Server dist verified
echo.

REM Check for icon (optional)
echo [3/5] Checking for icon...
IF NOT EXIST "build\icon.ico" (
    echo ⚠️  WARNING: build\icon.ico not found
    echo ⚠️  Installer will use default Electron icon
    echo ⚠️  See build\README.md for instructions
    echo.
) ELSE (
    echo ✓ Icon found
    echo.
)

REM Install production dependencies
echo [4/5] Installing production dependencies...
call npm install --production
cd server
call npm install --production
cd ..
echo ✓ Dependencies installed
echo.

REM Build Electron installer
echo [5/5] Building Electron installer...
call npm run dist
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Electron build failed
    pause
    exit /b 1
)
echo.

echo ============================================
echo  Build complete!
echo  Output: release\SiswaConnect Setup 3.0.0.exe
echo ============================================
pause
