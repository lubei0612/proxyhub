# 🧹 清理模拟数据指南

> **目标**：删除所有模拟数据，确保系统只显示真实的985Proxy数据

**创建日期**: 2025-11-06  
**优先级**: P0 - 紧急  
**原因**: 用户购买IP后发现ProxyHub显示的IP与985Proxy不一致

---

## 🎯 问题描述

**用户反馈**：
- ✅ 在ProxyHub购买IP成功
- ✅ 985Proxy账户扣费正常
- ❌ ProxyHub显示的IP地址与985Proxy平台显示的不一致

**根本原因**：
- 系统中存在模拟数据（mock data）
- 前端或后端某些地方返回了假数据
- 数据没有完全从985Proxy API获取

---

## 📋 清理清单

### 1. 后端模拟数据

#### 1.1 检查Service层

**文件**: `backend/src/modules/proxy985/proxy985.service.ts`

```typescript
// ❌ 删除所有类似代码
const mockData = [
  { ip: '123.45.67.89', country: 'US' }
];

// ✅ 确保所有数据来自API
const realData = await this.callProxy985API();
```

**检查命令**：
```bash
cd backend/src
grep -r "mock" --include="*.ts" | grep -v "node_modules"
grep -r "fake" --include="*.ts" | grep -v "node_modules"
grep -r "dummy" --include="*.ts" | grep -v "node_modules"
grep -r "test.*data" --include="*.ts" | grep -v "node_modules"
```

#### 1.2 检查Controller返回

**文件**: `backend/src/modules/proxy/static-proxy.controller.ts`

```typescript
// ❌ 删除硬编码数据
@Get('list')
async list() {
  return [{ ip: '1.2.3.4' }]; // 这是假数据！
}

// ✅ 从数据库或API查询
@Get('list')
async list(@Request() req) {
  return this.proxy985Service.getMyIPs(req.user.id);
}
```

#### 1.3 清理数据库种子数据

**文件**: `backend/src/database/seeds/*.ts`

- 删除或注释掉创建fake static_proxies的代码
- 只保留必要的用户和配置数据

### 2. 前端模拟数据

#### 2.1 检查Vue组件

**文件**: `frontend/src/views/**/*.vue`

```vue
<!-- ❌ 删除硬编码数据 -->
<script setup>
const mockIPs = [
  { ip: '1.2.3.4', country: 'US' }
];
</script>

<!-- ✅ 从API获取 -->
<script setup>
import { getMyIPs } from '@/api/modules/proxy985';

const loadIPs = async () => {
  const data = await getMyIPs();
  ips.value = data;
};
</script>
```

**检查命令**：
```bash
cd frontend/src
grep -r "mock" --include="*.vue" --include="*.ts"
grep -r "fake" --include="*.vue" --include="*.ts"
grep -r "dummy" --include="*.vue" --include="*.ts"
```

#### 2.2 检查API客户端

**文件**: `frontend/src/api/modules/proxy985.ts`

```typescript
// ❌ 删除返回假数据的逻辑
export async function getMyIPs() {
  if (import.meta.env.DEV) {
    return [{ ip: '1.2.3.4' }]; // 开发环境也不能用假数据！
  }
  return request.get('/proxy/static/my-ips');
}

// ✅ 始终返回真实数据
export async function getMyIPs() {
  return request.get('/proxy/static/my-ips');
}
```

### 3. 数据库清理

#### 3.1 清理假的static_proxies记录

```bash
# 连接数据库
docker exec -it proxyhub-postgres psql -U postgres -d proxyhub
```

```sql
-- 查看当前IP记录
SELECT id, ip, user_id, country_code, city, expires_at FROM static_proxies;

-- 删除所有模拟数据（如果IP不是真实的985Proxy返回）
-- ⚠️ 谨慎操作！先备份
DELETE FROM static_proxies WHERE ip LIKE '123.%' OR ip LIKE '192.168.%';

-- 或者删除所有，让用户重新购买
TRUNCATE TABLE static_proxies CASCADE;

-- 退出
\q
```

#### 3.2 清理假的订单记录

```sql
-- 如果订单是测试数据
SELECT id, order_no, user_id, total_price, status FROM orders WHERE status = 'completed';

-- 删除测试订单（可选）
-- DELETE FROM orders WHERE order_no LIKE 'TEST%';
```

---

## 🔧 执行步骤

### 步骤1：备份数据库

```bash
cd /opt/proxyhub

# 创建备份
docker exec proxyhub-postgres pg_dump -U postgres proxyhub > backup_before_cleanup_$(date +%Y%m%d).sql

echo "✅ 数据库已备份"
```

### 步骤2：搜索并清理代码中的模拟数据

```bash
# 在项目根目录执行
cd /path/to/proxyhub

# 搜索后端模拟数据
echo "🔍 搜索后端模拟数据..."
cd backend/src
grep -rn "mock\|fake\|dummy" --include="*.ts" | grep -v "node_modules" > ../../mock-data-backend.txt

# 搜索前端模拟数据
echo "🔍 搜索前端模拟数据..."
cd ../../frontend/src
grep -rn "mock\|fake\|dummy" --include="*.vue" --include="*.ts" > ../../mock-data-frontend.txt

cd ../..
echo "✅ 搜索结果已保存到 mock-data-backend.txt 和 mock-data-frontend.txt"
echo "请手动检查并删除这些模拟数据"
```

### 步骤3：清理数据库

```bash
# 连接数据库并执行清理
docker exec -i proxyhub-postgres psql -U postgres -d proxyhub << 'EOSQL'

-- 查看要删除的数据
SELECT '==== 当前Static Proxies ====' as info;
SELECT id, ip, user_id, country_code, expires_at FROM static_proxies;

-- 删除所有静态IP记录（让用户重新购买以验证）
-- ⚠️ 如果不确定，先注释这行
TRUNCATE TABLE static_proxies CASCADE;

SELECT '==== 清理完成 ====' as info;
SELECT COUNT(*) as remaining_ips FROM static_proxies;

EOSQL

echo "✅ 数据库清理完成"
```

### 步骤4：重新部署

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

### 步骤5：测试验证

1. **购买新IP**
   - 登录：`alice@test.com` / `password123`
   - 访问：静态住宅选购
   - 购买：1个美国IP

2. **验证数据一致性**
   ```bash
   # 在ProxyHub查看IP
   # 前端 → 我的IP列表 → 记录IP地址
   
   # 登录985Proxy官网
   # https://www.985proxy.com/user/proxies
   # 对比IP地址、到期时间、国家城市
   ```

3. **检查数据库记录**
   ```bash
   docker exec -it proxyhub-postgres psql -U postgres -d proxyhub -c \
     "SELECT ip, country_code, city, expires_at FROM static_proxies WHERE user_id = (SELECT id FROM users WHERE email = 'alice@test.com');"
   ```

4. **验证API调用**
   ```bash
   # 查看后端日志，确认调用了985Proxy API
   docker compose -f docker-compose.cn.yml logs backend | grep "985.*getMyIPs"
   ```

---

## ✅ 清理完成检查清单

### 代码检查
- [ ] 后端Service没有返回mock数据
- [ ] 后端Controller都从数据库或API查询
- [ ] 前端组件没有硬编码数据
- [ ] API客户端没有返回假数据
- [ ] 删除了所有测试用的假数据生成代码

### 数据库检查
- [ ] static_proxies表没有假IP
- [ ] orders表没有测试订单
- [ ] 所有数据都是真实购买产生的

### 功能检查
- [ ] 购买IP成功
- [ ] ProxyHub显示的IP与985Proxy一致
- [ ] IP详情（国家、城市、到期时间）准确
- [ ] 续费功能正常
- [ ] 订单记录正确

---

## 🐛 如果仍有问题

### 调试方法

1. **开启详细日志**
   ```typescript
   // backend/src/modules/proxy985/proxy985.service.ts
   async getMyIPs(userId: number) {
     console.log('🔍 调用985Proxy API: getMyIPs', { userId });
     const response = await this.call985API();
     console.log('📥 985Proxy响应:', JSON.stringify(response, null, 2));
     return response;
   }
   ```

2. **对比原始数据**
   ```bash
   # 直接调用985Proxy API
   curl -X GET "https://open-api.985proxy.com/api/v1/my-ips" \
     -H "Authorization: Bearer YOUR_API_KEY"
   
   # 对比ProxyHub返回
   curl -X GET "http://localhost:3000/api/v1/proxy/static/my-ips" \
     -H "Authorization: Bearer USER_TOKEN"
   ```

3. **检查数据转换**
   - 确认字段映射是否正确
   - 验证时间格式转换
   - 检查状态值映射

---

## 📝 记录问题

如果发现模拟数据的位置，请记录：

| 文件路径 | 行号 | 问题描述 | 修复方法 |
|---------|------|---------|---------|
| `backend/src/modules/proxy/proxy.service.ts` | 45 | 返回硬编码IP | 改为调用985Proxy API |
| `frontend/src/views/ProxyList.vue` | 78 | 使用假数据初始化 | 从API加载真实数据 |

---

## 🎉 清理完成后

1. **更新文档**
   - 在PROJECT-GUIDE.md中记录清理过程
   - 标记问题为已解决

2. **通知用户**
   - 告知数据已清理
   - 请求重新测试购买流程

3. **监控数据一致性**
   - 定期检查ProxyHub与985Proxy数据是否一致
   - 发现问题立即修复

---

**执行本清理指南后，系统应该只显示真实的985Proxy数据！** 🚀

