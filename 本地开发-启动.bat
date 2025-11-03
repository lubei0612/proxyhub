@echo off
chcp 65001 > nul
echo =========================================
echo  ProxyHub 本地开发环境启动
echo =========================================
echo.
echo 此脚本将启动：
echo   1. PostgreSQL + Redis (Docker)
echo   2. 后端开发服务器 (npm run start:dev)
echo   3. 前端开发服务器 (npm run dev)
echo.
pause

echo.
echo [1/5] 启动数据库服务...
docker-compose up postgres redis -d
timeout /t 10 /nobreak > nul
echo.

echo [2/5] 检查数据库状态...
docker-compose ps postgres redis
echo.

echo [3/5] 配置后端环境...
cd backend
if not exist .env (
    echo 创建.env文件...
    copy ..\docs\ENV_TEMPLATE.txt .env
)

echo.
echo [4/5] 安装后端依赖...
call npm install
echo.

echo [5/5] 初始化测试数据...
call npm run seed
echo.

echo =========================================
echo  数据库和后端准备完成！
echo =========================================
echo.
echo 下一步，请打开两个新的PowerShell窗口：
echo.
echo 窗口1 - 启动后端：
echo   cd D:\Users\Desktop\proxyhub\backend
echo   npm run start:dev
echo.
echo 窗口2 - 启动前端：
echo   cd D:\Users\Desktop\proxyhub\frontend
echo   npm install
echo   npm run dev
echo.
echo 启动成功后访问：
echo   前端：http://localhost:5173
echo   后端：http://localhost:3000/api/v1
echo.
echo 测试账号：
echo   用户：user@example.com / password123
echo   管理员：admin@example.com / admin123
echo.
pause

