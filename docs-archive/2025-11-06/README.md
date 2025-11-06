# ProxyHub - 代理IP管理平台

<div align="center">

![ProxyHub](https://img.shields.io/badge/ProxyHub-v1.0.0-blue)
![Vue3](https://img.shields.io/badge/Vue-3.x-green)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-ready-blue)

一个功能完整的代理IP管理平台，支持静态住宅代理、动态住宅代理、移动代理的选购和管理。

</div>

---

## ✨ 功能特性

### 用户端功能
- 🔐 **用户认证** - 注册、登录、JWT身份验证
- 📊 **数据仪表盘** - 实时统计代理使用情况、订单、消费数据
- 🏠 **静态住宅代理** - 选购和管理静态IP，支持多国家/城市
- ⚡ **动态住宅代理** - 动态IP选购和管理（开发中）
- 📱 **移动代理** - 移动IP管理（计划中）
- 💰 **钱包充值** - 多种支付方式，管理员审核
- 📝 **订单管理** - 查看所有购买订单和状态
- 💳 **交易记录** - 详细的账户交易明细
- 👤 **账户中心** - 个人信息、密码修改、API密钥管理

### 管理后台功能
- 👥 **用户管理** - 查看所有用户，管理状态和角色
- 💵 **充值审核** - 审批用户充值申请
- 📦 **订单管理** - 查看所有订单
- 📈 **系统统计** - 平台运营数据概览
- ⚙️ **系统设置** - 配置系统参数

---

## 🚀 快速开始

### 前置要求
- Node.js >= 18.0
- PostgreSQL >= 15
- Docker & Docker Compose
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd proxyhub
```

2. **安装依赖**
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp docs/ENV_TEMPLATE.txt backend/.env

# 编辑.env文件，配置数据库连接等信息
```

4. **启动数据库**
```bash
# 返回项目根目录
cd ..

# 启动PostgreSQL
docker-compose up -d postgres
```

5. **运行数据库迁移和种子数据**
```bash
cd backend
npm run migration:run
npm run seed
```

6. **启动服务**

**方法1：一键启动（推荐）**
```bash
.\启动ProxyHub.bat
```

**方法2：手动启动**
```bash
# 终端1：启动后端
cd backend
npm run start:dev

# 终端2：启动前端
cd frontend
npm run dev
```

7. **访问应用**
- 前端：http://localhost:8080
- 后端API：http://localhost:3000
- API文档：http://localhost:3000/api

---

## 👤 测试账号

| 角色 | 邮箱 | 密码 | 初始余额 |
|------|------|------|---------|
| 管理员 | admin@example.com | admin123 | $10,000.00 |
| 普通用户 | user@example.com | password123 | $1,000.00 |

---

## 📁 项目结构

```
proxyhub/
├── backend/                 # NestJS后端
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── user/       # 用户模块
│   │   │   ├── proxy/      # 代理模块
│   │   │   ├── billing/    # 账单模块
│   │   │   ├── order/      # 订单模块
│   │   │   ├── admin/      # 管理模块
│   │   │   └── dashboard/  # 仪表盘模块
│   │   ├── common/         # 公共模块（guards, decorators）
│   │   ├── config/         # 配置文件
│   │   └── database/       # 数据库相关（migrations, seeds）
│   └── package.json
│
├── frontend/               # Vue3前端
│   ├── src/
│   │   ├── api/           # API请求封装
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # 公共组件
│   │   ├── layouts/       # 布局组件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # Pinia状态管理
│   │   ├── views/         # 页面组件
│   │   └── utils/         # 工具函数
│   └── package.json
│
├── docs/                   # 项目文档
│   ├── requirements.md     # 需求文档
│   ├── design.md          # 设计文档
│   ├── tasks.md           # 任务清单
│   └── CODE-REFERENCE/    # 代码参考
│
├── docker-compose.yml     # Docker编排配置
├── 启动ProxyHub.bat       # Windows一键启动脚本
├── 停止ProxyHub.bat       # Windows停止服务脚本
├── ACCEPTANCE_TEST.md     # 验收测试方案
└── README.md              # 项目说明
```

---

## 🛠️ 技术栈

### 后端
- **框架**: NestJS 10.x
- **语言**: TypeScript
- **数据库**: PostgreSQL 15
- **ORM**: TypeORM
- **认证**: JWT + Passport.js
- **验证**: class-validator
- **API文档**: Swagger
- **限流**: @nestjs/throttler

### 前端
- **框架**: Vue 3
- **语言**: TypeScript
- **构建工具**: Vite
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **图表**: ECharts

### DevOps
- **容器化**: Docker & Docker Compose
- **数据库**: PostgreSQL
- **反向代理**: Nginx（生产环境）

---

## 📚 API文档

启动后端服务后，访问 http://localhost:3000/api 查看完整的Swagger API文档。

主要API端点：

### 认证相关
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/admin-login` - 管理员登录
- `POST /api/v1/auth/refresh` - 刷新token

### 用户相关
- `GET /api/v1/users/me` - 获取当前用户信息
- `GET /api/v1/users/profile` - 获取用户资料
- `PUT /api/v1/users/profile` - 更新用户资料
- `POST /api/v1/users/change-password` - 修改密码

### 代理相关
- `GET /api/v1/proxy/static/list` - 获取代理列表
- `POST /api/v1/proxy/static/purchase` - 购买静态代理
- `GET /api/v1/proxy/static/inventory` - 查看可用库存

### 账单相关
- `POST /api/v1/billing/recharge` - 提交充值
- `GET /api/v1/billing/recharges` - 获取充值记录
- `GET /api/v1/billing/transactions` - 获取交易记录

### 订单相关
- `GET /api/v1/orders` - 获取订单列表
- `GET /api/v1/orders/:id` - 获取订单详情

### 管理员相关
- `GET /api/v1/admin/users` - 获取所有用户
- `GET /api/v1/admin/statistics` - 获取系统统计
- `PUT /api/v1/billing/recharge/:id/approve` - 审批充值

---

## 🧪 测试

### 运行验收测试

完整的验收测试方案请参考 `ACCEPTANCE_TEST.md` 文档。

**快速测试流程**：
1. 启动所有服务
2. 访问 http://localhost:8080
3. 使用测试账号登录
4. 按照验收文档逐项测试功能

### 使用Chrome DevTools调试

1. 打开浏览器开发者工具（F12）
2. 切换到Network标签
3. 执行操作（如登录、购买）
4. 查看API请求和响应
5. 检查Console是否有错误

详细调试指南见 `ACCEPTANCE_TEST.md`。

---

## 🐛 故障排查

### 常见问题

**问题1：端口被占用**
```bash
# 停止所有Node进程
.\停止ProxyHub.bat

# 或手动停止
taskkill /F /IM node.exe
```

**问题2：数据库连接失败**
```bash
# 检查Docker是否运行
docker ps

# 重启数据库
docker-compose restart postgres
```

**问题3：前端页面空白**
- 检查浏览器Console是否有错误
- 检查前端服务是否正常启动
- 清除浏览器缓存

**问题4：API返回401错误**
- Token可能过期，重新登录
- 检查请求头是否包含Authorization

---

## 📖 开发文档

详细开发文档位于 `docs/` 目录：

- `requirements.md` - 功能需求文档
- `design.md` - 系统设计文档
- `tasks.md` - 开发任务清单
- `IMPLEMENTATION_GUIDE.md` - 实现指南
- `CODE-REFERENCE/` - 代码参考示例
- `ENV_TEMPLATE.txt` - 环境变量模板

---

## 📋 开发规范与代码修改指南

### 代码修改注意事项

1. **使用全局视角和思维排查问题**
   - 不要只针对单个问题进行修改
   - 将问题以及文件有可能关联的文件和问题进行统一处理
   - 避免其余问题的产生

2. **梳理项目目录**
   - 开始修复代码前，先梳理项目目录
   - 确认现有文件的关系和功能
   - 不能出现功能重复和叠加的问题
   - 保持文件的代码简洁性和高效性

3. **排查关联文件**
   - 修改前先排查与问题有关的所有关联文件
   - 准确定位问题发生的原因以及有可能产生的多项问题
   - 之后再开始细致全面的修复代码

4. **遵循开发手册**
   - 修改代码期间遵循开发手册
   - 不要影响其余无关的代码和功能
   - 保持项目的完整性
   - 保持修改的部分与整体项目其它关联功能的一致性

5. **检查定义与导入**
   - 修改代码后需要检查文件以及关联代码中的定义与导入语句是否正确

6. **创建文件需审批**
   - 如果需要创建文件必须取得明确同意，并说明原因
   - 得到允许后才能新建文件

7. **完成后复查**
   - 完成后仔细复查一遍修改的代码是否还存在问题

8. **避免重复代码**
   - 修改代码前，先查看代码块的具体位置
   - 如果存在就不要新建方法或者文件
   - 不要出现与现有代码重复的代码

9. **复盘关联代码**
   - 修改代码后，必须要复盘所有关联的代码和文件
   - 查看是否存在功能重复、冗余的代码及导入语句
   - 清除相关的冗余代码

10. **使用相对路径**
    - 所有涉及到路径的问题必须全部使用相对路径

### 开发流程规范

#### 1. 全局思维与代码修改

- **全局视角**：在每次代码修改前，应从全局角度分析当前修改可能对系统其他部分产生的影响
- **影响评估**：评估该修改对前后端交互、数据流、状态管理、API接口等方面的影响
- **协调性**：确保每次修改都能与其他模块协调工作，避免"修复一个问题却引入另一个问题"

#### 2. 代码修改流程

**问题定位与排查**
- 明确问题：准确定位问题的根源，明确问题的具体表现和影响范围
- 排查步骤：通过日志、调试工具、单元测试等手段，逐步排查问题
- 问题分析：分析问题的根本原因，确保修改方案能够彻底解决问题

**修改方案设计**
- 最小化修改：设计最小化的修改方案，只修改必要的代码部分
- 可读性与可维护性：修改后的代码应保持高可读性和可维护性
- 兼容性：确保与现有功能兼容，避免引入新的兼容性问题

**测试与验证**
- 单元测试：修改代码后，确保相关的单元测试通过
- 集成测试：确保修改后的代码在集成环境中能够正常工作
- 回归测试：进行回归测试，确保没有引入新的问题或导致现有功能退化

#### 3. 代码修改的权限与范围

- **权限控制**：在没有得到明确允许的情况下，不应修改与当前问题无关的代码
- **代码保护**：确保在修改过程中，不会意外删除或覆盖现有的有效代码
- **备份机制**：每次修改前应备份相关代码，以便在出现问题时能够快速回滚

#### 4. 开发效率与代码质量

- **高效开发**：通过自动化工具、代码生成、模板化开发等手段提高开发效率
- **代码质量**：确保每次修改后的代码符合项目的代码质量标准，遵循最佳实践
- **文档更新**：修改代码后，确保相关文档（API文档、注释、README等）得到及时更新

#### 5. 前后端协作

- **API接口一致性**：修改后端代码时，确保API接口的输入输出格式与前端保持一致
- **数据流一致性**：确保前后端的数据流保持一致，避免因数据格式或状态管理不一致导致的问题
- **状态管理**：在Vue3 UI中，确保修改不会影响其他组件的状态，保持状态的一致性和可预测性

#### 6. 代码审查与反馈

- **代码审查**：每次修改后，应提供详细的代码审查报告，说明修改的内容、原因以及可能的影响
- **反馈机制**：提供反馈机制，允许在修改后提出意见或建议

#### 7. 持续集成与部署

- **CI/CD集成**：确保每次代码修改都能通过持续集成（CI）流程
- **自动化部署**：支持自动化部署流程，确保修改后的代码能够快速、安全地部署到生产环境

#### 8. 开发规范总结

- ✅ **全局思维**：始终以全局思维进行代码修改
- ✅ **最小化修改**：确保每次修改都是最小化的
- ✅ **高效与质量**：通过自动化工具和最佳实践提高开发效率，同时保持代码的高质量
- ✅ **保持一致性**：确保代码风格、API设计、错误处理等方面的一致性
- ✅ **完整性保护**：保持现有有效功能和代码的完整性

---

## 🔒 安全

- 所有密码使用 bcrypt 加密存储
- JWT token 有效期：15分钟（access）/ 7天（refresh）
- API请求需要JWT认证
- 管理员权限独立验证
- API限流：每60秒最多100次请求

---

## 🚧 已知限制

1. **动态代理模块**：UI已完成，业务逻辑待实现
2. **移动代理模块**：计划中，暂未开发
3. **985Proxy API**：暂时使用Mock数据，需集成真实API
4. **实时流量统计**：待实现
5. **Telegram通知**：待实现

---

## 📝 TODO

- [ ] 集成真实的985Proxy API
- [ ] 实现动态代理业务逻辑
- [ ] 添加移动代理模块
- [ ] 完善前端图表数据
- [ ] 添加Telegram通知
- [ ] 优化Docker生产环境
- [ ] 添加单元测试
- [ ] 添加E2E测试
- [ ] 部署到生产环境

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 许可证

MIT License

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交Issue
- 发送邮件

---

## 🙏 致谢

感谢所有开源项目的贡献者！

---

**项目状态**: 🟢 开发中

**最后更新**: 2025年11月2日

**版本**: v1.0.0
