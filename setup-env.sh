#!/bin/bash

# ============================================
# ProxyHub 环境变量自动配置脚本
# 功能：自动生成 .env 文件或交互式输入配置
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
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

# 标题
echo "============================================"
echo "     ProxyHub 环境变量配置工具"
echo "============================================"
echo ""

# 检查是否已存在.env文件
if [ -f .env ]; then
    print_warning ".env 文件已存在！"
    read -p "是否要覆盖现有配置？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "保留现有 .env 文件，退出配置"
        exit 0
    fi
    # 备份现有.env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    print_success "已备份现有 .env 文件"
fi

# 检查是否存在模板文件
if [ ! -f .env.example ]; then
    print_error ".env.example 模板文件不存在！"
    exit 1
fi

# 配置模式选择
echo ""
print_info "请选择配置模式："
echo "  1) 快速模式 - 使用默认值（本地测试）"
echo "  2) 交互模式 - 逐项输入配置（生产环境推荐）"
echo "  3) 从备份恢复"
read -p "请选择 (1/2/3): " -n 1 -r CONFIG_MODE
echo ""

case $CONFIG_MODE in
    1)
        print_info "使用快速配置模式..."
        # 复制示例文件
        cp .env.example .env
        
        # 生成随机JWT密钥
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        sed -i.bak "s|your_super_secret_jwt_key_change_this_in_production_use_long_random_string|${JWT_SECRET}|g" .env
        
        # 生成随机数据库密码
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr '+/' '-_')
        sed -i.bak "s|your_secure_database_password_here|${DB_PASSWORD}|g" .env
        
        print_success "已生成 .env 文件（使用默认配置）"
        print_warning "请手动编辑 .env 文件，填写以下配置："
        echo "  - PROXY_985_API_KEY"
        echo "  - PROXY_985_ZONE"
        echo "  - MAIL_USER / MAIL_PASSWORD"
        echo "  - TELEGRAM_BOT_TOKEN"
        echo "  - FRONTEND_URL"
        ;;
        
    2)
        print_info "使用交互配置模式..."
        
        # 复制模板
        cp .env.example .env
        
        echo ""
        print_info "=== 数据库配置 ==="
        read -p "数据库密码 (留空自动生成): " DB_PASSWORD
        if [ -z "$DB_PASSWORD" ]; then
            DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr '+/' '-_')
            print_success "已自动生成数据库密码"
        fi
        sed -i.bak "s|your_secure_database_password_here|${DB_PASSWORD}|g" .env
        
        echo ""
        print_info "=== JWT配置 ==="
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        print_success "已自动生成JWT密钥"
        sed -i.bak "s|your_super_secret_jwt_key_change_this_in_production_use_long_random_string|${JWT_SECRET}|g" .env
        
        echo ""
        print_info "=== 985Proxy配置 ==="
        read -p "985Proxy API Key: " PROXY_985_API_KEY
        sed -i.bak "s|your_985proxy_api_key_here|${PROXY_985_API_KEY}|g" .env
        
        read -p "985Proxy Zone: " PROXY_985_ZONE
        sed -i.bak "s|your_985proxy_zone_here|${PROXY_985_ZONE}|g" .env
        
        echo ""
        print_info "=== 邮件配置 ==="
        echo "选择邮件服务商："
        echo "  1) Gmail"
        echo "  2) Outlook"
        echo "  3) SendGrid"
        echo "  4) 跳过（稍后手动配置）"
        read -p "请选择 (1/2/3/4): " -n 1 -r MAIL_CHOICE
        echo ""
        
        case $MAIL_CHOICE in
            1)
                sed -i.bak "s|MAIL_HOST=.*|MAIL_HOST=smtp.gmail.com|g" .env
                sed -i.bak "s|MAIL_PORT=.*|MAIL_PORT=587|g" .env
                read -p "Gmail邮箱地址: " MAIL_USER
                sed -i.bak "s|your_email@gmail.com|${MAIL_USER}|g" .env
                read -s -p "Gmail应用专用密码: " MAIL_PASSWORD
                echo ""
                sed -i.bak "s|your_app_specific_password|${MAIL_PASSWORD}|g" .env
                ;;
            2)
                sed -i.bak "s|MAIL_HOST=.*|MAIL_HOST=smtp-mail.outlook.com|g" .env
                sed -i.bak "s|MAIL_PORT=.*|MAIL_PORT=587|g" .env
                read -p "Outlook邮箱地址: " MAIL_USER
                sed -i.bak "s|your_email@gmail.com|${MAIL_USER}|g" .env
                read -s -p "Outlook密码: " MAIL_PASSWORD
                echo ""
                sed -i.bak "s|your_app_specific_password|${MAIL_PASSWORD}|g" .env
                ;;
            3)
                sed -i.bak "s|MAIL_HOST=.*|MAIL_HOST=smtp.sendgrid.net|g" .env
                sed -i.bak "s|MAIL_PORT=.*|MAIL_PORT=587|g" .env
                sed -i.bak "s|your_email@gmail.com|apikey|g" .env
                read -s -p "SendGrid API Key: " MAIL_PASSWORD
                echo ""
                sed -i.bak "s|your_app_specific_password|${MAIL_PASSWORD}|g" .env
                ;;
            4)
                print_info "跳过邮件配置"
                ;;
        esac
        
        echo ""
        print_info "=== Telegram配置 ==="
        read -p "是否配置Telegram机器人？(y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Telegram Bot Token: " TELEGRAM_BOT_TOKEN
            sed -i.bak "s|your_telegram_bot_token_here|${TELEGRAM_BOT_TOKEN}|g" .env
            
            read -p "Telegram Bot Username: " TELEGRAM_BOT_USERNAME
            sed -i.bak "s|YourBot_Username|${TELEGRAM_BOT_USERNAME}|g" .env
        fi
        
        echo ""
        print_info "=== 前端域名配置 ==="
        read -p "前端URL (例如: https://example.com): " FRONTEND_URL
        sed -i.bak "s|https://your-domain.com|${FRONTEND_URL}|g" .env
        
        # 清理备份文件
        rm -f .env.bak
        
        print_success "✅ 配置完成！"
        ;;
        
    3)
        print_info "查找备份文件..."
        BACKUPS=($(ls -t .env.backup.* 2>/dev/null))
        
        if [ ${#BACKUPS[@]} -eq 0 ]; then
            print_error "未找到备份文件"
            exit 1
        fi
        
        echo "找到以下备份："
        for i in "${!BACKUPS[@]}"; do
            echo "  $((i+1))) ${BACKUPS[$i]}"
        done
        
        read -p "选择要恢复的备份 (1-${#BACKUPS[@]}): " -n 1 -r BACKUP_CHOICE
        echo ""
        
        if [ "$BACKUP_CHOICE" -ge 1 ] && [ "$BACKUP_CHOICE" -le "${#BACKUPS[@]}" ]; then
            cp "${BACKUPS[$((BACKUP_CHOICE-1))]}" .env
            print_success "已从 ${BACKUPS[$((BACKUP_CHOICE-1))]} 恢复配置"
        else
            print_error "无效的选择"
            exit 1
        fi
        ;;
        
    *)
        print_error "无效的选择"
        exit 1
        ;;
esac

echo ""
print_success "================================================"
print_success "  环境变量配置完成！"
print_success "================================================"
echo ""
print_info "下一步："
echo "  1. 检查 .env 文件，确认所有配置正确"
echo "  2. 运行 ./deploy.sh 开始部署"
echo ""
print_warning "注意：.env 文件包含敏感信息，请勿提交到Git仓库！"

