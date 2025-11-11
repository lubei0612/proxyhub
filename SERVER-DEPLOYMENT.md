# 🚀 ProxyHub 服务器部署 - 完整指南

## 服务器信息
- **IP地址**: 43.130.35.117
- **系统**: Debian/Ubuntu
- **要求**: Docker + Docker Compose已安装

---

## 📝 部署前准备

### 1. 本地配置您的密钥信息

创建一个本地文件 `my-config.txt` 保存您的配置：

```bash
# 985Proxy配置
PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
PROXY_985_ZONE=6jd4ftbl7kv3

# 邮箱配置
MAIL_USER=RobinsonKevin5468@outlook.com
MAIL_PASSWORD=ugfqftyq60695

# 备用邮箱
MAIL_USER_BACKUP=chenyuqi061245@gmail.com
MAIL_PASSWORD_BACKUP=vvdgyeerdtycwxka
```

---

## 🎯 一键部署（推荐）

### Step 1: SSH登录服务器

```bash
ssh root@43.130.35.117
```

### Step 2: 执行一键部署脚本

```bash
bash <(curl -s https://raw.githubusercontent.com/lubei0612/proxyhub/master/scripts/deploy-production.sh)
```

### Step 3: 根据提示配置

脚本会提示您编辑`.env`文件。按照本地保存的`my-config.txt`填入配置信息。

```bash
# 当提示"配置完成后按回车继续..."时
nano .env

# 填入您的配置（从my-config.txt复制）
# 保存并退出: Ctrl+X -> Y -> Enter
```

### Step 4: 等待部署完成

脚本会自动：
- ✅ 生成安全密码（数据库、JWT）
- ✅ 构建Docker镜像
- ✅ 启动所有服务
- ✅ 配置自动备份（每天凌晨2点）
- ✅ 创建管理员账号

### Step 5: 保存管理员密码

部署完成后，屏幕会显示：
```
管理员账号:
  邮箱: admin@proxyhub.com
  密码: <随机生成的安全密码>
```

**⚠️ 请立即保存这个密码！**

---

## ✅ 验证部署

### 1. 检查服务状态

```bash
cd ~/proxyhub
docker-compose ps
```

应该看到所有服务状态为 `Up` 和 `healthy`：
```
NAME                STATUS                   PORTS
proxyhub-backend    Up (healthy)            0.0.0.0:3000->3000/tcp
proxyhub-frontend   Up (healthy)            0.0.0.0:80->80/tcp
proxyhub-postgres   Up (healthy)            127.0.0.1:5432->5432/tcp
proxyhub-redis      Up (healthy)            127.0.0.1:6379->6379/tcp
```

### 2. 测试访问

打开浏览器访问: **http://43.130.35.117**

### 3. 登录测试

使用部署时输出的管理员账号登录，立即修改密码。

---

## 📊 常用管理命令

```bash
# 进入项目目录
cd ~/proxyhub

# 查看实时日志
docker-compose logs -f backend

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 启动服务
docker-compose up -d

# 手动备份数据库
bash scripts/db-backup.sh

# 查看备份文件
ls -lh /var/backups/proxyhub/
```

---

## 🔐 安全配置（部署后）

### 1. 修改管理员密码

登录系统后：
1. 点击右上角用户名
2. 选择"我的账户"
3. 修改密码

### 2. 配置SSL证书（可选但推荐）

```bash
# 安装Certbot
apt update
apt install certbot nginx

# 获取证书（需要域名）
certbot --nginx -d your-domain.com

# 证书会自动续期
```

### 3. 配置防火墙

```bash
# 安装UFW
apt install ufw

# 允许SSH、HTTP、HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# 启用防火墙
ufw enable

# 查看状态
ufw status
```

---

## 💾 备份管理

### 自动备份
已配置每天凌晨2点自动备份，保留最近7天。

### 查看备份

```bash
# 查看备份文件
ls -lh /var/backups/proxyhub/

# 查看备份日志
tail -f /var/log/proxyhub-backup.log
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

---

## 🔄 更新应用

### 方式一：自动更新（GitHub Actions）

推送代码到GitHub master分支后，会自动部署。

### 方式二：手动更新

```bash
cd ~/proxyhub
git pull origin master
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🐛 故障排除

### 问题1: 容器无法启动

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs postgres

# 重建容器
docker-compose down -v
docker-compose up -d
```

### 问题2: 前端白屏/404

```bash
# 重建前端容器
docker-compose down frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### 问题3: 数据库连接失败

```bash
# 检查数据库
docker-compose exec postgres psql -U postgres -d proxyhub

# 如果失败，检查.env中的DATABASE_PASSWORD
```

### 问题4: 内存不足

```bash
# 清理Docker缓存
docker system prune -a --volumes

# 查看资源使用
docker stats
```

---

## 📞 获取帮助

- **文档**: https://github.com/lubei0612/proxyhub/tree/master/docs
- **问题反馈**: https://github.com/lubei0612/proxyhub/issues

---

## ✅ 部署检查清单

部署完成后，请确认：

- [ ] 所有服务状态为 `healthy`
- [ ] 可以访问前端页面
- [ ] 管理员可以正常登录
- [ ] 已保存管理员密码
- [ ] 已修改管理员密码
- [ ] 备份任务已配置
- [ ] 防火墙已配置
- [ ] (可选) SSL证书已配置

---

**🎉 恭喜！您的ProxyHub已成功部署！**

访问地址: http://43.130.35.117

