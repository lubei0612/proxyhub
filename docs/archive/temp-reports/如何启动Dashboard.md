# 🚀 如何启动 Spec Workflow Dashboard

## 方法1：使用 BAT 脚本（最简单）

### 步骤：
1. **双击运行** `start-dashboard.bat`
2. **等待** 10-15秒让服务启动
3. **打开浏览器** 访问 http://localhost:3100
4. **选择项目** 在左上角选择 "proxyhub"

### 如果出现问题：
- 检查 CMD 窗口是否有错误信息
- 确保没有其他程序占用 3100 端口
- 尝试关闭并重新运行

---

## 方法2：使用 PowerShell 脚本

### 步骤：
1. **右键点击** `start-dashboard.ps1`
2. **选择** "使用 PowerShell 运行"
3. **等待** 启动完成
4. **访问** http://localhost:3100

---

## 方法3：手动命令行（调试用）

### 在项目根目录运行：
```powershell
npx -y @pimzino/spec-workflow-mcp@latest D:\Users\Desktop\proxyhub --dashboard
```

---

## 📋 Dashboard 使用指南

### 进入 Dashboard 后：

1. **选择项目**
   - 点击左上角 "Projects: No Project"
   - 选择 "proxyhub"

2. **查看待批准文档**
   - 点击左侧菜单 "审批" 或 "Approvals"
   - 找到待批准的文档

3. **批准文档**
   - 点击文档查看详情
   - 点击 "Approve" 按钮
   - （可选）添加评论

4. **查看 Spec 进度**
   - 点击 "Specs" 查看所有规范
   - 点击 "Tasks" 查看任务列表

---

## ⚠️ 常见问题

### Q: Dashboard 无法访问？
**A:** 
- 确保脚本窗口没有关闭
- 检查是否有"Server running at"的提示
- 尝试访问 http://127.0.0.1:3100

### Q: 显示 "No Projects Available"？
**A:**
- 等待5秒后刷新页面
- 检查项目路径是否正确
- 重启 Dashboard 服务

### Q: 看不到待批准的文档？
**A:**
- 确保在正确的项目中
- 检查 `.spec-workflow/specs/` 目录是否存在
- 查看 CMD 窗口是否有错误

---

## 🔄 如果 Dashboard 一直无法工作

### 备选方案：口头批准

您可以直接告诉 AI：**"已批准"**

AI 会记录您的批准并继续下一步工作。

虽然不符合规范流程，但可以继续开发。

---

## 📞 需要帮助？

如果以上方法都不work，请：
1. 查看 CMD 窗口的错误信息
2. 截图发给 AI
3. AI 会帮您诊断问题



