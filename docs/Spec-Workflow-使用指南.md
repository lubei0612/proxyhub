# Spec-Workflow Dashboard 使用指南

## 📦 安装状态

✅ **已安装**: `@pimzino/spec-workflow-mcp` v2.0.0 (全局安装)

## 🚀 快速启动

### 方法1: 使用批处理脚本 (推荐)
```bash
.\启动Spec-Workflow-Dashboard.bat
```

### 方法2: 使用PowerShell脚本
```powershell
.\启动Spec-Workflow-Dashboard.ps1
```

### 方法3: 直接命令行
```bash
# 使用全局安装的命令
spec-workflow-mcp

# 或使用 npx (无需安装)
npx @pimzino/spec-workflow-mcp
```

## 🌐 访问Dashboard

启动后，Dashboard将在以下地址打开：
- **默认地址**: http://localhost:5678
- 端口已设置为5678，避免与常用端口冲突

## 📋 Dashboard功能

### 1. **规格管理**
   - 创建新规格（Requirements → Design → Tasks → Implementation）
   - 查看现有规格列表
   - 查看规格详情和进度

### 2. **审批工作流**
   - 审批 Requirements 文档
   - 审批 Design 文档
   - 审批 Tasks 文档
   - 添加修改意见

### 3. **任务追踪**
   - 查看任务列表
   - 标记任务状态（待办/进行中/已完成）
   - 查看任务实现日志

### 4. **实现日志**
   - 查看详细的实现历史
   - 搜索API端点、组件、函数等
   - 避免重复实现

## 📁 目录结构

安装后会在项目根目录创建以下结构：

```
proxyhub/
├── .spec-workflow/
│   ├── templates/          # 模板文件（自动生成）
│   │   ├── requirements-template.md
│   │   ├── design-template.md
│   │   ├── tasks-template.md
│   │   ├── product-template.md
│   │   ├── tech-template.md
│   │   └── structure-template.md
│   │
│   ├── specs/             # 规格文档
│   │   └── {spec-name}/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       ├── tasks.md
│   │       └── implementation-log.json
│   │
│   └── steering/          # 项目架构文档（可选）
│       ├── product.md
│       ├── tech.md
│       └── structure.md
```

## 🔧 常见问题

### Q1: 启动后没有反应？
**A**: 检查终端输出，可能dashboard已经启动但浏览器没有自动打开。手动访问 http://localhost:3000

### Q2: 端口被占用？
**A**: Spec-workflow会自动尝试其他端口。查看终端输出获取实际端口号。

### Q3: 找不到 spec-workflow-mcp 命令？
**A**: 运行以下命令重新安装：
```bash
npm install -g @pimzino/spec-workflow-mcp
```

### Q4: Dashboard显示 "dashboardAvailable: false"？
**A**: 这表示dashboard服务未运行。使用启动脚本启动服务。

## 🔄 工作流程示例

### 创建新功能规格

1. **启动Dashboard**
   ```bash
   .\启动Spec-Workflow-Dashboard.bat
   ```

2. **在Cursor中请求创建规格**
   ```
   创建一个用户认证功能的规格
   ```

3. **逐步完成各阶段**
   - ✅ Requirements: AI生成 → Dashboard审批
   - ✅ Design: AI生成 → Dashboard审批
   - ✅ Tasks: AI生成 → Dashboard审批
   - ✅ Implementation: AI逐个实现任务 → 记录日志

4. **查看进度**
   - Dashboard实时显示规格状态
   - 查看已完成/待办任务
   - 搜索实现日志

## 💡 最佳实践

### 1. 保持Dashboard运行
在开发期间保持dashboard运行，以便实时查看审批请求和任务进度。

### 2. 及时审批
AI生成文档后会创建审批请求，在dashboard中及时审批以继续流程。

### 3. 详细的任务日志
完成任务后，AI会自动记录详细的实现日志。这些日志帮助：
- 避免重复实现
- 快速查找现有代码
- 理解系统架构

### 4. 使用搜索功能
在dashboard的日志页面使用搜索功能，快速找到：
- API端点
- React组件
- 工具函数
- 类和方法

## 🔗 相关资源

- **包地址**: https://www.npmjs.com/package/@pimzino/spec-workflow-mcp
- **版本**: v2.0.0 (2025-11-05)
- **关键词**: MCP, Spec Workflow, AI Development, Claude, Cursor

## 📞 获取帮助

如果遇到问题：
1. 检查终端输出的错误信息
2. 查看 `.spec-workflow/` 目录下的文件
3. 重启dashboard服务
4. 重新安装 spec-workflow-mcp

---

**注意**: Spec-Workflow Dashboard 是一个开发工具，仅在开发环境使用。不要在生产环境运行。

