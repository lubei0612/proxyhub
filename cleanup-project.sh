#!/bin/bash
# ProxyHub 项目文件整理脚本
# 执行前请确保已提交当前代码：git commit -am "backup before cleanup"

set -e

echo "========================================="
echo "🧹 ProxyHub 项目文件整理"
echo "========================================="

# 1. 删除Windows批处理文件
echo ""
echo "1️⃣ 删除Windows批处理文件..."
rm -f *.bat
echo "✅ 已删除所有.bat文件"

# 2. 删除临时文件
echo ""
echo "2️⃣ 删除临时文件..."
rm -f proxyhub-deploy.tar.gz
rm -f env-for-tencent-cloud.txt
rm -f init-database.js  # 已在backend目录有
echo "✅ 已删除临时文件"

# 3. 整理文档目录
echo ""
echo "3️⃣ 整理文档目录..."

# 创建新的文档结构
mkdir -p docs-organized/{deployment,development,archive,troubleshooting}

# 移动部署相关文档
echo "  移动部署文档..."
mv START-HERE-开始部署.md docs-organized/deployment/ 2>/dev/null || true
mv 腾讯云-最终部署指南.md docs-organized/deployment/ 2>/dev/null || true
mv 腾讯云-国内加速部署指南.md docs-organized/deployment/ 2>/dev/null || true
mv DEPLOY-WITH-ENV-TEMPLATE.md docs-organized/deployment/ 2>/dev/null || true
mv DOCKER-ENV-LOADING-FIX.md docs-organized/troubleshooting/ 2>/dev/null || true
mv QUICK-FIX-WHITSCREEN.md docs-organized/troubleshooting/ 2>/dev/null || true

# 移动状态报告到archive
echo "  归档历史文档..."
mv ✅-整理完成总结.md docs-organized/archive/ 2>/dev/null || true
mv 🎉-阶段性完成总结-2025-11-06.md docs-organized/archive/ 2>/dev/null || true
mv 🎉项目完成-准备部署.md docs-organized/archive/ 2>/dev/null || true
mv 🎯-最终完成总结-2025-11-06.md docs-organized/archive/ 2>/dev/null || true
mv 🎯-当前项目状态-2025-11-06.md docs-organized/archive/ 2>/dev/null || true
mv 🎯-项目最终交付报告-2025-11-06.md docs-organized/archive/ 2>/dev/null || true
mv 📊-流量系统部署完成.md docs-organized/archive/ 2>/dev/null || true
mv ProxyHub-项目完整进度报告-2025-11-06.md docs-organized/archive/ 2>/dev/null || true
mv 项目文件整理完成.md docs-organized/archive/ 2>/dev/null || true
mv 价格覆盖修复完成-请测试.md docs-organized/archive/ 2>/dev/null || true
mv 当前状态-价格修复全部完成.md docs-organized/archive/ 2>/dev/null || true
mv 当前状态-价格修复完成.md docs-organized/archive/ 2>/dev/null || true
mv 执行数据清理.md docs-organized/archive/ 2>/dev/null || true
mv 数据一致性检查总结.md docs-organized/archive/ 2>/dev/null || true
mv 📝-数据清理说明.md docs-organized/archive/ 2>/dev/null || true

# 移动开发文档
echo "  移动开发文档..."
mv 📖-README-导航.md docs-organized/development/ 2>/dev/null || true
mv 🚀-开始使用-README.md docs-organized/development/ 2>/dev/null || true

# 合并旧的docs目录
echo "  合并docs-archive..."
if [ -d "docs-archive" ]; then
  mv docs-archive docs-organized/archive/docs-archive-2025-11-06
fi

echo "  合并docs-final..."
if [ -d "docs-final-2025-11-06" ]; then
  mv docs-final-2025-11-06 docs-organized/archive/
fi

echo "  合并docs-spec-workflow..."
if [ -d "docs-spec-workflow" ]; then
  mv docs-spec-workflow docs-organized/development/
fi

echo "✅ 文档整理完成"

# 4. 整理部署脚本
echo ""
echo "4️⃣ 整理部署脚本..."
mkdir -p deployment-scripts
mv deploy-china.sh deployment-scripts/ 2>/dev/null || true
mv deploy-tencentcloud.sh deployment-scripts/ 2>/dev/null || true
mv deploy-to-server.sh deployment-scripts/ 2>/dev/null || true
mv deploy.sh deployment-scripts/ 2>/dev/null || true
echo "✅ 部署脚本已移动到 deployment-scripts/"

# 5. 整理PowerShell脚本
echo ""
echo "5️⃣ 移动PowerShell脚本到scripts..."
if [ -f "scripts/fix-985proxy-config.ps1" ]; then
  echo "✅ PowerShell脚本已在scripts目录"
else
  mv *.ps1 scripts/ 2>/dev/null || true
fi

# 6. 显示整理后的结构
echo ""
echo "========================================="
echo "📁 整理后的项目结构"
echo "========================================="
echo ""
echo "proxyhub/"
echo "├── backend/              # 后端代码"
echo "├── frontend/             # 前端代码"
echo "├── docs/                 # 主要文档（保留原有）"
echo "├── docs-organized/       # 整理后的文档"
echo "│   ├── deployment/       # 部署相关"
echo "│   ├── development/      # 开发相关"
echo "│   ├── troubleshooting/  # 问题修复"
echo "│   └── archive/          # 历史归档"
echo "├── deployment-scripts/   # 部署脚本"
echo "├── scripts/              # 工具脚本"
echo "├── docker-compose.*.yml  # Docker配置"
echo "├── README.md             # 项目说明"
echo "└── .gitignore            # Git忽略配置"
echo ""
echo "========================================="
echo "✅ 整理完成！"
echo "========================================="
echo ""
echo "📝 下一步："
echo "1. 检查整理结果"
echo "2. 更新README.md"
echo "3. 提交到Git: git add -A && git commit -m 'refactor: reorganize project structure'"
echo "4. 推送到GitHub: git push origin master"
echo ""

