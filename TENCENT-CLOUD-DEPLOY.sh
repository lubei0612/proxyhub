#!/bin/bash

# ============================================
# ProxyHub 腾讯云一键部署脚本
# 使用方法: 复制整个脚本到服务器执行
# ============================================

set -e

echo "============================================"
echo "   ProxyHub 腾讯云自动部署"
echo "============================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# ============================================
# 步骤1: 安装Docker和Docker Compose
# ============================================
echo -e "${BLUE}[步骤1/6]${NC} 检查并安装Docker..."

if ! command -v docker &> /dev/null; then
    echo "安装Docker..."
    curl -fsSL https://get.docker.com | bash
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker安装完成${NC}"
else
    echo -e "${GREEN}✓ Docker已安装${NC}"
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "安装Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose安装完成${NC}"
else
    echo -e "${GREEN}✓ Docker Compose已安装${NC}"
fi

# ============================================
# 步骤2: 克隆GitHub仓库
# ============================================
echo ""
echo -e "${BLUE}[步骤2/6]${NC} 克隆项目代码..."

# 安装Git（如果未安装）
if ! command -v git &> /dev/null; then
    echo "安装Git..."
    sudo apt update
    sudo apt install git -y
fi

# 检查项目目录
if [ -d "/opt/proxyhub" ]; then
    echo "项目目录已存在，拉取最新代码..."
    cd /opt/proxyhub
    git pull origin master || git pull origin main
else
    echo "克隆项目..."
    cd /opt
    git clone https://github.com/YOUR_GITHUB_USERNAME/proxyhub.git
    cd proxyhub
fi

echo -e "${GREEN}✓ 代码准备完成${NC}"

# ============================================
# 步骤3: 创建.env文件
# ============================================
echo ""
echo -e "${BLUE}[步骤3/6]${NC} 配置环境变量..."

cat > /opt/proxyhub/.env << 'EOF'
# ============================================
# ProxyHub 生产环境配置文件
# ============================================

# 数据库配置 - Docker内部网络
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123
DATABASE_NAME=proxyhub
DATABASE_SYNC=false

# Redis配置 - Docker内部网络
REDIS_HOST=redis
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-long-random-string
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d

# 服务端口
PORT=3000
API_PREFIX=/api/v1

# 985Proxy配置 ⭐
PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
PROXY_985_BASE_URL=https://open-api.985proxy.com
PROXY_985_ZONE=6jd4ftbl7kv3
PROXY_985_TEST_MODE=false

# 邮件配置 (Outlook)
MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_USER=RobinsonKevin5468@outlook.com
MAIL_PASSWORD=ugfqftyq60695
MAIL_FROM="ProxyHub <noreply@proxyhub.com>"

# 邮件备份 (Gmail)
MAIL_HOST_BACKUP=smtp.gmail.com
MAIL_PORT_BACKUP=587
MAIL_USER_BACKUP=chenyuqi061245@gmail.com
MAIL_PASSWORD_BACKUP=vvdgyeerdtycwxka

# Telegram配置
TELEGRAM_BOT_TOKEN=8578437524:AAE66OfSvFJmma7va8lhaeNK70Q1Sj_HaNo
TELEGRAM_BOT_USERNAME=ProxyHub_Notify_Bot

# 系统环境
NODE_ENV=production
LOG_LEVEL=info
FRONTEND_URL=http://YOUR_SERVER_IP
EOF

# 获取服务器公网IP
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "YOUR_SERVER_IP")
sed -i "s|YOUR_SERVER_IP|${SERVER_IP}|g" /opt/proxyhub/.env

echo -e "${GREEN}✓ 环境变量配置完成${NC}"
echo "   服务器IP: ${SERVER_IP}"

# ============================================
# 步骤4: 配置防火墙
# ============================================
echo ""
echo -e "${BLUE}[步骤4/6]${NC} 配置防火墙..."

# 腾讯云使用安全组，但也配置本地防火墙
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp   # SSH
    sudo ufw allow 80/tcp   # HTTP
    sudo ufw allow 443/tcp  # HTTPS
    sudo ufw allow 8080/tcp # 前端
    sudo ufw allow 3000/tcp # 后端API
    sudo ufw --force enable
    echo -e "${GREEN}✓ UFW防火墙配置完成${NC}"
else
    echo "UFW未安装，请在腾讯云控制台配置安全组："
    echo "  - 开放端口: 22, 80, 443, 8080, 3000"
fi

echo ""
echo -e "${RED}⚠️  重要提醒：${NC}"
echo "请在腾讯云控制台 → 安全组 → 入站规则中添加："
echo "  - TCP:80   (HTTP)"
echo "  - TCP:443  (HTTPS)"
echo "  - TCP:8080 (前端)"
echo "  - TCP:3000 (后端API，可选)"

# ============================================
# 步骤5: 停止旧容器并部署
# ============================================
echo ""
echo -e "${BLUE}[步骤5/6]${NC} 部署Docker容器..."

cd /opt/proxyhub

# 停止旧容器
if docker ps -a | grep -q proxyhub; then
    echo "停止旧容器..."
    docker-compose -f docker-compose.cn.yml down 2>/dev/null || docker compose -f docker-compose.cn.yml down 2>/dev/null || true
fi

# 构建并启动
echo "构建镜像（这可能需要几分钟）..."
docker-compose -f docker-compose.cn.yml build --no-cache 2>/dev/null || docker compose -f docker-compose.cn.yml build --no-cache

echo "启动服务..."
docker-compose -f docker-compose.cn.yml up -d 2>/dev/null || docker compose -f docker-compose.cn.yml up -d

echo -e "${GREEN}✓ 容器启动完成${NC}"

# ============================================
# 步骤6: 验证部署
# ============================================
echo ""
echo -e "${BLUE}[步骤6/6]${NC} 验证部署状态..."

sleep 10

# 检查容器状态
echo ""
echo "容器状态："
docker ps --filter "name=proxyhub" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "============================================"
echo "           🎉 部署完成！"
echo "============================================"
echo ""
echo -e "${GREEN}访问地址：${NC}"
echo "  前端: http://${SERVER_IP}:8080"
echo "  后端: http://${SERVER_IP}:3000/api/v1"
echo ""
echo -e "${GREEN}默认管理员账户：${NC}"
echo "  邮箱: admin@example.com"
echo "  密码: admin123 (请立即修改)"
echo ""
echo -e "${BLUE}常用命令：${NC}"
echo "  查看日志:   docker logs -f proxyhub-backend"
echo "  重启服务:   cd /opt/proxyhub && docker-compose -f docker-compose.cn.yml restart"
echo "  停止服务:   cd /opt/proxyhub && docker-compose -f docker-compose.cn.yml down"
echo "  更新代码:   cd /opt/proxyhub && git pull && docker-compose -f docker-compose.cn.yml up -d --build"
echo ""
echo -e "${RED}⚠️  安全提醒：${NC}"
echo "  1. 请立即登录并修改管理员密码"
echo "  2. 确保腾讯云安全组已开放必要端口"
echo "  3. 建议配置HTTPS证书"
echo ""

