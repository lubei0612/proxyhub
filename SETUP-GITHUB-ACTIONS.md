# GitHub Actions 设置指南

## 🎯 已创建的文件

### 1. GitHub Actions 工作流

**`.github/workflows/deploy.yml`** - 自动部署
- 当推送到 `master` 分支时自动触发
- 自动部署到腾讯云服务器
- 可以手动触发

**`.github/workflows/test.yml`** - 自动测试
- 每次推送代码自动运行
- 检查后端 TypeScript 编译
- 检查前端构建

### 2. Git 文件属性

**`.gitattributes`** - 统一文件格式
- 所有代码文件使用 LF 换行符（Linux风格）
- Windows 脚本使用 CRLF 换行符
- 二进制文件标记为 binary

### 3. Git Hooks

**`.husky/pre-commit`** - 提交前检查
- 检查 TypeScript 编译
- 阻止提交 `.env` 敏感文件
- 检查大文件（>5MB）

**`.husky/pre-push`** - 推送前确认
- 推送到 master 需要确认

---

## 📋 需要配置的 GitHub Secrets

要让自动部署工作，需要在 GitHub 仓库设置这些密钥：

### 设置步骤

1. 打开 GitHub 仓库：https://github.com/lubei0612/proxyhub

2. 点击 **Settings** > **Secrets and variables** > **Actions**

3. 点击 **New repository secret**，添加以下密钥：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `SERVER_HOST` | `43.130.35.117` | 腾讯云服务器IP |
| `SERVER_USER` | `root` | SSH 用户名 |
| `SERVER_SSH_KEY` | (SSH私钥内容) | 服务器SSH私钥 |

### 获取 SSH 私钥

在本地电脑运行：
```bash
# 查看你的 SSH 私钥
cat ~/.ssh/id_rsa

# 或者生成新的
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

复制私钥内容（从 `-----BEGIN ... ` 到 `... END-----`），粘贴到 `SERVER_SSH_KEY`

---

## ✅ 效果

### 自动部署

```bash
# 本地推送代码
git push origin master

# GitHub Actions 自动执行：
1. 连接腾讯云服务器
2. 拉取最新代码
3. 重新构建 Docker 镜像
4. 重启服务

# 5分钟后，网站自动更新！
```

### 自动测试

```bash
# 每次推送代码
git push

# GitHub Actions 自动：
1. 运行 TypeScript 类型检查
2. 构建前后端
3. 有错误立即通知你

# 提交历史显示 ✅ 或 ❌
```

### Git Hooks 检查

```bash
# 提交代码
git commit -m "fix bug"

# 自动检查：
✅ TypeScript 编译通过
✅ 没有提交 .env 文件
✅ 没有超大文件
✅ 提交成功！

# 如果有问题：
❌ TypeScript 编译失败
❌ 提交被阻止，需要修复后重试
```

---

## 🎯 使用建议

### 启用自动部署

如果你想启用自动部署：

1. 在 GitHub 设置好上面的 3 个 Secrets
2. 推送代码到 master
3. 观察 GitHub Actions 页面的执行情况

### 暂时禁用

如果暂时不想用自动部署：

```bash
# 重命名文件，禁用工作流
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
```

### 手动触发部署

在 GitHub 仓库页面：
1. 点击 **Actions** 标签
2. 选择 "Deploy to Production"
3. 点击 **Run workflow**
4. 选择分支，点击 **Run workflow**

---

## ⚠️ 注意事项

### 首次推送

由于添加了 `.gitattributes`，Git 可能会重新格式化一些文件：

```bash
# 让 Git 重新应用属性
git add --renormalize .
git commit -m "chore: apply .gitattributes"
git push
```

### Git Hooks 在 Windows

Git Hooks 脚本需要执行权限：

```bash
# 在 Git Bash 中运行
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

或者在 PowerShell：
```powershell
# Windows 上 Git 会自动处理
git update-index --chmod=+x .husky/pre-commit
git update-index --chmod=+x .husky/pre-push
```

---

## 🔧 测试

### 测试 Git Hooks

```bash
# 测试 pre-commit
git add .
git commit -m "test"

# 应该看到：
# 🔍 Running pre-commit checks...
# ✅ Pre-commit checks passed!
```

### 测试 GitHub Actions

```bash
# 推送代码
git push origin master

# 在 GitHub 查看：
# https://github.com/lubei0612/proxyhub/actions
```

---

## 📞 出问题了？

### GitHub Actions 失败

1. 检查 GitHub Secrets 是否设置正确
2. 查看 Actions 日志，找到具体错误
3. SSH 连接问题？检查服务器 IP 和私钥

### Git Hooks 不执行

```bash
# 重新安装 Husky
cd backend
npx husky install
```

### .gitattributes 导致冲突

```bash
# 临时禁用
mv .gitattributes .gitattributes.backup

# 提交后再恢复
mv .gitattributes.backup .gitattributes
```

---

**设置完成！🎉**

