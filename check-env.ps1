$envContent = Get-Content .env -Raw
if ($envContent -match 'PROXY_985_API_KEY=(.+)') {
    $key = $matches[1].Trim()
    if ($key -like '*your_*' -or $key.Length -lt 20) {
        Write-Host "❌ API KEY未配置或使用模板值"
    } else {
        Write-Host "✓ API KEY已配置: $($key.Substring(0,10))..."
    }
} else {
    Write-Host "❌ 未找到PROXY_985_API_KEY配置"
}



