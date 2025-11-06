# Spec-Workflow Dashboard 快速说明

## ❓ 为什么显示 "No Projects Available"？

这是因为**Dashboard只是Web界面**，需要配合**MCP Server**才能显示项目。

## 📊 三种运行模式

### 模式对比

| 模式 | 命令 | MCP Server | Dashboard | 用途 |
|------|------|-----------|-----------|------|
| **1. 仅MCP** | `spec-workflow-mcp` | ✅ | ❌ | 只在Cursor中使用工具，不需要可视化界面 |
| **2. MCP + Dashboard** | `spec-workflow-mcp --AutoStartDashboard --port 5678` | ✅ | ✅ | **推荐！**同时使用Cursor工具和Web界面 |
| **3. 仅Dashboard** | `spec-workflow-mcp --dashboard --port 5678` | ❌ | ✅ | 只查看已有数据，不处理新请求 |

## ✅ 推荐使用方式

### 使用启动脚本（已自动配置为模式2）

**双击运行**: `启动Spec-Workflow-Dashboard.bat`

这会自动启动 **MCP Server + Dashboard**，你可以：
- ✅ 在Cursor中使用spec-workflow工具
- ✅ 在浏览器中查看Dashboard（http://localhost:5678）
- ✅ 在Dashboard中审批文档
- ✅ 查看任务进度和实现日志

## 🔍 理解工作流程

### 完整工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                    1. 启动 MCP Server                        │
│              spec-workflow-mcp --AutoStartDashboard         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├─── 启动 MCP Server（监听Cursor的工具调用）
                      │
                      └─── 启动 Dashboard（http://localhost:5678）
                      
┌─────────────────────────────────────────────────────────────┐
│              2. 在Cursor中请求创建规格                        │
│                  "创建XXX功能的规格"                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├─── AI调用spec-workflow工具
                      │
                      ├─── 生成requirements.md
                      │
                      ├─── 创建审批请求
                      │
                      └─── Dashboard显示项目和待审批文档
                      
┌─────────────────────────────────────────────────────────────┐
│         3. 在Dashboard中审批（http://localhost:5678）        │
│                   点击审批按钮                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├─── AI继续下一阶段（Design）
                      │
                      └─── 重复审批流程直到完成
```

## 🚀 现在应该做什么？

### 步骤1: 确认服务已启动

运行启动脚本后，你应该看到类似这样的输出：

```
Loaded config from: D:\Users\Desktop\proxyhub\.spec-workflow\config.toml
Starting Spec Workflow MCP Server for project: .
Dashboard started at: http://localhost:5678
Project registered: xxxxxxxxxx
```

### 步骤2: 刷新Dashboard

在浏览器中访问 http://localhost:5678，点击项目下拉菜单，你应该能看到：
- **proxyhub** 项目（或项目ID）

### 步骤3: 在Cursor中创建规格

在Cursor对话框中输入：

```
创建一个用户认证功能的规格
```

AI会：
1. 生成requirements.md
2. 在Dashboard创建审批请求
3. 等待你在Dashboard中审批

### 步骤4: 在Dashboard中审批

1. 打开 http://localhost:5678
2. 点击左侧 **"审批"** 菜单
3. 查看待审批文档
4. 点击 **"批准"** 或添加修改意见

## 🔧 故障排查

### 问题1: Dashboard显示 "No Projects Available"

**原因**: 只启动了Dashboard，没有启动MCP Server

**解决**: 
- 停止当前服务
- 使用 `启动Spec-Workflow-Dashboard.bat`
- 或运行: `spec-workflow-mcp --AutoStartDashboard --port 5678`

### 问题2: 项目列表中看不到proxyhub

**原因**: MCP Server可能没有正确注册项目

**解决**:
1. 确保在项目根目录运行命令
2. 检查 `.spec-workflow/` 目录是否存在
3. 重启服务

### 问题3: 工具在Cursor中无法使用

**原因**: Cursor没有连接到MCP Server

**解决**:
1. 确保Cursor的MCP设置正确
2. 检查MCP Server是否在运行
3. 查看Cursor的MCP日志

## 📝 常用命令对照

| 想要做什么 | 使用的命令 |
|-----------|-----------|
| 开发时使用（推荐） | `spec-workflow-mcp --AutoStartDashboard --port 5678` |
| 只用工具，不看界面 | `spec-workflow-mcp` |
| 只看现有数据 | `spec-workflow-mcp --dashboard --port 5678` |

## 💡 最佳实践

1. **开发时**: 始终使用 `--AutoStartDashboard` 模式
2. **保持运行**: 在整个开发会话期间保持服务运行
3. **及时审批**: 收到审批请求后及时处理，不要让AI等待
4. **查看日志**: 定期查看实现日志，了解已有功能

---

**现在你应该**: 
1. ✅ 运行 `启动Spec-Workflow-Dashboard.bat`
2. ✅ 刷新浏览器 http://localhost:5678
3. ✅ 在Cursor中请求创建规格

