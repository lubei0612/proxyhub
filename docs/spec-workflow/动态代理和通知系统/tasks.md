# 动态代理和通知系统 - 任务清单

## 📋 任务概览

**Spec名称**: 动态代理和通知系统  
**总任务数**: 12个  
**预估工作量**: 12-15小时  

---

## 🎯 Phase 1: 数据一致性测试（优先）

### Task 1.1: Chrome DevTools完整测试现有功能
**状态**: [ ] 待执行  
**优先级**: P0  
**预估时间**: 1-2小时  
**文件**: 无需修改文件，仅测试  

**测试内容**:
1. 用户端所有功能流程测试
   - 登录 → 购买IP → 余额扣除 → 订单生成
   - 充值申请 → 管理员审核 → 余额增加
   - IP续费 → 价格计算 → 余额扣除
   - IP释放 → 列表更新
   
2. 管理后台功能测试
   - 用户管理（角色变更、禁用）
   - 订单管理（查看、取消、导出）
   - 充值审核（批准、拒绝）
   - 价格覆盖（修改、保存、重置）
   - 系统设置（配置保存）

3. 数据一致性验证
   - 余额在所有页面显示一致
   - 订单信息在用户端和管理端一致
   - 交易记录准确记录所有操作
   - 事件日志完整记录关键操作

**验收标准**:
- ✅ 所有API调用正常（200/201）
- ✅ 控制台无错误
- ✅ 数据实时同步
- ✅ 创建测试报告文档

---

## 🎯 Phase 2: 动态代理后端实现

### Task 2.1: 创建数据库实体和迁移
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 30分钟  
**文件**:
- `backend/src/modules/proxy/dynamic/entities/dynamic-channel.entity.ts` (新建)
- `backend/src/modules/proxy/dynamic/entities/dynamic-usage.entity.ts` (新建)
- `backend/src/database/migrations/xxx-create-dynamic-proxy-tables.ts` (新建)

**任务描述**:
1. 创建DynamicChannel实体（通道管理）
2. 创建DynamicUsage实体（流量使用记录）
3. 生成数据库迁移文件
4. 执行迁移创建表

**依赖**: 无  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#数据库设计`

---

### Task 2.2: 实现DynamicChannelService
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 1小时  
**文件**:
- `backend/src/modules/proxy/dynamic/services/dynamic-channel.service.ts` (新建)
- `backend/src/modules/proxy/dynamic/dto/channel.dto.ts` (新建)

**任务描述**:
1. 实现通道CRUD操作
   - createChannel: 创建新通道
   - updateChannel: 更新通道配置
   - deleteChannel: 删除通道
   - toggleChannelStatus: 切换状态（运行/暂停）
   - getChannels: 获取通道列表（支持筛选）
   - getChannelStatistics: 获取统计数据

2. 创建相关DTO
   - CreateChannelDto
   - UpdateChannelDto
   - ChannelFiltersDto

**依赖**: Task 2.1  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#DynamicProxyModule`

---

### Task 2.3: 实现DynamicUsageService
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 1小时  
**文件**:
- `backend/src/modules/proxy/dynamic/services/dynamic-usage.service.ts` (新建)
- `backend/src/modules/proxy/dynamic/dto/usage.dto.ts` (新建)

**任务描述**:
1. 实现流量使用记录管理
   - recordUsage: 记录流量使用
   - getUsageHistory: 获取使用历史
   - getUsageStatistics: 获取统计数据

2. 实现定时任务（开发环境mock数据）
   - @Cron每天生成模拟流量数据

3. 创建相关DTO
   - RecordUsageDto
   - UsageFiltersDto

**依赖**: Task 2.1, 2.2  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#DynamicProxyModule`

---

### Task 2.4: 实现DynamicProxyController
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 30分钟  
**文件**:
- `backend/src/modules/proxy/dynamic/dynamic-proxy.controller.ts` (新建)
- `backend/src/modules/proxy/dynamic/dynamic-proxy.module.ts` (新建)

**任务描述**:
1. 创建API端点
   - GET /proxy/dynamic/channels - 获取通道列表
   - POST /proxy/dynamic/channels - 创建通道
   - PUT /proxy/dynamic/channels/:id - 更新通道
   - DELETE /proxy/dynamic/channels/:id - 删除通道
   - PATCH /proxy/dynamic/channels/:id/toggle - 切换状态
   - GET /proxy/dynamic/usage - 获取流量记录
   - GET /proxy/dynamic/statistics - 获取统计数据

2. 添加权限守卫（JwtAuthGuard）
3. 注册到AppModule

**依赖**: Task 2.2, 2.3  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#控制器`

---

## 🎯 Phase 3: 通知系统后端实现

### Task 3.1: 创建通知相关实体和迁移
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 30分钟  
**文件**:
- `backend/src/modules/notification/entities/notification.entity.ts` (新建)
- `backend/src/modules/notification/entities/notification-setting.entity.ts` (新建)
- `backend/src/modules/notification/entities/email-template.entity.ts` (新建)
- `backend/src/modules/user/entities/user.entity.ts` (修改，添加Telegram字段)
- `backend/src/database/migrations/xxx-create-notification-tables.ts` (新建)

**任务描述**:
1. 创建Notification实体
2. 创建NotificationSetting实体
3. 创建EmailTemplate实体
4. User实体添加Telegram相关字段
5. 生成并执行迁移

**依赖**: 无  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#数据库设计`

---

### Task 3.2: 实现EmailService（Nodemailer）
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 1.5小时  
**文件**:
- `backend/src/modules/notification/services/email.service.ts` (新建)
- `backend/src/modules/notification/templates/` (新建目录，存放邮件模板)
- `.env` (添加邮件配置)

**任务描述**:
1. 配置Nodemailer传输器
2. 实现邮件发送方法
   - sendNotification: 发送通知邮件
   - sendCustomEmail: 发送自定义邮件
3. 创建HTML邮件模板
   - 订单通知模板
   - 充值通知模板
   - 到期提醒模板
   - 余额不足模板
4. 实现模板渲染引擎
5. 添加发送速率限制

**依赖**: Task 3.1  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#EmailService`

**环境变量**:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=ProxyHub <noreply@proxyhub.com>
```

---

### Task 3.3: 实现TelegramService（Bot）
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 2小时  
**文件**:
- `backend/src/modules/notification/services/telegram.service.ts` (新建)
- `.env` (添加Telegram配置)
- `package.json` (添加node-telegram-bot-api依赖)

**任务描述**:
1. 安装依赖: `npm install node-telegram-bot-api @types/node-telegram-bot-api`
2. 配置Telegram Bot
3. 实现Bot命令处理
   - /start: 开始绑定流程
   - /balance: 查询余额
   - /orders: 查询订单
   - /unbind: 解绑账户
4. 实现绑定码生成和验证
5. 实现通知推送方法
   - sendNotification: 发送通知消息
6. 实现Webhook处理（可选，生产环境）

**依赖**: Task 3.1  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#TelegramService`

**环境变量**:
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=ProxyHubBot
```

**创建Bot步骤**:
1. 在Telegram搜索 @BotFather
2. 发送 /newbot
3. 设置Bot名称和用户名
4. 获取Bot Token

---

### Task 3.4: 实现NotificationService
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 1小时  
**文件**:
- `backend/src/modules/notification/services/notification.service.ts` (新建)
- `backend/src/modules/notification/dto/notification.dto.ts` (新建)

**任务描述**:
1. 实现通知核心逻辑
   - createNotification: 创建通知（自动判断发送渠道）
   - getNotifications: 获取通知列表
   - markAsRead: 标记已读
   - markAllAsRead: 全部标记已读
   - deleteNotification: 删除通知
2. 实现通知设置管理
   - getSettings: 获取用户设置
   - updateSettings: 更新设置
3. 集成EmailService和TelegramService
4. 创建相关DTO

**依赖**: Task 3.2, 3.3  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#NotificationService`

---

### Task 3.5: 实现NotificationController
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 30分钟  
**文件**:
- `backend/src/modules/notification/notification.controller.ts` (新建)
- `backend/src/modules/notification/notification.module.ts` (新建)

**任务描述**:
1. 创建API端点
   - GET /notifications - 获取通知列表
   - GET /notifications/settings - 获取设置
   - PUT /notifications/settings - 更新设置
   - PATCH /notifications/:id/read - 标记已读
   - PATCH /notifications/read-all - 全部已读
   - DELETE /notifications/:id - 删除通知
   - POST /notifications/telegram/bind-code - 生成绑定码
   - DELETE /notifications/telegram/unbind - 解绑Telegram
2. 添加权限守卫
3. 注册到AppModule

**依赖**: Task 3.4  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#NotificationController`

---

## 🎯 Phase 4: 前端实现

### Task 4.1: 复刻985Proxy动态住宅UI
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 2小时  
**文件**:
- `frontend/src/views/proxy/DynamicChannels.vue` (新建)
- `frontend/src/api/modules/dynamic.ts` (新建)

**任务描述**:
1. 复刻UI布局（参考985Proxy截图）
   - 顶部操作栏（添加通道按钮）
   - 筛选区域（通道名、状态）
   - 表格显示（通道名、费用、限制、流量、花费、备注、操作）
   - 底部统计（总通道数、总流量、总金额）
2. 实现CRUD功能
   - 添加通道对话框
   - 编辑通道对话框
   - 删除确认
   - 状态切换
3. 对接后端API
4. 数据验证和错误处理

**依赖**: Task 2.4  
**参考**: 
- 用户提供的985Proxy截图
- `docs/spec-workflow/动态代理和通知系统/design.md#动态代理管理页面`

---

### Task 4.2: 对接通知系统前端API
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 1小时  
**文件**:
- `frontend/src/views/account/Notifications.vue` (修改)
- `frontend/src/api/modules/notification.ts` (新建)

**任务描述**:
1. 创建API调用方法
   - getNotifications
   - getSettings
   - updateSettings
   - markAsRead
   - markAllAsRead
   - deleteNotification
2. 替换mock数据为真实API调用
   - saveEmailSettings → API
   - saveInAppSettings → API
   - loadNotifications → API
   - markAllAsRead → API
3. 实时数据更新

**依赖**: Task 3.5  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#通知设置页面`

---

### Task 4.3: 实现Telegram绑定页面
**状态**: [ ] 待执行  
**优先级**: P1  
**预估时间**: 1.5小时  
**文件**:
- `frontend/src/views/account/TelegramBind.vue` (新建)
- `frontend/src/api/modules/notification.ts` (修改，添加绑定API)
- `frontend/src/router/index.ts` (添加路由)

**任务描述**:
1. 创建绑定页面UI
   - 未绑定状态：绑定步骤说明、生成绑定码按钮
   - 已绑定状态：显示Telegram用户名、解绑按钮
2. 实现绑定流程
   - 生成绑定码
   - 复制绑定码
   - 轮询绑定状态（可选）
3. 实现解绑功能
4. 添加路由配置

**依赖**: Task 3.5  
**参考**: `docs/spec-workflow/动态代理和通知系统/design.md#Telegram绑定页面`

---

## 🎯 Phase 5: 测试和优化

### Task 5.1: 完整端到端测试
**状态**: [ ] 待执行  
**优先级**: P0  
**预估时间**: 2小时  
**文件**: 无需修改文件，仅测试  

**测试内容**:
1. 动态代理功能测试
   - 创建通道 → 数据库记录
   - 编辑通道 → 数据更新
   - 删除通道 → 记录删除
   - 状态切换 → 状态更新
   - 筛选搜索 → 结果准确
   - 统计数据 → 计算正确

2. 通知系统测试
   - 邮件通知发送成功
   - Telegram通知推送成功
   - 通知设置保存生效
   - 通知历史正确显示
   - Telegram绑定流程完整

3. 数据一致性测试
   - 所有页面数据同步
   - 操作实时更新
   - 错误处理完善

**验收标准**:
- ✅ 所有功能正常运行
- ✅ 无控制台错误
- ✅ 数据准确一致
- ✅ 创建完整测试报告

**依赖**: 所有前面的任务  

---

### Task 5.2: 准备985Proxy真实API对接
**状态**: [ ] 待执行  
**优先级**: P2  
**预估时间**: 1小时  
**文件**:
- `docs/985Proxy-API对接指南.md` (新建)
- `backend/src/modules/proxy/985proxy/985proxy.service.ts` (新建框架)

**任务描述**:
1. 研究985Proxy API文档（如有）
2. 创建API对接服务框架
3. 实现API认证
4. 实现关键端点调用
   - 静态IP购买
   - 动态代理流量查询
   - IP释放
5. 创建对接指南文档
6. 配置切换机制（mock/real）

**依赖**: Task 5.1完成  
**备注**: 等待用户提供985Proxy API文档或确认上线时间

---

## 📝 任务执行顺序

```
Phase 1: 数据一致性测试
├─ Task 1.1 [必须先完成]
│
Phase 2: 动态代理后端
├─ Task 2.1 → Task 2.2 → Task 2.3 → Task 2.4
│
Phase 3: 通知系统后端
├─ Task 3.1 → Task 3.2 (EmailService)
│           ├─ Task 3.3 (TelegramService)
│           └─ Task 3.4 (NotificationService) → Task 3.5
│
Phase 4: 前端实现
├─ Task 4.1 (动态代理UI)
├─ Task 4.2 (通知API对接)
└─ Task 4.3 (Telegram绑定)
│
Phase 5: 测试和对接
├─ Task 5.1 (端到端测试)
└─ Task 5.2 (985Proxy对接准备)
```

---

## ✅ 完成标准

### 全部完成条件
- [ ] 所有任务状态为 [x]
- [ ] Chrome DevTools测试通过
- [ ] 邮件通知发送成功
- [ ] Telegram Bot正常工作
- [ ] 数据库迁移执行成功
- [ ] 前后端API完全对接
- [ ] 创建完整测试报告
- [ ] 用户验收通过

---

**文档版本**: v1.0  
**创建时间**: 2025-11-04  
**最后更新**: 2025-11-04
