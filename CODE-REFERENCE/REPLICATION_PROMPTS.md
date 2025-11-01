# 🚀 ProxyHub 完整项目复刻提示词

## 📋 使用说明

本文档包含**7个阶段的详细提示词**，您可以**直接复制粘贴给AI**，逐步在新Cursor项目中完整复刻ProxyHub。

每个阶段完成后，**验证功能**再进入下一阶段。

---

## ⏱️ 预计时间

- **阶段1**: 基础设施 (1-2天)
- **阶段2**: 后端API (2-3天)
- **阶段3**: 前端基础 (1天)
- **阶段4**: 前端页面 (2-3天)
- **阶段5**: 管理后台 (1-2天)
- **阶段6**: 完善 (1天)
- **阶段7**: 测试部署 (1天)

**总计**: 7-10个工作日

---

## 🎯 阶段0：准备工作

### 步骤1：导入项目到新Cursor

```
【操作】在Cursor中打开proxyhub-rebuild文件夹
```

### 步骤2：让AI理解项目

```
【复制此提示词给AI】

你好！我有一个完整的ProxyHub项目参考资料包，现在需要你帮我从零开始实现这个项目。

项目概述：
- 名称：ProxyHub
- 类型：代理IP管理平台
- 技术栈：
  - 后端：NestJS + TypeScript + PostgreSQL + Redis + TypeORM
  - 前端：Vue 3 + TypeScript + Element Plus + Vite + Pinia
  - 部署：Docker + Docker Compose

参考资料位置：
1. 需求文档：.spec-workflow/specs/proxyhub-rebuild/requirements.md
2. 设计文档：.spec-workflow/specs/proxyhub-rebuild/design.md
3. 任务分解：.spec-workflow/specs/proxyhub-rebuild/tasks.md
4. 后端参考：CODE-REFERENCE/BACKEND_REFERENCE.md
5. 前端参考：CODE-REFERENCE/FRONTEND_REFERENCE.md
6. UI参考：UI-REFERENCE/

请先阅读以下文档，告诉我你的理解：
1. requirements.md - 理解项目需求
2. design.md - 理解技术架构
3. BACKEND_REFERENCE.md - 理解后端实现
4. FRONTEND_REFERENCE.md - 理解前端实现

阅读完后，请简要总结：
- 项目的核心功能
- 技术架构
- 数据库设计
- API设计
- 前端架构

让我确认你理解正确后，我们再开始实施。
```

**预期AI响应**: AI会总结项目的核心功能、架构等

---

## 📦 阶段1：基础设施搭建

### 提示词1.1：创建项目目录和配置

```
【复制此提示词给AI】

阶段1 - 任务1：创建项目基础目录结构

请按照以下结构创建完整的项目目录：

proxyhub-rebuild/
├── backend/              # 后端
│   ├── src/
│   │   ├── modules/      # 功能模块
│   │   ├── config/       # 配置文件
│   │   ├── database/     # 数据库相关
│   │   ├── common/       # 通用模块
│   │   └── main.ts       # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/             # 前端
│   ├── src/
│   │   ├── api/          # API调用
│   │   ├── assets/       # 静态资源
│   │   ├── components/   # 组件
│   │   ├── layouts/      # 布局
│   │   ├── router/       # 路由
│   │   ├── stores/       # 状态管理
│   │   ├── styles/       # 样式
│   │   ├── types/        # TypeScript类型
│   │   ├── utils/        # 工具函数
│   │   ├── views/        # 页面
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.development
│   └── Dockerfile
├── docker-compose.yml    # Docker编排
└── README.md

请创建所有目录，并告诉我完成情况。
```

### 提示词1.2：配置后端package.json

```
【复制此提示词给AI】

阶段1 - 任务2：配置后端package.json

参考：CODE-REFERENCE/backend/ 中的代码

请在 backend/package.json 中配置以下依赖：

核心依赖：
- @nestjs/core, @nestjs/common, @nestjs/platform-express
- @nestjs/typeorm, typeorm, pg (PostgreSQL)
- @nestjs/jwt, @nestjs/passport, passport, passport-jwt, passport-local
- @nestjs/config
- @nestjs/axios, axios
- bcrypt
- class-validator, class-transformer
- rxjs

开发依赖：
- @nestjs/cli
- typescript
- @types/node, @types/bcrypt

Scripts：
- start:dev: nest start --watch
- build: nest build
- start:prod: node dist/main

请创建完整的package.json文件。
```

### 提示词1.3：配置前端package.json

```
【复制此提示词给AI】

阶段1 - 任务3：配置前端package.json

参考：CODE-REFERENCE/frontend/ 中的代码

请在 frontend/package.json 中配置以下依赖：

核心依赖：
- vue (^3.3.0)
- vue-router (^4.2.0)
- pinia (^2.1.0)
- axios (^1.4.0)
- element-plus (^2.3.0)
- @element-plus/icons-vue
- country-flag-icons (用于显示国旗)
- echarts (^5.4.0, 用于图表)
- vue-echarts

开发依赖：
- @vitejs/plugin-vue
- vite (^4.0.0)
- typescript
- @types/node
- sass

Scripts：
- dev: vite
- build: vite build
- preview: vite preview

请创建完整的package.json文件。
```

### 提示词1.4：创建所有Entity

```
【复制此提示词给AI】

阶段1 - 任务4：创建所有数据库Entity

参考：
- CODE-REFERENCE/backend/entities/ 中的所有Entity
- BACKEND_REFERENCE.md 中的Entity设计

请创建以下Entity文件：

1. backend/src/modules/user/entities/user.entity.ts
   - 严格参考 CODE-REFERENCE/backend/entities/user.entity.ts
   - 包含所有字段、枚举、装饰器、索引

2. backend/src/modules/proxy/entities/static-proxy.entity.ts
   - 严格参考 CODE-REFERENCE/backend/entities/static-proxy.entity.ts
   - 包含与User的关系

3. backend/src/modules/order/entities/order.entity.ts
   - 参考design.md中的订单表设计
   - 包含OrderType和OrderStatus枚举

4. backend/src/modules/billing/entities/billing-detail.entity.ts
   - 参考design.md中的计费明细表设计

5. backend/src/modules/recharge/entities/recharge.entity.ts
   - 参考design.md中的充值记录表设计

创建时注意：
- 所有金额字段使用 decimal(10,2)
- 主键使用UUID
- 关键字段添加索引
- 正确设置外键关系

完成后告诉我。
```

### 提示词1.5：配置数据库连接

```
【复制此提示词给AI】

阶段1 - 任务5：配置数据库连接

请创建：

1. backend/src/config/database.config.ts
   - TypeORM配置
   - 连接PostgreSQL
   - entities自动扫描
   - synchronize: false (生产环境)
   - migrationsRun: true

2. backend/.env.example
   ```
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=password
   DB_DATABASE=proxyhub
   
   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=7d
   
   # 985Proxy API
   PROXY_985_API_BASE_URL=https://api.985proxy.com/api
   PROXY_985_API_KEY=your-api-key-here
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

3. backend/src/app.module.ts
   - 导入ConfigModule
   - 导入TypeOrmModule
   - 配置数据库连接

完成后告诉我。
```

### 提示词1.6：配置Docker Compose

```
【复制此提示词给AI】

阶段1 - 任务6：配置Docker Compose

参考根目录已有的 docker-compose.yml

请确保包含以下服务：
1. postgres (PostgreSQL 15)
   - 端口：5432
   - 数据卷持久化

2. redis (Redis 7)
   - 端口：6379

3. backend (NestJS)
   - 端口：3000
   - 依赖postgres和redis
   - 环境变量从.env读取

4. frontend (Vue3 + Nginx)
   - 端口：80
   - 反向代理/api到backend

创建或更新docker-compose.yml，并创建：
- backend/Dockerfile
- frontend/Dockerfile
- frontend/nginx.conf (API代理配置)

完成后告诉我。
```

### 验收标准：

```
【验收提示词】

请帮我验证阶段1完成情况：

检查清单：
✓ 所有目录已创建
✓ backend/package.json 包含所有必要依赖
✓ frontend/package.json 包含所有必要依赖
✓ 所有Entity文件已创建且字段完整
✓ 数据库配置文件已创建
✓ Docker配置文件已创建

请告诉我哪些完成了，哪些还需要调整。

完成后，我们进入阶段2。
```

---

## 🔧 阶段2：后端API实现

### 提示词2.1：实现认证模块

```
【复制此提示词给AI】

阶段2 - 任务1：实现认证模块（Auth）

参考：
- CODE-REFERENCE/backend/controllers/auth.controller.ts
- CODE-REFERENCE/backend/services/auth.service.ts (可能没有，请推断)
- BACKEND_REFERENCE.md的认证部分

请创建完整的认证模块：

1. backend/src/modules/auth/auth.controller.ts
   - POST /auth/register (注册)
   - POST /auth/login (登录)
   - POST /auth/logout (登出)
   - 严格参考CODE-REFERENCE中的实现

2. backend/src/modules/auth/auth.service.ts
   - register() - 使用bcrypt加密密码
   - login() - 生成JWT Token
   - validateUser() - 验证用户名密码

3. backend/src/modules/auth/strategies/jwt.strategy.ts
   - JWT验证策略

4. backend/src/modules/auth/strategies/local.strategy.ts
   - 本地登录策略

5. backend/src/modules/auth/guards/jwt-auth.guard.ts
   - JWT守卫

6. backend/src/modules/auth/decorators/public.decorator.ts
   - @Public() 装饰器

7. backend/src/modules/auth/dto/register.dto.ts
   - 注册DTO，使用class-validator验证

8. backend/src/modules/auth/dto/login.dto.ts
   - 登录DTO

9. backend/src/modules/auth/auth.module.ts
   - 导入JwtModule, PassportModule
   - 导出AuthService

关键技术点：
- 密码使用bcrypt加密 (rounds=10)
- JWT过期时间7天
- 登录成功返回 { access_token, user }

完成后测试：
- 能否成功注册
- 能否成功登录
- 能否正确生成Token

告诉我完成情况。
```

### 提示词2.2：实现用户模块

```
【复制此提示词给AI】

阶段2 - 任务2：实现用户模块（User）

参考：
- design.md中的用户相关API
- BACKEND_REFERENCE.md

请创建：

1. backend/src/modules/user/user.controller.ts
   - GET /users/profile (获取当前用户信息)
   - PATCH /users/profile (更新用户信息)

2. backend/src/modules/user/user.service.ts
   - getProfile(userId) - 获取用户信息
   - updateProfile(userId, dto) - 更新用户信息
   - getBalance(userId) - 获取用户余额

3. backend/src/modules/user/dto/update-profile.dto.ts

4. backend/src/modules/user/user.module.ts
   - 导入TypeOrmModule.forFeature([User])
   - 导出UserService

关键要点：
- 所有接口需要JWT认证
- 返回用户信息时不返回密码
- balance字段格式化为小数点后2位

完成后告诉我。
```

### 提示词2.3：实现代理模块

```
【复制此提示词给AI】

阶段2 - 任务3：实现代理模块（Proxy）

**这是最核心的模块！**

参考：
- CODE-REFERENCE/backend/controllers/proxy.controller.ts
- CODE-REFERENCE/backend/services/proxy.service.ts
- BACKEND_REFERENCE.md中的ProxyService部分

请创建：

1. backend/src/modules/proxy/proxy.controller.ts
   - 严格参考CODE-REFERENCE/backend/controllers/proxy.controller.ts
   - 包含所有API端点：
     * GET /proxy/static/inventory (公开)
     * GET /proxy/static/my-proxies (需认证)
     * POST /proxy/static/purchase (需认证)
     * PATCH /proxy/static/:id/auto-renew
     * PATCH /proxy/static/:id/remark

2. backend/src/modules/proxy/proxy.service.ts
   - **严格参考CODE-REFERENCE/backend/services/proxy.service.ts**
   - **重点：purchaseStaticProxy()方法必须使用数据库事务**
   - 完整实现：
     * getInventoryWithMarkup()
     * getUserProxies()
     * purchaseStaticProxy() - 核心方法，包含完整事务
     * toggleAutoRenew()
     * updateRemark()

3. backend/src/modules/proxy/dto/purchase-static-proxy.dto.ts
   ```typescript
   export class PurchaseStaticProxyDto {
     @IsString()
     channelName: string;
   
     @IsOptional()
     @IsString()
     scenario?: string;
   
     @IsIn(['normal', 'native'])
     ipType: 'normal' | 'native';
   
     @IsNumber()
     @Min(1)
     duration: number;  // 天数
   
     @IsArray()
     @ValidateNested({ each: true })
     @Type(() => PurchaseItemDto)
     items: PurchaseItemDto[];
   }
   
   export class PurchaseItemDto {
     @IsString()
     country: string;
   
     @IsString()
     city: string;
   
     @IsNumber()
     @Min(1)
     quantity: number;
   }
   ```

4. backend/src/modules/proxy/services/proxy-985.service.ts (可选)
   - 如果需要对接真实的985Proxy API

5. backend/src/modules/proxy/proxy.module.ts
   - 导入TypeOrmModule.forFeature([StaticProxy, User, Order, BillingDetail])
   - 导入HttpModule
   - 导出ProxyService

**关键技术点（必须实现）：**

purchaseStaticProxy() 方法流程：
```typescript
async purchaseStaticProxy(userId: string, dto: PurchaseStaticProxyDto) {
  // 1. 启动数据库事务
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // 2. 验证余额
    // 3. 分配IP
    // 4. 创建订单
    // 5. 扣除余额
    // 6. 创建计费记录
    
    // 7. 提交事务
    await queryRunner.commitTransaction();
    
    return { success: true, ... };
  } catch (error) {
    // 8. 回滚事务
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

完成后测试：
- 能否获取库存
- 能否成功购买（事务是否正常工作）
- 购买后余额是否正确扣除
- 订单是否正确创建
- 计费记录是否正确创建

告诉我完成情况。
```

### 提示词2.4：实现订单模块

```
【复制此提示词给AI】

阶段2 - 任务4：实现订单模块（Order）

参考：
- CODE-REFERENCE/backend/controllers/order.controller.ts (如果有)
- design.md中的订单API

请创建：

1. backend/src/modules/order/order.controller.ts
   - GET /orders (获取订单列表)
   - GET /orders/:orderNo (获取订单详情)

2. backend/src/modules/order/order.service.ts
   - getUserOrders(userId, page, limit, filters)
   - getOrderDetail(orderNo, userId)

3. backend/src/modules/order/order.module.ts

关键要点：
- 订单列表支持分页
- 订单详情包含购买的IP列表
- 只能查看自己的订单

完成后告诉我。
```

### 提示词2.5：实现计费模块

```
【复制此提示词给AI】

阶段2 - 任务5：实现计费模块（Billing）

请创建：

1. backend/src/modules/billing/billing.controller.ts
   - GET /billing/transactions (获取交易记录)
   - GET /billing/summary (获取账单汇总)

2. backend/src/modules/billing/billing.service.ts
   - getTransactions(userId, page, limit, filters)
   - getSummary(userId, startDate, endDate)

3. backend/src/modules/billing/billing.module.ts

关键要点：
- 交易记录按时间倒序
- 支持按类别筛选 (income/expense)
- 计算收入/支出总额

完成后告诉我。
```

### 提示词2.6：实现充值模块

```
【复制此提示词给AI】

阶段2 - 任务6：实现充值模块（Recharge）

请创建：

1. backend/src/modules/recharge/recharge.controller.ts
   - POST /recharges (创建充值申请)
   - GET /recharges (获取充值记录)
   - GET /recharges/:id (获取充值详情)

2. backend/src/modules/recharge/recharge.service.ts
   - createRecharge(userId, dto) - 创建充值申请
   - getUserRecharges(userId, page, limit)
   - getRechargeDetail(id, userId)

3. backend/src/modules/recharge/dto/create-recharge.dto.ts

4. backend/src/modules/recharge/recharge.module.ts

关键要点：
- 充值状态：pending/approved/rejected
- 创建充值时状态为pending
- 审核通过后才增加余额（管理员功能）

完成后告诉我。
```

### 提示词2.7：实现管理模块

```
【复制此提示词给AI】

阶段2 - 任务7：实现管理员模块（Admin）

请创建：

1. backend/src/modules/admin/admin.controller.ts
   - GET /admin/users (用户列表)
   - PATCH /admin/users/:id/status (更新用户状态)
   - GET /admin/recharges (充值审核列表)
   - PATCH /admin/recharges/:id/approve (审核通过)
   - PATCH /admin/recharges/:id/reject (审核拒绝)
   - GET /admin/orders (所有订单)
   - GET /admin/statistics (统计数据)

2. backend/src/modules/admin/admin.service.ts
   - 实现所有管理功能
   - approveRecharge() - 审核通过，增加用户余额

3. backend/src/modules/admin/guards/admin.guard.ts
   - 检查用户角色是否为admin

4. backend/src/modules/admin/admin.module.ts

关键要点：
- 所有接口需要admin角色
- 审核充值时使用事务
- 审核通过后增加用户余额并创建计费记录

完成后告诉我。
```

### 验收标准：

```
【验收提示词】

请帮我验证阶段2完成情况：

后端API测试：
1. 注册新用户
2. 登录获取Token
3. 获取用户信息
4. 获取IP库存
5. 购买IP（需要先充值）
6. 查看我的IP列表
7. 更新IP备注
8. 查看订单列表
9. 查看交易记录

请使用Postman或类似工具测试所有API。

告诉我测试结果，哪些通过了，哪些还有问题。

完成后，我们进入阶段3。
```

---

## 🎨 阶段3：前端基础搭建

### 提示词3.1：配置前端路由

```
【复制此提示词给AI】

阶段3 - 任务1：配置前端路由系统

参考：
- CODE-REFERENCE/frontend/router/index.ts
- FRONTEND_REFERENCE.md的路由配置部分

请创建：

1. frontend/src/router/index.ts
   - **严格参考CODE-REFERENCE/frontend/router/index.ts**
   - 包含所有路由：
     * 公开路由 (/login, /register)
     * 用户路由 (/, /dashboard, /proxy/*, /billing/*, /account/*)
     * 管理后台路由 (/admin-portal/*)
   - **实现完整的路由守卫逻辑**

路由守卫要求：
- 未登录用户只能访问/login和/register
- 已登录用户访问/login自动跳转/dashboard
- 管理后台需要admin角色
- 非admin访问/admin-portal/*会被拦截

完成后告诉我。
```

### 提示词3.2：配置API请求

```
【复制此提示词给AI】

阶段3 - 任务2：配置Axios请求

参考：
- CODE-REFERENCE/frontend/api/request.ts
- FRONTEND_REFERENCE.md的API调用部分

请创建：

1. frontend/src/api/request.ts
   - **严格参考CODE-REFERENCE/frontend/api/request.ts**
   - 请求拦截器：自动添加Token
   - 响应拦截器：
     * 自动提取data
     * 401自动登出并跳转登录页
     * 统一错误提示

2. frontend/src/api/auth.ts
   - **严格参考CODE-REFERENCE/frontend/api/auth.ts**
   - login(), register(), logout(), getProfile()

3. frontend/src/api/proxy.ts
   - **严格参考CODE-REFERENCE/frontend/api/proxy.ts**
   - getIPInventory(), getMyStaticIPs(), purchaseStaticProxy()
   - updateIPNote(), setAutoRenew()

4. frontend/src/api/order.ts, billing.ts, wallet.ts
   - 参考design.md中的API设计

完成后告诉我。
```

### 提示词3.3：配置状态管理

```
【复制此提示词给AI】

阶段3 - 任务3：配置Pinia状态管理

参考：
- CODE-REFERENCE/frontend/stores/user.ts
- FRONTEND_REFERENCE.md的状态管理部分

请创建：

1. frontend/src/stores/user.ts
   - **严格参考CODE-REFERENCE/frontend/stores/user.ts**
   - State: token, user
   - Getters: isLoggedIn
   - Actions: login, register, logout, checkAuth, fetchUserInfo

2. frontend/src/stores/index.ts
   - 导出所有store

关键要点：
- Token和User同时存储在Pinia和localStorage
- balance字段强制转换为number
- 提供便捷的登录/登出方法

完成后告诉我。
```

### 提示词3.4：创建布局组件

```
【复制此提示词给AI】

阶段3 - 任务4：创建布局组件

请创建：

1. frontend/src/layouts/DashboardLayout.vue
   - 顶部导航栏：显示用户邮箱、余额、登出按钮
   - 左侧菜单栏：导航菜单（首页、代理管理、充值、订单等）
   - 主内容区域：<router-view />
   - 使用Element Plus的Layout组件

2. frontend/src/layouts/AdminPortalLayout.vue
   - 类似DashboardLayout
   - 管理后台专用菜单（用户管理、充值审核、订单管理等）

3. frontend/src/components/common/FlagIcon.vue
   - **参考UI-REFERENCE/components/FlagIcon.vue**
   - 显示国家国旗图标
   - 使用country-flag-icons库

完成后告诉我。
```

### 提示词3.5：配置样式系统

```
【复制此提示词给AI】

阶段3 - 任务5：配置样式系统

请创建：

1. frontend/src/styles/variables.scss
   - 主题色、文字颜色、边框颜色等
   - 参考FRONTEND_REFERENCE.md

2. frontend/src/styles/global.scss
   - 全局样式、滚动条样式等

3. frontend/src/main.ts
   - 导入Vue、Router、Pinia、Element Plus
   - 导入全局样式
   - 挂载应用

完成后告诉我。
```

### 验收标准：

```
【验收提示词】

请帮我验证阶段3完成情况：

前端基础测试：
1. 启动前端开发服务器 (npm run dev)
2. 访问 http://localhost:5173
3. 检查路由是否正常工作
4. 检查是否自动跳转到登录页
5. 检查布局是否正常显示

告诉我测试结果。

完成后，我们进入阶段4。
```

---

## 🎨 阶段4：前端页面实现

### 提示词4.1：实现认证页面

```
【复制此提示词给AI】

阶段4 - 任务1：实现登录和注册页面

请创建：

1. frontend/src/views/auth/Login.vue
   - 邮箱和密码输入框
   - 登录按钮
   - 跳转到注册页链接
   - 调用userStore.login()
   - 登录成功后跳转/dashboard

2. frontend/src/views/auth/Register.vue
   - 邮箱、密码、确认密码输入框
   - 可选：推荐码输入框
   - 注册按钮
   - 调用userStore.register()
   - 注册成功后跳转/dashboard

使用Element Plus的Form组件，包含表单验证。

完成后测试：
- 能否成功注册
- 能否成功登录
- 登录后能否跳转到dashboard

告诉我完成情况。
```

### 提示词4.2：实现仪表盘页面

```
【复制此提示词给AI】

阶段4 - 任务2：实现用户仪表盘

请创建：

1. frontend/src/views/dashboard/Index.vue
   - 显示用户余额
   - 显示统计卡片：
     * 静态IP数量
     * 动态代理通道数量
     * 本月消费
     * 本月订单数量
   - 显示最近订单列表
   - 显示使用流量图表 (使用ECharts)

使用Element Plus的Card、Statistic等组件。

完成后告诉我。
```

### 提示词4.3：实现静态IP购买页

```
【复制此提示词给AI】

阶段4 - 任务3：实现静态IP购买页

**这是最重要的前端页面！**

参考：
- UI-REFERENCE/views/StaticBuy.vue
- FRONTEND_REFERENCE.md的StaticBuy部分

请创建：

1. frontend/src/views/proxy/StaticBuy.vue
   - **参考UI-REFERENCE/views/StaticBuy.vue的UI设计**
   - 步骤1：选择通道名称、使用场景
   - 步骤2：选择IP类型（普通/原生）
   - 步骤3：选择购买时长
   - 步骤4：选择国家/城市和数量
     * 显示库存列表，按国家分组
     * 显示每个城市的可用数量和单价
     * 使用FlagIcon显示国旗
   - 步骤5：确认订单，显示总价
   - 提交按钮：调用purchaseStaticProxy()

关键功能：
- 实时计算总价
- 库存不足时禁用选择
- 提交成功后显示已购买的IP列表
- 刷新用户余额

UI要求：
- 美观、现代
- 使用Element Plus组件
- 响应式设计

完成后告诉我。
```

### 提示词4.4：实现静态IP管理页

```
【复制此提示词给AI】

阶段4 - 任务4：实现静态IP管理页

参考：
- UI-REFERENCE/views/StaticManage.vue (如果有)
- FRONTEND_REFERENCE.md的StaticManage部分

请创建：

1. frontend/src/views/proxy/StaticManage.vue
   - IP列表表格：
     * 国旗 | IP地址 | 端口 | 用户名 | 密码 | 国家 | 城市 | 过期时间 | 状态 | 备注 | 操作
   - 筛选：按国家、城市、状态筛选
   - 分页
   - 操作：
     * 复制IP信息（一键复制为 ip:port:username:password 格式）
     * 编辑备注
     * 切换自动续费
     * 续费（单个/批量）

使用Element Plus的Table组件。

完成后告诉我。
```

### 提示词4.5：实现充值页面

```
【复制此提示词给AI】

阶段4 - 任务5：实现充值页面

请创建：

1. frontend/src/views/wallet/Recharge.vue
   - 充值金额选择（10/50/100/200/500/自定义）
   - 支付方式选择（银行转账/加密货币等）
   - 上传付款凭证
   - 提交充值申请
   - 显示充值记录列表

完成后告诉我。
```

### 提示词4.6：实现订单和计费页面

```
【复制此提示词给AI】

阶段4 - 任务6：实现订单和计费页面

请创建：

1. frontend/src/views/billing/Orders.vue
   - 订单列表表格
   - 显示：订单号、类型、金额、状态、创建时间
   - 点击查看订单详情（包含购买的IP列表）
   - 筛选：按类型、状态筛选
   - 分页

2. frontend/src/views/billing/Transactions.vue
   - 交易记录列表
   - 显示：类型、金额、描述、时间
   - 筛选：按类别（收入/支出）
   - 显示总收入/总支出
   - 分页

完成后告诉我。
```

### 验收标准：

```
【验收提示词】

请帮我验证阶段4完成情况：

前端页面测试：
1. 注册新用户
2. 登录
3. 查看仪表盘
4. 查看IP库存
5. 购买IP（需要先充值或修改数据库余额）
6. 查看我的IP列表
7. 编辑IP备注
8. 切换自动续费
9. 查看订单列表
10. 查看交易记录

告诉我测试结果。

完成后，我们进入阶段5。
```

---

## 👨‍💼 阶段5：管理后台实现

### 提示词5.1：实现管理后台页面

```
【复制此提示词给AI】

阶段5：实现管理后台所有页面

请创建以下管理后台页面：

1. frontend/src/views/admin-portal/AdminPortalLogin.vue
   - 管理员登录页（独立于普通登录页）

2. frontend/src/views/admin-portal/Users.vue
   - 用户列表表格
   - 显示：ID、邮箱、角色、余额、状态、注册时间
   - 操作：修改状态、修改余额、查看详情

3. frontend/src/views/admin-portal/RechargeApproval.vue
   - 充值审核列表
   - 显示：用户、金额、支付方式、凭证、状态、提交时间
   - 操作：审核通过、审核拒绝

4. frontend/src/views/admin-portal/Orders.vue
   - 所有订单列表
   - 显示：订单号、用户、类型、金额、状态、时间
   - 筛选：按用户、状态筛选

5. frontend/src/views/admin-portal/IPManagement.vue
   - IP库存管理
   - 添加/删除/修改IP库存

6. frontend/src/views/admin-portal/Statistics.vue
   - 统计数据展示
   - 用户统计、订单统计、收入统计
   - 使用ECharts图表

7. frontend/src/views/admin-portal/Settings.vue
   - 系统设置
   - 价格设置、加价率设置等

完成后告诉我。
```

### 验收标准：

```
【验收提示词】

请帮我验证阶段5完成情况：

管理后台测试：
1. 使用admin账号登录管理后台
2. 查看用户列表
3. 审核充值申请
4. 查看所有订单
5. 查看统计数据

告诉我测试结果。

完成后，我们进入阶段6。
```

---

## ✨ 阶段6：功能完善

### 提示词6.1：完善功能

```
【复制此提示词给AI】

阶段6：完善所有功能

请完善以下内容：

1. 国际化 (i18n)
   - 支持中文和英文
   - 语言切换功能

2. 错误处理
   - 所有API调用添加try/catch
   - 友好的错误提示

3. 加载状态
   - 所有异步操作显示Loading

4. 空状态
   - 列表为空时显示Empty状态

5. 响应式设计
   - 移动端适配

6. 表单验证
   - 所有表单添加完整验证

告诉我完成情况。
```

---

## 🚀 阶段7：测试和部署

### 提示词7.1：Docker部署测试

```
【复制此提示词给AI】

阶段7：Docker部署测试

请帮我：

1. 构建Docker镜像
   ```bash
   docker-compose build
   ```

2. 启动所有服务
   ```bash
   docker-compose up -d
   ```

3. 检查服务状态
   ```bash
   docker-compose ps
   ```

4. 查看日志
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

5. 访问测试
   - 前端：http://localhost
   - 后端：http://localhost:3000

告诉我部署结果。
```

### 提示词7.2：功能验收测试

```
【复制此提示词给AI】

最终验收测试清单：

用户功能：
✓ 注册新用户
✓ 登录
✓ 查看仪表盘
✓ 购买静态IP
✓ 管理IP（备注、自动续费）
✓ 查看订单
✓ 查看交易记录
✓ 充值申请

管理员功能：
✓ 管理员登录
✓ 查看用户列表
✓ 审核充值
✓ 查看所有订单
✓ 查看统计数据

请逐项测试，告诉我结果。

全部通过后，项目复刻完成！🎉
```

---

## 📝 使用技巧

### 技巧1：引用具体文件

在与AI对话时，随时引用参考文件：

```
"请严格参考 CODE-REFERENCE/backend/services/proxy.service.ts 
中的 purchaseStaticProxy() 方法实现，特别注意事务处理部分。"
```

### 技巧2：对比验证

让AI对比实现：

```
"请对比我当前的 auth.controller.ts 实现和 
CODE-REFERENCE/backend/controllers/auth.controller.ts，
告诉我有哪些差异。"
```

### 技巧3：分步验证

每完成一个阶段，立即测试：

```
"我已完成阶段2的代码，现在帮我测试：
1. 注册新用户
2. 登录获取Token
3. 获取用户信息

告诉我每一步的结果。"
```

### 技巧4：遇到问题时

```
"购买IP时报错：'余额不足'，但我的余额是100，
购买金额是50。请检查 proxy.service.ts 中的 
purchaseStaticProxy() 方法，找出问题所在。"
```

---

## 🎉 完成！

按照这7个阶段的提示词，您可以在新Cursor项目中**完整复刻**ProxyHub！

**预计时间**: 7-10个工作日

**成功标准**: 
- ✅ 用户可以注册、登录
- ✅ 用户可以购买和管理静态IP
- ✅ 管理员可以审核充值和管理系统
- ✅ Docker部署成功

**祝您复刻成功！** 🚀

---

**需要帮助？**
- 参考 `BACKEND_REFERENCE.md` 了解后端细节
- 参考 `FRONTEND_REFERENCE.md` 了解前端细节
- 参考 `UI-REFERENCE/` 了解UI设计
- 参考 `.spec-workflow/specs/proxyhub-rebuild/` 了解需求和设计

**版本**: v1.0  
**创建日期**: 2025-10-31

