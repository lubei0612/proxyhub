# ProxyHub 完整项目重建 - 任务分解文档

## 📋 任务概述

本文档将ProxyHub项目分解为**30个可执行任务**，每个任务都有明确的实现步骤和验收标准。

---

## 🏗️ Phase 1: 项目基础设施搭建

### Task 1.1: 创建项目基础目录结构
**状态**: `[ ]`  
**预计时间**: 30分钟  
**依赖**: 无

**目标**:
- 创建backend和frontend目录
- 配置TypeScript、ESLint、Prettier
- 创建.gitignore和.env.example

**涉及文件**:
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/.eslintrc.js`
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `.gitignore`
- `docker-compose.yml`

**验收标准**:
- [ ] 目录结构清晰
- [ ] TypeScript配置正确
- [ ] 依赖安装成功

---

### Task 1.2: 配置数据库和初始化迁移
**状态**: `[ ]`  
**预计时间**: 1小时  
**依赖**: Task 1.1

**目标**:
- 配置TypeORM
- 创建7张核心数据表的Entity
- 生成初始迁移文件
- 创建种子数据

**涉及文件**:
- `backend/src/config/database.config.ts`
- `backend/src/modules/user/entities/user.entity.ts`
- `backend/src/modules/billing/entities/recharge.entity.ts`
- `backend/src/modules/order/entities/order.entity.ts`
- `backend/src/modules/proxy/static/entities/static-proxy.entity.ts`
- `backend/src/modules/billing/entities/transaction.entity.ts`
- `backend/src/modules/usage/entities/usage-record.entity.ts`
- `backend/src/modules/admin/entities/system-settings.entity.ts`
- `backend/src/database/migrations/`

**验收标准**:
- [ ] 所有Entity定义完整
- [ ] 数据库迁移成功
- [ ] 种子数据插入成功（admin@proxy.com, test@test.com）

---

## 🔐 Phase 2: 认证系统实现

### Task 2.1: 实现JWT认证模块
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 1.2

**目标**:
- 配置Passport.js + JWT
- 实现LocalStrategy和JwtStrategy
- 创建AuthGuard和RolesGuard
- 实现@CurrentUser装饰器

**涉及文件**:
- `backend/src/modules/auth/auth.module.ts`
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/strategies/jwt.strategy.ts`
- `backend/src/modules/auth/strategies/local.strategy.ts`
- `backend/src/common/guards/jwt-auth.guard.ts`
- `backend/src/common/guards/roles.guard.ts`
- `backend/src/common/decorators/current-user.decorator.ts`

**验收标准**:
- [ ] POST /api/v1/auth/register 成功
- [ ] POST /api/v1/auth/login 返回Token
- [ ] POST /api/v1/auth/admin-login 验证role='admin'
- [ ] JWT Token验证正常

---

### Task 2.2: 实现前端认证页面
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 2.1

**目标**:
- 创建登录页面
- 创建注册页面
- 实现Pinia用户状态管理
- 配置Axios拦截器（自动添加Token）
- 实现路由守卫（requiresAuth）

**涉及文件**:
- `frontend/src/views/auth/Login.vue`
- `frontend/src/views/auth/Register.vue`
- `frontend/src/stores/user.ts`
- `frontend/src/api/request.ts`
- `frontend/src/api/modules/auth.ts`
- `frontend/src/router/guards.ts`

**验收标准**:
- [ ] 用户可以注册新账户
- [ ] 用户可以登录
- [ ] Token自动添加到请求头
- [ ] 未登录用户自动跳转登录页

---

## 👤 Phase 3: 用户中心实现

### Task 3.1: 实现用户API
**状态**: `[ ]`  
**预计时间**: 1小时  
**依赖**: Task 2.1

**目标**:
- 实现用户信息查询
- 实现用户信息更新
- 实现密码修改

**涉及文件**:
- `backend/src/modules/user/user.controller.ts`
- `backend/src/modules/user/user.service.ts`
- `backend/src/modules/user/dto/update-user.dto.ts`
- `backend/src/modules/user/dto/change-password.dto.ts`

**验收标准**:
- [ ] GET /api/v1/user/profile 返回用户信息
- [ ] PUT /api/v1/user/profile 更新成功
- [ ] PUT /api/v1/user/password 密码修改成功

---

## 📦 Phase 4: 静态代理模块实现

### Task 4.1: 实现静态代理后端API
**状态**: `[ ]`  
**预计时间**: 4小时  
**依赖**: Task 3.1

**目标**:
- 实现IP库存查询API（Mock数据）
- 实现静态代理购买API（含事务处理）
- 实现我的IP列表API
- 实现续费API
- 实现释放API

**涉及文件**:
- `backend/src/modules/proxy/static/static-proxy.controller.ts`
- `backend/src/modules/proxy/static/static-proxy.service.ts`
- `backend/src/modules/proxy/static/dto/purchase-static.dto.ts`
- `backend/src/modules/proxy/static/dto/renew-static.dto.ts`
- `backend/src/constants/static-pricing.ts`

**关键逻辑**:
```typescript
// 购买流程（使用数据库事务）
1. 验证余额充足
2. 创建订单（status='processing'）
3. Mock生成IP数据
4. 保存IP到static_proxies表
5. 扣除用户余额
6. 创建交易记录（type='purchase'）
7. 更新订单状态（status='completed'）
8. 提交事务
```

**验收标准**:
- [ ] GET /api/v1/proxy/static/inventory 返回Mock库存
- [ ] POST /api/v1/proxy/static/purchase 购买成功并扣费
- [ ] GET /api/v1/proxy/static/my-ips 返回用户IP列表
- [ ] POST /api/v1/proxy/static/renew 续费成功
- [ ] DELETE /api/v1/proxy/static/release/:id 释放成功

---

### Task 4.2: 实现静态代理购买页面
**状态**: `[ ]`  
**预计时间**: 4小时  
**依赖**: Task 4.1

**目标**:
- 创建StaticBuy.vue
- 实现IP池网格展示（带国旗）
- 实现购物车功能
- 实现支付详情面板
- 实现购买流程

**涉及文件**:
- `frontend/src/views/proxy/StaticBuy.vue`
- `frontend/src/components/proxy/IPTypeSelector.vue`
- `frontend/src/components/proxy/ScenarioSelector.vue`
- `frontend/src/components/proxy/RegionTabs.vue`
- `frontend/src/components/proxy/CountryTabs.vue`
- `frontend/src/components/proxy/CountryCard.vue`
- `frontend/src/components/proxy/PaymentPanel.vue`
- `frontend/src/components/common/FlagIcon.vue`
- `frontend/src/composables/useStaticProxyPurchase.ts`
- `frontend/src/composables/useShoppingCart.ts`
- `frontend/src/constants/static-pricing.ts`
- `frontend/src/constants/scenarios.ts`

**验收标准**:
- [ ] 国旗图标正确显示
- [ ] IP类型切换正常
- [ ] 地区和国家筛选正常
- [ ] 购物车增删改正常
- [ ] 价格计算正确
- [ ] 购买流程完整

---

### Task 4.3: 实现静态代理管理页面
**状态**: `[ ]`  
**预计时间**: 3小时  
**依赖**: Task 4.2

**目标**:
- 创建StaticManage.vue
- 实现IP列表展示（表格）
- 实现筛选功能
- 实现批量导出（TXT/CSV）
- 实现批量续费
- 实现单个续费和释放

**涉及文件**:
- `frontend/src/views/proxy/StaticManage.vue`

**验收标准**:
- [ ] IP列表正确展示
- [ ] 筛选功能正常
- [ ] 批量选择正常
- [ ] 导出TXT格式正确（IP:端口:账号:密码）
- [ ] 导出CSV格式正确
- [ ] 续费功能正常
- [ ] 释放功能正常

---

## 🔄 Phase 5: 动态代理模块实现

### Task 5.1: 实现动态代理购买页面
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 4.3

**目标**:
- 创建DynamicBuy.vue
- 展示5个套餐（现收现付、个人、商务、高级、企业定制）
- 企业定制跳转Telegram

**涉及文件**:
- `frontend/src/views/proxy/DynamicBuy.vue`
- `frontend/src/constants/pricing.ts`

**验收标准**:
- [ ] 5个套餐正确展示
- [ ] 价格显示正确
- [ ] "最受欢迎"标签显示在个人套餐
- [ ] 企业定制跳转Telegram链接

---

### Task 5.2: 实现动态代理管理页面
**状态**: `[ ]`  
**预计时间**: 1小时  
**依赖**: Task 5.1

**目标**:
- 创建DynamicManage.vue
- 显示空状态+联系客服按钮

**涉及文件**:
- `frontend/src/views/proxy/DynamicManage.vue`

**验收标准**:
- [ ] 空状态显示正常
- [ ] 联系客服跳转Telegram

---

## 💰 Phase 6: 计费模块实现

### Task 6.1: 实现充值后端API
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 3.1

**目标**:
- 实现充值申请API
- 实现我的充值记录API
- 生成唯一订单号

**涉及文件**:
- `backend/src/modules/billing/recharge.controller.ts`
- `backend/src/modules/billing/recharge.service.ts`
- `backend/src/modules/billing/dto/create-recharge.dto.ts`
- `backend/src/utils/order-number.util.ts`

**验收标准**:
- [ ] POST /api/v1/billing/recharge 创建成功
- [ ] GET /api/v1/billing/recharge/my-recharges 返回列表

---

### Task 6.2: 实现充值前端页面
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 6.1

**目标**:
- 创建Recharge.vue
- 实现充值表单
- 实时显示CNY换算（汇率7.2）
- 显示充值历史

**涉及文件**:
- `frontend/src/views/wallet/Recharge.vue`

**验收标准**:
- [ ] 充值金额输入正常
- [ ] CNY换算正确
- [ ] 提交充值申请成功
- [ ] 充值历史显示正常

---

### Task 6.3: 实现订单模块
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 6.2

**目标**:
- 实现订单后端API
- 实现订单前端页面

**涉及文件**:
- `backend/src/modules/order/order.controller.ts`
- `backend/src/modules/order/order.service.ts`
- `frontend/src/views/order/Orders.vue`

**验收标准**:
- [ ] GET /api/v1/orders 返回订单列表
- [ ] GET /api/v1/orders/:id 返回订单详情
- [ ] DELETE /api/v1/orders/:id/cancel 取消订单成功
- [ ] 前端筛选功能正常

---

### Task 6.4: 实现交易记录模块
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 6.3

**目标**:
- 实现交易记录后端API
- 实现交易记录前端页面

**涉及文件**:
- `backend/src/modules/billing/transaction.controller.ts`
- `backend/src/modules/billing/transaction.service.ts`
- `frontend/src/views/billing/Transactions.vue`

**验收标准**:
- [ ] GET /api/v1/billing/transactions 返回交易记录
- [ ] 金额颜色区分正确（+绿色/-红色）
- [ ] 筛选功能正常

---

## 📊 Phase 7: 仪表盘实现

### Task 7.1: 实现仪表盘后端API
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 6.4

**目标**:
- 实现仪表盘概览API
- 返回余额、代理数量、最近订单、使用趋势数据

**涉及文件**:
- `backend/src/modules/dashboard/dashboard.controller.ts`
- `backend/src/modules/dashboard/dashboard.service.ts`

**验收标准**:
- [ ] GET /api/v1/dashboard/overview 返回完整数据

---

### Task 7.2: 实现仪表盘前端页面
**状态**: `[ ]`  
**预计时间**: 3小时  
**依赖**: Task 7.1

**目标**:
- 创建Dashboard页面
- 实现账户概览卡片
- 实现快捷操作按钮
- 实现使用概况折线图（ECharts）
- 实现最近订单列表

**涉及文件**:
- `frontend/src/views/dashboard/Index.vue`
- `frontend/src/components/charts/UsageLineChart.vue`

**验收标准**:
- [ ] 账户概览卡片数据正确
- [ ] 快捷按钮跳转正常
- [ ] 折线图渲染正常
- [ ] 最近订单显示正常

---

## 🔧 Phase 8: 管理后台实现

### Task 8.1: 实现管理后台认证
**状态**: `[ ]`  
**预计时间**: 1小时  
**依赖**: Task 2.1

**目标**:
- 创建管理后台登录页面
- 验证role='admin'
- 独立路由/admin-portal

**涉及文件**:
- `frontend/src/views/admin/Login.vue`
- `frontend/src/layouts/AdminLayout.vue`

**验收标准**:
- [ ] /admin-portal/login 显示独立登录页
- [ ] 非admin用户无法登录
- [ ] 登录后跳转到/admin-portal/users

---

### Task 8.2: 实现用户管理模块
**状态**: `[ ]`  
**预计时间**: 3小时  
**依赖**: Task 8.1

**目标**:
- 实现用户管理后端API
- 实现用户管理前端页面

**涉及文件**:
- `backend/src/modules/admin/admin.controller.ts`
- `backend/src/modules/admin/admin.service.ts`
- `frontend/src/views/admin/Users.vue`

**验收标准**:
- [ ] GET /api/v1/admin/users 返回用户列表
- [ ] PUT /api/v1/admin/users/:id 更新用户成功
- [ ] DELETE /api/v1/admin/users/:id 软删除成功
- [ ] 前端搜索和筛选正常

---

### Task 8.3: 实现充值审核模块
**状态**: `[ ]`  
**预计时间**: 3小时  
**依赖**: Task 8.2

**目标**:
- 实现充值审核后端API
- 实现充值审核前端页面
- 批准后更新用户余额+创建交易记录

**涉及文件**:
- `backend/src/modules/admin/admin.controller.ts (recharge methods)`
- `frontend/src/views/admin/RechargeApproval.vue`

**关键逻辑**:
```typescript
// 批准充值流程（使用数据库事务）
1. 更新充值状态为'approved'
2. 增加用户余额
3. 创建交易记录（type='recharge', amount=正数）
4. 提交事务
```

**验收标准**:
- [ ] GET /api/v1/admin/recharges 返回充值列表
- [ ] POST /api/v1/admin/recharges/:id/approve 批准成功并更新余额
- [ ] POST /api/v1/admin/recharges/:id/reject 拒绝成功
- [ ] 前端筛选功能正常

---

### Task 8.4: 实现订单管理模块
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 8.3

**目标**:
- 实现订单管理后端API
- 实现订单管理前端页面

**涉及文件**:
- `backend/src/modules/admin/admin.controller.ts (order methods)`
- `frontend/src/views/admin/Orders.vue`

**验收标准**:
- [ ] GET /api/v1/admin/orders 返回所有订单
- [ ] PUT /api/v1/admin/orders/:id 更新订单状态成功
- [ ] 导出CSV功能正常

---

### Task 8.5: 实现IP管理模块
**状态**: `[ ]`  
**预计时间**: 4小时  
**依赖**: Task 8.4

**目标**:
- 实现IP管理后端API
- 实现CSV导入功能
- 实现TXT导出功能
- 实现IP管理前端页面

**涉及文件**:
- `backend/src/modules/admin/admin.controller.ts (ip methods)`
- `frontend/src/views/admin/IPManagement.vue`

**CSV导入格式**:
```csv
IP,端口,账号,密码,国家,城市,类型,到期时间
192.168.1.1,8080,user1,pass1,US,纽约,normal,2025-12-31T00:00:00Z
```

**验收标准**:
- [ ] GET /api/v1/admin/ips/static 返回所有IP
- [ ] POST /api/v1/admin/ips/static/import CSV导入成功
- [ ] GET /api/v1/admin/ips/static/export 导出TXT成功
- [ ] 前端搜索和筛选正常

---

### Task 8.6: 实现数据统计模块
**状态**: `[ ]`  
**预计时间**: 4小时  
**依赖**: Task 8.5

**目标**:
- 实现统计后端API（Redis缓存5分钟）
- 实现数据统计前端页面（卡片+图表）

**涉及文件**:
- `backend/src/modules/admin/statistics.controller.ts`
- `backend/src/modules/admin/statistics.service.ts`
- `frontend/src/views/admin/Statistics.vue`

**统计指标**:
- 总用户数、今日新增用户
- 总订单数、今日订单数
- 总收入、今日收入
- 活跃IP数、即将到期IP数

**图表**:
- 用户增长趋势（折线图）
- 订单趋势（折线图）
- 收入趋势（折线图）
- IP类型分布（饼图）
- 国家分布（饼图）

**验收标准**:
- [ ] GET /api/v1/admin/statistics/overview 返回统计数据
- [ ] GET /api/v1/admin/statistics/trends 返回趋势数据
- [ ] GET /api/v1/admin/statistics/distribution 返回分布数据
- [ ] Redis缓存正常工作
- [ ] 前端图表渲染正常

---

### Task 8.7: 实现系统设置模块
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 8.6

**目标**:
- 实现系统设置后端API
- 实现系统设置前端页面

**涉及文件**:
- `backend/src/modules/admin/settings.controller.ts`
- `backend/src/modules/admin/settings.service.ts`
- `frontend/src/views/admin/Settings.vue`

**验收标准**:
- [ ] GET /api/v1/admin/settings 返回所有设置
- [ ] PUT /api/v1/admin/settings 更新设置成功
- [ ] 前端表单验证正常

---

## 🌍 Phase 9: 国际化实现

### Task 9.1: 实现国际化
**状态**: `[ ]`  
**预计时间**: 3小时  
**依赖**: Task 8.7

**目标**:
- 配置vue-i18n
- 创建中英文翻译文件
- 所有界面文本使用$t()
- 实现语言切换器

**涉及文件**:
- `frontend/src/locales/zh-CN.json`
- `frontend/src/locales/en-US.json`
- `frontend/src/layouts/DashboardLayout.vue (语言切换器)`

**验收标准**:
- [ ] 所有静态文本都有翻译键
- [ ] 中英文切换正常
- [ ] 语言偏好保存到LocalStorage

---

## 📱 Phase 10: 移动代理占位

### Task 10.1: 实现移动代理占位页
**状态**: `[ ]`  
**预计时间**: 30分钟  
**依赖**: Task 9.1

**目标**:
- 创建MobilePlaceholder.vue
- 显示"功能开发中"

**涉及文件**:
- `frontend/src/views/proxy/MobilePlaceholder.vue`

**验收标准**:
- [ ] 占位页显示正常

---

## 🐳 Phase 11: Docker部署配置

### Task 11.1: 配置Docker Compose
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 10.1

**目标**:
- 创建docker-compose.yml
- 创建前端Dockerfile
- 创建后端Dockerfile
- 创建Nginx配置

**涉及文件**:
- `docker-compose.yml`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `backend/Dockerfile`

**验收标准**:
- [ ] docker-compose up -d 成功启动
- [ ] 前端访问 http://localhost 正常
- [ ] 后端API http://localhost:3000/api/v1 正常
- [ ] PostgreSQL和Redis连接正常

---

## 📝 Phase 12: 文档和部署指南

### Task 12.1: 创建项目文档
**状态**: `[ ]`  
**预计时间**: 2小时  
**依赖**: Task 11.1

**目标**:
- 创建README.md
- 创建.env.example
- 创建快速启动指南
- 创建API文档

**涉及文件**:
- `README.md`
- `.env.example`
- `docs/QUICK_START.md`
- `docs/API_DOCUMENTATION.md`

**验收标准**:
- [ ] README.md完整清晰
- [ ] .env.example包含所有配置项
- [ ] 快速启动指南可执行

---

## ✅ 验收清单

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
- [ ] 管理员可以配置系统设置
- [ ] 国际化切换正常
- [ ] 国旗图标显示正常

### 质量验收
- [ ] 无TypeScript类型错误
- [ ] 无ESLint错误
- [ ] 代码格式化正确
- [ ] 所有API返回正确的HTTP状态码
- [ ] 错误处理完善
- [ ] 响应式设计正常

### 性能验收
- [ ] 首屏加载时间 < 2秒
- [ ] API响应时间 < 200ms（P95）
- [ ] 数据库查询有索引优化

### 部署验收
- [ ] Docker Compose启动成功
- [ ] 数据库迁移成功
- [ ] 种子数据插入成功
- [ ] 所有服务健康检查通过

---

## 📊 进度统计

| Phase | 任务数 | 预计时间 | 状态 |
|-------|-------|---------|------|
| Phase 1: 基础设施 | 2 | 1.5小时 | ⏳ |
| Phase 2: 认证系统 | 2 | 4小时 | ⏳ |
| Phase 3: 用户中心 | 1 | 1小时 | ⏳ |
| Phase 4: 静态代理 | 3 | 11小时 | ⏳ |
| Phase 5: 动态代理 | 2 | 3小时 | ⏳ |
| Phase 6: 计费模块 | 4 | 8小时 | ⏳ |
| Phase 7: 仪表盘 | 2 | 5小时 | ⏳ |
| Phase 8: 管理后台 | 7 | 21小时 | ⏳ |
| Phase 9: 国际化 | 1 | 3小时 | ⏳ |
| Phase 10: 移动代理占位 | 1 | 0.5小时 | ⏳ |
| Phase 11: Docker部署 | 1 | 2小时 | ⏳ |
| Phase 12: 文档 | 1 | 2小时 | ⏳ |
| **总计** | **27** | **62小时** | ⏳ |

---

**文档版本**: v1.0  
**创建日期**: 2025-10-31  
**作者**: AI开发团队  
**任务完成度**: 0/27 (0%)

