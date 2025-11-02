@echo off
chcp 65001 >nul
echo ========================================
echo   ProxyHub 一键启动脚本
echo ========================================
echo.

echo [1/4] 检查Docker服务状态...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Docker未运行，请先启动Docker Desktop
    pause
    exit /b 1
)

echo [2/4] 启动PostgreSQL数据库...
docker-compose up -d postgres
timeout /t 3 /nobreak >nul

echo [3/4] 启动后端服务（NestJS）...
cd backend
start "ProxyHub Backend" cmd /k "npm run start:dev"
timeout /t 5 /nobreak >nul
cd ..

echo [4/4] 启动前端服务（Vue3）...
cd frontend
start "ProxyHub Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo   服务启动完成！
echo ========================================
echo.
echo 前端地址: http://localhost:8080
echo 后端地址: http://localhost:3000
echo API文档:  http://localhost:3000/api
echo.
echo 测试账号:
echo   普通用户: user@example.com / password123
echo   管理员:   admin@example.com / admin123
echo.
echo 按任意键打开浏览器访问前端...
pause >nul

start http://localhost:8080

echo.
echo 提示: 关闭此窗口不会停止服务
echo 要停止服务，请关闭后端和前端的终端窗口
echo 或者运行: taskkill /F /IM node.exe
echo.
pause
