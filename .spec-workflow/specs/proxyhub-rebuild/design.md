# ProxyHub 完整项目重建 - 技术设计文档

## 📋 设计概述

本文档详细说明ProxyHub代理IP管理平台的技术架构、数据模型、API设计和实现方案。

### 设计原则

1. **DESIGN-PRINCIPLE-1**: 模块化设计，高内聚低耦合
2. **DESIGN-PRINCIPLE-2**: RESTful API规范
3. **DESIGN-PRINCIPLE-3**: TypeScript类型安全
4. **DESIGN-PRINCIPLE-4**: 响应式UI设计
5. **DESIGN-PRINCIPLE-5**: 安全优先（JWT认证、数据加密）

---

## 🏗️ 系统架构

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (用户)                       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
           ┌─────────▼──────────┐
           │   Nginx (80/443)   │
           │   - 静态文件服务    │
           │   - 反向代理        │
           └─────┬──────────┬───┘
                 │          │
      ┌──────────▼──┐   ┌──▼─────────────┐
      │  Vue 3 SPA  │   │  NestJS API    │
      │  (前端)     │   │  (后端:3000)   │
      └─────────────┘   └───┬────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼────┐  ┌────▼─────┐  ┌───▼────────┐
        │PostgreSQL│  │  Redis   │  │985Proxy API│
        │  (5432)  │  │  (6379)  │  │ (第三方)   │
        └──────────┘  └──────────┘  └────────────┘
```

### 1.2 技术栈

**前端**:
- Vue 3.4+ (Composition API)
- TypeScript 5.3+
- Vite 5.0+ (构建工具)
- Element Plus 2.5+ (UI组件库)
- Pinia 2.1+ (状态管理)
- Vue Router 4.2+ (路由)
- Axios 1.6+ (HTTP客户端)
- ECharts 5.4+ (图表)
- vue-i18n 9.8+ (国际化)
- country-flag-icons 1.5+ (国旗图标)

**后端**:
- NestJS 10.0+ (Node.js框架)
- TypeScript 5.1+
- TypeORM 0.3+ (ORM)
- PostgreSQL 15+ (数据库)
- Redis 7.0+ (缓存)
- Passport.js + JWT (认证)
- bcrypt 5.1+ (密码加密)
- class-validator (参数验证)

**部署**:
- Docker + Docker Compose
- Nginx (反向代理)
- PM2 (进程管理，可选)

---

## 📊 数据库设计

### 2.1 数据库ER图

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   users     │◄───────►│  recharges   │         │   orders    │
│             │ 1     * │              │         │             │
│ - id        │         │ - id         │         │ - id        │
│ - email     │         │ - user_id    │         │ - user_id   │
│ - password  │         │ - amount     │         │ - order_no  │
│ - role      │         │ - status     │         │ - type      │
│ - balance   │         └──────────────┘         │ - amount    │
└─────┬───────┘                                  │ - status    │
      │                                          └─────────────┘
      │ 1
      │
      │ *
┌─────▼───────────┐       ┌──────────────┐       ┌─────────────┐
│ static_proxies  │       │transactions  │       │usage_records│
│                 │       │              │       │             │
│ - id            │       │ - id         │       │ - id        │
│ - user_id       │       │ - user_id    │       │ - user_id   │
│ - ip            │       │ - type       │       │ - proxy_type│
│ - port          │       │ - amount     │       │ - traffic_gb│
│ - country       │       │ - balance_   │       │ - date      │
│ - ip_type       │       │   before/    │       └─────────────┘
│ - expire_time   │       │   after      │
└─────────────────┘       └──────────────┘
```

### 2.2 核心数据表设计

#### 2.2.1 users (用户表)

```typescript
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt加密
  nickname VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',  -- 'user' | 'admin'
  balance DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active',  -- 'active' | 'disabled'
  api_key VARCHAR(64) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**对应Entity**: `backend/src/modules/user/entities/user.entity.ts`

#### 2.2.2 recharges (充值表)

```typescript
CREATE TABLE recharges (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,  -- 'alipay' | 'wechat' | 'bank'
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  remark TEXT,
  admin_remark TEXT,  -- 管理员审核备注
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recharges_user_id ON recharges(user_id);
CREATE INDEX idx_recharges_status ON recharges(status);
CREATE INDEX idx_recharges_order_no ON recharges(order_no);
```

#### 2.2.3 orders (订单表)

```typescript
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,  -- 'static' | 'dynamic' | 'mobile' | 'recharge'
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_type ON orders(type);
CREATE INDEX idx_orders_order_no ON orders(order_no);
```

#### 2.2.4 static_proxies (静态代理表)

```typescript
CREATE TABLE static_proxies (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  order_id INT REFERENCES orders(id),
  channel_name VARCHAR(100) NOT NULL,
  ip VARCHAR(50) NOT NULL,
  port INT NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  country VARCHAR(10) NOT NULL,  -- ISO 3166-1 alpha-2
  country_name VARCHAR(100) NOT NULL,
  city_name VARCHAR(100),
  ip_type VARCHAR(20) NOT NULL,  -- 'normal' | 'native'
  status VARCHAR(20) DEFAULT 'active',  -- 'active' | 'released' | 'expired'
  expire_time_utc TIMESTAMP NOT NULL,
  release_time_utc TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_static_proxies_user_id ON static_proxies(user_id);
CREATE INDEX idx_static_proxies_status ON static_proxies(status);
CREATE INDEX idx_static_proxies_country ON static_proxies(country);
CREATE INDEX idx_static_proxies_ip_type ON static_proxies(ip_type);
CREATE INDEX idx_static_proxies_expire_time ON static_proxies(expire_time_utc);
```

#### 2.2.5 transactions (交易记录表)

```typescript
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  transaction_no VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,  -- 'recharge' | 'purchase' | 'refund' | 'commission'
  amount DECIMAL(10,2) NOT NULL,  -- 正数为增加，负数为减少
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_transaction_no ON transactions(transaction_no);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

#### 2.2.6 usage_records (使用记录表)

```typescript
CREATE TABLE usage_records (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  proxy_type VARCHAR(20) NOT NULL,  -- 'dynamic' | 'static'
  traffic_gb DECIMAL(10,4) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX idx_usage_records_date ON usage_records(date);
CREATE INDEX idx_usage_records_proxy_type ON usage_records(proxy_type);
```

#### 2.2.7 system_settings (系统设置表)

```typescript
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始数据
INSERT INTO system_settings (key, value, description) VALUES
  ('usd_to_cny_rate', '7.2', 'USD到CNY汇率'),
  ('min_recharge_amount', '1', '最小充值金额(USD)'),
  ('max_recharge_amount', '10000', '最大充值金额(USD)'),
  ('telegram_link', 'https://t.me/lubei12', 'Telegram客服链接'),
  ('system_name', 'ProxyHub', '系统名称');
```

---

## 🔌 API设计

### 3.1 API规范

**Base URL**: `http://localhost:3000/api/v1`

**通用响应格式**:
```typescript
// 成功响应
{
  "success": true,
  "data": any,
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

**通用HTTP状态码**:
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 无权限
- `404` - 资源不存在
- `500` - 服务器错误

### 3.2 认证API (/auth)

#### POST /auth/register
注册新用户

**Request**:
```typescript
{
  "email": "user@example.com",
  "password": "Password123",
  "nickname": "用户昵称"  // 可选
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "用户昵称",
      "role": "user",
      "balance": 0
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

#### POST /auth/login
用户登录

**Request**:
```typescript
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response**: 同注册

#### POST /auth/admin-login
管理员登录（验证role='admin'）

**Request**: 同用户登录

**Response**: 同注册

#### POST /auth/refresh
刷新Token

**Request**:
```typescript
{
  "refresh_token": "eyJhbGc..."
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

### 3.3 用户API (/user)

#### GET /user/profile
获取当前用户信息

**Headers**: `Authorization: Bearer {token}`

**Response**:
```typescript
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "用户昵称",
    "role": "user",
    "balance": 100.50,
    "createdAt": "2025-10-31T10:00:00Z"
  }
}
```

#### PUT /user/profile
更新用户信息

**Request**:
```typescript
{
  "nickname": "新昵称"
}
```

#### PUT /user/password
修改密码

**Request**:
```typescript
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

### 3.4 静态代理API (/proxy/static)

#### GET /proxy/static/inventory
获取IP池库存（用于购买页面）

**Query Parameters**:
- `ipType`: 'normal' | 'native'
- `region`: 'europe' | 'americas' | 'asia' | 'oceania' | 'all'

**Response**:
```typescript
{
  "success": true,
  "data": [
    {
      "id": "ip-1",
      "countryCode": "US",
      "countryName": "美国",
      "cityName": "纽约",
      "region": "americas",
      "ipType": "normal",
      "stock": 100,
      "priceByDuration": {
        "30": 5,
        "60": 10,
        "90": 15,
        "180": 30
      }
    }
  ]
}
```

#### POST /proxy/static/purchase
购买静态代理

**Request**:
```typescript
{
  "channelName": "my-channel",
  "scenario": "Shopee",  // 可选
  "ipType": "normal",
  "duration": 30,  // 30, 60, 90, 180
  "items": [
    {
      "country": "us",
      "city": "纽约",
      "quantity": 2
    }
  ]
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "order": {
      "orderNo": "ORD-20251031-123456",
      "amount": 10.00,
      "quantity": 2
    },
    "newBalance": 90.50
  }
}
```

#### GET /proxy/static/my-ips
获取我的静态IP列表

**Query Parameters**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认100）
- `status`: 'active' | 'released' | 'expired'

**Response**:
```typescript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ip": "192.168.1.1",
      "port": 8080,
      "username": "user123",
      "password": "pass456",
      "country": "US",
      "countryCode": "US",
      "countryName": "美国",
      "cityName": "纽约",
      "ipType": "normal",
      "expireTimeUtc": "2025-11-30T00:00:00Z",
      "releaseTimeUtc": null,
      "status": "active"
    }
  ],
  "total": 10
}
```

#### POST /proxy/static/renew
续费静态代理

**Request**:
```typescript
{
  "zone": "residential_static",
  "time_period": 30,  // 30, 60, 90, 180
  "pay_type": "balance",
  "renew_ip_list": ["1", "2", "3"]  // IP ID列表
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "renewed_count": 3,
    "total_cost": 15.00,
    "new_balance": 75.50
  }
}
```

#### DELETE /proxy/static/release/:id
释放静态代理

**Response**:
```typescript
{
  "success": true,
  "message": "IP释放成功"
}
```

### 3.5 充值API (/billing/recharge)

#### POST /billing/recharge
提交充值申请

**Request**:
```typescript
{
  "amount": 100,
  "paymentMethod": "alipay",
  "remark": "备注信息"
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "orderNo": "RCH-20251031-123456",
    "amount": 100,
    "status": "pending"
  }
}
```

#### GET /billing/recharge/my-recharges
获取我的充值记录

**Query Parameters**:
- `page`, `limit`

**Response**:
```typescript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNo": "RCH-20251031-123456",
      "amount": 100,
      "paymentMethod": "alipay",
      "status": "pending",
      "remark": "备注",
      "createdAt": "2025-10-31T10:00:00Z"
    }
  ],
  "total": 5
}
```

### 3.6 订单API (/orders)

#### GET /orders
获取我的订单列表

**Query Parameters**:
- `page`, `limit`
- `status`, `type`

**Response**:
```typescript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNo": "ORD-20251031-123456",
      "type": "static",
      "amount": 10.00,
      "status": "completed",
      "remark": "购买静态代理",
      "createdAt": "2025-10-31T10:00:00Z"
    }
  ],
  "total": 10
}
```

#### GET /orders/:id
获取订单详情

#### DELETE /orders/:id/cancel
取消订单（仅pending状态）

### 3.7 交易记录API (/billing/transactions)

#### GET /billing/transactions
获取我的交易记录

**Query Parameters**:
- `page`, `limit`
- `type`: 'recharge' | 'purchase' | 'refund' | 'commission'

**Response**:
```typescript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "transactionNo": "TXN-20251031-123456",
      "type": "purchase",
      "amount": -10.00,
      "balanceBefore": 100.50,
      "balanceAfter": 90.50,
      "remark": "购买静态代理",
      "createdAt": "2025-10-31T10:00:00Z"
    }
  ],
  "total": 20
}
```

### 3.8 管理后台API (/admin)

#### GET /admin/users
获取用户列表（管理员）

**Query Parameters**:
- `page`, `limit`
- `role`, `status`
- `search`: 搜索邮箱或ID

**Response**:
```typescript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "nickname": "用户1",
      "role": "user",
      "balance": 100.50,
      "status": "active",
      "createdAt": "2025-10-31T10:00:00Z"
    }
  ],
  "total": 100
}
```

#### PUT /admin/users/:id
更新用户信息（管理员）

**Request**:
```typescript
{
  "role": "admin",
  "status": "disabled",
  "balance": 200.00
}
```

#### DELETE /admin/users/:id
删除用户（软删除）

#### GET /admin/recharges
获取充值审核列表

**Query Parameters**:
- `status`: 'pending' | 'approved' | 'rejected'

#### POST /admin/recharges/:id/approve
批准充值

**Request**:
```typescript
{
  "adminRemark": "审核通过"  // 可选
}
```

#### POST /admin/recharges/:id/reject
拒绝充值

**Request**:
```typescript
{
  "adminRemark": "拒绝原因"
}
```

#### GET /admin/orders
获取所有订单

#### PUT /admin/orders/:id
更新订单状态

#### GET /admin/ips/static
获取所有静态IP

**Query Parameters**:
- `page`, `limit`
- `country`, `ipType`, `status`
- `search`: 搜索IP或用户邮箱

#### POST /admin/ips/static/import
CSV导入IP

**Request**: FormData with file

#### GET /admin/ips/static/export
导出IP（TXT格式）

#### GET /admin/statistics/overview
获取统计概览

**Response**:
```typescript
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "todayNewUsers": 10,
    "totalOrders": 5000,
    "todayOrders": 50,
    "totalRevenue": 100000.00,
    "todayRevenue": 1000.00,
    "activeIPs": 2000,
    "expiringIPs": 100
  }
}
```

#### GET /admin/statistics/trends
获取趋势数据

**Query Parameters**:
- `metric`: 'users' | 'orders' | 'revenue'
- `days`: 默认30

#### GET /admin/statistics/distribution
获取分布数据（IP类型、国家）

#### GET /admin/settings
获取系统设置

#### PUT /admin/settings
更新系统设置

### 3.9 仪表盘API (/dashboard)

#### GET /dashboard/overview
获取用户仪表盘概览

**Response**:
```typescript
{
  "success": true,
  "data": {
    "balance": 100.50,
    "dynamicProxyCount": 5,
    "staticProxyCount": 10,
    "mobileProxyCount": 0,
    "recentOrders": [...],
    "usageData": [
      { "date": "2025-10-25", "traffic_gb": 2.5 },
      { "date": "2025-10-26", "traffic_gb": 3.1 }
    ]
  }
}
```

---

## 🎨 前端架构设计

### 4.1 目录结构

```
frontend/
├── src/
│   ├── api/                    # API接口层
│   │   ├── modules/
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── proxy.ts
│   │   │   ├── billing.ts
│   │   │   ├── order.ts
│   │   │   └── admin.ts
│   │   └── request.ts          # Axios配置
│   ├── assets/                 # 静态资源
│   │   ├── images/
│   │   └── styles/
│   │       ├── variables.scss
│   │       ├── mixins.scss
│   │       └── global.scss
│   ├── components/             # 公共组件
│   │   ├── common/
│   │   │   ├── FlagIcon.vue
│   │   │   └── LoadingSpinner.vue
│   │   ├── proxy/
│   │   │   ├── IPTypeSelector.vue
│   │   │   ├── ScenarioSelector.vue
│   │   │   ├── RegionTabs.vue
│   │   │   ├── CountryTabs.vue
│   │   │   ├── CountryCard.vue
│   │   │   └── PaymentPanel.vue
│   │   └── charts/
│   │       └── UsageLineChart.vue
│   ├── composables/            # 组合式函数
│   │   ├── useAuth.ts
│   │   ├── useStaticProxyPurchase.ts
│   │   └── useShoppingCart.ts
│   ├── constants/              # 常量定义
│   │   ├── pricing.ts          # 动态代理定价
│   │   ├── static-pricing.ts  # 静态代理定价
│   │   └── scenarios.ts        # 业务场景选项
│   ├── layouts/                # 布局组件
│   │   ├── AuthLayout.vue
│   │   ├── DashboardLayout.vue
│   │   └── AdminLayout.vue
│   ├── locales/                # 国际化
│   │   ├── zh-CN.json
│   │   └── en-US.json
│   ├── router/                 # 路由配置
│   │   ├── index.ts
│   │   └── guards.ts
│   ├── stores/                 # Pinia状态管理
│   │   ├── user.ts
│   │   ├── app.ts
│   │   └── admin.ts
│   ├── types/                  # TypeScript类型
│   │   ├── api.d.ts
│   │   ├── models.d.ts
│   │   └── global.d.ts
│   ├── utils/                  # 工具函数
│   │   ├── format.ts
│   │   ├── country-codes.ts
│   │   └── validate.ts
│   ├── views/                  # 页面组件
│   │   ├── auth/
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── dashboard/
│   │   │   └── Index.vue
│   │   ├── proxy/
│   │   │   ├── DynamicBuy.vue
│   │   │   ├── DynamicManage.vue
│   │   │   ├── StaticBuy.vue
│   │   │   ├── StaticManage.vue
│   │   │   └── MobilePlaceholder.vue
│   │   ├── billing/
│   │   │   └── Transactions.vue
│   │   ├── wallet/
│   │   │   └── Recharge.vue
│   │   ├── order/
│   │   │   └── Orders.vue
│   │   └── admin/
│   │       ├── Login.vue
│   │       ├── Users.vue
│   │       ├── RechargeApproval.vue
│   │       ├── Orders.vue
│   │       ├── IPManagement.vue
│   │       ├── Statistics.vue
│   │       └── Settings.vue
│   ├── App.vue
│   └── main.ts
├── public/
│   └── favicon.ico
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

### 4.2 路由设计

```typescript
// router/index.ts
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  // 认证路由（无需登录）
  {
    path: '/login',
    component: () => import('@/views/auth/Login.vue')
  },
  {
    path: '/register',
    component: () => import('@/views/auth/Register.vue')
  },
  // 用户路由（需要登录）
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/Index.vue')
      },
      {
        path: 'proxy/dynamic/buy',
        component: () => import('@/views/proxy/DynamicBuy.vue')
      },
      {
        path: 'proxy/dynamic/manage',
        component: () => import('@/views/proxy/DynamicManage.vue')
      },
      {
        path: 'proxy/static/buy',
        component: () => import('@/views/proxy/StaticBuy.vue')
      },
      {
        path: 'proxy/static/manage',
        component: () => import('@/views/proxy/StaticManage.vue')
      },
      {
        path: 'proxy/mobile',
        component: () => import('@/views/proxy/MobilePlaceholder.vue')
      },
      {
        path: 'wallet/recharge',
        component: () => import('@/views/wallet/Recharge.vue')
      },
      {
        path: 'billing/orders',
        component: () => import('@/views/order/Orders.vue')
      },
      {
        path: 'billing/transactions',
        component: () => import('@/views/billing/Transactions.vue')
      }
    ]
  },
  // 管理后台路由（需要管理员权限）
  {
    path: '/admin-portal/login',
    component: () => import('@/views/admin/Login.vue')
  },
  {
    path: '/admin-portal',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'users',
        component: () => import('@/views/admin/Users.vue')
      },
      {
        path: 'recharges',
        component: () => import('@/views/admin/RechargeApproval.vue')
      },
      {
        path: 'orders',
        component: () => import('@/views/admin/Orders.vue')
      },
      {
        path: 'ips',
        component: () => import('@/views/admin/IPManagement.vue')
      },
      {
        path: 'statistics',
        component: () => import('@/views/admin/Statistics.vue')
      },
      {
        path: 'settings',
        component: () => import('@/views/admin/Settings.vue')
      }
    ]
  }
]
```

### 4.3 状态管理设计

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')
  
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  async function login(email: string, password: string) {
    const response = await authApi.login({ email, password })
    token.value = response.data.access_token
    user.value = response.data.user
    localStorage.setItem('token', token.value)
  }
  
  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }
  
  function updateBalance(newBalance: number) {
    if (user.value) {
      user.value.balance = newBalance
    }
  }
  
  return { user, token, isLoggedIn, isAdmin, login, logout, updateBalance }
})
```

### 4.4 国旗图标组件设计

```vue
<!-- components/common/FlagIcon.vue -->
<template>
  <span class="flag-icon" :style="{ width: size + 'px', height: size + 'px' }">
    <img
      v-if="flagSvg"
      :src="flagSvg"
      :alt="countryCode"
      :width="size"
      :height="size"
      @error="handleError"
    />
    <span v-else class="flag-fallback">{{ countryCode }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  countryCode: string
  size?: number
}>()

const size = computed(() => props.size || 20)
const loadError = ref(false)

const flagSvg = computed(() => {
  if (loadError.value) return null
  try {
    // 使用 country-flag-icons 包的SVG格式
    return new URL(`/node_modules/country-flag-icons/3x2/${props.countryCode.toUpperCase()}.svg`, import.meta.url).href
  } catch {
    return null
  }
})

const handleError = () => {
  loadError.value = true
}
</script>

<style scoped>
.flag-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.flag-fallback {
  font-size: 10px;
  color: #909399;
  font-weight: bold;
}
</style>
```

---

## 🔧 后端架构设计

### 5.1 目录结构

```
backend/
├── src/
│   ├── modules/                # 业务模块
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   └── strategies/
│   │   │       ├── jwt.strategy.ts
│   │   │       └── local.strategy.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.module.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       └── update-user.dto.ts
│   │   ├── proxy/
│   │   │   ├── static/
│   │   │   │   ├── static-proxy.controller.ts
│   │   │   │   ├── static-proxy.service.ts
│   │   │   │   ├── entities/
│   │   │   │   │   └── static-proxy.entity.ts
│   │   │   │   └── dto/
│   │   │   │       ├── purchase-static.dto.ts
│   │   │   │       └── renew-static.dto.ts
│   │   │   └── proxy.module.ts
│   │   ├── billing/
│   │   │   ├── recharge.controller.ts
│   │   │   ├── recharge.service.ts
│   │   │   ├── transaction.controller.ts
│   │   │   ├── transaction.service.ts
│   │   │   ├── billing.module.ts
│   │   │   ├── entities/
│   │   │   │   ├── recharge.entity.ts
│   │   │   │   └── transaction.entity.ts
│   │   │   └── dto/
│   │   ├── order/
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.module.ts
│   │   │   ├── entities/
│   │   │   │   └── order.entity.ts
│   │   │   └── dto/
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       ├── admin.module.ts
│   │       └── dto/
│   ├── common/                 # 公共模块
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   ├── config/                 # 配置
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── redis.config.ts
│   ├── database/               # 数据库
│   │   └── migrations/
│   ├── utils/                  # 工具函数
│   │   ├── crypto.util.ts
│   │   └── order-number.util.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env.example
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### 5.2 认证流程设计

```typescript
// JWT认证流程
// 1. 用户登录 -> 2. 生成JWT Token -> 3. 客户端携带Token访问API -> 4. 验证Token

// strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub)
    if (!user) throw new UnauthorizedException()
    return user
  }
}

// guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) return true

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.includes(user.role)
  }
}
```

### 5.3 静态代理购买业务逻辑

```typescript
// static-proxy.service.ts
@Injectable()
export class StaticProxyService {
  constructor(
    @InjectRepository(StaticProxy)
    private staticProxyRepo: Repository<StaticProxy>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private transactionService: TransactionService,
  ) {}

  async purchase(userId: number, dto: PurchaseStaticDto) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. 验证用户余额
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } })
      const totalCost = this.calculateTotalCost(dto.items, dto.ipType, dto.duration)
      
      if (user.balance < totalCost) {
        throw new BadRequestException('余额不足')
      }

      // 2. 创建订单
      const order = queryRunner.manager.create(Order, {
        userId,
        orderNo: generateOrderNumber('ORD'),
        type: 'static',
        amount: totalCost,
        status: 'processing',
        remark: `购买${dto.items.length}个静态代理`,
      })
      await queryRunner.manager.save(order)

      // 3. 调用985Proxy API购买IP（模拟）
      const purchasedIPs = await this.purchase985ProxyIPs(dto)

      // 4. 保存IP到数据库
      const proxies = purchasedIPs.map(ip => 
        queryRunner.manager.create(StaticProxy, {
          userId,
          orderId: order.id,
          channelName: dto.channelName,
          ip: ip.ip,
          port: ip.port,
          username: ip.username,
          password: ip.password,
          country: ip.country,
          countryName: ip.countryName,
          cityName: ip.cityName,
          ipType: dto.ipType,
          status: 'active',
          expireTimeUtc: new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000),
        })
      )
      await queryRunner.manager.save(proxies)

      // 5. 扣除余额
      user.balance -= totalCost
      await queryRunner.manager.save(user)

      // 6. 创建交易记录
      await this.transactionService.create(queryRunner.manager, {
        userId,
        type: 'purchase',
        amount: -totalCost,
        balanceBefore: user.balance + totalCost,
        balanceAfter: user.balance,
        remark: `购买${proxies.length}个静态代理`,
      })

      // 7. 更新订单状态
      order.status = 'completed'
      await queryRunner.manager.save(order)

      await queryRunner.commitTransaction()

      return {
        order: {
          orderNo: order.orderNo,
          amount: totalCost,
          quantity: proxies.length,
        },
        newBalance: user.balance,
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private calculateTotalCost(items: any[], ipType: string, duration: number): number {
    const pricePerIP = getStaticPrice(ipType as 'normal' | 'native', duration)
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    return pricePerIP * totalQuantity
  }

  private async purchase985ProxyIPs(dto: PurchaseStaticDto) {
    // TODO: 对接真实的985Proxy API
    // 这里使用Mock数据
    return dto.items.flatMap(item => 
      Array.from({ length: item.quantity }, (_, i) => ({
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        port: 8080 + i,
        username: `user_${Date.now()}_${i}`,
        password: `pass_${Date.now()}_${i}`,
        country: item.country.toUpperCase(),
        countryName: item.country === 'us' ? '美国' : '其他',
        cityName: item.city,
      }))
    )
  }
}
```

---

## 🔒 安全设计

### 6.1 密码加密

```typescript
// utils/crypto.util.ts
import * as bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### 6.2 JWT Token配置

```typescript
// config/jwt.config.ts
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  accessTokenExpiry: '2h',
  refreshTokenExpiry: '7d',
}
```

### 6.3 API限流

```typescript
// 使用Nest.js的ThrottlerModule
import { ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,  // 100请求/分钟
    }),
  ],
})
export class AppModule {}
```

---

## 📦 部署设计

### 7.1 Docker Compose配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: proxyhub-postgres
    environment:
      POSTGRES_DB: proxyhub
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - proxyhub-network

  redis:
    image: redis:7-alpine
    container_name: proxyhub-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - proxyhub-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: proxyhub-backend
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: postgres
      DATABASE_PASSWORD: postgres123
      DATABASE_NAME: proxyhub
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    networks:
      - proxyhub-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: proxyhub-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - proxyhub-network

volumes:
  postgres_data:
  redis_data:

networks:
  proxyhub-network:
    driver: bridge
```

### 7.2 前端Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 7.3 后端Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 7.4 Nginx配置

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # 前端静态文件
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://backend:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

---

## 🧪 测试策略

### 8.1 后端单元测试

```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService
  let repository: Repository<User>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  it('should create a new user', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'Password123',
    }
    
    jest.spyOn(repository, 'create').mockReturnValue(dto as any)
    jest.spyOn(repository, 'save').mockResolvedValue({ id: 1, ...dto } as any)

    const result = await service.create(dto)
    expect(result).toHaveProperty('id')
  })
})
```

### 8.2 E2E测试

```typescript
// auth.e2e-spec.ts
describe('Auth (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true)
        expect(res.body.data).toHaveProperty('access_token')
      })
  })
})
```

---

## 📝 开发规范

### 9.1 代码风格

- 使用Prettier格式化
- 遵循ESLint规则
- TypeScript严格模式
- 组件/函数使用JSDoc注释

### 9.2 Git Commit规范

遵循Conventional Commits：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型**:
- `feat`: 新功能
- `fix`: 修复Bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**:
```
feat(auth): 实现用户注册功能

- 添加注册API端点
- 实现邮箱验证
- 密码强度检查

Closes #123
```

---

## 📊 性能优化

### 10.1 前端优化

- **代码分割**: 路由懒加载
- **图片优化**: WebP格式
- **CDN加速**: 静态资源CDN
- **缓存策略**: LocalStorage + SessionStorage
- **防抖节流**: 搜索/滚动事件

### 10.2 后端优化

- **数据库索引**: 所有外键和查询字段
- **N+1查询优化**: 使用join或eager loading
- **Redis缓存**: 热点数据缓存5分钟
- **连接池**: 数据库连接池最大100
- **查询优化**: 分页查询、字段选择

### 10.3 数据库优化

```sql
-- 索引优化
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_static_proxies_user_id ON static_proxies(user_id);
CREATE INDEX idx_static_proxies_expire_time ON static_proxies(expire_time_utc);
CREATE INDEX idx_transactions_user_id_created_at ON transactions(user_id, created_at DESC);

-- 查询优化示例
-- 避免SELECT *，只查询需要的字段
SELECT id, email, balance FROM users WHERE id = $1;
```

---

## 🔍 监控与日志

### 11.1 日志级别

- **ERROR**: 错误日志（需要立即处理）
- **WARN**: 警告日志（需要关注）
- **INFO**: 信息日志（业务流程）
- **DEBUG**: 调试日志（开发调试）

### 11.2 关键日志点

- 用户登录/注册
- 余额变动
- 订单创建/完成
- API调用失败
- 数据库错误

---

## 📚 依赖关系图

```
User Module
    ↓
Auth Module ←→ JWT Strategy
    ↓
Proxy Module → Order Module → Transaction Module
    ↓              ↓              ↓
Static Proxy   Billing       User Balance Update
    ↓
985Proxy API
```

---

## ✅ 设计验证清单

- [ ] 所有API端点定义完整
- [ ] 数据库表结构设计完整
- [ ] 前后端接口契约明确
- [ ] 认证授权机制设计合理
- [ ] 错误处理策略完善
- [ ] 性能优化方案可行
- [ ] 安全措施充分
- [ ] 部署方案可行
- [ ] 测试策略完整

---

**文档版本**: v1.0  
**创建日期**: 2025-10-31  
**作者**: AI开发团队  
**审核状态**: 待审核

