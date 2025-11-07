# ProxyHub 项目开发指南

> **AI开发助手必读文档** - 保持项目一致性和开发规范

**最后更新**: 2025-11-06  
**项目负责人**: lubei0612  
**项目状态**: 🚀 生产部署中

---

## 🎯 项目核心目标

### 业务定位
ProxyHub是一个**智能代理IP管理平台**，集成985Proxy服务，为用户提供：
- 静态住宅代理IP购买与管理
- 动态住宅代理通道管理  
- 完整的账单和订单系统
- 实时流量统计分析

### 技术愿景
- ✅ **真实数据驱动** - 所有数据必须来自985Proxy API或数据库，**禁止使用模拟数据**
- ✅ **数据一致性** - 前端显示与985Proxy平台完全一致
- ✅ **可靠集成** - 稳定对接985Proxy API，确保购买、续费流程准确无误
- ✅ **清晰架构** - 代码结构清晰，易于维护和扩展

---

## 📐 核心开发原则

### 1. 数据真实性原则 ⭐⭐⭐

**绝对禁止**：
- ❌ 使用硬编码的模拟数据
- ❌ 使用随机生成的假数据
- ❌ 前端写死的测试数据

**必须遵守**：
- ✅ 所有IP数据必须从985Proxy API获取
- ✅ 所有价格必须从数据库price_configs表读取
- ✅ 所有订单、交易记录必须从数据库查询
- ✅ 所有流量数据必须从traffic_records表统计

**示例**：
```typescript
// ❌ 错误 - 硬编码模拟数据
const mockIPs = [
  { ip: '123.45.67.89', country: 'US' }
];

// ✅ 正确 - 从985Proxy API获取
const ips = await proxy985Service.getMyIPs();
```

### 2. 数据一致性原则

**用户在ProxyHub看到的数据必须与985Proxy平台一致**：

- IP地址、到期时间、国家城市 → 必须一致
- 订单状态、扣费金额 → 必须一致  
- 库存数量、可用区域 → 必须一致

**检查方法**：
```bash
# 用户测试流程
1. 在ProxyHub购买IP
2. 登录985Proxy官网查看
3. 对比：IP地址、到期时间、价格是否一致
4. 如果不一致 → 立即修复
```

### 3. API集成原则

**与985Proxy API交互必须**：
- ✅ 处理所有错误情况（网络超时、API返回错误）
- ✅ 正确解析API响应格式
- ✅ 记录关键API调用日志
- ✅ 验证API返回数据的完整性

**985Proxy API配置**：
```env
PROXY_985_API_KEY=ne_hj06qomI...  # API密钥
PROXY_985_ZONE=6jd4ftbl7kv3       # Zone ID
PROXY_985_BASE_URL=https://open-api.985proxy.com
```

**已集成的API**：
- ✅ `getInventory` - 查询IP库存
- ✅ `getMyIPs` - 查询我的IP列表
- ✅ `renewIP` - IP续费
- ✅ `checkOrderStatus` - 订单状态查询
- ✅ `purchaseStaticProxy` - 购买静态IP

---

## 🏗️ 项目架构

### 技术栈

**后端**：
- NestJS 10.x - 企业级Node.js框架
- TypeORM - ORM框架
- PostgreSQL 14+ - 主数据库
- Redis - 缓存（可选）

**前端**：
- Vue 3 + TypeScript - 组合式API
- Element Plus - UI组件库
- Pinia - 状态管理
- Vue Router 4 - 路由
- ECharts - 数据可视化

**部署**：
- Docker + Docker Compose
- 腾讯云服务器
- Nginx反向代理

### 核心模块

```
backend/src/modules/
├── auth/           # 用户认证（JWT）
├── user/           # 用户管理
├── proxy/          # 代理管理（静态/动态）
├── proxy985/       # 985Proxy API集成 ⭐
├── order/          # 订单管理
├── billing/        # 账单、充值
├── pricing/        # 价格配置、价格覆盖
├── dashboard/      # 用户仪表盘
├── admin/          # 管理后台
├── traffic/        # 流量统计 ⭐
├── event-log/      # 事件日志
└── notification/   # 通知系统
```

### 数据库表

**核心表**：
- `users` - 用户信息
- `static_proxies` - 静态IP记录
- `orders` - 订单记录
- `transactions` - 交易记录
- `price_configs` - 价格配置
- `price_overrides` - 价格覆盖（管理员自定义价格）
- `traffic_records` - 流量记录 ⭐
- `recharge_orders` - 充值订单
- `event_logs` - 操作日志

---

## 💻 开发习惯与规范

### 代码风格

1. **TypeScript严格模式**
   - 所有变量必须有明确类型
   - 禁止使用`any`（特殊情况除外）
   - 使用接口定义数据结构

2. **命名规范**
   - 文件名：kebab-case（如：`user-service.ts`）
   - 类名：PascalCase（如：`UserService`）
   - 变量/函数：camelCase（如：`getUserInfo`）
   - 常量：UPPER_SNAKE_CASE（如：`API_BASE_URL`）

3. **注释规范**
   ```typescript
   /**
    * 获取用户IP列表（从985Proxy API）
    * @param userId 用户ID
    * @returns IP列表数组
    */
   async getMyIPs(userId: number): Promise<StaticProxy[]> {
     // 实现逻辑...
   }
   ```

### 性能与算法优化 ⭐

#### 1. 全局视角开发

**在开始任何功能开发前，必须考虑**：
- 📊 **数据规模**: 预估数据量（100条？10000条？100万条？）
- 🔄 **并发场景**: 多少用户同时使用？
- ⚡ **响应时间**: 用户能接受的最长等待时间
- 💾 **资源消耗**: CPU、内存、数据库连接

**示例思考流程**：
```
功能: 用户IP列表查询
↓
数据规模: 每个用户最多500个IP
↓
并发: 100个用户同时查询
↓
优化: 
  - 添加数据库索引 (user_id)
  - 分页查询 (limit 20, offset 0)
  - 缓存热点数据 (Redis, TTL 5分钟)
```

#### 2. 最优算法选择

**查询优化**：
```typescript
// ❌ 差：N+1查询问题
async getUsersWithIPs() {
  const users = await this.userRepo.find();
  for (const user of users) {
    user.ips = await this.ipRepo.find({ userId: user.id }); // N次查询！
  }
  return users;
}

// ✅ 优：使用JOIN或预加载
async getUsersWithIPs() {
  return this.userRepo.find({
    relations: ['staticProxies'], // 1次查询
    take: 20 // 分页
  });
}
```

**循环优化**：
```typescript
// ❌ 差：嵌套循环 O(n²)
for (const ip of ips) {
  for (const config of priceConfigs) {
    if (ip.country === config.country) { /* 处理 */ }
  }
}

// ✅ 优：使用Map O(n)
const configMap = new Map(priceConfigs.map(c => [c.country, c]));
for (const ip of ips) {
  const config = configMap.get(ip.country); // O(1)查找
  if (config) { /* 处理 */ }
}
```

**数据处理优化**：
```typescript
// ❌ 差：多次遍历
const activeIPs = ips.filter(ip => ip.status === 'active');
const sortedIPs = activeIPs.sort((a, b) => a.expiresAt - b.expiresAt);
const ipAddresses = sortedIPs.map(ip => ip.ipAddress);

// ✅ 优：一次遍历
const ipAddresses = ips
  .filter(ip => ip.status === 'active')
  .sort((a, b) => a.expiresAt - b.expiresAt)
  .map(ip => ip.ipAddress);
```

#### 3. 数据库优化原则

**必须添加索引的字段**：
- WHERE条件字段: `user_id`, `status`, `email`
- JOIN关联字段: `order_id`, `proxy_id`
- 排序字段: `created_at`, `expires_at`

**查询优化检查清单**：
- [ ] 使用`EXPLAIN`分析查询计划
- [ ] 避免`SELECT *`，只查询需要的字段
- [ ] 使用分页（LIMIT + OFFSET）
- [ ] 批量操作代替循环插入/更新
- [ ] 使用缓存减少数据库压力

**示例**：
```typescript
// ❌ 差：循环插入
for (const ip of newIPs) {
  await this.ipRepo.save(ip); // N次数据库调用
}

// ✅ 优：批量插入
await this.ipRepo.save(newIPs); // 1次数据库调用
```

#### 4. 前端性能优化

**列表渲染优化**：
```vue
<!-- ❌ 差：未使用虚拟滚动 -->
<div v-for="ip in allIPs" :key="ip.id">
  {{ ip.address }}
</div>

<!-- ✅ 优：使用虚拟滚动（Element Plus） -->
<el-table-v2
  :data="allIPs"
  :columns="columns"
  height="500"
  virtual
/>
```

**数据加载优化**：
```typescript
// ❌ 差：一次加载所有数据
const allOrders = await getOrders(); // 可能上千条

// ✅ 优：分页加载
const orders = await getOrders({ page: 1, pageSize: 20 });

// ✅ 更优：无限滚动+虚拟列表
const loadMore = async () => {
  const newData = await getOrders({ page: currentPage++, pageSize: 20 });
  orders.value.push(...newData);
};
```

#### 5. API调用优化

**并发请求优化**：
```typescript
// ❌ 差：串行请求
const user = await getUserInfo();
const orders = await getOrders();
const ips = await getIPs();
// 总时间 = 300ms + 200ms + 150ms = 650ms

// ✅ 优：并行请求
const [user, orders, ips] = await Promise.all([
  getUserInfo(),
  getOrders(),
  getIPs()
]);
// 总时间 = max(300ms, 200ms, 150ms) = 300ms
```

**缓存策略**：
```typescript
// ✅ 实现简单缓存
class CachedAPI {
  private cache = new Map<string, { data: any; expireAt: number }>();

  async get(url: string, ttl = 5 * 60 * 1000) {
    const cached = this.cache.get(url);
    if (cached && cached.expireAt > Date.now()) {
      return cached.data; // 返回缓存
    }

    const data = await fetch(url).then(r => r.json());
    this.cache.set(url, {
      data,
      expireAt: Date.now() + ttl
    });
    return data;
  }
}
```

#### 6. 代码审查清单

**每次提交前检查**：
- [ ] 是否有N+1查询问题？
- [ ] 是否有嵌套循环？
- [ ] 大数据量是否分页？
- [ ] 是否添加了必要的索引？
- [ ] 是否使用了缓存？
- [ ] API调用是否可以并行？
- [ ] 是否避免了重复计算？

**性能目标**：
- 🎯 API响应时间 < 200ms (P95)
- 🎯 页面加载时间 < 2s
- 🎯 数据库查询 < 100ms
- 🎯 并发支持 ≥ 100 用户

### Git提交规范

使用Conventional Commits：

```bash
# 功能开发
git commit -m "feat: add IP renewal reminder notification"

# Bug修复
git commit -m "fix: correct price calculation for native IPs"

# 重构
git commit -m "refactor: reorganize project structure"

# 文档
git commit -m "docs: update deployment guide"

# 样式
git commit -m "style: format code with prettier"
```

### 开发流程

1. **开始开发**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **本地测试**
   ```bash
   # 后端
   cd backend && npm run start:dev
   
   # 前端
   cd frontend && npm run dev
   ```

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: implement new feature"
   git push origin feature/new-feature
   ```

4. **合并到主分支**
   ```bash
   git checkout master
   git merge feature/new-feature
   git push origin master
   ```

---

## 🐛 问题排查方法

### 数据不一致问题

**症状**：ProxyHub显示的IP与985Proxy不一致

**排查步骤**：
1. 检查API调用日志
   ```bash
   docker logs proxyhub-backend | grep "985"
   ```

2. 验证API响应
   ```typescript
   // 在service中添加日志
   const response = await this.proxy985Service.getMyIPs();
   console.log('985Proxy API Response:', JSON.stringify(response));
   ```

3. 检查数据转换逻辑
   - 确认字段映射正确
   - 验证时间格式转换
   - 检查状态码映射

4. 对比数据库记录
   ```sql
   SELECT * FROM static_proxies WHERE user_id = ?;
   ```

### API集成问题

**症状**：985Proxy API调用失败

**排查步骤**：
1. 验证API配置
   ```bash
   docker exec proxyhub-backend env | grep PROXY_985
   ```

2. 测试API连通性
   ```bash
   curl -X GET "https://open-api.985proxy.com/api/v1/inventory" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

3. 检查API密钥是否过期

4. 查看985Proxy官方文档更新

---

## 📊 当前已知问题

### ⚠️ 需要立即修复

1. **IP数据不一致** - 用户购买IP后，ProxyHub显示的IP与985Proxy不一致
   - **优先级**: P0
   - **影响**: 用户无法正确使用购买的IP
   - **修复计划**: 清理所有模拟数据，重新测试985Proxy集成

2. **邮件验证功能** - 注册时无法收到验证码邮件
   - **优先级**: P1
   - **影响**: 新用户无法注册
   - **临时方案**: 手动激活用户账号
   - **长期方案**: 接入SendGrid或阿里云邮件推送

### ✅ 已修复的问题

- ✅ 前端白屏 - Vite构建配置优化
- ✅ 环境变量加载失败 - 修改docker-entrypoint.sh
- ✅ 价格区分不正确 - 修复ipType参数映射
- ✅ 管理后台统计错误 - 修复数据查询逻辑

---

## 🚀 部署说明

### 生产环境

**腾讯云服务器**：43.130.35.117

**部署命令**：
```bash
cd /opt/proxyhub
git pull origin master
docker compose -f docker-compose.cn.yml down
docker compose -f docker-compose.cn.yml build --no-cache
docker compose -f docker-compose.cn.yml up -d
```

**验证部署**：
```bash
# 检查容器状态
docker compose -f docker-compose.cn.yml ps

# 查看日志
docker compose -f docker-compose.cn.yml logs -f backend
```

### 环境变量

**关键配置**（已嵌入到Docker镜像）：
- 数据库：`backend/env.production.template`
- 985Proxy：API Key、Zone ID
- 邮件：Gmail SMTP配置

---

## 📚 重要文档

### 部署文档
- [腾讯云最终部署指南](docs-organized/deployment/腾讯云-最终部署指南.md)
- [Docker环境变量配置](docs-organized/deployment/DEPLOY-WITH-ENV-TEMPLATE.md)

### 问题排查
- [白屏问题修复](docs-organized/troubleshooting/QUICK-FIX-WHITSCREEN.md)
- [环境变量加载修复](docs-organized/troubleshooting/DOCKER-ENV-LOADING-FIX.md)

### 历史文档
- [项目进度报告](docs-organized/archive/)
- [功能完成总结](docs-organized/archive/)

---

## 🤝 协作约定

### AI助手注意事项

**在开始任何开发任务前，必须：**

1. ✅ 阅读本文档（PROJECT-GUIDE.md）
2. ✅ 确认开发目标是否符合项目方向
3. ✅ 检查是否会引入模拟数据
4. ✅ 验证数据来源是否真实

**开发过程中：**

1. ✅ 优先使用现有的API和服务
2. ✅ 添加必要的错误处理和日志
3. ✅ 更新相关文档
4. ✅ 提交代码前进行完整测试

**提交代码后：**

1. ✅ 更新PROJECT-GUIDE.md（如有架构变更）
2. ✅ 记录已知问题和修复方案
3. ✅ 通知用户重要变更

---

## 📞 联系方式

- **GitHub**: https://github.com/lubei0612/proxyhub
- **Issues**: https://github.com/lubei0612/proxyhub/issues
- **项目负责人**: lubei0612

---

## 🔄 文档更新日志

| 日期 | 更新内容 | 更新人 |
|------|---------|--------|
| 2025-11-06 | 初始创建项目开发指南 | AI Assistant |
| 2025-11-06 | 添加数据一致性原则和已知问题 | AI Assistant |

---

**本文档是项目的核心指导文件，请AI助手在每次开发前仔细阅读，确保遵守所有开发原则！**

---

## 💡 快速参考

**常用命令**：
```bash
# 本地开发
cd backend && npm run start:dev
cd frontend && npm run dev

# 生产部署
cd /opt/proxyhub
docker compose -f docker-compose.cn.yml up -d --build

# 查看日志
docker compose -f docker-compose.cn.yml logs -f backend

# 数据库操作
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub
```

**默认账号**：
- 管理员：`admin@example.com` / `admin123`
- 测试用户：`alice@test.com` / `password123`

**服务地址**：
- 生产环境：http://43.130.35.117
- 本地前端：http://localhost:8080
- 本地后端：http://localhost:3000
- API文档：http://localhost:3000/api

