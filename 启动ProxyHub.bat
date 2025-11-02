@echo off
chcp 65001 >nul
echo ========================================
echo Starting ProxyHub Services
echo ========================================
echo.

REM 1. Start Database Services
echo [1/3] Starting Database Services...
call start-database.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to start database services!
    pause
    exit /b %errorlevel%
)
echo.

REM 2. Start Backend
echo [2/3] Starting Backend...
call start-backend.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to start backend!
    pause
    exit /b %errorlevel%
)
echo.

REM 3. Start Frontend
echo [3/3] Starting Frontend...
call start-frontend.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to start frontend!
    pause
    exit /b %errorlevel%
)
echo.

echo ========================================
echo All Services Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:8080
echo.
echo Please keep all windows open!
echo.
pause
