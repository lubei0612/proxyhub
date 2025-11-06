# Spec-Workflow Dashboard 启动器 (PowerShell)
# 编码: UTF-8

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Spec-Workflow Dashboard 启动器" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
try {
    $nodeVersion = node --version
    Write-Host "[信息] 检测到 Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[错误] 未检测到 Node.js，请先安装 Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""
Write-Host "[信息] 正在启动 Spec-Workflow Dashboard..." -ForegroundColor Cyan
Write-Host ""
Write-Host "[提示] Dashboard 通常会在以下地址打开:" -ForegroundColor Yellow
Write-Host "        http://localhost:3000 (或其他端口)" -ForegroundColor Yellow
Write-Host ""
Write-Host "[提示] 按 Ctrl+C 可以停止服务" -ForegroundColor Yellow
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 设置项目路径
$projectPath = $PSScriptRoot

# 尝试启动
try {
    Write-Host "[尝试] 启动 spec-workflow-mcp..." -ForegroundColor Cyan
    
    # 检查是否全局安装
    $globalCmd = Get-Command spec-workflow-mcp -ErrorAction SilentlyContinue
    
    if ($globalCmd) {
        Write-Host "[成功] 发现全局安装，正在启动..." -ForegroundColor Green
        Write-Host ""
        
        # 设置环境变量
        $env:PROJECT_PATH = $projectPath
        
        # 启动服务
        spec-workflow-mcp
    } else {
        Write-Host "[信息] 未发现全局安装，使用 npx 启动..." -ForegroundColor Yellow
        Write-Host ""
        
        # 设置环境变量
        $env:PROJECT_PATH = $projectPath
        
        # 使用 npx
        npx @pimzino/spec-workflow-mcp
    }
} catch {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "[错误] 启动失败" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "错误信息: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请尝试以下解决方案:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 全局安装 (推荐):" -ForegroundColor Cyan
    Write-Host "   npm install -g @pimzino/spec-workflow-mcp" -ForegroundColor White
    Write-Host ""
    Write-Host "2. 本地安装:" -ForegroundColor Cyan
    Write-Host "   npm install @pimzino/spec-workflow-mcp --save-dev" -ForegroundColor White
    Write-Host ""
    Write-Host "3. 使用 npx (无需安装):" -ForegroundColor Cyan
    Write-Host "   npx @pimzino/spec-workflow-mcp" -ForegroundColor White
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}

