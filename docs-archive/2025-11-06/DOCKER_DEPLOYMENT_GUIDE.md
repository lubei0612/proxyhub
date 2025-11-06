# 🐳 ProxyHub Docker 部署指南

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB RAM
- 10GB 可用磁盘空间

## 🚀 快速启动

### 1. 配置环境变量

复制并编辑环境变量文件：

```bash
cp .env.example .env
```

**重要配置项：**

```env
# 985Proxy 配置 (必须)
PROXY_985_API_KEY=your_985proxy_api_key_here
PROXY_985_ZONE=your_zone_id_here
PROXY_985_TEST_MODE=false  # 生产环境设为 false

# 数据库配置
DATABASE_NAME=proxyhub
DATABASE_USER=postgres
DATABASE_PASSWORD=change-this-strong-password

# JWT 安全
JWT_SECRET=change-this-to-a-very-long-random-string-in-production

# 邮件服务 (用于验证码)
MAIL_HOST=smtp.outlook.com
MAIL_PORT=587
MAIL_USER=your-outlook@outlook.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=ProxyHub <noreply@proxyhub.com>

# 备用邮箱 (Gmail)
MAIL_HOST_BACKUP=smtp.gmail.com
MAIL_PORT_BACKUP=587
MAIL_USER_BACKUP=your-gmail@gmail.com
MAIL_PASSWORD_BACKUP=your-gmail-app-password

# Telegram Bot (可选)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=YourBotUsername
```

### 2. 启动所有服务

```bash
# 构建并启动所有容器
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. 初始化数据库

```bash
# 进入后端容器
docker-compose exec backend sh

# 运行数据库迁移
npm run migration:run

# 退出容器
exit
```

### 4. 访问服务

- **前端**: http://localhost
- **后端API**: http://localhost:3000/api/v1
- **API文档**: http://localhost:3000/api/v1/docs

## 🔧 管理命令

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
docker-compose restart frontend
```

### 停止服务

```bash
# 停止所有服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器 + 数据卷 (危险！会删除数据)
docker-compose down -v
```

### 更新代码

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 📊 健康检查

### 检查容器健康状态

```bash
docker-compose ps
```

所有服务应显示 `healthy` 状态。

### 手动测试健康端点

```bash
# 测试后端
curl http://localhost:3000/api/v1/health

# 测试前端
curl http://localhost
```

## 🔍 故障排查

### 后端启动失败

1. 检查日志：
```bash
docker-compose logs backend
```

2. 确认数据库已启动：
```bash
docker-compose ps postgres
```

3. 检查环境变量：
```bash
docker-compose exec backend env | grep DATABASE
```

### 985Proxy API 错误

1. 验证Zone ID：
```bash
docker-compose exec backend sh -c 'echo $PROXY_985_ZONE'
```

2. 检查Test Mode：
```bash
docker-compose exec backend sh -c 'echo $PROXY_985_TEST_MODE'
```

3. 查看985Proxy相关日志：
```bash
docker-compose logs backend | grep "985Proxy"
```

### 数据库连接问题

```bash
# 进入postgres容器
docker-compose exec postgres psql -U postgres -d proxyhub

# 查看数据库列表
\l

# 退出
\q
```

## 🛡️ 生产环境安全建议

1. **修改所有默认密码**：
   - DATABASE_PASSWORD
   - JWT_SECRET
   - Redis密码（需要修改docker-compose.yml）

2. **使用HTTPS**：
   - 配置Nginx SSL证书
   - 使用Let's Encrypt自动证书

3. **限制端口暴露**：
   - 不要暴露PostgreSQL和Redis端口到公网
   - 只暴露80和443端口

4. **定期备份**：
   ```bash
   # 备份数据库
   docker-compose exec postgres pg_dump -U postgres proxyhub > backup_$(date +%Y%m%d).sql
   
   # 恢复数据库
   docker-compose exec -T postgres psql -U postgres proxyhub < backup_20250106.sql
   ```

5. **监控和日志**：
   - 设置日志轮转
   - 使用日志聚合工具（如ELK）
   - 配置告警通知

## 📈 性能优化

### 数据库优化

在 `docker-compose.yml` 中为PostgreSQL添加：

```yaml
environment:
  POSTGRES_MAX_CONNECTIONS: 100
  POSTGRES_SHARED_BUFFERS: 256MB
  POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
```

### Redis持久化

已配置AOF持久化（appendonly yes），数据会自动保存。

### 资源限制

添加资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## 🌐 反向代理配置 (Nginx)

如果使用外部Nginx作为反向代理：

```nginx
upstream proxyhub_backend {
    server localhost:3000;
}

upstream proxyhub_frontend {
    server localhost:80;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 前端
    location / {
        proxy_pass http://proxyhub_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 后端API
    location /api/ {
        proxy_pass http://proxyhub_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📝 环境变量完整列表

查看 `backend/.env.example` 和 `docs/ENV_TEMPLATE.txt` 获取完整的环境变量列表。

## 🆘 获取帮助

- 查看项目文档：`docs/` 目录
- 查看API文档：http://localhost:3000/api/v1/docs
- 查看日志：`docker-compose logs -f`

---

**提示**：首次部署建议先设置 `PROXY_985_TEST_MODE=true` 进行测试，确认功能正常后再切换到生产模式。

