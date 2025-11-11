# ProxyHub - 企业级代理IP管理平台

<div align="center">

![ProxyHub Logo](docs/assets/logo.png)

**功能强大 · 安全可靠 · 易于部署**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](package.json)

[快速开始](#-快速开始) · [功能特性](#-功能特性) · [技术栈](#-技术栈) · [文档](#-文档) · [部署](#-部署)

</div>

---

## 📖 简介

ProxyHub是一个企业级的代理IP管理和销售平台，集成985Proxy API，提供静态住宅IP和动态住宅IP的购买、管理、续费等完整功能。

### 为什么选择ProxyHub？

- **🔐 安全加固**: JWT认证、密码强度验证、API速率限制、全局异常处理
- **💾 自动备份**: 每日自动数据库备份，保留7天，一键恢复
- **🚀 一键部署**: 自动化部署脚本，5分钟完成生产环境部署
- **📊 完整功能**: 用户管理、订单系统、钱包充值、价格覆盖、数据统计
- **🎨 现代UI**: 基于Vue 3 + Element Plus，响应式设计，支持多语言

---

## ✨ 功能特性

### 核心功能
- ✅ **用户系统**: 注册登录、邮箱验证、密码强度验证、角色权限管理
- ✅ **代理管理**: 静态IP购买/续费/管理、动态IP通道管理
- ✅ **订单系统**: 订单创建、支付、状态跟踪、异常处理
- ✅ **钱包系统**: 余额充值、充值审核、交易明细、扣款退款
- ✅ **价格系统**: 灵活定价、用户特定价格覆盖、批量购买折扣
- ✅ **管理后台**: 用户管理、订单管理、充值审核、数据统计
- ✅ **通知系统**: 邮件通知 (双邮箱备份)、Telegram通知 (可选)

### 安全特性
- 🔐 **认证安全**: JWT Token、密码bcrypt加密、Session管理
- 🛡️ **输入验证**: 强密码策略、邮箱格式验证、输入长度限制
- ⚡ **速率限制**: Redis分布式限流、登录/注册/验证码频率控制
- 🔍 **日志审计**: 敏感数据脱敏、异常日志记录、操作审计
- 🚫 **攻击防护**: SQL注入防护、XSS防护、CSRF防护、点击劫持防护

### 运维特性
- 🐳 **Docker化**: 完整Docker Compose配置，开箱即用
- 📦 **自动备份**: 数据库定时备份，7天保留策略
- 🔄 **CI/CD**: GitHub Actions自动部署，推送即上线
- 📊 **健康检查**: 容器健康监控，自动重启
- 📝 **日志管理**: 结构化日志，轮转策略

---

## 🚀 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ RAM
- 20GB+ 硬盘空间

### 一键部署（生产环境）

```bash
# SSH登录到服务器
ssh root@your-server-ip

# 执行一键部署脚本
bash <(curl -s https://raw.githubusercontent.com/lubei0612/proxyhub/master/scripts/deploy-production.sh)
```

**就这么简单！** 脚本会自动：
1. ✅ 检查环境
2. ✅ 克隆代码
3. ✅ 生成安全密钥
4. ✅ 配置自动备份
5. ✅ 启动服务
6. ✅ 创建管理员账号

部署完成后会输出访问地址和管理员账号密码。

### 本地开发环境

```bash
# 克隆项目
git clone https://github.com/lubei0612/proxyhub.git
cd proxyhub

# 复制环境变量
cp env.example .env
# 编辑.env填入必要配置

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问：
- 前端: http://localhost
- 后端API: http://localhost:3000/api/v1
- API文档: http://localhost:3000/api

---

## 🛠️ 技术栈

### 后端
- **框架**: NestJS 10.x (Node.js)
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **认证**: JWT + Passport
- **验证**: class-validator + Joi
- **安全**: Helmet, bcrypt, rate-limiting
- **文档**: Swagger/OpenAPI

### 前端
- **框架**: Vue 3 + TypeScript
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP**: Axios
- **构建**: Vite

### DevOps
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **反向代理**: Nginx
- **备份**: PostgreSQL pg_dump
- **监控**: Docker健康检查

---

## 📚 文档

### 部署文档
- [快速开始](docs/deployment/QUICK-START.md) - 5分钟快速部署
- [生产环境部署](docs/deployment/PRODUCTION-DEPLOYMENT.md) - 完整部署指南
- [安全配置指南](docs/deployment/SECURITY-GUIDE.md) - 安全最佳实践

### 开发文档
- [API文档](docs/api/) - 后端API接口文档
- [前端开发](docs/frontend/) - 前端开发指南
- [数据库设计](docs/database/) - 数据库表结构

### 运维文档
- [备份与恢复](docs/operations/BACKUP.md) - 数据备份策略
- [监控告警](docs/operations/MONITORING.md) - 系统监控配置
- [故障排除](docs/troubleshooting/) - 常见问题解决

---

## 🔐 安全配置

### 必填配置

编辑`.env`文件，填入以下必填项：

```env
# 985Proxy API配置
PROXY_985_API_KEY=your_api_key_here
PROXY_985_ZONE=your_zone_id_here

# 邮箱SMTP配置
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_email_app_password

# (可选) 备用邮箱
MAIL_USER_BACKUP=backup@gmail.com
MAIL_PASSWORD_BACKUP=backup_app_password
```

### 安全建议

- 🔑 使用强随机密码 (32+字符)
- 🔐 定期轮换密钥 (每季度)
- 🛡️ 配置防火墙和SSL证书
- 📊 启用自动备份 (每天凌晨2点)
- 👀 定期查看日志和监控

详见 [安全配置指南](docs/deployment/SECURITY-GUIDE.md)

---

## 📦 项目结构

```
proxyhub/
├── backend/                 # NestJS后端
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   ├── common/         # 公共模块 (security, guards, filters)
│   │   └── main.ts         # 入口文件
│   └── package.json
├── frontend/               # Vue前端
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── components/    # 通用组件
│   │   └── stores/        # Pinia状态管理
│   └── package.json
├── scripts/               # 运维脚本
│   ├── deploy-production.sh    # 生产环境部署
│   ├── db-backup.sh           # 数据库备份
│   └── restore-db.sh          # 数据库恢复
├── docs/                  # 文档
│   ├── deployment/        # 部署文档
│   ├── api/              # API文档
│   └── operations/        # 运维文档
├── .github/
│   └── workflows/        # GitHub Actions
├── docker-compose.yml    # Docker编排配置
└── README.md            # 本文件
```

---

## 🤝 贡献

欢迎贡献代码、报告Bug、提出新功能建议！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 📞 技术支持

- **GitHub Issues**: [提交问题](https://github.com/lubei0612/proxyhub/issues)
- **文档**: [在线文档](https://github.com/lubei0612/proxyhub/tree/master/docs)
- **邮件**: support@example.com

---

## 🙏 致谢

- [NestJS](https://nestjs.com/) - 强大的Node.js框架
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3 UI组件库
- [PostgreSQL](https://www.postgresql.org/) - 开源关系型数据库
- [Docker](https://www.docker.com/) - 容器化平台

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个Star！**

Made with ❤️ by ProxyHub Team

</div>
