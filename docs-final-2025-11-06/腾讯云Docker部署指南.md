# ProxyHub 腾讯云 Docker 部署指南

**部署日期**: 2025-11-06  
**目标环境**: 腾讯云 CVM (云服务器)  
**部署方式**: Docker + Docker Compose

---

## 📋 前置准备

### 1. 腾讯云服务器配置要求

**推荐配置**:
- CPU: 2核或以上
- 内存: 4GB或以上
- 硬盘: 50GB或以上
- 操作系统: Ubuntu 20.04 LTS 或 Ubuntu 22.04 LTS
- 网络: 分配公网IP，开放端口 80、443、3000、8080

**最低配置**:
- CPU: 1核
- 内存: 2GB
- 硬盘: 20GB
- 操作系统: Ubuntu 20.04 LTS

### 2. 域名准备（可选但推荐）

- 已备案的域名
- DNS解析指向服务器公网IP
- 示例: `proxyhub.yourdomain.com`

---

## 🚀 部署步骤

### 步骤 1: 连接到腾讯云服务器

**使用SSH连接**:
```bash
# Windows用户使用PowerShell或PuTTY
ssh root@your-server-ip

# 或使用腾讯云控制台的在线终端
```

**首次登录后，更新系统**:
```bash
apt update && apt upgrade -y
```

---

### 步骤 2: 安装 Docker 和 Docker Compose

**安装Docker**:
```bash
# 安装Docker官方GPG密钥
apt install -y ca-certificates curl gnupg lsb-release
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加Docker仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker Engine
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

**启动Docker服务**:
```bash
systemctl start docker
systemctl enable docker
systemctl status docker
```

---

### 步骤 3: 安装 Git 并克隆项目

```bash
# 安装Git
apt install -y git

# 创建项目目录
mkdir -p /opt/proxyhub
cd /opt/proxyhub

# 如果你有Git仓库，克隆项目
# git clone https://github.com/your-username/proxyhub.git .

# 如果没有Git仓库，需要手动上传项目文件
# 我们将在下一步说明如何上传
```

---

### 步骤 4: 上传项目文件到服务器

**方法1: 使用 SCP（推荐）**

在**本地Windows电脑**的PowerShell中运行：

```powershell
# 切换到项目目录
cd D:\Users\Desktop\proxyhub

# 打包项目（排除node_modules）
tar --exclude='node_modules' --exclude='.git' --exclude='dist' -czf proxyhub.tar.gz .

# 上传到服务器
scp proxyhub.tar.gz root@your-server-ip:/opt/proxyhub/

# 登录服务器后解压
# ssh root@your-server-ip
# cd /opt/proxyhub
# tar -xzf proxyhub.tar.gz
# rm proxyhub.tar.gz
```

**方法2: 使用 WinSCP（图形界面，推荐新手）**

1. 下载并安装 WinSCP: https://winscp.net/
2. 连接到服务器（输入IP、用户名root、密码）
3. 将本地 `D:\Users\Desktop\proxyhub` 整个文件夹拖到 `/opt/proxyhub`

**方法3: 使用 Git（如果你已推送到GitHub）**

```bash
cd /opt/proxyhub
git clone https://github.com/your-username/proxyhub.git .
```

---

### 步骤 5: 配置环境变量

**创建生产环境配置文件**:

```bash
cd /opt/proxyhub

# 创建后端环境变量
cat > backend/.env.production << 'EOF'
# 数据库配置
DB_HOST=db
DB_PORT=5432
DB_USERNAME=proxyhub
DB_PASSWORD=your_secure_db_password_here
DB_DATABASE=proxyhub

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password_here

# JWT配置
JWT_SECRET=your_very_long_and_secure_jwt_secret_here_minimum_32_characters
JWT_EXPIRES_IN=7200

# 985Proxy API配置
PROXY985_API_KEY=your_985proxy_api_key_here
PROXY985_API_SECRET=your_985proxy_api_secret_here
PROXY985_API_BASE_URL=https://api.985proxy.com

# Telegram Bot配置（可选）
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# SMTP邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=ProxyHub <your-email@gmail.com>

# 应用配置
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://your-server-ip:8080
EOF

# 创建前端环境变量
cat > frontend/.env.production << 'EOF'
VITE_API_BASE_URL=http://your-server-ip:3000/api/v1
VITE_APP_TITLE=ProxyHub
EOF
```

**⚠️ 重要：请替换以下占位符**:
- `your_secure_db_password_here`: 数据库密码（推荐16位以上随机字符）
- `your_secure_redis_password_here`: Redis密码
- `your_very_long_and_secure_jwt_secret_here_minimum_32_characters`: JWT密钥（32位以上）
- `your_985proxy_api_key_here`: 你的985Proxy API Key
- `your_985proxy_api_secret_here`: 你的985Proxy API Secret
- `your-server-ip`: 你的服务器公网IP

**生成安全密钥的命令**:
```bash
# 生成数据库密码
openssl rand -base64 24

# 生成Redis密码
openssl rand -base64 24

# 生成JWT密钥
openssl rand -base64 48
```

---

### 步骤 6: 修改 Docker Compose 配置

**编辑 docker-compose.yml**:

```bash
cd /opt/proxyhub
nano docker-compose.yml
```

**确保配置正确**（应该已经存在，只需确认）:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: proxyhub-db
    environment:
      POSTGRES_USER: proxyhub
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: proxyhub
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U proxyhub"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: proxyhub-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: proxyhub-backend
    env_file:
      - ./backend/.env.production
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: http://your-server-ip:3000/api/v1
    container_name: proxyhub-frontend
    ports:
      - "8080:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

**保存并退出**：按 `Ctrl+X`，然后按 `Y`，最后按 `Enter`

---

### 步骤 7: 构建和启动容器

```bash
cd /opt/proxyhub

# 构建镜像（首次构建需要10-20分钟）
docker compose build

# 启动所有服务
docker compose up -d

# 查看容器状态
docker compose ps

# 查看日志（确保服务正常启动）
docker compose logs -f
```

**期望输出**:
```
NAME                   IMAGE                  STATUS
proxyhub-backend       proxyhub-backend       Up 30 seconds (healthy)
proxyhub-db            postgres:15-alpine     Up 1 minute (healthy)
proxyhub-frontend      proxyhub-frontend      Up 30 seconds
proxyhub-redis         redis:7-alpine         Up 1 minute (healthy)
```

---

### 步骤 8: 初始化数据库

**运行数据库迁移和种子数据**:

```bash
cd /opt/proxyhub

# 进入后端容器
docker compose exec backend sh

# 在容器内运行
npm run migration:run
npm run seed

# 退出容器
exit
```

**验证种子数据创建成功**，你应该看到：
```
✅ 管理员用户创建成功：admin@example.com / admin123（余额：$10000）
✅ 测试用户创建成功：user@example.com / password123（余额：$1000）
✅ 价格配置创建成功
```

---

### 步骤 9: 配置防火墙和安全组

**腾讯云控制台配置**:

1. 登录腾讯云控制台
2. 进入 **云服务器** > **安全组**
3. 添加以下入站规则：

| 协议 | 端口 | 来源 | 说明 |
|------|------|------|------|
| TCP | 22 | 0.0.0.0/0 | SSH |
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS |
| TCP | 3000 | 0.0.0.0/0 | Backend API |
| TCP | 8080 | 0.0.0.0/0 | Frontend |

**服务器防火墙配置**（Ubuntu UFW）:

```bash
# 启用防火墙
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 8080/tcp
ufw enable

# 查看状态
ufw status
```

---

### 步骤 10: 访问应用

**前端访问**:
```
http://your-server-ip:8080
```

**后端API访问**:
```
http://your-server-ip:3000/api/v1
```

**测试账号**:
- 管理员: `admin@example.com` / `admin123`
- 测试用户: `alice@test.com` / `password123`

---

## 🔧 常用管理命令

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 只看后端日志
docker compose logs -f backend

# 只看前端日志
docker compose logs -f frontend

# 只看数据库日志
docker compose logs -f db
```

### 重启服务

```bash
# 重启所有服务
docker compose restart

# 只重启后端
docker compose restart backend

# 只重启前端
docker compose restart frontend
```

### 停止和启动

```bash
# 停止所有服务
docker compose stop

# 启动所有服务
docker compose start

# 完全停止并删除容器（数据保留在卷中）
docker compose down

# 停止并删除所有（包括数据卷）⚠️ 危险操作
docker compose down -v
```

### 更新代码

```bash
cd /opt/proxyhub

# 拉取最新代码（如果使用Git）
git pull

# 重新构建并启动
docker compose down
docker compose build
docker compose up -d
```

### 备份数据库

```bash
# 导出数据库
docker compose exec db pg_dump -U proxyhub proxyhub > backup-$(date +%Y%m%d).sql

# 恢复数据库
docker compose exec -T db psql -U proxyhub proxyhub < backup-20251106.sql
```

---

## 🌐 配置域名和HTTPS（可选但推荐）

### 安装 Nginx 反向代理

```bash
# 在宿主机安装Nginx
apt install -y nginx certbot python3-certbot-nginx

# 创建Nginx配置
nano /etc/nginx/sites-available/proxyhub
```

**Nginx配置文件**:

```nginx
server {
    listen 80;
    server_name proxyhub.yourdomain.com;

    # 前端
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**启用配置**:

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/proxyhub /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启Nginx
systemctl restart nginx
```

### 配置SSL证书（Let's Encrypt）

```bash
# 自动申请并配置SSL
certbot --nginx -d proxyhub.yourdomain.com

# 设置自动续期
certbot renew --dry-run
```

**配置完成后，访问**:
```
https://proxyhub.yourdomain.com
```

---

## 🔍 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker compose logs backend

# 检查容器状态
docker compose ps

# 检查端口占用
netstat -tlnp | grep 3000
netstat -tlnp | grep 8080
```

### 数据库连接失败

```bash
# 检查数据库是否健康
docker compose exec db pg_isready -U proxyhub

# 测试数据库连接
docker compose exec db psql -U proxyhub -d proxyhub -c "SELECT version();"
```

### 前端无法访问后端

1. 检查 `frontend/.env.production` 中的 `VITE_API_BASE_URL` 是否正确
2. 重新构建前端：`docker compose build frontend && docker compose up -d frontend`

### 985Proxy API连接失败

1. 检查 `backend/.env.production` 中的API密钥是否正确
2. 查看后端日志：`docker compose logs backend | grep 985`

---

## 📊 性能优化建议

### 1. 使用生产模式构建

确保环境变量中 `NODE_ENV=production`

### 2. 启用 Gzip 压缩

Nginx已默认启用

### 3. 配置数据库连接池

在 `backend/.env.production` 中添加：
```
DB_POOL_SIZE=10
```

### 4. 配置Redis持久化

```bash
docker compose exec redis redis-cli
> CONFIG SET appendonly yes
> CONFIG SET save "900 1 300 10 60 10000"
> exit
```

---

## 🔐 安全建议

1. ✅ 定期更新系统和Docker
2. ✅ 使用强密码
3. ✅ 启用防火墙
4. ✅ 配置HTTPS
5. ✅ 定期备份数据库
6. ✅ 限制SSH登录（使用密钥认证）
7. ✅ 定期查看日志
8. ✅ 使用非root用户运行应用（生产环境）

---

## 📝 总结

完成以上步骤后，ProxyHub应该已经成功部署到腾讯云！

**快速检查清单**:
- [ ] Docker和Docker Compose已安装
- [ ] 项目文件已上传
- [ ] 环境变量已配置
- [ ] 容器已成功启动
- [ ] 数据库已初始化
- [ ] 防火墙规则已配置
- [ ] 可以访问前端和后端
- [ ] 测试账号登录成功

**访问地址**:
- 前端: http://your-server-ip:8080
- 后端: http://your-server-ip:3000/api/v1
- API文档: http://your-server-ip:3000/api

如有问题，请查看日志或参考故障排查部分。

