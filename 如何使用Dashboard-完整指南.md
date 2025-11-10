# 🎯 Spec Workflow Dashboard 完整使用指南

## 📌 什么是 Spec Workflow？

Spec Workflow 是一个结构化的开发工作流工具，帮助AI辅助软件开发：
- **Requirements（需求）** → **Design（设计）** → **Tasks（任务）** → **Implementation（实现）**

## 🚀 快速启动

### 1️⃣ 启动 Dashboard

**方法A：双击批处理文件（推荐）**
```
双击运行：启动Dashboard.bat
```

**方法B：命令行启动**
```powershell
npx -y @pimzino/spec-workflow-mcp@latest "D:\Users\Desktop\proxyhub" --dashboard
```

Dashboard 地址：http://localhost:5000

### 2️⃣ 在 Cursor 中启用 MCP 服务器

**已自动配置！配置文件位置：**
```
C:\Users\chenyuqi\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**让配置生效：**
1. 完全关闭 Cursor
2. 重新打开 Cursor
3. MCP 服务器会自动连接到 Dashboard

### 3️⃣ 验证连接

打开 Dashboard（http://localhost:5000），你应该看到：
- ✅ 项目名称：**proxyhub**
- ✅ 项目路径：`D:\Users\Desktop\proxyhub`
- ✅ Specs 列表（如果有的话）

---

## 📖 如何使用 Spec Workflow

### 创建新的 Spec

在 Cursor 中对 AI 说：

```
创建一个 spec 来实现用户认证功能
```

或者：

```
用 spec-workflow 设计一个订单管理系统
```

### 批准文档

1. AI 会创建需求文档（requirements.md）
2. Dashboard 会显示**待批准**通知
3. 点击通知查看文档
4. 点击"批准"或"请求修改"

### 查看进度

Dashboard 会实时显示：
- ✅ 已完成的任务
- 🔄 进行中的任务
- ⏳ 待处理的任务
- 📊 整体进度百分比

---

## 🎯 常用命令

在 Cursor 中对 AI 说：

| 命令 | 说明 |
|------|------|
| `列出所有 specs` | 查看项目中的所有规格 |
| `显示 spec [名称] 的状态` | 查看特定 spec 的进度 |
| `执行任务 1.2 在 spec [名称]` | 运行特定任务 |
| `用 spec-workflow 实现 [功能]` | 创建新的 spec |

---

## ❓ 常见问题

### Q1: Dashboard 显示 "No Projects Available"

**解决方案：**
1. 确认 Dashboard 正在运行（http://localhost:5000）
2. 重启 Cursor
3. 等待 10-15 秒让 MCP 服务器连接
4. 刷新 Dashboard 页面

### Q2: 如何停止 Dashboard？

在运行 Dashboard 的命令行窗口按 `Ctrl+C`

### Q3: 端口 5000 被占用怎么办？

使用其他端口启动：
```powershell
npx -y @pimzino/spec-workflow-mcp@latest "D:\Users\Desktop\proxyhub" --dashboard --port 3100
```

---

## 🔧 配置文件位置

| 文件 | 路径 |
|------|------|
| MCP 配置 | `C:\Users\chenyuqi\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` |
| Specs 目录 | `D:\Users\Desktop\proxyhub\.spec-workflow\specs\` |
| 批准请求 | `D:\Users\Desktop\proxyhub\.spec-workflow\approvals\` |

---

## 📚 更多资源

- 官方文档：https://github.com/Pimzino/spec-workflow-mcp
- 工作流指南：查看项目中的 `.spec-workflow/` 目录

---

## ✅ 下一步

1. ✅ Dashboard 已启动
2. ✅ MCP 配置已完成
3. ⏳ **请重启 Cursor**
4. ⏳ 刷新 Dashboard 查看项目

---

🎉 **配置完成！现在可以开始使用 Spec Workflow 进行开发了！**


