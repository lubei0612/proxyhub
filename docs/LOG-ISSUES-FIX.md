# 日志问题修复指南

## 问题概览

根据服务器日志分析，发现以下需要修复的问题：

### 1. 🔴 健康检查端点404错误（已修复）
**问题**：Docker healthcheck 每30秒访问 `/api/v1/health` 端点返回404
**影响**：容器健康检查失败，可能导致服务被重启
**修复状态**：✅ 已创建健康检查端点

### 2. 🔴 985Proxy API KEY无效（需要配置）
**问题**：`The API KEY is invalid or does not exist`
**影响**：无法获取代理IP库存和相关信息
**修复方法**：见下方配置步骤

### 3. ⚠️ 安全：外部攻击尝试
**问题**：检测到PHPUnit漏洞利用尝试
**状态**：✅ 已被正确拦截（返回404）

---

## 修复步骤

### 步骤1：更新代码并重新构建

```bash
# 1. 拉取最新代码（或确保包含健康检查模块）
cd /path/to/proxyhub

# 2. 重新构建后端服务
docker-compose build backend

# 3. 重启服务
docker-compose down
docker-compose up -d
```

### 步骤2：配置985Proxy API KEY

```bash
# 1. 编辑环境变量文件
nano .env  # 或 vim .env

# 2. 找到并填写以下配置
PROXY_985_API_KEY=your_actual_api_key_here
PROXY_985_ZONE=your_zone_here
PROXY_985_BASE_URL=https://open-api.985proxy.com

# 3. 保存并退出

# 4. 重启后端服务以应用新配置
docker-compose restart backend
```

### 步骤3：验证配置

使用提供的检查脚本验证环境变量配置：

```bash
# 在后端目录运行
cd backend
node scripts/check-env-config.js
```

**期望输出**：
```
========================================
  环境变量配置检查
========================================

✓ DATABASE_HOST: postgres
✓ DATABASE_PORT: 5432
✓ DATABASE_USER: postgres
✓ DATABASE_PASSWORD: ***
✓ DATABASE_NAME: proxyhub
✓ REDIS_HOST: redis
✓ REDIS_PORT: 6379
✓ JWT_SECRET: ***
✓ PROXY_985_API_KEY: ***
✓ PROXY_985_ZONE: your_zone

========================================
✓ 所有配置检查通过！
```

### 步骤4：测试健康检查端点

```bash
# 方法1：使用curl测试
curl -I http://localhost:3000/api/v1/health

# 方法2：使用wget测试（与Docker healthcheck相同）
wget --spider http://localhost:3000/api/v1/health

# 期望响应：200 OK
```

### 步骤5：查看日志确认问题已解决

```bash
# 查看最新日志
docker logs -f proxyhub-backend --tail 100

# 应该看到：
# - 不再有 /api/v1/health 404错误
# - 不再有 "The API KEY is invalid" 错误
# - 可以看到正常的业务日志
```

---

## 如何获取985Proxy API KEY

如果你还没有 985Proxy API KEY：

1. 访问 [985Proxy官网](https://www.985proxy.com/)
2. 注册账号
3. 在控制台找到 API Key
4. 复制 API Key 和 Zone 信息到 .env 文件

---

## 常见问题排查

### Q1: 修复后仍然看到404错误？
**A**: 确保已经重新构建并重启了容器：
```bash
docker-compose build backend
docker-compose down
docker-compose up -d
```

### Q2: API KEY配置后仍然报错？
**A**: 检查以下几点：
- API KEY 是否正确复制（无多余空格）
- 985Proxy 账户是否有足够余额
- Zone 配置是否正确
- 重启后端服务使配置生效

### Q3: 如何临时禁用健康检查？
**A**: 编辑 `docker-compose.yml`，注释掉 backend 服务的 healthcheck 部分：
```yaml
# healthcheck:
#   test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/v1/health"]
```

---

## 监控建议

修复后建议持续监控以下指标：

```bash
# 1. 每小时查看一次日志
watch -n 3600 'docker logs proxyhub-backend --tail 50'

# 2. 检查容器健康状态
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 3. 监控API调用成功率
# 可以在日志中统计ERROR和WARN的数量
docker logs proxyhub-backend 2>&1 | grep -c "ERROR"
```

---

## 相关文件

- 健康检查控制器: `backend/src/modules/health/health.controller.ts`
- 环境配置检查脚本: `backend/scripts/check-env-config.js`
- Docker配置: `docker-compose.yml`
- 环境变量示例: `env.example`
