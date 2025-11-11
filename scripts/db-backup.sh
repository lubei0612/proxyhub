#!/bin/bash

#############################################
# ProxyHub 数据库自动备份脚本
#############################################

set -e

# 配置
BACKUP_DIR="/var/backups/proxyhub"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DATABASE_NAME:-proxyhub}"
DB_USER="${DATABASE_USER:-postgres}"
DB_HOST="${DATABASE_HOST:-postgres}"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份文件名
BACKUP_FILE="$BACKUP_DIR/proxyhub_backup_$DATE.sql.gz"

echo "=========================================="
echo "  ProxyHub 数据库备份"
echo "  时间: $(date)"
echo "=========================================="

# 执行备份
echo "正在备份数据库: $DB_NAME"
docker-compose exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ 备份成功: $BACKUP_FILE"
    echo "文件大小: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ 备份失败"
    exit 1
fi

# 删除旧备份
echo "清理 $RETENTION_DAYS 天前的旧备份..."
find "$BACKUP_DIR" -name "proxyhub_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# 列出当前所有备份
echo ""
echo "当前备份列表:"
ls -lh "$BACKUP_DIR"

echo ""
echo "=========================================="
echo "  备份完成"
echo "=========================================="

