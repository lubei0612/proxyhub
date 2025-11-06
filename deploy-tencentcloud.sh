#!/bin/bash

###############################################################################
# ProxyHub 腾讯云自动化部署脚本
# 使用方法: 
#   1. 上传此脚本到服务器: scp deploy-tencentcloud.sh root@your-server-ip:/root/
#   2. SSH连接到服务器: ssh root@your-server-ip
#   3. 赋予执行权限: chmod +x deploy-tencentcloud.sh
#   4. 运行脚本: ./deploy-tencentcloud.sh
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印标题
print_header() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  $1${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

# 检查是否以root权限运行
check_root() {
    if [[ $EUID -ne 0 ]]; then
       print_error "此脚本必须以root权限运行"
       exit 1
    fi
}

# 更新系统
update_system() {
    print_header "步骤 1: 更新系统"
    print_info "更新软件包列表..."
    apt update
    print_info "升级系统软件包..."
    apt upgrade -y
    print_success "系统更新完成"
}

# 安装Docker
install_docker() {
    print_header "步骤 2: 安装 Docker"
    
    if command -v docker &> /dev/null; then
        print_warning "Docker已安装，跳过安装步骤"
        docker --version
        return 0
    fi
    
    print_info "安装Docker依赖..."
    apt install -y ca-certificates curl gnupg lsb-release
    
    print_info "添加Docker GPG密钥..."
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    print_info "添加Docker仓库..."
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    print_info "安装Docker Engine..."
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    print_info "启动Docker服务..."
    systemctl start docker
    systemctl enable docker
    
    print_success "Docker安装完成"
    docker --version
    docker compose version
}

# 安装Git
install_git() {
    print_header "步骤 3: 安装 Git"
    
    if command -v git &> /dev/null; then
        print_warning "Git已安装，跳过安装步骤"
        git --version
        return 0
    fi
    
    print_info "安装Git..."
    apt install -y git
    
    print_success "Git安装完成"
    git --version
}

# 创建项目目录
create_project_dir() {
    print_header "步骤 4: 创建项目目录"
    
    PROJECT_DIR="/opt/proxyhub"
    
    if [ -d "$PROJECT_DIR" ]; then
        print_warning "目录 $PROJECT_DIR 已存在"
        read -p "是否删除并重新创建? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "删除旧目录..."
            rm -rf "$PROJECT_DIR"
            mkdir -p "$PROJECT_DIR"
            print_success "目录已重新创建: $PROJECT_DIR"
        else
            print_info "保留现有目录"
        fi
    else
        mkdir -p "$PROJECT_DIR"
        print_success "目录创建成功: $PROJECT_DIR"
    fi
    
    cd "$PROJECT_DIR"
}

# 生成安全密钥
generate_secrets() {
    print_header "步骤 5: 生成安全密钥"
    
    print_info "生成数据库密码..."
    DB_PASSWORD=$(openssl rand -base64 24)
    
    print_info "生成Redis密码..."
    REDIS_PASSWORD=$(openssl rand -base64 24)
    
    print_info "生成JWT密钥..."
    JWT_SECRET=$(openssl rand -base64 48)
    
    print_success "安全密钥生成完成"
}

# 配置环境变量
configure_env() {
    print_header "步骤 6: 配置环境变量"
    
    # 获取服务器公网IP
    SERVER_IP=$(curl -s ifconfig.me || echo "localhost")
    print_info "检测到服务器IP: $SERVER_IP"
    
    # 询问985Proxy API密钥
    print_info "请输入985Proxy API配置信息:"
    read -p "API Key: " PROXY985_API_KEY
    read -p "API Secret: " PROXY985_API_SECRET
    
    # 创建后端环境变量
    print_info "创建后端环境变量文件..."
    mkdir -p backend
    cat > backend/.env.production << EOF
# 数据库配置
DB_HOST=db
DB_PORT=5432
DB_USERNAME=proxyhub
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=proxyhub

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT配置
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7200

# 985Proxy API配置
PROXY985_API_KEY=$PROXY985_API_KEY
PROXY985_API_SECRET=$PROXY985_API_SECRET
PROXY985_API_BASE_URL=https://api.985proxy.com

# 应用配置
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://$SERVER_IP:8080
EOF
    
    # 创建前端环境变量
    print_info "创建前端环境变量文件..."
    mkdir -p frontend
    cat > frontend/.env.production << EOF
VITE_API_BASE_URL=http://$SERVER_IP:3000/api/v1
VITE_APP_TITLE=ProxyHub
EOF
    
    # 创建docker-compose环境变量
    cat > .env << EOF
DB_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
SERVER_IP=$SERVER_IP
EOF
    
    print_success "环境变量配置完成"
}

# 等待项目文件上传
wait_for_upload() {
    print_header "步骤 7: 上传项目文件"
    
    print_warning "请在本地Windows电脑上执行以下操作:"
    echo ""
    echo -e "${YELLOW}1. 打开PowerShell或命令提示符${NC}"
    echo -e "${YELLOW}2. 进入项目目录:${NC}"
    echo "   cd D:\\Users\\Desktop\\proxyhub"
    echo ""
    echo -e "${YELLOW}3. 使用以下命令上传项目文件:${NC}"
    echo "   # 方法1: 使用SCP（推荐）"
    echo "   tar --exclude='node_modules' --exclude='.git' --exclude='dist' -czf proxyhub.tar.gz ."
    echo "   scp proxyhub.tar.gz root@$SERVER_IP:/opt/proxyhub/"
    echo ""
    echo "   # 方法2: 使用WinSCP图形界面"
    echo "   下载WinSCP: https://winscp.net/"
    echo "   连接到 $SERVER_IP，上传整个proxyhub文件夹到 /opt/proxyhub"
    echo ""
    
    read -p "上传完成后，按Enter继续..." -r
    
    # 如果是tar包，解压
    if [ -f "proxyhub.tar.gz" ]; then
        print_info "检测到tar包，正在解压..."
        tar -xzf proxyhub.tar.gz
        rm proxyhub.tar.gz
        print_success "解压完成"
    fi
    
    # 验证必要文件
    if [ ! -f "docker-compose.yml" ]; then
        print_error "未找到docker-compose.yml文件，请确保项目文件已正确上传"
        exit 1
    fi
    
    print_success "项目文件验证通过"
}

# 构建和启动容器
build_and_start() {
    print_header "步骤 8: 构建和启动容器"
    
    print_info "构建Docker镜像（这可能需要10-20分钟）..."
    docker compose build
    
    print_info "启动所有容器..."
    docker compose up -d
    
    print_info "等待服务启动..."
    sleep 10
    
    print_success "容器启动完成"
}

# 初始化数据库
init_database() {
    print_header "步骤 9: 初始化数据库"
    
    print_info "等待数据库就绪..."
    sleep 5
    
    print_info "运行数据库迁移..."
    docker compose exec -T backend npm run migration:run || true
    
    print_info "创建种子数据..."
    docker compose exec -T backend npm run seed || true
    
    print_success "数据库初始化完成"
}

# 配置防火墙
configure_firewall() {
    print_header "步骤 10: 配置防火墙"
    
    print_info "配置UFW防火墙..."
    
    # 检查UFW是否安装
    if ! command -v ufw &> /dev/null; then
        print_info "安装UFW..."
        apt install -y ufw
    fi
    
    # 配置规则
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    ufw allow 3000/tcp comment 'Backend API'
    ufw allow 8080/tcp comment 'Frontend'
    
    # 启用防火墙（如果尚未启用）
    print_warning "即将启用防火墙，确保SSH端口(22)已开放"
    read -p "继续? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ufw --force enable
        print_success "防火墙配置完成"
        ufw status
    else
        print_warning "跳过防火墙启用"
    fi
}

# 显示部署信息
show_deployment_info() {
    print_header "🎉 部署完成!"
    
    SERVER_IP=$(curl -s ifconfig.me || echo "localhost")
    
    echo ""
    echo -e "${GREEN}访问地址:${NC}"
    echo "  前端: http://$SERVER_IP:8080"
    echo "  后端: http://$SERVER_IP:3000/api/v1"
    echo "  API文档: http://$SERVER_IP:3000/api"
    echo ""
    echo -e "${GREEN}测试账号:${NC}"
    echo "  管理员: admin@example.com / admin123"
    echo "  测试用户: alice@test.com / password123"
    echo ""
    echo -e "${GREEN}常用命令:${NC}"
    echo "  查看日志: cd /opt/proxyhub && docker compose logs -f"
    echo "  重启服务: cd /opt/proxyhub && docker compose restart"
    echo "  停止服务: cd /opt/proxyhub && docker compose stop"
    echo "  启动服务: cd /opt/proxyhub && docker compose start"
    echo ""
    echo -e "${YELLOW}重要提醒:${NC}"
    echo "  1. 请到腾讯云控制台配置安全组，开放端口: 80, 443, 3000, 8080"
    echo "  2. 建议配置域名和HTTPS证书"
    echo "  3. 定期备份数据库"
    echo "  4. 查看完整文档: docs-final-2025-11-06/腾讯云Docker部署指南.md"
    echo ""
}

# 主流程
main() {
    print_header "ProxyHub 腾讯云自动化部署"
    
    check_root
    update_system
    install_docker
    install_git
    create_project_dir
    generate_secrets
    configure_env
    wait_for_upload
    build_and_start
    init_database
    configure_firewall
    show_deployment_info
    
    print_success "部署脚本执行完成!"
}

# 执行主流程
main

