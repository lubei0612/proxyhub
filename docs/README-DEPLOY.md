# 🚀 ProxyHub 快速部署指南

> **一键部署到生产环境 - 5分钟完成！**

---

## 📦 **方法一：GitHub + 自动化脚本（推荐）**

### **本地推送代码**

```bash
# 1. 提交所有更改
git add .
git commit -m "feat: 准备部署"

# 2. 推送到GitHub
git push origin main
```

### **服务器拉取部署**

```bash
# 1. 克隆项目（首次）
git clone https://github.com/YOUR_USERNAME/proxyhub.git /opt/proxyhub
cd /opt/proxyhub

# 或更新代码（后续）
cd /opt/proxyhub
git pull origin main

# 2. 配置环境（交互式向导）
chmod +x setup-env.sh
./setup-env.sh

# 3. 一键部署
chmod +x deploy.sh
./deploy.sh
```

✅ **完成！** 访问 `http://your-server-ip:8080`

---

## 🔧 **方法二：手动Docker部署**

```bash
# 1. 进入项目目录
cd /opt/proxyhub

# 2. 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 3. 启动服务
docker-compose -f docker-compose.cn.yml up -d --build
```

---

## 🔑 **关键配置项**

在`.env`文件中，必须配置：

```env
# 985Proxy配置（必须）
PROXY_985_API_KEY=ne_xxxxx
PROXY_985_ZONE=xxxxx

# 数据库密码（自动生成或自定义）
DATABASE_PASSWORD=your_secure_password

# JWT密钥（自动生成）
JWT_SECRET=your_jwt_secret

# 邮件配置（推荐）
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# 前端域名
FRONTEND_URL=https://your-domain.com
```

---

## 📋 **部署检查清单**

- ✅ Docker和Docker Compose已安装
- ✅ 防火墙开放80、443端口
- ✅ 985Proxy账户已充值
- ✅ .env文件配置完成
- ✅ 所有容器状态为`Up`

---

## 🔍 **验证部署**

```bash
# 检查容器状态
docker-compose -f docker-compose.cn.yml ps

# 查看日志
docker logs -f proxyhub-backend

# 测试API
curl http://localhost:3000/api/v1/health
```

---

## 📚 **详细文档**

查看 [DEPLOY.md](./DEPLOY.md) 获取完整部署指南，包括：
- 域名配置和HTTPS
- Nginx反向代理
- 数据库备份
- 监控和日志管理
- 常见问题排查

---

## 🆘 **遇到问题？**

1. 检查日志：`docker logs proxyhub-backend`
2. 查看文档：[DEPLOY.md](./DEPLOY.md)
3. 验证配置：检查`.env`文件

---

**默认管理员账户**（首次登录）：
- 邮箱：`admin@example.com`
- 密码：见`.env`中的`ADMIN_PASSWORD`

⚠️ **登录后请立即修改密码！**

