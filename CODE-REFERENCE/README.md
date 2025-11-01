# 💻 ProxyHub 代码参考包

## 📋 这是什么？

这是一个**完整的代码参考包**，包含ProxyHub项目的所有关键代码实现。

使用这个参考包，AI助手可以**精确复刻**整个项目，包括：
- ✅ 后端API实现
- ✅ 数据库Entity设计
- ✅ 前端路由配置
- ✅ 前端API调用配置
- ✅ 关键业务逻辑
- ✅ UI组件实现

---

## 📁 目录结构

```
CODE-REFERENCE/
├── README.md                          ← 本文档
├── BACKEND_REFERENCE.md               ← 后端代码参考指南
├── FRONTEND_REFERENCE.md              ← 前端代码参考指南
├── REPLICATION_PROMPTS.md             ← 完整项目复刻提示词
│
├── backend/                           ← 后端关键代码
│   ├── entities/                      ← 数据库Entity
│   │   ├── user.entity.ts
│   │   ├── static-proxy.entity.ts
│   │   ├── order.entity.ts
│   │   └── ...
│   ├── controllers/                   ← 控制器
│   │   ├── auth.controller.ts
│   │   ├── static-proxy.controller.ts
│   │   └── ...
│   ├── services/                      ← 业务逻辑
│   │   ├── auth.service.ts
│   │   ├── static-proxy.service.ts
│   │   └── ...
│   └── config/                        ← 配置文件
│       ├── database.config.ts
│       └── jwt.config.ts
│
└── frontend/                          ← 前端关键代码
    ├── router/                        ← 路由配置
    │   └── index.ts
    ├── api/                           ← API调用
    │   ├── request.ts
    │   └── modules/
    │       ├── auth.ts
    │       └── proxy.ts
    ├── stores/                        ← 状态管理
    │   └── user.ts
    ├── views/                         ← 关键页面
    │   └── proxy/
    │       ├── StaticBuy.vue
    │       └── StaticManage.vue
    └── components/                    ← 关键组件
        └── common/
            └── FlagIcon.vue
```

---

## 🚀 如何使用？

### 方式1：完整复刻（推荐）⭐

按照以下顺序使用提示词：

1. **阅读参考文档**（15分钟）
   - `BACKEND_REFERENCE.md` - 了解后端实现
   - `FRONTEND_REFERENCE.md` - 了解前端实现

2. **使用复刻提示词**（7-10个工作日）
   - 打开 `REPLICATION_PROMPTS.md`
   - 按照7个阶段逐步执行提示词
   - AI会根据参考代码精确实现

3. **验证每个阶段**
   - 完成一个阶段后立即测试
   - 对比参考代码检查实现
   - 发现问题立即修正

---

### 方式2：模块化复刻

如果您想逐个模块复刻：

#### 后端模块
```
"请根据 CODE-REFERENCE/backend/entities/ 中的Entity定义，
创建所有数据库Entity文件，保持相同的字段和关系。"
```

#### 前端模块
```
"请根据 CODE-REFERENCE/frontend/router/index.ts 的路由配置，
创建完整的前端路由系统。"
```

---

## 🎯 核心代码模块

### 后端核心（必须参考）

| 模块 | 关键文件 | 重要性 |
|------|---------|--------|
| **数据库Entity** | user.entity.ts, static-proxy.entity.ts 等 | ⭐⭐⭐ |
| **认证系统** | auth.controller.ts, auth.service.ts, jwt.strategy.ts | ⭐⭐⭐ |
| **静态代理** | static-proxy.controller.ts, static-proxy.service.ts | ⭐⭐⭐ |
| **计费系统** | billing.controller.ts, transaction.service.ts | ⭐⭐ |
| **管理后台** | admin.controller.ts, admin.service.ts | ⭐⭐ |

### 前端核心（必须参考）

| 模块 | 关键文件 | 重要性 |
|------|---------|--------|
| **路由配置** | router/index.ts | ⭐⭐⭐ |
| **API配置** | api/request.ts, api/modules/*.ts | ⭐⭐⭐ |
| **状态管理** | stores/user.ts | ⭐⭐⭐ |
| **核心页面** | StaticBuy.vue, StaticManage.vue | ⭐⭐⭐ |
| **关键组件** | FlagIcon.vue, PaymentPanel.vue | ⭐⭐ |

---

## 💡 使用技巧

### 技巧1：先看参考文档

不要直接使用提示词，先阅读：
- `BACKEND_REFERENCE.md` - 了解后端架构
- `FRONTEND_REFERENCE.md` - 了解前端架构

这样您能更好地理解AI的实现。

### 技巧2：引用具体文件

与AI对话时，引用具体的参考文件：
```
"请根据 CODE-REFERENCE/backend/entities/user.entity.ts 的实现，
创建User Entity，保持相同的字段定义和关系。"
```

### 技巧3：对比验证

AI实现后，对比参考代码：
```
"请对比 CODE-REFERENCE/backend/controllers/auth.controller.ts，
检查我的实现是否遗漏了关键功能。"
```

### 技巧4：分模块验证

不要等所有代码完成后才测试，而是：
- 完成认证模块 → 立即测试登录
- 完成静态代理 → 立即测试购买
- 完成计费模块 → 立即测试充值

---

## 📊 完整复刻流程

### 第1阶段：基础设施（1天）
- [ ] 创建项目目录结构
- [ ] 配置TypeScript
- [ ] 配置数据库连接
- [ ] 创建所有Entity
- [ ] 运行数据库迁移
- [ ] 创建种子数据

**参考**: `backend/entities/*.ts`, `config/database.config.ts`

---

### 第2阶段：后端API（3天）
- [ ] 认证系统（注册/登录/JWT）
- [ ] 用户模块
- [ ] 静态代理模块（购买/查询/续费）
- [ ] 计费模块（充值/订单/交易）
- [ ] 管理后台API

**参考**: `backend/controllers/*.ts`, `backend/services/*.ts`

---

### 第3阶段：前端基础（1天）
- [ ] 路由配置
- [ ] API请求配置（Axios + 拦截器）
- [ ] 状态管理（Pinia）
- [ ] 样式系统（variables.scss）
- [ ] 公共组件（FlagIcon等）

**参考**: `frontend/router/`, `frontend/api/`, `frontend/stores/`

---

### 第4阶段：前端页面（3天）
- [ ] 认证页面（登录/注册）
- [ ] 用户仪表盘
- [ ] 静态代理页面（购买/管理）
- [ ] 动态代理页面
- [ ] 计费页面（充值/订单/交易）

**参考**: `frontend/views/**/*.vue`, `frontend/components/**/*.vue`

---

### 第5阶段：管理后台（2天）
- [ ] 管理后台布局
- [ ] 用户管理
- [ ] 充值审核
- [ ] 订单管理
- [ ] IP管理
- [ ] 数据统计
- [ ] 系统设置

**参考**: `frontend/views/admin/*.vue`, `backend/controllers/admin.controller.ts`

---

### 第6阶段：完善（1天）
- [ ] 国际化（中英文）
- [ ] 错误处理
- [ ] 加载状态
- [ ] 空状态
- [ ] 响应式设计

---

### 第7阶段：测试部署（1天）
- [ ] 单元测试（可选）
- [ ] E2E测试（可选）
- [ ] Docker部署测试
- [ ] 功能验收测试

---

## ⚠️ 重要提示

### 1. 不要跳过阶段

必须按顺序实施：
1. 基础设施 → 2. 后端API → 3. 前端基础 → 4. 前端页面 → ...

跳过阶段会导致后续实现困难。

### 2. 使用参考代码

不要让AI"自由发挥"，而是：
```
"请严格参考 CODE-REFERENCE/backend/services/static-proxy.service.ts 的实现逻辑，
特别是购买流程的事务处理部分。"
```

### 3. 验证数据流

确保数据流正确：
- 前端 → API → 后端 → 数据库 → 后端 → API → 前端
- 每个环节都要验证数据格式

### 4. 保持一致性

- Entity字段名 = API字段名 = 前端字段名
- 使用相同的命名规范（camelCase）
- 使用相同的错误码

---

## 🎯 快速开始

### 30秒快速开始

在新Cursor项目中，告诉AI：

```
【完整复刻ProxyHub项目】

我有完整的项目参考资料：
1. 设计文档：.spec-workflow/specs/proxyhub-rebuild/
2. UI参考：UI-REFERENCE/
3. 代码参考：CODE-REFERENCE/

请按照以下顺序实施：

阶段1：阅读所有参考文档
- requirements.md（需求）
- design.md（技术设计）
- tasks.md（任务分解）
- BACKEND_REFERENCE.md（后端参考）
- FRONTEND_REFERENCE.md（前端参考）

阶段2：创建项目基础
- 根据 CODE-REFERENCE/backend/entities/ 创建所有Entity
- 根据 config/database.config.ts 配置数据库

阶段3：实现后端API
- 根据 CODE-REFERENCE/backend/controllers/ 和 services/ 实现所有API
- 保持相同的业务逻辑和事务处理

阶段4：实现前端
- 根据 CODE-REFERENCE/frontend/router/ 配置路由
- 根据 CODE-REFERENCE/frontend/api/ 配置API调用
- 根据 CODE-REFERENCE/frontend/views/ 实现所有页面

现在从"阶段1：阅读参考文档"开始，告诉我你的理解。
```

---

## ✅ 验收标准

### 后端验收
- [ ] 所有API端点返回正确的数据格式
- [ ] 数据库操作使用事务处理
- [ ] JWT认证正常工作
- [ ] 错误处理完善
- [ ] 日志记录正确

### 前端验收
- [ ] 路由守卫正常工作
- [ ] API调用自动添加Token
- [ ] 状态管理正确更新
- [ ] UI与参考设计一致
- [ ] 响应式布局正常

### 集成验收
- [ ] 用户可以注册和登录
- [ ] 用户可以购买静态代理
- [ ] 管理员可以审核充值
- [ ] 所有页面正常显示
- [ ] Docker部署成功

---

## 📞 需要帮助？

### 遇到问题时

1. **先查参考代码**
   - 在 `CODE-REFERENCE/backend/` 或 `frontend/` 中查找类似实现

2. **查看参考文档**
   - `BACKEND_REFERENCE.md` - 后端实现说明
   - `FRONTEND_REFERENCE.md` - 前端实现说明

3. **引用具体文件**
   - 告诉AI："请参考 CODE-REFERENCE/xxx.ts 的实现"

4. **对比差异**
   - 让AI对比参考代码和当前实现的差异

---

**祝您复刻成功！** 🚀💻

下一步：阅读 `REPLICATION_PROMPTS.md` 获取详细的分步提示词。

---

**版本**: v1.0  
**创建日期**: 2025-10-31  
**维护者**: ProxyHub Team

