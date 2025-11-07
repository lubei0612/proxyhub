# 🚀 ProxyHub 部署指南（使用环境变量模板）

## 📋 更新说明

现在环境变量配置已经内置到Docker镜像中，不需要手动创建 `.env` 文件！

### ✅ 改进点

1. **后端配置**：`backend/env.production.template` → 构建时自动复制为 `/app/.env`
2. **前端配置**：`frontend/env.production.template` → 构建时注入环境变量
3. **简化部署**：无需手动配置环境变量，直接构建即可

---

## 🔧 部署步骤

### 步骤 1：提交代码到 GitHub

```bash
# 在本地（Windows）
git add .
git commit -m "feat: add embedded production config for Docker deployment"
git push origin master
```

### 步骤 2：在腾讯云拉取最新代码

```bash
# SSH 到腾讯云
ssh root@43.130.35.117

# 进入项目目录
cd /opt/proxyhub

# 拉取最新代码
git pull origin master
```

### 步骤 3：停止旧服务并清理

```bash
# 停止并删除所有容器
docker compose -f docker-compose.cn.yml down

# 删除旧镜像（强制重新构建）
docker rmi proxyhub-backend proxyhub-frontend 2>/dev/null || true

# 清理数据库数据卷（如果需要重新初始化）
docker volume rm proxyhub_postgres_data 2>/dev/null || true

# 清理构建缓存
docker builder prune -f
```

### 步骤 4：重新构建并启动

```bash
# 构建镜像（使用 --no-cache 确保使用最新配置）
docker compose -f docker-compose.cn.yml build --no-cache

# 启动所有服务
docker compose -f docker-compose.cn.yml up -d

# 查看启动日志（关注后端初始化过程）
docker compose -f docker-compose.cn.yml logs -f backend
```

### 步骤 5：验证部署

```bash
# 1. 检查容器状态
docker compose -f docker-compose.cn.yml ps

# 2. 检查后端初始化日志
docker compose -f docker-compose.cn.yml logs backend | grep "初始化完成"

# 3. 测试API
curl http://localhost:3000/api/v1/auth/login

# 4. 测试前端
curl http://localhost
```

---

## 🔍 配置文件说明

### 后端环境变量：`backend/env.production.template`

```env
# 关键配置项：
DATABASE_HOST=postgres          # Docker内部服务名
REDIS_HOST=redis               # Docker内部服务名
PROXY_985_API_KEY=ne_hj06...   # 你的985Proxy API密钥
PROXY_985_ZONE=6jd4ftbl7kv3    # 你的Zone ID
MAIL_HOST=smtp.office365.com   # 邮件服务器
TELEGRAM_BOT_TOKEN=8578437...  # Telegram Bot Token
FRONTEND_URL=http://43.130.35.117  # 服务器公网IP
```

### 前端环境变量：`frontend/env.production.template`

```env
# 使用相对路径，通过nginx代理转发到后端
VITE_API_BASE_URL=/api/v1
```

### 构建流程

1. **后端构建时**：
   - Dockerfile.cn 复制 `env.production.template` 到 `/app/.env`
   - NestJS 应用启动时自动加载 `.env` 文件

2. **前端构建时**：
   - Dockerfile.cn 将环境变量注入到 Vite 构建过程
   - 生成的 JS 文件包含编译后的 API 地址

---

## ✅ 预期结果

### 容器状态

```bash
$ docker compose -f docker-compose.cn.yml ps

NAME                  IMAGE                 STATUS        PORTS
proxyhub-backend      proxyhub-backend      Up (healthy)  0.0.0.0:3000->3000/tcp
proxyhub-frontend     proxyhub-frontend     Up            0.0.0.0:80->80/tcp
proxyhub-postgres     postgres:15-alpine    Up (healthy)  0.0.0.0:5432->5432/tcp
proxyhub-redis        redis:7-alpine        Up (healthy)  0.0.0.0:6379->6379/tcp
```

### 后端启动日志

```
=========================================
🚀 ProxyHub Backend 启动中...
=========================================
⏳ 等待数据库就绪...
✅ 数据库已就绪

📊 初始化数据库...
✅ 管理员账号: admin@example.com / admin123
✅ 测试用户: alice@test.com / password123
🎉 数据库初始化完成！

[Nest] Nest application successfully started

========================================
  ProxyHub Backend Started!
========================================
  API Server: http://localhost:3000/api/v1
  Environment: production
========================================
```

### 浏览器访问

访问 `http://43.130.35.117`，应该看到：
- ✅ 登录页面正常显示
- ✅ 无白屏或JS错误
- ✅ 控制台无报错

---

## 🔄 更新配置

### 如果需要修改配置

1. **修改模板文件**：
   ```bash
   # 本地修改
   backend/env.production.template
   frontend/env.production.template
   ```

2. **提交并重新部署**：
   ```bash
   git add .
   git commit -m "update: production config"
   git push origin master
   
   # 腾讯云
   cd /opt/proxyhub
   git pull
   docker compose -f docker-compose.cn.yml down
   docker compose -f docker-compose.cn.yml build --no-cache
   docker compose -f docker-compose.cn.yml up -d
   ```

---

## 🐛 故障排查

### 问题 1：后端启动失败

```bash
# 查看详细日志
docker compose -f docker-compose.cn.yml logs backend --tail 100

# 常见原因：
# - 数据库连接失败 → 检查 DATABASE_HOST=postgres
# - 985Proxy API密钥错误 → 检查 env.production.template
```

### 问题 2：前端白屏

```bash
# 查看前端日志
docker compose -f docker-compose.cn.yml logs frontend

# 检查浏览器控制台
# 如果看到 404 错误，可能是 nginx 配置问题
docker exec proxyhub-frontend cat /etc/nginx/conf.d/default.conf
```

### 问题 3：API调用失败

```bash
# 测试nginx代理
docker exec proxyhub-frontend wget -O- http://backend:3000/api/v1/auth/login

# 应该返回 401 Unauthorized（说明API正常，只是需要登录）
```

---

## 📊 配置优势

### 之前的方式（需要手动创建 .env）

```bash
# 需要在服务器手动创建
cd /opt/proxyhub
cat > .env << EOF
DATABASE_HOST=postgres
DATABASE_PORT=5432
...
EOF

# 容易出错，配置不一致
```

### 现在的方式（自动内置）

```bash
# 只需要拉取代码和构建
git pull
docker compose -f docker-compose.cn.yml build --no-cache
docker compose -f docker-compose.cn.yml up -d

# 配置自动注入，保证一致性
```

---

## 🎉 完成！

现在你可以：
1. ✅ 在本地修改配置文件
2. ✅ 提交到 GitHub
3. ✅ 在服务器拉取并重新构建
4. ✅ 配置自动生效

**不再需要手动在服务器上配置环境变量！**

---

**最后更新**: 2025-11-06  
**作者**: AI Assistant

