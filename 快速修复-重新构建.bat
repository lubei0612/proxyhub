@echo off
chcp 65001 > nul
echo =========================================
echo  ProxyHub 快速修复 - 重新构建
echo =========================================
echo.
echo 此脚本将：
echo   1. 停止所有服务
echo   2. 重新构建所有Docker镜像
echo   3. 启动所有服务
echo   4. 初始化测试数据
echo.
set /p confirm="确认继续？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 取消操作
    pause
    exit /b
)

echo.
echo [1/6] 停止所有Docker服务...
docker-compose down
echo.

echo [2/6] 删除旧的镜像和卷...
docker-compose down --rmi local --volumes --remove-orphans
echo.

echo [3/6] 重新构建（这可能需要几分钟）...
docker-compose build --no-cache
echo.

echo [4/6] 启动所有服务...
docker-compose up -d
echo.

echo [5/6] 等待服务启动（40秒）...
timeout /t 40 /nobreak > nul
echo.

echo [6/6] 初始化测试数据...
docker exec -it proxyhub-backend npm run seed
echo.

echo =========================================
echo  修复完成！
echo =========================================
echo.
echo 访问地址：
echo   前端：http://localhost
echo   后端：http://localhost:3000/api/v1
echo.
echo 测试账号：
echo   用户：user@example.com / password123
echo   管理员：admin@example.com / admin123
echo.
pause

