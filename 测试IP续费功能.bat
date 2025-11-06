@echo off
chcp 65001 >nul
echo ========================================
echo 启动ProxyHub后端服务以测试IP续费功能
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] 清理旧的进程...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo [2/3] 启动后端服务（开发模式）...
echo 服务将在端口3000启动
echo 请关注控制台日志输出
echo.

start "ProxyHub Backend" cmd /k "npm run start:dev"

echo.
echo [3/3] 等待服务启动...
timeout /t 10 >nul

echo.
echo ========================================
echo ✅ 后端服务已启动
echo ========================================
echo.
echo 📝 测试步骤：
echo 1. 使用Chrome DevTools MCP工具
echo 2. 访问: http://localhost:3000/api/v1/proxy/static/ip/250.130.139.91/renew
echo 3. 方法: POST
echo 4. Headers: Authorization: Bearer {token}
echo 5. Body: {"duration": 30}
echo.
echo 📊 查看日志：
echo - 观察"985Proxy Renew Request Details"部分
echo - 查看实际发送的参数格式
echo - 根据错误信息调整参数
echo.
echo 💡 获取Token：
echo 1. 先登录: POST http://localhost:3000/api/v1/auth/login
echo 2. Body: {"email":"admin@example.com","password":"admin123"}
echo 3. 复制响应中的access_token
echo.
pause

