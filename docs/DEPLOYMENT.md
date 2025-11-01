# 🚀 ProxyHub 部署指南

## 📋 部署方式

### 1. Docker Compose 部署（推荐）

#### 开发环境部署
```bash
# 仅启动数据库服务
docker-compose -f docker-compose.dev.yml up -d

# 然后手动运行后端和前端
cd backend && npm run start:dev
cd frontend && npm run dev
```

#### 生产环境部署
```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置生产环境配置

# 2. 构建并启动所有服务
docker-compose up -d --build

# 3. 查看服务状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f
```

### 2. 手动部署

#### 后端部署
```bash
cd backend

# 安装依赖
npm ci --only=production

# 构建应用
npm run build

# 运行数据库迁移
npm run migration:run

# 启动应用
NODE_ENV=production node dist/main.js

# 或使用PM2
pm2 start dist/main.js --name proxyhub-backend
```

#### 前端部署
```bash
cd frontend

# 安装依赖
npm ci

# 构建应用
npm run build

# 使用Nginx托管dist目录
# 配置文件见 nginx.conf
```

## 🔒 生产环境配置清单

### 环境变量检查
- [ ] 修改 `JWT_SECRET` 为强密码
- [ ] 修改 `DATABASE_PASSWORD` 为强密码
- [ ] 配置 `PROXY_985_API_KEY`
- [ ] 设置 `NODE_ENV=production`
- [ ] 配置 `TELEGRAM_BOT_TOKEN`（可选）

### 安全设置
- [ ] 启用 HTTPS/SSL证书
- [ ] 配置防火墙规则
- [ ] 限制数据库访问IP
- [ ] 配置API限流
- [ ] 启用日志记录
- [ ] 配置自动备份

### 性能优化
- [ ] 启用Redis缓存
- [ ] 配置Nginx gzip压缩
- [ ] 设置静态资源CDN
- [ ] 优化数据库索引
- [ ] 配置连接池

## 🐳 Docker命令参考

### 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 启动特定服务
docker-compose up -d postgres redis

# 重新构建并启动
docker-compose up -d --build
```

### 查看状态
```bash
# 查看运行中的容器
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]

# 查看资源使用
docker stats
```

### 管理服务
```bash
# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器和数据卷（危险！）
docker-compose down -v

# 重启服务
docker-compose restart [service_name]
```

### 数据库操作
```bash
# 连接到PostgreSQL
docker-compose exec postgres psql -U postgres -d proxyhub

# 备份数据库
docker-compose exec postgres pg_dump -U postgres proxyhub > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres proxyhub < backup.sql

# 连接到Redis
docker-compose exec redis redis-cli
```

### 清理资源
```bash
# 清理未使用的镜像
docker image prune

# 清理未使用的容器
docker container prune

# 清理未使用的数据卷
docker volume prune

# 清理所有未使用的资源
docker system prune -a
```

## 🔍 健康检查

### 服务健康检查端点
```bash
# 后端健康检查
curl http://localhost:3000/api/v1/health

# 前端健康检查
curl http://localhost:80

# 数据库健康检查
docker-compose exec postgres pg_isready -U postgres

# Redis健康检查
docker-compose exec redis redis-cli ping
```

### 监控脚本
```bash
#!/bin/bash
# health-check.sh

echo "Checking services..."

# 检查后端
if curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is down"
    exit 1
fi

# 检查前端
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is down"
    exit 1
fi

# 检查数据库
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is down"
    exit 1
fi

# 检查Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis is down"
    exit 1
fi

echo "All services are healthy!"
```

## 📊 日志管理

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend

# 查看最近100行日志
docker-compose logs --tail=100 backend

# 查看特定时间的日志
docker-compose logs --since="2024-01-01T00:00:00" backend
```

### 日志轮转配置
在 `docker-compose.yml` 中添加：
```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🔐 SSL证书配置（Nginx）

### 使用Let's Encrypt
```bash
# 安装certbot
apt-get install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d yourdomain.com

# 自动续期
certbot renew --dry-run
```

### Nginx SSL配置
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 🔄 自动部署（CI/CD）

### GitHub Actions示例
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Copy files to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          source: "."
          target: "/var/www/proxyhub"
      
      - name: Deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/proxyhub
            docker-compose down
            docker-compose up -d --build
```

## 🆘 故障排查

### 常见问题

#### 1. 容器无法启动
```bash
# 查看详细错误
docker-compose logs [service_name]

# 检查配置
docker-compose config

# 强制重新创建
docker-compose up -d --force-recreate
```

#### 2. 数据库连接失败
```bash
# 检查数据库是否就绪
docker-compose exec postgres pg_isready

# 检查网络连接
docker network inspect proxyhub_proxyhub-network

# 重启数据库
docker-compose restart postgres
```

#### 3. 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000
netstat -tulpn | grep 3000

# 停止占用的进程或修改配置
```

#### 4. 磁盘空间不足
```bash
# 清理Docker资源
docker system prune -a --volumes

# 查看磁盘使用
df -h
docker system df
```

## 📞 技术支持

如需帮助，请：
1. 查看日志文件
2. 检查环境变量配置
3. 验证服务健康状态
4. 提交GitHub Issue

---

**祝您部署顺利！** 🚀

