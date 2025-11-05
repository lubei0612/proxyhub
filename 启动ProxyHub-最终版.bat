@echo off
chcp 65001 > nul
cls

echo ============================================
echo    ProxyHub 代理IP管理平台 - 启动脚本
echo ============================================
echo.

echo [1/4] 检查服务状态...
echo.

:: 检查并停止占用端口的进程
echo 检查端口 3000 (后端)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 发现进程占用端口 3000，PID: %%a
    taskkill /PID %%a /F >nul 2>&1
    echo 已终止进程 %%a
)

echo 检查端口 8080 (前端)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo 发现进程占用端口 8080，PID: %%a
    taskkill /PID %%a /F >nul 2>&1
    echo 已终止进程 %%a
)
echo.

echo [2/4] 启动后端服务 (端口: 3000)...
echo.
start "ProxyHub Backend" cmd /k "cd /d %~dp0backend && npm run start:dev"
timeout /t 5 /nobreak > nul
echo 后端服务已启动
echo.

echo [3/4] 启动前端服务 (端口: 8080)...
echo.
start "ProxyHub Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak > nul
echo 前端服务已启动
echo.

echo [4/4] 完成!
echo.
echo ============================================
echo    ProxyHub 服务已启动成功！
echo ============================================
echo.
echo 访问地址:
echo   - 前端: http://localhost:8080
echo   - 后端API: http://localhost:3000/api/v1
echo.
echo 管理员账户:
echo   - 邮箱: admin@example.com
echo   - 密码: admin123
echo.
echo 按任意键关闭此窗口（服务将继续运行）...
pause > nul

