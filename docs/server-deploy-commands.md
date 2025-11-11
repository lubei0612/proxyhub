# 🚀 服务器部署命令速查表

## 第1步：SSH 登录服务器

```bash
ssh root@YOUR_SERVER_IP
```

**如果需要密码登录，请准备好您的服务器密码**

---

## 第2步：安装 Docker（如果还未安装）

### Ubuntu/Debian:
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker-compose --version
```

### CentOS:
```bash
# 安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 第3步：克隆项目并配置

```bash
# 克隆项目（请先在 GitHub 创建仓库并上传代码）
git clone https://github.com/YOUR_USERNAME/proxyhub.git
cd proxyhub

# 创建 .env 文件
nano .env
```

**粘贴以下配置（已填入您的真实信息）：**

```bash
# ============================================
# ProxyHub 生产环境配置
# ============================================

# Node Environment
NODE_ENV=production
LOG_LEVEL=info

# Server Configuration
PORT=3000
API_PREFIX=/api/v1

# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_strong_password_here_CHANGE_THIS
DATABASE_NAME=proxyhub
DATABASE_SYNC=false

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration (会自动生成强密钥)
JWT_SECRET=WILL_BE_AUTO_GENERATED
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d

# 985Proxy API Configuration
PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
PROXY_985_BASE_URL=https://open-api.985proxy.com
PROXY_985_ZONE=6jd4ftbl7kv3
PROXY_985_TEST_MODE=false

# Email Service Configuration (Primary - Outlook)
MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_USER=RobinsonKevin5468@outlook.com
MAIL_PASSWORD=ugfqftyq60695
MAIL_FROM=ProxyHub <noreply@proxyhub.com>

# Backup Email Service (Gmail)
MAIL_HOST_BACKUP=smtp.gmail.com
MAIL_PORT_BACKUP=587
MAIL_USER_BACKUP=chenyuqi061245@gmail.com
MAIL_PASSWORD_BACKUP=vvdgyeerdtycwxka

# Telegram Bot (Optional)
# TELEGRAM_BOT_TOKEN=8578437524:AAE66OfSvFJmma7va8lhaeNK70Q1Sj_HaNo
# TELEGRAM_BOT_USERNAME=ProxyHub_Notify_Bot

# Frontend Configuration (改为您的服务器IP或域名)
FRONTEND_URL=http://YOUR_SERVER_IP

# CORS Configuration (改为您的服务器IP或域名)
CORS_ORIGINS=http://YOUR_SERVER_IP,http://localhost:8080
```

**⚠️ 重要：将上面的 `YOUR_SERVER_IP` 替换为您的实际服务器IP地址！**

保存文件：
- nano 编辑器：`Ctrl + X`，然后按 `Y`，再按 `Enter`
- vim 编辑器：按 `ESC`，然后输入 `:wq`，按 `Enter`

---

## 第4步：生成强 JWT 密钥（可选，自动部署脚本会生成）

```bash
# 安装 Node.js（如果需要手动生成JWT密钥）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 生成JWT密钥
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")

# 更新.env文件
sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" .env
```

---

## 第5步：构建并启动服务

```bash
# 构建 Docker 镜像
docker-compose build --no-cache

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看启动日志
docker-compose logs -f backend
```

**等待约30秒，让服务完全启动**

---

## 第6步：验证部署

```bash
# 检查所有容器是否运行
docker-compose ps

# 应该看到4个容器：
# proxyhub-frontend   (nginx)
# proxyhub-backend    (nestjs)
# proxyhub-postgres   (database)
# proxyhub-redis      (cache)

# 查看后端日志，确认启动成功
docker-compose logs backend | grep "ProxyHub Backend Started"

# 测试后端API
curl http://localhost:3000/api/v1

# 测试前端
curl http://localhost:80
```

---

## 第7步：访问系统

**浏览器打开：** `http://YOUR_SERVER_IP`

**管理员登录：**
- 邮箱：`admin@proxyhub.com`
- 密码：`Admin123456`

**⚠️ 登录后请立即修改密码！**

---

## 🔧 常用管理命令

### 查看日志
```bash
cd proxyhub

# 所有服务日志
docker-compose logs -f

# 只看后端
docker-compose logs -f backend

# 只看前端
docker-compose logs -f frontend

# 只看数据库
docker-compose logs -f postgres
```

### 重启服务
```bash
# 重启所有
docker-compose restart

# 重启后端
docker-compose restart backend

# 重启前端
docker-compose restart frontend
```

### 停止/启动服务
```bash
# 停止所有服务
docker-compose down

# 启动所有服务
docker-compose up -d

# 查看状态
docker-compose ps
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
docker exec proxyhub-postgres pg_dump -U postgres proxyhub > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
docker exec -i proxyhub-postgres psql -U postgres proxyhub < backup_20251111_100000.sql
```

---

## 🔒 安全加固（重要！）

### 1. 修改管理员密码
- 登录后台
- 进入个人中心
- 修改密码

### 2. 配置防火墙
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# 查看状态
sudo ufw status
```

### 3. 配置SSL证书（如果有域名）
```bash
# 安装 Certbot
sudo apt install certbot nginx -y

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/proxyhub

# 添加以下内容：
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/proxyhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com
```

---

## 🐛 故障排查

### 服务无法启动
```bash
# 查看详细错误
docker-compose logs backend | tail -100

# 检查端口占用
sudo netstat -tlnp | grep 3000
sudo netstat -tlnp | grep 80

# 重新构建
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 数据库连接失败
```bash
# 检查数据库容器
docker-compose ps postgres

# 重启数据库
docker-compose restart postgres

# 进入数据库检查
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub
```

### 前端白屏
```bash
# 清除浏览器缓存（Ctrl+Shift+R）

# 重新构建前端
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

## 📞 需要帮助？

如果遇到问题：
1. 先查看日志：`docker-compose logs -f`
2. 检查配置：`cat .env`
3. 查看服务状态：`docker-compose ps`
4. 查看系统资源：`free -h && df -h`

---

## 🎉 部署完成！

**您的 ProxyHub 已成功部署！**

**接下来可以：**
- ✅ 登录管理后台
- ✅ 修改管理员密码
- ✅ 添加用户
- ✅ 配置价格
- ✅ 测试购买流程

**祝您生意兴隆！** 💰

