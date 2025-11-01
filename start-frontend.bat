@echo off
chcp 65001 >nul
echo ========================================
echo 正在启动 ProxyHub 前端服务...
echo ========================================
cd /d %~dp0frontend
call npm run dev
pause

