# 腾讯云Docker生产环境部署指令
**日期**: 2025-11-08  
**版本**: v1.2（Bug修复版）

---

## 📋 部署步骤

### 第一步：SSH连接腾讯云

```bash
# 使用您的腾讯云SSH连接（替换为您的实际信息）
ssh root@your-server-ip
```

---

### 第二步：进入项目目录并拉取最新代码

```bash
# 进入项目目录
cd /opt/proxyhub

# 查看当前分支和状态
git status

# 拉取最新代码
git pull origin master

# 确认拉取成功
git log -1
```

**预期输出**: 应该看到最新的commit `fix: 修复所有Bug并完成全面检查`

---

### 第三步：检查并配置环境变量

```bash
# 检查.env文件是否存在
ls -la .env

# 如果.env文件不存在，创建它
cat > .env << 'EOF'
# ============================================
# ProxyHub 生产环境配置文件
# ============================================

# 1. 数据库配置
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123
DATABASE_NAME=proxyhub
DATABASE_SYNC=false

# 2. Redis配置
REDIS_HOST=redis
REDIS_PORT=6379

# 3. JWT认证配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-long-random-string
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d

# 4. 服务端口配置
PORT=3000
API_PREFIX=/api/v1

# 5. 985Proxy API配置 ⭐ 重要
PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
PROXY_985_BASE_URL=https://open-api.985proxy.com
PROXY_985_ZONE=6jd4ftbl7kv3
PROXY_985_TEST_MODE=false

# 6. 邮件服务配置 (主邮箱 Outlook)
MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_USER=RobinsonKevin5468@outlook.com
MAIL_PASSWORD=ugfqftyq60695
MAIL_FROM=ProxyHub <noreply@proxyhub.com>

# 7. 邮件服务配置备份 (Gmail)
MAIL_HOST_BACKUP=smtp.gmail.com
MAIL_PORT_BACKUP=587
MAIL_USER_BACKUP=chenyuqi061245@gmail.com
MAIL_PASSWORD_BACKUP=vvdgyeerdtycwxka

# 8. Telegram Bot配置
TELEGRAM_BOT_TOKEN=8578437524:AAE66OfSvFJmma7va8lhaeNK70Q1Sj_HaNo
TELEGRAM_BOT_USERNAME=ProxyHub_Notify_Bot

# 9. 系统环境配置
NODE_ENV=production
LOG_LEVEL=info
FRONTEND_URL=http://localhost:8080
EOF

# 确认.env文件创建成功
cat .env
```

---

### 第四步：停止当前运行的容器

```bash
# 停止并删除所有容器
docker compose -f docker-compose.cn.yml down

# 确认所有容器已停止
docker ps -a | grep proxyhub
```

**预期输出**: 应该看不到任何proxyhub相关的容器

---

### 第五步：清理旧镜像（可选但推荐）

```bash
# 删除旧的Docker镜像
docker rmi proxyhub-frontend proxyhub-backend

# 清理悬挂镜像
docker image prune -f
```

---

### 第六步：重新构建并启动服务

```bash
# 重新构建所有服务（强制重新构建，不使用缓存）
docker compose -f docker-compose.cn.yml build --no-cache

# 启动所有服务
docker compose -f docker-compose.cn.yml up -d

# 查看容器启动状态
docker compose -f docker-compose.cn.yml ps
```

**预期输出**: 应该看到4个容器（frontend, backend, postgres, redis）

---

### 第七步：检查容器健康状态

```bash
# 等待30秒让容器完全启动
sleep 30

# 查看容器状态（应该都是healthy）
docker ps --format "table {{.Names}}\t{{.Status}}"

# 查看后端日志（确认无错误）
docker logs --tail 100 proxyhub-backend

# 查看前端日志
docker logs --tail 50 proxyhub-frontend
```

---

### 第八步：测试服务可用性

```bash
# 测试后端健康检查
curl http://localhost:3000/api/v1/health

# 测试前端页面
curl -I http://localhost:8080

# 测试数据库连接
docker exec proxyhub-backend node -e "console.log('Backend is running')"
```

**预期输出**: 
- 后端健康检查应返回JSON
- 前端应返回200状态码
- 数据库连接成功

---

### 第九步：验证功能

```bash
# 检查985Proxy API配置
docker exec proxyhub-backend printenv | grep PROXY_985

# 检查Telegram客服链接配置
docker exec proxyhub-postgres psql -U postgres -d proxyhub -c "SELECT * FROM settings WHERE key LIKE '%telegram%';"
```

---

### 第十步：配置防火墙（如未配置）

```bash
# 开放8080端口（前端）
ufw allow 8080

# 开放3000端口（后端API，可选）
ufw allow 3000

# 查看防火墙状态
ufw status
```

---

## 🔍 故障排查

### 如果容器启动失败

```bash
# 查看详细错误日志
docker compose -f docker-compose.cn.yml logs

# 查看特定容器日志
docker logs proxyhub-backend --tail 200
docker logs proxyhub-frontend --tail 200
```

### 如果前端构建失败

```bash
# 进入前端容器检查
docker exec -it proxyhub-frontend sh
ls -la /usr/share/nginx/html/

# 重新构建前端
docker compose -f docker-compose.cn.yml build --no-cache frontend
docker compose -f docker-compose.cn.yml up -d frontend
```

### 如果后端无法连接数据库

```bash
# 检查数据库容器状态
docker logs proxyhub-postgres

# 进入数据库检查
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub -c "\dt"

# 检查网络连接
docker exec proxyhub-backend ping -c 3 postgres
```

---

## ✅ 验证部署成功

### 1. 访问前端
打开浏览器访问: `http://您的服务器IP:8080`

### 2. 测试登录
- 用户名: `admin@example.com`
- 密码: `admin123`

### 3. 检查核心功能
- ✅ 静态IP购买页面显示真实985Proxy库存
- ✅ Telegram客服链接显示 `@leyiproxy`
- ✅ 账单明细菜单导航正常
- ✅ 管理后台所有功能正常

---

## 📊 部署后监控

```bash
# 查看容器资源占用
docker stats

# 实时查看后端日志
docker logs -f proxyhub-backend

# 查看数据库连接数
docker exec proxyhub-postgres psql -U postgres -d proxyhub -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 🔄 快速重启命令

```bash
# 快速重启所有服务
cd /opt/proxyhub && docker compose -f docker-compose.cn.yml restart

# 只重启后端
docker compose -f docker-compose.cn.yml restart backend

# 只重启前端
docker compose -f docker-compose.cn.yml restart frontend
```

---

## 📝 本次更新内容

### Bug修复
- ✅ 修复账单明细菜单路由错误
- ✅ 修复Telegram客服链接硬编码
- ✅ 移除所有mock数据，确保数据真实性

### 功能验证
- ✅ 所有26个路由配置正确
- ✅ 985Proxy API集成正常
- ✅ 静态IP购买流程完整

### 文档更新
- 📄 完整Bug检查报告
- 📄 路由配置验证报告
- 📄 Telegram客服链接修复报告

---

## 🆘 紧急回滚

如果部署出现严重问题，可以回滚到上一个版本：

```bash
cd /opt/proxyhub
git log --oneline -5
git checkout 4a44f34  # 回滚到上一个稳定版本
docker compose -f docker-compose.cn.yml down
docker compose -f docker-compose.cn.yml up -d --build
```

---

**部署文档生成时间**: 2025-11-08  
**部署负责人**: AI Assistant  
**支持联系**: Telegram @leyiproxy






