# 🚀 ProxyHub 生产环境部署指南

## 📋 准备清单

### 本地准备（你现在）

- [x] 代码已修复所有bug
- [x] 功能已全面验证
- [x] 部署脚本已准备
- [x] 文档已完善
- [ ] 代码已推送到GitHub

### 服务器要求

- [ ] Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- [ ] 2核CPU + 4GB内存（最低配置）
- [ ] 20GB+ 磁盘空间
- [ ] Docker 20.10+
- [ ] Docker Compose 1.29+
- [ ] 开放端口：80, 443（生产环境还需443）

---

## 🎯 部署流程（3步完成）

### 第一步：推送代码到GitHub

在**本地**执行：

```bash
# 查看提交状态
git log --oneline -1

# 推送到GitHub
git push origin master

# 如果遇到权限问题，可能需要配置GitHub Token
```

---

### 第二步：服务器准备

在**服务器**上执行：

#### A. 安装Docker（如果未安装）

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重新登录使配置生效
exit
# 然后重新SSH登录
```

#### B. 验证安装

```bash
docker --version
docker-compose --version
```

---

### 第三步：一键部署

在**服务器**上执行：

```bash
# 1. 克隆项目
git clone https://github.com/lubei0612/proxyhub.git
cd proxyhub

# 2. 配置环境变量
cp .env.example .env
nano .env

# ⚠️ 必须修改这些参数：
#   DATABASE_PASSWORD=你的强密码
#   JWT_SECRET=$(openssl rand -base64 48)
#   PROXY_985_API_KEY=你的985Proxy_API密钥
#   PROXY_985_ZONE=你的Zone_ID

# 3. 运行一键部署脚本
chmod +x deploy.sh
./deploy.sh
```

**等待3-5分钟**，部署完成！

---

## ✅ 验证部署

```bash
# 1. 检查容器状态（应该都是Up状态）
docker-compose ps

# 2. 查看日志
docker-compose logs -f

# 3. 测试访问
curl http://localhost/api/v1/health
# 应该返回: {"status":"ok",...}

# 4. 浏览器访问
# http://你的服务器IP
```

---

## 🔐 安全配置（生产环境必须）

### 1. 修改默认密码

登录后台：
- 邮箱：admin@proxyhub.com
- 默认密码：admin123456
- **立即修改密码！**

### 2. 配置防火墙

```bash
# 安装UFW
sudo apt install ufw

# 配置规则
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# 检查状态
sudo ufw status
```

### 3. 配置HTTPS（强烈推荐）

```bash
# 安装Nginx和Certbot
sudo apt install nginx certbot python3-certbot-nginx

# 配置Nginx
sudo nano /etc/nginx/sites-available/proxyhub
```

复制以下配置：

```nginx
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
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/proxyhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 申请SSL证书
sudo certbot --nginx -d yourdomain.com
```

### 4. 设置自动备份

```bash
# 创建备份脚本
nano ~/backup-proxyhub.sh
```

添加内容：

```bash
#!/bin/bash
BACKUP_DIR="$HOME/proxyhub-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# 备份数据库
docker exec proxyhub-postgres pg_dump -U postgres proxyhub > "$BACKUP_DIR/db_$DATE.sql"

# 删除30天前的备份
find "$BACKUP_DIR" -name "db_*.sql" -mtime +30 -delete

echo "Backup completed: $DATE"
```

设置定时任务：

```bash
chmod +x ~/backup-proxyhub.sh
crontab -e

# 添加：每天凌晨2点备份
0 2 * * * /home/yourusername/backup-proxyhub.sh >> /home/yourusername/backup.log 2>&1
```

---

## 📊 监控和维护

### 日常检查

```bash
# 查看容器状态
docker-compose ps

# 查看资源使用
docker stats

# 查看磁盘使用
df -h
docker system df
```

### 更新代码

```bash
cd proxyhub

# 拉取最新代码
git pull origin master

# 重新构建并部署
docker-compose -f docker-compose.prod.yml up -d --build

# 查看日志确认更新成功
docker-compose logs -f
```

### 常见维护命令

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止服务
docker-compose down

# 清理Docker缓存（谨慎）
docker system prune -a
```

---

## 🐛 故障排查

### 问题1: 端口被占用

```bash
# 查看端口占用
sudo lsof -i :80
sudo lsof -i :3000

# 停止占用进程
sudo kill -9 <PID>
```

### 问题2: 容器无法启动

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs postgres

# 检查配置
cat .env

# 完全重置（会删除数据！）
docker-compose down -v
docker-compose up -d --build
```

### 问题3: 数据库连接失败

```bash
# 检查数据库容器
docker-compose ps postgres

# 进入数据库
docker-compose exec postgres psql -U postgres

# 检查数据库是否存在
\l
```

### 问题4: 前端白屏

```bash
# 查看前端日志
docker-compose logs frontend

# 重新构建前端
docker-compose up -d --build frontend

# 清除浏览器缓存并刷新
```

---

## 📞 获取支持

- **详细文档**: `docs/DEPLOYMENT-CHECKLIST.md`
- **快速指南**: `SERVER-QUICK-DEPLOY.md`
- **命令清单**: `SERVER-COMMANDS.txt`
- **GitHub**: https://github.com/lubei0612/proxyhub

---

## 🎉 部署完成检查清单

部署完成后，逐项确认：

- [ ] 所有容器正常运行（`docker-compose ps`）
- [ ] 健康检查通过（`curl http://localhost/api/v1/health`）
- [ ] 前端可访问（浏览器）
- [ ] 后端API可访问（/api路径）
- [ ] 可以正常登录
- [ ] 已修改默认密码
- [ ] 防火墙已配置
- [ ] HTTPS已配置（生产环境）
- [ ] 数据库备份已设置
- [ ] 监控已配置

---

## 📈 性能优化建议

### 1. 数据库优化

```bash
# 进入数据库容器
docker-compose exec postgres psql -U postgres proxyhub

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_static_proxies_user_id ON static_proxies(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### 2. Nginx缓存

在Nginx配置中添加：

```nginx
# 静态文件缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Docker资源限制

在 `docker-compose.prod.yml` 中添加：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

---

**准备好了吗？开始部署吧！** 🚀
