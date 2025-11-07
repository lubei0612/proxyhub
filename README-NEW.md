# ProxyHub - 智能代理管理平台

> 全功能的代理IP管理平台，集成985Proxy服务

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D14.0-blue.svg)](https://www.postgresql.org)

---

## 📋 功能特性

### 核心功能
- ✅ 用户认证与权限管理
- ✅ 静态住宅代理购买与管理
- ✅ 动态住宅代理通道管理
- ✅ 985Proxy API 完整集成
- ✅ 账单与充值系统
- ✅ 订单管理与追踪
- ✅ 流量统计与分析
- ✅ 管理后台

### 技术栈
- **后端**: NestJS + TypeORM + PostgreSQL
- **前端**: Vue 3 + TypeScript + Element Plus
- **部署**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (可选)

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 6.x (可选)
- Docker & Docker Compose (生产环境)

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/lubei0612/proxyhub.git
cd proxyhub

# 2. 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 3. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 填写数据库和985Proxy配置

# 4. 初始化数据库
cd backend
npm run migration:run

# 5. 启动开发服务
# 终端1 - 后端
cd backend && npm run start:dev

# 终端2 - 前端
cd frontend && npm run dev
```

访问：http://localhost:8080

### 生产部署

详细部署文档请查看：
- [腾讯云部署指南](docs-organized/deployment/腾讯云-最终部署指南.md)
- [Docker部署快速开始](docs-organized/deployment/DEPLOY-WITH-ENV-TEMPLATE.md)

**快速部署命令**：

```bash
# 使用Docker Compose
docker compose -f docker-compose.cn.yml up -d

# 查看服务状态
docker compose -f docker-compose.cn.yml ps

# 查看日志
docker compose -f docker-compose.cn.yml logs -f
```

---

## 📁 项目结构

```
proxyhub/
├── backend/                    # NestJS 后端
│   ├── src/
│   │   ├── modules/           # 功能模块
│   │   ├── common/            # 公共组件
│   │   ├── config/            # 配置文件
│   │   └── database/          # 数据库相关
│   ├── Dockerfile.cn          # 国内镜像构建
│   └── env.production.template # 生产环境配置模板
├── frontend/                   # Vue3 前端
│   ├── src/
│   │   ├── views/             # 页面组件
│   │   ├── components/        # 通用组件
│   │   ├── api/               # API接口
│   │   └── stores/            # 状态管理
│   └── Dockerfile.cn          # 国内镜像构建
├── docs/                       # 原始文档
├── docs-organized/             # 整理后的文档
│   ├── deployment/            # 部署文档
│   ├── development/           # 开发文档
│   ├── troubleshooting/       # 问题排查
│   └── archive/               # 历史归档
├── deployment-scripts/         # 部署脚本
├── docker-compose.cn.yml      # Docker配置（国内）
├── docker-compose.yml         # Docker配置（国际）
└── README.md                  # 本文件
```

---

## 🔑 默认账户

### 管理员
- 邮箱：`admin@example.com`
- 密码：`admin123`
- 余额：$10,000

### 测试用户
- 邮箱：`alice@test.com`
- 密码：`password123`
- 余额：$500

⚠️ **生产环境请立即修改默认密码！**

---

## 🛠️ 开发指南

### 后端开发

```bash
cd backend

# 开发模式
npm run start:dev

# 生成迁移
npm run migration:generate -- -n MigrationName

# 运行迁移
npm run migration:run

# 生成密码hash
node scripts/generate-password-hash.js

# 运行测试
npm run test
```

### 前端开发

```bash
cd frontend

# 开发模式
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 📚 文档

- [部署指南](docs-organized/deployment/) - 各种环境的部署文档
- [开发文档](docs-organized/development/) - 开发相关说明
- [问题排查](docs-organized/troubleshooting/) - 常见问题解决
- [API文档](http://localhost:3000/api) - Swagger API文档（本地开发）

---

## 🐛 问题排查

### 常见问题

**1. 白屏问题**
- 查看：[白屏修复指南](docs-organized/troubleshooting/QUICK-FIX-WHITSCREEN.md)

**2. 环境变量未加载**
- 查看：[环境变量修复](docs-organized/troubleshooting/DOCKER-ENV-LOADING-FIX.md)

**3. 数据库连接失败**
```bash
# 检查数据库配置
docker compose logs postgres

# 重新初始化数据库
docker compose down -v
docker compose up -d
```

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

- [NestJS](https://nestjs.com/) - 强大的Node.js框架
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3 UI组件库
- [985Proxy](https://www.985proxy.com/) - 代理服务提供商

---

## 📞 联系方式

- GitHub: https://github.com/lubei0612/proxyhub
- Issues: https://github.com/lubei0612/proxyhub/issues

---

**最后更新**: 2025-11-06  
**项目状态**: ✅ 生产就绪

