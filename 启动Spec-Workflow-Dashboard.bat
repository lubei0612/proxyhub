@echo off
chcp 65001 >nul
echo ==========================================
echo  Spec-Workflow Dashboard 启动器
echo ==========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [信息] 检测到 Node.js 版本:
node --version
echo.

REM 检查npm是否可用
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] npm 不可用
    pause
    exit /b 1
)

echo [信息] 正在启动 Spec-Workflow Dashboard...
echo.
echo [提示] Dashboard 通常会在以下地址打开:
echo         http://localhost:3000 (或其他端口)
echo.
echo [提示] 按 Ctrl+C 可以停止服务
echo.
echo ==========================================
echo.

REM 尝试多种启动方式
echo [尝试 1] 使用 npx 启动...
npx @pimzino/spec-workflow-mcp 2>nul
if %ERRORLEVEL% EQU 0 goto :success

echo.
echo [尝试 2] 检查全局安装...
where spec-workflow-mcp >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [信息] 发现全局安装，正在启动...
    spec-workflow-mcp
    goto :success
)

echo.
echo [尝试 3] 检查本地安装...
if exist "node_modules\.bin\spec-workflow-mcp.cmd" (
    echo [信息] 发现本地安装，正在启动...
    call node_modules\.bin\spec-workflow-mcp.cmd
    goto :success
)

echo.
echo ==========================================
echo [警告] 未找到 spec-workflow 安装
echo ==========================================
echo.
echo 请选择以下安装方式:
echo.
echo 1. 全局安装 (推荐):
echo    npm install -g @pimzino/spec-workflow-mcp
echo.
echo 2. 本地安装:
echo    npm install @pimzino/spec-workflow-mcp --save-dev
echo.
echo 3. 使用 npx (无需安装):
echo    npx @pimzino/spec-workflow-mcp
echo.
echo ==========================================
echo.
pause
exit /b 1

:success
echo.
echo [成功] Dashboard 已启动
pause
exit /b 0

