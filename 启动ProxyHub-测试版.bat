@echo off
chcp 65001 >nul
echo ================================
echo ProxyHub 服务启动
echo ================================
echo.

echo [1/3] 检查目录...
if not exist "backend" (
    echo 错误: backend目录不存在
    pause
    exit /b 1
)
if not exist "frontend" (
    echo 错误: frontend目录不存在
    pause
    exit /b 1
)

echo [2/3] 启动后端服务...
echo 打开新窗口启动后端...
start "ProxyHub-Backend" cmd /k "cd /d %~dp0backend && npm run start:dev"

echo 等待5秒让后端启动...
timeout /t 5 /nobreak >nul

echo [3/3] 启动前端服务...
echo 打开新窗口启动前端...
start "ProxyHub-Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ================================
echo 服务启动中...
echo ================================
echo.
echo 后端服务: http://localhost:3000
echo 前端服务: http://localhost:8080
echo.
echo 等待20秒让服务完全启动...
timeout /t 20 /nobreak

echo.
echo ================================
echo 准备打开浏览器...
echo ================================
start http://localhost:8080

echo.
echo 提示:
echo - 两个CMD窗口将保持打开状态
echo - 后端窗口: ProxyHub-Backend
echo - 前端窗口: ProxyHub-Frontend
echo - 关闭这些窗口将停止服务
echo.
echo 按任意键关闭此窗口...
pause >nul

