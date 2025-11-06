# ProxyHub 腾讯云部署完整说明

**最后更新**: 2025-11-06  
**版本**: 1.0.0  
**状态**: ✅ 生产就绪

---

## 📖 文档导航

### 🚀 快速开始
- **[部署-快速开始.md](./部署-快速开始.md)** - 5步完成部署（推荐新手）
- **[腾讯云Docker部署指南.md](./腾讯云Docker部署指南.md)** - 完整详细步骤

### 📊 测试报告
- **[充值审核功能修复报告-2025-11-06.md](./充值审核功能修复报告-2025-11-06.md)** - 充值功能完整测试

### 📁 部署文件
- **[deploy-tencentcloud.sh](../../deploy-tencentcloud.sh)** - 自动化部署脚本
- **[docker-compose.yml](../../docker-compose.yml)** - Docker编排配置
- **[DOCKER_DEPLOYMENT_GUIDE.md](../../DOCKER_DEPLOYMENT_GUIDE.md)** - Docker部署参考

---

## 🎯 部署方式选择

### 方式1: 自动化部署（推荐） ⭐

**适合**: 快速部署，降低出错风险

**步骤**:
1. 上传 `deploy-tencentcloud.sh` 到服务器
2. 运行脚本自动完成安装
3. 按提示上传项目文件
4. 配置腾讯云安全组

**查看**: [部署-快速开始.md](./部署-快速开始.md)

---

### 方式2: 手动部署

**适合**: 需要自定义配置

**步骤**:
1. 手动安装Docker和Docker Compose
2. 配置环境变量
3. 上传项目文件
4. 构建和启动容器
5. 初始化数据库

**查看**: [腾讯云Docker部署指南.md](./腾讯云Docker部署指南.md)

---

## ✅ 部署前检查清单

### 腾讯云服务器

- [ ] 已购买云服务器（推荐：2核4GB，Ubuntu 20.04/22.04）
- [ ] 已分配公网IP
- [ ] 已设置root密码或SSH密钥
- [ ] 可以SSH连接到服务器

### 985Proxy配置

- [ ] 已有985Proxy账号
- [ ] 已获取API Key
- [ ] 已获取API Secret
- [ ] 账户有充足余额

### 本地准备

- [ ] 项目代码完整（在 `D:\Users\Desktop\proxyhub`）
- [ ] 已安装SSH客户端（Windows自带或PuTTY）
- [ ] 可选：已安装WinSCP（文件传输工具）

---

## 📦 部署后验证清单

### 服务运行状态

```bash
cd /opt/proxyhub
docker compose ps
```

**期望结果**:
- [ ] proxyhub-frontend - Up
- [ ] proxyhub-backend - Up (healthy)
- [ ] proxyhub-db - Up (healthy)
- [ ] proxyhub-redis - Up (healthy)

### 功能测试

- [ ] 前端可访问: `http://服务器IP:8080`
- [ ] 后端API可访问: `http://服务器IP:3000/api/v1`
- [ ] 管理员登录成功: `admin@example.com` / `admin123`
- [ ] 测试用户登录成功: `alice@test.com` / `password123`
- [ ] 可以访问静态住宅选购页面
- [ ] 库存信息正确加载
- [ ] 价格显示正确

### 985Proxy集成

- [ ] 后端日志显示985Proxy连接成功
- [ ] 库存数据从985Proxy API获取
- [ ] 可以成功购买IP
- [ ] 985Proxy余额正确扣费

---

## 🔧 关键配置文件

### 后端环境变量

**文件**: `/opt/proxyhub/backend/.env.production`

**必填项**:
```bash
DB_PASSWORD=你的数据库密码
REDIS_PASSWORD=你的Redis密码
JWT_SECRET=你的JWT密钥
PROXY985_API_KEY=你的985Proxy API Key
PROXY985_API_SECRET=你的985Proxy API Secret
```

### 前端环境变量

**文件**: `/opt/proxyhub/frontend/.env.production`

**必填项**:
```bash
VITE_API_BASE_URL=http://你的服务器IP:3000/api/v1
```

---

## 🌐 安全组配置

### 腾讯云控制台

**路径**: 云服务器 → 安全组 → 入站规则

**必须开放的端口**:

| 端口 | 协议 | 来源 | 说明 |
|------|------|------|------|
| 22 | TCP | 你的IP | SSH（建议限制来源IP） |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 3000 | TCP | 0.0.0.0/0 | Backend API |
| 8080 | TCP | 0.0.0.0/0 | Frontend |

**注意**: 生产环境建议通过Nginx反向代理，只开放80和443端口。

---

## 🚨 常见问题

### 1. 容器启动失败

**问题**: `docker compose up -d` 后容器状态为 Exit

**解决**:
```bash
# 查看详细日志
docker compose logs backend

# 常见原因：
# - 环境变量配置错误
# - 数据库连接失败
# - 端口被占用
```

### 2. 前端无法访问后端

**问题**: 前端页面加载正常，但无法调用API

**解决**:
1. 检查 `frontend/.env.production` 中的 `VITE_API_BASE_URL`
2. 确认后端容器正常运行
3. 重新构建前端: `docker compose build frontend && docker compose up -d frontend`

### 3. 985Proxy连接失败

**问题**: 库存为空或提示API错误

**解决**:
1. 检查 `backend/.env.production` 中的API密钥
2. 查看后端日志: `docker compose logs backend | grep 985`
3. 确认985Proxy账户状态正常

### 4. 数据库初始化失败

**问题**: 无法创建表或种子数据

**解决**:
```bash
# 手动运行迁移
docker compose exec backend npm run migration:run

# 手动运行种子数据
docker compose exec backend npm run seed

# 如果仍失败，检查数据库密码
docker compose exec db psql -U proxyhub -d proxyhub
```

---

## 📊 性能监控

### 查看资源使用

```bash
# 查看容器资源占用
docker stats

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 查看日志大小

```bash
# 查看Docker日志大小
docker compose exec backend du -sh /var/log

# 清理旧日志（谨慎操作）
docker compose down
docker system prune -a --volumes
```

---

## 🔄 更新部署

### 更新代码

```bash
cd /opt/proxyhub

# 如果使用Git
git pull

# 如果手动上传
# 1. 在本地修改代码
# 2. 重新打包上传
# 3. 解压覆盖

# 重新构建并启动
docker compose down
docker compose build
docker compose up -d
```

### 更新依赖

```bash
# 更新Node.js依赖
docker compose exec backend npm update
docker compose exec frontend npm update

# 重新构建
docker compose build
docker compose up -d
```

---

## 🔐 安全加固

### 1. 修改默认密码

```bash
# 登录后台修改管理员密码
# 或使用脚本
docker compose exec backend npm run change-password
```

### 2. 配置HTTPS

**参考**: [腾讯云Docker部署指南.md](./腾讯云Docker部署指南.md) → "配置域名和HTTPS"

### 3. 限制SSH访问

```bash
# 只允许密钥登录
nano /etc/ssh/sshd_config
# 设置: PasswordAuthentication no

# 重启SSH服务
systemctl restart sshd
```

### 4. 启用自动更新

```bash
# 安装自动更新
apt install -y unattended-upgrades

# 启用自动更新
dpkg-reconfigure -plow unattended-upgrades
```

---

## 💾 数据备份

### 自动备份脚本

```bash
# 创建备份脚本
cat > /opt/proxyhub/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/proxyhub/backups"
mkdir -p $BACKUP_DIR

# 备份数据库
docker compose exec -T db pg_dump -U proxyhub proxyhub > $BACKUP_DIR/db_$DATE.sql

# 备份环境变量
cp backend/.env.production $BACKUP_DIR/env_$DATE.backup

# 删除30天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "备份完成: $DATE"
EOF

chmod +x /opt/proxyhub/backup.sh

# 添加到crontab（每天凌晨2点备份）
echo "0 2 * * * /opt/proxyhub/backup.sh" | crontab -
```

---

## 📞 获取支持

### 查看文档

1. 完整部署指南: `docs-final-2025-11-06/腾讯云Docker部署指南.md`
2. 快速开始: `docs-final-2025-11-06/部署-快速开始.md`
3. 测试报告: `docs-final-2025-11-06/充值审核功能修复报告-2025-11-06.md`

### 查看日志

```bash
# 查看所有日志
docker compose logs -f

# 查看特定服务
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### 故障排查

参考 [腾讯云Docker部署指南.md](./腾讯云Docker部署指南.md) 中的"故障排查"章节

---

## 🎉 部署成功标志

当你看到以下情况时，说明部署成功：

✅ 所有4个容器都在运行且状态健康  
✅ 可以通过浏览器访问前端页面  
✅ 可以成功登录管理员和测试账号  
✅ 静态住宅选购页面正常显示库存和价格  
✅ 可以完成IP购买流程  
✅ 985Proxy余额正确扣费  
✅ 后端日志没有错误信息  

**恭喜！ProxyHub已成功部署到腾讯云！** 🎊

---

## 📋 下一步行动

### 立即执行

1. 修改管理员密码
2. 配置生产环境邮箱
3. 测试完整购买流程
4. 设置数据库备份计划

### 可选优化

1. 配置域名和SSL证书
2. 配置CDN加速
3. 设置监控告警
4. 优化数据库性能
5. 配置Redis持久化

---

**祝您使用愉快！** 🚀

