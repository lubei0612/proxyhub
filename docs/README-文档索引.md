# ProxyHub 文档索引

## 📂 文档组织结构

```
proxyhub/
├── docs/                          # 项目文档目录
│   ├── README-文档索引.md          # 本文件
│   ├── reports/                   # 开发报告和状态文档
│   │   ├── *报告*.md
│   │   ├── *修复*.md
│   │   ├── *完成*.md
│   │   └── *状态*.txt
│   └── [其他文档]
│
├── docs-spec-workflow/            # Spec-Workflow工具文档
│   ├── README-新架构说明.md
│   ├── Spec-Workflow-使用指南.md
│   └── Spec-Workflow-快速说明.md
│
├── scripts/                       # 辅助脚本
│   ├── fix-*.ps1
│   ├── test-*.js
│   └── *.html
│
└── 根目录文档
    ├── README.md                  # 项目主文档
    ├── README-项目启动.md         # 启动指南
    ├── SPEC-WORKFLOW-快速开始.md  # Spec-Workflow快速指南
    ├── 快速开始指南.md            # 应用使用指南
    └── DOCKER_DEPLOYMENT_GUIDE.md # Docker部署指南
```

---

## 📖 按用途查找文档

### 🚀 快速开始
- **[README-项目启动.md](../README-项目启动.md)** - 项目启动指南
- **[快速开始指南.md](../快速开始指南.md)** - 应用使用指南
- **[SPEC-WORKFLOW-快速开始.md](../SPEC-WORKFLOW-快速开始.md)** - 开发工具使用

### 🛠️ 开发相关
- **[docs-spec-workflow/README-新架构说明.md](../docs-spec-workflow/README-新架构说明.md)** - Spec-Workflow新架构
- **[docs-spec-workflow/Spec-Workflow-使用指南.md](../docs-spec-workflow/Spec-Workflow-使用指南.md)** - 详细使用指南

### 🐳 部署相关
- **[DOCKER_DEPLOYMENT_GUIDE.md](../DOCKER_DEPLOYMENT_GUIDE.md)** - Docker部署指南
- **[ENV配置修复指南.md](../ENV配置修复指南.md)** - 环境配置指南
- **[重启服务指南.md](../重启服务指南.md)** - 服务重启指南

### 📊 项目报告
查看 `reports/` 目录下的所有报告文档

---

## 🔍 快速查找

### 我想...

**启动应用**
→ [README-项目启动.md](../README-项目启动.md)

**使用Spec-Workflow开发**
→ [SPEC-WORKFLOW-快速开始.md](../SPEC-WORKFLOW-快速开始.md)

**部署到服务器**
→ [DOCKER_DEPLOYMENT_GUIDE.md](../DOCKER_DEPLOYMENT_GUIDE.md)

**了解项目功能**
→ [README.md](../README.md)

**查看开发进度**
→ [reports/](./reports/)

**配置环境变量**
→ [ENV配置修复指南.md](../ENV配置修复指南.md)

---

## 📝 文档维护

### 添加新文档

根据文档类型放置到相应目录：

- **开发报告** → `docs/reports/`
- **Spec-Workflow相关** → `docs-spec-workflow/`
- **辅助脚本** → `scripts/`
- **主要文档** → 根目录

### 更新索引

修改新文档后，更新本文件的索引。





