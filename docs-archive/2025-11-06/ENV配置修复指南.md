# 🔧 ENV配置修复指南

## 问题现象

✅ 前端路由修复完成
✅ Token自动刷新机制已添加
✅ 985Proxy API已集成
❌ **JWT Token过期时间仍然只有7秒**

## 原因

后端的 `backend/.env` 文件中缺少正确的JWT配置，或者配置值不正确。

## 📝 解决方案

### 步骤1：打开backend/.env文件

找到并打开 `D:\Users\Desktop\proxyhub\backend\.env` 文件

### 步骤2：添加/修改以下配置

确保文件中包含以下配置（如果不存在，请添加；如果存在但值不对，请修改）：

```env
# JWT配置
JWT_SECRET=proxyhub-super-secret-key-change-in-production-2025
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 邮件配置（主邮箱 - Outlook）
MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_USER=your_outlook_email@outlook.com
MAIL_PASSWORD=your_outlook_app_password
MAIL_FROM=your_outlook_email@outlook.com

# 邮件配置（备用邮箱 - Gmail）
MAIL_HOST_BACKUP=smtp.gmail.com
MAIL_PORT_BACKUP=587
MAIL_USER_BACKUP=chenyuqi061245@gmail.com
MAIL_PASSWORD_BACKUP=vvdgyeerdtycwxka
MAIL_FROM_BACKUP=ProxyHub <chenyuqi061245@gmail.com>

# 985Proxy API配置
PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
PROXY_985_BASE_URL=https://open-api.985proxy.com
PROXY_985_ZONE=your_zone_id_here

# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123
DATABASE_NAME=proxyhub

# 其他配置
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
USD_TO_CNY_RATE=7.2
TELEGRAM_LINK=https://t.me/lubei12
```

### 步骤3：保存文件

确保使用 `Ctrl+S` 保存文件

### 步骤4：重启后端服务

**重要：** 必须完全停止后端并重新启动，才能读取新的环境变量。

**方法1：** 在后端终端按 `Ctrl+C` 停止，然后运行：
```bash
cd backend
npm run start:dev
```

**方法2：** 使用启动脚本：
```bash
.\启动ProxyHub.bat
```

### 步骤5：验证配置

重启后端后，在后端日志中查找：
```
ProxyHub Backend Started!
```

确认没有JWT相关的错误。

## 📋 验证清单

重启后端后，请测试：

- [ ] 登录后token有效期为2小时（不再是7秒）
- [ ] 切换页面不会自动跳转到登录页
- [ ] 管理员可以访问 `/admin/dashboard`
- [ ] 普通用户可以访问所有用户路由

---

## 🚀 已完成的修复

### ✅ 前端修复

1. **路由守卫优化**
   - 统一localStorage key为 `user`（清理旧的 `userInfo`）
   - 改进token和用户信息验证逻辑
   - 修复管理员重定向问题

2. **Token自动刷新**
   - 在request.ts中添加401拦截器
   - 自动使用refresh_token刷新access_token
   - 请求队列机制，避免并发刷新

3. **用户Store增强**
   - 添加 `setUser()` 和 `setToken()` 方法
   - 统一验证码登录和密码登录的localStorage使用

### ✅ 后端修复

1. **985Proxy API集成**
   - 静态代理购买已对接真实API
   - 支持购买premium和shared两种类型
   - API失败时自动fallback到mock数据（便于开发测试）

2. **JWT配置修复**
   - ENV模板已更新（JWT_ACCESS_EXPIRY → JWT_EXPIRES_IN）
   - 需要在实际.env文件中应用配置

---

## 🎯 下一步

配置完成后，用户可以：

1. 正常使用所有功能，不会频繁登出
2. 购买静态代理时会调用真实的985Proxy API
3. 享受自动token刷新，更流畅的用户体验

**如需帮助，请查看 `docs/ENV_TEMPLATE.txt` 获取完整的环境变量模板。**

