#!/bin/bash

# ProxyHub 日志问题快速修复脚本
# 用于自动检测和修复日志中发现的常见问题

set -e

echo "========================================"
echo "  ProxyHub 日志问题修复脚本"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo "步骤 1/5: 检查环境变量配置..."
echo "----------------------------------------"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ 未找到 .env 文件${NC}"
    if [ -f "env.example" ]; then
        echo "是否从 env.example 创建 .env 文件? (y/n)"
        read -r response
        if [ "$response" = "y" ]; then
            cp env.example .env
            echo -e "${GREEN}✓ 已创建 .env 文件${NC}"
            echo -e "${YELLOW}请编辑 .env 文件并填入正确的配置值${NC}"
            exit 0
        fi
    fi
    exit 1
fi

# 检查关键环境变量
source .env

MISSING_VARS=()

if [ -z "$PROXY_985_API_KEY" ]; then
    MISSING_VARS+=("PROXY_985_API_KEY")
fi

if [ -z "$JWT_SECRET" ]; then
    MISSING_VARS+=("JWT_SECRET")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}✗ 缺少必需的环境变量:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "请编辑 .env 文件并填入这些值，然后重新运行此脚本"
    exit 1
else
    echo -e "${GREEN}✓ 环境变量配置检查通过${NC}"
fi

echo ""
echo "步骤 2/5: 检查Docker服务状态..."
echo "----------------------------------------"

if docker-compose ps | grep -q "proxyhub-backend"; then
    echo -e "${GREEN}✓ 后端服务正在运行${NC}"
else
    echo -e "${YELLOW}⚠ 后端服务未运行${NC}"
fi

echo ""
echo "步骤 3/5: 重新构建后端服务..."
echo "----------------------------------------"
echo "这将包含健康检查端点的修复..."

docker-compose build backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 后端服务构建成功${NC}"
else
    echo -e "${RED}✗ 后端服务构建失败${NC}"
    exit 1
fi

echo ""
echo "步骤 4/5: 重启服务..."
echo "----------------------------------------"

docker-compose down
docker-compose up -d

echo "等待服务启动..."
sleep 10

echo ""
echo "步骤 5/5: 验证修复..."
echo "----------------------------------------"

# 检查健康检查端点
echo "测试健康检查端点..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✓ 健康检查端点正常 (HTTP 200)${NC}"
else
    echo -e "${YELLOW}⚠ 健康检查端点返回: HTTP $HEALTH_CHECK${NC}"
    echo "  提示: 等待几秒钟后服务可能会正常"
fi

# 检查容器健康状态
echo ""
echo "检查容器状态..."
docker-compose ps

echo ""
echo "========================================"
echo -e "${GREEN}修复完成！${NC}"
echo "========================================"
echo ""
echo "后续操作:"
echo "1. 查看日志确认问题已解决:"
echo "   docker logs -f proxyhub-backend --tail 100"
echo ""
echo "2. 访问API文档确认服务正常:"
echo "   http://localhost:3000/api"
echo ""
echo "3. 测试健康检查端点:"
echo "   curl http://localhost:3000/api/v1/health"
echo ""
