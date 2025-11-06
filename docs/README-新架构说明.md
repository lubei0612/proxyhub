# Spec-Workflow 新架构说明

## 🔄 重要变更

从 **v2.0** 开始，Spec-Workflow 采用了**新的多项目架构**：

### ❌ 旧方式（已弃用）
```bash
# 不再支持
spec-workflow-mcp --AutoStartDashboard --port 5678
```

### ✅ 新方式（推荐）
```bash
# 方式1: 分别启动（手动控制）
spec-workflow-mcp --dashboard --port 5678    # 终端1：Dashboard服务器
spec-workflow-mcp /path/to/project            # 终端2：MCP Server

# 方式2: 使用启动脚本（自动化）
.\启动完整服务.bat                             # 一键启动两个服务
```

## 📊 架构对比

### 旧架构（单项目）
```
┌─────────────────────────────────┐
│  MCP Server + Dashboard (绑定)  │
│  - 一个项目一个Dashboard          │
│  - 不能复用Dashboard              │
└─────────────────────────────────┘
```

### 新架构（多项目）
```
┌──────────────────────────────────┐
│   统一Dashboard服务器 (5678)      │
│   - 管理所有项目                  │
│   - 只需启动一次                  │
└────────────┬─────────────────────┘
             │
     ┌───────┴────────┐
     │                │
┌────▼─────┐    ┌────▼─────┐
│ Project1 │    │ Project2 │
│MCP Server│    │MCP Server│
└──────────┘    └──────────┘
```

## 🚀 快速开始

### 步骤1: 启动统一Dashboard（只需一次）

**双击运行**: `启动Spec-Dashboard.bat`

或命令行：
```bash
spec-workflow-mcp --dashboard --port 5678
```

保持此终端窗口运行。

### 步骤2: 启动MCP Server（每个项目）

**双击运行**: `启动Spec-MCP-Server.bat`

或命令行：
```bash
cd /path/to/your/project
spec-workflow-mcp .
```

### 步骤3: 访问Dashboard

浏览器打开: **http://localhost:5678**

你会看到所有注册的项目列表。

---

## 🎯 一键启动（推荐）

**双击运行**: `启动完整服务.bat`

这会自动：
1. ✅ 启动Dashboard服务器（端口5678）
2. ✅ 启动MCP Server（连接到Dashboard）
3. ✅ 在两个独立窗口中运行（可分别控制）

---

## 📁 项目文件组织

### 启动脚本（根目录）
```
proxyhub/
├── 启动完整服务.bat           # 推荐：一键启动所有服务
├── 启动Spec-Dashboard.bat    # 单独启动Dashboard
├── 启动Spec-MCP-Server.bat   # 单独启动MCP Server
└── docs-spec-workflow/       # Spec-Workflow相关文档
    ├── README-新架构说明.md
    └── Spec-Workflow-快速说明.md
```

### 配置和数据（.spec-workflow/）
```
.spec-workflow/
├── config.toml              # 配置文件
├── specs/                   # 规格文档
│   └── {spec-name}/
│       ├── requirements.md
│       ├── design.md
│       ├── tasks.md
│       └── implementation-log.json
├── templates/               # 模板文件
└── approvals/              # 审批记录
```

---

## 🔧 故障排查

### 问题1: Dashboard显示 "No Projects Available"

**原因**: MCP Server未启动或未成功注册

**解决**:
1. 确保Dashboard已启动（终端1）
2. 启动MCP Server（终端2）
3. 刷新浏览器页面

### 问题2: "ERR_CONNECTION_REFUSED"

**原因**: Dashboard服务器未运行

**解决**:
```bash
# 检查5678端口是否在监听
netstat -ano | findstr ":5678"

# 如果没有，启动Dashboard
spec-workflow-mcp --dashboard --port 5678
```

### 问题3: 项目注册后立即注销

**原因**: 使用了已弃用的 `--AutoStartDashboard` 参数

**解决**:
- 停止使用 `--AutoStartDashboard`
- 改用新的两步启动方式

### 问题4: 两个服务都启动了，但Dashboard看不到项目

**原因**: MCP Server可能没有正确连接到Dashboard

**解决**:
1. 确保先启动Dashboard
2. 然后启动MCP Server
3. 查看MCP Server终端输出，确认注册成功：
   ```
   Project registered: xxxxxxxxxx
   ```
4. 如果看到 "Project unregistered"，说明有问题，需重启

---

## 💡 最佳实践

### 开发工作流

1. **启动服务** (一次)
   ```bash
   # 双击运行
   启动完整服务.bat
   ```

2. **打开Dashboard** (一次)
   ```
   浏览器访问: http://localhost:5678
   ```

3. **在Cursor中工作**
   ```
   在Cursor对话框中: "创建XXX功能的规格"
   ```

4. **在Dashboard中审批**
   - 查看生成的文档
   - 点击审批或添加修改意见

5. **保持服务运行**
   - 整个开发会话期间保持两个窗口运行
   - 不要关闭终端窗口

### 多项目管理

如果你有多个项目：

1. **启动一个Dashboard** (所有项目共享)
   ```bash
   spec-workflow-mcp --dashboard --port 5678
   ```

2. **为每个项目启动MCP Server**
   ```bash
   # 项目1
   cd /path/to/project1
   spec-workflow-mcp .
   
   # 项目2 (新终端)
   cd /path/to/project2
   spec-workflow-mcp .
   ```

3. **在Dashboard中切换项目**
   - Dashboard会显示所有注册的项目
   - 点击下拉菜单切换

---

## 📝 配置文件

### .spec-workflow/config.toml

```toml
# Spec Workflow Configuration

# 项目目录
projectDir = "."

# Dashboard设置
port = 5678
autoStartDashboard = false  # 新架构中此选项无效

# 语言
lang = "en"  # 或 "zh-CN"
```

---

## 🆘 需要帮助？

查看其他文档：
- `Spec-Workflow-快速说明.md` - 功能说明和使用方法
- `.spec-workflow/templates/` - 查看模板文件

或在Cursor中询问：
```
"spec-workflow如何使用？"
"如何创建新规格？"
"如何查看实现日志？"
```

