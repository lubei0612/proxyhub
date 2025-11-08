# 🚀 ProxyHub GitHub 部署流程指南

## 📝 **准备工作完成清单**

✅ **所有部署资源已就绪：**
- `.env.example` - 环境变量模板
- `setup-env.sh` - 自动化配置向导
- `deploy.sh` - 一键部署脚本
- `DEPLOY.md` - 完整部署文档
- `README-DEPLOY.md` - 快速部署指南
- `.gitignore` - 敏感文件保护

---

## 🔄 **部署流程（本地 → GitHub → 服务器）**

```
┌──────────┐     git push      ┌──────────┐     git pull      ┌──────────┐
│  本地电脑  │ ─────────────> │  GitHub   │ ──────────────> │  服务器   │
└──────────┘                   └──────────┘                   └──────────┘
```

---

## 📤 **步骤1: 本地推送到GitHub**

### **1.1 查看当前状态**

```bash
git status
```

### **1.2 添加所有文件**

```bash
# 添加新创建的部署文件
git add .env.example
git add setup-env.sh
git add deploy.sh
git add DEPLOY.md
git add README-DEPLOY.md
git add DEPLOYMENT-READY-2025-11-08.md
git add GITHUB-DEPLOYMENT-GUIDE.md

# 添加所有其他修改
git add .
```

### **1.3 提交更改**

```bash
git commit -m "feat: 生产环境部署就绪

- 添加自动化部署脚本 (setup-env.sh, deploy.sh)
- 添加完整部署文档 (DEPLOY.md, README-DEPLOY.md)
- 创建环境变量模板 (.env.example)
- 修复remark字段不暴露上游供应商
- 优化Docker生产环境配置
- 添加GitHub工作流支持"
```

### **1.4 推送到GitHub**

```bash
# 推送到main分支
git push origin main

# 或推送到master分支（根据您的仓库）
git push origin master
```

⚠️ **确认**：`.env` 文件不会被推送（已在 `.gitignore` 中）

---

## 📥 **步骤2: 服务器拉取和部署**

### **2.1 登录服务器**

```bash
ssh user@your-server-ip
```

### **2.2 首次部署（克隆仓库）**

```bash
# 进入部署目录
cd /opt

# 克隆项目
git clone https://github.com/YOUR_USERNAME/proxyhub.git

# 进入项目目录
cd proxyhub

# 给脚本添加执行权限
chmod +x setup-env.sh deploy.sh
```

### **2.3 配置环境变量**

**方式A: 使用交互式配置向导（推荐）**

```bash
./setup-env.sh
```

选择 **"2) 交互模式"**，然后按提示输入：
- 数据库密码（自动生成）
- 985Proxy API Key（必填）
- 985Proxy Zone（必填）
- 邮件服务配置（Gmail/Outlook/SendGrid）
- Telegram机器人配置（可选）
- 前端域名（必填）

**方式B: 手动配置**

```bash
# 复制模板
cp .env.example .env

# 编辑配置
nano .env
# 或
vim .env
```

必填项：
```env
PROXY_985_API_KEY=ne_xxxxx
PROXY_985_ZONE=xxxxx
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-domain.com
```

### **2.4 一键部署**

```bash
./deploy.sh
```

部署脚本会自动：
1. ✅ 检查系统环境
2. ✅ 验证配置完整性
3. ✅ 停止旧容器
4. ✅ 构建Docker镜像
5. ✅ 启动所有服务
6. ✅ 健康检查
7. ✅ 显示访问信息

### **2.5 验证部署**

```bash
# 查看容器状态
docker-compose -f docker-compose.cn.yml ps

# 查看后端日志
docker logs -f proxyhub-backend

# 测试API
curl http://localhost:3000/api/v1/health
```

---

## 🔄 **步骤3: 后续更新流程**

### **3.1 本地开发并推送**

```bash
# 本地修改代码后
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

### **3.2 服务器拉取并重新部署**

```bash
# 登录服务器
ssh user@your-server-ip

# 进入项目目录
cd /opt/proxyhub

# 拉取最新代码
git pull origin main

# 重新部署（自动构建+重启）
./deploy.sh
```

---

## 🔐 **安全最佳实践**

### **1. 环境变量管理**

✅ **DO（推荐做法）：**
- 使用 `.env.example` 作为模板
- 服务器上手动创建 `.env` 文件
- 定期备份 `.env` 文件到安全位置
- 使用强随机密钥（`openssl rand -base64 64`）

❌ **DON'T（禁止做法）：**
- 不要将 `.env` 提交到Git
- 不要在公开渠道分享 `.env` 内容
- 不要使用默认或弱密码

### **2. 服务器安全**

```bash
# 配置防火墙（只开放必要端口）
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# 禁用密码登录（使用SSH密钥）
sudo nano /etc/ssh/sshd_config
# 设置: PasswordAuthentication no
sudo systemctl restart sshd
```

### **3. 数据库安全**

```bash
# 定期备份
0 2 * * * /opt/backup-proxyhub.sh

# 限制PostgreSQL端口访问（不对外开放）
# 在docker-compose.cn.yml中不要映射5432端口到主机
```

---

## 🌐 **生产环境优化（可选）**

### **1. 配置HTTPS（Let's Encrypt）**

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 申请SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### **2. 配置Nginx反向代理**

参考 `DEPLOY.md` - "配置域名和HTTPS"章节

### **3. 设置日志轮转**

```bash
# 限制Docker日志大小
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker
```

---

## 🐛 **常见问题排查**

### **问题1: git push 失败**

```bash
# 检查远程仓库
git remote -v

# 检查分支
git branch

# 强制推送（谨慎使用）
git push origin main --force
```

### **问题2: 服务器 git pull 失败**

```bash
# 查看冲突
git status

# 暂存本地修改
git stash

# 拉取更新
git pull

# 恢复本地修改
git stash pop
```

### **问题3: Docker 构建失败**

```bash
# 清理Docker缓存
docker system prune -a

# 重新构建（无缓存）
docker-compose -f docker-compose.cn.yml build --no-cache

# 重新启动
docker-compose -f docker-compose.cn.yml up -d
```

### **问题4: 容器无法启动**

```bash
# 查看日志
docker logs proxyhub-backend
docker logs proxyhub-frontend

# 检查端口占用
netstat -tlnp | grep :3000
netstat -tlnp | grep :8080

# 检查环境变量
docker exec proxyhub-backend env | grep PROXY_985
```

---

## 📋 **完整命令速查表**

### **本地操作**

```bash
# 查看状态
git status

# 提交所有更改
git add . && git commit -m "feat: your message"

# 推送到GitHub
git push origin main
```

### **服务器操作**

```bash
# 首次部署
cd /opt && git clone https://github.com/YOUR_USERNAME/proxyhub.git
cd proxyhub && chmod +x setup-env.sh deploy.sh
./setup-env.sh && ./deploy.sh

# 更新部署
cd /opt/proxyhub && git pull && ./deploy.sh

# 查看服务状态
docker-compose -f docker-compose.cn.yml ps

# 查看日志
docker logs -f proxyhub-backend

# 重启服务
docker-compose -f docker-compose.cn.yml restart

# 停止服务
docker-compose -f docker-compose.cn.yml down
```

---

## ✅ **部署完成检查清单**

### **部署前：**
- [ ] 所有代码已提交到Git
- [ ] `.env` 文件已在 `.gitignore` 中
- [ ] `.env.example` 已创建并推送
- [ ] 部署脚本已推送（setup-env.sh, deploy.sh）
- [ ] 文档已推送（DEPLOY.md）

### **部署中：**
- [ ] 服务器已安装Docker和Git
- [ ] 防火墙已配置（端口80、443已开放）
- [ ] `.env` 文件已配置完成
- [ ] 985Proxy账户已充值
- [ ] 部署脚本执行无错误

### **部署后：**
- [ ] 所有容器状态为 `Up` 或 `healthy`
- [ ] 前端可以访问（http://your-server-ip:8080）
- [ ] 后端API可以访问（http://your-server-ip:3000/api/v1/health）
- [ ] 可以登录管理员账户
- [ ] 静态IP购买页面显示真实库存
- [ ] 已修改默认管理员密码
- [ ] 已配置HTTPS（可选但推荐）
- [ ] 已设置数据库备份（可选但推荐）

---

## 🎉 **部署成功！**

**访问地址：**
- 前端：`http://your-server-ip:8080` 或 `https://your-domain.com`
- 后端API：`http://your-server-ip:3000/api/v1`

**默认管理员账户：**
- 邮箱：见 `.env` 中的 `ADMIN_EMAIL`
- 密码：见 `.env` 中的 `ADMIN_PASSWORD`

⚠️ **请立即登录并修改默认密码！**

---

**文档版本**: v1.0
**创建时间**: 2025-11-08
**适用环境**: Ubuntu 20.04+, Docker 20.10+, Docker Compose 2.0+

