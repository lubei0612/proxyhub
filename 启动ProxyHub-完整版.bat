@echo off
chcp 65001 >nul
echo ========================================
echo ProxyHub 服务启动脚本
echo ========================================
echo.

echo [步骤1] 检查Node.js安装...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)
echo ✅ Node.js已安装
echo.

echo [步骤2] 检查依赖安装...
if not exist "backend\node_modules" (
    echo ⚠️ 后端依赖未安装，正在安装...
    cd backend
    call npm install
    cd ..
)
if not exist "frontend\node_modules" (
    echo ⚠️ 前端依赖未安装，正在安装...
    cd frontend
    call npm install
    cd ..
)
echo ✅ 依赖检查完成
echo.

echo [步骤3] 启动后端服务...
echo 后端将在新窗口中启动，端口: 3000
start "ProxyHub后端" cmd /k "cd /d %~dp0backend && npm run start:dev"
echo ✅ 后端启动命令已发送
echo.

echo [步骤4] 等待5秒让后端启动...
timeout /t 5 /nobreak >nul
echo.

echo [步骤5] 启动前端服务...
echo 前端将在新窗口中启动，端口: 8080
start "ProxyHub前端" cmd /k "cd /d %~dp0frontend && npm run dev"
echo ✅ 前端启动命令已发送
echo.

echo [步骤6] 等待10秒让服务启动...
timeout /t 10 /nobreak >nul
echo.

echo ========================================
echo ✅ 服务启动完成！
echo ========================================
echo.
echo 访问地址:
echo   用户端: http://localhost:8080
echo   管理端: http://localhost:8080/admin/login
echo.
echo 测试账户:
echo   用户: user@example.com / password123
echo   管理员: admin@proxyhub.com / Admin123!@#
echo.
echo 提示: 请确保PostgreSQL(5432)和Redis(6379)正在运行
echo.
echo 按任意键打开浏览器...
pause >nul
start http://localhost:8080
echo.
echo 按任意键关闭此窗口...
pause >nul

