# Docker部署检查清单

## ✅ 当前Docker配置状态

### 已有配置文件
1. ✅ `docker-compose.yml` - 存在且配置完整
2. ✅ `backend/Dockerfile` - 存在且配置正确
3. ✅ `frontend/Dockerfile` - 存在且配置正确
4. ⚠️ `frontend/nginx.prod.conf` - 需要检查
5. ⚠️ `.env` - 需要从`.env.example`复制并配置

---

## 📋 Docker配置分析

### docker-compose.yml
**状态**: ✅ 配置完整

**包含服务**:
- `postgres` - PostgreSQL数据库
- `redis` - Redis缓存
- `backend` - NestJS后端API
- `frontend` - Vue3前端 + Nginx

**健康检查**: ✅ 所有服务都有healthcheck

**网络**: ✅ 使用自定义网络 `proxyhub-network`

**卷**: ✅ 数据持久化配置正确
- `postgres_data`
- `redis_data`

---

### 后端Dockerfile
**状态**: ✅ 配置正确

**多阶段构建**: ✅
- Stage 1: 构建应用
- Stage 2: 生产镜像

**优化项**:
- ✅ 使用alpine镜像（体积小）
- ✅ 只安装生产依赖
- ✅ 清理npm缓存
- ✅ 安装wget用于健康检查

---

### 前端Dockerfile
**状态**: ✅ 配置正确

**多阶段构建**: ✅
- Stage 1: 构建Vue应用
- Stage 2: Nginx服务器

**优化项**:
- ✅ 使用nginx:alpine
- ✅ 自定义nginx配置
- ⚠️ 需要确认nginx.prod.conf存在

---

## 🔧 需要完成的配置

### 1. 邮件服务配置（通知系统）
**添加到docker-compose.yml backend环境变量**:
```yaml
MAIL_HOST: ${MAIL_HOST:-smtp.gmail.com}
MAIL_PORT: ${MAIL_PORT:-587}
MAIL_USER: ${MAIL_USER}
MAIL_PASSWORD: ${MAIL_PASSWORD}
MAIL_FROM: ${MAIL_FROM:-ProxyHub <noreply@proxyhub.com>}
```

### 2. Telegram Bot配置（通知系统）
**添加到docker-compose.yml backend环境变量**:
```yaml
TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
TELEGRAM_BOT_USERNAME: ${TELEGRAM_BOT_USERNAME:-ProxyHubBot}
```

### 3. 环境变量文件
**创建`.env`文件** (从`.env.example`复制):
```env
# 数据库配置
DATABASE_NAME=proxyhub
DATABASE_USER=postgres
DATABASE_PASSWORD=your-strong-password-here

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_ACCESS_EXPIRY=2h
JWT_REFRESH_EXPIRY=7d

# 985Proxy配置
PROXY_985_API_KEY=your-985proxy-api-key
PROXY_985_BASE_URL=https://open-api.985proxy.com
PROXY_985_ZONE=your-zone-name

# 邮件配置（新增）
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=ProxyHub <noreply@proxyhub.com>

# Telegram配置（新增）
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=ProxyHubBot
```

---

## 🚀 部署步骤

### 1. 准备环境
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑.env文件，填写真实配置
nano .env
```

### 2. 构建镜像
```bash
# 构建所有服务
docker-compose build

# 或单独构建
docker-compose build backend
docker-compose build frontend
```

### 3. 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. 数据库迁移
```bash
# 进入后端容器
docker-compose exec backend sh

# 运行迁移
npm run migration:run

# 退出容器
exit
```

### 5. 健康检查
```bash
# 检查所有服务状态
docker-compose ps

# 测试后端健康检查
curl http://localhost:3000/api/v1/health

# 测试前端
curl http://localhost
```

---

## 🔍 常见问题和解决方案

### 问题1: 后端无法连接数据库
**原因**: 数据库未就绪  
**解决**: 
- 检查`depends_on`配置
- 查看postgres健康检查状态
- 增加backend的`start_period`

### 问题2: 前端API请求失败
**原因**: API地址配置错误  
**解决**:
- 检查`VITE_API_BASE_URL`环境变量
- 确认backend服务正常运行
- 检查nginx反向代理配置

### 问题3: 邮件发送失败
**原因**: Gmail安全设置  
**解决**:
- 使用Google App Password而非账户密码
- 启用"不太安全的应用"访问
- 或使用SendGrid等专业SMTP服务

### 问题4: Telegram Bot无响应
**原因**: Token错误或网络问题  
**解决**:
- 验证Bot Token正确性
- 检查防火墙设置
- 确认Bot已启动（查看日志）

---

## 📝 生产环境建议

### 1. 安全配置
```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      NODE_ENV: production
      # 强制使用强密码
      DATABASE_PASSWORD: ${DATABASE_PASSWORD:?Database password is required}
      JWT_SECRET: ${JWT_SECRET:?JWT secret is required}
    # 限制资源使用
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 2. 日志管理
```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 3. 反向代理（Nginx）
```nginx
# 添加SSL支持
server {
    listen 443 ssl http2;
    server_name api.proxyhub.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 备份策略
```bash
# 数据库备份脚本
#!/bin/bash
docker-compose exec -T postgres pg_dump -U postgres proxyhub > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## ✅ 部署前检查清单

- [ ] `.env`文件配置完整
- [ ] 数据库密码已修改
- [ ] JWT_SECRET已设置为强密钥
- [ ] 985Proxy API Key已配置
- [ ] 邮件SMTP配置正确
- [ ] Telegram Bot Token已获取
- [ ] nginx.prod.conf存在且正确
- [ ] 所有Dockerfile构建成功
- [ ] docker-compose.yml无语法错误
- [ ] 健康检查配置正确
- [ ] 日志配置合理
- [ ] 数据卷持久化配置
- [ ] 网络配置正确
- [ ] 防火墙规则配置（80, 443, 3000端口）
- [ ] SSL证书准备（生产环境）

---

## 🎯 下一步行动

1. ✅ 检查nginx.prod.conf文件
2. ✅ 更新docker-compose.yml（添加邮件和Telegram配置）
3. ✅ 创建.env.production.example模板
4. ✅ 测试Docker构建
5. ✅ 测试Docker部署
6. ✅ 文档更新

---

**创建时间**: 2025-11-04  
**负责人**: AI Assistant  
**状态**: ⚠️ 待完善邮件和Telegram配置


