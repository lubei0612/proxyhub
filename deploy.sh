#!/bin/bash

###############################################################################
# ProxyHub 一键部署脚本
# 用于服务器端快速部署
###############################################################################

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示欢迎信息
echo "=========================================="
echo "   ProxyHub 一键部署脚本"
echo "=========================================="
echo ""

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then 
    log_warning "建议不要使用root用户运行此脚本"
    read -p "是否继续? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 步骤1: 检查环境
log_info "步骤1: 检查系统环境..."

# 检查Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装！"
    log_info "请先安装Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
log_success "Docker 已安装: $(docker --version)"

# 检查Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose 未安装！"
    log_info "请先安装Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
log_success "Docker Compose 已安装: $(docker-compose --version)"

# 检查Git
if ! command -v git &> /dev/null; then
    log_error "Git 未安装！"
    exit 1
fi
log_success "Git 已安装: $(git --version)"

echo ""

# 步骤2: 检查并配置环境变量
log_info "步骤2: 检查环境变量配置..."

if [ ! -f .env ]; then
    log_warning ".env 文件不存在"
    
    if [ -f .env.example ]; then
        log_info "从 .env.example 复制配置..."
        cp .env.example .env
        log_warning "请编辑 .env 文件并配置以下必要参数:"
        echo "  - DATABASE_PASSWORD (数据库密码)"
        echo "  - JWT_SECRET (至少32个字符)"
        echo "  - PROXY_985_API_KEY (985Proxy API密钥)"
        echo "  - PROXY_985_ZONE (985Proxy Zone ID)"
        echo ""
        read -p "是否现在编辑 .env 文件? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        else
            log_error "请手动编辑 .env 文件后重新运行部署脚本"
            exit 1
        fi
    else
        log_error ".env.example 文件不存在！"
        exit 1
    fi
else
    log_success ".env 文件已存在"
    
    # 检查关键配置
    if grep -q "your_postgres_password_here" .env || \
       grep -q "CHANGE_THIS_TO_A_STRONG_RANDOM_SECRET" .env || \
       grep -q "your_985proxy_api_key_here" .env; then
        log_error ".env 文件包含默认值，请先配置实际参数！"
        log_info "需要配置的关键参数:"
        echo "  - DATABASE_PASSWORD"
        echo "  - JWT_SECRET"
        echo "  - PROXY_985_API_KEY"
        echo "  - PROXY_985_ZONE"
        exit 1
    fi
fi

echo ""

# 步骤3: 停止旧容器
log_info "步骤3: 停止旧容器（如果存在）..."

if docker-compose ps -q 2>/dev/null | grep -q .; then
    log_info "发现运行中的容器，正在停止..."
    docker-compose down
    log_success "旧容器已停止"
else
    log_info "没有运行中的容器"
fi

echo ""

# 步骤4: 清理（可选）
log_info "步骤4: 清理旧镜像和数据..."
read -p "是否清理旧的Docker镜像? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v --rmi all 2>/dev/null || true
    log_success "清理完成"
else
    log_info "跳过清理"
fi

echo ""

# 步骤5: 拉取最新镜像（如果使用预构建镜像）
# log_info "步骤5: 拉取最新镜像..."
# docker-compose pull

# 步骤5: 构建并启动
log_info "步骤5: 构建并启动服务..."

# 使用生产环境配置
if [ -f docker-compose.prod.yml ]; then
    log_info "使用生产环境配置..."
    docker-compose -f docker-compose.prod.yml up -d --build
else
    log_info "使用默认配置..."
    docker-compose up -d --build
fi

log_success "服务启动成功！"

echo ""

# 步骤6: 等待服务就绪
log_info "步骤6: 等待服务就绪..."

log_info "等待数据库启动..."
sleep 10

# 检查容器状态
log_info "检查容器状态..."
docker-compose ps

echo ""

# 步骤7: 健康检查
log_info "步骤7: 执行健康检查..."

max_retries=30
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    if curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
        log_success "后端服务健康检查通过！"
        break
    fi
    
    retry_count=$((retry_count + 1))
    if [ $retry_count -eq $max_retries ]; then
        log_error "后端服务健康检查失败！"
        log_info "查看日志: docker-compose logs backend"
        exit 1
    fi
    
    log_info "等待后端服务就绪... ($retry_count/$max_retries)"
    sleep 2
done

# 检查前端
if curl -f http://localhost:80 > /dev/null 2>&1; then
    log_success "前端服务健康检查通过！"
else
    log_warning "前端服务可能还在启动中..."
fi

echo ""

# 步骤8: 显示结果
log_success "=========================================="
log_success "   部署完成！"
log_success "=========================================="
echo ""
log_info "访问地址:"
echo "  - 前端: http://localhost:80"
echo "  - 后端API: http://localhost:3000/api/v1"
echo "  - API文档: http://localhost:3000/api"
echo ""
log_info "默认测试账号:"
echo "  管理员: admin@proxyhub.com / admin123456"
echo "  用户: test@proxyhub.com / test123456"
echo ""
log_warning "生产环境部署注意事项:"
echo "  1. 修改默认密码"
echo "  2. 配置域名和HTTPS"
echo "  3. 配置防火墙规则"
echo "  4. 定期备份数据库"
echo ""
log_info "常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo "  查看状态: docker-compose ps"
echo ""
log_info "详细文档: docs/DEPLOYMENT-CHECKLIST.md"
echo ""
