# 📖 ProxyHub 项目导航

> 项目文件已整理完成，所有文档和脚本都已分类存放

---

## 🚀 快速开始

### 1. 启动ProxyHub应用
```bash
# 注意：启动脚本在docs-archive或其他位置
# 如需启动应用，请查看 docs/ 目录
```

### 2. 启动Spec-Workflow开发工具
```bash
.\启动完整服务.bat
```
然后访问: **http://localhost:5678**

详细说明: [🚀-开始使用-README.md](🚀-开始使用-README.md)

---

## 📂 当前目录结构（已整理）

```
proxyhub/                                    # 项目根目录
│
├── 🏗️ 应用代码
│   ├── backend/                            # NestJS后端
│   └── frontend/                           # Vue3前端
│
├── 📚 文档目录
│   ├── docs/                               # 项目文档
│   │   ├── reports/                        # 开发报告归档
│   │   ├── spec-workflow/                  # Spec-Workflow规格文档
│   │   └── README-文档索引.md              # 文档索引和导航
│   ├── docs-spec-workflow/                 # Spec-Workflow工具文档
│   └── docs-archive/                       # 历史文档归档（2025-11-06）
│
├── 🛠️ 脚本目录
│   └── scripts/                            # 辅助脚本（PowerShell、测试等）
│
├── 🚀 启动脚本（根目录）
│   ├── 启动完整服务.bat                     # ⭐ Spec-Workflow（Dashboard + MCP Server）
│   ├── 启动Spec-Dashboard.bat             # 单独启动Dashboard
│   └── 启动Spec-MCP-Server.bat            # 单独启动MCP Server
│
└── 📄 快速文档（根目录）
    ├── 📖-README-导航.md                   # 本文件 - 总导航
    ├── 🚀-开始使用-README.md               # 快速开始指南
    ├── ✅-整理完成总结.md                   # 文件整理总结
    ├── 项目文件整理完成.md                  # 整理详情
    ├── README.md                          # 项目主文档
    ├── docker-compose.yml                 # Docker配置
    └── package.json                       # 项目依赖
```

---

## 📋 文档快速索引

### 🎯 我想...

| 需求 | 文档 |
|------|------|
| **快速上手Spec-Workflow** | [🚀-开始使用-README.md](🚀-开始使用-README.md) |
| **了解新架构** | [docs-spec-workflow/README-新架构说明.md](docs-spec-workflow/README-新架构说明.md) |
| **查看整理情况** | [✅-整理完成总结.md](✅-整理完成总结.md) |
| **浏览所有文档** | [docs/README-文档索引.md](docs/README-文档索引.md) |
| **查看开发报告** | `docs/reports/` 目录 |
| **查看历史文档** | `docs-archive/2025-11-06/` 目录 |
| **查找辅助脚本** | `scripts/` 目录 |

---

## 🌐 Spec-Workflow 服务状态

### Dashboard
- ✅ **运行中**
- 🌐 **地址**: http://localhost:5678
- 📌 **端口**: 5678
- 🔧 **进程ID**: 17104

### MCP Server
- 🔄 **状态**: 可通过启动脚本启动
- 📁 **项目**: proxyhub

---

## 🎨 使用流程图

```
┌─────────────────────────────────────┐
│  1. 启动 Spec-Workflow 服务          │
│     双击: 启动完整服务.bat            │
└───────────────┬─────────────────────┘
                │
                ├─→ Dashboard (5678端口)
                └─→ MCP Server (连接Cursor)
                
┌─────────────────────────────────────┐
│  2. 打开Dashboard                   │
│     浏览器: http://localhost:5678   │
└───────────────┬─────────────────────┘
                │
                └─→ 查看项目列表 (proxyhub)
                
┌─────────────────────────────────────┐
│  3. 在Cursor中创建规格               │
│     "创建XXX功能的规格"               │
└───────────────┬─────────────────────┘
                │
                ├─→ AI生成requirements.md
                ├─→ Dashboard显示审批请求
                └─→ 你在Dashboard中审批
                
┌─────────────────────────────────────┐
│  4. 重复审批流程                     │
│     Requirements → Design → Tasks  │
└───────────────┬─────────────────────┘
                │
                └─→ AI自动实现任务
```

---

## 🔧 常用操作

### 启动服务
```bash
# 完整启动（推荐）
.\启动完整服务.bat

# 或分别启动
.\启动Spec-Dashboard.bat      # 终端1
.\启动Spec-MCP-Server.bat     # 终端2
```

### 查看服务状态
```powershell
# 检查端口
netstat -ano | findstr ":5678"

# 查看进程
Get-Process | Where-Object {$_.ProcessName -eq "node"}
```

### 重启服务
```bash
# 停止所有Node进程（或关闭终端窗口）
# 然后重新运行启动脚本
.\启动完整服务.bat
```

---

## 📚 详细文档

### Spec-Workflow文档
- [README-新架构说明.md](docs-spec-workflow/README-新架构说明.md) - 架构变更详解
- [Spec-Workflow-使用指南.md](docs-spec-workflow/Spec-Workflow-使用指南.md) - 完整使用指南
- [Spec-Workflow-快速说明.md](docs-spec-workflow/Spec-Workflow-快速说明.md) - 功能说明

### 项目文档
- [docs/README-文档索引.md](docs/README-文档索引.md) - 所有文档索引
- `docs/reports/` - 开发报告和状态文档
- `docs-archive/2025-11-06/` - 历史文档归档

### 配置文档
- `.spec-workflow/config.toml` - Spec-Workflow配置
- `docker-compose.yml` - Docker配置

---

## ✅ 整理成果

### 文件分类
- ✅ **应用代码**: backend/ + frontend/
- ✅ **文档**: docs/ + docs-spec-workflow/ + docs-archive/
- ✅ **脚本**: scripts/
- ✅ **配置**: .spec-workflow/

### 启动脚本
- ✅ **Spec-Workflow**: 3个新脚本（适配v2.0架构）
- ✅ **根目录整洁**: 只保留必要文件

### 服务状态
- ✅ **Dashboard**: 运行在5678端口
- ✅ **MCP Server**: 可随时启动
- ✅ **端口配置**: 已改为5678（避免冲突）

---

## 💡 提示

1. **保持Dashboard运行** - 在整个开发会话期间
2. **查看实现日志** - Dashboard中可搜索已有API、组件、函数
3. **及时审批** - 不要让AI等待
4. **查看报告** - `docs/reports/` 了解项目历史

---

## 🎉 一切就绪！

**立即开始**: 打开 [🚀-开始使用-README.md](🚀-开始使用-README.md)

**Dashboard**: http://localhost:5678

**问题反馈**: 在Cursor中直接询问





