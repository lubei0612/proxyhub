@echo off
chcp 65001 >nul
title ProxyHub 一键启动
color 0A

echo.
echo ========================================
echo    ProxyHub 代理IP管理平台
echo    一键启动脚本
echo ========================================
echo.

echo [1/3] 正在启动后端服务...
cd /d "%~dp0"
start "ProxyHub-Backend" cmd /k "cd backend && npm run start:dev"
timeout /t 5 /nobreak >nul

echo [2/3] 正在启动前端服务...
start "ProxyHub-Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] 等待服务启动...
echo.
echo ========================================
echo    服务启动完成！
echo ========================================
echo.
echo 后端服务: http://localhost:3000
echo 前端服务: http://localhost:8080
echo API文档: http://localhost:3000/api
echo.
echo 提示：
echo - 后端和前端在独立窗口运行
echo - 关闭窗口即可停止对应服务
echo - 等待10-15秒让服务完全启动
echo.
echo 正在打开浏览器...
timeout /t 10 /nobreak >nul
start http://localhost:8080
echo.
echo 按任意键关闭此窗口（不影响服务运行）...
pause >nul

