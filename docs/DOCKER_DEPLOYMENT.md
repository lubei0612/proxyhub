# 🐳 ProxyHub Docker部署指南

## 📋 目录
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [生产环境部署](#生产环境部署)
- [配置说明](#配置说明)
- [常见问题](#常见问题)
- [维护管理](#维护管理)

---

## 环境要求

### 服务器配置
- **CPU**: 2核心或以上
- **内存**: 4GB或以上
- **存储**: 20GB可用空间
- **系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### 软件要求
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.0+

### 安装Docker和Docker Compose

#### Ubuntu/Debian
```bash
# 更新软件包
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
sudo systemctl enable docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

#### CentOS/RHEL
```bash
# 安装Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/lubei0612/proxyhub.git
cd proxyhub
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp env.template .env

# 编辑环境变量（请务必修改所有敏感信息）
nano .env
```

**必须修改的配置**:
- `DATABASE_PASSWORD` - PostgreSQL密码
- `REDIS_PASSWORD` - Redis密码
- `JWT_SECRET` - JWT密钥（32字符以上）
- `PROXY_985_API_KEY` - 985Proxy API密钥
- `PROXY_985_ZONE` - 985Proxy Zone标识
- `SMTP_*` - 邮件服务配置（如需邮件功能）

### 3. 启动服务（开发环境）
```bash
docker-compose up -d
```

### 4. 查看服务状态
```bash
docker-compose ps
```

### 5. 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 6. 访问服务
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000
- **API文档**: http://localhost:3000/api/docs

---

## 生产环境部署

### 1. 使用生产配置
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 2. 配置Nginx反向代理
创建 `nginx/conf.d/proxyhub.conf`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket支持
    location /socket.io/ {
        proxy_pass http://backend:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3. SSL证书配置（Let's Encrypt）
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 4. 数据库初始化
```bash
# 进入backend容器
docker exec -it proxyhub-backend sh

# 运行数据库迁移
npm run typeorm:cli migration:run

# 创建管理员用户（如需要）
node scripts/seed-users.js
```

### 5. 设置定时备份
创建 `scripts/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/proxyhub"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份PostgreSQL数据库
docker exec proxyhub-postgres pg_dump -U postgres proxyhub | gzip > $BACKUP_DIR/proxyhub_$TIMESTAMP.sql.gz

# 保留最近7天的备份
find $BACKUP_DIR -name "proxyhub_*.sql.gz" -mtime +7 -delete

echo "Backup completed: proxyhub_$TIMESTAMP.sql.gz"
```

添加到crontab:
```bash
# 每天凌晨2点备份
0 2 * * * /path/to/scripts/backup.sh
```

---

## 配置说明

### docker-compose.prod.yml 说明

```yaml
services:
  postgres:
    # PostgreSQL数据库
    # 端口: 5432
    # 数据卷: postgres_data
    
  redis:
    # Redis缓存
    # 端口: 6379
    # 数据卷: redis_data
    
  backend:
    # NestJS后端服务
    # 端口: 3000
    # 依赖: postgres, redis
    
  frontend:
    # Vue3前端服务
    # 端口: 80, 443
    # 依赖: backend
```

### 环境变量详解

| 变量名 | 说明 | 示例 | 必需 |
|--------|------|------|------|
| `DATABASE_PASSWORD` | PostgreSQL密码 | `strong_password_123` | ✅ |
| `REDIS_PASSWORD` | Redis密码 | `redis_pass_456` | ✅ |
| `JWT_SECRET` | JWT签名密钥 | `32+字符随机字符串` | ✅ |
| `PROXY_985_API_KEY` | 985Proxy API密钥 | `your_api_key` | ✅ |
| `PROXY_985_ZONE` | 985Proxy Zone ID | `your_zone_id` | ✅ |
| `SMTP_HOST` | 邮件服务器地址 | `smtp.gmail.com` | ❌ |
| `SMTP_PORT` | 邮件服务器端口 | `587` | ❌ |
| `SMTP_USER` | 邮件用户名 | `user@gmail.com` | ❌ |
| `SMTP_PASS` | 邮件密码/应用密码 | `app_password` | ❌ |

---

## 常见问题

### 1. 容器启动失败
```bash
# 查看详细日志
docker-compose logs backend

# 常见原因：
# - 环境变量配置错误
# - 端口被占用
# - 数据库连接失败
```

### 2. 数据库连接错误
```bash
# 检查PostgreSQL状态
docker exec -it proxyhub-postgres psql -U postgres -c "SELECT version();"

# 检查数据库是否存在
docker exec -it proxyhub-postgres psql -U postgres -l
```

### 3. 前端无法连接后端
```bash
# 检查backend容器是否运行
docker ps | grep proxyhub-backend

# 检查网络连接
docker network inspect proxyhub-network

# 检查API基础URL配置
echo $VITE_API_BASE_URL
```

### 4. 清理所有容器和数据
```bash
# ⚠️ 警告：此操作将删除所有数据
docker-compose down -v
docker system prune -a
```

---

## 维护管理

### 查看服务状态
```bash
docker-compose ps
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 更新服务
```bash
# 1. 拉取最新代码
git pull origin master

# 2. 重新构建并启动
docker-compose build --no-cache
docker-compose up -d
```

### 查看资源使用
```bash
docker stats
```

### 进入容器
```bash
# 进入backend容器
docker exec -it proxyhub-backend sh

# 进入postgres容器
docker exec -it proxyhub-postgres bash
```

### 数据恢复
```bash
# 从备份恢复
gunzip < /var/backups/proxyhub/proxyhub_TIMESTAMP.sql.gz | docker exec -i proxyhub-postgres psql -U postgres proxyhub
```

---

## 性能优化

### 1. PostgreSQL调优
编辑 `docker-compose.prod.yml`:
```yaml
services:
  postgres:
    command:
      - "postgres"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "effective_cache_size=1GB"
      - "-c"
      - "maintenance_work_mem=64MB"
      - "-c"
      - "checkpoint_completion_target=0.9"
      - "-c"
      - "wal_buffers=16MB"
      - "-c"
      - "default_statistics_target=100"
      - "-c"
      - "random_page_cost=1.1"
      - "-c"
      - "effective_io_concurrency=200"
      - "-c"
      - "work_mem=4MB"
      - "-c"
      - "min_wal_size=1GB"
      - "-c"
      - "max_wal_size=4GB"
```

### 2. Redis调优
```yaml
services:
  redis:
    command:
      - "redis-server"
      - "--maxmemory"
      - "256mb"
      - "--maxmemory-policy"
      - "allkeys-lru"
      - "--appendonly"
      - "yes"
```

### 3. Nginx调优
```nginx
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;

# 启用缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
```

---

## 监控和日志

### 1. 日志管理
```bash
# 实时查看日志
docker-compose logs -f

# 查看最近100行日志
docker-compose logs --tail=100

# 导出日志到文件
docker-compose logs > proxyhub.log 2>&1
```

### 2. 健康检查
```bash
# Backend健康检查
curl http://localhost:3000/health

# PostgreSQL健康检查
docker exec proxyhub-postgres pg_isready -U postgres

# Redis健康检查
docker exec proxyhub-redis redis-cli ping
```

### 3. 监控工具集成（可选）
- **Prometheus + Grafana**: 指标监控
- **ELK Stack**: 日志聚合分析
- **Sentry**: 错误追踪

---

## 安全建议

1. ✅ **使用强密码**: 数据库、Redis、JWT密钥
2. ✅ **启用HTTPS**: Let's Encrypt免费证书
3. ✅ **定期备份**: 自动化备份脚本
4. ✅ **最小权限**: 数据库用户权限最小化
5. ✅ **防火墙**: 只开放80/443端口
6. ✅ **更新**: 定期更新Docker镜像和系统
7. ✅ **日志审计**: 保留重要操作日志
8. ✅ **监控告警**: 异常情况及时通知

---

## 联系支持

- **GitHub Issues**: https://github.com/lubei0612/proxyhub/issues
- **文档**: https://github.com/lubei0612/proxyhub/wiki
- **Email**: support@proxyhub.com

---

**祝您部署顺利！** 🚀

