@echo off
echo ========================================
echo [3/3] 启动前端服务 (Vue 3 + Vite)
echo ========================================
echo.

cd frontend

echo 🔨 使用 npm.cmd 启动开发服务器...
echo 注意：此窗口将保持打开并显示前端日志
echo.

REM 关键：使用 npm.cmd 而不是 npm 来避免PowerShell执行策略问题
npm.cmd run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 前端启动失败！
    echo 请检查上方错误信息
    cd ..
    pause
    exit /b 1
)

cd ..
