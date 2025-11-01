@echo off
chcp 65001 > nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║                    ProxyHub 启动向导                           ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 此脚本将按顺序启动以下服务：
echo   1. 数据库服务 (PostgreSQL + Redis)
echo   2. 后端服务 (NestJS)
echo   3. 前端服务 (Vue 3)
echo.
echo 每个服务将在独立窗口中运行，请勿关闭这些窗口！
echo.
pause

echo.
echo ════════════════════════════════════════════════════════════════
echo [第1步] 启动数据库服务...
echo ════════════════════════════════════════════════════════════════
echo.

REM 启动数据库（在新窗口）
start "ProxyHub - Database" cmd /k "start-database.bat"
echo ⏳ 等待数据库完全启动 (20秒)...
timeout /t 20 /nobreak

echo.
echo ════════════════════════════════════════════════════════════════
echo [第2步] 启动后端服务...
echo ════════════════════════════════════════════════════════════════
echo.

REM 启动后端（在新窗口）
start "ProxyHub - Backend" cmd /k "start-backend.bat"
echo ⏳ 等待后端完全启动 (30秒)...
timeout /t 30 /nobreak

echo.
echo ════════════════════════════════════════════════════════════════
echo [第3步] 启动前端服务...
echo ════════════════════════════════════════════════════════════════
echo.

REM 启动前端（在新窗口）
start "ProxyHub - Frontend" cmd /k "start-frontend.bat"
echo ⏳ 等待前端完全启动 (20秒)...
timeout /t 20 /nobreak

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ 所有服务启动完成！
echo ════════════════════════════════════════════════════════════════
echo.
echo 📝 服务访问地址：
echo   - 前端: http://localhost:8080  （或 8081）
echo   - 后端: http://localhost:3000
echo   - 数据库: localhost:5432
echo.
echo 💡 测试账号：
echo   管理员: admin@admin.com / admin123456
echo   普通用户: test@test.com / test123456
echo.
echo ⚠️  请勿关闭任何服务窗口，关闭将停止对应服务！
echo.
echo 📱 现在可以打开浏览器访问前端页面了...
echo.
pause

REM 打开浏览器（检查两个可能的端口）
timeout /t 3 /nobreak
start http://localhost:8080
timeout /t 2 /nobreak
start http://localhost:8081

echo.
echo 💡 提示：如果浏览器没有自动打开，请手动访问：
echo    http://localhost:8080  或  http://localhost:8081
echo.
pause

