# ProxyHub 项目需求文档

## 📋 项目概述

**项目名称**: ProxyHub - 代理IP管理平台  
**项目类型**: 全栈Web应用  
**目标**: 从混乱的代码库中提炼核心功能，重建一个干净、结构化的代理IP管理平台

---

## 🎯 核心功能需求

### 1. 用户认证与授权

#### 1.1 用户注册
- 支持邮箱注册
- 密码强度验证
- 邮箱唯一性验证
- 自动生成唯一邀请码

#### 1.2 用户登录
- 邮箱 + 密码登录
- JWT Token 认证
- Token过期时间：7天
- 支持记住登录状态

#### 1.3 角色权限
三种用户角色：
- **user**: 普通用户 - 购买和使用代理
- **agent**: 代理商 - 可发展下级用户，获取佣金
- **admin**: 管理员 - 完全访问权限

---

### 2. 代理IP管理（核心功能）

#### 2.1 动态住宅代理（res_rotating）
- **城市列表查询**: 获取可用国家/州/城市列表
- **代理提取**: 
  - 支持按国家/州/城市筛选
  - 支持自定义代理时效（最长120分钟）
  - 支持多种响应格式（TXT/JSON）
  - 支持自定义代理格式

#### 2.2 静态住宅代理（res_static）
- **IP池查询**: 
  - 获取库存列表（按国家/城市分组）
  - 显示库存数量和价格
  - 区分普通IP（shared）和原生IP（premium）
- **购买流程**:
  - 选择国家/城市/数量
  - 选择购买时长（30天的倍数）
  - 选择业务场景
  - 支持优惠码
  - 支持余额支付/赠送金支付
- **续费功能**:
  - 批量选择要续费的IP
  - 选择续费时长
- **我的代理**:
  - 查看已购买的代理列表
  - 显示IP、端口、账号、密码
  - 显示过期时间和释放时间
  - 支持筛选（过期状态、释放状态）

#### 2.3 业务场景
支持多种业务场景：
- 电商
- 社交媒体
- 数据采集
- SEO
- 广告验证
等

---

### 3. 订单管理

#### 3.1 订单创建
- 自动生成订单号
- 记录订单详情（商品、数量、价格）
- 支持优惠码折扣
- 记录代理类型（dc/mobile/res_rotating/res_static）

#### 3.2 订单状态
- **pending**: 待支付
- **processing**: 处理中
- **completed**: 已完成
- **failed**: 失败
- **cancelled**: 已取消

#### 3.3 订单查询
- 用户查看自己的订单历史
- 支持按状态筛选
- 支持分页查询
- 管理员可查看所有订单

---

### 4. 充值与账单系统

#### 4.1 钱包充值
- **充值申请**:
  - 输入充值金额（美元）
  - 自动换算人民币（实时汇率）
  - 选择支付方式（微信/USDT）
  - USDT充值提供地址
  - 上传支付凭证
- **充值状态**:
  - pending: 待审核
  - approved: 已通过（自动到账）
  - rejected: 已拒绝
- **Telegram客服**: 点击按钮直达Telegram客服

#### 4.2 汇率管理
- 支持USD ↔ CNY换算
- 汇率可由管理员手动更新
- 内存缓存（1小时TTL）
- 默认汇率：1 USD = 7.25 CNY

#### 4.3 余额管理
- 余额字段：
  - `balance`: 可用余额
  - `gift_balance`: 赠送金余额（不可提现）
  - `frozen_balance`: 冻结金额
- 余额操作：
  - 充值（增加balance）
  - 消费（扣减balance或gift_balance）
  - 冻结/解冻

#### 4.4 账单明细
- **费用明细**（billing_details表）:
  - 记录每笔订单费用
  - 记录每笔充值记录
  - 自动触发器创建
- **交易明细**（user_transactions视图）:
  - 统一查看充值和消费记录
  - 支持按类型筛选（recharge/consume/commission）
  - 支持时间范围查询

---

### 5. 统计分析

#### 5.1 用户仪表盘
显示个人统计数据：
- 总支出
- 当月支出
- 代理数量（动态/静态）
- 流量使用情况
- 请求次数
- 最近订单

#### 5.2 统计图表
- **流量趋势图**: 按时间显示流量使用（日/周/月）
- **请求趋势图**: 按时间显示请求次数
- **成本分析图**: 按时间显示消费金额
- **网络分布饼图**: 按代理类型分布（dc/mobile/res_rotating/res_static）

#### 5.3 管理后台统计
- 平台总用户数
- 今日新增用户
- 总订单数
- 待审核充值数
- 平台总收入
- 今日收入

---

### 6. 管理后台

#### 6.1 用户管理
- 查看所有用户列表（分页）
- 查看用户详细信息
- 修改用户信息（昵称、角色、状态）
- 修改用户余额（手动调整）
- 冻结/解冻用户账户

#### 6.2 充值审核
- 查看待审核充值列表
- 查看充值详情（金额、凭证、用户信息）
- 审批操作：
  - **通过**: 自动增加用户余额，创建账单记录
  - **拒绝**: 填写拒绝原因，发送通知
- 批量审批功能

#### 6.3 手动充值
管理员直接为用户充值：
- 选择用户
- 输入金额
- 选择类型（余额/赠送金）
- 填写备注

#### 6.4 订单管理
- 查看所有订单
- 订单详情查看
- 订单状态修改
- 订单退款（可选）

#### 6.5 代理IP管理
- 查看所有静态代理
- 导入代理（CSV）
- 导出代理（CSV/Excel）
- 批量操作

#### 6.6 价格配置
- 配置基础价格（按代理类型）
- 配置价格覆盖（特定国家/城市的价格）
- 价格计算预览

#### 6.7 系统设置
- 平台名称配置
- 汇率管理
- Telegram客服链接
- 985Proxy API配置

---

### 7. 通知系统

#### 7.1 系统通知
- 订单状态变化通知
- 充值审批结果通知
- IP即将过期提醒
- 余额不足提醒

#### 7.2 通知模板
预定义通知模板：
- 订单完成
- 订单失败
- 充值通过
- 充值拒绝
- IP即将过期
- 余额不足

#### 7.3 用户通知设置
用户可自定义通知偏好：
- 邮件通知开关
- 订单通知开关
- 余额通知开关
- IP过期提醒开关

---

### 8. 代理商系统（可选）

#### 8.1 邀请功能
- 每个用户有唯一邀请码
- 分享邀请链接
- 查看邀请列表

#### 8.2 佣金系统
- 下级用户消费产生佣金
- 佣金比例可配置
- 佣金记录查询
- 佣金提现（可选）

---

## 🔧 第三方集成

### 985Proxy API集成
**API Base URL**: `https://open-api.985proxy.com`

#### 必需接口
1. **动态住宅**:
   - `GET /res_rotating/city_list` - 城市列表
   - `GET /res_rotating/extract` - 提取代理

2. **静态住宅**:
   - `GET /res_static/inventory` - 库存查询
   - `GET /res_static/business_list` - 业务场景列表
   - `POST /res_static/calculate` - 价格计算
   - `POST /res_static/buy` - 购买下单
   - `POST /res_static/renew` - 续费下单
   - `POST /res_static/order_result` - 订单结果查询
   - `GET /res_static/ip_list` - IP列表查询
   - `GET /res_static/ip_detail` - IP详情查询

#### 认证方式
- API Key认证（通过query参数`apikey`传递）
- 需要在环境变量中配置`PROXY_985_API_KEY`

---

## 💾 数据库设计

### 核心数据表

#### 1. users（用户表）
```sql
- id: UUID (主键)
- email: VARCHAR (唯一)
- password: VARCHAR (bcrypt加密)
- nickname: VARCHAR
- role: VARCHAR (user/agent/admin)
- status: VARCHAR (active/inactive/banned)
- balance: DECIMAL (可用余额)
- gift_balance: DECIMAL (赠送金)
- frozen_balance: DECIMAL (冻结金额)
- referral_code: VARCHAR (唯一邀请码)
- referred_by: UUID (推荐人ID)
- telegram_username: VARCHAR
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. orders（订单表）
```sql
- id: UUID (主键)
- order_no: VARCHAR (唯一订单号)
- user_id: UUID (外键 -> users)
- proxy_type: VARCHAR (dc/mobile/res_rotating/res_static)
- product_name: VARCHAR
- quantity: INTEGER
- unit_price: DECIMAL
- total_amount: DECIMAL
- discount_amount: DECIMAL
- final_amount: DECIMAL
- promo_code: VARCHAR
- status: VARCHAR (pending/processing/completed/failed/cancelled)
- payment_method: VARCHAR (balance/gift)
- traffic_used: BIGINT (流量使用字节数)
- request_count: INTEGER (请求次数)
- proxy_details: JSONB (代理详情)
- created_at: TIMESTAMP
- completed_at: TIMESTAMP
```

#### 3. static_proxies（静态代理表）
```sql
- id: UUID (主键)
- user_id: UUID (外键 -> users)
- order_id: UUID (外键 -> orders)
- proxy_985_id: INTEGER (985Proxy的代理ID)
- zone: VARCHAR (通道标识)
- ip: VARCHAR
- port: INTEGER
- username: VARCHAR
- password: VARCHAR
- country_code: VARCHAR
- city_name: VARCHAR
- static_proxy_type: VARCHAR (shared/premium)
- purpose_web: VARCHAR (业务场景)
- unit_price: DECIMAL
- total_paid: DECIMAL
- expire_time: TIMESTAMP
- release_time: TIMESTAMP
- status: VARCHAR (active/expired/released)
- created_at: TIMESTAMP
```

#### 4. recharges（充值表）
```sql
- id: UUID (主键)
- user_id: UUID (外键 -> users)
- recharge_no: VARCHAR (唯一充值单号)
- amount_usd: DECIMAL (美元金额)
- amount_cny: DECIMAL (人民币金额)
- exchange_rate: DECIMAL (汇率)
- payment_method: VARCHAR (wechat/usdt)
- usdt_address: VARCHAR
- payment_proof: VARCHAR (凭证URL)
- status: VARCHAR (pending/approved/rejected)
- admin_id: UUID (审批人ID)
- rejection_reason: TEXT
- created_at: TIMESTAMP
- processed_at: TIMESTAMP
```

#### 5. price_configs（价格配置表）
```sql
- id: UUID (主键)
- product_type: VARCHAR (static_shared/static_premium)
- base_price: DECIMAL (基础价格，每IP每月美元）
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 6. price_overrides（价格覆盖表）
```sql
- id: UUID (主键)
- price_config_id: UUID (外键 -> price_configs)
- country_code: VARCHAR
- city_name: VARCHAR
- override_price: DECIMAL
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 7. exchange_rates（汇率表）
```sql
- id: UUID (主键)
- from_currency: VARCHAR (USD)
- to_currency: VARCHAR (CNY)
- rate: DECIMAL
- updated_at: TIMESTAMP
```

#### 8. billing_details（账单明细表）
```sql
- id: UUID (主键)
- user_id: UUID (外键 -> users)
- type: VARCHAR (order/recharge/commission)
- reference_id: UUID (关联订单ID或充值ID)
- amount: DECIMAL
- balance_before: DECIMAL
- balance_after: DECIMAL
- description: TEXT
- created_at: TIMESTAMP
```

#### 9. event_logs（事件日志表）
```sql
- id: UUID (主键)
- user_id: UUID (外键 -> users)
- event_type: VARCHAR (login/order/recharge等)
- description: TEXT
- ip_address: VARCHAR
- status: VARCHAR (success/failed)
- created_at: TIMESTAMP
```

#### 10. system_notifications（系统通知模板表）
```sql
- id: UUID (主键)
- type: VARCHAR (order_complete/recharge_approved等)
- title: VARCHAR
- content: TEXT
- is_active: BOOLEAN
```

#### 11. user_notifications（用户通知表）
```sql
- id: UUID (主键)
- user_id: UUID (外键 -> users)
- title: VARCHAR
- content: TEXT
- type: VARCHAR
- is_read: BOOLEAN
- created_at: TIMESTAMP
- read_at: TIMESTAMP
```

#### 12. commissions（佣金表，可选）
```sql
- id: UUID (主键)
- agent_id: UUID (外键 -> users)
- user_id: UUID (被推荐用户)
- order_id: UUID (外键 -> orders)
- amount: DECIMAL
- status: VARCHAR (pending/paid)
- created_at: TIMESTAMP
- paid_at: TIMESTAMP
```

### 数据库视图

#### user_transactions（用户交易视图）
统一展示充值和消费记录
```sql
SELECT 
  id, user_id, type, amount, 
  created_at, description
FROM (
  SELECT id, user_id, 'recharge' as type, 
         amount_usd as amount, created_at, 
         'Recharge' as description
  FROM recharges WHERE status = 'approved'
  UNION ALL
  SELECT id, user_id, 'consume' as type,
         final_amount as amount, created_at,
         product_name as description
  FROM orders WHERE status = 'completed'
) combined
ORDER BY created_at DESC
```

---

## 🎨 UI/UX需求

### 设计风格
- **主题**: 深色主题为主（dark mode）
- **主色调**: 绿色 (#00d9a3)
- **辅助色**: 蓝色、紫色
- **布局**: 现代化、简洁、响应式

### 关键页面

#### 用户端
1. **登录/注册页面**: 居中卡片式，背景渐变
2. **仪表盘**: 统计卡片 + 图表展示
3. **代理购买页面**: 
   - 动态代理：表单式提取
   - 静态代理：卡片式IP池展示
4. **我的代理**: 表格展示，支持筛选和操作
5. **订单列表**: 表格 + 状态标签
6. **钱包充值**: 表单 + 实时汇率换算
7. **账单明细**: 多tab（费用明细/交易明细）
8. **个人设置**: 表单式，分区展示

#### 管理端
1. **管理后台登录**: 独立登录页
2. **管理仪表盘**: 平台统计卡片
3. **用户管理**: 表格 + 搜索 + 操作
4. **充值审核**: 列表 + 详情弹窗 + 审批按钮
5. **订单管理**: 表格 + 筛选
6. **代理管理**: 表格 + 导入导出
7. **系统设置**: 表单式配置

### 交互要求
- 所有表格支持分页
- 所有表单需要验证
- 操作需要确认弹窗（删除、审批等）
- 加载状态显示loading
- 错误提示友好
- 成功操作有反馈（消息提示）

---

## 🔐 安全需求

1. **密码加密**: 使用bcrypt加密存储
2. **JWT认证**: Token有效期7天
3. **角色鉴权**: 使用Guards保护路由
4. **SQL注入防护**: 使用TypeORM参数化查询
5. **XSS防护**: 前端输入验证和转义
6. **CORS配置**: 限制允许的域名
7. **环境变量**: 敏感信息不硬编码
8. **API Rate Limiting**: 防止API滥用（可选）

---

## 📱 响应式需求

- **桌面端**: 完整功能，1920x1080最佳
- **平板端**: 适配布局，1024x768
- **手机端**: 核心功能可用，375x667最小

---

## 🌍 国际化需求

支持双语：
- **中文（简体）**: 默认语言
- **英文**: 可切换

需要翻译的模块：
- 导航菜单
- 表单标签
- 错误提示
- 通知消息
- 图表标签

---

## 🚀 性能需求

1. **页面加载**: 首屏 < 2秒
2. **API响应**: < 500ms
3. **数据库查询**: 添加索引优化
4. **图表渲染**: 使用ECharts按需加载
5. **图片优化**: 压缩上传图片
6. **缓存策略**: 
   - 汇率缓存1小时
   - 城市列表缓存24小时

---

## 🧪 测试需求

1. **单元测试**: 核心Service层
2. **API测试**: 使用Postman或curl
3. **功能测试**: 手动测试关键流程
4. **测试数据**: 
   - 创建测试用户
   - 生成测试订单
   - 模拟充值记录

---

## 📦 部署需求

### 开发环境
- Docker + Docker Compose
- 本地数据库（PostgreSQL）
- 本地Redis（可选）

### 生产环境
- 腾讯云服务器（已有）
- Docker部署
- Nginx反向代理
- SSL证书配置（可选）
- PM2进程管理（备选方案）

---

## 📝 文档需求

需要提供的文档：
1. **README.md**: 项目介绍和快速开始
2. **DEPLOYMENT.md**: 部署指南
3. **API.md**: API接口文档
4. **DATABASE.md**: 数据库设计文档
5. **.env.example**: 环境变量示例

---

## ✅ 验收标准

### 功能完整性
- [ ] 用户可以注册、登录
- [ ] 用户可以购买动态代理
- [ ] 用户可以购买静态代理
- [ ] 用户可以查看我的代理
- [ ] 用户可以充值
- [ ] 用户可以查看订单
- [ ] 用户可以查看账单
- [ ] 用户可以查看统计图表
- [ ] 管理员可以审批充值
- [ ] 管理员可以管理用户
- [ ] 管理员可以查看平台统计

### 代码质量
- [ ] TypeScript类型完整
- [ ] 代码结构清晰（模块化）
- [ ] 无编译错误
- [ ] 无明显Bug
- [ ] Git提交规范

### UI/UX
- [ ] 界面美观现代
- [ ] 交互流畅
- [ ] 响应式布局
- [ ] 错误提示友好

### 部署
- [ ] Docker一键启动
- [ ] 数据库自动初始化
- [ ] 环境变量配置完整

---

## 🎯 项目优先级

### P0（必须）
1. 用户认证系统
2. 985Proxy API集成
3. 静态代理购买流程
4. 充值审批流程
5. 订单管理
6. 基础管理后台

### P1（重要）
1. 动态代理提取
2. 统计图表
3. 账单系统
4. 通知系统
5. 价格管理

### P2（可选）
1. 代理商佣金系统
2. 高级统计分析
3. 批量操作
4. 导入导出功能
5. 国际化

---

## 📊 技术栈确认

### 后端
- **框架**: NestJS 10.x
- **语言**: TypeScript 5.x
- **ORM**: TypeORM 0.3.x
- **数据库**: PostgreSQL 15
- **认证**: JWT + Passport
- **加密**: bcrypt

### 前端
- **框架**: Vue 3.4
- **语言**: TypeScript 5.x
- **UI库**: Element Plus 2.5
- **图表**: ECharts 5.4
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP**: Axios

### 部署
- **容器**: Docker + Docker Compose
- **Web服务器**: Nginx
- **进程管理**: PM2（备选）

---

**本需求文档版本**: v1.0  
**创建日期**: 2025-11-01  
**状态**: ✅ 已完成


