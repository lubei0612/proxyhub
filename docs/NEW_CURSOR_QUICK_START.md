# 🚀 新Cursor快速复刻ProxyHub - 完整提示词

## 📦 第一步：准备文件

将以下文件复制到新Cursor项目根目录：

```
新项目/
├── .spec-workflow/specs/proxyhub-clean-rebuild/
│   ├── requirements.md                    ✅ 需求文档
│   ├── design.md                          ✅ 设计文档  
│   ├── tasks.md                           ✅ 任务分解
│   ├── implementation-guide.md            ✅ 后端代码示例
│   └── frontend-complete-code.md          ✅ 前端完整代码
├── CURSOR_PROMPT_GUIDE.md                 ✅ 原提示词指南
├── PROJECT_REBUILD_SUMMARY.md             ✅ 项目总结
└── NEW_CURSOR_QUICK_START.md              ✅ 本文件
```

---

## 💬 第二步：初始化提示词

**复制以下内容给新Cursor：**

```
你好！我需要完美复刻一个ProxyHub代理IP管理平台。

**我已经准备好了超详细的文档**：

1. requirements.md - 完整功能需求
2. design.md - 系统架构设计  
3. tasks.md - 任务分解（33个任务）
4. implementation-guide.md - 后端所有代码示例
5. frontend-complete-code.md - 前端所有代码示例

**特别重要**：
- implementation-guide.md 包含：完整SQL脚本、所有Entity/Service/Controller代码、Docker配置
- frontend-complete-code.md 包含：完整路由、布局组件、侧边栏、顶部栏、仪表盘页面、统计卡片等

**请先做以下事情**：
1. 仔细阅读这5个文档
2. 重点阅读 frontend-complete-code.md 中的所有组件代码
3. 告诉我你看到了哪些关键代码（特别是Sidebar.vue、DashboardLayout.vue、Dashboard/Index.vue）
4. 确认你可以直接复制这些代码来构建项目

**技术栈**：
- 后端：NestJS + TypeScript + PostgreSQL + TypeORM
- 前端：Vue 3 + TypeScript + Element Plus + ECharts
- 部署：Docker + Docker Compose

准备好后，我们将开始构建。
```

---

## 💬 第三步：开始Phase 1（基础设施）

**等Cursor确认后，发送：**

```
很好！现在开始Phase 1: 基础设施搭建

### TASK-1.1 & 1.2: 初始化项目

请执行以下操作：

1. **创建后端项目**：
   ```bash
   npx @nestjs/cli new backend
   cd backend
   npm install @nestjs/typeorm @nestjs/config @nestjs/passport @nestjs/jwt
   npm install typeorm pg passport passport-jwt passport-local bcrypt
   npm install class-validator class-transformer axios dayjs
   ```

2. **创建前端项目**：
   ```bash
   npm create vite@latest frontend -- --template vue-ts
   cd frontend
   npm install vue-router pinia element-plus @element-plus/icons-vue axios dayjs echarts vue-echarts country-flag-icons sass
   ```

3. **创建目录结构**：
   - 后端：严格按照 design.md 中的后端目录结构
   - 前端：严格按照 frontend-complete-code.md 中的目录结构

完成后告诉我。
```

---

## 💬 第四步：配置Docker和数据库

```
### TASK-1.3 & 1.4: Docker和数据库配置

请直接复制以下文件：

1. **docker-compose.yml** - 从 implementation-guide.md 的 "Docker配置" 章节复制

2. **backend/Dockerfile** - 从 implementation-guide.md 复制

3. **frontend/Dockerfile** - 从 implementation-guide.md 复制  

4. **frontend/nginx.conf** - 从 implementation-guide.md 复制

5. **数据库SQL脚本** - 从 implementation-guide.md 的 "数据库完整SQL" 章节复制：
   - backend/database/init.sql
   - backend/database/migrations/001-create-views.sql
   - backend/database/migrations/002-create-triggers.sql
   - backend/database/seeds/001-init-data.sql

6. **.env.example** - 从 implementation-guide.md 复制

完成后告诉我。
```

---

## 💬 第五步：后端基础配置

```
### TASK-1.5: 后端基础设施配置

请从 implementation-guide.md 复制以下代码：

**配置文件（src/config/）**：
1. database.config.ts - TypeORM配置
2. jwt.config.ts - JWT配置  
3. app.config.ts - 应用配置

**装饰器（src/common/decorators/）**：
1. public.decorator.ts
2. roles.decorator.ts

**守卫（src/common/guards/）**：
1. jwt-auth.guard.ts
2. roles.guard.ts

**其他通用模块**：
1. src/common/filters/http-exception.filter.ts
2. src/common/interceptors/transform.interceptor.ts
3. src/common/dto/pagination.dto.ts

**配置main.ts**：
- 全局管道
- 全局过滤器
- 全局拦截器
- CORS配置

参考 design.md 的 "认证与授权设计" 章节编写这些文件。

完成后告诉我。
```

---

## 💬 第六步：前端基础配置（重要！）

```
### TASK-1.6: 前端基础设施配置

请从 frontend-complete-code.md 直接复制以下代码：

**核心配置**：
1. **src/router/index.ts** - 完整的路由配置（包含所有路由和守卫）
2. **src/api/request.ts** - Axios封装（拦截器配置）
3. **src/stores/user.ts** - 用户状态管理
4. **src/stores/app.ts** - 应用状态管理
5. **src/utils/storage.ts** - 本地存储工具
6. **src/utils/format.ts** - 格式化工具

**样式配置**：
1. src/styles/variables.scss - SCSS变量
2. src/styles/global.scss - 全局样式
3. vite.config.ts - Vite配置

**重要**：所有代码直接从 frontend-complete-code.md 复制，不要修改！

完成后告诉我。
```

---

## 💬 第七步：前端布局组件（核心！）

```
### 创建布局组件

请从 frontend-complete-code.md 的对应章节直接复制以下组件代码：

**主布局**：
1. **layouts/DashboardLayout.vue** - 第2️⃣章节的完整代码
2. **layouts/AdminPortalLayout.vue** - 第8️⃣章节的完整代码

**布局子组件**：
3. **layouts/components/Sidebar.vue** - 第3️⃣章节的完整代码（包含菜单数据和样式）
4. **layouts/components/Header.vue** - 第4️⃣章节的完整代码（包含用户下拉菜单）
5. **layouts/components/Breadcrumb.vue** - 第5️⃣章节的完整代码

**重要**：
- 所有代码一字不差地复制
- 包含所有 <template>、<script>、<style> 部分
- 注意Element Plus图标的导入

完成后告诉我，我要确认侧边栏是否正确显示。
```

---

## 💬 第八步：仪表盘页面（确保UI一致）

```
### 创建仪表盘页面

请从 frontend-complete-code.md 复制以下代码：

1. **views/dashboard/Index.vue** - 第6️⃣章节的完整代码
2. **components/common/StatCard.vue** - 第7️⃣章节的完整代码

**API接口**：
3. **src/api/statistics.ts** - 第🔟章节的完整代码

**重要**：
- 仪表盘页面要有4个统计卡片
- 要有快速操作按钮（4个）
- 要有消费趋势图区域

完成后启动前端，访问 http://localhost:5173，告诉我看到了什么界面。
```

---

## 💬 第九步：后端认证模块

```
### TASK-2.1: 实现后端认证模块

从 implementation-guide.md 的 "后端核心代码" 章节复制：

1. **User Entity** - src/modules/user/entities/user.entity.ts
2. **Auth Service** - src/modules/auth/auth.service.ts
3. **User Service** - src/modules/user/user.service.ts
4. **Auth Controller** - src/modules/auth/auth.controller.ts

创建相关的DTO文件：
- register.dto.ts
- login.dto.ts
- update-profile.dto.ts
- change-password.dto.ts

配置JWT策略和Local策略。

完成后测试：
```bash
npm run start:dev
```

确保后端可以启动。
```

---

## 💬 第十步：前端认证页面

```
### TASK-2.2: 创建登录注册页面

从 implementation-guide.md 复制：

1. **views/auth/Login.vue** - 完整的登录页面代码
2. **views/auth/Register.vue** - 参考Login.vue创建注册页面

创建API文件：
3. **src/api/auth.ts**：
```typescript
import { request } from './request';

export const login = (data: { email: string; password: string }) => {
  return request.post('/auth/login', data);
};

export const register = (data: any) => {
  return request.post('/auth/register', data);
};

export const getProfile = () => {
  return request.get('/users/profile');
};
```

完成后测试登录功能。
```

---

## 💬 第十一步：完整测试

```
### 启动完整测试

1. **启动Docker**：
```bash
docker-compose up -d
```

2. **访问前端**：http://localhost

3. **测试流程**：
   - 访问登录页
   - 使用管理员账号登录：admin@proxyhub.com / Admin123456
   - 进入仪表盘，确认看到：
     ✓ 侧边栏菜单正常显示
     ✓ 顶部栏显示用户信息和余额
     ✓ 4个统计卡片
     ✓ 4个快速操作按钮
     ✓ 消费趋势图区域
   - 点击侧边栏菜单，确认路由跳转正常

4. **检查管理后台**：
   - 点击用户下拉菜单 → "管理后台"
   - 确认进入管理后台界面
   - 侧边栏显示管理员菜单

告诉我测试结果。
```

---

## 🎯 后续开发（按需）

如果基础功能测试通过，可以继续实现：

### TASK-2.3-2.5: 代理模块
```
实现代理购买功能：
1. 后端：Proxy985Service、ProxyService、ProxyController
2. 前端：StaticBuy.vue、DynamicBuy.vue、MyProxies.vue

参考 implementation-guide.md 的 "代理模块" 章节。
```

### TASK-2.8-2.9: 充值模块
```
实现充值功能：
1. 后端：RechargeService、ExchangeRateService
2. 前端：Wallet/Index.vue、Wallet/Recharge.vue

参考 implementation-guide.md 的相关章节。
```

### TASK-2.10-2.11: 管理后台
```
实现管理后台功能：
1. 后端：AdminService（充值审批）
2. 前端：admin/Dashboard.vue、admin/RechargeApproval.vue、admin/Users.vue

参考 implementation-guide.md 的 "Admin Service核心方法" 章节。
```

---

## ⚠️ 常见问题

### 问题1：侧边栏菜单不显示
**解决**：
- 检查 Sidebar.vue 是否正确导入了 Element Plus 图标
- 检查路由配置是否正确
- 检查 CSS 样式是否正确应用

### 问题2：登录后跳转404
**解决**：
- 检查路由配置中的 redirect 路径
- 检查 Dashboard 组件是否正确创建
- 查看浏览器控制台错误信息

### 问题3：仪表盘样式不对
**解决**：
- 确保完全复制了 StatCard.vue 的所有代码（包括样式）
- 确保 global.scss 正确引入
- 检查 Element Plus 是否正确安装和配置

### 问题4：API请求失败
**解决**：
- 检查后端是否正常启动
- 检查 vite.config.ts 中的代理配置
- 查看网络请求的实际URL和状态码

---

## 📞 需要帮助

如果遇到问题，提供：
1. 当前执行到哪个步骤
2. 完整的错误信息
3. 相关代码片段
4. 浏览器控制台截图

---

## ✅ 验收标准

**Phase 1完成标志**：
- ✅ 前后端项目创建成功
- ✅ Docker配置正确
- ✅ 数据库初始化成功
- ✅ 基础配置完成

**Phase 2完成标志**：
- ✅ 可以登录
- ✅ 仪表盘正常显示
- ✅ 侧边栏菜单正确
- ✅ 路由跳转正常
- ✅ 管理后台可访问

**最终目标**：
界面和功能与原项目完全一致！

---

**祝你复刻成功！🎉**

