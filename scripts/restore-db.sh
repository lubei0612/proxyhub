#!/bin/bash

#############################################
# ProxyHub 数据库恢复脚本
#############################################

set -e

# 配置
DB_NAME="${DATABASE_NAME:-proxyhub}"
DB_USER="${DATABASE_USER:-postgres}"

# 检查参数
if [ -z "$1" ]; then
    echo "用法: $0 <备份文件路径>"
    echo "示例: $0 /var/backups/proxyhub/proxyhub_backup_20250112_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 错误: 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

echo "=========================================="
echo "  ProxyHub 数据库恢复"
echo "  时间: $(date)"
echo "=========================================="
echo ""
echo "⚠️  警告: 这将覆盖当前数据库！"
echo "备份文件: $BACKUP_FILE"
echo ""
read -p "确认继续？(yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "已取消恢复"
    exit 0
fi

echo ""
echo "正在停止应用服务..."
docker-compose stop backend frontend

echo "正在恢复数据库..."
gunzip < "$BACKUP_FILE" | docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ 恢复成功"
else
    echo "❌ 恢复失败"
    exit 1
fi

echo ""
echo "正在重启应用服务..."
docker-compose up -d backend frontend

echo ""
echo "=========================================="
echo "  恢复完成"
echo "=========================================="

