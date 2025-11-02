@echo off
chcp 65001 > nul
echo =========================================
echo  ProxyHub 本地测试环境启动
echo =========================================
echo.

echo [1/4] 检查环境变量文件...
if not exist .env (
    echo ⚠️  .env 文件不存在，正在复制模板...
    copy docs\ENV_TEMPLATE.txt .env
    echo ✅ .env 文件已创建，请根据需要修改配置
) else (
    echo ✅ .env 文件已存在
)
echo.

echo [2/4] 启动Docker服务...
docker-compose up -d
echo ✅ Docker服务已启动
echo.

echo [3/4] 等待服务启动（30秒）...
timeout /t 30 /nobreak > nul
echo ✅ 服务启动完成
echo.

echo [4/4] 初始化测试数据...
echo.
echo 正在运行基础种子数据...
docker exec -it proxyhub-backend npm run seed
echo.
echo 正在运行扩展测试数据（20+IP, 10订单, 15充值订单, 30交易记录）...
docker exec -it proxyhub-backend npm run seed:extended
echo.

echo =========================================
echo  🎉 启动完成！
echo =========================================
echo.
echo 访问地址：
echo   前端：http://localhost
echo   后端API：http://localhost:3000/api/v1
echo   API文档：http://localhost:3000/api/v1/docs
echo.
echo 测试账号：
echo   管理员：admin@example.com / admin123
echo   用户：user@example.com / password123
echo.
echo 详细测试指南：docs\LOCAL_TESTING_GUIDE.md
echo.
pause

