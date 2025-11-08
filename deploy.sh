#!/bin/bash

# ============================================
# ProxyHub 一键部署脚本
# 适用于生产环境服务器部署
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 打印函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[STEP $1/${2}]${NC} $3"
}

# 标题
clear
echo "============================================"
echo "       ProxyHub 生产环境部署工具"
echo "============================================"
echo ""

# 总步骤数
TOTAL_STEPS=8
CURRENT_STEP=0

# 步骤1: 环境检查
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "检查系统环境..."

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then 
    print_warning "建议不要使用root用户运行部署脚本"
    read -p "是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker 未安装！请先安装 Docker"
    exit 1
fi
print_success "Docker 已安装"

# 检查Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose 未安装！请先安装 Docker Compose"
    exit 1
fi
print_success "Docker Compose 已安装"

# 检查Git
if ! command -v git &> /dev/null; then
    print_error "Git 未安装！请先安装 Git"
    exit 1
fi
print_success "Git 已安装"

# 步骤2: 配置.env文件
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "检查环境变量配置..."

if [ ! -f .env ]; then
    print_warning ".env 文件不存在"
    
    if [ -f .env.example ]; then
        print_info "发现 .env.example 模板文件"
        read -p "是否运行配置向导？(Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            chmod +x setup-env.sh
            ./setup-env.sh
        else
            print_error "请手动创建 .env 文件或运行 ./setup-env.sh"
            exit 1
        fi
    else
        print_error "未找到 .env.example 模板文件"
        exit 1
    fi
else
    print_success ".env 文件已存在"
fi

# 验证必需的环境变量
print_info "验证关键配置..."
source .env

REQUIRED_VARS=(
    "DATABASE_PASSWORD"
    "JWT_SECRET"
    "PROXY_985_API_KEY"
    "PROXY_985_ZONE"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"your_"* ]] || [[ "${!var}" == *"change_this"* ]]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_error "以下环境变量未正确配置："
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    print_info "请编辑 .env 文件并填写正确的值"
    exit 1
fi
print_success "环境变量验证通过"

# 步骤3: 停止旧容器
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "停止现有容器..."

if docker ps -a | grep -q proxyhub; then
    print_info "发现运行中的容器，正在停止..."
    docker-compose -f docker-compose.cn.yml down || docker compose -f docker-compose.cn.yml down || true
    print_success "已停止旧容器"
else
    print_info "未发现运行中的容器"
fi

# 步骤4: 清理Docker资源（可选）
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "清理Docker资源..."

read -p "是否清理未使用的Docker镜像和卷？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "清理Docker资源..."
    docker system prune -f
    print_success "清理完成"
else
    print_info "跳过Docker资源清理"
fi

# 步骤5: 构建镜像
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "构建Docker镜像..."

print_info "这可能需要几分钟时间，请耐心等待..."
if docker-compose -f docker-compose.cn.yml build --no-cache; then
    print_success "镜像构建成功"
else
    if docker compose -f docker-compose.cn.yml build --no-cache; then
        print_success "镜像构建成功"
    else
        print_error "镜像构建失败"
        exit 1
    fi
fi

# 步骤6: 启动服务
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "启动服务..."

if docker-compose -f docker-compose.cn.yml up -d; then
    print_success "服务启动成功"
else
    if docker compose -f docker-compose.cn.yml up -d; then
        print_success "服务启动成功"
    else
        print_error "服务启动失败"
        exit 1
    fi
fi

# 步骤7: 健康检查
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "等待服务就绪..."

print_info "等待容器启动..."
sleep 10

# 检查容器状态
CONTAINERS=("proxyhub-postgres" "proxyhub-redis" "proxyhub-backend" "proxyhub-frontend")
ALL_HEALTHY=true

for container in "${CONTAINERS[@]}"; do
    if docker ps | grep -q "$container"; then
        STATUS=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "not found")
        if [ "$STATUS" == "running" ]; then
            print_success "$container: 运行中"
        else
            print_error "$container: $STATUS"
            ALL_HEALTHY=false
        fi
    else
        print_error "$container: 未找到"
        ALL_HEALTHY=false
    fi
done

if [ "$ALL_HEALTHY" = false ]; then
    print_warning "部分容器状态异常，请检查日志"
    print_info "查看日志命令："
    echo "  docker logs proxyhub-backend"
    echo "  docker logs proxyhub-frontend"
fi

# 步骤8: 显示部署信息
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "部署完成！"

echo ""
echo "============================================"
echo "           🎉 部署成功！"
echo "============================================"
echo ""
print_info "服务访问信息："
echo "  前端: http://localhost:8080"
echo "  后端API: http://localhost:3000/api/v1"
echo ""
print_info "默认管理员账户（首次部署）："
echo "  邮箱: ${ADMIN_EMAIL:-admin@example.com}"
echo "  密码: ${ADMIN_PASSWORD:-请查看.env文件}"
echo ""
print_warning "重要提示："
echo "  1. 请立即登录并修改管理员密码"
echo "  2. 配置防火墙规则，只开放必要的端口"
echo "  3. 定期备份数据库数据"
echo "  4. 监控系统日志和容器状态"
echo ""
print_info "常用命令："
echo "  查看日志:     docker logs -f proxyhub-backend"
echo "  重启服务:     docker-compose -f docker-compose.cn.yml restart"
echo "  停止服务:     docker-compose -f docker-compose.cn.yml down"
echo "  查看状态:     docker-compose -f docker-compose.cn.yml ps"
echo ""
print_success "部署完成！祝您使用愉快！"
