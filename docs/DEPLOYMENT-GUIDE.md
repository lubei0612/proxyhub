# ProxyHub - 部署指南

## 📋 系统要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB RAM
- 至少 10GB 磁盘空间

## 🚀 快速开始

### 1️⃣ 环境配置

复制环境变量模板：

```bash
cp env.template .env
```

编辑 `.env` 文件，配置以下关键参数：

```env
# 985Proxy API配置（必填）
PROXY_985_TOKEN=your_api_token_here
PROXY_985_ZONE=your_zone_here

# 数据库配置
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=proxyhub

# JWT密钥（建议修改）
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# 邮件配置（可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_email_password
```

### 2️⃣ 启动服务

```bash
# 构建并启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f

# 检查服务状态
docker compose ps
```

### 3️⃣ 访问应用

- **前端**: http://localhost
- **后端API**: http://localhost:3000
- **管理后台**: http://localhost/admin/dashboard

### 4️⃣ 默认管理员账号

```
邮箱: admin@proxyhub.com
密码: admin123
```

**⚠️ 重要：首次登录后请立即修改密码！**

## 📁 项目结构

```
proxyhub/
├── backend/           # NestJS后端
│   ├── src/          # 源代码
│   ├── scripts/      # 数据库脚本
│   └── Dockerfile    # Docker配置
├── frontend/         # Vue 3前端
│   ├── src/          # 源代码
│   └── Dockerfile    # Docker配置
├── docs/             # 文档
├── docker-compose.yml
└── .env.template     # 环境变量模板
```

## 🔧 常用命令

### Docker管理

```bash
# 停止所有服务
docker compose down

# 重启服务
docker compose restart

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend

# 重新构建并启动
docker compose up -d --build
```

### 数据库管理

```bash
# 连接数据库
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub

# 备份数据库
docker exec proxyhub-postgres pg_dump -U postgres proxyhub > backup.sql

# 恢复数据库
cat backup.sql | docker exec -i proxyhub-postgres psql -U postgres -d proxyhub
```

## 🌐 生产环境部署

### 使用Docker Compose生产配置

```bash
# 使用生产配置文件
docker compose -f docker-compose.prod.yml up -d
```

### 环境变量配置

生产环境需要额外配置：

```env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

### Nginx配置（可选）

如果使用外部Nginx作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔒 安全建议

1. **修改默认密码**：首次登录后立即修改管理员密码
2. **使用HTTPS**：生产环境必须使用SSL证书
3. **防火墙配置**：仅开放必要端口（80, 443）
4. **定期备份**：设置自动数据库备份
5. **更新JWT密钥**：使用强随机密钥
6. **限制访问**：配置IP白名单（如需要）

## 📊 监控

### 查看应用健康状态

```bash
# 检查容器状态
docker compose ps

# 检查资源使用
docker stats

# 查看后端健康检查
curl http://localhost:3000/health
```

## 🐛 故障排查

### 前端无法访问

```bash
# 检查前端容器日志
docker compose logs frontend

# 重启前端
docker compose restart frontend
```

### 后端API错误

```bash
# 检查后端日志
docker compose logs backend

# 检查环境变量
docker compose exec backend env | grep PROXY_985
```

### 数据库连接失败

```bash
# 检查数据库状态
docker compose ps postgres

# 测试数据库连接
docker exec proxyhub-postgres pg_isready -U postgres
```

## 📞 技术支持

- **问题反馈**: 提交GitHub Issue
- **文档**: 查看 `/docs` 目录
- **更新日志**: 查看Git提交历史

## 📝 版本信息

- **当前版本**: v1.0.0
- **发布日期**: 2025-11-10
- **Node.js**: 20+
- **PostgreSQL**: 14+
- **Redis**: 7+

