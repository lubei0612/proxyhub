@echo off
chcp 65001 >nul
echo ========================================
echo 正在启动 ProxyHub 后端服务...
echo ========================================
cd /d %~dp0backend
call npm run start:dev
pause

