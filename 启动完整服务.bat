@echo off
chcp 65001 >nul
echo ==========================================
echo  Spec-Workflow 完整服务启动
echo ==========================================
echo.
echo [步骤1] 启动Dashboard服务器...
echo.

cd /d D:\Users\Desktop\proxyhub

REM 启动Dashboard（后台）
start "Spec-Dashboard" cmd /k "echo [Dashboard] 运行在 http://localhost:5678 && echo [提示] 不要关闭此窗口 && echo. && spec-workflow-mcp --dashboard --port 5678"

echo [等待] Dashboard启动中...
timeout /t 3 /nobreak >nul

echo.
echo [步骤2] 启动MCP Server...
echo.

REM 启动MCP Server（后台）
start "Spec-MCP-Server" cmd /k "echo [MCP Server] 已连接到Dashboard && echo [提示] 不要关闭此窗口 && echo. && spec-workflow-mcp D:\Users\Desktop\proxyhub"

echo.
echo ==========================================
echo  启动完成！
echo ==========================================
echo.
echo [Dashboard] http://localhost:5678
echo [MCP Server] 已连接到Cursor
echo.
echo [提示] 两个窗口都需要保持运行
echo [提示] 关闭任一窗口将停止对应服务
echo.
echo 按任意键关闭此窗口（服务会继续运行）
pause >nul
