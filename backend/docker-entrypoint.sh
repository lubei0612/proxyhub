#!/bin/sh
set -e

echo "========================================="
echo "🚀 ProxyHub Backend 启动中..."
echo "========================================="

# 等待数据库就绪
echo "⏳ 等待数据库就绪..."
max_retries=30
retry_count=0

while [ $retry_count -lt $max_retries ]; do
  if wget --spider -q "http://${DATABASE_HOST}:${DATABASE_PORT}" 2>/dev/null || nc -z "${DATABASE_HOST}" "${DATABASE_PORT}" 2>/dev/null; then
    echo "✅ 数据库已就绪"
    break
  fi
  retry_count=$((retry_count + 1))
  echo "🔄 等待数据库... (${retry_count}/${max_retries})"
  sleep 2
done

if [ $retry_count -eq $max_retries ]; then
  echo "❌ 数据库连接超时"
  exit 1
fi

# 运行数据库初始化
echo ""
echo "📊 初始化数据库..."
if node /app/init-db.js; then
  echo "✅ 数据库初始化完成"
else
  echo "⚠️  数据库初始化失败，但继续启动应用..."
fi

# 启动应用
echo ""
echo "🎯 启动 NestJS 应用..."
exec node dist/src/main

