# Telegram Bot 配置指南

**更新时间：** 2025-11-05  
**状态：** ⏳ 等待用户配置.env文件

---

## 📋 配置步骤

### 1. 编辑 `.env` 文件

**文件位置：** `backend/.env`

**添加以下配置：**
```env
# Telegram Bot配置
TELEGRAM_BOT_TOKEN=8578437524:AAE66OfSvFJmma7va8lhaeNK70Q1Sj_HaNo
TELEGRAM_BOT_USERNAME=your_bot_username
```

**注意：** 请将 `your_bot_username` 替换为您的Bot实际用户名（不需要@符号）

### 2. 获取Bot用户名

如果不知道Bot用户名：
1. 打开Telegram，搜索 `@BotFather`
2. 发送命令：`/mybots`
3. 选择您的Bot
4. 查看Bot用户名（例如：`ProxyHubBot`）

### 3. 完整的 `.env` 配置示例

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=proxyhub

# JWT配置
JWT_SECRET=your-secret-key-change-in-production-very-important-secret-key-2024
JWT_EXPIRES_IN=7200

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# 邮件服务配置（Gmail）
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=chenyuqi061245@gmail.com
MAIL_PASSWORD=wvdg yeer dtyc wxka
MAIL_FROM=ProxyHub <chenyuqi061245@gmail.com>

# Telegram Bot配置
TELEGRAM_BOT_TOKEN=8578437524:AAE66OfSvFJmma7va8lhaeNK70Q1Sj_HaNo
TELEGRAM_BOT_USERNAME=your_bot_username

# 应用配置
PORT=3000
NODE_ENV=development
```

### 4. 重启后端服务

**方法1: 使用重启脚本（推荐）**
```bash
双击运行: 重启所有服务.bat
```

**方法2: 手动重启**
```bash
# 1. 终止端口3000进程
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F

# 2. 启动后端
cd backend
npm run start:dev
```

### 5. 验证配置成功

重启后，查看后端终端输出：

**✅ 成功：**
```
[Nest] LOG [TelegramService] Telegram Bot initialized successfully: @YourBotName
```

**❌ 失败：**
```
[Nest] WARN [TelegramService] Telegram Bot未配置，将跳过Bot初始化
```

---

## 📱 用户绑定流程

### 在ProxyHub系统中

1. 登录账号
2. 进入"账户中心" → "通知管理"
3. 点击"绑定Telegram"按钮
4. 系统生成6位绑定码（如：`ABC123`）
5. 记住这个绑定码

### 在Telegram中

1. 搜索您的Bot（使用Bot用户名）
2. 点击"Start"按钮（首次使用）
3. 发送命令：`/bind ABC123`（替换为实际绑定码）
4. 收到绑定成功消息

### 绑定成功标志

- ✅ ProxyHub页面显示"Telegram已绑定"
- ✅ 显示绑定的Telegram用户名
- ✅ 可以点击"解绑"按钮

---

## 🔔 Bot 命令列表

| 命令 | 功能 | 示例 | 说明 |
|------|------|------|------|
| `/start` | 启动Bot | `/start` | 首次使用必须执行 |
| `/bind <code>` | 绑定账户 | `/bind ABC123` | 需要先在网站获取绑定码 |
| `/unbind` | 解绑账户 | `/unbind` | 停止接收通知 |
| `/balance` | 查询余额 | `/balance` | 显示账户余额和赠送余额 |
| `/help` | 帮助信息 | `/help` | 显示所有可用命令 |

---

## 📨 通知类型

用户绑定后，会自动接收以下通知：

### 1. 充值相关
- ✅ 充值申请已提交
- ✅ 充值已批准
- ❌ 充值已拒绝

### 2. 余额相关
- 💰 管理员赠送余额
- 💸 余额不足提醒

### 3. IP代理相关
- ⏰ IP即将到期提醒（到期前7天）
- 🔄 IP续费成功
- ✅ IP购买成功
- 🚫 IP已释放

### 4. 系统通知
- 📢 系统维护通知
- 🎉 促销活动通知

---

## 🧪 测试流程

### 测试1: Bot基本功能

1. **启动Bot**
   ```
   打开Telegram → 搜索Bot → 点击Start
   ```
   **预期：** 收到欢迎消息

2. **查看帮助**
   ```
   发送: /help
   ```
   **预期：** 显示所有命令列表

### 测试2: 账户绑定

1. **获取绑定码**
   - 登录ProxyHub
   - 账户中心 → 通知管理
   - 点击"绑定Telegram"
   - 记录6位绑定码

2. **执行绑定**
   ```
   发送: /bind ABC123
   ```
   **预期：**
   - Telegram收到绑定成功消息
   - ProxyHub页面显示"已绑定"

3. **查询余额**
   ```
   发送: /balance
   ```
   **预期：** 显示账户余额和赠送余额

### 测试3: 通知接收

1. **测试充值通知**
   - 提交一笔充值申请
   - **预期：** 同时收到邮件和Telegram消息

2. **测试赠送通知**
   - 管理员赠送余额
   - **预期：** 立即收到Telegram通知

3. **测试解绑**
   ```
   发送: /unbind
   ```
   **预期：**
   - Telegram收到解绑成功消息
   - ProxyHub显示"未绑定"

---

## 🔧 故障排查

### 问题1: Bot无响应

**可能原因：**
- Token错误
- Bot用户名配置错误
- 后端未重启

**解决方法：**
1. 检查`.env`中的Token是否正确
2. 确认Bot用户名正确（不需要@符号）
3. 重启后端服务
4. 查看后端日志

### 问题2: 绑定失败

**可能原因：**
- 绑定码已过期（5分钟有效期）
- 绑定码输入错误
- 用户未点击"Start"

**解决方法：**
1. 重新生成绑定码
2. 确保先点击Bot的"Start"按钮
3. 复制粘贴绑定码，避免输入错误

### 问题3: 收不到通知

**可能原因：**
- 账户未绑定Telegram
- 通知设置关闭
- Bot被用户屏蔽

**解决方法：**
1. 检查ProxyHub通知管理页面是否显示"已绑定"
2. 检查通知设置是否开启
3. 确认用户未屏蔽Bot

---

## 📊 Bot功能实现

### 后端文件

- `backend/src/modules/notification/services/telegram.service.ts`
  - Bot初始化
  - 命令处理（/start, /bind, /balance等）
  - 消息发送

- `backend/src/modules/notification/services/notification.service.ts`
  - 统一通知发送接口
  - 同时发送邮件和Telegram

- `backend/src/modules/notification/notification.controller.ts`
  - 绑定码生成API
  - 解绑API
  - 通知设置API

### 前端文件

- `frontend/src/views/account/Notifications.vue`
  - 通知管理UI
  - 绑定/解绑界面
  - 通知设置开关

---

## 🔐 安全说明

### Token保护

- ✅ Token存储在`.env`文件（不会提交到Git）
- ✅ `.env`文件已在`.gitignore`中
- ⚠️ 切勿将Token公开或提交到代码仓库

### 绑定码安全

- ✅ 6位随机大写字母+数字
- ✅ 5分钟有效期
- ✅ 一次性使用（绑定后失效）
- ✅ 存储时加密（bcrypt）

### Bot权限

- ✅ 只能查询绑定用户的信息
- ✅ 不能修改用户余额
- ✅ 不能执行管理员操作

---

## 📈 使用统计（后期可实现）

可以添加统计功能：
- 绑定用户数量
- 通知发送成功率
- 最常使用的命令
- 用户活跃度分析

---

## 🚀 后续优化

可以添加更多功能：
- [ ] `/proxies` - 查看代理列表
- [ ] `/orders` - 查看订单历史
- [ ] `/renew <proxyId>` - 直接续费IP
- [ ] `/buy` - 快速购买代理
- [ ] 交互式按钮（InlineKeyboard）
- [ ] 图表统计（使用Telegram Chart API）

---

## ✅ 配置完成检查清单

- [ ] 已编辑 `backend/.env` 文件
- [ ] 已添加 `TELEGRAM_BOT_TOKEN`
- [ ] 已添加 `TELEGRAM_BOT_USERNAME`
- [ ] 已重启后端服务
- [ ] 后端日志显示Bot初始化成功
- [ ] 在Telegram中搜索到Bot
- [ ] 点击Start收到欢迎消息
- [ ] 测试绑定功能成功
- [ ] 测试通知接收成功

---

**配置完成后，请告诉我，我将协助您进行完整测试！**


