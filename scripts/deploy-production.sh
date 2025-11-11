#!/bin/bash

#############################################
# ProxyHub 生产环境自动部署脚本
# 功能: 完整部署，包含安全配置、数据库初始化、自动备份
#############################################

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
PROJECT_DIR="$HOME/proxyhub"
BACKUP_ENABLED="${ENABLE_AUTO_BACKUP:-true}"

echo "=========================================="
echo "  ProxyHub 生产环境部署脚本"
echo "=========================================="
echo ""

# 步骤1: 检查Docker环境
echo -e "${YELLOW}[1/10] 检查 Docker 环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装！${NC}"
    exit 1
fi
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装！${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker 环境正常${NC}"
echo ""

# 步骤2: 拉取最新代码
echo -e "${YELLOW}[2/10] 获取最新代码...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    git pull origin master
else
    git clone -b master https://github.com/lubei0612/proxyhub.git "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi
echo -e "${GREEN}✅ 代码获取完成${NC}"
echo ""

# 步骤3: 检查.env文件
echo -e "${YELLOW}[3/10] 配置环境变量...${NC}"
if [ ! -f ".env" ]; then
    echo "创建 .env 文件..."
    
    # 生成安全密码
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_SECRET=$(openssl rand -base64 48)
    
    cat > .env << EOF
# ============================================
# ProxyHub 生产环境配置
# ============================================

NODE_ENV=production
LOG_LEVEL=info
PORT=3000
API_PREFIX=/api/v1

# 数据库配置
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=${DB_PASSWORD}
DATABASE_NAME=proxyhub
DATABASE_SYNC=false

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379

# JWT配置 (强密钥)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d

# 985Proxy API配置
PROXY_985_API_KEY=${PROXY_985_API_KEY:-}
PROXY_985_BASE_URL=https://open-api.985proxy.com
PROXY_985_ZONE=${PROXY_985_ZONE:-}
PROXY_985_TEST_MODE=false

# 邮件服务配置
MAIL_HOST=${MAIL_HOST:-smtp.office365.com}
MAIL_PORT=${MAIL_PORT:-587}
MAIL_USER=${MAIL_USER:-}
MAIL_PASSWORD=${MAIL_PASSWORD:-}
MAIL_FROM=ProxyHub <noreply@proxyhub.com>

# 邮件备份服务
MAIL_HOST_BACKUP=smtp.gmail.com
MAIL_PORT_BACKUP=587
MAIL_USER_BACKUP=${MAIL_USER_BACKUP:-}
MAIL_PASSWORD_BACKUP=${MAIL_PASSWORD_BACKUP:-}

# 前端URL
FRONTEND_URL=http://$(hostname -I | awk '{print $1}')
CORS_ORIGINS=http://$(hostname -I | awk '{print $1}')

# Telegram (可选)
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
EOF
    
    echo -e "${GREEN}✅ .env 文件已创建${NC}"
    echo -e "${YELLOW}⚠️  请编辑 .env 文件，填入您的 API 密钥和邮箱配置${NC}"
    echo ""
    echo "必填项:"
    echo "  - PROXY_985_API_KEY"
    echo "  - PROXY_985_ZONE"
    echo "  - MAIL_USER"
    echo "  - MAIL_PASSWORD"
    echo ""
    read -p "配置完成后按回车继续..."
else
    echo -e "${GREEN}.env 文件已存在${NC}"
fi
echo ""

# 步骤4: 创建备份目录
echo -e "${YELLOW}[4/10] 创建备份目录...${NC}"
mkdir -p /var/backups/proxyhub
chmod 700 /var/backups/proxyhub
echo -e "${GREEN}✅ 备份目录已创建${NC}"
echo ""

# 步骤5: 配置自动备份
if [ "$BACKUP_ENABLED" = "true" ]; then
    echo -e "${YELLOW}[5/10] 配置自动备份...${NC}"
    
    # 创建cron任务 (每天凌晨2点备份)
    CRON_CMD="0 2 * * * cd $PROJECT_DIR && bash scripts/db-backup.sh >> /var/log/proxyhub-backup.log 2>&1"
    
    # 检查cron任务是否已存在
    if ! crontab -l 2>/dev/null | grep -q "db-backup.sh"; then
        (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
        echo -e "${GREEN}✅ 自动备份任务已配置 (每天 02:00)${NC}"
    else
        echo -e "${GREEN}自动备份任务已存在${NC}"
    fi
else
    echo -e "${YELLOW}[5/10] 跳过自动备份配置${NC}"
fi
echo ""

# 步骤6: 停止旧容器
echo -e "${YELLOW}[6/10] 停止旧容器...${NC}"
docker-compose down || true
echo -e "${GREEN}✅ 旧容器已停止${NC}"
echo ""

# 步骤7: 构建镜像
echo -e "${YELLOW}[7/10] 构建 Docker 镜像...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✅ 镜像构建完成${NC}"
echo ""

# 步骤8: 启动服务
echo -e "${YELLOW}[8/10] 启动服务...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ 服务已启动${NC}"
echo ""

# 步骤9: 等待服务就绪
echo -e "${YELLOW}[9/10] 等待服务就绪...${NC}"
sleep 15
echo -e "${GREEN}✅ 服务已就绪${NC}"
echo ""

# 步骤10: 初始化管理员账号
echo -e "${YELLOW}[10/10] 初始化管理员账号...${NC}"

# 生成管理员密码
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/")

# 生成bcrypt哈希
ADMIN_HASH=$(docker-compose exec -T backend node -e "console.log(require('bcrypt').hashSync('${ADMIN_PASSWORD}', 10))")

# 创建管理员账号
docker-compose exec -T postgres psql -U postgres -d proxyhub << EOF
INSERT INTO users (email, password, nickname, role) 
VALUES ('admin@proxyhub.com', '$ADMIN_HASH', 'Administrator', 'admin') 
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
EOF

echo -e "${GREEN}✅ 管理员账号已创建${NC}"
echo ""

# 输出部署信息
echo "=========================================="
echo -e "  ${GREEN}部署完成！${NC}"
echo "=========================================="
echo ""
echo "访问信息:"
echo "  前端: http://$(hostname -I | awk '{print $1}')"
echo "  API:  http://$(hostname -I | awk '{print $1}'):3000/api/v1"
echo "  文档: http://$(hostname -I | awk '{print $1}'):3000/api"
echo ""
echo "管理员账号:"
echo "  邮箱: admin@proxyhub.com"
echo "  密码: ${ADMIN_PASSWORD}"
echo ""
echo -e "${YELLOW}⚠️  请立即登录并修改管理员密码！${NC}"
echo -e "${YELLOW}⚠️  请保存好上述信息！${NC}"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo "  手动备份: bash scripts/db-backup.sh"
echo ""
echo "自动备份: 每天 02:00 自动备份到 /var/backups/proxyhub"
echo "=========================================="

