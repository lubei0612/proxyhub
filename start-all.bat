@echo off
echo ========================================
echo Starting ProxyHub Services
echo ========================================

echo Starting Database Services...
docker-compose up -d postgres redis

echo.
echo Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo.
echo Starting Backend...
start "ProxyHub Backend" cmd /k "cd backend && npm run start:dev"

echo.
echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo Starting Frontend...
start "ProxyHub Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8080
echo.
pause

