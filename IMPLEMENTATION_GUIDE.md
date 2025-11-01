# ProxyHub 项目实施指南

## 📋 文档说明

您现在拥有以下完整文档：

### 1. 规划文档（.spec-workflow/specs/proxyhub-rebuild/）
- ✅ **requirements.md** - 97个详细需求
- ✅ **design.md** - 完整技术架构设计
- ✅ **tasks.md** - 27个可执行任务

### 2. 项目配置文件
- ✅ `README.md` - 项目说明
- ✅ `docker-compose.yml` - Docker编排配置
- ✅ `ENV_TEMPLATE.txt` - 环境变量模板
- ✅ `backend/package.json` - 后端依赖
- ✅ `backend/tsconfig.json` - TypeScript配置
- ✅ `backend/Dockerfile` - 后端Docker配置
- ✅ `frontend/package.json` - 前端依赖
- ✅ `frontend/vite.config.ts` - Vite配置
- ✅ `frontend/Dockerfile` - 前端Docker配置
- ✅ `frontend/nginx.conf` - Nginx配置

---

## 🚀 在新Cursor项目中使用本文档的步骤

### 第一步：复制文档到新项目

```bash
# 1. 创建新的Cursor项目目录
mkdir proxyhub-new
cd proxyhub-new

# 2. 复制所有文档
cp -r /path/to/proxyhub-rebuild/.spec-workflow .
cp -r /path/to/proxyhub-rebuild/*.md .
cp -r /path/to/proxyhub-rebuild/docker-compose.yml .
cp -r /path/to/proxyhub-rebuild/ENV_TEMPLATE.txt .

# 3. 复制项目配置文件
cp -r /path/to/proxyhub-rebuild/backend/package.json backend/
cp -r /path/to/proxyhub-rebuild/backend/tsconfig.json backend/
cp -r /path/to/proxyhub-rebuild/backend/nest-cli.json backend/
cp -r /path/to/proxyhub-rebuild/backend/Dockerfile backend/

cp -r /path/to/proxyhub-rebuild/frontend/package.json frontend/
cp -r /path/to/proxyhub-rebuild/frontend/tsconfig.json frontend/
cp -r /path/to/proxyhub-rebuild/frontend/vite.config.ts frontend/
cp -r /path/to/proxyhub-rebuild/frontend/index.html frontend/
cp -r /path/to/proxyhub-rebuild/frontend/Dockerfile frontend/
cp -r /path/to/proxyhub-rebuild/frontend/nginx.conf frontend/
```

### 第二步：使用AI助手实现代码

在新的Cursor项目中，您可以这样与AI助手对话：

#### 方式1：按照Tasks.md逐个实现

```
"请根据 .spec-workflow/specs/proxyhub-rebuild/tasks.md 中的 Task 1.1 实现项目基础目录结构"
```

AI会根据Tasks.md的详细说明创建所有需要的文件。

#### 方式2：按模块实现

```
"请根据 .spec-workflow/specs/proxyhub-rebuild/design.md 中的数据库设计，创建所有Entity文件"
```

#### 方式3：直接实现完整功能

```
"请根据 .spec-workflow/specs/proxyhub-rebuild/ 中的文档，实现用户认证模块"
```

---

## 📝 推荐实施顺序

### Phase 1: 后端基础（1-2小时）

```
1. "请根据tasks.md的Task 1.1，创建后端项目的基础目录结构"
2. "请根据tasks.md的Task 1.2，创建所有数据库Entity文件"
3. "请运行数据库迁移并创建种子数据"
```

**验收**:
- [ ] 所有Entity文件创建完成
- [ ] 数据库迁移成功
- [ ] 种子数据插入成功（admin@proxy.com, test@test.com）

### Phase 2: 认证系统（2小时）

```
"请根据tasks.md的Task 2.1和2.2，实现完整的认证系统（后端+前端）"
```

**验收**:
- [ ] POST /api/v1/auth/register 成功
- [ ] POST /api/v1/auth/login 返回Token
- [ ] 前端登录页面可用
- [ ] 路由守卫正常工作

### Phase 3: 静态代理模块（4小时）

```
"请根据tasks.md的Task 4.1、4.2、4.3，实现完整的静态代理模块"
```

**验收**:
- [ ] 可以查看IP库存
- [ ] 可以购买静态代理
- [ ] 可以管理和续费IP
- [ ] 国旗图标正常显示

### Phase 4: 计费模块（3小时）

```
"请根据tasks.md的Task 6.1-6.4，实现充值、订单、交易记录模块"
```

**验收**:
- [ ] 可以提交充值申请
- [ ] 可以查看订单列表
- [ ] 可以查看交易记录

### Phase 5: 管理后台（6小时）

```
"请根据tasks.md的Task 8.1-8.7，实现完整的管理后台"
```

**验收**:
- [ ] 管理员可以登录
- [ ] 6大管理模块全部可用
- [ ] 数据统计图表正常

### Phase 6: 仪表盘和国际化（3小时）

```
"请根据tasks.md的Task 7.1-7.2和Task 9.1，实现仪表盘和国际化"
```

**验收**:
- [ ] 仪表盘数据正确
- [ ] 折线图渲染正常
- [ ] 中英文切换正常

---

## 🎯 关键实现要点

### 1. 数据库设计

所有Entity定义在`design.md`的第2.2节，包括：
- users（用户表）
- recharges（充值表）
- orders（订单表）
- static_proxies（静态代理表）
- transactions（交易记录表）
- usage_records（使用记录表）
- system_settings（系统设置表）

### 2. API设计

所有API端点定义在`design.md`的第3节，包括：
- 认证API（/auth）
- 用户API（/user）
- 静态代理API（/proxy/static）
- 充值API（/billing/recharge）
- 订单API（/orders）
- 交易记录API（/billing/transactions）
- 管理后台API（/admin）
- 仪表盘API（/dashboard）

### 3. 前端路由

所有路由定义在`design.md`的第4.2节，包括：
- 认证路由（/login, /register）
- 用户路由（/dashboard, /proxy/*, /billing/*）
- 管理后台路由（/admin-portal/*）

### 4. 国旗图标实现

使用`country-flag-icons`包，具体实现见`design.md`的第4.4节。

---

## 📦 完成后的启动步骤

### 使用Docker（推荐）

```bash
# 1. 配置环境变量
cp ENV_TEMPLATE.txt .env
# 编辑 .env 文件

# 2. 启动所有服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 访问应用
# 前端: http://localhost
# 后端: http://localhost:3000/api/v1
```

### 手动启动

```bash
# 1. 启动PostgreSQL和Redis
docker-compose up -d postgres redis

# 2. 后端
cd backend
npm install
npm run migration:run
npm run start:dev

# 3. 前端
cd ../frontend
npm install
npm run dev
```

---

## ✅ 完成验收清单

### 功能验收
- [ ] 用户可以注册和登录
- [ ] 用户可以购买和管理静态代理
- [ ] 用户可以查看动态代理套餐
- [ ] 用户可以提交充值申请
- [ ] 用户可以查看订单和交易记录
- [ ] 用户仪表盘数据正确
- [ ] 管理员可以登录管理后台
- [ ] 管理员可以管理用户
- [ ] 管理员可以审核充值
- [ ] 管理员可以管理订单和IP
- [ ] 管理员可以查看数据统计
- [ ] 国际化切换正常
- [ ] 国旗图标显示正常

### 质量验收
- [ ] 无TypeScript类型错误
- [ ] 无ESLint错误
- [ ] 所有API返回正确的HTTP状态码
- [ ] 错误处理完善

### 性能验收
- [ ] 首屏加载时间 < 2秒
- [ ] API响应时间 < 200ms（P95）

---

## 🔧 常见问题

### Q1: 如何修改数据库密码？
A: 编辑`.env`文件中的`DATABASE_PASSWORD`

### Q2: 如何修改JWT密钥？
A: 编辑`.env`文件中的`JWT_SECRET`（生产环境必须修改！）

### Q3: 如何添加新的API端点？
A: 参考`design.md`的第3节，按照RESTful规范添加

### Q4: 如何修改定价？
A: 
- 动态代理：编辑`frontend/src/constants/pricing.ts`
- 静态代理：编辑`frontend/src/constants/static-pricing.ts`

---

## 📞 技术支持

如果在实施过程中遇到问题：

1. **查看文档**: 先查看`design.md`和`tasks.md`
2. **检查日志**: `docker-compose logs`
3. **提问AI**: 在Cursor中直接询问AI助手

---

**祝您实施顺利！** 🎉

---

**文档版本**: v1.0  
**创建日期**: 2025-10-31  
**作者**: AI开发团队

