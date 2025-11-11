# 🚀 ProxyHub 服务器部署指南

## 📋 准备工作

### 1. 服务器要求
- **系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **CPU**: 2核心以上
- **内存**: 4GB以上
- **硬盘**: 40GB以上
- **网络**: 公网IP，开放端口 80、443、3000

### 2. 必需软件
- Docker 20.10+
- Docker Compose 2.0+
- Git

---

## 🔧 服务器环境准备

### 安装 Docker (Ubuntu/Debian)

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker-compose --version
```

### 安装 Docker (CentOS)

```bash
# 安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker compose version
```

---

## 📦 部署步骤

### 方法一：自动化部署（推荐）

```bash
# 1. 下载部署脚本
wget https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/proxyhub/main/deploy-server.sh

# 或使用 curl
curl -O https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/proxyhub/main/deploy-server.sh

# 2. 赋予执行权限
chmod +x deploy-server.sh

# 3. 运行部署脚本
bash deploy-server.sh
```

脚本会自动：
- ✅ 检查 Docker 环境
- ✅ 克隆最新代码
- ✅ 创建 .env 配置文件
- ✅ 生成 JWT_SECRET
- ✅ 构建 Docker 镜像
- ✅ 启动所有服务
- ✅ 显示访问地址

---

### 方法二：手动部署

#### 1. 克隆代码

```bash
# 克隆项目
git clone YOUR_GITHUB_REPO_URL
cd proxyhub
```

#### 2. 配置环境变量

```bash
# 复制配置模板
cp .env.production .env

# 编辑配置文件
nano .env
```

**必须修改的配置项：**

```bash
# 数据库密码
DATABASE_PASSWORD=your_strong_password_here

# JWT密钥（至少32字符）
# 生成命令: node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
JWT_SECRET=your_generated_jwt_secret_here

# 985Proxy配置
PROXY_985_API_KEY=your_api_key_here
PROXY_985_ZONE=your_zone_id_here

# 邮件配置
MAIL_USER=your_email@outlook.com
MAIL_PASSWORD=your_email_password

# 前端域名
FRONTEND_URL=https://yourdomain.com

# CORS配置
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### 3. 构建并启动服务

```bash
# 构建镜像
docker-compose build --no-cache

# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

---

## 🔍 验证部署

### 1. 检查服务状态

```bash
# 查看所有容器
docker-compose ps

# 应该看到4个容器都在运行：
# - proxyhub-frontend (nginx)
# - proxyhub-backend (nest.js)
# - proxyhub-postgres (database)
# - proxyhub-redis (cache)
```

### 2. 检查后端日志

```bash
# 查看后端启动日志
docker-compose logs backend | grep "ProxyHub Backend Started"

# 应该看到：
# ✅ Environment configuration validated successfully
# ========================================
#   ProxyHub Backend Started!
# ========================================
```

### 3. 测试API

```bash
# 测试后端API
curl http://localhost:3000/api/v1

# 测试前端
curl http://localhost
```

---

## 🌐 配置域名和SSL

### 使用 Nginx + Let's Encrypt (推荐)

#### 1. 安装 Nginx

```bash
sudo apt install nginx -y
```

#### 2. 配置 Nginx

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/proxyhub
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 前端
    location / {
        proxy_pass http://localhost:80;
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

#### 3. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/proxyhub /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 4. 安装 SSL 证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期（Certbot会自动配置）
sudo certbot renew --dry-run
```

---

## 📊 日常维护

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
docker-compose restart frontend
```

### 更新代码

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose down
docker-compose build
docker-compose up -d
```

### 备份数据库

```bash
# 导出数据库
docker exec proxyhub-postgres pg_dump -U postgres proxyhub > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker exec -i proxyhub-postgres psql -U postgres proxyhub < backup_20251111.sql
```

---

## 🐛 故障排查

### 1. 服务无法启动

```bash
# 检查 Docker 日志
docker-compose logs --tail=100 backend

# 常见问题：
# - 端口被占用：修改 docker-compose.yml 中的端口
# - 配置错误：检查 .env 文件
# - 内存不足：增加服务器内存或减少容器资源限制
```

### 2. 数据库连接失败

```bash
# 检查数据库容器状态
docker-compose ps postgres

# 检查数据库日志
docker-compose logs postgres

# 测试数据库连接
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub
```

### 3. 前端无法访问后端

```bash
# 检查 CORS 配置
# 确保 .env 中的 CORS_ORIGINS 包含前端域名

# 检查网络连接
docker-compose exec backend ping postgres
docker-compose exec backend ping redis
```

---

## 🔒 安全加固

### 1. 修改默认密码

登录后立即修改管理员密码：
- 管理员邮箱：admin@proxyhub.com
- 默认密码：Admin123456

### 2. 配置防火墙

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. 限制 Docker 端口暴露

编辑 `docker-compose.yml`，将：
```yaml
ports:
  - "3000:3000"
```

改为：
```yaml
ports:
  - "127.0.0.1:3000:3000"
```

### 4. 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新 Docker 镜像
docker-compose pull
docker-compose up -d
```

---

## 📞 技术支持

- **文档**: [GitHub Wiki](YOUR_GITHUB_WIKI_URL)
- **Issues**: [GitHub Issues](YOUR_GITHUB_ISSUES_URL)
- **Email**: support@proxyhub.com

---

## 📝 变更日志

- **2025-11-11**: 初始版本
  - 支持 Docker 部署
  - 自动化部署脚本
  - SSL 证书配置指南

---

**祝您部署顺利！** 🎉

