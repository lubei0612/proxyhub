@echo off
chcp 65001 >nul
echo ========================================
echo Starting Backend Service (NestJS)
echo ========================================
cd backend
start "ProxyHub Backend" cmd /k "npm.cmd run start:dev"
echo.
echo Waiting for backend to start...
timeout /t 30 /nobreak > NUL
echo.
echo Backend started!
echo Backend: http://localhost:3000
echo.
cd ..
exit /b 0
