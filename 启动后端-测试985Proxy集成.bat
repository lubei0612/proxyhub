@echo off
echo ========================================
echo 停止旧的后端进程...
echo ========================================
taskkill /F /IM node.exe /FI "WINDOWTITLE eq backend*" 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul

timeout /t 3 /nobreak

echo.
echo ========================================
echo 启动后端服务 (985Proxy集成测试)...
echo ========================================
cd backend
start "ProxyHub Backend - 985Proxy Integration" cmd /k "npm run start:dev"

echo.
echo ========================================
echo 后端启动中，请等待10秒...
echo ========================================
timeout /t 10 /nobreak

echo.
echo ========================================
echo 服务状态检查:
echo ========================================
netstat -ano | findstr ":3000" | findstr "LISTENING"
if %ERRORLEVEL% EQU 0 (
    echo [成功] 后端服务已启动在端口 3000
) else (
    echo [失败] 后端服务未成功启动
)

echo.
echo ========================================
echo 前端已在 http://localhost:8081 运行
echo 后端已在 http://localhost:3000 运行
echo ========================================
pause

