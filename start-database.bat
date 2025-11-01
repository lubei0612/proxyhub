@echo off
chcp 65001 >nul
echo ========================================
echo 正在启动数据库服务...
echo ========================================
cd /d %~dp0
docker-compose -f docker-compose.dev.yml up -d
echo.
echo ✅ 数据库服务已启动！
echo PostgreSQL: localhost:5432
echo Redis: localhost:6379
echo.
pause

