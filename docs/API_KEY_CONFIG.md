# 985Proxy API Key 配置

## 您的API Key
```
ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
```

## 配置步骤

### 1. 后端配置
创建 `backend/.env` 文件（从 `backend/.env.example` 复制）：

```bash
# 在 backend 目录下
cp .env.example .env
```

然后编辑 `backend/.env`，将 `PROXY_985_API_KEY` 设置为：
```env
PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
```

### 2. 前端配置
创建 `frontend/.env` 文件（从 `frontend/.env.example` 复制）：

```bash
# 在 frontend 目录下
cp .env.example .env
```

### 3. Docker配置
如果使用Docker部署，在 `docker-compose.yml` 中添加环境变量：

```yaml
backend:
  environment:
    - PROXY_985_API_KEY=ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==
```

## 测试API连接

启动后端服务后，可以通过以下方式测试API连接：

```bash
# 测试获取库存
curl http://localhost:3000/api/v1/proxy985/inventory?type=shared
```

## 注意事项

⚠️ **安全提醒**：
- 不要将API Key提交到Git仓库
- `.env` 文件已在 `.gitignore` 中
- 生产环境使用环境变量或密钥管理服务

