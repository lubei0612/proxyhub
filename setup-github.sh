#!/bin/bash

# ============================================
# ProxyHub GitHub 仓库设置脚本
# ============================================

set -e

echo "================================================"
echo "  ProxyHub GitHub 仓库设置"
echo "================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查是否已初始化 Git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}初始化 Git 仓库...${NC}"
    git init
    echo -e "${GREEN}✅ Git 仓库已初始化${NC}"
else
    echo "Git 仓库已存在"
fi
echo ""

# 检查 .gitignore
echo -e "${YELLOW}检查 .gitignore...${NC}"
if [ ! -f ".gitignore" ]; then
    echo "创建 .gitignore..."
    cat > .gitignore << 'EOF'
# Environment files
.env
.env.local
.env.*.local
.env.backup

# Node modules
node_modules/
**/node_modules/

# Build output
dist/
build/
**/dist/
**/build/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
*.tsbuildinfo

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Docker
*.tar.gz

# Temporary files
tmp/
temp/
*.tmp

# Database
*.sql
*.sqlite
*.db

# Sensitive files
*.pem
*.key
*.cert
*.crt
secrets/

# Test coverage
coverage/
.nyc_output/

# Backup files
*.backup
.env.backup
EOF
    echo -e "${GREEN}✅ .gitignore 已创建${NC}"
else
    echo ".gitignore 已存在"
fi
echo ""

# 添加所有文件
echo -e "${YELLOW}添加文件到 Git...${NC}"
git add .
echo -e "${GREEN}✅ 文件已添加${NC}"
echo ""

# 提交
echo -e "${YELLOW}创建初始提交...${NC}"
git commit -m "feat: Initial commit - ProxyHub v1.0

- ✅ 完整的前端和后端代码
- ✅ Docker 部署配置
- ✅ 安全加固（JWT、密码策略、速率限制）
- ✅ 用户管理、代理管理、订单管理
- ✅ 价格覆盖、充值审核功能
- ✅ 完整的部署文档和脚本
- ✅ 生产环境配置模板
" || echo "已有提交，跳过..."
echo -e "${GREEN}✅ 提交完成${NC}"
echo ""

# 提示用户添加远程仓库
echo "================================================"
echo -e "${GREEN}  设置完成！${NC}"
echo "================================================"
echo ""
echo "接下来的步骤："
echo ""
echo "1. 在 GitHub 上创建新仓库（不要初始化 README）"
echo "   https://github.com/new"
echo ""
echo "2. 添加远程仓库并推送："
echo -e "${YELLOW}   git remote add origin https://github.com/YOUR_USERNAME/proxyhub.git${NC}"
echo -e "${YELLOW}   git branch -M main${NC}"
echo -e "${YELLOW}   git push -u origin main${NC}"
echo ""
echo "3. 或者使用 SSH："
echo -e "${YELLOW}   git remote add origin git@github.com:YOUR_USERNAME/proxyhub.git${NC}"
echo -e "${YELLOW}   git branch -M main${NC}"
echo -e "${YELLOW}   git push -u origin main${NC}"
echo ""

