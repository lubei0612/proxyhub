# ProxyHub 安全配置指南

## 🔐 安全配置概述

本指南涵盖生产环境的安全最佳实践。

---

## 1. 密码和密钥管理

### 数据库密码
**要求：**
- 最少32个字符
- 包含大小写字母、数字和特殊字符
- 使用随机生成，避免使用常见词汇

**生成方法：**
```bash
# 生成32位安全密码
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
```

**轮换策略：**
- 每季度更换一次
- 泄露后立即更换
- 记录在安全的密码管理器中

### JWT密钥
**要求：**
- 最少48字节
- Base64编码
- 绝不提交到Git

**生成方法：**
```bash
# 生成48字节JWT密钥
openssl rand -base64 48
```

**轮换策略：**
- 每年更换一次
- 怀疑泄露时立即更换

### 管理员密码
**要求：**
- 最少8个字符
- 包含大写字母、小写字母、数字
- 不使用常见弱密码

**首次登录后立即修改：**
1. 登录系统
2. 进入"我的账户"
3. 修改密码
4. 启用两步验证（如有）

---

## 2. 环境变量安全

### .env文件保护
```bash
# 设置正确权限
chmod 600 .env
chown root:root .env

# 确保在.gitignore中
echo ".env" >> .gitignore
```

### 敏感信息检查清单
- [ ] 数据库密码
- [ ] JWT密钥
- [ ] API密钥 (985Proxy)
- [ ] 邮箱密码
- [ ] Telegram Bot Token

**永远不要：**
- ❌ 提交`.env`到Git
- ❌ 在日志中输出敏感信息
- ❌ 在代码中硬编码密钥
- ❌ 通过HTTP传输敏感数据

---

## 3. 网络安全

### 防火墙配置
```bash
# 安装UFW
sudo apt install ufw

# 允许SSH (先添加，避免锁定)
sudo ufw allow 22/tcp

# 允许HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 如果需要直接访问API
sudo ufw allow 3000/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### SSL/TLS配置

#### 使用Let's Encrypt (推荐)
```bash
# 安装Certbot
sudo apt install certbot nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo systemctl enable certbot.timer
```

#### Nginx配置示例
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # 强制使用TLS 1.2+
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### CORS配置
在`.env`中配置允许的源：
```env
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

---

## 4. 访问控制

### SSH密钥登录
```bash
# 生成SSH密钥对
ssh-keygen -t ed25519 -C "your_email@example.com"

# 复制公钥到服务器
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@server-ip

# 禁用密码登录
sudo nano /etc/ssh/sshd_config
# 设置: PasswordAuthentication no
sudo systemctl restart sshd
```

### 数据库访问限制
```yaml
# docker-compose.yml
postgres:
  ports:
    - "127.0.0.1:5432:5432"  # 只允许本地访问
```

### Redis访问限制
```yaml
# docker-compose.yml
redis:
  ports:
    - "127.0.0.1:6379:6379"  # 只允许本地访问
```

---

## 5. 日志和监控

### 日志管理
```bash
# 配置日志轮转
sudo nano /etc/logrotate.d/proxyhub
```

```
/var/log/proxyhub/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}
```

### 敏感信息过滤
后端已实现日志过滤器，自动脱敏：
- 密码字段
- JWT Token
- API密钥
- 邮箱密码

### 监控告警
建议配置：
- 磁盘空间监控 (< 20% 告警)
- CPU使用率监控 (> 80% 告警)
- 内存使用率监控 (> 85% 告警)
- 异常登录监控
- 数据库连接数监控

---

## 6. 数据库安全

### 备份加密
```bash
# 加密备份
gpg --symmetric --cipher-algo AES256 backup.sql.gz

# 解密备份
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```

### 异地备份
```bash
# 使用rsync同步到远程服务器
rsync -avz --delete /var/backups/proxyhub/ user@backup-server:/backups/proxyhub/

# 或上传到云存储 (AWS S3示例)
aws s3 sync /var/backups/proxyhub/ s3://your-bucket/proxyhub-backups/
```

### 定期备份测试
每月至少测试一次恢复流程：
```bash
# 恢复到测试环境
bash scripts/restore-db.sh /var/backups/proxyhub/latest.sql.gz
```

---

## 7. 应用层安全

### API速率限制
已配置 (可在`.env`中调整)：
- 登录: 5次/15分钟
- 注册: 10次/60分钟
- 验证码: 3次/60分钟
- 全局: 100次/60秒

### 输入验证
已实现：
- ✅ 邮箱格式验证
- ✅ 密码强度验证
- ✅ 输入长度限制
- ✅ SQL注入防护
- ✅ XSS防护

### 安全响应头
已配置 (helmet中间件)：
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- `Content-Security-Policy`

---

## 8. 依赖项安全

### 定期更新
```bash
# 检查过期依赖
cd backend && npm outdated
cd frontend && npm outdated

# 更新依赖
npm update

# 审计安全漏洞
npm audit
npm audit fix
```

### 自动化扫描
配置GitHub Dependabot：
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
```

---

## 9. Docker安全

### 镜像扫描
```bash
# 使用Trivy扫描镜像
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image proxyhub-backend:latest
```

### 最小权限原则
```dockerfile
# Dockerfile中使用非root用户
USER node
```

### 定期清理
```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的卷
docker volume prune
```

---

## 10. 应急响应

### 安全事件处理流程
1. **检测**: 发现异常登录、数据泄露等
2. **隔离**: 立即停止相关服务
3. **评估**: 确定影响范围
4. **修复**: 修补漏洞
5. **恢复**: 从备份恢复数据
6. **审查**: 事后分析和改进

### 密钥泄露应对
```bash
# 1. 立即更换所有密钥
openssl rand -base64 48 > new_jwt_secret.txt
openssl rand -base64 32 > new_db_password.txt

# 2. 更新.env
nano .env

# 3. 重启所有服务
docker-compose down
docker-compose up -d

# 4. 通知所有用户
```

### 备份应对计划
- 每日备份: 恢复到昨天
- 每周备份: 恢复到上周
- 每月备份: 恢复到上月
- 异地备份: 灾难恢复

---

## 📋 安全检查清单

部署后定期检查：

### 每月
- [ ] 检查系统更新
- [ ] 检查依赖项漏洞
- [ ] 测试备份恢复
- [ ] 审查访问日志
- [ ] 检查防火墙规则

### 每季度
- [ ] 轮换数据库密码
- [ ] 审计用户权限
- [ ] 安全渗透测试
- [ ] 审查日志策略
- [ ] 更新安全文档

### 每年
- [ ] 轮换JWT密钥
- [ ] 全面安全审计
- [ ] 更新应急预案
- [ ] 安全培训

---

## 📞 安全问题报告

发现安全漏洞？请通过以下方式报告：
- 邮件: security@example.com (请不要公开披露)
- GitHub Security Advisory (私密)

我们承诺在24小时内响应安全问题。

---

**记住：安全是一个持续的过程，不是一次性的任务！** 🔐

