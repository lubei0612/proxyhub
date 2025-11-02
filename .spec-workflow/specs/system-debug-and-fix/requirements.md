# ProxyHub系统调试与修复 - 需求文档

## 1. 概述
**规范名称**: system-debug-and-fix  
**创建日期**: 2025-11-02  
**状态**: 草稿  
**优先级**: P0（紧急）

## 2. 问题描述

当前ProxyHub系统存在以下关键问题，导致用户无法正常使用：

### 2.1 核心问题
1. **用户无法登录** - 点击登录按钮后，页面没有任何反应，停留在登录页面
2. **后端API路由404** - 访问后端API返回404 Not Found
3. **Swagger文档不可用** - API文档页面返回404
4. **数据库可能缺少初始数据** - 测试账号可能不存在

### 2.2 已知环境状态
- ✅ 数据库（PostgreSQL）运行正常
- ✅ 前端服务运行正常（Vite dev server）
- ✅ 后端服务运行正常（NestJS）
- ❌ 前端登录无法发送API请求
- ❌ 后端API路由配置问题
- ❌ Swagger未正确配置

## 3. 功能需求

### FR-1: 修复后端API路由配置
**优先级**: P0  
**描述**: 确保所有API端点正确暴露，可以通过HTTP请求访问

**验收标准**:
- WHEN 访问 http://localhost:3000/api/v1/auth/login (POST)
- THEN 应返回正确的响应（401或200），而不是404
- AND 所有API端点都应该可访问

### FR-2: 配置Swagger API文档
**优先级**: P0  
**描述**: 配置并启用Swagger文档，便于API测试和调试

**验收标准**:
- WHEN 访问 http://localhost:3000/api
- THEN 应显示完整的Swagger UI界面
- AND 可以直接在Swagger中测试API

### FR-3: 初始化数据库种子数据
**优先级**: P0  
**描述**: 确保数据库中有测试账号和初始数据

**验收标准**:
- WHEN 运行种子数据脚本
- THEN 数据库中应创建以下账号：
  - 普通用户: user@example.com / password123（余额$1000）
  - 管理员: admin@example.com / admin123（余额$10000）
- AND 可以使用这些账号成功登录

### FR-4: 验证前端登录流程
**优先级**: P0  
**描述**: 确保前端登录流程完整，能够成功调用后端API并跳转

**验收标准**:
- WHEN 在登录页面输入正确的账号密码并点击登录
- THEN 应发送POST请求到 /api/v1/auth/login
- AND 收到响应后保存token到localStorage
- AND 自动跳转到仪表盘页面

### FR-5: 验证API认证和权限
**优先级**: P1  
**描述**: 确保JWT认证正常工作，权限控制正确

**验收标准**:
- WHEN 用户登录成功后
- THEN 所有后续请求应自动附加JWT token
- AND 访问需要认证的API应返回正确数据
- AND 访问管理员API普通用户应返回403

### FR-6: 端到端测试关键流程
**优先级**: P1  
**描述**: 测试核心业务流程确保可用

**验收标准**:
- WHEN 用户登录后
- THEN 可以查看仪表盘数据
- AND 可以购买静态代理
- AND 可以提交充值申请
- AND 管理员可以审批充值

## 4. 非功能需求

### NFR-1: 错误处理
- 所有API错误应返回清晰的错误消息
- 前端应正确显示错误提示

### NFR-2: 日志记录
- 后端应记录所有API请求日志
- 错误应记录详细堆栈信息

### NFR-3: 性能要求
- API响应时间 < 500ms
- 登录过程 < 2秒

### NFR-4: 安全要求
- 密码使用bcrypt加密
- JWT token有效期15分钟
- 敏感信息不记录在日志中

## 5. 约束条件

### 技术约束
- 使用现有技术栈（NestJS + Vue3 + PostgreSQL）
- 不修改数据库schema
- 保持现有API接口设计

### 时间约束
- 必须在1小时内完成核心问题修复
- 2小时内完成所有测试验证

## 6. 依赖关系

### 前置条件
- Docker已安装并运行
- Node.js v18+已安装
- PostgreSQL容器运行正常
- 项目依赖已安装（npm install）

### 外部依赖
- Element Plus
- Axios
- TypeORM
- Passport.js

## 7. 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 数据库schema不匹配 | 高 | 中 | 运行迁移脚本，检查entity定义 |
| 环境变量配置错误 | 高 | 高 | 检查.env文件，验证配置 |
| 依赖包版本冲突 | 中 | 低 | 检查package.json，重新安装 |
| 前端路由配置错误 | 中 | 中 | 检查router配置，验证跳转逻辑 |

## 8. 验收标准总结

**必须满足**:
1. ✅ 用户可以成功登录
2. ✅ Swagger文档可以访问
3. ✅ 仪表盘数据正确显示
4. ✅ 可以购买静态代理
5. ✅ 管理员可以审批充值

**期望满足**:
1. ✅ 所有API端点都可访问
2. ✅ 错误提示清晰友好
3. ✅ 日志记录完整

## 9. 成功指标

- **关键指标**: 用户登录成功率 = 100%
- **次要指标**: 
  - API可用率 = 100%
  - 响应时间 < 500ms
  - 错误率 < 1%

## 10. 交付物

1. **代码修复**:
   - 修复后的backend/src/main.ts（Swagger配置）
   - 修复后的种子数据脚本
   - 修复后的前端登录组件（如需要）

2. **测试报告**:
   - Chrome DevTools测试截图
   - API测试结果
   - 端到端测试验证

3. **文档更新**:
   - 修复说明文档
   - 更新的启动指南

## 11. 附录

### A. 测试账号
```
普通用户：
- 邮箱: user@example.com
- 密码: password123
- 初始余额: $1000.00

管理员：
- 邮箱: admin@example.com
- 密码: admin123
- 初始余额: $10000.00
```

### B. 关键API端点
```
POST /api/v1/auth/register - 用户注册
POST /api/v1/auth/login - 用户登录
POST /api/v1/auth/admin-login - 管理员登录
GET /api/v1/users/me - 获取当前用户
GET /api/v1/dashboard/overview - 仪表盘数据
POST /api/v1/proxy/static/purchase - 购买静态代理
POST /api/v1/billing/recharge - 提交充值
PUT /api/v1/billing/recharge/:id/approve - 审批充值
```

### C. 期望的Swagger配置
- Title: ProxyHub API
- Description: 代理IP管理平台API文档
- Version: 1.0.0
- Contact: 开发团队
- Tag分组: Auth, User, Proxy, Billing, Order, Admin, Dashboard

---

**状态**: 等待设计阶段  
**最后更新**: 2025-11-02  
**负责人**: AI开发助手

