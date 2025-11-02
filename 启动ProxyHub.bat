@echo off
chcp 65001 >nul
echo ========================================
echo    ProxyHub 一键启动脚本
echo ========================================
echo.

echo [1/4] 启动数据库...
cd /d "%~dp0"
docker-compose up -d postgres
if %errorlevel% neq 0 (
    echo ❌ 数据库启动失败！
    pause
    exit /b 1
)
echo ✅ 数据库已启动
timeout /t 5 /nobreak >nul
echo.

echo [2/4] 检查后端依赖...
cd backend
if not exist "node_modules" (
    echo 正在安装后端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 后端依赖安装失败！
        pause
        exit /b 1
    )
)
echo ✅ 后端依赖就绪
echo.

echo [3/4] 初始化数据库...
call npm run seed
if %errorlevel% neq 0 (
    echo ⚠️  数据库初始化失败，可能已初始化过
)
echo ✅ 数据库初始化完成
echo.

echo [4/4] 启动后端服务...
start "ProxyHub Backend" cmd /k "cd /d %~dp0backend && npm run start:dev"
timeout /t 3 /nobreak >nul
echo ✅ 后端服务启动中...
echo.

echo [5/5] 启动前端服务...
cd ..\frontend
if not exist "node_modules" (
    echo 正在安装前端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败！
        pause
        exit /b 1
    )
)
start "ProxyHub Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo ✅ 前端服务启动中...
echo.

echo ========================================
echo    🎉 ProxyHub 启动完成！
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
echo    - 后端和前端服务运行在独立窗口中
echo    - 关闭窗口将停止对应服务
echo    - 按任意键关闭本窗口
echo.
pause

