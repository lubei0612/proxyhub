@echo off
chcp 65001 >nul
echo ========================================
echo 重启ProxyHub后端服务
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] 停止所有Node进程...
taskkill /F /IM node.exe 2>nul
timeout /t 3 >nul

echo.
echo [2/3] 重新启动后端服务...
start "ProxyHub Backend" cmd /k "npm run start:dev"

echo.
echo [3/3] 等待服务启动...
timeout /t 10 >nul

echo.
echo ========================================
echo ✅ 后端服务已重启
echo ========================================
echo.
echo 📝 服务信息：
echo - 端口: 3000
echo - API文档: http://localhost:3000/api
echo - 日志: 查看后端终端窗口
echo.
echo 🧪 测试续费功能：
echo 1. 打开新的终端窗口
echo 2. 运行测试命令（见下方）
echo.
pause

