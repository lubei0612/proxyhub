# 🔑 SSH 部署命令 - 请按顺序执行

## 服务器信息
```
服务器IP: 43.130.35.117
用户: root
```

---

## 第1步：SSH 登录服务器

**请在您的本地终端（PowerShell 或 CMD）执行：**

```bash
ssh root@43.130.35.117
```

**提示：** 输入命令后，会要求输入密码，输入您的服务器密码即可（密码输入时不会显示）

---

## 第2步：一键部署（登录服务器后执行）

**方法一：自动部署脚本（推荐）**

```bash
# 下载并运行部署脚本
bash <(curl -s https://raw.githubusercontent.com/lubei0612/proxyhub/master/deploy-server.sh)
```

**脚本会自动完成：**
- ✅ 检查并安装 Docker
- ✅ 克隆项目代码
- ✅ 创建 .env 配置文件
- ✅ 生成强 JWT 密钥
- ✅ 构建 Docker 镜像
- ✅ 启动所有服务

---

**方法二：手动部署（如果自动脚本失败）**

```bash
# 1. 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
sudo systemctl enable docker

# 2. 克隆项目
git clone https://github.com/lubei0612/proxyhub.git
cd proxyhub

# 3. 创建配置文件
cp env.production.template .env

# 4. 编辑配置文件
nano .env
```

**在 nano 编辑器中，修改以下配置：**

```bash
# 修改数据库密码（改为强密码）
DATABASE_PASSWORD=ProxyHub_DB_2025_Secure_Password_Change_This

# 修改前端URL（改为服务器IP）
FRONTEND_URL=http://43.130.35.117

# 修改CORS配置（改为服务器IP）
CORS_ORIGINS=http://43.130.35.117
```

**保存并退出：** `Ctrl+X`，然后按 `Y`，再按 `Enter`

```bash
# 5. 生成 JWT 密钥
apt install -y nodejs npm
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")
sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" .env

# 6. 构建并启动服务
docker-compose build --no-cache
docker-compose up -d

# 7. 等待服务启动（约30秒）
sleep 30

# 8. 查看服务状态
docker-compose ps

# 9. 查看后端日志
docker-compose logs backend | grep "ProxyHub Backend Started"
```

---

## 第3步：验证部署

### 查看服务状态
```bash
docker-compose ps
```

**应该看到4个容器都在运行：**
```
NAME                   STATUS
proxyhub-frontend      Up
proxyhub-backend       Up
proxyhub-postgres      Up
proxyhub-redis         Up
```

### 查看后端日志
```bash
docker-compose logs -f backend
```

**按 `Ctrl+C` 退出日志查看**

### 测试API
```bash
# 测试后端
curl http://localhost:3000/api/v1

# 测试前端
curl http://localhost:80
```

---

## 第4步：访问系统

### 浏览器访问
**前端地址：** http://43.130.35.117

### 管理员登录
```
邮箱：admin@proxyhub.com
密码：Admin123456
```

**⚠️ 重要：登录后立即修改密码！**

---

## 🔧 常用管理命令

### 查看日志
```bash
cd proxyhub

# 查看所有日志
docker-compose logs -f

# 只看后端
docker-compose logs -f backend

# 只看前端
docker-compose logs -f frontend
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
# 停止
docker-compose down

# 启动
docker-compose up -d

# 查看状态
docker-compose ps
```

### 更新代码
```bash
git pull origin master
docker-compose down
docker-compose build
docker-compose up -d
```

### 备份数据库
```bash
# 备份
docker exec proxyhub-postgres pg_dump -U postgres proxyhub > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复
docker exec -i proxyhub-postgres psql -U postgres proxyhub < backup_20251111_100000.sql
```

---

## 🔒 安全加固（重要！）

### 1. 配置防火墙
```bash
# 允许必要端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# 启用防火墙
ufw enable

# 查看状态
ufw status
```

### 2. 修改管理员密码
- 登录后台
- 进入个人中心
- 立即修改密码

### 3. 配置SSL证书（如果有域名）
```bash
# 安装 Certbot 和 Nginx
apt install -y certbot nginx

# 创建 Nginx 配置
nano /etc/nginx/sites-available/proxyhub
```

添加以下内容：
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

```bash
# 启用配置
ln -s /etc/nginx/sites-available/proxyhub /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 获取SSL证书
certbot --nginx -d yourdomain.com
```

---

## 🐛 故障排查

### 问题1：无法访问网站
```bash
# 检查防火墙
ufw status

# 检查端口占用
netstat -tlnp | grep 80
netstat -tlnp | grep 3000

# 检查服务状态
docker-compose ps
```

### 问题2：服务启动失败
```bash
# 查看详细错误
docker-compose logs backend | tail -100

# 重新构建
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 问题3：数据库连接失败
```bash
# 重启数据库
docker-compose restart postgres

# 查看数据库日志
docker-compose logs postgres

# 进入数据库检查
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub
```

### 问题4：前端白屏
```bash
# 清除浏览器缓存（Ctrl+Shift+R）

# 重新构建前端
docker-compose build --no-cache frontend
docker-compose restart frontend
```

---

## ✅ 部署检查清单

- [ ] SSH 成功登录服务器
- [ ] Docker 安装成功
- [ ] 项目克隆成功
- [ ] .env 配置正确（DATABASE_PASSWORD、FRONTEND_URL、CORS_ORIGINS）
- [ ] JWT_SECRET 已生成
- [ ] Docker 镜像构建成功
- [ ] 4个容器都在运行
- [ ] 可以访问 http://43.130.35.117
- [ ] 可以登录管理后台
- [ ] 已修改管理员密码
- [ ] 防火墙已配置

---

## 📞 需要帮助？

### 收集诊断信息
```bash
# 服务状态
docker-compose ps

# 查看日志
docker-compose logs backend | tail -200

# 系统资源
free -h
df -h

# Docker 信息
docker --version
docker-compose --version
```

---

## 🎉 部署完成！

**部署成功后，您将拥有：**
- ✅ 完整的代理管理平台
- ✅ 安全加固的系统（强密码策略、API速率限制、JWT认证）
- ✅ 用户管理、订单管理、价格覆盖功能
- ✅ 生产环境运行的网站

**访问地址：** http://43.130.35.117

**管理员账号：**
- 邮箱：admin@proxyhub.com
- 密码：Admin123456（请立即修改）

**祝您生意兴隆！** 💰🚀

---

## 📝 快速命令总结

```bash
# 本地终端
ssh root@43.130.35.117

# 服务器上（一键部署）
bash <(curl -s https://raw.githubusercontent.com/lubei0612/proxyhub/master/deploy-server.sh)

# 或手动部署
git clone https://github.com/lubei0612/proxyhub.git
cd proxyhub
cp env.production.template .env
nano .env  # 修改配置
docker-compose build
docker-compose up -d
```

**就这么简单！** ✨

