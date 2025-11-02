@echo off
chcp 65001 > nul
echo =========================================
echo  ProxyHub 本地测试环境停止
echo =========================================
echo.

echo 正在停止所有Docker服务...
docker-compose down
echo.

echo ✅ 所有服务已停止
echo.
pause

