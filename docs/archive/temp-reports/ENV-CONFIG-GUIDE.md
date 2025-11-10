# 🔧 环境变量配置指南

## ❗ 重要：修复985Proxy API KEY无效问题

根据您提供的配置，请确保项目根目录的`.env`文件包含以下正确的985Proxy配置：

```bash
# 985Proxy API 配置
PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
PROXY_985_BASE_URL=https://open-api.985proxy.com
PROXY_985_ZONE=6jd4ftbl7kv3
```

## 📝 完整的.env文件示例

```bash
# ===== 数据库配置 =====
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=proxyhub
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=proxyhub_db

# ===== Redis配置 =====
REDIS_HOST=redis
REDIS_PORT=6379

# ===== JWT配置 =====
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_REFRESH_EXPIRY=7d

# ===== 后端配置 =====
PORT=3000
API_PREFIX=/api/v1

# ===== 985Proxy API配置 =====
PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
PROXY_985_BASE_URL=https://open-api.985proxy.com
PROXY_985_ZONE=6jd4ftbl7kv3

# ===== 邮件服务配置 =====
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=ProxyHub <noreply@proxyhub.com>

# ===== 前端配置 =====
VITE_API_BASE_URL=http://localhost:3000
```

## 🚀 应用配置更改

### 步骤1: 更新.env文件

1. 编辑项目根目录的`.env`文件
2. 确保`PROXY_985_API_KEY`和`PROXY_985_ZONE`的值正确
3. 保存文件

### 步骤2: 重新构建并启动Docker服务

在PowerShell中执行：

```powershell
# 停止所有服务
docker compose down

# 清理旧容器和镜像（可选，确保使用新配置）
docker compose down -v --remove-orphans

# 重新构建并启动（不使用缓存，确保所有更改生效）
docker compose build --no-cache
docker compose up -d

# 查看日志确认启动成功
docker compose logs -f backend
```

### 步骤3: 验证API KEY是否生效

等待服务启动完成（约30秒），然后查看日志：

```powershell
docker logs proxyhub-backend --tail 50 | Select-String "985"
```

**预期结果**：不应该再看到"The API KEY is invalid"错误。

## 🔍 故障排查

### 问题1: 仍然显示"API KEY is invalid"

**解决方案**：
1. 确认.env文件的编码为UTF-8（不是UTF-8 BOM）
2. 确认API KEY两端没有多余的空格或引号
3. 尝试完全删除并重新创建容器：
   ```powershell
   docker compose down -v --remove-orphans
   docker compose up -d --build
   ```

### 问题2: Docker没有读取到新的环境变量

**解决方案**：
检查docker-compose.yml中的environment配置，确保正确引用了.env变量：
```yaml
environment:
  PROXY_985_API_KEY: ${PROXY_985_API_KEY}
  PROXY_985_ZONE: ${PROXY_985_ZONE}
```

### 问题3: 本地开发环境需要不同的配置

**解决方案**：
- **Docker环境**：使用根目录的`.env`文件
- **本地开发**：使用`backend/.env`文件（可以设置不同的值）

## ✅ 验证所有功能

服务启动后，测试以下功能：

1. **仪表盘统计卡片** - 应该正常显示数据
2. **静态住宅IP管理** - 应该能获取IP池列表
3. **静态住宅购买** - 应该能看到国家/城市/价格
4. **专线代理** - 应该能看到业务场景选择器

## 📞 需要帮助？

如果配置后仍有问题，请提供：
1. `.env`文件的配置（隐藏敏感信息）
2. `docker logs proxyhub-backend --tail 100`的完整输出
3. 浏览器控制台的错误信息

---

**创建时间**: 2025-11-10
**最后更新**: 2025-11-10

