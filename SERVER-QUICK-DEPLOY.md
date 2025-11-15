# ProxyHub 服务器快速部署指南

## 🚀 一键部署（推荐）

### 前提条件
- 服务器已安装 Docker 和 Docker Compose
- 服务器已安装 Git
- 有GitHub访问权限

### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/lubei0612/proxyhub.git
cd proxyhub

# 2. 配置环境变量
cp .env.example .env
nano .env  # 或使用 vi 编辑

# 3. 运行一键部署脚本
chmod +x deploy.sh
./deploy.sh
```

就这么简单！脚本会自动完成：
- ✅ 检查环境依赖
- ✅ 配置环境变量
- ✅ 构建Docker镜像
- ✅ 启动所有服务
- ✅ 健康检查

---

## 📋 详细步骤

### 步骤1: 安装Docker（如果未安装）

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 退出并重新登录使用户组生效
exit
```

### 步骤2: 克隆项目

```bash
# SSH方式（推荐）
git clone git@github.com:lubei0612/proxyhub.git

# 或HTTPS方式
git clone https://github.com/lubei0612/proxyhub.git

cd proxyhub
```

### 步骤3: 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
nano .env
```

**必须修改的配置项：**

```bash
# 数据库密码（强密码）
DATABASE_PASSWORD=你的强密码

# JWT密钥（至少32个字符）
JWT_SECRET=生成一个至少32个字符的随机字符串

# 985Proxy API配置
PROXY_985_API_KEY=你的985Proxy_API密钥
PROXY_985_ZONE=你的Zone_ID

# 邮件配置（可选）
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**生成安全的JWT密钥：**
```bash
openssl rand -base64 48
```

### 步骤4: 运行部署脚本

```bash
# 赋予执行权限
chmod +x deploy.sh

# 运行部署
./deploy.sh
```

部署脚本会自动：
1. 检查环境依赖
2. 验证配置文件
3. 停止旧容器
4. 构建新镜像
5. 启动服务
6. 健康检查

---

## 🔧 手动部署（高级）

如果需要更多控制，可以手动执行：

```bash
# 1. 停止旧容器（如果有）
docker-compose down

# 2. 使用生产配置构建并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 3. 查看日志
docker-compose logs -f

# 4. 检查容器状态
docker-compose ps
```

---

## 🌐 配置域名和HTTPS（生产环境必需）

### 使用Nginx反向代理 + Let's Encrypt

```bash
# 1. 安装Nginx
sudo apt install nginx

# 2. 配置Nginx
sudo nano /etc/nginx/sites-available/proxyhub

# 添加以下配置：
server {
    listen 80;
    server_name yourdomain.com;

    # 前端
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 3. 启用配置
sudo ln -s /etc/nginx/sites-available/proxyhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 4. 安装SSL证书（Let's Encrypt）
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 服务管理

### 查看服务状态
```bash
docker-compose ps
```

### 查看日志
```bash
# 所有服务
docker-compose logs -f

# 特定服务
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

### 停止服务
```bash
docker-compose down
```

### 更新服务
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔒 安全加固

### 1. 修改默认密码
```bash
# 登录后立即在管理后台修改
# admin@proxyhub.com 的密码
```

### 2. 配置防火墙
```bash
# 只开放必要端口
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 3. 定期备份数据库
```bash
# 创建备份脚本
nano backup.sh

# 添加以下内容：
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec proxyhub-postgres pg_dump -U postgres proxyhub > "$BACKUP_DIR/backup_$DATE.sql"
# 删除7天前的备份
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete

# 设置定时任务
crontab -e
# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

---

## 🐛 故障排查

### 问题1: 端口被占用
```bash
# 查看端口占用
sudo lsof -i :80
sudo lsof -i :3000

# 停止占用端口的进程
sudo kill -9 <PID>
```

### 问题2: 容器启动失败
```bash
# 查看详细日志
docker-compose logs backend

# 检查环境变量
cat .env

# 重新构建
docker-compose down
docker-compose up -d --build
```

### 问题3: 数据库连接失败
```bash
# 检查数据库容器
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 进入数据库容器
docker-compose exec postgres psql -U postgres
```

### 问题4: 前端访问404
```bash
# 检查Nginx配置
nginx -t

# 查看前端容器日志
docker-compose logs frontend

# 重启Nginx
sudo systemctl restart nginx
```

---

## 📈 监控和维护

### 查看资源使用
```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h
docker system df
```

### 清理Docker
```bash
# 清理未使用的镜像和容器
docker system prune -a

# 清理卷（谨慎！）
docker volume prune
```

---

## 📞 获取帮助

- **项目文档**: `docs/DEPLOYMENT-CHECKLIST.md`
- **问题报告**: GitHub Issues
- **技术支持**: 查看项目README

---

## ✅ 部署检查清单

部署完成后，确认以下各项：

- [ ] 所有容器正常运行（`docker-compose ps`）
- [ ] 前端可访问（http://yourdomain.com）
- [ ] 后端API可访问（http://yourdomain.com/api）
- [ ] 可以正常登录管理后台
- [ ] 数据库连接正常
- [ ] 已修改默认密码
- [ ] 已配置HTTPS（生产环境）
- [ ] 已配置防火墙
- [ ] 已设置数据库备份
- [ ] 已配置监控和日志

---

**部署完成！** 🎉
