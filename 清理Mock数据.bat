@echo off
echo ========================================
echo ProxyHub - 清理Mock数据
echo ========================================
echo.
echo 正在连接数据库...
echo.

REM 请根据您的MySQL配置修改以下参数
set DB_HOST=localhost
set DB_USER=root
set DB_PASS=
set DB_NAME=proxyhub

REM 执行清理SQL
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "DELETE FROM static_proxies WHERE remark LIKE '%%[MOCK]%%' OR channelName = '默认通道';"

echo.
echo ========================================
echo 清理完成！正在验证...
echo ========================================
echo.

REM 验证结果
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SELECT id, ip, channelName, remark FROM static_proxies ORDER BY id DESC;"

echo.
echo ========================================
echo 应该只剩3个真实IP
echo ========================================
pause

