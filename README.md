# ProxyHub - 智能代理管理平台

## 📋 项目概述

ProxyHub是一个全功能的代理IP管理平台，集成985Proxy服务，提供静态住宅代理、动态住宅代理管理等功能。

**当前版本**: v1.0.0  
**最后更新**: 2025-11-07  
**项目状态**: 🔧 准备生产环境 - 清除模拟数据中

### 🎯 核心理解

**ProxyHub = 985Proxy的前端门户 + 订单管理系统**

- ✅ **数据真实性第一** - 所有数据必须来自985Proxy API或数据库
- ✅ **零模拟数据** - 生产环境绝不允许硬编码、假数据
- ✅ **数据一致性** - ProxyHub显示与985Proxy平台100%一致
- ✅ **性能优先** - API < 200ms, 页面 < 2s, 支持100+并发

### 🚨 当前重点任务

**P0 最高优先级 - 清除所有模拟数据**

正在执行：[docs/TASK-REMOVE-MOCK-DATA.md](docs/TASK-REMOVE-MOCK-DATA.md)

**问题**：用户购买IP后，ProxyHub显示的IP与985Proxy平台不一致  
**原因**：系统中存在硬编码和模拟数据  
**目标**：删除所有模拟数据，确保100%真实数据，可以给用户正常使用

**检查清单**：
- [ ] 后端Service层无mock数据
- [ ] 前端组件无硬编码IP
- [ ] 数据库无假记录
- [ ] 所有API从985Proxy获取数据
- [ ] 购买流程完整测试通过

详见：[docs/TASK-REMOVE-MOCK-DATA.md](docs/TASK-REMOVE-MOCK-DATA.md)

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 6.x (可选，用于订单队列)
- npm >= 9.x

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/lubei0612/proxyhub.git
cd proxyhub
```

2. **安装依赖**
```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp backend/.env.example backend/.env

# 编辑.env文件，配置数据库和985Proxy API密钥
```

4. **初始化数据库**
```bash
cd backend
npm run migration:run
npm run seed:run
```

5. **启动服务**
```bash
# 后端 (http://localhost:3000)
cd backend
npm run start:dev

# 前端 (http://localhost:8080)
cd frontend
npm run dev
```

---

## 📁 项目结构

```
proxyhub/
├── backend/                 # NestJS后端
│   ├── src/
│   │   ├── modules/         # 功能模块
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── user/        # 用户管理
│   │   │   ├── proxy/       # 代理管理
│   │   │   ├── proxy985/    # 985Proxy集成
│   │   │   ├── order/       # 订单管理
│   │   │   ├── billing/     # 账单管理
│   │   │   ├── pricing/     # 价格管理
│   │   │   ├── dashboard/   # 仪表盘
│   │   │   ├── admin/       # 管理后台
│   │   │   └── ...
│   │   ├── common/          # 通用组件
│   │   ├── config/          # 配置文件
│   │   └── database/        # 数据库迁移和种子
│   └── package.json
├── frontend/                # Vue 3前端
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── components/      # 通用组件
│   │   ├── api/             # API接口
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia状态管理
│   │   └── locales/         # 国际化
│   └── package.json
├── docs/                    # 项目文档
├── docs-archive/            # 历史文档归档
├── scripts/                 # 工具脚本
└── README.md
```

---

## 🔑 默认账户

### 管理员账户
- 邮箱: `admin@example.com`
- 密码: `Admin123456!`

### 测试用户账户
- 邮箱: `user@example.com`
- 密码: `User123456!`

---

## 📊 核心功能

### ✅ 已完成功能

#### 用户功能
- [x] 用户注册/登录/登出
- [x] JWT认证
- [x] 个人资料管理
- [x] 密码修改
- [x] API密钥生成

#### 代理管理
- [x] 静态住宅代理购买
- [x] 静态代理IP列表查看
- [x] IP续费功能
- [x] IP释放
- [x] 自动续费设置
- [x] 代理使用统计

#### 账单系统
- [x] 账户余额管理
- [x] 充值申请
- [x] 充值审核（管理员）
- [x] 交易记录查询
- [x] 账单明细导出

#### 订单系统
- [x] 订单创建
- [x] 订单状态跟踪
- [x] 订单历史查询
- [x] 订单取消

#### 管理后台
- [x] 用户管理
- [x] 订单管理
- [x] 充值审核
- [x] 系统统计
- [x] 事件日志
- [x] 价格覆盖管理

#### 985Proxy集成
- [x] 库存查询
- [x] 价格计算
- [x] 静态IP购买
- [x] IP续费
- [x] 我的IP列表查询
- [x] 订单状态查询

---

### 🚧 进行中的功能

根据spec-workflow任务列表：

#### P0 - 严重问题
- [ ] IP续费API完整测试（Task 1）
- [x] 管理后台路由修复（Task 2） - 部分完成
- [ ] 管理后台数据显示修复

#### P1 - 重要功能
- [ ] 订单状态轮询机制（Task 3）
- [ ] 价格显示一致性（Task 4）
- [ ] 实时价格集成985Proxy API

#### P2 - 优化项
- [ ] 代码优化和重构（Task 5）
- [ ] 性能优化
- [ ] Docker部署优化

---

## 🛠️ 技术栈

### 后端
- **框架**: NestJS 10.x
- **数据库**: PostgreSQL 14.x + TypeORM
- **认证**: JWT + Passport
- **缓存**: Redis (可选)
- **队列**: Bull (可选)
- **文档**: Swagger/OpenAPI

### 前端
- **框架**: Vue 3 + TypeScript
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP**: Axios
- **图表**: ECharts
- **国际化**: Vue I18n

---

## 🔧 开发指南

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint规则
- 使用Prettier格式化代码
- Git提交遵循Conventional Commits

### API开发流程
1. 定义DTO (Data Transfer Object)
2. 创建Service业务逻辑
3. 创建Controller路由
4. 添加Swagger文档
5. 编写单元测试

### 数据库迁移
```bash
# 生成新迁移
npm run migration:generate -- -n MigrationName

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

---

## 💻 开发习惯与规范

> **📌 重要**: 所有AI助手和开发者必须遵守以下规范

### 核心原则

1. **全局视角开发** ⭐
   - 开发前考虑：数据规模、并发场景、响应时间、资源消耗
   - 避免：N+1查询、嵌套循环、未分页的大数据查询

2. **性能指标** 🎯
   - API响应时间 < 200ms (P95)
   - 页面加载时间 < 2s
   - 数据库查询 < 100ms
   - 并发支持 ≥ 100 用户

3. **代码审查清单** ✅
   - [ ] 是否有N+1查询问题？
   - [ ] 是否有嵌套循环（O(n²)）？
   - [ ] 大数据量是否分页？
   - [ ] 是否添加了必要的索引？
   - [ ] 是否使用了缓存？
   - [ ] API调用是否并行？

### 最优算法示例

```typescript
// ❌ 差：N+1查询
async getUsersWithIPs() {
  const users = await this.userRepo.find();
  for (const user of users) {
    user.ips = await this.ipRepo.find({ userId: user.id }); // N次查询！
  }
}

// ✅ 优：JOIN查询
async getUsersWithIPs() {
  return this.userRepo.find({
    relations: ['staticProxies'], // 1次查询
    take: 20 // 分页
  });
}
```

### 禁止事项

- ❌ 硬编码数据
- ❌ 模拟/假数据在生产环境
- ❌ 未分页的大数据查询
- ❌ 未索引的数据库查询
- ❌ 循环中的API/数据库调用

**完整规范**: [docs/PROJECT-GUIDE.md](docs/PROJECT-GUIDE.md)

---

## 📖 文档索引

**📌 所有项目文档已整理到 `docs/` 目录**

### 核心文档
- 📖 [docs/README.md](docs/README.md) - 文档中心导航
- 🎯 [docs/PROJECT-GUIDE.md](docs/PROJECT-GUIDE.md) - **项目开发指南（必读）** ⭐
- 📋 [docs/TASK-REMOVE-MOCK-DATA.md](docs/TASK-REMOVE-MOCK-DATA.md) - 清除模拟数据任务
- 📊 [docs/reports/](docs/reports/) - 项目报告

### 技术文档
- [API文档](http://localhost:3000/api) - Swagger UI
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - 部署指南
- [docs/985Proxy 开放 API 文档.md](docs/985Proxy%20开放%20API%20文档.md) - 985Proxy API
- [docs/腾讯云部署指南.md](docs/腾讯云部署指南.md) - 腾讯云部署

---

## 🚀 下一步计划

### P0 - 最高优先级（进行中）

**清除所有硬编码和模拟数据** 🔥

**执行步骤**：
```bash
# 1. 备份数据库
cd /opt/proxyhub
docker exec proxyhub-postgres pg_dump -U postgres proxyhub > backup.sql

# 2. 搜索模拟数据
cd backend/src
grep -rn "mock\|fake\|dummy" --include="*.ts" | grep -v "node_modules"

# 3. 逐一清理代码

# 4. 清理数据库假数据
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub
# DELETE FROM static_proxies WHERE ip LIKE '123.%' OR ip LIKE '192.168.%';

# 5. 重新部署测试
docker compose -f docker-compose.cn.yml down
docker compose -f docker-compose.cn.yml build --no-cache
docker compose -f docker-compose.cn.yml up -d

# 6. 验证数据一致性
# 购买测试 → 对比985Proxy → 确认100%一致
```

**完成标准**：
- ✅ ProxyHub显示的IP与985Proxy平台完全一致
- ✅ 购买流程正常，985Proxy账户正确扣费
- ✅ 所有价格、国家、到期时间准确无误
- ✅ 可以给用户正常使用

**详细任务**: [docs/TASK-REMOVE-MOCK-DATA.md](docs/TASK-REMOVE-MOCK-DATA.md)

---

### P1 - 本周完成

1. **性能优化审查**
   - 添加数据库索引
   - 优化N+1查询
   - 实现API缓存

2. **登录问题排查**
   - 用户存在但显示"账号不存在"
   - 检查前端API路径
   - 验证密码哈希

3. **流量统计对接**
   - 集成985Proxy API
   - 实现实时数据

---

## 🐛 已知问题

### ✅ 已修复
1. ~~管理后台API返回500错误~~ - ✅ 已修复 (2025-11-06)
2. ~~静态IP列表字段缺失~~ - ✅ 已修复 (2025-11-06)
3. ~~前端白屏问题~~ - ✅ 已修复 (2025-11-07)
4. ~~Docker环境变量加载问题~~ - ✅ 已修复 (2025-11-07)
5. ~~邮件发送失败~~ - ✅ 已修复，切换到Gmail (2025-11-07)

### 🔥 进行中
6. **IP数据不一致** - 🚧 清除模拟数据中 (P0)
7. **登录显示账号不存在** - 🔍 排查中 (P1)

### 📋 待处理
8. 流量统计需要集成985Proxy API
9. 订单状态轮询机制优化
10. 事件日志筛选功能

---

## 📝 更新日志

### [v1.0.1] - 2025-11-07 🔥

#### 重构
- **项目文件结构整理** - 删除所有.bat文件，文档集中到docs/
- **开发规范完善** - 添加性能优化和算法选择指南

#### 修复
- 修复前端白屏问题（Vite打包配置）
- 修复Docker环境变量加载问题
- 修复邮件发送失败（切换到Gmail）

#### 进行中
- 🚧 清除所有硬编码和模拟数据（P0任务）
- 🔍 排查登录显示"账号不存在"问题

### [v1.0.0] - 2025-11-06

#### 新增
- 完整的用户认证和授权系统
- 静态住宅代理购买和管理
- 985Proxy API完整集成
- 管理后台功能
- 账单和订单系统

#### 修复
- 修复管理后台统计API错误
- 修复静态IP列表数据字段缺失
- 修复前端ECharts PieChart导入错误
- 修复auto_renew字段名错误

---

## 🤝 贡献指南

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📄 许可证

本项目采用MIT许可证 - 详见[LICENSE](LICENSE)文件

---

## 💬 联系方式

- GitHub: [https://github.com/lubei0612/proxyhub](https://github.com/lubei0612/proxyhub)
- Issues: [https://github.com/lubei0612/proxyhub/issues](https://github.com/lubei0612/proxyhub/issues)

---

## 🙏 致谢

- [NestJS](https://nestjs.com/) - 强大的Node.js框架
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3 UI组件库
- [985Proxy](https://www.985proxy.com/) - 代理服务提供商

---

## 🎉 里程碑

- ✅ 2025-11-06: 核心功能开发完成
- ✅ 2025-11-07: 项目结构整理，开发规范完善
- 🔥 2025-11-07: **清除模拟数据（进行中）** - 准备生产环境
- 📅 目标: 生产环境上线，可供用户正常使用

---

**最后更新**: 2025-11-07  
**项目状态**: 🔧 准备生产环境 - 清除模拟数据中  
**下一步**: 完成模拟数据清理 → 生产环境测试 → 正式上线

