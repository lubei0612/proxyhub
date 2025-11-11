# 📤 GitHub 上传完整指南

## 🎯 目标
将 ProxyHub 项目上传到 GitHub，方便服务器部署和版本管理。

---

## 📋 准备工作

### 1. 创建 GitHub 仓库

1. 访问 [https://github.com/new](https://github.com/new)
2. 填写仓库信息：
   - **Repository name**: `proxyhub`
   - **Description**: `专业代理IP管理平台 - Professional Proxy Management Platform`
   - **Visibility**: `Private` (推荐) 或 `Public`
   - **⚠️ 不要勾选** "Initialize this repository with a README"
3. 点击 **Create repository**

### 2. 获取仓库地址

创建完成后，GitHub 会显示仓库地址，类似于：
```
https://github.com/YOUR_USERNAME/proxyhub.git
```
或
```
git@github.com:YOUR_USERNAME/proxyhub.git
```

---

## 🚀 上传步骤

### 方法一：自动化脚本（推荐）

```bash
# 1. 赋予脚本执行权限
chmod +x setup-github.sh

# 2. 运行脚本
bash setup-github.sh

# 3. 按照提示添加远程仓库并推送
git remote add origin https://github.com/YOUR_USERNAME/proxyhub.git
git branch -M main
git push -u origin main
```

---

### 方法二：手动步骤

#### 步骤1：添加文件到Git

```bash
# 添加所有新文件和修改
git add .

# 查看将要提交的内容
git status
```

#### 步骤2：提交更改

```bash
git commit -m "feat: ProxyHub v1.0.0 - 完整版发布

功能特性:
- ✅ 用户认证系统（注册、登录、JWT）
- ✅ 静态/动态代理管理
- ✅ 订单和交易系统
- ✅ 管理后台（用户管理、订单管理、价格覆盖）
- ✅ 充值审核流程
- ✅ 数据可视化仪表板

安全加固:
- ✅ 强密码策略（8+字符，大小写+数字）
- ✅ API速率限制（防暴力破解）
- ✅ JWT强制32+字符
- ✅ 环境变量验证
- ✅ 全局异常处理
- ✅ 安全响应头（Helmet）
- ✅ CORS配置

部署支持:
- ✅ Docker + Docker Compose
- ✅ 一键部署脚本
- ✅ 完整部署文档
- ✅ 生产环境配置模板

技术栈:
- Backend: NestJS + TypeScript + PostgreSQL + Redis
- Frontend: Vue 3 + Element Plus + Pinia
- DevOps: Docker + Nginx
"
```

#### 步骤3：连接到 GitHub

```bash
# 添加远程仓库（使用HTTPS）
git remote add origin https://github.com/YOUR_USERNAME/proxyhub.git

# 或使用SSH（需要先配置SSH密钥）
git remote add origin git@github.com:YOUR_USERNAME/proxyhub.git

# 查看远程仓库
git remote -v
```

#### 步骤4：推送到 GitHub

```bash
# 将本地分支重命名为 main（GitHub 默认分支）
git branch -M main

# 推送到远程仓库
git push -u origin main
```

---

## 🔑 配置 SSH 密钥（可选，推荐）

如果使用 SSH 方式推送，需要先配置 SSH 密钥：

### 1. 生成 SSH 密钥

```bash
# 生成密钥对
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 按Enter使用默认路径
# 设置密码（可选，直接Enter跳过）
```

### 2. 添加到 GitHub

```bash
# 复制公钥内容（Windows PowerShell）
Get-Content ~\.ssh\id_rsa.pub | Set-Clipboard

# 或手动打开文件复制
notepad ~\.ssh\id_rsa.pub
```

1. 访问 [https://github.com/settings/keys](https://github.com/settings/keys)
2. 点击 **New SSH key**
3. 粘贴公钥内容
4. 点击 **Add SSH key**

### 3. 测试连接

```bash
ssh -T git@github.com

# 应该看到：
# Hi YOUR_USERNAME! You've successfully authenticated...
```

---

## ✅ 验证上传成功

1. **访问 GitHub 仓库**：`https://github.com/YOUR_USERNAME/proxyhub`
2. **检查文件**：确认所有文件都已上传
3. **查看 README**：确认 README.md 正确显示

---

## 📝 后续操作

### 1. 更新部署脚本中的仓库地址

```bash
# 编辑 deploy-server.sh
nano deploy-server.sh

# 找到并替换：
git clone YOUR_GITHUB_REPO_URL proxyhub

# 改为：
git clone https://github.com/YOUR_USERNAME/proxyhub.git proxyhub
```

### 2. 更新 deploy-guide.md

```bash
nano deploy-guide.md

# 全局替换 YOUR_GITHUB_USERNAME 为您的用户名
```

### 3. 更新 README.md

```bash
nano README.md

# 替换所有 YOUR_USERNAME 为您的用户名
```

### 4. 提交更新

```bash
git add deploy-server.sh deploy-guide.md README.md
git commit -m "docs: 更新部署脚本和文档中的仓库地址"
git push
```

---

## 🔄 日常更新流程

### 添加新功能后提交

```bash
# 1. 查看更改
git status

# 2. 添加文件
git add .

# 3. 提交（使用规范的提交信息）
git commit -m "feat: 添加XXX功能"

# 4. 推送
git push
```

### 提交信息规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具相关
```

---

## 🐛 常见问题

### 问题1：推送被拒绝

```bash
# 错误信息：
# ! [rejected]        main -> main (fetch first)

# 解决方法：先拉取远程更改
git pull origin main --rebase
git push origin main
```

### 问题2：凭证错误

```bash
# HTTPS 方式：
# 使用 Personal Access Token 替代密码

# 生成 Token：
# https://github.com/settings/tokens

# 使用 Token：
# Username: YOUR_USERNAME
# Password: <粘贴 Token>
```

### 问题3：文件太大

```bash
# 如果有大文件（>100MB），需要使用 Git LFS

# 安装 Git LFS
git lfs install

# 跟踪大文件
git lfs track "*.tar.gz"

# 提交 .gitattributes
git add .gitattributes
git commit -m "chore: 添加 Git LFS 支持"
```

### 问题4：忘记 .gitignore

```bash
# 如果不小心提交了敏感文件

# 1. 从 Git 移除（保留本地文件）
git rm --cached .env

# 2. 确保 .gitignore 正确
echo ".env" >> .gitignore

# 3. 提交更改
git add .gitignore
git commit -m "chore: 更新 .gitignore"
git push

# 4. 清除历史中的敏感文件（如果已推送）
# ⚠️ 这会重写历史，谨慎操作！
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

---

## 📚 有用的 Git 命令

```bash
# 查看提交历史
git log --oneline --graph --all

# 查看某个文件的更改历史
git log -p filename

# 撤销未提交的更改
git checkout -- filename

# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 查看远程仓库信息
git remote show origin

# 清理未跟踪的文件
git clean -fd

# 查看差异
git diff
git diff --staged
```

---

## 🎉 完成！

您的代码已成功上传到 GitHub！

**下一步：**
1. ✅ 在服务器上执行部署脚本
2. ✅ 配置环境变量
3. ✅ 启动服务
4. ✅ 开始使用！

---

**祝您使用愉快！** 🚀

