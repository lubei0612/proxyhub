# ProxyHub 关键问题修复 - 设计文档

**规格名称**: proxyhub-critical-fixes  
**创建日期**: 2025-11-06  
**状态**: 📐 Design Phase  
**优先级**: P0 - 紧急

---

## 1. 系统架构概述

### 1.1 现有架构
```
┌─────────────────────────────────────────────────────────────┐
│                         前端层 (Vue3)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 用户仪表盘    │  │ 静态代理管理  │  │ 管理后台      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                       后端层 (NestJS)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Module  │  │ Proxy Module │  │ Admin Module │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │985Proxy API  │  │ Order Queue  │  │ Price Cache  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    数据层 (PostgreSQL + Redis)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  用户数据     │  │  订单数据     │  │  缓存数据     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 修复涉及的模块
- **Proxy Module**: IP续费、订单轮询
- **Router Module**: 管理后台路由
- **Pricing Service**: 价格同步和缓存
- **Order Service**: 订单状态管理

---

## 2. 详细设计

### 2.1 P0-1: IP续费API修复

#### 2.1.1 问题分析
当前错误：`"please input the renewal IP"`

**根因分析**：
1. 可能的参数格式问题
2. IP格式要求（是否包含端口）
3. renew_ip_list数组格式

#### 2.1.2 解决方案设计

**方案A：修复参数格式（首选）**
```typescript
// backend/src/modules/proxy985/proxy985.service.ts

async renewIP(data: {
  zone: string;
  time_period: number;
  renew_ip_list: Array<{
    ip: string;        // 只传IP，不含端口
    port?: number;     // 端口可选
  }>;
}) {
  // 增强日志记录
  this.logger.log('[985Proxy] Renew Request:', JSON.stringify(data, null, 2));
  
  try {
    const response = await this.client.post('/res_static/renew', data);
    this.logger.log('[985Proxy] Renew Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    this.logger.error('[985Proxy] Renew Error:', error.response?.data);
    throw error;
  }
}
```

**算法优化**：
- 使用IP缓存避免重复查询
- 批量续费时使用事务确保原子性
- 异步处理，不阻塞主线程

#### 2.1.3 数据流程图
```
用户点击续费
    ↓
前端发送请求 (IP, duration)
    ↓
后端验证 (所有权、余额)
    ↓
查询IP详情 (从数据库或985Proxy)
    ↓
调用985Proxy续费API
    ↓
┌─────────────┐
│ 成功？       │
└─────────────┘
  Yes ↓      No ↓
更新数据库    返回错误
  ↓           ↓
扣除余额    显示提示
  ↓
创建交易记录
  ↓
返回成功响应
```

#### 2.1.4 Docker优化考虑
- 续费操作使用消息队列（Bull/Redis）异步处理
- 避免Docker重启时丢失续费请求
- 使用健康检查确保服务可用

---

### 2.2 P0-2: 管理后台路由修复

#### 2.2.1 问题分析
访问 `/admin/dashboard` 重定向到 `/dashboard`

**根因分析**：
1. 路由守卫逻辑错误
2. 嵌套路由配置问题
3. 角色验证时机错误

#### 2.2.2 解决方案设计

**当前路由结构**（存在问题）：
```typescript
{
  path: '/admin',
  component: AdminLayout,
  children: [
    { path: 'dashboard', component: AdminDashboard }
  ]
}
```

**优化后路由结构**（扁平化 + 元信息）：
```typescript
{
  path: '/admin-portal',
  component: AdminPortalLayout,
  meta: { requiresAuth: true, requiresAdmin: true },
  redirect: '/admin-portal/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/Dashboard.vue'),
      meta: { title: '管理仪表盘', requiresAdmin: true }
    },
    {
      path: 'users',
      name: 'AdminUsers',
      component: () => import('@/views/admin/Users.vue'),
      meta: { title: '用户管理', requiresAdmin: true }
    }
  ]
}
```

**路由守卫优化算法**：
```typescript
// frontend/src/router/guards.ts

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  
  // 性能优化：缓存用户信息
  if (!userStore.user && userStore.token) {
    try {
      await userStore.fetchUserInfo(); // 使用缓存，减少API调用
    } catch (error) {
      userStore.logout();
      return next('/login');
    }
  }
  
  // 算法优化：提前返回，减少嵌套
  if (to.meta.requiresAuth && !userStore.token) {
    return next('/login');
  }
  
  if (to.meta.requiresAdmin && userStore.user?.role !== 'admin') {
    ElMessage.error('需要管理员权限');
    return next('/dashboard');
  }
  
  next();
});
```

**Docker优化考虑**：
- 前端路由使用hash模式避免Nginx配置问题
- 或配置Nginx正确处理history模式
- 构建时优化路由懒加载

---

### 2.3 P1-1: 订单状态轮询机制

#### 2.3.1 架构设计

**使用Bull队列实现异步订单处理**：
```
购买请求
    ↓
创建订单（status: processing）
    ↓
将订单添加到队列
    ↓
立即返回order_no给前端
    ↓
后台Worker处理队列
    ↓
轮询985Proxy订单状态（每3秒）
    ↓
获取IP列表
    ↓
保存到数据库
    ↓
更新订单状态（status: completed）
```

#### 2.3.2 订单队列服务设计

**安装依赖**（Docker优化）：
```json
// backend/package.json
{
  "dependencies": {
    "@nestjs/bull": "^10.0.0",
    "bull": "^4.11.0"
  }
}
```

**订单处理器**（算法优化）：
```typescript
// backend/src/modules/order/order.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('order-processing')
export class OrderProcessor {
  private readonly MAX_RETRIES = 10;
  private readonly RETRY_INTERVAL = 3000; // 3秒
  
  @Process('process-order')
  async handleOrderProcessing(job: Job) {
    const { orderNo, userId } = job.data;
    
    this.logger.log(`[OrderProcessor] Processing order: ${orderNo}`);
    
    // 算法优化：指数退避重试
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        // 查询订单状态
        const orderResult = await this.proxy985Service.getOrderResult(orderNo);
        
        if (orderResult.status === 'completed') {
          // 保存IP到数据库（使用事务）
          await this.saveOrderIPs(orderNo, orderResult.data.ip_list);
          
          // 更新订单状态
          await this.orderService.updateStatus(orderNo, 'completed');
          
          this.logger.log(`[OrderProcessor] Order ${orderNo} completed`);
          return { success: true };
        }
        
        if (orderResult.status === 'failed') {
          await this.orderService.updateStatus(orderNo, 'failed');
          throw new Error('Order processing failed');
        }
        
        // 继续等待
        await this.sleep(this.RETRY_INTERVAL * Math.pow(1.5, attempt)); // 指数退避
        
      } catch (error) {
        this.logger.error(`[OrderProcessor] Attempt ${attempt + 1} failed:`, error);
        
        if (attempt === this.MAX_RETRIES - 1) {
          // 最后一次尝试失败，标记为pending
          await this.orderService.updateStatus(orderNo, 'pending');
          throw error;
        }
      }
    }
    
    return { success: false, reason: 'timeout' };
  }
  
  private async saveOrderIPs(orderNo: string, ipList: any[]) {
    // 使用数据库事务确保原子性
    return this.dataSource.transaction(async (manager) => {
      for (const ipData of ipList) {
        await manager.save(StaticProxy, {
          orderId: orderNo,
          ip: ipData.ip,
          port: ipData.port,
          username: ipData.username,
          password: ipData.password,
          country: ipData.country,
          city: ipData.city,
          expireTimeUtc: ipData.expire_time
        });
      }
    });
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**Docker优化**：
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
```

#### 2.3.3 前端实时更新

**使用轮询或SSE**：
```typescript
// frontend/src/composables/useOrderStatus.ts

export function useOrderStatus(orderNo: string) {
  const status = ref('processing');
  const ips = ref([]);
  let pollTimer: NodeJS.Timeout;
  
  const startPolling = () => {
    pollTimer = setInterval(async () => {
      try {
        const res = await getOrderStatus(orderNo);
        status.value = res.data.status;
        
        if (res.data.status === 'completed') {
          ips.value = res.data.ips;
          stopPolling();
          ElMessage.success('订单处理完成！');
        } else if (res.data.status === 'failed') {
          stopPolling();
          ElMessage.error('订单处理失败，请联系客服');
        }
      } catch (error) {
        console.error('Poll order status failed:', error);
      }
    }, 3000);
  };
  
  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
    }
  };
  
  onMounted(startPolling);
  onUnmounted(stopPolling);
  
  return { status, ips, startPolling, stopPolling };
}
```

---

### 2.4 P1-2: 价格显示同步

#### 2.4.1 价格缓存架构

**多级缓存策略**（算法优化）：
```
前端缓存 (5分钟)
    ↓
后端Redis缓存 (30分钟)
    ↓
985Proxy API
```

#### 2.4.2 价格服务设计

```typescript
// backend/src/modules/pricing/pricing.service.ts

@Injectable()
export class PricingService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly proxy985Service: Proxy985Service,
  ) {}
  
  /**
   * 获取价格（带缓存）
   * 算法复杂度: O(1) - Redis查询
   */
  async getPrice(country: string, ipType: string, duration: number): Promise<number> {
    const cacheKey = `price:${country}:${ipType}:${duration}`;
    
    // 1. 尝试从Redis获取
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`[PricingService] Cache hit: ${cacheKey}`);
      return parseFloat(cached);
    }
    
    // 2. 调用985Proxy API
    const result = await this.proxy985Service.calculatePrice({
      zone: process.env.PROXY_985_ZONE,
      time_period: duration,
      static_proxy_type: ipType,
      buy_data: [{ country_code: country, quantity: 1 }]
    });
    
    const price = result.data.pay_price;
    
    // 3. 保存到Redis（30分钟TTL）
    await this.redis.setex(cacheKey, 1800, price.toString());
    
    return price;
  }
  
  /**
   * 批量获取价格（性能优化）
   * 使用Promise.all并行查询
   */
  async getBatchPrices(items: PriceQuery[]): Promise<PriceResult[]> {
    return Promise.all(
      items.map(item => 
        this.getPrice(item.country, item.ipType, item.duration)
          .then(price => ({ ...item, price }))
      )
    );
  }
  
  /**
   * 预热价格缓存（Docker启动时执行）
   */
  @OnModuleInit()
  async warmupPriceCache() {
    this.logger.log('[PricingService] Warming up price cache...');
    
    const popularCountries = ['US', 'GB', 'CA', 'DE', 'FR'];
    const durations = [30, 90, 180];
    
    for (const country of popularCountries) {
      for (const duration of durations) {
        await this.getPrice(country, 'shared', duration);
      }
    }
    
    this.logger.log('[PricingService] Price cache warmed up');
  }
}
```

#### 2.4.3 前端价格显示优化

```vue
<!-- frontend/src/views/proxy/StaticBuy.vue -->
<template>
  <div class="price-display">
    <div v-if="priceLoading" class="skeleton">加载中...</div>
    <div v-else class="price-info">
      <div v-if="discount > 0" class="original-price">
        原价: ${{ originalPrice }}
      </div>
      <div class="final-price">
        最终价格: ${{ finalPrice }}
        <span v-if="discount > 0" class="discount-badge">
          省${{ discount }}
        </span>
      </div>
      <div class="price-breakdown">
        <span>{{ selectedCountry }}</span>
        <span>×</span>
        <span>{{ quantity }}个</span>
        <span>×</span>
        <span>{{ duration }}天</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 使用防抖优化频繁计算
const debouncedCalculatePrice = debounce(async () => {
  priceLoading.value = true;
  try {
    const res = await calculatePrice({
      items: selectedItems.value,
      ipType: ipType.value,
      duration: duration.value
    });
    originalPrice.value = res.data.original_price;
    finalPrice.value = res.data.final_price;
    discount.value = originalPrice.value - finalPrice.value;
  } finally {
    priceLoading.value = false;
  }
}, 500);

watch([selectedItems, ipType, duration], debouncedCalculatePrice);
</script>
```

---

## 3. 算法优化汇总

### 3.1 数据库查询优化

**索引优化**：
```sql
-- 为常用查询添加复合索引
CREATE INDEX idx_static_proxy_user_status 
ON static_proxies(user_id, status) 
WHERE status = 'active';

CREATE INDEX idx_order_status_created 
ON orders(status, created_at DESC);

CREATE INDEX idx_transaction_user_created 
ON transactions(user_id, created_at DESC);
```

**查询优化**：
```typescript
// 使用数据库连接池
// backend/src/config/database.config.ts
{
  type: 'postgres',
  poolSize: 20, // 连接池大小
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  }
}

// 批量查询优化
async getMultipleIPs(ipAddresses: string[]) {
  // 一次查询代替N次查询
  return this.staticProxyRepo.find({
    where: { ip: In(ipAddresses) }
  });
}
```

### 3.2 缓存策略优化

**多级缓存**：
```typescript
// 1. 内存缓存（最快）
private readonly memoryCache = new Map<string, any>();

// 2. Redis缓存（中速）
@InjectRedis() private readonly redis: Redis;

// 3. 数据库（最慢）
@InjectRepository(Entity) private readonly repo: Repository<Entity>;

async getData(key: string) {
  // L1: 内存
  if (this.memoryCache.has(key)) {
    return this.memoryCache.get(key);
  }
  
  // L2: Redis
  const cached = await this.redis.get(key);
  if (cached) {
    const data = JSON.parse(cached);
    this.memoryCache.set(key, data);
    return data;
  }
  
  // L3: 数据库
  const data = await this.repo.findOne({ where: { id: key } });
  if (data) {
    await this.redis.setex(key, 3600, JSON.stringify(data));
    this.memoryCache.set(key, data);
  }
  
  return data;
}
```

### 3.3 并发处理优化

**使用Promise.all并行处理**：
```typescript
// 串行（慢）
for (const item of items) {
  await processItem(item);
}

// 并行（快）
await Promise.all(items.map(item => processItem(item)));

// 限制并发数（避免过载）
async function processBatch(items: any[], concurrency: number) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);
  }
  return results;
}
```

---

## 4. Docker部署优化

### 4.1 多阶段构建

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]
```

### 4.2 Docker Compose优化

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      REDIS_HOST: redis
      POSTGRES_HOST: postgres
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
  
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: proxyhub
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
  
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
```

### 4.3 环境变量管理

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=proxyhub
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# 985Proxy
PROXY_985_API_KEY=${PROXY_985_API_KEY}
PROXY_985_ZONE=${PROXY_985_ZONE}
PROXY_985_BASE_URL=https://open-api.985proxy.com

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7200

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=${MAIL_USER}
MAIL_PASSWORD=${MAIL_PASSWORD}
```

---

## 5. 性能指标

### 5.1 目标指标
- API响应时间: P95 < 200ms
- 数据库查询: P95 < 50ms
- Redis缓存命中率: > 80%
- 订单处理时间: < 30秒
- Docker启动时间: < 60秒

### 5.2 监控方案
- 使用Prometheus + Grafana监控
- 记录关键指标到时序数据库
- 设置告警阈值

---

## 6. 安全加固

### 6.1 Docker安全
- 使用非root用户运行
- 限制容器权限
- 定期更新基础镜像
- 扫描安全漏洞

### 6.2 API安全
- 请求频率限制
- 参数验证和清洗
- SQL注入防护
- XSS防护

---

**文档版本**: v1.0  
**下一步**: 创建tasks.md任务分解文档

