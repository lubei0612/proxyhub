# Quick fix for 985Proxy API configuration
Write-Host "========================================"
Write-Host "Fixing 985Proxy API Configuration"
Write-Host "========================================"
Write-Host ""

$envPath = "backend\.env"

if (-Not (Test-Path $envPath)) {
    Write-Host "Error: backend\.env not found"
    pause
    exit 1
}

# Backup
$backupPath = "backend\.env.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $envPath $backupPath
Write-Host "Backed up to: $backupPath"
Write-Host ""

# Fix API KEY
$content = Get-Content $envPath -Raw

if ($content -match "PROXY_985_API_KEY=ne_hj06qomI-6jd4ftbl7kv3") {
    Write-Host "Fixing incorrect API KEY..."
    $content = $content -replace "PROXY_985_API_KEY=ne_hj06qomI-6jd4ftbl7kv3-bmVfaGowNnFvYk2amQ0ZnRibDdrdjM4Yzc0MTc2MTc0MjUwMA==", "PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw=="
    $content | Set-Content $envPath -NoNewline
    Write-Host "API KEY fixed!"
} else {
    Write-Host "API KEY is already correct"
}

Write-Host ""
Write-Host "Current 985Proxy config:"
Get-Content $envPath | Select-String "PROXY_985"
Write-Host ""
Write-Host "Done! Please restart backend:"
Write-Host "  cd backend && npm run start:dev"
Write-Host ""
pause

