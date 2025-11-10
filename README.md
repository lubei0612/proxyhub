# ProxyHub 🌐

> 专业的代理IP管理平台 - 集成985Proxy，提供静态/动态住宅IP服务

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%3E%3D5.0.0-blue.svg)](https://www.typescriptlang.org/)

## ✨ 特性

- 🎨 **全新UI设计** - 左右分栏登录页面 + 呼吸效果Logo
- 🌍 **静态住宅IP** - 支持190+国家，实时库存查询
- ⚡ **动态住宅IP** - 高速通道，按流量计费
- 💰 **价格覆盖系统** - 灵活的全局/用户级定价
- 🔧 **管理后台** - 用户管理、订单管理、充值审核
- 🔒 **安全认证** - JWT + Refresh Token + 邮箱验证
- 📊 **数据可视化** - ECharts图表展示
- 🐳 **Docker部署** - 一键启动所有服务

## 🚀 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB RAM

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/yourusername/proxyhub.git
cd proxyhub
```

2. **配置环境变量**

```bash
cp env.template .env
# 编辑 .env 文件，配置985Proxy API密钥
```

3. **启动服务**

```bash
docker compose up -d
```

4. **访问应用**

- 前端: http://localhost
- 后端API: http://localhost:3000
- 管理后台: http://localhost/admin/dashboard

### 默认账号

```
邮箱: admin@proxyhub.com
密码: admin123
```

> ⚠️ **重要**: 首次登录后请立即修改密码！

## 📸 截图

### 登录页面
![登录页面](docs/images/login-page.png)

### 管理仪表盘
![管理仪表盘](docs/images/admin-dashboard.png)

### 静态IP管理
![静态IP管理](docs/images/static-proxy.png)

## 📚 文档

- [📖 部署指南](docs/DEPLOYMENT-GUIDE.md)
- [🎯 功能说明](docs/FEATURES.md)
- [🔧 API文档](docs/api/)
- [❓ 常见问题](docs/FAQ.md)

## 🏗️ 技术栈

### 前端
- Vue 3 + TypeScript
- Element Plus UI
- Vite
- Vue Router + Pinia
- ECharts

### 后端
- NestJS + TypeScript
- PostgreSQL
- Redis
- TypeORM
- JWT Authentication

### 部署
- Docker + Docker Compose
- Nginx

## 📁 项目结构

```
proxyhub/
├── backend/              # NestJS后端
│   ├── src/
│   │   ├── modules/     # 功能模块
│   │   ├── common/      # 公共模块
│   │   └── database/    # 数据库配置
│   └── Dockerfile
├── frontend/            # Vue 3前端
│   ├── src/
│   │   ├── views/       # 页面组件
│   │   ├── components/  # 公共组件
│   │   ├── api/         # API接口
│   │   └── stores/      # 状态管理
│   └── Dockerfile
├── docs/                # 项目文档
├── docker-compose.yml   # Docker编排
└── .env.template        # 环境变量模板
```

## 🔧 开发

### 本地开发

**后端:**
```bash
cd backend
npm install
npm run start:dev
```

**前端:**
```bash
cd frontend
npm install
npm run dev
```

### 构建生产版本

```bash
# 构建后端
cd backend
npm run build

# 构建前端
cd frontend
npm run build
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交Pull Request

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新详情。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [985Proxy](https://985proxy.com/) - 提供代理IP服务
- [Element Plus](https://element-plus.org/) - UI组件库
- [NestJS](https://nestjs.com/) - 后端框架
- [Vue.js](https://vuejs.org/) - 前端框架

## 📞 联系我们

- 提交Issue: [GitHub Issues](https://github.com/yourusername/proxyhub/issues)
- 邮箱: support@proxyhub.com
- 官网: https://proxyhub.com

---

⭐ 如果这个项目对你有帮助，请给我们一个Star！
