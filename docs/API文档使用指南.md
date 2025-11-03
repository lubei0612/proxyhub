# ProxyHub API文档使用指南

**API版本**: v1.0.0  
**文档生成时间**: 2025-11-03  
**Swagger UI地址**: http://localhost:3000/api

---

## 📚 目录

1. [快速开始](#快速开始)
2. [认证方式](#认证方式)
3. [API分类](#api分类)
4. [错误码说明](#错误码说明)
5. [请求示例](#请求示例)
6. [响应格式](#响应格式)

---

## 🚀 快速开始

### 访问Swagger文档

启动后端服务后，访问：
```
http://localhost:3000/api
```

### API基础URL

```
http://localhost:3000/api/v1
```

### 认证Token获取

```bash
# 登录获取Token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# 响应示例
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## 🔐 认证方式

### Bearer Token

所有需要认证的接口都使用JWT Bearer Token：

```bash
curl -X GET http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Swagger UI认证

1. 点击页面右上角的 **Authorize** 按钮
2. 输入Token（格式：`Bearer YOUR_ACCESS_TOKEN`）
3. 点击 **Authorize**
4. 现在可以直接在Swagger UI测试需要认证的接口

---

## 📖 API分类

### 1. Auth - 认证相关（6个接口）

| 接口 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| 用户注册 | POST | /auth/register | 新用户注册 | ❌ |
| 用户登录 | POST | /auth/login | 用户登录获取Token | ❌ |
| 刷新Token | POST | /auth/refresh | 刷新访问Token | ✅ |
| 获取个人信息 | GET | /auth/me | 获取当前用户信息 | ✅ |
| 修改密码 | PUT | /auth/password | 修改当前用户密码 | ✅ |
| 登出 | POST | /auth/logout | 用户登出 | ✅ |

---

### 2. User - 用户相关（4个接口）

| 接口 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| 获取用户信息 | GET | /user/profile | 获取用户详细信息 | ✅ |
| 更新用户信息 | PUT | /user/profile | 更新用户资料 | ✅ |
| 获取账户余额 | GET | /user/balance | 获取账户余额信息 | ✅ |
| 更新头像 | POST | /user/avatar | 上传用户头像 | ✅ |

---

### 3. Proxy - 代理相关（10个接口）

#### 3.1 静态代理

| 接口 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| 获取代理列表 | GET | /proxy/static/list | 获取用户的静态代理列表 | ✅ |
| 购买静态代理 | POST | /proxy/static/purchase | 购买静态代理IP | ✅ |
| 续费代理 | POST | /proxy/static/:id/renew | 续费指定代理IP | ✅ |
| 切换自动续费 | PUT | /proxy/static/:id/auto-renew | 开启/关闭自动续费 | ✅ |
| 更新备注 | PUT | /proxy/static/:id/remark | 更新代理IP备注 | ✅ |
| 获取库存 | GET | /proxy/static/inventory | 获取可用库存信息 | ✅ |

#### 3.2 动态代理

| 接口 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| 获取计划列表 | GET | /proxy/dynamic/plans | 获取动态代理计划 | ✅ |
| 购买动态代理 | POST | /proxy/dynamic/purchase | 购买动态代理计划 | ✅ |
| 获取用量统计 | GET | /proxy/dynamic/usage | 获取动态代理用量 | ✅ |

---

### 4. Billing - 账单相关（6个接口）

| 接口 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| 创建充值订单 | POST | /billing/recharge | 创建充值申请 | ✅ |
| 获取充值记录 | GET | /billing/recharges | 获取用户充值记录 | ✅ |
| 获取交易记录 | GET | /billing/transactions | 获取用户交易明细 | ✅ |
| 导出账单 | GET | /billing/export | 导出账单数据 | ✅ |
| 获取余额变动 | GET | /billing/balance-history | 获取余额变动记录 | ✅ |

---

### 5. Order - 订单相关（5个接口）

| 接口 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| 获取订单列表 | GET | /orders | 获取用户订单列表 | ✅ |
| 获取订单详情 | GET | /orders/:id | 获取订单详细信息 | ✅ |
| 取消订单 | POST | /orders/:id/cancel | 取消指定订单 | ✅ |
| 获取订单统计 | GET | /orders/statistics | 获取订单统计数据 | ✅ |

---

### 6. Admin - 管理员相关（12个接口）

| 接口 | 方法 | 路径 | 说明 | 认证 | 权限 |
|------|------|------|------|------|------|
| 获取所有用户 | GET | /admin/users | 获取所有用户列表 | ✅ | Admin |
| 更新用户状态 | PUT | /admin/users/:id/status | 启用/禁用用户 | ✅ | Admin |
| 更新用户角色 | PUT | /admin/users/:id/role | 修改用户角色 | ✅ | Admin |
| 获取系统统计 | GET | /admin/statistics | 获取系统统计数据 | ✅ | Admin |
| 获取系统设置 | GET | /admin/settings | 获取系统配置 | ✅ | Admin |
| 更新系统设置 | PUT | /admin/settings/:key | 更新系统配置 | ✅ | Admin |
| 获取充值审核 | GET | /billing/admin/recharges | 获取待审核充值列表 | ✅ | Admin |
| 审核充值 | PUT | /billing/recharge/:id/approve | 批准/拒绝充值申请 | ✅ | Admin |
| 获取所有订单 | GET | /orders/admin/all | 获取所有订单列表 | ✅ | Admin |

---

### 7. Dashboard - 仪表盘相关（3个接口）

| 接口 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| 获取概览数据 | GET | /dashboard/overview | 获取仪表盘概览数据 | ✅ |
| 获取使用统计 | GET | /dashboard/usage | 获取代理使用统计 | ✅ |
| 获取图表数据 | GET | /dashboard/charts | 获取图表数据 | ✅ |

---

## ❌ 错误码说明

### 错误响应格式

```json
{
  "statusCode": 400,
  "errorCode": 30004,
  "message": "账户余额不足",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "path": "/api/v1/proxy/static/purchase"
}
```

### 错误码分类

#### 通用错误（100XX）

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 10001 | 500 | 服务器内部错误 |
| 10002 | 400 | 无效请求 |
| 10003 | 401 | 未授权 |
| 10004 | 403 | 禁止访问 |
| 10005 | 404 | 资源不存在 |
| 10006 | 400 | 参数验证失败 |
| 10007 | 429 | 请求频率超限 |

#### 认证错误（200XX）

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 20001 | 401 | 用户名或密码错误 |
| 20002 | 401 | 用户不存在 |
| 20003 | 403 | 用户已被禁用 |
| 20004 | 401 | Token已过期 |
| 20005 | 401 | Token无效 |
| 20006 | 409 | 邮箱已存在 |
| 20007 | 400 | 密码强度不足 |
| 20008 | 401 | 登录失败 |

#### 用户错误（300XX）

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 30001 | 404 | 用户不存在 |
| 30002 | 409 | 用户已存在 |
| 30003 | 500 | 用户更新失败 |
| 30004 | 400 | 余额不足 |
| 30005 | 403 | 权限不足 |

#### 代理IP错误（400XX）

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 40001 | 404 | 代理IP不存在 |
| 40002 | 409 | 代理IP已分配 |
| 40003 | 500 | 代理IP购买失败 |
| 40004 | 400 | 库存不足 |
| 40005 | 410 | 代理IP已过期 |
| 40006 | 500 | 续费失败 |
| 40007 | 400 | 无效的代理类型 |

#### 订单错误（500XX）

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 50001 | 404 | 订单不存在 |
| 50002 | 409 | 订单已处理 |
| 50003 | 500 | 订单创建失败 |
| 50004 | 402 | 支付失败 |
| 50005 | 500 | 取消订单失败 |
| 50006 | 400 | 无效的订单状态 |

#### 充值错误（600XX）

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 60001 | 404 | 充值记录不存在 |
| 60002 | 409 | 充值记录已处理 |
| 60003 | 400 | 无效的充值金额 |
| 60004 | 500 | 充值审核失败 |
| 60005 | 400 | 无效的支付方式 |

#### 第三方API错误（800XX）

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 80001 | 502 | 外部API错误 |
| 80002 | 504 | 外部API超时 |
| 80003 | 429 | 外部API请求限制 |
| 80004 | 502 | 985Proxy API错误 |

---

## 📝 请求示例

### 示例1：用户注册

**请求**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123",
    "nickname": "新用户"
  }'
```

**响应**:
```json
{
  "message": "注册成功",
  "user": {
    "id": 123,
    "email": "newuser@example.com",
    "nickname": "新用户",
    "role": "user",
    "balance": "0.00",
    "createdAt": "2025-11-03T12:00:00.000Z"
  }
}
```

---

### 示例2：购买静态代理

**请求**:
```bash
curl -X POST http://localhost:3000/api/v1/proxy/static/purchase \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "default",
    "ipType": "shared",
    "duration": 30,
    "scenario": "social_media",
    "items": [
      {
        "country": "US",
        "city": "Los Angeles",
        "quantity": 2
      },
      {
        "country": "JP",
        "city": "Tokyo",
        "quantity": 1
      }
    ]
  }'
```

**响应**:
```json
{
  "success": true,
  "message": "成功购买 3 个静态IP",
  "order": {
    "id": 456,
    "orderNo": "ORD-1699012345-ABC123",
    "totalPrice": 15.0,
    "totalQuantity": 3,
    "duration": 30
  },
  "allocatedIPs": [
    {
      "id": 789,
      "ip": "192.168.1.100",
      "port": 10001,
      "username": "user_1699012345_0",
      "password": "abc123xyz",
      "country": "US",
      "city": "Los Angeles",
      "expiresAt": "2025-12-03T12:00:00.000Z"
    },
    {
      "id": 790,
      "ip": "192.168.1.101",
      "port": 10002,
      "username": "user_1699012345_1",
      "password": "def456uvw",
      "country": "US",
      "city": "Los Angeles",
      "expiresAt": "2025-12-03T12:00:00.000Z"
    },
    {
      "id": 791,
      "ip": "192.168.2.50",
      "port": 10003,
      "username": "user_1699012345_2",
      "password": "ghi789rst",
      "country": "JP",
      "city": "Tokyo",
      "expiresAt": "2025-12-03T12:00:00.000Z"
    }
  ],
  "newBalance": "985.00"
}
```

---

### 示例3：获取静态代理列表（带筛选）

**请求**:
```bash
curl -X GET "http://localhost:3000/api/v1/proxy/static/list?page=1&limit=20&country=US&ipType=shared&status=active" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**响应**:
```json
{
  "list": [
    {
      "id": 789,
      "ip": "192.168.1.100",
      "port": 10001,
      "username": "user_1699012345_0",
      "password": "abc123xyz",
      "country": "US",
      "countryCode": "US",
      "cityName": "Los Angeles",
      "ipType": "shared",
      "status": "active",
      "expireTimeUtc": "2025-12-03T12:00:00.000Z",
      "auto_renew": false,
      "remark": "Channel: default",
      "credentials": "192.168.1.100:10001:user_1699012345_0:abc123xyz",
      "createdAt": "2025-11-03T12:00:00.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 示例4：创建充值订单

**请求**:
```bash
curl -X POST http://localhost:3000/api/v1/billing/recharge \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "method": "usdt"
  }'
```

**响应**:
```json
{
  "message": "充值申请已提交，等待管理员审核",
  "recharge": {
    "id": 234,
    "orderNo": "RCH20251103001",
    "userId": 123,
    "amount": 100,
    "method": "usdt",
    "status": "pending",
    "createdAt": "2025-11-03T12:00:00.000Z"
  }
}
```

---

### 示例5：管理员审核充值

**请求**:
```bash
curl -X PUT http://localhost:3000/api/v1/billing/recharge/234/approve \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "remark": "审核通过"
  }'
```

**响应**:
```json
{
  "message": "充值已批准",
  "recharge": {
    "id": 234,
    "orderNo": "RCH20251103001",
    "userId": 123,
    "amount": 100,
    "method": "usdt",
    "status": "approved",
    "approvedAt": "2025-11-03T12:05:00.000Z",
    "remark": "审核通过"
  }
}
```

---

## ✅ 响应格式

### 成功响应

#### 标准格式
```json
{
  "data": {},
  "message": "操作成功",
  "timestamp": "2025-11-03T12:00:00.000Z"
}
```

#### 列表格式
```json
{
  "list": [],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### 错误响应

```json
{
  "statusCode": 400,
  "errorCode": 30004,
  "message": "账户余额不足",
  "timestamp": "2025-11-03T12:00:00.000Z",
  "path": "/api/v1/proxy/static/purchase"
}
```

---

## 🔧 开发建议

### 1. 错误处理

在客户端统一处理错误码：

```typescript
// 前端错误处理示例
const handleAPIError = (error: any) => {
  const errorCode = error.response?.data?.errorCode;
  const message = error.response?.data?.message;

  switch (errorCode) {
    case 30004: // 余额不足
      showRechargeDialog();
      break;
    case 20004: // Token过期
      refreshToken();
      break;
    default:
      showErrorMessage(message);
  }
};
```

### 2. 请求重试

对于可重试的错误（如网络超时），建议实现自动重试：

```typescript
const retryRequest = async (fn: Function, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 3. Token刷新

当accessToken过期时，使用refreshToken自动刷新：

```typescript
const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${refreshToken}` }
  });
  return response.json();
};
```

---

## 📞 技术支持

- **Swagger文档**: http://localhost:3000/api
- **API基础URL**: http://localhost:3000/api/v1
- **错误码列表**: 见上方错误码说明章节

---

**文档版本**: v1.0.0  
**最后更新**: 2025-11-03  
**维护团队**: ProxyHub Dev Team

