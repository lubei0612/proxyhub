# 🌐 ProxyHub - 专业代理管理平台

<div align="center">

![ProxyHub Logo](https://via.placeholder.com/150x150?text=ProxyHub)

**一站式代理IP管理解决方案**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

[功能特性](#-功能特性) •
[快速开始](#-快速开始) •
[部署指南](#-部署指南) •
[文档](#-文档) •
[技术栈](#-技术栈)

</div>

---

## 📖 项目简介

**ProxyHub** 是一个功能完善的代理IP管理平台，支持静态住宅代理和动态住宅代理的购买、管理和续费。集成了用户管理、订单系统、充值审核、价格覆盖等企业级功能。

### 🎯 适用场景

- ✅ 代理IP销售平台
- ✅ 企业内部代理管理
- ✅ 代理服务分销系统
- ✅ 数据采集业务支撑

---

## ✨ 功能特性

### 🔐 安全特性
- **强密码策略** - 8+字符，包含大小写+数字，拒绝120+常见弱密码
- **JWT认证** - 双令牌机制，访问令牌2小时，刷新令牌7天
- **API速率限制** - 防暴力破解，登录5次/15分钟，注册10次/60分钟
- **全局异常处理** - 生产环境隐藏堆栈信息，统一错误响应
- **输入验证** - 所有DTO强制MaxLength，防止缓冲区溢出
- **安全响应头** - Helmet集成，X-Frame-Options、CSP、HSTS
- **环境感知CORS** - 生产环境严格域名控制

### 👥 用户管理
- 用户注册、登录、找回密码
- 邮箱验证码（支持主备邮箱）
- 用户角色管理（普通用户/管理员）
- 账户余额管理
- 充值记录和交易历史

### 🌐 代理管理
- **静态住宅代理** - 独享IP，支持续费
- **动态住宅代理** - 流量套餐，按需分配
- 多国家/城市选择
- IP白名单配置
- 实时状态监控

### 💰 交易系统
- 在线充值（支持多种支付方式）
- 充值审核流程
- 订单管理
- 交易记录
- 余额变动明细

### 🎛️ 管理后台
- 用户管理（增删改查、禁用启用）
- 订单管理（查看、审核、退款）
- 价格覆盖（为特定用户设置专属价格）
- 充值审核
- 费用管理（收入支出统计）
- 数据可视化仪表板

### 📊 统计分析
- 用户增长趋势
- 销售额统计
- 代理使用情况
- 充值数据分析

---

## 🚀 快速开始

### 前置要求

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Node.js** 20+ (本地开发)
- **PostgreSQL** 15+ (本地开发)
- **Redis** 7+ (本地开发)

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/YOUR_USERNAME/proxyhub.git
cd proxyhub

# 2. 配置环境变量
cp env.example .env
# 编辑 .env 文件，填入真实配置

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f

# 5. 访问应用
# 前端: http://localhost:8080
# 后端API: http://localhost:3000/api/v1
# API文档: http://localhost:3000/api
```

### 默认账号

**管理员账号：**
- 邮箱：`admin@proxyhub.com`
- 密码：`Admin123456`

⚠️ **首次登录后请立即修改密码！**

---

## 📦 部署指南

### Docker 部署（推荐）

#### 1. 快速部署到服务器

```bash
# 一键部署
bash <(curl -s https://raw.githubusercontent.com/YOUR_USERNAME/proxyhub/main/deploy-server.sh)
```

#### 2. 手动部署

```bash
# 克隆代码
git clone https://github.com/YOUR_USERNAME/proxyhub.git
cd proxyhub

# 配置环境
cp env.production.template .env
nano .env  # 填入真实配置

# 构建并启动
docker-compose build
docker-compose up -d
```

### 生产环境配置

**必须修改的配置项：**

```bash
# 数据库密码
DATABASE_PASSWORD=your_strong_password

# JWT密钥（至少32字符）
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")

# 985Proxy API
PROXY_985_API_KEY=your_api_key
PROXY_985_ZONE=your_zone_id

# 邮件服务
MAIL_USER=your_email@outlook.com
MAIL_PASSWORD=your_email_password

# 域名和CORS
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

### SSL 证书配置

```bash
# 安装 Certbot
sudo apt install certbot nginx -y

# 配置 Nginx
sudo nano /etc/nginx/sites-available/proxyhub

# 获取证书
sudo certbot --nginx -d yourdomain.com
```

详细部署指南：[DEPLOY-TO-SERVER.md](DEPLOY-TO-SERVER.md)

---

## 📚 文档

- [部署指南](DEPLOY-TO-SERVER.md) - 完整的服务器部署教程
- [安全加固完成报告](docs/SECURITY-HARDENING-COMPLETED.md) - 安全特性详解
- [环境变量说明](docs/ENVIRONMENT_VARIABLES.md) - 所有配置项说明
- [迁移指南](docs/SECURITY_MIGRATION_GUIDE.md) - 版本升级指南
- [API文档](http://localhost:3000/api) - Swagger API文档

---

## 🛠️ 技术栈

### 后端
- **框架**: NestJS 10.x
- **语言**: TypeScript 5.x
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **ORM**: TypeORM
- **认证**: JWT + Passport
- **验证**: Class-Validator
- **安全**: Helmet, Joi, Bcrypt
- **API文档**: Swagger

### 前端
- **框架**: Vue 3 + Vite
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **图表**: Apache ECharts
- **样式**: SCSS
- **国际化**: Vue I18n

### DevOps
- **容器化**: Docker + Docker Compose
- **Web服务器**: Nginx
- **CI/CD**: GitHub Actions (可选)
- **监控**: Docker Stats

---

## 📊 项目结构

```
proxyhub/
├── backend/                 # 后端代码
│   ├── src/
│   │   ├── common/         # 公共模块（过滤器、守卫、拦截器）
│   │   ├── config/         # 配置文件
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── user/       # 用户模块
│   │   │   ├── proxy/      # 代理模块
│   │   │   ├── billing/    # 账单模块
│   │   │   ├── order/      # 订单模块
│   │   │   └── admin/      # 管理员模块
│   │   └── main.ts         # 应用入口
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── api/           # API调用
│   │   ├── components/    # 组件
│   │   ├── views/         # 页面
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # 状态管理
│   │   └── utils/         # 工具函数
│   ├── Dockerfile
│   └── package.json
│
├── docs/                   # 文档
├── docker-compose.yml      # Docker编排
├── deploy-server.sh        # 部署脚本
└── README.md              # 项目说明
```

---

## 🔧 开发指南

### 本地开发环境

```bash
# 后端
cd backend
npm install
npm run start:dev

# 前端
cd frontend
npm install
npm run dev
```

### 代码规范

- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Commit规范** - Conventional Commits

### 测试

```bash
# 后端单元测试
cd backend
npm run test

# 后端E2E测试
npm run test:e2e

# 前端测试
cd frontend
npm run test
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 更新日志

### v1.0.0 (2025-11-11)

#### 新功能
- ✅ 完整的用户认证和授权系统
- ✅ 静态/动态代理购买和管理
- ✅ 订单和交易系统
- ✅ 管理后台
- ✅ 价格覆盖功能
- ✅ 充值审核流程

#### 安全加固
- ✅ 强密码策略（8+字符，大小写+数字）
- ✅ API速率限制（防暴力破解）
- ✅ JWT令牌强制32+字符
- ✅ 环境变量验证（启动时检查）
- ✅ 全局异常处理（敏感信息过滤）
- ✅ 安全响应头（Helmet）
- ✅ 环境感知CORS

#### 文档
- ✅ 完整部署指南
- ✅ 安全加固文档
- ✅ 环境变量说明
- ✅ API文档（Swagger）

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

---

## 💬 联系方式

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/proxyhub/issues)
- **Email**: support@proxyhub.com
- **文档**: [GitHub Wiki](https://github.com/YOUR_USERNAME/proxyhub/wiki)

---

## 🙏 致谢

感谢以下开源项目：

- [NestJS](https://nestjs.com/) - 渐进式 Node.js 框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 UI 组件库
- [TypeORM](https://typeorm.io/) - ORM 框架
- [PostgreSQL](https://www.postgresql.org/) - 关系型数据库
- [Redis](https://redis.io/) - 内存数据库
- [Docker](https://www.docker.com/) - 容器化平台

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给个Star！⭐**

Made with ❤️ by ProxyHub Team

</div>
