@echo off
chcp 65001 > nul
echo =========================================
echo  ProxyHub 清理测试数据
echo =========================================
echo.
echo ⚠️  警告：此操作将删除所有扩展测试数据！
echo.
echo 将保留以下基础数据：
echo   - 5个测试用户
echo   - 3个静态IP
echo   - 2个订单
echo   - 3个充值订单
echo   - 2条交易记录
echo.
echo 将删除以下扩展测试数据：
echo   - 20+个静态IP
echo   - 10个订单
echo   - 15个充值订单
echo   - 30条交易记录
echo.
set /p confirm="确认清理？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 取消操作
    pause
    exit /b
)

echo.
echo [1/3] 停止所有服务...
docker-compose down
echo.

echo [2/3] 删除数据卷...
docker volume rm proxyhub_postgres_data
echo.

echo [3/3] 重新启动并初始化基础数据...
docker-compose up -d
timeout /t 30 /nobreak > nul
docker exec -it proxyhub-backend npm run seed
echo.

echo =========================================
echo  ✅ 清理完成！
echo =========================================
echo.
echo 当前数据状态：仅保留基础测试数据
echo 如需扩展测试数据，请运行：启动本地测试.bat
echo.
pause

