@echo off
chcp 65001 >nul
echo ========================================
echo   停止ProxyHub服务
echo ========================================
echo.

echo [1/2] 停止所有Node进程...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo [成功] Node进程已停止
) else (
    echo [提示] 没有运行的Node进程
)

echo.
echo [2/2] 停止PostgreSQL容器...
docker-compose stop postgres
if %errorlevel% equ 0 (
    echo [成功] 数据库已停止
) else (
    echo [提示] 数据库容器未运行
)

echo.
echo ========================================
echo   所有服务已停止
echo ========================================
echo.
pause

