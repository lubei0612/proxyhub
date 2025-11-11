# GitHub Actions 自动部署配置指南

## 📋 概述

ProxyHub支持通过GitHub Actions实现CI/CD自动部署。推送代码到master分支后，会自动部署到生产服务器。

---

## 🔑 配置GitHub Secrets

### Step 1: 进入GitHub仓库设置

1. 打开您的GitHub仓库
2. 点击 **Settings**
3. 左侧菜单选择 **Secrets and variables** -> **Actions**
4. 点击 **New repository secret**

### Step 2: 添加必需的Secrets

需要添加以下3个Secrets：

| Secret名称 | 说明 | 值 |
|-----------|------|-----|
| `SERVER_HOST` | 服务器IP地址 | `43.130.35.117` |
| `SERVER_USER` | SSH用户名 | `root` |
| `SERVER_SSH_KEY` | SSH私钥 | 完整的私钥内容 |

---

## 🔐 生成SSH密钥对

### 在本地执行

```bash
# 生成新的SSH密钥对
ssh-keygen -t rsa -b 4096 -C "proxyhub-deploy" -f ~/.ssh/proxyhub_deploy

# 查看公钥（稍后添加到服务器）
cat ~/.ssh/proxyhub_deploy.pub

# 查看私钥（稍后添加到GitHub Secrets）
cat ~/.ssh/proxyhub_deploy
```

**⚠️ 注意：**
- 生成密钥时不要设置密码（直接回车）
- 私钥内容包含 `-----BEGIN RSA PRIVATE KEY-----` 和 `-----END RSA PRIVATE KEY-----`
- 完整复制私钥内容，包括开头和结尾

---

## 📤 添加公钥到服务器

### Step 1: SSH登录服务器

```bash
ssh root@43.130.35.117
```

### Step 2: 添加公钥

```bash
# 创建.ssh目录（如果不存在）
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 添加公钥到authorized_keys
cat >> ~/.ssh/authorized_keys << 'EOF'
# 粘贴您的公钥内容（从proxyhub_deploy.pub复制）
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC... proxyhub-deploy
EOF

# 设置正确权限
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: 测试SSH连接

```bash
# 在本地测试（不要在服务器上执行）
ssh -i ~/.ssh/proxyhub_deploy root@43.130.35.117

# 如果能成功登录，说明配置正确
```

---

## ➕ 添加Secrets到GitHub

### 添加 SERVER_HOST

1. 在GitHub Secrets页面点击 **New repository secret**
2. Name: `SERVER_HOST`
3. Value: `43.130.35.117`
4. 点击 **Add secret**

### 添加 SERVER_USER

1. Name: `SERVER_USER`
2. Value: `root`
3. 点击 **Add secret**

### 添加 SERVER_SSH_KEY

1. Name: `SERVER_SSH_KEY`
2. Value: 完整的私钥内容（从 `~/.ssh/proxyhub_deploy` 复制）
   ```
   -----BEGIN RSA PRIVATE KEY-----
   MIIJKAIBAAKCAgEAr6B7...（完整内容）...
   -----END RSA PRIVATE KEY-----
   ```
3. 点击 **Add secret**

---

## 🚀 触发自动部署

### 方式一：推送代码

```bash
# 在本地项目目录
git add .
git commit -m "Update application"
git push origin master
```

### 方式二：手动触发

1. 进入GitHub仓库
2. 点击 **Actions**
3. 选择 **Deploy to Production** workflow
4. 点击 **Run workflow**
5. 选择 `master` 分支
6. 点击 **Run workflow**

---

## 📊 查看部署状态

### 在GitHub上查看

1. 进入GitHub仓库
2. 点击 **Actions**
3. 查看最新的workflow运行状态

### 在服务器上查看

```bash
# SSH到服务器
ssh root@43.130.35.117

# 查看部署日志
cd ~/proxyhub
docker-compose logs -f backend

# 查看服务状态
docker-compose ps
```

---

## 🔄 自动备份配置

ProxyHub还配置了每日自动备份workflow：

- **触发时间**: 每天北京时间凌晨2点 (UTC 18:00)
- **备份位置**: `/var/backups/proxyhub/`
- **保留策略**: 最近7天

### 手动触发备份

1. 进入GitHub仓库 **Actions**
2. 选择 **Database Backup** workflow
3. 点击 **Run workflow**
4. 点击 **Run workflow**

---

## 🐛 故障排除

### 部署失败: Permission denied (publickey)

**原因**: SSH密钥配置错误

**解决方案**:
1. 确认私钥完整复制到GitHub Secrets
2. 确认公钥正确添加到服务器 `~/.ssh/authorized_keys`
3. 检查服务器.ssh目录权限：
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

### 部署失败: Host key verification failed

**原因**: 首次连接需要确认主机指纹

**解决方案**:
在GitHub Actions中已配置 `StrictHostKeyChecking=no`，通常不会出现此问题。如果出现，检查workflow配置。

### 部署失败: docker-compose command not found

**原因**: 服务器未安装Docker Compose

**解决方案**:
```bash
# SSH到服务器
ssh root@43.130.35.117

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### 部署成功但服务无法访问

**原因**: 防火墙阻止了端口

**解决方案**:
```bash
# 检查防火墙
sudo ufw status

# 允许HTTP
sudo ufw allow 80/tcp

# 允许HTTPS
sudo ufw allow 443/tcp
```

---

## 📝 Workflow文件说明

### 部署Workflow (.github/workflows/deploy.yml)

```yaml
name: Deploy to Production

on:
  push:
    branches: [ master ]
    paths-ignore:
      - '**.md'
      - 'docs/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ~/proxyhub
            git pull origin master
            docker-compose down
            docker-compose build --no-cache
            docker-compose up -d
```

### 备份Workflow (.github/workflows/backup.yml)

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 18 * * *'  # 每天UTC 18:00 (北京时间02:00)
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Execute Backup on Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ~/proxyhub
            bash scripts/db-backup.sh
```

---

## ✅ 配置完成检查清单

- [ ] 已生成SSH密钥对
- [ ] 公钥已添加到服务器
- [ ] 私钥已添加到GitHub Secrets
- [ ] SERVER_HOST已添加到GitHub Secrets
- [ ] SERVER_USER已添加到GitHub Secrets
- [ ] 测试推送代码触发自动部署
- [ ] 查看Actions页面确认部署成功
- [ ] 服务器上验证服务正常运行

---

## 🎉 完成！

现在您可以享受CI/CD自动部署带来的便利：

- **推送代码** → **自动部署** → **生产环境更新**
- **每日自动备份** → **数据安全保障**

有问题？查看 [故障排除指南](../troubleshooting/) 或提交 [GitHub Issue](https://github.com/lubei0612/proxyhub/issues)。

