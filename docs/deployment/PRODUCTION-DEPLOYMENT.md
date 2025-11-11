# ProxyHub 生产环境部署指南

## 📋 部署前准备

### 1. 服务器要求
- **操作系统**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **CPU**: 最低 2核 / 推荐 4核
- **内存**: 最低 4GB / 推荐 8GB
- **硬盘**: 最低 40GB / 推荐 100GB (用于日志和备份)
- **网络**: 公网IP，开放端口 80, 443, 3000 (可选)

### 2. 必需软件
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.x+
- OpenSSL (用于生成密钥)

### 3. 准备配置信息
- 985Proxy API密钥和Zone ID
- 邮箱SMTP配置 (主邮箱和备用邮箱)
- (可选) Telegram Bot Token

---

## 🚀 方式一：自动化部署 (推荐)

### 一键部署
```bash
# SSH登录到服务器
ssh root@your-server-ip

# 下载并执行部署脚本
bash <(curl -s https://raw.githubusercontent.com/lubei0612/proxyhub/master/scripts/deploy-production.sh)
```

### 脚本会自动完成：
1. ✅ 检查Docker环境
2. ✅ 克隆/更新代码
3. ✅ 生成安全的数据库密码和JWT密钥
4. ✅ 创建`.env`配置文件
5. ✅ 配置自动备份 (每天凌晨2点)
6. ✅ 构建并启动服务
7. ✅ 创建管理员账号

### 部署完成后
脚本会输出：
- 访问地址
- 管理员账号和密码
- 常用管理命令

**⚠️ 重要：请立即保存管理员密码，并登录系统修改密码！**

---

## 🛠️ 方式二：手动部署

### Step 1: 安装Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: 克隆项目
```bash
cd ~
git clone -b master https://github.com/lubei0612/proxyhub.git
cd proxyhub
```

### Step 3: 配置环境变量
```bash
# 复制示例配置
cp env.example .env

# 生成安全密钥
export DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
export JWT_SECRET=$(openssl rand -base64 48)

# 更新.env文件
sed -i "s|DATABASE_PASSWORD=.*|DATABASE_PASSWORD=${DB_PASSWORD}|g" .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" .env

# 手动编辑其他配置
nano .env
```

**必填配置：**
```env
PROXY_985_API_KEY=your_api_key_here
PROXY_985_ZONE=your_zone_id_here
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_email_password
```

### Step 4: 启动服务
```bash
docker-compose down -v  # 清理旧数据
docker-compose build --no-cache
docker-compose up -d
```

### Step 5: 创建管理员账号
```bash
# 生成密码
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/")

# 生成密码哈希
ADMIN_HASH=$(docker-compose exec -T backend node -e "console.log(require('bcrypt').hashSync('${ADMIN_PASSWORD}', 10))")

# 创建管理员
docker-compose exec -T postgres psql -U postgres -d proxyhub << EOF
INSERT INTO users (email, password, nickname, role) 
VALUES ('admin@proxyhub.com', '$ADMIN_HASH', 'Administrator', 'admin') 
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
EOF

# 显示密码
echo "管理员密码: ${ADMIN_PASSWORD}"
```

---

## 🔄 GitHub Actions 自动部署

### 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets：

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `SERVER_HOST` | 服务器IP地址 | `43.130.35.117` |
| `SERVER_USER` | SSH用户名 | `root` |
| `SERVER_SSH_KEY` | SSH私钥 | 完整的私钥内容 |

### 生成SSH密钥对
```bash
# 在本地生成密钥
ssh-keygen -t rsa -b 4096 -C "deploy-key" -f ~/.ssh/proxyhub_deploy

# 查看公钥 (添加到服务器)
cat ~/.ssh/proxyhub_deploy.pub

# 查看私钥 (添加到GitHub Secrets)
cat ~/.ssh/proxyhub_deploy
```

### 添加公钥到服务器
```bash
# SSH到服务器
ssh root@your-server-ip

# 添加公钥
mkdir -p ~/.ssh
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 触发自动部署
推送代码到 `master` 分支即可自动部署：
```bash
git add .
git commit -m "Update application"
git push origin master
```

---

## 🔐 安全配置

### 1. 数据库密码安全
- ✅ 使用32位随机密码
- ✅ 定期轮换密码（每季度）
- ✅ 不要在代码中硬编码密码

### 2. JWT密钥安全
- ✅ 使用48字节 base64编码的随机密钥
- ✅ 永远不要提交到Git
- ✅ 定期轮换（每年）

### 3. SSL/TLS配置
```bash
# 使用Certbot获取免费SSL证书
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

### 4. 防火墙配置
```bash
# UFW防火墙
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 💾 数据库备份

### 自动备份
部署脚本已配置每天凌晨2点自动备份：
```bash
# 查看备份日志
tail -f /var/log/proxyhub-backup.log

# 查看备份文件
ls -lh /var/backups/proxyhub/
```

### 手动备份
```bash
cd ~/proxyhub
bash scripts/db-backup.sh
```

### 恢复数据库
```bash
cd ~/proxyhub
bash scripts/restore-db.sh /var/backups/proxyhub/proxyhub_backup_YYYYMMDD_HHMMSS.sql.gz
```

### 备份保留策略
- 保留最近 7 天的每日备份
- 超过 7 天的备份自动删除
- 建议定期下载到本地存储

---

## 📊 监控和日志

### 查看服务状态
```bash
docker-compose ps
```

### 查看日志
```bash
# 所有服务
docker-compose logs -f

# 后端
docker-compose logs -f backend

# 前端
docker-compose logs -f frontend

# 数据库
docker-compose logs -f postgres
```

### 性能监控
```bash
# 查看资源使用
docker stats

# 查看磁盘空间
df -h
```

---

## 🔧 常见问题

### 1. 端口被占用
```bash
# 查看占用端口的进程
sudo lsof -i :80
sudo lsof -i :3000

# 杀死进程
sudo kill -9 PID
```

### 2. 容器无法启动
```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs postgres

# 重建容器
docker-compose down -v
docker-compose up -d
```

### 3. 数据库连接失败
```bash
# 检查数据库密码
docker-compose exec postgres psql -U postgres -d proxyhub

# 重置数据库密码
docker-compose exec postgres psql -U postgres -c "ALTER USER postgres PASSWORD 'new_password';"
```

### 4. 内存不足
```bash
# 清理Docker缓存
docker system prune -a --volumes
```

---

## 📞 技术支持

- GitHub Issues: https://github.com/lubei0612/proxyhub/issues
- 文档: https://github.com/lubei0612/proxyhub/tree/master/docs

---

## ✅ 部署检查清单

部署完成后，请确认以下项目：

- [ ] 服务正常运行 (`docker-compose ps` 所有服务 healthy)
- [ ] 前端可以访问
- [ ] 管理员可以登录
- [ ] 数据库密码已更改为强密码
- [ ] JWT密钥已配置且足够强
- [ ] 自动备份已配置
- [ ] 防火墙已配置
- [ ] 日志正常输出
- [ ] 邮件发送功能正常
- [ ] 985Proxy API连接正常

完成所有检查后，您的ProxyHub生产环境已就绪！🎉

