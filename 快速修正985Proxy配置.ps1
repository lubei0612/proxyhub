# ============================================
# 快速修正985Proxy API配置
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "985Proxy API配置修正脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 读取当前.env文件
$envPath = "backend\.env"

if (-Not (Test-Path $envPath)) {
    Write-Host "❌ 错误: 找不到 backend\.env 文件" -ForegroundColor Red
    Write-Host "请确保在项目根目录运行此脚本" -ForegroundColor Yellow
    pause
    exit 1
}

# 备份原文件
$backupPath = "backend\.env.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $envPath $backupPath
Write-Host "✅ 已备份原配置文件到: $backupPath" -ForegroundColor Green
Write-Host ""

# 读取文件内容
$content = Get-Content $envPath -Raw

# 修正API KEY
$oldKey = "PROXY_985_API_KEY=ne_hj06qomI-6jd4ftbl7kv3-bmVfaGowNnFvYk2amQ0ZnRibDdrdjM4Yzc0MTc2MTc0MjUwMA=="
$newKey = "PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw=="

if ($content -match "PROXY_985_API_KEY=ne_hj06qomI-6jd4ftbl7kv3") {
    Write-Host "🔧 检测到错误的API KEY，正在修正..." -ForegroundColor Yellow
    $content = $content -replace [regex]::Escape($oldKey), $newKey
    $content | Set-Content $envPath -NoNewline
    Write-Host "✅ API KEY已修正" -ForegroundColor Green
} else {
    Write-Host "ℹ️ API KEY格式正确，无需修正" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "当前985Proxy配置:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Get-Content $envPath | Select-String "PROXY_985"
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 配置修正完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：重启后端服务" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host ""

pause

