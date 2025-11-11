# ProxyHub 快速开始

## 🚀 5分钟快速部署

### 方式一：一键部署 (推荐)

```bash
# SSH登录服务器
ssh root@your-server-ip

# 执行一键部署
bash <(curl -s https://raw.githubusercontent.com/lubei0612/proxyhub/master/scripts/deploy-production.sh)

# 根据提示填入配置信息
```

**就这么简单！** 🎉

部署完成后，脚本会输出访问地址和管理员账号密码。

---

### 方式二：手动部署

```bash
# 1. 克隆项目
git clone -b master https://github.com/lubei0612/proxyhub.git
cd proxyhub

# 2. 配置环境变量
cp env.example .env
nano .env  # 填入您的配置

# 3. 启动服务
docker-compose up -d

# 4. 创建管理员
bash scripts/create-admin.sh
```

---

## 📝 必填配置

编辑 `.env` 文件，填入以下必填项：

```env
# 985Proxy API
PROXY_985_API_KEY=your_api_key_here
PROXY_985_ZONE=your_zone_id_here

# 邮箱SMTP
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_email_password
```

其他配置使用默认值即可。

---

## ✅ 验证部署

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend

# 访问前端
curl http://localhost
```

---

## 🔐 首次登录

1. 打开浏览器访问: `http://your-server-ip`
2. 使用部署时输出的管理员账号登录
3. 立即修改管理员密码

---

## 📚 下一步

- [完整部署文档](./PRODUCTION-DEPLOYMENT.md)
- [安全配置指南](./SECURITY-GUIDE.md)
- [常见问题](../FAQ.md)

---

## 💡 提示

- 生产环境建议配置SSL证书
- 定期查看备份是否正常
- 配置监控和告警

需要帮助？查看 [故障排除指南](../troubleshooting/)

