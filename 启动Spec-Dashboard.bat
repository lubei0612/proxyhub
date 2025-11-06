@echo off
chcp 65001 >nul
echo ==========================================
echo  Spec-Workflow 统一Dashboard
echo ==========================================
echo.
echo [信息] 启动统一Dashboard服务器
echo [地址] http://localhost:5678
echo [提示] 保持此窗口运行，不要关闭
echo [提示] 按 Ctrl+C 停止服务
echo.
echo ==========================================
echo.

cd /d D:\Users\Desktop\proxyhub
spec-workflow-mcp --dashboard --port 5678

pause
