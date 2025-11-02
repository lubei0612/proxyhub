@echo off
chcp 65001 >nul
echo ========================================
echo Starting Frontend Service (Vue 3)
echo ========================================
cd frontend
start "ProxyHub Frontend" cmd /k "npm.cmd run dev"
echo.
echo Waiting for frontend to start...
timeout /t 20 /nobreak > NUL
echo.
echo Frontend started!
echo Frontend: http://localhost:8080
echo.
echo Opening browser...
start http://localhost:8080
echo.
cd ..
exit /b 0
