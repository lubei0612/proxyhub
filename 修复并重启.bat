@echo off
chcp 65001 > nul
echo =========================================
echo  ProxyHub 修复并重启
echo =========================================
echo.

echo [1/5] 停止所有服务...
docker-compose down
echo.

echo [2/5] 删除旧的容器和镜像...
docker-compose down --rmi local --volumes
echo.

echo [3/5] 重新构建所有服务...
docker-compose build --no-cache
echo.

echo [4/5] 启动所有服务...
docker-compose up -d
echo.

echo [5/5] 等待服务启动（30秒）...
timeout /t 30 /nobreak > nul
echo.

echo =========================================
echo  修复完成！
echo =========================================
echo.
echo 现在可以初始化数据：
echo   docker exec -it proxyhub-backend npm run seed
echo.
echo 访问地址：
echo   前端：http://localhost
echo   后端：http://localhost:3000/api/v1
echo.
pause

