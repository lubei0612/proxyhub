#!/bin/bash

# ============================================
# ProxyHub 服务器部署脚本
# ============================================
# 用途：在服务器上自动部署 ProxyHub 项目
# 使用：bash deploy-server.sh

set -e  # 遇到错误立即退出

echo "================================================"
echo "  ProxyHub 服务器部署脚本"
echo "================================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
echo -e "${YELLOW}[1/8] 检查 Docker 环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装！${NC}"
    echo "请先安装 Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装！${NC}"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker 环境正常${NC}"
echo ""

# 克隆或更新代码
echo -e "${YELLOW}[2/8] 获取最新代码...${NC}"
if [ -d "proxyhub" ]; then
    echo "项目已存在，更新代码..."
    cd proxyhub
    git pull origin main || git pull origin master
else
    echo "克隆项目..."
    # 替换为您的 GitHub 仓库地址
    git clone YOUR_GITHUB_REPO_URL proxyhub
    cd proxyhub
fi
echo -e "${GREEN}✅ 代码获取完成${NC}"
echo ""

# 配置环境变量
echo -e "${YELLOW}[3/8] 配置环境变量...${NC}"
if [ ! -f ".env" ]; then
    if [ -f "env.production.template" ]; then
        echo "使用生产环境配置模板..."
        cp env.production.template .env
        echo -e "${YELLOW}⚠️  请编辑 .env 文件，填入真实的配置信息！${NC}"
        echo -e "${YELLOW}⚠️  必须配置项：${NC}"
        echo "   - DATABASE_PASSWORD"
        echo "   - JWT_SECRET (至少32字符)"
        echo "   - PROXY_985_API_KEY"
        echo "   - PROXY_985_ZONE"
        echo "   - MAIL_USER / MAIL_PASSWORD"
        echo "   - FRONTEND_URL"
        echo "   - CORS_ORIGINS"
        echo ""
        read -p "是否现在编辑 .env 文件？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        else
            echo -e "${RED}请手动编辑 .env 文件后再继续部署！${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ 未找到 .env.production 模板！${NC}"
        exit 1
    fi
else
    echo ".env 文件已存在"
fi
echo -e "${GREEN}✅ 环境变量配置完成${NC}"
echo ""

# 生成强 JWT_SECRET（如果需要）
echo -e "${YELLOW}[4/8] 检查 JWT_SECRET...${NC}"
JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d '=' -f2)
if [ "$JWT_SECRET" == "REPLACE_WITH_YOUR_STRONG_JWT_SECRET_48_CHARS_MIN" ]; then
    echo "生成新的 JWT_SECRET..."
    NEW_JWT_SECRET=$(openssl rand -base64 48 2>/dev/null || node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${NEW_JWT_SECRET}|g" .env
    echo -e "${GREEN}✅ JWT_SECRET 已自动生成${NC}"
else
    echo "JWT_SECRET 已配置"
fi
echo ""

# 停止旧容器
echo -e "${YELLOW}[5/8] 停止旧容器...${NC}"
docker-compose down || true
echo -e "${GREEN}✅ 旧容器已停止${NC}"
echo ""

# 构建镜像
echo -e "${YELLOW}[6/8] 构建 Docker 镜像...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✅ 镜像构建完成${NC}"
echo ""

# 启动服务
echo -e "${YELLOW}[7/8] 启动服务...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ 服务启动完成${NC}"
echo ""

# 等待服务就绪
echo -e "${YELLOW}[8/8] 等待服务就绪...${NC}"
echo "等待数据库和后端服务启动（约30秒）..."
sleep 30

# 检查服务状态
echo ""
echo "检查服务状态..."
docker-compose ps
echo ""

# 检查后端日志
echo "检查后端启动日志..."
docker-compose logs --tail=20 backend | grep -i "ProxyHub\|Started\|Error" || true
echo ""

# 显示访问信息
echo "================================================"
echo -e "${GREEN}  🎉 部署完成！${NC}"
echo "================================================"
echo ""
echo "服务访问地址："
echo "  前端: http://$(hostname -I | awk '{print $1}'):80"
echo "  后端API: http://$(hostname -I | awk '{print $1}'):3000/api/v1"
echo "  API文档: http://$(hostname -I | awk '{print $1}'):3000/api"
echo ""
echo "管理员账号："
echo "  邮箱: admin@proxyhub.com"
echo "  密码: Admin123456"
echo ""
echo "常用命令："
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo ""
echo "⚠️  安全提示："
echo "  1. 请修改管理员密码"
echo "  2. 配置防火墙规则"
echo "  3. 配置 SSL 证书（推荐使用 Nginx + Let's Encrypt）"
echo "  4. 定期备份数据库"
echo ""

