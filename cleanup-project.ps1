# ProxyHub 项目文件整理脚本 (PowerShell)
# 执行前请确保已提交当前代码

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🧹 ProxyHub 项目文件整理" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. 删除Windows批处理文件
Write-Host "`n1️⃣ 删除Windows批处理文件..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter *.bat | Remove-Item -Force
Write-Host "✅ 已删除所有.bat文件" -ForegroundColor Green

# 2. 删除临时文件
Write-Host "`n2️⃣ 删除临时文件..." -ForegroundColor Yellow
Remove-Item -Path "proxyhub-deploy.tar.gz" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "env-for-tencent-cloud.txt" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "init-database.js" -Force -ErrorAction SilentlyContinue
Write-Host "✅ 已删除临时文件" -ForegroundColor Green

# 3. 整理文档目录
Write-Host "`n3️⃣ 整理文档目录..." -ForegroundColor Yellow

# 创建新的文档结构
New-Item -ItemType Directory -Path "docs-organized\deployment" -Force | Out-Null
New-Item -ItemType Directory -Path "docs-organized\development" -Force | Out-Null
New-Item -ItemType Directory -Path "docs-organized\archive" -Force | Out-Null
New-Item -ItemType Directory -Path "docs-organized\troubleshooting" -Force | Out-Null

# 移动部署相关文档
Write-Host "  移动部署文档..." -ForegroundColor Gray
Move-Item -Path "START-HERE-开始部署.md" -Destination "docs-organized\deployment\" -Force -ErrorAction SilentlyContinue
Move-Item -Path "腾讯云-最终部署指南.md" -Destination "docs-organized\deployment\" -Force -ErrorAction SilentlyContinue
Move-Item -Path "腾讯云-国内加速部署指南.md" -Destination "docs-organized\deployment\" -Force -ErrorAction SilentlyContinue
Move-Item -Path "DEPLOY-WITH-ENV-TEMPLATE.md" -Destination "docs-organized\deployment\" -Force -ErrorAction SilentlyContinue
Move-Item -Path "DOCKER-ENV-LOADING-FIX.md" -Destination "docs-organized\troubleshooting\" -Force -ErrorAction SilentlyContinue
Move-Item -Path "QUICK-FIX-WHITSCREEN.md" -Destination "docs-organized\troubleshooting\" -Force -ErrorAction SilentlyContinue

# 移动状态报告到archive
Write-Host "  归档历史文档..." -ForegroundColor Gray
$archiveFiles = @(
    "✅-整理完成总结.md",
    "🎉-阶段性完成总结-2025-11-06.md",
    "🎉项目完成-准备部署.md",
    "🎯-最终完成总结-2025-11-06.md",
    "🎯-当前项目状态-2025-11-06.md",
    "🎯-项目最终交付报告-2025-11-06.md",
    "📊-流量系统部署完成.md",
    "ProxyHub-项目完整进度报告-2025-11-06.md",
    "项目文件整理完成.md",
    "价格覆盖修复完成-请测试.md",
    "当前状态-价格修复全部完成.md",
    "当前状态-价格修复完成.md",
    "执行数据清理.md",
    "数据一致性检查总结.md",
    "📝-数据清理说明.md"
)

foreach ($file in $archiveFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs-organized\archive\" -Force
    }
}

# 移动开发文档
Write-Host "  移动开发文档..." -ForegroundColor Gray
Move-Item -Path "📖-README-导航.md" -Destination "docs-organized\development\" -Force -ErrorAction SilentlyContinue
Move-Item -Path "🚀-开始使用-README.md" -Destination "docs-organized\development\" -Force -ErrorAction SilentlyContinue

# 合并旧的docs目录
Write-Host "  合并docs-archive..." -ForegroundColor Gray
if (Test-Path "docs-archive") {
    Move-Item -Path "docs-archive" -Destination "docs-organized\archive\docs-archive-2025-11-06" -Force
}

Write-Host "  合并docs-final..." -ForegroundColor Gray
if (Test-Path "docs-final-2025-11-06") {
    Move-Item -Path "docs-final-2025-11-06" -Destination "docs-organized\archive\" -Force
}

Write-Host "  合并docs-spec-workflow..." -ForegroundColor Gray
if (Test-Path "docs-spec-workflow") {
    Move-Item -Path "docs-spec-workflow" -Destination "docs-organized\development\" -Force
}

Write-Host "✅ 文档整理完成" -ForegroundColor Green

# 4. 整理部署脚本
Write-Host "`n4️⃣ 整理部署脚本..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "deployment-scripts" -Force | Out-Null
$deployScripts = @("deploy-china.sh", "deploy-tencentcloud.sh", "deploy-to-server.sh", "deploy.sh")
foreach ($script in $deployScripts) {
    if (Test-Path $script) {
        Move-Item -Path $script -Destination "deployment-scripts\" -Force
    }
}
Write-Host "✅ 部署脚本已移动到 deployment-scripts\" -ForegroundColor Green

# 5. 替换README
Write-Host "`n5️⃣ 更新README..." -ForegroundColor Yellow
if (Test-Path "README-NEW.md") {
    if (Test-Path "README.md") {
        Move-Item -Path "README.md" -Destination "docs-organized\archive\README-OLD.md" -Force
    }
    Move-Item -Path "README-NEW.md" -Destination "README.md" -Force
    Write-Host "✅ README已更新" -ForegroundColor Green
}

# 6. 显示整理后的结构
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "📁 整理后的项目结构" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host @"

proxyhub/
├── backend/              # 后端代码
├── frontend/             # 前端代码
├── docs/                 # 主要文档（保留原有）
├── docs-organized/       # 整理后的文档
│   ├── deployment/       # 部署相关
│   ├── development/      # 开发相关
│   ├── troubleshooting/  # 问题修复
│   └── archive/          # 历史归档
├── deployment-scripts/   # 部署脚本
├── scripts/              # 工具脚本
├── docker-compose.*.yml  # Docker配置
├── README.md             # 项目说明
└── .gitignore            # Git忽略配置

"@ -ForegroundColor White

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ 整理完成！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`n📝 下一步：" -ForegroundColor Yellow
Write-Host "1. 检查整理结果" -ForegroundColor White
Write-Host "2. 提交到Git: git add -A && git commit -m 'refactor: reorganize project structure'" -ForegroundColor White
Write-Host "3. 推送到GitHub: git push origin master" -ForegroundColor White
Write-Host ""

