# ProxyHub 项目结构说明

## 📁 根目录结构

```
proxyhub/
├── 📄 核心配置文件
│   ├── .env                          # 当前环境变量配置
│   ├── .env.example                  # 环境变量模板
│   ├── .env.backup                   # 环境变量备份
│   ├── env.production.template       # 生产环境模板
│   ├── docker-compose.yml            # Docker 开发环境配置
│   ├── docker-compose.prod.yml       # Docker 生产环境配置
│   ├── docker-compose.cn.yml         # Docker 中国镜像配置
│   ├── package.json                  # Node.js 项目配置
│   └── package-lock.json             # 依赖锁定文件
│
├── 📚 文档文件
│   ├── README.md                     # 项目主文档
│   ├── AGENTS.md                     # AI Agent 指令
│   └── PROJECT-STRUCTURE.md          # 项目结构说明（本文件）
│
├── 📂 主要目录
│   ├── backend/                      # 后端代码（NestJS）
│   ├── frontend/                     # 前端代码（Vue3）
│   ├── docs/                         # 详细文档
│   ├── scripts/                      # 部署和工具脚本
│   ├── openspec/                     # OpenSpec 规范
│   └── debug-scripts/                # 调试和测试脚本
│
└── 🔧 Git 配置
    ├── .git/                         # Git 仓库
    ├── .gitignore                    # Git 忽略文件
    ├── .gitattributes               # Git 属性
    ├── .github/                      # GitHub Actions
    └── .husky/                       # Git hooks
```

---

## 📚 docs/ 目录

**重要文档都在这里：**

```
docs/
├── 🐛 BUG-FIXES-SUMMARY.md           # Bug 修复总结
├── ✅ DEPLOYMENT-CHECKLIST.md         # 部署检查清单
├── 📊 FEATURE-VERIFICATION-REPORT.md # 功能验证报告
├── 🚀 SERVER-DEPLOYMENT.md           # 服务器部署指南
├── 🎉 ✅-生产环境部署就绪.md           # 生产环境就绪报告
├── 📝 🚀-服务器部署指令.txt           # 部署命令清单
└── ... (其他文档)
```

---

## 🔧 debug-scripts/ 目录

**所有调试和测试脚本：**

```
debug-scripts/
├── comprehensive-check.js              # 全面项目检查
├── optimized-feature-verification.js   # 优化的功能验证
├── full-feature-verification.js        # 完整功能验证
├── debug-failed-features.js            # 调试失败功能
├── debug-user-price-override.js        # 调试用户价格覆盖
├── test-user-price-save.js             # 测试用户价格保存
├── full-login-debug.js                 # 完整登录调试
└── ... (其他调试脚本)
```

---

## 🎯 快速导航

### 新手入门
1. 阅读 `README.md` - 项目概述
2. 查看 `docs/DEPLOYMENT-CHECKLIST.md` - 部署指南
3. 复制 `.env.example` 为 `.env` 并配置

### 部署上线
1. `docs/DEPLOYMENT-CHECKLIST.md` - 完整部署清单
2. `docs/SERVER-DEPLOYMENT.md` - 服务器部署步骤
3. `docs/BUG-FIXES-SUMMARY.md` - 已修复的问题

### 功能验证
1. `docs/FEATURE-VERIFICATION-REPORT.md` - 完整验证报告
2. `debug-scripts/optimized-feature-verification.js` - 运行自动化测试

---

## 📋 重要文件说明

### 环境配置
- **`.env`** - 当前使用的环境变量（不要提交到 Git）
- **`.env.example`** - 环境变量模板，包含所有配置说明
- **`env.production.template`** - 生产环境配置模板

### Docker 配置
- **`docker-compose.yml`** - 开发环境（默认）
- **`docker-compose.prod.yml`** - 生产环境
- **`docker-compose.cn.yml`** - 中国镜像源

---

## 🚀 常用命令

### 开发环境
```bash
# 启动开发环境
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境
```bash
# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d --build

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

### 运行测试
```bash
# 运行完整功能验证
cd debug-scripts
npx node optimized-feature-verification.js
```

---

## 📝 更新日期

**最后整理：** 2025-11-15  
**整理说明：** 
- 所有调试脚本移至 `debug-scripts/` 目录
- 所有文档移至 `docs/` 目录
- 统一环境变量文件命名为 `.env.example`
- 保持根目录简洁清晰

---

## 🔗 相关链接

- [项目 README](./README.md)
- [部署检查清单](./docs/DEPLOYMENT-CHECKLIST.md)
- [功能验证报告](./docs/FEATURE-VERIFICATION-REPORT.md)
- [Bug 修复总结](./docs/BUG-FIXES-SUMMARY.md)
