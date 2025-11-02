@echo off
chcp 65001 >nul
echo ========================================
echo    ProxyHub 一键启动
echo ========================================
echo.

echo [1/3] 检查数据库...
docker ps | findstr proxyhub-postgres >nul
if %errorlevel% neq 0 (
    echo 正在启动数据库...
    docker-compose up -d postgres
    timeout /t 5 /nobreak >nul
)
echo ✅ 数据库运行中
echo.

echo [2/3] 启动后端服务（新窗口）...
start "ProxyHub 后端服务" cmd /k "cd /d %~dp0backend && npm run start:dev"
echo ✅ 后端服务已启动
echo 请等待10秒让后端完全启动...
timeout /t 10 /nobreak >nul
echo.

echo [3/3] 启动前端服务（新窗口）...
start "ProxyHub 前端服务" cmd /k "cd /d %~dp0frontend && npm run dev"
echo ✅ 前端服务已启动
echo 请等待5秒让前端完全启动...
timeout /t 5 /nobreak >nul
echo.

echo ========================================
echo    🎉 所有服务已启动！
echo ========================================
echo.
echo 📍 访问地址：
echo    前端：http://localhost:8080
echo    后端：http://localhost:3000
echo    API文档：http://localhost:3000/api
echo.
echo 👤 测试账号：
echo    管理员：admin@example.com / admin123
echo    普通用户：user@example.com / password123
echo.
echo 💡 提示：
echo    - 后端和前端运行在独立窗口
echo    - 关闭窗口将停止对应服务
echo.
echo 正在打开浏览器...
timeout /t 3 /nobreak >nul
start http://localhost:8080
echo.
pause

