# ProxyHub 全面改进需求文档

**规格名称**: proxyhub-comprehensive-improvements  
**创建日期**: 2025-11-08  
**状态**: 设计中  
**优先级**: P0

---

## 📋 需求概述

本规格旨在对 ProxyHub 系统进行全面改进，包括：
1. 修复静态住宅管理的国家/城市选择问题
2. 修复各页面筛选和搜索功能
3. 修复价格覆盖在续费时的问题
4. 优化静态IP购买延迟
5. 恢复管理后台"查看用户IP"功能
6. 移除管理后台仪表盘的硬编码数据
7. 修复系统设置中客服链接无法修改的问题
8. 实现完整的手机端适配（方案A）
9. 将"近期交易"改为"全部交易记录"（已完成）

---

## 🎯 用户故事

### US-1: 静态住宅管理 - 国家/城市选择优化
**作为** 用户  
**我想要** 在静态住宅管理页面选择"所有国家"或从真实985Proxy数据中选择国家/城市  
**以便于** 更灵活地筛选和管理我的静态IP

**验收标准**:
- 国家下拉菜单包含"所有国家"选项
- 国家列表来自985Proxy API `/res_static/city_list`
- 城市列表根据选择的国家动态加载
- 选择"所有国家"时显示所有IP
- 选择特定国家时可继续选择城市

**EARS 分解**:
- **WHEN** 用户打开静态住宅管理页面
  - **THE SYSTEM SHALL** 从985Proxy API获取国家列表
  - **THE SYSTEM SHALL** 在国家下拉菜单中显示"所有国家"选项
- **WHEN** 用户选择特定国家
  - **THE SYSTEM SHALL** 加载该国家的城市列表
  - **THE SYSTEM SHALL** 启用城市下拉菜单
- **WHEN** 用户选择"所有国家"
  - **THE SYSTEM SHALL** 显示所有IP，不进行国家筛选

---

### US-2: 筛选和搜索功能修复
**作为** 用户  
**我想要** 在各个页面使用筛选和搜索功能正常工作  
**以便于** 快速找到我需要的数据

**验收标准**:
- 静态住宅管理页面：IP搜索、国家筛选、城市筛选、通道筛选全部生效
- 充值审核页面：支付方式筛选、状态筛选、搜索用户邮箱全部生效
- 用户管理页面：搜索邮箱、角色筛选、状态筛选全部生效
- 订单管理页面：搜索订单号、状态筛选、日期范围筛选全部生效
- 筛选后点击"重置"按钮清除所有筛选条件

**EARS 分解**:
- **WHEN** 用户在任何页面输入搜索关键词
  - **THE SYSTEM SHALL** 根据关键词实时过滤列表数据
- **WHEN** 用户选择筛选条件（如状态、角色、日期范围）
  - **THE SYSTEM SHALL** 仅显示符合条件的记录
- **WHEN** 用户点击"重置"按钮
  - **THE SYSTEM SHALL** 清除所有筛选条件并显示全部数据

---

### US-3: 价格覆盖在续费时生效
**作为** 管理员  
**我想要** 为用户设置的价格覆盖在续费时也生效  
**以便于** 确保特殊定价策略的一致性

**验收标准**:
- 管理员为某个国家/IP设置价格覆盖（如$8）
- 用户购买该IP时按覆盖价格$8扣费（已实现）
- 用户续费该IP时也按覆盖价格$8扣费（当前问题：按原价$5扣费）
- 续费时检查 `price_overrides` 表中的覆盖价格

**EARS 分解**:
- **WHEN** 用户点击续费按钮
  - **THE SYSTEM SHALL** 查询 `price_overrides` 表获取覆盖价格
  - **IF** 存在覆盖价格 **THEN** 使用覆盖价格
  - **ELSE** 使用985Proxy API返回的默认价格
- **WHEN** 续费扣费完成
  - **THE SYSTEM SHALL** 在交易记录中记录实际扣费金额
  - **THE SYSTEM SHALL** 更新IP的到期时间

---

### US-4: 静态IP购买延迟优化
**作为** 用户  
**我想要** 购买静态IP后快速生效  
**以便于** 减少等待时间，提升体验

**验收标准**:
- 当前：购买后需要较长时间（可能因轮询间隔过大）
- 优化后：购买后最多等待3-5秒即可看到IP
- 使用更短的轮询间隔（如500ms）查询985Proxy订单状态
- 最多轮询10次（5秒），超时后提示用户稍后刷新

**EARS 分解**:
- **WHEN** 用户提交静态IP购买请求
  - **THE SYSTEM SHALL** 调用985Proxy API创建订单
  - **THE SYSTEM SHALL** 每隔500ms轮询订单状态
  - **THE SYSTEM SHALL** 最多轮询10次（5秒）
- **WHEN** 订单状态变为 `complete` 或 `success`
  - **THE SYSTEM SHALL** 立即停止轮询
  - **THE SYSTEM SHALL** 保存IP信息到数据库
  - **THE SYSTEM SHALL** 返回成功响应给前端
- **WHEN** 轮询超时（10次后仍未完成）
  - **THE SYSTEM SHALL** 返回"订单处理中，请稍后刷新"提示

---

### US-5: 恢复"查看用户IP"功能
**作为** 管理员  
**我想要** 在用户管理页面点击"查看IP"按钮查看用户购买的所有IP  
**以便于** 进行账户对账和问题排查

**验收标准**:
- 用户管理页面每个用户行有"查看IP"按钮
- 点击按钮打开模态框显示：
  - 静态住宅IP列表（IP、端口、账号、密码、国家、城市、到期时间）
  - 动态住宅通道列表（通道名称、套餐类型、流量使用情况）
  - 全部交易记录（交易类型、金额、时间、备注）
- 支持导出为CSV/Excel

**EARS 分解**:
- **WHEN** 管理员点击用户行的"查看IP"按钮
  - **THE SYSTEM SHALL** 调用 `GET /api/v1/admin/users/:id/ips` API
  - **THE SYSTEM SHALL** 打开模态框显示用户的IP和交易记录
- **WHEN** 管理员点击"导出"按钮
  - **THE SYSTEM SHALL** 生成CSV或Excel文件
  - **THE SYSTEM SHALL** 包含所有静态IP、动态通道、交易记录

---

### US-6: 管理后台仪表盘去硬编码
**作为** 管理员  
**我想要** 看到真实的收入趋势和待处理事项  
**以便于** 了解系统实际运营情况

**验收标准**:
- 收入趋势图显示真实数据（从 `transactions` 表统计）
- 待处理事项数量显示真实数据：
  - 充值审核：`recharge_orders` 表中 `status = 'pending'` 的数量
  - 异常订单：`orders` 表中 `status = 'failed'` 的数量
  - 系统通知：`notifications` 表中未读数量
- 移除所有硬编码的模拟数据

**EARS 分解**:
- **WHEN** 管理员打开仪表盘
  - **THE SYSTEM SHALL** 查询 `transactions` 表计算收入趋势（按日期分组）
  - **THE SYSTEM SHALL** 查询 `recharge_orders` 表统计待审核充值数量
  - **THE SYSTEM SHALL** 查询 `orders` 表统计异常订单数量
  - **THE SYSTEM SHALL** 查询 `notifications` 表统计未读通知数量
- **WHEN** 数据加载完成
  - **THE SYSTEM SHALL** 渲染收入趋势图（ECharts）
  - **THE SYSTEM SHALL** 显示待处理事项卡片

---

### US-7: 系统设置客服链接修改功能
**作为** 管理员  
**我想要** 在系统设置页面修改Telegram客服链接  
**以便于** 灵活调整客服联系方式

**验收标准**:
- 系统设置页面显示当前Telegram客服链接列表
- 管理员可以编辑每个链接的username
- 管理员可以添加新的客服链接
- 管理员可以删除现有客服链接
- 保存后立即生效，前端各页面显示的客服链接自动更新

**EARS 分解**:
- **WHEN** 管理员打开系统设置页面
  - **THE SYSTEM SHALL** 调用 `GET /api/v1/settings/telegram` 获取客服链接
  - **THE SYSTEM SHALL** 显示可编辑的链接列表
- **WHEN** 管理员修改客服链接
  - **THE SYSTEM SHALL** 调用 `PUT /api/v1/admin/settings/telegram/:id` 更新链接
  - **THE SYSTEM SHALL** 显示成功提示
- **WHEN** 管理员添加新链接
  - **THE SYSTEM SHALL** 调用 `POST /api/v1/admin/settings/telegram` 创建链接
- **WHEN** 管理员删除链接
  - **THE SYSTEM SHALL** 调用 `DELETE /api/v1/admin/settings/telegram/:id` 删除链接

---

### US-8: 手机端完整适配（方案A）
**作为** 管理员  
**我想要** 在手机上流畅操作管理后台  
**以便于** 随时随地处理业务（充值审核、用户管理、订单查看）

**验收标准**:
- 手机端（< 768px）侧边栏变为汉堡菜单
- 所有表格转换为卡片列表
- 所有按钮高度至少44px（iOS最小触控区域）
- 筛选条件垂直排列
- 表单label在输入框上方
- 所有页面支持竖屏操作
- 所有功能在手机端可用（无需横屏）

**适配页面**:
1. 管理员仪表盘
2. 用户管理
3. 充值审核
4. 订单管理
5. 系统设置
6. 价格覆盖管理
7. 用户端仪表盘
8. 静态住宅管理/选购
9. 动态住宅管理/选购
10. 账户中心
11. 充值页面
12. 交易明细

**EARS 分解**:
- **WHEN** 用户在手机端访问任何页面
  - **THE SYSTEM SHALL** 检测屏幕宽度 < 768px
  - **THE SYSTEM SHALL** 应用响应式CSS样式
  - **THE SYSTEM SHALL** 隐藏桌面版侧边栏
  - **THE SYSTEM SHALL** 显示顶部汉堡菜单
- **WHEN** 用户点击汉堡菜单
  - **THE SYSTEM SHALL** 从左侧滑出侧边栏抽屉
  - **THE SYSTEM SHALL** 显示overlay遮罩
- **WHEN** 用户在手机端查看表格数据
  - **THE SYSTEM SHALL** 使用卡片列表替代表格
  - **THE SYSTEM SHALL** 每个卡片显示关键信息
  - **THE SYSTEM SHALL** 提供"查看详情"按钮进入详情页

---

## 🔄 业务流程

### 流程1: 静态IP续费（修复价格覆盖）
```
用户打开静态住宅管理页面
  → 查看IP列表
    → 点击某个IP的"续费"按钮
      → 系统查询 price_overrides 表
        → 如存在覆盖价格，显示覆盖价格
        → 如不存在，显示985Proxy默认价格
      → 用户确认续费
        → 系统扣除余额（使用覆盖价格或默认价格）
        → 调用985Proxy API续费
        → 更新IP到期时间
        → 显示成功提示
```

### 流程2: 管理员查看用户IP
```
管理员打开用户管理页面
  → 点击某个用户的"查看IP"按钮
    → 系统调用 GET /api/v1/admin/users/:id/ips
      → 返回：
        - 静态住宅IP列表
        - 动态住宅通道列表
        - 全部交易记录
    → 模态框显示数据（三个Tab）
      → 管理员可以点击"导出"生成Excel
```

### 流程3: 手机端充值审核
```
管理员在手机上打开充值审核页面
  → 系统检测屏幕宽度 < 768px
    → 隐藏桌面版侧边栏
    → 显示顶部汉堡菜单
  → 管理员点击汉堡菜单
    → 侧边栏从左侧滑出
  → 管理员点击"充值审核"
    → 显示卡片列表（每个充值申请一个卡片）
      → 卡片显示：用户邮箱、金额、支付方式、时间
      → 卡片底部：[批准] [拒绝] 按钮（全宽，高度44px）
  → 管理员点击"批准"
    → 系统调用审核API
    → 显示成功提示
    → 自动刷新列表
```

---

## 📊 数据模型

### 新增API端点

#### GET /api/v1/proxy/static/country-list
**用途**: 获取985Proxy支持的国家列表  
**响应**:
```json
{
  "countries": [
    { "code": "US", "name": "United States", "cityCount": 50 },
    { "code": "UK", "name": "United Kingdom", "cityCount": 20 }
  ]
}
```

#### GET /api/v1/proxy/static/city-list?country=US
**用途**: 获取指定国家的城市列表  
**响应**:
```json
{
  "cities": [
    { "code": "NY", "name": "New York" },
    { "code": "LA", "name": "Los Angeles" }
  ]
}
```

#### GET /api/v1/admin/users/:id/ips
**用途**: 获取用户的所有IP和交易记录  
**响应**:
```json
{
  "user": { "id": 1, "email": "user@example.com", "balance": 1000 },
  "staticProxies": [
    { "ip": "1.2.3.4", "port": 8080, "username": "user1", "password": "pass123", "country": "US", "city": "NY", "expireTimeUtc": "2025-12-01" }
  ],
  "dynamicChannels": [
    { "name": "Channel1", "packageType": "unlimited", "trafficUsed": 50.5, "trafficLimit": 100 }
  ],
  "recentTransactions": [
    { "type": "purchase", "amount": -5.00, "balanceBefore": 1005, "balanceAfter": 1000, "transactionNo": "TXN123", "remark": "购买静态IP", "createdAt": "2025-11-08 10:00:00" }
  ]
}
```

#### PUT /api/v1/admin/settings/telegram/:id
**用途**: 更新Telegram客服链接  
**请求体**:
```json
{
  "username": "leyiproxy"
}
```

---

## 🎯 成功指标

- ✅ 所有筛选和搜索功能正常工作
- ✅ 价格覆盖在续费时正确应用
- ✅ 静态IP购买延迟降低至5秒以内
- ✅ "查看用户IP"功能完全恢复
- ✅ 管理后台仪表盘无硬编码数据
- ✅ 客服链接可通过系统设置修改
- ✅ 所有12个页面在手机端（375px宽度）完美显示
- ✅ Chrome DevTools测试通过（无Console错误）

---

## 🚫 非功能需求

### 性能
- 手机端响应式纯CSS实现，性能影响0%
- 985Proxy API调用增加超时控制（5秒）
- 前端筛选使用防抖（300ms）避免频繁请求

### 兼容性
- 支持Chrome 90+, Safari 14+, Firefox 88+
- 支持iOS Safari（iPhone 8及以上）
- 支持Android Chrome（Android 9及以上）

### 安全性
- 所有API需要JWT认证
- 管理员API需要Admin角色验证
- 客服链接修改需要记录操作日志

---

## 📝 验收测试清单

### 功能测试
- [ ] 静态住宅管理：选择"所有国家"显示所有IP
- [ ] 静态住宅管理：选择国家后城市列表动态加载
- [ ] 静态住宅管理：IP搜索、国家筛选、城市筛选全部生效
- [ ] 充值审核：筛选和搜索全部生效
- [ ] 用户管理：筛选和搜索全部生效
- [ ] 订单管理：筛选和搜索全部生效
- [ ] 静态IP续费：使用价格覆盖正确扣费
- [ ] 静态IP购买：5秒内完成（大部分情况）
- [ ] 用户管理："查看IP"按钮显示正确数据
- [ ] 用户管理："导出"功能生成正确的CSV/Excel
- [ ] 管理员仪表盘：收入趋势显示真实数据
- [ ] 管理员仪表盘：待处理事项显示真实数量
- [ ] 系统设置：客服链接可编辑/添加/删除
- [ ] 系统设置：保存后前端立即更新

### 手机端测试（Chrome DevTools - iPhone 12 Pro, 390x844）
- [ ] 登录页面正常显示和操作
- [ ] 汉堡菜单正常展开和收起
- [ ] 管理员仪表盘卡片式布局正确
- [ ] 用户管理卡片列表正确显示
- [ ] 充值审核卡片列表正确显示
- [ ] 订单管理卡片列表正确显示
- [ ] 系统设置表单正常操作
- [ ] 用户端仪表盘正常显示
- [ ] 静态住宅管理卡片列表正确显示
- [ ] 静态住宅选购页面正常操作
- [ ] 账户中心正常显示
- [ ] 所有按钮高度至少44px，易于点击

### Chrome DevTools验证
- [ ] Console无Error
- [ ] Network面板所有API返回正确状态码
- [ ] Application面板Token正确存储
- [ ] 响应式断点（375px, 768px, 1024px）测试通过

---

## 🔗 相关资源

- 985Proxy API文档: `docs/985Proxy 开放 API 文档.md`
- 手机端UI设计: `docs/spec-workflow/全面修复和优化-2025-11-04/手机端UI设计方案.md`
- 开发习惯: `docs/MY-DEV-HABITS.md`
- 移动端响应式指南: `docs/移动端响应式使用指南.md`

---

**文档版本**: 1.0  
**创建者**: AI Assistant  
**审核者**: User








