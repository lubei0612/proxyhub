# Telegram Bot 配置指南

## 1. 创建Telegram Bot

1. 在Telegram中搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 按提示设置Bot名称和用户名
4. 获取Bot Token（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

## 2. 配置环境变量

在 `backend/.env` 文件中添加：

```env
# Telegram Bot配置
TELEGRAM_BOT_TOKEN=your-bot-token-here
TELEGRAM_BOT_USERNAME=your_bot_username
```

## 3. 已实现功能

✅ 后端Telegram Bot服务已实现（`backend/src/modules/notification/services/telegram.service.ts`）
✅ 支持以下功能：
   - `/start` - 绑定Telegram账号
   - `/balance` - 查询余额
   - `/proxies` - 查看代理列表
   - 接收系统通知（充值、购买等）

## 4. 用户绑定流程

1. 用户在ProxyHub系统中获取绑定码
2. 在Telegram中向Bot发送 `/start 绑定码`
3. 系统验证并绑定账号
4. 绑定成功后自动接收通知

## 5. 测试Bot功能

配置完成后，重启后端服务：
```bash
cd backend
npm run start:dev
```

测试方法：
1. 在Telegram中搜索您的Bot用户名
2. 发送 `/start` 命令
3. 查看Bot响应是否正常

## 6. 部署注意事项

- Bot需要有公网IP才能接收Telegram消息
- 开发环境可以使用Polling模式（已实现）
- 生产环境建议使用Webhook模式
- 确保服务器防火墙允许Telegram服务器访问

预计工作量：30分钟（仅配置）


