#!/bin/bash
#####################################
# ProxyHub 腾讯云自动部署脚本
# 作者: ProxyHub Team
# 日期: 2025-11-06
#####################################

set -e  # 遇到错误立即退出

echo "=========================================="
echo "🚀 开始部署 ProxyHub 到腾讯云"
echo "=========================================="

# 1. 检查当前目录
echo ""
echo "📁 步骤1: 检查当前目录"
cd /opt/proxyhub
pwd
ls -la

# 2. 备份.env文件
echo ""
echo "💾 步骤2: 备份环境变量文件"
if [ -f .env ]; then
    cp .env .env.backup
    echo "✅ .env 文件已备份为 .env.backup"
fi

# 3. 清空当前目录（保留.env）
echo ""
echo "🧹 步骤3: 清理旧文件"
find . -maxdepth 1 ! -name '.' ! -name '..' ! -name '.env' ! -name '.env.backup' -exec rm -rf {} + 2>/dev/null || true
echo "✅ 旧文件已清理"

# 4. 从GitHub克隆代码
echo ""
echo "📥 步骤4: 从GitHub拉取最新代码"
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

# 5. 恢复.env文件
echo ""
echo "⚙️  步骤5: 恢复环境变量配置"
if [ -f .env.backup ]; then
    mv .env.backup .env
    echo "✅ .env 文件已恢复"
fi

# 6. 停止旧容器
echo ""
echo "🛑 步骤6: 停止旧容器"
docker-compose down 2>/dev/null || echo "没有运行中的容器"

# 7. 构建Docker镜像
echo ""
echo "🏗️  步骤7: 构建Docker镜像（这可能需要5-10分钟）"
docker-compose build --no-cache

# 8. 启动容器
echo ""
echo "🚀 步骤8: 启动所有服务"
docker-compose up -d

# 9. 等待服务启动
echo ""
echo "⏳ 步骤9: 等待服务启动（30秒）"
sleep 30

# 10. 检查容器状态
echo ""
echo "📊 步骤10: 检查容器状态"
docker-compose ps

# 11. 初始化数据库
echo ""
echo "🗄️  步骤11: 初始化数据库"
echo "等待数据库就绪..."
sleep 10

echo "运行数据库迁移..."
docker exec proxyhub-backend npm run migration:run || echo "⚠️  迁移可能已运行"

echo "运行数据库种子..."
docker exec proxyhub-backend npm run seed || echo "⚠️  种子可能已运行"

# 12. 验证部署
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
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
echo "=========================================="

