# ProxyHub 测试指南

## 🎯 已完成的工作

### 1. ✅ 创建了启动脚本

**文件位置**:
- `启动ProxyHub测试服务.bat` - 一键启动前后端服务
- `停止ProxyHub服务.bat` - 停止所有服务

**使用方法**:
```
双击运行"启动ProxyHub测试服务.bat"
等待15秒服务启动完成
浏览器会自动打开 http://localhost:8080
```

### 2. ✅ 创建了完整的测试方案

**测试文档**:
1. **快速测试**（30分钟）: `docs/快速API测试指南.md`
2. **详细测试**（2小时）: `docs/spec-workflow/全面API路由测试/测试执行指南.md`
3. **需求文档**: `docs/spec-workflow/全面API路由测试/requirements.md`

### 3. ✅ 测试覆盖范围

**用户端API** (9个核心API):
- ✅ 登录认证
- ✅ 价格计算（普通IP + 原生IP）
- ✅ 代理购买
- ✅ 代理列表查询
- ✅ 订单查询
- ✅ 交易明细
- ✅ 充值申请

**管理端API** (7个核心API):
- ✅ 管理员登录
- ✅ 所有订单查询
- ✅ 充值审核
- ✅ 用户管理
- ✅ 价格配置
- ✅ 价格覆盖管理
- ✅ IP池查询

**数据流验证** (3个场景):
- ✅ 用户购买 → 管理员可见
- ✅ 管理员批准充值 → 用户余额更新
- ✅ 管理员修改价格 → 用户看到新价格

---

## 🚀 快速开始测试

### Step 1: 启动服务

**方法A: 使用bat脚本（推荐）**
```
1. 双击"启动ProxyHub测试服务.bat"
2. 等待两个命令窗口打开（Backend 和 Frontend）
3. 等待约15秒
4. 浏览器会自动打开
```

**方法B: 手动启动**
```bash
# 终端1 - 后端
cd backend
npm run start:dev

# 终端2 - 前端
cd frontend
npm run dev
```

### Step 2: 打开测试指南

```
打开文件: docs/快速API测试指南.md
```

### Step 3: 打开Chrome DevTools

```
浏览器按F12打开
切换到Network标签
```

### Step 4: 按照测试指南操作

测试流程（30-45分钟）:

1. **用户登录** (2分钟)
   - user@example.com / user123
   - 验证API: POST /api/v1/auth/login

2. **购买普通IP** (5分钟)
   - 日本Tokyo, 数量1, 30天
   - 验证API: POST /api/v1/price/calculate
   - 验证价格: $10/月
   - 验证API: POST /api/v1/proxy/static/purchase

3. **购买原生IP** (5分钟)
   - 美国LA, 数量1, 30天
   - 验证API: POST /api/v1/price/calculate (不再404!)
   - 验证价格: $10/月

4. **充值申请** (3分钟)
   - 金额: $100
   - 验证API: POST /api/v1/billing/recharge

5. **管理员登录** (2分钟)
   - admin@example.com / admin123
   - 验证API: POST /api/v1/auth/admin-login

6. **查看用户订单** (3分钟)
   - 验证API: GET /api/v1/orders/admin/all
   - **关键**: 能看到用户的订单

7. **充值审核** (3分钟)
   - 验证API: GET /api/v1/billing/admin/recharges
   - 批准充值
   - 验证API: PUT /api/v1/billing/recharge/1/approve

8. **价格管理** (5分钟)
   - 验证API: GET /api/v1/price/ip-pool
   - 修改韩国Seoul价格为$15
   - 验证API: POST /api/v1/price/overrides/batch

9. **数据流验证** (10分钟)
   - 切换回用户，查看余额（应增加$100）
   - 查看韩国Seoul价格（应显示$15）
   - 验证所有数据同步

---

## ✅ 验收标准

### 所有测试通过，如果:

**API请求**:
- [ ] 所有请求返回200/201（不是404/500）
- [ ] 请求参数格式正确
- [ ] 响应数据格式正确

**前后端对接**:
- [ ] 前端发送的数据能到达后端
- [ ] 后端返回的数据前端能正确解析
- [ ] 所有路由配置正确

**数据流畅通**:
- [ ] 用户购买的订单管理员可见
- [ ] 管理员批准充值后用户余额更新
- [ ] 管理员修改价格后用户看到新价格
- [ ] 所有页面数据一致

---

## 📝 测试报告模板

测试完成后，记录结果:

```
测试日期: 2025-11-04
测试人员: ___________

===== 用户端API测试 =====
✅ POST /api/v1/auth/login               - 登录
✅ POST /api/v1/price/calculate          - 价格计算（普通）
[ ] POST /api/v1/price/calculate          - 价格计算（原生）
[ ] POST /api/v1/proxy/static/purchase    - 购买代理
[ ] GET  /api/v1/proxy/static/list        - 代理列表
[ ] GET  /api/v1/orders                   - 订单列表
[ ] GET  /api/v1/billing/transactions     - 交易明细
[ ] POST /api/v1/billing/recharge         - 充值申请
[ ] GET  /api/v1/users/profile            - 用户信息

===== 管理端API测试 =====
[ ] POST /api/v1/auth/admin-login         - 管理员登录
[ ] GET  /api/v1/orders/admin/all         - 所有订单
[ ] GET  /api/v1/billing/admin/recharges  - 充值审核列表
[ ] PUT  /api/v1/billing/recharge/:id/approve - 批准充值
[ ] GET  /api/v1/price/ip-pool            - IP池列表
[ ] POST /api/v1/price/overrides/batch    - 批量价格覆盖
[ ] GET  /api/v1/admin/users              - 用户列表

===== 数据流验证 =====
[ ] 用户购买 → 管理员可见订单
[ ] 管理员批准充值 → 用户余额更新
[ ] 管理员修改价格 → 用户看到新价格

总通过率: ___/19 = ___%
```

---

## 🐛 常见问题

### Q1: 3000端口被占用
```
运行"停止ProxyHub服务.bat"
或手动: taskkill /F /IM node.exe
```

### Q2: 前端白屏
```
检查后端服务是否启动
检查Console是否有错误
```

### Q3: API返回404
```
检查后端路由是否注册
查看后端日志
检查前端API路径
```

### Q4: Chrome DevTools连接失败
```
刷新页面
重新打开DevTools (F12)
```

---

## 📚 相关文档

### 测试文档
1. `docs/快速API测试指南.md` - 30分钟快速测试
2. `docs/spec-workflow/全面API路由测试/测试执行指南.md` - 2小时完整测试
3. `docs/spec-workflow/全面API路由测试/requirements.md` - 测试需求

### 功能文档
4. `docs/用户端价格API集成-执行总结.md` - 价格API集成总结
5. `docs/价格API集成-任务完成总结.md` - 任务完成总结

### 启动脚本
6. `启动ProxyHub测试服务.bat` - 启动服务
7. `停止ProxyHub服务.bat` - 停止服务

---

## 🎯 下一步

1. **运行快速测试** (30分钟)
   ```
   使用"启动ProxyHub测试服务.bat"启动
   按照"docs/快速API测试指南.md"测试
   记录结果
   ```

2. **如果发现问题**
   ```
   记录到问题列表
   查看Console和Network详细信息
   截图保存
   ```

3. **测试通过后**
   ```
   可以进行部署
   或执行更详细的测试
   ```

---

**创建时间**: 2025-11-04  
**状态**: 已完成，等待执行测试


