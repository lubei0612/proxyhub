# 🔧 ProxyHub 快速修复指南

## 当前问题汇总

1. ✅ **仪表盘卡片渲染** - 已修复
2. ❌ **专线代理菜单结构** - Docker缓存问题
3. ❌ **985Proxy API配置** - API KEY无效

---

## 🚀 一键修复步骤

### 步骤1: 更新985Proxy API配置

编辑 `.env` 文件，更新以下配置：

```bash
PROXY_985_API_KEY=你的实际API_KEY
PROXY_985_ZONE=你的实际ZONE标识
PROXY_985_API_URL=https://open-api.985proxy.com
```

**从截图中您之前提供的配置应该是正确的。**

### 步骤2: 完全清理并重建

```powershell
# 停止所有服务
docker compose down -v

# 删除所有相关镜像
docker rmi proxyhub-frontend proxyhub-backend -f

# 清理Docker构建缓存
docker builder prune -af

# 重新构建（无缓存）
docker compose build --no-cache

# 启动服务
docker compose up -d

# 等待服务启动（约30秒）
Start-Sleep -Seconds 30

# 查看服务状态
docker compose ps
```

### 步骤3: 验证修复

1. 打开浏览器：http://localhost
2. 使用 `Ctrl+Shift+R` 强制刷新
3. 检查：
   - ✅ 仪表盘4个卡片是否显示数字
   - ✅ 专线代理是否是独立菜单（不在静态住宅下面）
   - ✅ 静态住宅选购页面是否能加载国家列表

---

## 🔍 如果还有问题

### 问题A: 985Proxy API还是报错

**检查：**
```powershell
docker compose logs backend | Select-String "985Proxy"
```

**解决：**
1. 确认API KEY是否正确
2. 确认网络可以访问 open-api.985proxy.com
3. 重启backend: `docker compose restart backend`

### 问题B: 专线代理还在静态住宅下面

**检查前端代码：**
```powershell
Get-Content frontend\src\layouts\DashboardLayout.vue | Select-String -Context 2,2 "专线代理"
```

应该看到专线代理在 `</el-sub-menu>` 之后，不在sub-menu里面。

**如果代码正确但显示错误：**
1. 清除浏览器缓存
2. 删除frontend镜像重建：
   ```powershell
   docker compose stop frontend
   docker rmi proxyhub-frontend -f
   docker compose build --no-cache frontend
   docker compose up -d frontend
   ```

### 问题C: 仪表盘卡片空白

**原因：** 数据库没有数据

**解决：** 这是正常的，因为是新系统。购买代理后会显示数据。

---

## 📞 当前登录信息

**管理员账号：**
- 邮箱：`admin@example.com`
- 密码：`test123456`

**测试用户：**
- 需要您自己创建（通过管理后台 → 用户管理 → 添加用户）

---

## ✅ 修复完成后的测试清单

- [ ] 登录成功
- [ ] 仪表盘显示4个统计卡片
- [ ] 专线代理是独立顶级菜单
- [ ] 静态住宅展开只有2个子项（管理、选购）
- [ ] 静态住宅选购页面能加载国家列表
- [ ] 业务场景下拉框能加载场景列表
- [ ] 管理后台 → 用户管理 → 价格覆盖按钮存在

---

**创建时间：** 2025-11-10 12:40
**状态：** 🔄 进行中



