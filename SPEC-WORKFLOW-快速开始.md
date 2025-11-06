# 🚀 Spec-Workflow 快速开始

## 一键启动（推荐）

**双击运行**: `启动完整服务.bat`

然后打开浏览器: **http://localhost:5678**

---

## 📖 新架构说明

Spec-Workflow v2.0 采用**分离式架构**：

1. **Dashboard服务器** - 统一的Web界面（端口5678）
2. **MCP Server** - 连接Cursor的工具服务器

详细说明: `docs-spec-workflow/README-新架构说明.md`

---

## 🎯 工作流程

### 1. 启动服务
```bash
.\启动完整服务.bat
```

### 2. 在Cursor中创建规格
```
在Cursor对话框输入: "创建用户认证功能的规格"
```

### 3. 在Dashboard中审批
访问 http://localhost:5678，点击"审批"菜单

### 4. AI自动实现任务
AI会按照tasks.md逐个完成任务

---

## 📁 文件结构

```
proxyhub/
├── 启动完整服务.bat          # ⭐ 一键启动
├── 启动Spec-Dashboard.bat   # 单独启动Dashboard
├── 启动Spec-MCP-Server.bat  # 单独启动MCP Server
│
├── docs-spec-workflow/      # Spec-Workflow文档
│   ├── README-新架构说明.md
│   ├── Spec-Workflow-使用指南.md
│   └── Spec-Workflow-快速说明.md
│
└── .spec-workflow/          # 数据和配置
    ├── config.toml
    ├── specs/              # 规格文档存放处
    └── templates/          # 模板文件
```

---

## ⚠️ 常见问题

### Dashboard显示 "No Projects Available"
- **原因**: MCP Server未启动
- **解决**: 运行 `启动Spec-MCP-Server.bat`

### 连接被拒绝 (ERR_CONNECTION_REFUSED)
- **原因**: Dashboard服务器未运行
- **解决**: 运行 `启动Spec-Dashboard.bat`

### ⚠️ DEPRECATION WARNING
- **原因**: 使用了旧的 `--AutoStartDashboard` 参数
- **解决**: 使用新的启动脚本

---

## 📚 更多帮助

查看完整文档: `docs-spec-workflow/`

