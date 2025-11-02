@echo off
chcp 65001 >nul
echo ========================================
echo   🔧 修复ProxyHub登录问题
echo ========================================
echo.

echo [1/5] 停止所有Node进程...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Node进程已停止
echo.

echo [2/5] 清除Vite缓存...
cd /d "%~dp0frontend"
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo ✅ Vite缓存已清除
) else (
    echo ℹ️  Vite缓存不存在
)
cd /d "%~dp0"
echo.

echo [3/5] 启动数据库...
docker-compose up -d postgres
timeout /t 3 /nobreak >nul
echo ✅ 数据库已启动
echo.

echo [4/5] 启动后端（等待10秒）...
start "ProxyHub 后端服务" cmd /k "cd /d %~dp0backend && npm run start:dev"
timeout /t 10 /nobreak >nul
echo ✅ 后端已启动
echo.

echo [5/5] 启动前端（等待5秒）...
start "ProxyHub 前端服务" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul
echo ✅ 前端已启动
echo.

echo ========================================
echo   🎉 修复完成！
echo ========================================
echo.
echo 📌 重要提示：
echo.
echo 1. 请使用Chrome无痕模式测试（Ctrl + Shift + N）
echo 2. 访问 http://localhost:8080
echo 3. 按F12打开DevTools > Network标签
echo 4. 登录测试账号：
echo    - 普通用户：user@example.com / password123
echo    - 管理员：admin@example.com / admin123
echo.
echo 5. 确认Network请求为：
echo    POST http://localhost:8080/api/v1/auth/login [200 OK]
echo.
echo ⚠️  如果仍然失败，请提供：
echo    - Network标签截图
echo    - Console标签截图
echo    - 后端CMD窗口截图
echo    - 前端CMD窗口截图
echo.

echo 正在打开浏览器（10秒后）...
timeout /t 10 /nobreak >nul
start chrome --incognito http://localhost:8080

echo.
pause

