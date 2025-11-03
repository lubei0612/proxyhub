# ProxyHub 服务启动脚本 (PowerShell)
# 使用方法: 在PowerShell中运行 .\启动服务.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ProxyHub 服务启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "[步骤1] 检查Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未检测到Node.js" -ForegroundColor Red
    Write-Host "请从 https://nodejs.org 下载并安装Node.js" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# 启动后端
Write-Host "[步骤2] 启动后端服务..." -ForegroundColor Yellow
Write-Host "后端将在新窗口启动，端口: 3000" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run start:dev"
Write-Host "✅ 后端窗口已打开" -ForegroundColor Green
Write-Host ""

# 等待后端启动
Write-Host "[步骤3] 等待后端启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "✅ 后端启动延迟完成" -ForegroundColor Green
Write-Host ""

# 启动前端
Write-Host "[步骤4] 启动前端服务..." -ForegroundColor Yellow
Write-Host "前端将在新窗口启动，端口: 8080" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"
Write-Host "✅ 前端窗口已打开" -ForegroundColor Green
Write-Host ""

# 等待前端启动
Write-Host "[步骤5] 等待前端启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "✅ 前端启动延迟完成" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 服务启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址:" -ForegroundColor Yellow
Write-Host "  用户端: http://localhost:8080" -ForegroundColor White
Write-Host "  管理端: http://localhost:8080/admin/login" -ForegroundColor White
Write-Host ""
Write-Host "测试账户:" -ForegroundColor Yellow
Write-Host "  用户: user@example.com / password123" -ForegroundColor White
Write-Host "  管理员: admin@proxyhub.com / Admin123!@#" -ForegroundColor White
Write-Host ""
Write-Host "提示:" -ForegroundColor Yellow
Write-Host "  - 请确保PostgreSQL(5432)和Redis(6379)正在运行" -ForegroundColor Gray
Write-Host "  - 查看后端和前端窗口的日志确认启动成功" -ForegroundColor Gray
Write-Host "  - 按Ctrl+C可停止各个服务" -ForegroundColor Gray
Write-Host ""

# 询问是否打开浏览器
$response = Read-Host "是否打开浏览器? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "正在打开浏览器..." -ForegroundColor Yellow
    Start-Process "http://localhost:8080"
    Write-Host "✅ 浏览器已打开" -ForegroundColor Green
}

Write-Host ""
Write-Host "按任意键关闭此窗口..." -ForegroundColor Gray
pause

