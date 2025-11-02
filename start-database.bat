@echo off
chcp 65001 >nul
echo ========================================
echo Starting Database Services
echo ========================================
docker-compose up -d
echo.
echo Waiting for database to be ready...
timeout /t 15 /nobreak > NUL
echo.
echo Database services started!
echo PostgreSQL: localhost:5432
echo Redis: localhost:6379
echo.
exit /b 0
