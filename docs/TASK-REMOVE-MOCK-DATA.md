# 🎯 清除所有硬编码和模拟数据 - 任务清单

**创建日期**: 2025-11-06  
**优先级**: P0 - 最高优先级  
**目标**: 删除所有硬编码、模拟数据、假数据，确保100%使用真实数据

---

## 📋 任务概述

**问题**：
- 用户购买IP后，ProxyHub显示的IP与985Proxy平台不一致
- 系统中存在硬编码和模拟数据
- 影响用户体验和数据准确性

**解决方案**：
- 逐个检查所有文件，删除模拟数据
- 确保所有数据来自985Proxy API或数据库
- 建立数据一致性验证机制

---

## 🔍 检查清单

### 阶段1：后端代码检查

#### 1.1 Service层 (backend/src/modules/)

**文件列表**：
- [ ] `proxy985/proxy985.service.ts`
  - 检查getInventory()是否有假数据
  - 检查getMyIPs()是否有模拟返回
  - 检查calculatePrice()是否硬编码价格
  
- [ ] `proxy/static-proxy.service.ts`
  - 检查list()方法
  - 检查purchase()方法
  - 检查renew()方法

- [ ] `dashboard/dashboard.service.ts`
  - 检查getTrafficByType()
  - 检查getRequestDistribution()
  - 检查getTrafficTrend()

- [ ] `pricing/pricing.service.ts`
  - 检查价格计算逻辑
  - 确认从price_configs表读取

**搜索命令**：
```bash
cd backend/src
grep -rn "mock\|fake\|dummy\|test.*data\|hardcoded" --include="*.ts" | grep -v "node_modules" | grep -v ".spec.ts"
```

**示例需要删除的代码**：
```typescript
// ❌ 删除
const mockIPs = [
  { ip: '123.45.67.89', country: 'US' },
  { ip: '198.51.100.1', country: 'JP' }
];
return mockIPs;

// ❌ 删除
if (process.env.NODE_ENV === 'development') {
  return this.getMockData();
}

// ❌ 删除
const fakeInventory = { US: 1000, JP: 500 };
```

#### 1.2 Controller层

**文件列表**：
- [ ] `proxy/static-proxy.controller.ts`
- [ ] `proxy985/proxy985.controller.ts`
- [ ] `dashboard/dashboard.controller.ts`

**检查点**：
- 是否直接返回硬编码数据
- 是否有测试用的假响应

#### 1.3 数据库种子文件

**文件列表**：
- [ ] `backend/src/database/seeds/*.ts`
- [ ] `backend/scripts/seed-*.js`

**操作**：
- 删除创建fake static_proxies的代码
- 删除创建test orders的代码
- 只保留必要的用户和配置数据

### 阶段2：前端代码检查

#### 2.1 Vue组件 (frontend/src/views/)

**文件列表**：
- [ ] `proxy/StaticProxyList.vue`
- [ ] `proxy/PurchaseDialog.vue`
- [ ] `dashboard/Dashboard.vue`
- [ ] `admin/AdminDashboard.vue`

**搜索命令**：
```bash
cd frontend/src
grep -rn "mock\|fake\|dummy\|const.*data.*=.*\[" --include="*.vue" --include="*.ts"
```

**示例需要删除的代码**：
```vue
<!-- ❌ 删除硬编码数据 -->
<script setup>
const mockIPs = [
  { ip: '1.2.3.4', country: 'US', expiresAt: '2025-12-31' }
];
</script>

<!-- ❌ 删除条件假数据 -->
<script setup>
const ips = ref([]);

onMounted(async () => {
  if (import.meta.env.DEV) {
    ips.value = mockData; // 删除这个！
  } else {
    ips.value = await getMyIPs();
  }
});
</script>
```

#### 2.2 API客户端 (frontend/src/api/)

**文件列表**：
- [ ] `api/modules/proxy985.ts`
- [ ] `api/modules/proxy.ts`
- [ ] `api/modules/dashboard.ts`

**检查点**：
- 是否有开发环境返回假数据的逻辑
- 是否有fallback到模拟数据

```typescript
// ❌ 删除
export async function getMyIPs() {
  if (import.meta.env.DEV) {
    return [{ ip: '1.2.3.4' }];
  }
  return request.get('/proxy/static/my-ips');
}

// ✅ 正确
export async function getMyIPs() {
  return request.get('/proxy/static/my-ips');
}
```

#### 2.3 常量文件

**文件列表**：
- [ ] `frontend/src/constants/`
- [ ] `backend/src/common/constants/`

**检查**：
- 是否有硬编码的IP列表
- 是否有硬编码的价格数据

### 阶段3：数据库清理

#### 3.1 检查当前数据

```sql
-- 连接数据库
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub

-- 检查静态IP
SELECT id, ip, user_id, country_code, city, expires_at, created_at 
FROM static_proxies 
ORDER BY created_at DESC;

-- 检查是否有明显的假数据
SELECT * FROM static_proxies WHERE ip LIKE '123.%' OR ip LIKE '192.168.%';

-- 检查订单
SELECT id, order_no, user_id, total_price, status, created_at 
FROM orders 
ORDER BY created_at DESC LIMIT 20;

-- 检查是否有测试订单
SELECT * FROM orders WHERE order_no LIKE 'TEST%' OR order_no LIKE 'MOCK%';
```

#### 3.2 清理假数据

```sql
-- ⚠️ 警告：清理前先备份！
-- docker exec proxyhub-postgres pg_dump -U postgres proxyhub > backup.sql

-- 删除假IP（根据实际情况调整条件）
DELETE FROM static_proxies 
WHERE ip LIKE '123.%' OR ip LIKE '192.168.%' OR ip LIKE '10.%';

-- 删除测试订单
DELETE FROM orders 
WHERE order_no LIKE 'TEST%' OR order_no LIKE 'MOCK%';

-- 或者清空所有，让用户重新购买
-- TRUNCATE TABLE static_proxies CASCADE;
-- TRUNCATE TABLE orders CASCADE;
```

### 阶段4：配置文件检查

**文件列表**：
- [ ] `backend/src/config/*.ts`
- [ ] `frontend/src/config/*.ts`

**检查**：
- 是否有硬编码的API endpoint
- 是否有测试用的mock配置

---

## 🔧 执行步骤

### 步骤1：备份数据库

```bash
cd /opt/proxyhub
docker exec proxyhub-postgres pg_dump -U postgres proxyhub > backup_$(date +%Y%m%d_%H%M%S).sql
echo "✅ 数据库已备份"
```

### 步骤2：搜索后端模拟数据

```bash
cd backend/src
echo "🔍 搜索后端模拟数据..."
grep -rn "mock" --include="*.ts" | grep -v "node_modules" | grep -v ".spec.ts" > ../../backend-mock-search.txt
grep -rn "fake" --include="*.ts" | grep -v "node_modules" | grep -v ".spec.ts" >> ../../backend-mock-search.txt
grep -rn "dummy" --include="*.ts" | grep -v "node_modules" | grep -v ".spec.ts" >> ../../backend-mock-search.txt
grep -rn "hardcoded\|hard-coded\|hard coded" --include="*.ts" | grep -v "node_modules" >> ../../backend-mock-search.txt

cd ../..
cat backend-mock-search.txt
```

### 步骤3：搜索前端模拟数据

```bash
cd frontend/src
echo "🔍 搜索前端模拟数据..."
grep -rn "mock\|fake\|dummy" --include="*.vue" --include="*.ts" > ../../frontend-mock-search.txt
grep -rn "const.*=.*\[{.*ip.*:.*'[0-9]" --include="*.vue" --include="*.ts" >> ../../frontend-mock-search.txt

cd ../..
cat frontend-mock-search.txt
```

### 步骤4：逐一清理代码

**手动检查每个搜索结果**：
1. 打开文件
2. 确认是否是模拟数据
3. 删除或替换为真实API调用
4. 测试功能是否正常

### 步骤5：清理数据库

```bash
# 连接数据库
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub

# 执行清理SQL（见上面的SQL命令）

# 退出
\q
```

### 步骤6：重新部署

```bash
cd /opt/proxyhub

# 停止服务
docker compose -f docker-compose.cn.yml down

# 删除旧镜像
docker rmi proxyhub-backend proxyhub-frontend

# 重新构建
docker compose -f docker-compose.cn.yml build --no-cache

# 启动服务
docker compose -f docker-compose.cn.yml up -d

# 查看日志
docker compose -f docker-compose.cn.yml logs -f backend
```

### 步骤7：测试验证

#### 7.1 购买测试

1. 登录 `alice@test.com` / `password123`
2. 访问静态住宅选购
3. 购买1个美国IP
4. 记录返回的IP信息

#### 7.2 对比985Proxy

1. 登录 https://www.985proxy.com
2. 查看"我的代理"
3. 对比IP地址、国家、到期时间
4. **必须完全一致**

#### 7.3 检查数据库

```bash
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub -c \
  "SELECT ip, country_code, city, expires_at FROM static_proxies WHERE user_id = (SELECT id FROM users WHERE email = 'alice@test.com') ORDER BY created_at DESC LIMIT 5;"
```

---

## ✅ 完成标准

### 代码检查
- [ ] 后端所有Service方法都从API或数据库获取数据
- [ ] 前端所有组件都通过API加载数据
- [ ] 没有任何硬编码的IP、价格、订单数据
- [ ] 删除了所有`if (isDev) return mockData`的代码
- [ ] 删除了所有测试用的假数据生成函数

### 数据库检查
- [ ] static_proxies表中没有假IP
- [ ] orders表中没有测试订单
- [ ] 所有数据都是通过985Proxy API真实创建的

### 功能检查
- [ ] 购买IP成功，985Proxy账户正确扣费
- [ ] ProxyHub显示的IP与985Proxy平台100%一致
- [ ] IP详情（国家、城市、到期时间、端口）完全准确
- [ ] 续费功能正常，费用计算正确
- [ ] 订单记录准确，金额正确

### 性能检查
- [ ] API响应时间 < 200ms
- [ ] 没有N+1查询问题
- [ ] 使用了适当的索引
- [ ] 大数据量使用了分页

---

## 📝 清理记录模板

记录每个清理的位置：

| 文件路径 | 行号 | 原代码 | 修复方法 | 验证结果 |
|---------|------|--------|---------|---------|
| `backend/src/modules/proxy/proxy.service.ts` | 45-50 | `return mockIPs` | 改为`return await this.proxy985Service.getMyIPs()` | ✅ 通过 |
| `frontend/src/views/ProxyList.vue` | 78 | `const mockData = [...]` | 删除，使用`loadFromAPI()` | ✅ 通过 |

---

## 🚨 注意事项

1. **务必备份数据库**
2. **逐个文件检查，不要批量替换**
3. **每清理一个模块，立即测试**
4. **记录所有修改，便于回滚**
5. **保留必要的错误处理和默认值**

**默认值 vs 模拟数据**：
```typescript
// ✅ 可以：错误时的默认值
try {
  return await api.getIPs();
} catch (error) {
  console.error('API调用失败', error);
  return []; // 返回空数组，不是假数据
}

// ❌ 不可以：返回假数据
catch (error) {
  return [{ ip: '1.2.3.4' }]; // 这是假数据！
}
```

---

## 🎉 完成后

1. **更新PROJECT-GUIDE.md**
   - 记录清理过程
   - 更新"已知问题"状态

2. **创建验证报告**
   - 测试购买流程
   - 截图对比结果
   - 确认数据一致性

3. **提交代码**
   ```bash
   git add .
   git commit -m "refactor: remove all mock data and hardcoded values

   - Remove mock data from all Service classes
   - Remove hardcoded IPs from frontend components
   - Clean up fake records from database
   - Ensure 100% data from 985Proxy API
   - Verify data consistency with 985Proxy platform
   
   Fixes: IP data inconsistency issue"
   git push origin master
   ```

---

**开始清理后，每完成一个阶段就勾选对应的复选框！** ✅

