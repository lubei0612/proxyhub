#!/bin/bash

# ProxyHub 一键部署脚本

echo "========================================="
echo "     ProxyHub 生产环境部署脚本"
echo "========================================="
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 和 Docker Compose 已安装"
echo ""

# 检查环境变量文件
if [ ! -f ".env.production" ]; then
    echo "⚠️  未找到 .env.production 文件"
    echo "📋 正在从模板创建..."
    cp .env.template .env.production
    echo "✅ .env.production 已创建"
    echo ""
    echo "⚠️  请编辑 .env.production 文件，填入正确的配置："
    echo "   1. DATABASE_PASSWORD - 数据库密码"
    echo "   2. JWT_SECRET - JWT 密钥（至少32位）"
    echo "   3. JWT_REFRESH_SECRET - 刷新令牌密钥（至少32位）"
    echo "   4. VITE_API_URL - API 地址（您的域名或 IP）"
    echo ""
    echo "编辑完成后，再次运行此脚本"
    exit 0
fi

echo "✅ 环境变量文件已存在"
echo ""

# 停止现有容器
echo "🔧 停止现有容器..."
docker-compose -f docker-compose.prod.yml down

# 构建并启动服务
echo "🚀 构建并启动服务..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo ""
echo "📊 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

# 初始化数据库
echo ""
echo "🗄️  初始化数据库..."
docker exec proxyhub-backend npm run migration:run
docker exec proxyhub-backend npm run seed

echo ""
echo "========================================="
echo "     🎉 部署完成！"
echo "========================================="
echo ""
echo "📝 访问信息："
echo "   前端: http://localhost 或 http://您的服务器IP"
echo "   API:  http://localhost:3000"
echo ""
echo "🔑 默认登录信息："
echo "   管理员: admin@proxy.com / admin123456"
echo "   测试用户: test@test.com / test123456"
echo ""
echo "⚠️  重要提醒："
echo "   1. 请立即修改管理员密码"
echo "   2. 检查 .env.production 中的所有配置"
echo "   3. 配置防火墙和安全组"
echo "   4. 建议启用 HTTPS"
echo ""
echo "📖 完整部署指南: docs/腾讯云部署指南.md"
echo ""
echo "========================================="

