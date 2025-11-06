@echo off
chcp 65001 >nul
echo ==========================================
echo  Spec-Workflow MCP Server
echo ==========================================
echo.
echo [信息] 启动MCP Server（连接到Cursor）
echo [提示] 项目会自动注册到Dashboard
echo [提示] 保持此窗口运行，不要关闭
echo [提示] 按 Ctrl+C 停止服务
echo.
echo ==========================================
echo.

cd /d D:\Users\Desktop\proxyhub
spec-workflow-mcp D:\Users\Desktop\proxyhub

pause
