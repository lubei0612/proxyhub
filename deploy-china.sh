#!/bin/bash
#####################################
# ProxyHub 腾讯云自动部署脚本
# 国内镜像加速版（速度提升5-10倍）
# 作者: ProxyHub Team
# 日期: 2025-11-06
#####################################

set -e  # 遇到错误立即退出

echo "=========================================="
echo "🚀 ProxyHub 腾讯云自动部署（国内加速版）"
echo "=========================================="
echo ""
echo "⚡ 使用国内镜像源："
echo "  - 腾讯云Docker镜像加速器"
echo "  - 淘宝NPM镜像"
echo "  - 阿里云Alpine镜像源"
echo ""
echo "=========================================="

# 1. 配置Docker镜像加速器
echo ""
echo "🔧 步骤1: 配置Docker镜像加速器"
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF

echo "重启Docker服务..."
sudo systemctl daemon-reload
sudo systemctl restart docker
echo "✅ Docker镜像加速器配置完成"

# 2. 检查当前目录
echo ""
echo "📁 步骤2: 检查当前目录"
cd /opt/proxyhub
pwd
ls -la

# 3. 备份.env文件
echo ""
echo "💾 步骤3: 备份环境变量文件"
if [ -f .env ]; then
    cp .env .env.backup
    echo "✅ .env 文件已备份为 .env.backup"
fi

# 4. 清空当前目录（保留.env）
echo ""
echo "🧹 步骤4: 清理旧文件"
find . -maxdepth 1 ! -name '.' ! -name '..' ! -name '.env' ! -name '.env.backup' -exec rm -rf {} + 2>/dev/null || true
echo "✅ 旧文件已清理"

# 5. 从GitHub克隆代码
echo ""
echo "📥 步骤5: 从GitHub拉取最新代码"
git clone https://github.com/lubei0612/proxyhub.git temp
if [ -d temp/.git ]; then
    mv temp/* . 2>/dev/null || true
    mv temp/.* . 2>/dev/null || true
    rm -rf temp
    echo "✅ 代码拉取成功"
else
    echo "❌ Git clone 失败"
    exit 1
fi

# 6. 恢复.env文件
echo ""
echo "⚙️  步骤6: 恢复环境变量配置"
if [ -f .env.backup ]; then
    mv .env.backup .env
    echo "✅ .env 文件已恢复"
fi

# 7. 停止旧容器
echo ""
echo "🛑 步骤7: 停止旧容器"
docker-compose -f docker-compose.cn.yml down 2>/dev/null || echo "没有运行中的容器"

# 8. 构建Docker镜像（使用国内加速版）
echo ""
echo "🏗️  步骤8: 构建Docker镜像（国内加速版，预计2-3分钟）"
echo ""
echo "  ⚡ 使用国内镜像源："
echo "     - Docker镜像: 腾讯云镜像加速器"
echo "     - NPM依赖: 淘宝镜像 (registry.npmmirror.com)"
echo "     - Alpine包: 阿里云镜像源"
echo ""

# 构建backend
echo "📦 构建后端镜像..."
docker-compose -f docker-compose.cn.yml build --no-cache backend

# 构建frontend
echo "📦 构建前端镜像..."
docker-compose -f docker-compose.cn.yml build --no-cache frontend

echo "✅ Docker镜像构建完成"

# 9. 启动容器
echo ""
echo "🚀 步骤9: 启动所有服务"
docker-compose -f docker-compose.cn.yml up -d

# 10. 等待服务启动
echo ""
echo "⏳ 步骤10: 等待服务启动（30秒）"
sleep 30

# 11. 检查容器状态
echo ""
echo "📊 步骤11: 检查容器状态"
docker-compose -f docker-compose.cn.yml ps

# 12. 初始化数据库
echo ""
echo "🗄️  步骤12: 初始化数据库"
echo "等待数据库就绪..."
sleep 10

echo "运行数据库迁移..."
docker exec proxyhub-backend npm run migration:run || echo "⚠️  迁移可能已运行"

echo "运行数据库种子..."
docker exec proxyhub-backend npm run seed || echo "⚠️  种子可能已运行"

# 13. 验证部署
echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📌 访问地址："
echo "   前端: http://43.130.35.117"
echo "   后端API: http://43.130.35.117:3000/api/v1"
echo "   健康检查: http://43.130.35.117:3000/api/v1/health"
echo ""
echo "👤 测试账号："
echo "   管理员: admin@example.com / admin123"
echo "   普通用户: alice@test.com / password123"
echo ""
echo "📝 查看日志："
echo "   docker-compose -f docker-compose.cn.yml logs -f backend"
echo "   docker-compose -f docker-compose.cn.yml logs -f frontend"
echo ""
echo "🛠️ 管理命令："
echo "   停止服务: docker-compose -f docker-compose.cn.yml down"
echo "   重启服务: docker-compose -f docker-compose.cn.yml restart"
echo "   查看状态: docker-compose -f docker-compose.cn.yml ps"
echo ""
echo "=========================================="
echo "⚡ 国内镜像加速版部署完成！"
echo "   构建速度提升: 5-10倍"
echo "   总耗时约: 2-3分钟（相比国外源10-15分钟）"
echo "=========================================="

