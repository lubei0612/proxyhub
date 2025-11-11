# 🚀 ProxyHub 一键部署到腾讯云服务器

**部署时间**: 约5-10分钟  
**难度**: ⭐ 简单（全自动）

---

## 📋 前置准备

### 您需要准备的信息：

1. **服务器 SSH 信息**
   ```
   服务器IP: _____________
   SSH端口: 22 (默认)
   用户名: root 或 ubuntu
   密码: _____________
   ```

2. **985Proxy 配置**
   ```
   API Key: _____________
   Zone ID: _____________
   ```

3. **邮箱配置** (用于发送验证码)
   ```
   邮箱地址: _____________
   邮箱密码/应用密码: _____________
   ```

4. **域名** (可选，建议配置)
   ```
   域名: _____________
   ```

---

## 🎯 快速部署（3步完成）

### 第1步：SSH 登录服务器

```bash
ssh root@YOUR_SERVER_IP
```

如果使用密钥登录：
```bash
ssh -i /path/to/your/key.pem root@YOUR_SERVER_IP
```

---

### 第2步：运行一键部署命令

**复制并执行以下命令：**

```bash
# 下载并运行部署脚本
bash <(curl -s https://raw.githubusercontent.com/lubei0612/proxyhub/master/deploy-server.sh)
```

**或者分步执行：**

```bash
# 1. 克隆项目
git clone https://github.com/lubei0612/proxyhub.git
cd proxyhub

# 2. 运行部署脚本
chmod +x deploy-server.sh
bash deploy-server.sh
```

---

### 第3步：配置环境变量

部署脚本会提示您编辑 `.env` 文件，**请按照以下说明填入真实配置：**

```bash
# 脚本会自动打开编辑器，修改以下内容：

# 1. 数据库密码（改为强密码）
DATABASE_PASSWORD=your_strong_password_here_123456

# 2. JWT密钥（脚本会自动生成，无需修改）
JWT_SECRET=已自动生成

# 3. 985Proxy配置（填入您的真实信息）
PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
PROXY_985_ZONE=6jd4ftbl7kv3

# 4. 邮件配置（填入您的真实信息）
MAIL_USER=RobinsonKevin5468@outlook.com
MAIL_PASSWORD=ugfqftyq60695

# 5. 前端域名（如果有域名就填，没有就填服务器IP）
FRONTEND_URL=http://YOUR_SERVER_IP

# 6. CORS配置（如果有域名就填，没有就填服务器IP）
CORS_ORIGINS=http://YOUR_SERVER_IP
```

**保存并退出编辑器**（nano: Ctrl+X, Y, Enter）

---

## ✅ 部署完成！

部署成功后，您会看到：

```
================================================
  🎉 部署完成！
================================================

服务访问地址：
  前端: http://YOUR_SERVER_IP
  后端API: http://YOUR_SERVER_IP:3000/api/v1
  API文档: http://YOUR_SERVER_IP:3000/api

管理员账号：
  邮箱: admin@proxyhub.com
  密码: Admin123456
```

---

## 🌐 访问您的网站

1. **打开浏览器**，访问：`http://YOUR_SERVER_IP`
2. **登录管理员账号**：
   - 邮箱：`admin@proxyhub.com`
   - 密码：`Admin123456`
3. **立即修改密码**（安全第一！）

---

## 🔧 常用管理命令

### 查看服务状态
```bash
cd proxyhub
docker-compose ps
```

### 查看日志
```bash
# 查看所有日志
docker-compose logs -f

# 只看后端日志
docker-compose logs -f backend

# 只看前端日志
docker-compose logs -f frontend
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启某个服务
docker-compose restart backend
```

### 停止服务
```bash
docker-compose down
```

### 启动服务
```bash
docker-compose up -d
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

---

## 🔒 安全加固（推荐）

### 1. 修改管理员密码
登录后立即在个人设置中修改密码

### 2. 配置防火墙
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# CentOS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### 3. 配置SSL证书（如果有域名）
```bash
# 安装 Certbot
sudo apt install certbot nginx -y

# 配置 Nginx
sudo nano /etc/nginx/sites-available/proxyhub

# 添加以下内容：
server {
    listen 80;
    server_name yourdomain.com;
    
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

# 启用配置
sudo ln -s /etc/nginx/sites-available/proxyhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com
```

---

## 🐛 故障排查

### 问题1：无法访问网站

**检查防火墙：**
```bash
# 检查端口是否开放
sudo netstat -tlnp | grep 80
sudo netstat -tlnp | grep 3000

# 如果没有输出，说明端口未监听，检查Docker服务
docker-compose ps
```

### 问题2：服务启动失败

**查看详细错误：**
```bash
docker-compose logs backend | tail -50
```

**常见原因：**
- 配置错误（检查 .env 文件）
- 端口被占用（修改端口或停止占用进程）
- 内存不足（至少需要4GB）

### 问题3：数据库连接失败

```bash
# 检查数据库容器
docker-compose ps postgres

# 如果状态不正常，重启数据库
docker-compose restart postgres

# 查看数据库日志
docker-compose logs postgres
```

### 问题4：前端显示白屏

```bash
# 清除浏览器缓存
# Chrome: Ctrl+Shift+R 或 Ctrl+F5

# 检查前端日志
docker-compose logs frontend

# 重新构建前端
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

## 📞 获取帮助

如果遇到问题，请：

1. **查看日志**：`docker-compose logs -f`
2. **检查配置**：`cat .env`
3. **查看服务状态**：`docker-compose ps`
4. **联系支持**：提供日志信息和错误截图

---

## 📊 监控和维护

### 定期备份数据库
```bash
# 备份
docker exec proxyhub-postgres pg_dump -U postgres proxyhub > backup_$(date +%Y%m%d).sql

# 恢复
docker exec -i proxyhub-postgres psql -U postgres proxyhub < backup_20251111.sql
```

### 查看资源使用
```bash
# 查看CPU和内存使用
docker stats

# 查看磁盘使用
df -h
```

### 清理Docker空间
```bash
# 清理未使用的镜像和容器
docker system prune -a
```

---

## 🎉 恭喜！

您已成功将 ProxyHub 部署到腾讯云服务器！

**接下来可以：**
1. ✅ 添加用户、设置价格
2. ✅ 配置985Proxy API
3. ✅ 测试购买和续费功能
4. ✅ 邀请用户注册使用

**祝您生意兴隆！** 💰

---

**版本**: 1.0.0  
**更新日期**: 2025-11-11  
**支持**: GitHub Issues

