# 🚀 ProxyHub 生产环境部署指南

本文档提供完整的生产环境部署流程，包括使用GitHub进行代码管理和自动化部署脚本。

---

## 📋 **部署前准备**

### **1. 服务器要求**

| 项目 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 硬盘 | 20GB | 50GB+ SSD |
| 操作系统 | Ubuntu 20.04+ / CentOS 8+ | Ubuntu 22.04 LTS |
| 网络 | 公网IP | 固定公网IP + 域名 |

### **2. 软件依赖**

```bash
# Docker (20.10+)
curl -fsSL https://get.docker.com | bash

# Docker Compose (2.0+)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git
sudo apt install git -y  # Ubuntu/Debian
# 或
sudo yum install git -y  # CentOS/RHEL
```

### **3. 985Proxy账户**

- 注册账户：https://985proxy.com
- 获取API Key和Zone（通道标识）
- 充值足够余额用于IP购买

### **4. 邮件服务（可选但推荐）**

选择以下之一：
- **Gmail**: 开启"应用专用密码"
- **Outlook**: 使用正常密码
- **SendGrid**: 获取API Key

---

## 🔄 **部署方式一：GitHub + 自动化脚本（推荐）**

### **步骤1: 本地准备代码**

```bash
# 1. 确保所有修改已提交
git status

# 2. 添加所有文件
git add .

# 3. 提交更改
git commit -m "feat: 准备生产环境部署"

# 4. 推送到GitHub
git push origin main
```

⚠️ **重要**: `.env`文件会被`.gitignore`自动忽略，不会推送到GitHub，确保安全！

---

### **步骤2: 服务器端部署**

#### **2.1 克隆代码**

```bash
# 首次部署：克隆仓库
cd /opt  # 或您喜欢的目录
git clone https://github.com/YOUR_USERNAME/proxyhub.git
cd proxyhub

# 后续更新：拉取最新代码
cd /opt/proxyhub
git pull origin main
```

#### **2.2 配置环境变量**

**方式A: 使用自动化配置向导（推荐）**

```bash
chmod +x setup-env.sh
./setup-env.sh
```

选择配置模式：
- **快速模式**: 自动生成随机密钥，适合测试
- **交互模式**: 逐项输入配置，适合生产环境 ✅
- **从备份恢复**: 从之前的备份恢复配置

**方式B: 手动配置**

```bash
# 复制模板
cp .env.example .env

# 编辑配置文件
nano .env  # 或使用 vim
```

必须配置的关键项：
```env
# 数据库密码（自动生成或自定义）
DATABASE_PASSWORD=your_secure_password

# JWT密钥（使用以下命令生成）
# openssl rand -base64 64
JWT_SECRET=your_generated_jwt_secret

# 985Proxy配置
PROXY_985_API_KEY=ne_xxxxx
PROXY_985_ZONE=xxxxx

# 邮件配置
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# 前端域名
FRONTEND_URL=https://your-domain.com
```

#### **2.3 一键部署**

```bash
chmod +x deploy.sh
./deploy.sh
```

部署脚本会自动：
1. ✅ 检查系统环境（Docker、Git等）
2. ✅ 验证`.env`配置完整性
3. ✅ 停止旧容器
4. ✅ 清理Docker资源（可选）
5. ✅ 构建Docker镜像
6. ✅ 启动所有服务
7. ✅ 健康检查
8. ✅ 显示访问信息

---

### **步骤3: 验证部署**

#### **3.1 检查容器状态**

```bash
docker-compose -f docker-compose.cn.yml ps
```

期望输出（所有容器状态为`Up`或`healthy`）：
```
NAME                 STATUS
proxyhub-postgres    Up (healthy)
proxyhub-redis       Up (healthy)
proxyhub-backend     Up (healthy)
proxyhub-frontend    Up
```

#### **3.2 查看日志**

```bash
# 后端日志
docker logs -f proxyhub-backend

# 前端日志
docker logs -f proxyhub-frontend

# 所有服务日志
docker-compose -f docker-compose.cn.yml logs -f
```

#### **3.3 测试访问**

```bash
# 测试前端
curl http://localhost:8080

# 测试后端API
curl http://localhost:3000/api/v1/health
```

---

## 🔧 **部署方式二：手动Docker部署**

### **快速启动**

```bash
# 1. 进入项目目录
cd /opt/proxyhub

# 2. 配置.env文件
cp .env.example .env
nano .env

# 3. 构建并启动
docker-compose -f docker-compose.cn.yml up -d --build

# 4. 查看状态
docker-compose -f docker-compose.cn.yml ps
```

---

## 🌐 **配置域名和HTTPS（推荐）**

### **使用Nginx反向代理 + Let's Encrypt**

#### **1. 安装Nginx和Certbot**

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

#### **2. 配置Nginx**

创建配置文件 `/etc/nginx/sites-available/proxyhub`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

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
        
        # 增加超时时间（IP购买可能需要较长时间）
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
    }
}
```

#### **3. 启用配置并申请SSL证书**

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/proxyhub /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 申请SSL证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo certbot renew --dry-run
```

---

## 📊 **生产环境监控**

### **1. 查看系统资源**

```bash
# CPU和内存使用
docker stats

# 磁盘使用
df -h

# 容器日志大小
du -sh /var/lib/docker/containers/*/*-json.log
```

### **2. 数据库备份**

```bash
# 创建备份脚本
cat > /opt/backup-proxyhub.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/proxyhub"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
docker exec proxyhub-postgres pg_dump -U postgres proxyhub | gzip > $BACKUP_DIR/proxyhub_$DATE.sql.gz

# 保留最近7天的备份
find $BACKUP_DIR -name "proxyhub_*.sql.gz" -mtime +7 -delete

echo "Backup completed: proxyhub_$DATE.sql.gz"
EOF

chmod +x /opt/backup-proxyhub.sh

# 添加到crontab（每天凌晨2点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-proxyhub.sh") | crontab -
```

### **3. 日志轮转**

```bash
# 限制Docker日志大小
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker
```

---

## 🔄 **日常维护命令**

### **服务管理**

```bash
# 查看服务状态
docker-compose -f docker-compose.cn.yml ps

# 重启所有服务
docker-compose -f docker-compose.cn.yml restart

# 重启单个服务
docker-compose -f docker-compose.cn.yml restart backend

# 停止服务
docker-compose -f docker-compose.cn.yml down

# 启动服务
docker-compose -f docker-compose.cn.yml up -d

# 查看实时日志
docker-compose -f docker-compose.cn.yml logs -f

# 查看特定服务日志
docker logs -f proxyhub-backend --tail 100
```

### **代码更新**

```bash
# 1. 拉取最新代码
cd /opt/proxyhub
git pull origin main

# 2. 重新构建并启动
docker-compose -f docker-compose.cn.yml up -d --build

# 或使用部署脚本
./deploy.sh
```

### **清理Docker资源**

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的卷
docker volume prune

# 清理所有未使用资源
docker system prune -a --volumes
```

---

## 🐛 **常见问题排查**

### **问题1: 容器启动失败**

```bash
# 检查日志
docker logs proxyhub-backend
docker logs proxyhub-frontend

# 检查.env配置
cat .env

# 检查端口占用
netstat -tlnp | grep :3000
netstat -tlnp | grep :8080
```

### **问题2: 数据库连接失败**

```bash
# 检查PostgreSQL容器
docker logs proxyhub-postgres

# 进入容器测试
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub

# 检查网络
docker network ls
docker network inspect proxyhub_default
```

### **问题3: 前端无法访问后端API**

```bash
# 检查后端健康状态
curl http://localhost:3000/api/v1/health

# 检查Nginx配置（如果使用）
sudo nginx -t
sudo systemctl status nginx

# 检查防火墙
sudo ufw status
sudo firewall-cmd --list-all  # CentOS
```

### **问题4: 985Proxy API调用失败**

```bash
# 测试API连接
docker exec proxyhub-backend curl -X POST "https://open-api.985proxy.com/api/res_static/inventory" \
  -H "Authorization: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"zone":"YOUR_ZONE"}'

# 检查后端日志中的985Proxy相关错误
docker logs proxyhub-backend | grep "985Proxy"
```

---

## 🔒 **安全建议**

### **1. 防火墙配置**

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### **2. 修改默认管理员密码**

登录后立即修改：
- 访问：账户中心 → 个人设置 → 修改密码

### **3. 定期更新**

```bash
# 系统更新
sudo apt update && sudo apt upgrade -y

# Docker更新
docker --version
# 如需更新，访问 https://docs.docker.com/engine/install/

# 代码更新
cd /opt/proxyhub
git pull origin main
./deploy.sh
```

### **4. 备份`.env`文件**

```bash
# 加密备份
tar czf proxyhub-env-backup.tar.gz .env
gpg -c proxyhub-env-backup.tar.gz
rm proxyhub-env-backup.tar.gz

# 存储到安全位置
mv proxyhub-env-backup.tar.gz.gpg ~/backups/
```

---

## 📞 **获取帮助**

- 查看日志定位问题
- 检查配置文件
- 参考本文档的"常见问题排查"章节

---

## 📝 **更新日志**

- **2025-11-08**: 初始版本
  - 添加GitHub工作流
  - 创建自动化部署脚本
  - 优化生产环境配置

---

**部署成功后，请务必：**
1. ✅ 修改默认管理员密码
2. ✅ 配置HTTPS证书
3. ✅ 设置数据库自动备份
4. ✅ 配置系统监控
5. ✅ 定期检查日志

祝您部署顺利！ 🚀

