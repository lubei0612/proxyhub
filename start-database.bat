@echo off
echo ========================================
echo [1/3] 启动数据库服务 (PostgreSQL + Redis)
echo ========================================
echo.

REM 启动Docker服务
docker-compose -f docker-compose.dev.yml up -d

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker启动失败！
    echo 请确保Docker Desktop已启动
    pause
    exit /b 1
)

echo.
echo ⏳ 等待数据库就绪 (15秒)...
timeout /t 15 /nobreak > NUL

echo.
echo ✅ 数据库服务已启动！
echo PostgreSQL: localhost:5432
echo Redis: localhost:6379
echo.
pause
