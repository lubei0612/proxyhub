# ProxyHub 项目设计文档

## 📐 系统架构设计

### 整体架构
```
┌─────────────────────────────────────────────────────────────┐
│                         用户端/管理端                          │
│                     (Vue 3 + Element Plus)                  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                       Nginx (反向代理)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────┐          ┌──────▼────────┐
│   Frontend   │          │   Backend     │
│  (Nginx +    │          │  (NestJS)     │
│   Vue SPA)   │          │               │
└──────────────┘          └───────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
            ┌───────▼──────┐  ┌──▼──────┐  ┌──▼────────────┐
            │  PostgreSQL  │  │  Redis  │  │  985Proxy API │
            │  (Database)  │  │ (Cache) │  │  (External)   │
            └──────────────┘  └─────────┘  └───────────────┘
```

---

## 🗂️ 项目目录结构

### 后端目录结构
```
backend/
├── src/
│   ├── main.ts                      # 应用入口
│   ├── app.module.ts                # 根模块
│   ├── config/                      # 配置
│   │   ├── database.config.ts       # 数据库配置
│   │   ├── jwt.config.ts            # JWT配置
│   │   └── app.config.ts            # 应用配置
│   │
│   ├── common/                      # 通用模块
│   │   ├── decorators/              # 自定义装饰器
│   │   │   ├── public.decorator.ts  # @Public() 装饰器
│   │   │   └── roles.decorator.ts   # @Roles() 装饰器
│   │   ├── guards/                  # 守卫
│   │   │   ├── jwt-auth.guard.ts    # JWT认证守卫
│   │   │   └── roles.guard.ts       # 角色权限守卫
│   │   ├── filters/                 # 异常过滤器
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/            # 拦截器
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/                   # 管道
│   │   │   └── validation.pipe.ts
│   │   └── dto/                     # 通用DTO
│   │       ├── pagination.dto.ts
│   │       └── response.dto.ts
│   │
│   ├── modules/                     # 功能模块
│   │   ├── auth/                    # 认证模块
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── dto/
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── login.dto.ts
│   │   │   └── strategies/
│   │   │       ├── jwt.strategy.ts
│   │   │       └── local.strategy.ts
│   │   │
│   │   ├── user/                    # 用户模块
│   │   │   ├── user.module.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── dto/
│   │   │   │   ├── update-profile.dto.ts
│   │   │   │   └── change-password.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── proxy/                   # 代理模块
│   │   │   ├── proxy.module.ts
│   │   │   ├── proxy.service.ts
│   │   │   ├── proxy.controller.ts
│   │   │   ├── services/
│   │   │   │   └── proxy-985.service.ts  # 985Proxy API集成
│   │   │   ├── dto/
│   │   │   │   ├── extract-rotating.dto.ts
│   │   │   │   ├── purchase-static.dto.ts
│   │   │   │   └── renew-static.dto.ts
│   │   │   └── entities/
│   │   │       └── static-proxy.entity.ts
│   │   │
│   │   ├── order/                   # 订单模块
│   │   │   ├── order.module.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-order.dto.ts
│   │   │   │   └── query-order.dto.ts
│   │   │   └── entities/
│   │   │       └── order.entity.ts
│   │   │
│   │   ├── recharge/                # 充值模块
│   │   │   ├── recharge.module.ts
│   │   │   ├── recharge.service.ts
│   │   │   ├── recharge.controller.ts
│   │   │   ├── dto/
│   │   │   │   └── create-recharge.dto.ts
│   │   │   └── entities/
│   │   │       └── recharge.entity.ts
│   │   │
│   │   ├── billing/                 # 账单模块
│   │   │   ├── billing.module.ts
│   │   │   ├── billing.service.ts
│   │   │   ├── billing.controller.ts
│   │   │   └── entities/
│   │   │       ├── billing-detail.entity.ts
│   │   │       └── event-log.entity.ts
│   │   │
│   │   ├── statistics/              # 统计模块
│   │   │   ├── statistics.module.ts
│   │   │   ├── statistics.service.ts
│   │   │   ├── statistics.controller.ts
│   │   │   └── dto/
│   │   │       └── query-statistics.dto.ts
│   │   │
│   │   ├── price/                   # 价格模块
│   │   │   ├── price.module.ts
│   │   │   ├── price.service.ts
│   │   │   ├── price.controller.ts
│   │   │   ├── dto/
│   │   │   │   └── calculate-price.dto.ts
│   │   │   └── entities/
│   │   │       ├── price-config.entity.ts
│   │   │       └── price-override.entity.ts
│   │   │
│   │   ├── exchange-rate/           # 汇率模块
│   │   │   ├── exchange-rate.module.ts
│   │   │   ├── exchange-rate.service.ts
│   │   │   ├── exchange-rate.controller.ts
│   │   │   ├── dto/
│   │   │   │   └── update-rate.dto.ts
│   │   │   └── entities/
│   │   │       └── exchange-rate.entity.ts
│   │   │
│   │   ├── notification/            # 通知模块
│   │   │   ├── notification.module.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── entities/
│   │   │       ├── system-notification.entity.ts
│   │   │       └── user-notification.entity.ts
│   │   │
│   │   ├── admin/                   # 管理后台模块
│   │   │   ├── admin.module.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.controller.ts
│   │   │   └── dto/
│   │   │       ├── approve-recharge.dto.ts
│   │   │       ├── reject-recharge.dto.ts
│   │   │       └── manual-recharge.dto.ts
│   │   │
│   │   └── agent/                   # 代理商模块（可选）
│   │       ├── agent.module.ts
│   │       ├── agent.service.ts
│   │       ├── agent.controller.ts
│   │       └── entities/
│   │           └── commission.entity.ts
│   │
│   └── database/                    # 数据库
│       ├── migrations/              # 迁移脚本
│       │   ├── 001-init-tables.sql
│       │   ├── 002-create-views.sql
│       │   └── 003-create-triggers.sql
│       └── seeds/                   # 初始数据
│           └── admin-user-seed.sql
│
├── test/                            # 测试
├── .env.example                     # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
├── nest-cli.json
└── Dockerfile
```

### 前端目录结构
```
frontend/
├── src/
│   ├── main.ts                      # 应用入口
│   ├── App.vue                      # 根组件
│   │
│   ├── router/                      # 路由
│   │   └── index.ts
│   │
│   ├── stores/                      # Pinia状态管理
│   │   ├── user.ts                  # 用户状态
│   │   ├── app.ts                   # 应用状态
│   │   └── cart.ts                  # 购物车状态
│   │
│   ├── api/                         # API接口
│   │   ├── request.ts               # Axios封装
│   │   ├── auth.ts                  # 认证API
│   │   ├── proxy.ts                 # 代理API
│   │   ├── order.ts                 # 订单API
│   │   ├── recharge.ts              # 充值API
│   │   ├── statistics.ts            # 统计API
│   │   └── admin.ts                 # 管理API
│   │
│   ├── views/                       # 页面组件
│   │   ├── auth/                    # 认证页面
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   │
│   │   ├── dashboard/               # 仪表盘
│   │   │   └── Index.vue
│   │   │
│   │   ├── proxy/                   # 代理页面
│   │   │   ├── DynamicBuy.vue       # 动态代理购买
│   │   │   ├── StaticBuy.vue        # 静态代理购买
│   │   │   └── MyProxies.vue        # 我的代理
│   │   │
│   │   ├── order/                   # 订单页面
│   │   │   └── Index.vue
│   │   │
│   │   ├── wallet/                  # 钱包页面
│   │   │   └── Recharge.vue
│   │   │
│   │   ├── billing/                 # 账单页面
│   │   │   ├── Index.vue
│   │   │   ├── Transactions.vue
│   │   │   └── Expenses.vue
│   │   │
│   │   ├── profile/                 # 个人中心
│   │   │   └── Index.vue
│   │   │
│   │   ├── admin/                   # 管理后台
│   │   │   ├── Dashboard.vue
│   │   │   ├── Users.vue
│   │   │   ├── RechargeApproval.vue
│   │   │   ├── Orders.vue
│   │   │   ├── ProxyManagement.vue
│   │   │   └── Settings.vue
│   │   │
│   │   └── error/                   # 错误页面
│   │       └── 404.vue
│   │
│   ├── components/                  # 通用组件
│   │   ├── layout/                  # 布局组件
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppSidebar.vue
│   │   │   └── AppFooter.vue
│   │   │
│   │   ├── charts/                  # 图表组件
│   │   │   ├── LineChart.vue
│   │   │   ├── BarChart.vue
│   │   │   └── PieChart.vue
│   │   │
│   │   ├── proxy/                   # 代理相关组件
│   │   │   ├── ProxyCard.vue
│   │   │   └── ProxyTable.vue
│   │   │
│   │   └── common/                  # 通用组件
│   │       ├── CountryFlag.vue
│   │       ├── StatusTag.vue
│   │       └── CopyButton.vue
│   │
│   ├── composables/                 # 组合式函数
│   │   ├── useAuth.ts
│   │   ├── useTable.ts
│   │   └── useChart.ts
│   │
│   ├── utils/                       # 工具函数
│   │   ├── format.ts                # 格式化函数
│   │   ├── validate.ts              # 验证函数
│   │   └── storage.ts               # 本地存储
│   │
│   ├── styles/                      # 样式
│   │   ├── variables.scss           # SCSS变量
│   │   ├── mixins.scss              # SCSS混合
│   │   ├── global.scss              # 全局样式
│   │   └── theme.scss               # 主题样式
│   │
│   ├── locales/                     # 国际化
│   │   ├── zh-CN.ts                 # 中文
│   │   └── en-US.ts                 # 英文
│   │
│   └── types/                       # TypeScript类型定义
│       ├── api.d.ts
│       ├── user.d.ts
│       └── proxy.d.ts
│
├── public/                          # 静态资源
├── .env.development                 # 开发环境变量
├── .env.production                  # 生产环境变量
├── .gitignore
├── package.json
├── vite.config.ts
├── tsconfig.json
└── Dockerfile
```

---

## 🔐 认证与授权设计

### JWT认证流程
```
1. 用户登录 → 验证邮箱密码
2. 生成JWT Token（包含：userId, email, role）
3. 返回Token给前端
4. 前端存储Token（localStorage）
5. 后续请求携带Token（Authorization: Bearer <token>）
6. 后端验证Token → 提取用户信息 → 授权访问
```

### 角色权限设计
```typescript
// 角色枚举
enum UserRole {
  USER = 'user',      // 普通用户
  AGENT = 'agent',    // 代理商
  ADMIN = 'admin'     // 管理员
}

// 权限映射
const RolePermissions = {
  user: [
    'proxy:view',
    'proxy:buy',
    'order:view',
    'recharge:create',
  ],
  agent: [
    ...user_permissions,
    'commission:view',
    'referral:manage',
  ],
  admin: [
    '*:*',  // 所有权限
  ]
}

// 使用装饰器保护路由
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
getAdminDashboard() { }

// 公开接口（不需要认证）
@Public()
getCityList() { }
```

---

## 🗄️ 数据库设计详解

### ER图概览
```
users (用户表)
  ├─ 1:N → orders (订单表)
  ├─ 1:N → static_proxies (静态代理表)
  ├─ 1:N → recharges (充值表)
  ├─ 1:N → billing_details (账单明细表)
  ├─ 1:N → user_notifications (用户通知表)
  └─ 1:N → commissions (佣金表)

orders (订单表)
  └─ 1:N → static_proxies (静态代理表)

price_configs (价格配置表)
  └─ 1:N → price_overrides (价格覆盖表)
```

### 核心表设计

#### 1. users（用户表）
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  
  -- 余额字段
  balance DECIMAL(10, 2) DEFAULT 0,
  gift_balance DECIMAL(10, 2) DEFAULT 0,
  frozen_balance DECIMAL(10, 2) DEFAULT 0,
  
  -- 推荐系统
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  referred_by UUID REFERENCES users(id),
  
  -- 联系方式
  telegram_username VARCHAR(100),
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 索引
  INDEX idx_users_email (email),
  INDEX idx_users_referral_code (referral_code),
  INDEX idx_users_role (role)
);
```

#### 2. orders（订单表）
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- 订单信息
  proxy_type VARCHAR(50) NOT NULL,  -- dc/mobile/res_rotating/res_static
  product_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  promo_code VARCHAR(50),
  
  -- 支付信息
  payment_method VARCHAR(20) DEFAULT 'balance',  -- balance/gift
  status VARCHAR(20) DEFAULT 'pending',
  
  -- 使用统计
  traffic_used BIGINT DEFAULT 0,        -- 字节
  request_count INTEGER DEFAULT 0,
  
  -- 代理详情（JSON存储）
  proxy_details JSONB,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- 索引
  INDEX idx_orders_user_id (user_id),
  INDEX idx_orders_order_no (order_no),
  INDEX idx_orders_status (status),
  INDEX idx_orders_proxy_type (proxy_type),
  INDEX idx_orders_created_at (created_at)
);
```

#### 3. static_proxies（静态代理表）
```sql
CREATE TABLE static_proxies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  
  -- 985Proxy信息
  proxy_985_id INTEGER,
  zone VARCHAR(100),
  
  -- 代理信息
  ip VARCHAR(50) NOT NULL,
  port INTEGER NOT NULL,
  username VARCHAR(100),
  password VARCHAR(100),
  
  -- 地理位置
  country_code VARCHAR(10),
  city_name VARCHAR(100),
  
  -- 类型和场景
  static_proxy_type VARCHAR(20),  -- shared/premium
  purpose_web VARCHAR(100),
  
  -- 价格信息
  unit_price DECIMAL(10, 2),
  total_paid DECIMAL(10, 2),
  
  -- 有效期
  expire_time TIMESTAMP,
  release_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',  -- active/expired/released
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 索引
  INDEX idx_static_proxies_user_id (user_id),
  INDEX idx_static_proxies_order_id (order_id),
  INDEX idx_static_proxies_ip (ip),
  INDEX idx_static_proxies_status (status),
  INDEX idx_static_proxies_expire_time (expire_time)
);
```

#### 4. recharges（充值表）
```sql
CREATE TABLE recharges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  recharge_no VARCHAR(50) UNIQUE NOT NULL,
  
  -- 金额信息
  amount_usd DECIMAL(10, 2) NOT NULL,
  amount_cny DECIMAL(10, 2) NOT NULL,
  exchange_rate DECIMAL(10, 4) NOT NULL,
  
  -- 支付信息
  payment_method VARCHAR(20) NOT NULL,  -- wechat/usdt
  usdt_address VARCHAR(255),
  payment_proof VARCHAR(500),  -- 凭证URL
  
  -- 审批信息
  status VARCHAR(20) DEFAULT 'pending',  -- pending/approved/rejected
  admin_id UUID REFERENCES users(id),
  rejection_reason TEXT,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  
  -- 索引
  INDEX idx_recharges_user_id (user_id),
  INDEX idx_recharges_status (status),
  INDEX idx_recharges_created_at (created_at)
);
```

### 数据库视图

#### user_transactions（用户交易视图）
```sql
CREATE VIEW user_transactions AS
SELECT 
  id,
  user_id,
  'recharge' AS type,
  amount_usd AS amount,
  created_at,
  'Recharge' AS description
FROM recharges 
WHERE status = 'approved'

UNION ALL

SELECT 
  id,
  user_id,
  'consume' AS type,
  final_amount AS amount,
  created_at,
  product_name AS description
FROM orders 
WHERE status = 'completed'

ORDER BY created_at DESC;
```

### 数据库触发器

#### 订单完成触发器
```sql
CREATE OR REPLACE FUNCTION create_billing_detail_for_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO billing_details (
      user_id, type, reference_id, amount, 
      balance_before, balance_after, description
    ) VALUES (
      NEW.user_id, 'order', NEW.id, NEW.final_amount,
      (SELECT balance FROM users WHERE id = NEW.user_id),
      (SELECT balance FROM users WHERE id = NEW.user_id) - NEW.final_amount,
      'Order: ' || NEW.product_name
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_billing
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION create_billing_detail_for_order();
```

---

## 🔌 API接口设计

### API基础规范
- **Base URL**: `/api/v1`
- **认证方式**: `Authorization: Bearer <JWT_TOKEN>`
- **响应格式**: JSON
- **状态码**:
  - 200: 成功
  - 201: 创建成功
  - 400: 请求参数错误
  - 401: 未授权
  - 403: 无权限
  - 404: 资源不存在
  - 500: 服务器错误

### 统一响应格式
```typescript
// 成功响应
{
  "success": true,
  "data": { /* 响应数据 */ },
  "message": "操作成功"
}

// 失败响应
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}

// 分页响应
{
  "success": true,
  "data": {
    "items": [ /* 数据列表 */ ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### 核心API端点

#### 1. 认证模块（/auth）
```typescript
// 注册
POST /api/v1/auth/register
Body: {
  email: string;
  password: string;
  nickname?: string;
  referralCode?: string;  // 推荐人邀请码
}

// 登录
POST /api/v1/auth/login
Body: {
  email: string;
  password: string;
}
Response: {
  access_token: string;
  user: UserInfo;
}

// 登出
POST /api/v1/auth/logout
Headers: Authorization: Bearer <token>
```

#### 2. 用户模块（/users）
```typescript
// 获取个人信息
GET /api/v1/users/profile
Headers: Authorization: Bearer <token>

// 更新个人信息
PUT /api/v1/users/profile
Body: {
  nickname?: string;
  telegram_username?: string;
}

// 修改密码
POST /api/v1/users/change-password
Body: {
  oldPassword: string;
  newPassword: string;
}

// 获取余额信息
GET /api/v1/users/balance
```

#### 3. 代理模块（/proxy）
```typescript
// 【公开接口】获取城市列表
GET /api/v1/proxy/rotating/cities

// 提取动态代理
POST /api/v1/proxy/rotating/extract
Body: {
  zone: string;
  num: number;
  area?: string;
  state?: string;
  city?: string;
  life?: number;  // 1-120分钟
}

// 【公开接口】获取静态代理库存
GET /api/v1/proxy/static/inventory
Query: {
  static_proxy_type: 'shared' | 'premium';
  purpose_web?: string;
}

// 【公开接口】获取业务场景列表
GET /api/v1/proxy/static/business-list

// 购买静态代理
POST /api/v1/proxy/static/buy
Body: {
  zone: string;
  static_proxy_type: 'shared' | 'premium';
  time_period: number;  // 30的倍数
  purpose_web?: string;
  promo_code?: string;
  pay_type: 'balance' | 'gift';
  buy_data: [{
    country_code: string;
    city_name: string;
    count: number;
  }];
}

// 续费静态代理
POST /api/v1/proxy/static/renew
Body: {
  zone: string;
  time_period: number;
  renew_ip_list: string[];  // IP列表
  pay_type: 'balance' | 'gift';
}

// 获取我的静态代理
GET /api/v1/proxy/static/my-proxies
Query: {
  page?: number;
  pageSize?: number;
  is_expired?: 1 | 2 | 3;  // 1:全部 2:未过期 3:已过期
  is_released?: 1 | 2 | 3;
}
```

#### 4. 订单模块（/orders）
```typescript
// 获取我的订单
GET /api/v1/orders
Query: {
  page?: number;
  pageSize?: number;
  status?: string;
  proxy_type?: string;
}

// 获取订单详情
GET /api/v1/orders/:id

// 取消订单（pending状态）
POST /api/v1/orders/:id/cancel
```

#### 5. 充值模块（/recharges）
```typescript
// 创建充值申请
POST /api/v1/recharges
Body: {
  amount_usd: number;
  payment_method: 'wechat' | 'usdt';
  usdt_address?: string;
  payment_proof: string;  // 上传后的URL
}

// 获取我的充值记录
GET /api/v1/recharges
Query: {
  page?: number;
  pageSize?: number;
  status?: string;
}

// 获取充值详情
GET /api/v1/recharges/:id
```

#### 6. 账单模块（/billing）
```typescript
// 获取账单汇总
GET /api/v1/billing/summary

// 获取交易明细
GET /api/v1/billing/transactions
Query: {
  page?: number;
  pageSize?: number;
  type?: 'recharge' | 'consume' | 'commission';
  startDate?: string;
  endDate?: string;
}

// 获取费用明细
GET /api/v1/billing/expenses
Query: {
  page?: number;
  pageSize?: number;
}
```

#### 7. 统计模块（/statistics）
```typescript
// 获取仪表盘统计
GET /api/v1/statistics/dashboard

// 获取流量趋势
GET /api/v1/statistics/traffic
Query: {
  startDate: string;
  endDate: string;
  granularity: 'day' | 'week' | 'month';
}

// 获取请求趋势
GET /api/v1/statistics/requests
Query: {
  startDate: string;
  endDate: string;
  granularity: 'day' | 'week' | 'month';
}

// 获取成本分析
GET /api/v1/statistics/cost
Query: {
  startDate: string;
  endDate: string;
  granularity: 'day' | 'week' | 'month';
}

// 获取网络分布
GET /api/v1/statistics/network-distribution
```

#### 8. 价格模块（/price）
```typescript
// 计算价格
POST /api/v1/price/calculate
Body: {
  productType: 'static_shared' | 'static_premium';
  quantity: number;
  durationDays: number;
}

// 获取价格配置（管理员）
GET /api/v1/price/configs

// 更新价格配置（管理员）
PUT /api/v1/price/configs/:id
Body: {
  base_price: number;
  is_active: boolean;
}

// 创建价格覆盖（管理员）
POST /api/v1/price/overrides
Body: {
  price_config_id: string;
  country_code: string;
  city_name?: string;
  override_price: number;
}
```

#### 9. 汇率模块（/exchange-rate）
```typescript
// 获取当前汇率
GET /api/v1/exchange-rate/current
Query: {
  from: 'USD';
  to: 'CNY';
}

// 更新汇率（管理员）
POST /api/v1/exchange-rate/update
Body: {
  from_currency: 'USD';
  to_currency: 'CNY';
  rate: number;
}
```

#### 10. 管理后台模块（/admin）
```typescript
// 平台统计
GET /api/v1/admin/statistics

// 获取用户列表
GET /api/v1/admin/users
Query: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
  status?: string;
}

// 更新用户信息
PATCH /api/v1/admin/users/:id
Body: {
  nickname?: string;
  role?: string;
  status?: string;
}

// 手动调整余额
POST /api/v1/admin/users/:id/adjust-balance
Body: {
  type: 'balance' | 'gift_balance';
  amount: number;  // 正数增加，负数扣减
  reason: string;
}

// 获取充值列表
GET /api/v1/admin/recharges
Query: {
  page?: number;
  pageSize?: number;
  status?: string;
}

// 审批充值
POST /api/v1/admin/recharges/:id/approve

// 拒绝充值
POST /api/v1/admin/recharges/:id/reject
Body: {
  rejection_reason: string;
}

// 手动充值
POST /api/v1/admin/manual-recharge
Body: {
  user_id: string;
  amount: number;
  type: 'balance' | 'gift_balance';
  reason: string;
}

// 获取订单列表
GET /api/v1/admin/orders
Query: {
  page?: number;
  pageSize?: number;
  status?: string;
  user_id?: string;
}
```

---

## 🎨 前端设计规范

### 主题配置
```scss
// variables.scss
$primary-color: #00d9a3;
$secondary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;

$bg-dark: #1a1a1a;
$bg-dark-light: #2a2a2a;
$text-primary: #ffffff;
$text-secondary: #a8a8a8;

$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
```

### 组件设计原则
1. **复用性**: 所有重复UI封装成组件
2. **响应式**: 使用flex/grid布局，支持多端
3. **可配置**: 通过props传递配置
4. **类型安全**: 完整的TypeScript类型定义

### 关键组件设计

#### ProxyCard（代理卡片）
```vue
<template>
  <div class="proxy-card">
    <div class="country-flag">
      <img :src="getFlagUrl(countryCode)" />
    </div>
    <div class="info">
      <h3>{{ cityName }}</h3>
      <p>库存: {{ stock }}</p>
      <p class="price">${{ price }}/月</p>
    </div>
    <el-button @click="handleBuy">购买</el-button>
  </div>
</template>
```

#### StatisticsCard（统计卡片）
```vue
<template>
  <div class="statistics-card">
    <div class="icon">
      <el-icon :size="40"><component :is="icon" /></el-icon>
    </div>
    <div class="content">
      <h4>{{ title }}</h4>
      <p class="value">{{ value }}</p>
      <p class="change" :class="trendClass">
        {{ trend }}
      </p>
    </div>
  </div>
</template>
```

---

## 🔄 核心业务流程

### 1. 静态代理购买流程
```
用户浏览IP池
  ↓
选择国家/城市/数量
  ↓
添加到购物车（可多个）
  ↓
确认订单（查看价格）
  ↓
选择支付方式（余额/赠送金）
  ↓
提交订单
  ↓
后端调用985Proxy API购买
  ↓
保存代理信息到static_proxies表
  ↓
扣减用户余额
  ↓
创建订单记录
  ↓
返回成功，显示代理信息
```

### 2. 充值审批流程
```
用户提交充值申请
  ↓
上传支付凭证
  ↓
系统创建recharge记录（status=pending）
  ↓
管理员查看待审核列表
  ↓
查看充值详情（金额、凭证、用户信息）
  ↓
审批决策：
  ├─ 通过 → 
  │   ├─ 更新recharge.status = 'approved'
  │   ├─ 增加用户余额
  │   ├─ 创建billing_detail记录
  │   └─ 发送通知给用户
  └─ 拒绝 →
      ├─ 更新recharge.status = 'rejected'
      ├─ 填写rejection_reason
      └─ 发送通知给用户
```

### 3. 订单创建流程
```typescript
async createOrder(createOrderDto: CreateOrderDto) {
  // 1. 验证用户余额
  const user = await this.userService.findOne(userId);
  if (user.balance < createOrderDto.finalAmount) {
    throw new BadRequestException('余额不足');
  }

  // 2. 开启事务
  return await this.dataSource.transaction(async (manager) => {
    // 3. 创建订单
    const order = await manager.save(Order, {
      ...createOrderDto,
      status: 'processing'
    });

    // 4. 调用985Proxy API
    const proxyResult = await this.proxy985Service.buyStatic({
      zone: createOrderDto.zone,
      buy_data: createOrderDto.buyData,
      // ...
    });

    // 5. 保存代理信息
    const proxies = proxyResult.result.map(p => ({
      user_id: userId,
      order_id: order.id,
      proxy_985_id: p.id,
      ip: p.ip,
      // ...
    }));
    await manager.save(StaticProxy, proxies);

    // 6. 扣减余额
    await manager.update(User, { id: userId }, {
      balance: () => `balance - ${order.finalAmount}`
    });

    // 7. 更新订单状态
    await manager.update(Order, { id: order.id }, {
      status: 'completed',
      completed_at: new Date()
    });

    // 8. 创建账单记录（触发器自动）

    return order;
  });
}
```

---

## 🚀 部署架构

### Docker Compose配置
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: proxyhub
      POSTGRES_USER: proxy_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      REDIS_HOST: redis
      REDIS_PORT: 6379
      PROXY_985_API_KEY: ${PROXY_985_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  postgres_data:
```

---

## 📊 性能优化策略

### 数据库优化
1. **索引优化**: 为常查询字段创建索引
2. **查询优化**: 使用JOIN代替多次查询
3. **连接池**: 配置合理的连接池大小
4. **分页查询**: 避免一次性加载大量数据

### 后端优化
1. **缓存策略**: 
   - 汇率缓存（Redis, 1小时）
   - 城市列表缓存（Redis, 24小时）
2. **异步处理**: 使用Queue处理耗时任务
3. **DTO验证**: 使用class-validator提前验证

### 前端优化
1. **懒加载**: 路由懒加载，图表按需加载
2. **虚拟滚动**: 长列表使用虚拟滚动
3. **防抖节流**: 搜索、滚动等操作防抖
4. **资源压缩**: Gzip压缩，图片优化

---

**设计文档版本**: v1.0  
**创建日期**: 2025-11-01  
**状态**: ✅ 已完成


