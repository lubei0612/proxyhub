# 动态代理和通知系统 - 需求文档

## 📋 项目概述

**项目名称**: ProxyHub 动态代理管理 + 通知系统实现  
**创建日期**: 2025-11-04  
**优先级**: P1 高优先级  
**目标**: 复刻985Proxy动态住宅管理UI，实现完整的通知系统

---

## 🎯 核心需求

### 1. 动态代理管理系统

#### 1.1 背景
- 985Proxy动态代理**没有提供API**
- 需要复刻985Proxy的UI和功能逻辑
- 暂时使用本地数据管理，后续对接真实API

#### 1.2 功能需求

##### 1.2.1 通道管理
**参考UI**: 图片中的985Proxy动态住宅管理界面

**页面元素**:
- 页面标题: "动态住宅"
- 筛选区域:
  - 通道名输入框（模糊搜索）
  - 状态选择器（全部/运行中/已暂停/已停用）
  - 搜索按钮
  - 重置按钮
  - 添加通道按钮（主操作）

**表格列**:
| 列名 | 说明 | 数据类型 |
|------|------|---------|
| 通道名 | 通道标识 | String |
| 费用 | 单价（$/GB） | Decimal |
| 通道限制 | 并发数限制 | Integer |
| 使用流量 | 已使用流量（GB） | Decimal |
| 花费 | 总花费金额 | Decimal |
| 备注 | 备注信息 | String |
| 操作 | 编辑/删除/暂停/启用 | Actions |

**底部统计**:
- 总通道数: X
- 总流量: X bytes
- 总使用金额: $X.XX

##### 1.2.2 通道操作
- **添加通道**: 
  - 通道名称（必填）
  - 流量单价（必填，默认$4.5/GB）
  - 并发限制（必填，默认1000）
  - 状态（运行中/已暂停）
  - 备注（可选）

- **编辑通道**: 修改通道配置

- **暂停/启用通道**: 切换通道状态

- **删除通道**: 删除通道（需确认）

##### 1.2.3 流量使用记录
**新增页面**: 流量使用详情

**表格列**:
| 列名 | 说明 |
|------|------|
| 日期 | 使用日期 |
| 请求次数 | API请求次数 |
| 成功率 | 请求成功率 |
| 使用流量 | 流量消耗（GB） |
| 费用 | 当日费用 |

---

### 2. 通知系统

#### 2.1 邮件通知服务

**技术栈**: Nodemailer + Gmail/SMTP

**功能需求**:
- ✅ 订单通知（购买成功、订单取消）
- ✅ 充值通知（审核通过、审核拒绝）
- ✅ 到期提醒（IP即将到期）
- ✅ 余额不足提醒（低于阈值）
- ✅ 系统公告（维护通知、功能更新）

**邮件模板**:
- HTML邮件模板
- 品牌Logo
- 行动按钮（CTA）
- 订单详情表格

#### 2.2 Telegram Bot通知

**技术栈**: node-telegram-bot-api

**功能需求**:
- ✅ 用户绑定Telegram账号
- ✅ 订单通知推送
- ✅ 充值审核结果推送
- ✅ 到期提醒推送
- ✅ 余额不足推送
- ✅ 系统公告推送

**交互命令**:
- `/start` - 绑定账号
- `/balance` - 查询余额
- `/orders` - 查询订单
- `/unbind` - 解绑账号

#### 2.3 通知历史数据库

**数据库实体**: `notifications`

**字段设计**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| userId | Integer | 用户ID（外键） |
| type | Enum | 通知类型（success/info/warning/error） |
| category | Enum | 通知分类（order/recharge/expiration/balance/system） |
| title | String | 通知标题 |
| content | Text | 通知内容 |
| isRead | Boolean | 是否已读 |
| createdAt | Timestamp | 创建时间 |
| readAt | Timestamp | 阅读时间 |

#### 2.4 通知设置

**数据库实体**: `notification_settings`

**字段设计**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| userId | Integer | 用户ID（外键） |
| emailEnabled | Boolean | 邮件通知开关 |
| telegramEnabled | Boolean | Telegram通知开关 |
| orderNotification | Boolean | 订单通知 |
| rechargeNotification | Boolean | 充值通知 |
| expirationNotification | Boolean | 到期提醒 |
| lowBalanceNotification | Boolean | 余额不足提醒 |
| lowBalanceThreshold | Decimal | 余额阈值 |
| systemNotification | Boolean | 系统公告 |
| createdAt | Timestamp | 创建时间 |
| updatedAt | Timestamp | 更新时间 |

#### 2.5 用户Telegram绑定

**数据库实体**: `user` 表新增字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| telegramChatId | String | Telegram Chat ID |
| telegramUsername | String | Telegram用户名 |
| telegramBindAt | Timestamp | 绑定时间 |

---

## 🔧 技术需求

### 1. 后端技术栈
- **框架**: NestJS
- **邮件服务**: Nodemailer
- **Telegram Bot**: node-telegram-bot-api
- **数据库**: PostgreSQL
- **ORM**: TypeORM

### 2. 前端技术栈
- **框架**: Vue 3
- **UI库**: Element Plus
- **图表**: ECharts（流量趋势图）

### 3. 环境变量配置
```env
# 邮件配置
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=ProxyHub <noreply@proxyhub.com>

# Telegram Bot配置
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

---

## 📊 API端点设计

### 动态代理API

```typescript
// 通道管理
GET    /api/v1/proxy/dynamic/channels           // 获取通道列表
POST   /api/v1/proxy/dynamic/channels           // 创建通道
GET    /api/v1/proxy/dynamic/channels/:id       // 获取通道详情
PUT    /api/v1/proxy/dynamic/channels/:id       // 更新通道
DELETE /api/v1/proxy/dynamic/channels/:id       // 删除通道
PATCH  /api/v1/proxy/dynamic/channels/:id/toggle // 切换通道状态

// 流量使用
GET    /api/v1/proxy/dynamic/usage              // 获取流量使用记录
GET    /api/v1/proxy/dynamic/statistics         // 获取统计数据
```

### 通知系统API

```typescript
// 通知设置
GET    /api/v1/notifications/settings           // 获取通知设置
PUT    /api/v1/notifications/settings           // 更新通知设置
PATCH  /api/v1/notifications/settings/email     // 更新邮件设置
PATCH  /api/v1/notifications/settings/telegram  // 更新Telegram设置

// 通知历史
GET    /api/v1/notifications                    // 获取通知列表
GET    /api/v1/notifications/:id                // 获取通知详情
PATCH  /api/v1/notifications/:id/read           // 标记已读
PATCH  /api/v1/notifications/read-all           // 全部标记已读
DELETE /api/v1/notifications/:id                // 删除通知

// Telegram绑定
POST   /api/v1/notifications/telegram/bind      // 绑定Telegram
DELETE /api/v1/notifications/telegram/unbind    // 解绑Telegram
GET    /api/v1/notifications/telegram/code      // 获取绑定码

// Webhook
POST   /api/telegram/webhook                    // Telegram Webhook
```

---

## 🎨 UI/UX需求

### 1. 动态代理管理页面

#### 页面布局
```
┌─────────────────────────────────────────────────────────┐
│ 动态住宅                                                  │
├─────────────────────────────────────────────────────────┤
│ [添加通道]                                                │
│                                                           │
│ 通道名 [_________] 状态 [全部 ▼] [搜索] [重置]           │
│                                                           │
│ ┌─────┬──────┬────────┬────────┬──────┬──────┬──────┐ │
│ │通道名│费用  │通道限制 │使用流量 │花费  │备注  │操作  │ │
│ ├─────┼──────┼────────┼────────┼──────┼──────┼──────┤ │
│ │     │      │        │        │      │      │      │ │
│ │     │      │        │        │      │      │      │ │
│ └─────┴──────┴────────┴────────┴──────┴──────┴──────┘ │
│                                                           │
│ 总通道数: 0  总流量: 0 bytes  总使用金额: $ 0.00         │
└─────────────────────────────────────────────────────────┘
```

#### 添加通道对话框
```
┌──────────────────────────────────┐
│ 添加通道                    [×]   │
├──────────────────────────────────┤
│ 通道名称 *                        │
│ [_________________________]      │
│                                   │
│ 流量单价 ($/GB) *                 │
│ [________] 默认: 4.5             │
│                                   │
│ 并发限制 *                        │
│ [________] 默认: 1000            │
│                                   │
│ 状态                              │
│ ( ) 运行中  (•) 已暂停           │
│                                   │
│ 备注                              │
│ [_________________________]      │
│                                   │
│         [取消]  [确定]            │
└──────────────────────────────────┘
```

### 2. 通知设置页面（已存在，需对接API）

保持现有UI不变，替换mock数据为真实API调用。

### 3. Telegram绑定页面

**位置**: 账户中心 > 安全设置

```
┌─────────────────────────────────────────┐
│ Telegram绑定                              │
├─────────────────────────────────────────┤
│ 绑定Telegram后，您可以接收重要通知        │
│                                           │
│ 状态: [未绑定] / [已绑定 @username]       │
│                                           │
│ [绑定Telegram]                            │
│                                           │
│ 绑定步骤:                                 │
│ 1. 在Telegram搜索 @ProxyHubBot            │
│ 2. 发送 /start 命令                       │
│ 3. 发送绑定码: XXXX-XXXX                  │
│ 4. 等待绑定确认                           │
│                                           │
│ [已绑定] [解绑]                           │
└─────────────────────────────────────────┘
```

---

## ✅ 验收标准

### 1. 动态代理管理
- [ ] 通道列表正确显示
- [ ] 添加通道功能正常
- [ ] 编辑通道功能正常
- [ ] 删除通道需确认
- [ ] 暂停/启用状态切换正常
- [ ] 筛选和搜索功能正常
- [ ] 底部统计数据准确
- [ ] 流量使用记录可查看

### 2. 邮件通知
- [ ] 邮件发送成功
- [ ] 邮件模板美观
- [ ] 邮件内容准确
- [ ] 用户设置生效

### 3. Telegram通知
- [ ] Bot绑定流程顺畅
- [ ] 通知推送及时
- [ ] 命令响应正确
- [ ] 解绑功能正常

### 4. 通知历史
- [ ] 通知列表正确显示
- [ ] 未读/已读状态准确
- [ ] 标记已读功能正常
- [ ] 删除通知功能正常

### 5. 数据一致性
- [ ] 前后端数据同步
- [ ] 操作实时更新
- [ ] 错误处理完善
- [ ] 日志记录完整

---

## 🚀 实施计划

### Phase 1: 动态代理后端（2-3小时）
1. 创建数据库实体
2. 实现通道管理API
3. 实现流量使用API
4. 单元测试

### Phase 2: 动态代理前端（2-3小时）
1. 复刻UI布局
2. 对接API
3. 实现CRUD操作
4. 数据验证

### Phase 3: 通知系统后端（3-4小时）
1. 配置Nodemailer
2. 创建邮件模板
3. 配置Telegram Bot
4. 实现通知API
5. 实现Webhook

### Phase 4: 通知系统前端（1-2小时）
1. 对接通知设置API
2. 对接通知历史API
3. 实现Telegram绑定页面

### Phase 5: 测试和优化（2-3小时）
1. Chrome DevTools测试
2. 数据一致性验证
3. 性能优化
4. 文档更新

**总预计时间**: 10-15小时

---

## 📝 注意事项

1. **邮件发送限制**: Gmail每天500封，建议使用专业SMTP服务
2. **Telegram Bot安全**: 验证webhook签名，防止伪造请求
3. **通知频率控制**: 避免频繁通知，设置冷却时间
4. **数据隐私**: 敏感信息加密存储
5. **错误处理**: 邮件/Telegram发送失败需要重试机制

---

**文档版本**: v1.0  
**最后更新**: 2025-11-04  
**负责人**: AI Assistant


