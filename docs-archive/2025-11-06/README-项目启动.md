# ProxyHub 项目启动指南

## 🚀 快速启动

### 启动ProxyHub应用

**双击运行**: `启动ProxyHub-最终版.bat`

这会启动：
- ✅ 后端服务（NestJS）
- ✅ 前端服务（Vue3 + Vite）
- ✅ 数据库（PostgreSQL via Docker）

---

### 启动Spec-Workflow（开发工具）

**双击运行**: `启动完整服务.bat`

然后访问: **http://localhost:5678**

详细说明: [SPEC-WORKFLOW-快速开始.md](SPEC-WORKFLOW-快速开始.md)

---

## 📁 项目结构

```
proxyhub/
├── backend/                      # NestJS后端
├── frontend/                     # Vue3前端
├── docs/                         # 项目文档
│   └── reports/                  # 各种报告和状态文档
├── scripts/                      # 辅助脚本
├── docs-spec-workflow/           # Spec-Workflow文档
│
├── 启动ProxyHub-最终版.bat        # ⭐ 启动应用
├── 启动完整服务.bat               # ⭐ 启动Spec-Workflow
├── README.md                     # 项目主文档
└── SPEC-WORKFLOW-快速开始.md     # Spec-Workflow快速指南
```

---

## 📚 文档导航

### 项目文档
- `README.md` - 项目主文档
- `快速开始指南.md` - 应用使用指南
- `docs/reports/` - 各种开发报告和状态文档

### 开发文档
- `SPEC-WORKFLOW-快速开始.md` - Spec-Workflow工具使用
- `docs-spec-workflow/` - Spec-Workflow详细文档

### 部署文档
- `DOCKER_DEPLOYMENT_GUIDE.md` - Docker部署指南
- `ENV配置修复指南.md` - 环境配置指南

---

## 🛠️ 常用脚本

| 脚本 | 用途 |
|------|------|
| `启动ProxyHub-最终版.bat` | 启动应用（前端+后端+数据库） |
| `启动完整服务.bat` | 启动Spec-Workflow开发工具 |
| `重启后端服务.bat` | 重启后端服务 |
| `测试IP续费功能.bat` | 测试IP续费功能 |

---

## 💡 提示

- 首次启动前确保Docker已安装并运行
- 确保`.env`文件配置正确
- 查看 `docs/reports/` 了解项目当前状态

