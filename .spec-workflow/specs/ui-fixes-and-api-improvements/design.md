# UI修复和API改进 - 设计文档

## 1. 系统架构

### 1.1 整体架构
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vue 3)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AccountCenter│  │  Dashboard   │  │ UserManage   │  │
│  │    Page      │  │    Page      │  │    Page      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│                    ┌──────▼───────┐                     │
│                    │  API Client  │                     │
│                    │  (Axios)     │                     │
│                    └──────┬───────┘                     │
└───────────────────────────┼─────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────▼─────────────────────────────┐
│                    Backend (NestJS)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pricing    │  │   Proxy985   │  │    Stats     │  │
│  │   Module     │  │    Module    │  │   Module     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                           │                             │
│         ┌─────────────────┼─────────────────┐           │
│         │                 │                 │           │
│    ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐     │
│    │  TypeORM│      │  Axios    │    │  Redis    │     │
│    └────┬────┘      └─────┬─────┘    └───────────┘     │
└─────────┼──────────────────┼──────────────────────────┘
          │                  │
    ┌─────▼─────┐     ┌──────▼──────┐
    │PostgreSQL │     │985Proxy API │
    └───────────┘     └─────────────┘
```

### 1.2 核心模块

#### 前端模块
| 模块 | 文件路径 | 职责 |
|------|---------|------|
| AccountCenter | `frontend/src/views/account/AccountCenter.vue` | 账户中心页面UI |
| Dashboard | `frontend/src/views/Dashboard.vue` | 仪表盘统计卡片 |
| UserManagement | `frontend/src/views/admin/Users.vue` | 用户管理和价格覆盖 |
| UserPriceOverrideModal | `frontend/src/components/UserPriceOverrideModal.vue` | 价格覆盖对话框 |
| StaticBuy | `frontend/src/views/proxy/StaticBuy.vue` | 静态代理购买页面 |

#### 后端模块
| 模块 | 文件路径 | 职责 |
|------|---------|------|
| PricingModule | `backend/src/modules/pricing/` | 价格管理和覆盖 |
| Proxy985Module | `backend/src/modules/proxy985/` | 985API集成 |
| StatsModule | `backend/src/modules/stats/` | 统计数据查询 |
| OrderModule | `backend/src/modules/order/` | 订单和充值审核 |

---

## 2. 数据库设计

### 2.1 相关表结构

#### price_overrides 表（已存在）
```sql
CREATE TABLE price_overrides (
  id SERIAL PRIMARY KEY,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  ip_type VARCHAR(50) NOT NULL,
  override_price DECIMAL(10,2) NOT NULL,
  user_id INTEGER NULL,  -- NULL = 全局覆盖，非NULL = 用户特定覆盖
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(country, city, ip_type, COALESCE(user_id, 0))
);

CREATE INDEX idx_price_overrides_user_id ON price_overrides(user_id);
CREATE INDEX idx_price_overrides_global ON price_overrides(user_id) WHERE user_id IS NULL;
```

#### recharge_orders 表（已存在）
```sql
CREATE TABLE recharge_orders (
  -- ... existing columns
  status VARCHAR(20) DEFAULT 'pending',  -- pending/approved/rejected
  -- ...
);
```

---

## 3. API接口设计

### 3.1 价格覆盖相关API

#### GET /api/v1/price/user-ip-pool/:userId
**描述：** 获取用户级别的IP池和价格覆盖信息

**请求参数：**
```typescript
params: {
  userId: number  // 用户ID
}
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "country": "美国",
      "city": "洛杉矶",
      "ipType": "shared",
      "originalPrice": 5.99,
      "globalOverridePrice": null,
      "userOverridePrice": 4.99,
      "currentPrice": 4.99,
      "hasUserOverride": true
    }
  ]
}
```

#### POST /api/v1/price/user-overrides/:userId/batch
**描述：** 批量更新用户价格覆盖

**请求参数：**
```typescript
params: {
  userId: number
}
body: {
  updates: Array<{
    country: string;
    city: string;
    ipType: string;
    overridePrice: number | null;  // null表示删除覆盖
  }>
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "成功更新 3 个价格覆盖"
}
```

### 3.2 985Proxy API集成

#### GET /api/v1/proxy985/business-list
**描述：** 获取热门业务场景列表

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "business_scenario": "电商平台",
      "description": "适用于电商网站访问"
    },
    {
      "business_scenario": "社交媒体",
      "description": "适用于社交平台"
    }
  ]
}
```

#### GET /api/v1/proxy/static/inventory
**描述：** 获取静态IP库存（含业务场景过滤）

**请求参数：**
```typescript
query: {
  ipType?: 'shared' | 'premium';
  duration?: number;
  businessScenario?: string;  // 新增
}
```

### 3.3 统计数据API

#### GET /api/v1/stats/admin-pending-tasks
**描述：** 获取管理员待处理事项数量

**响应示例：**
```json
{
  "success": true,
  "data": {
    "pendingRecharges": 5,    // 待审核充值
    "abnormalOrders": 2,       // 异常订单
    "systemNotifications": 3,  // 系统通知
    "total": 10                // 总计
  }
}
```

---

## 4. 组件设计

### 4.1 账户中心页面重构

**组件结构：**
```vue
<template>
  <div class="account-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>账户中心</h2>
      <el-button type="primary" @click="handleChangePassword">
        修改密码
      </el-button>
    </div>

    <!-- 主内容区：左右布局 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧：账户信息 (60%) -->
      <el-col :xs="24" :sm="24" :md="14" :lg="14">
        <el-card class="info-card">
          <template #header>
            <span>📱 登录密码</span>
          </template>
          <div class="info-item">
            <span>当前密码强度：</span>
            <el-tag type="success">强</el-tag>
          </div>
          <div class="info-item">
            <span>最后修改时间：</span>
            <span>{{ userInfo.passwordUpdatedAt }}</span>
          </div>
        </el-card>

        <el-card class="info-card">
          <template #header>
            <span>✉️ 邮箱绑定</span>
          </template>
          <!-- ... -->
        </el-card>

        <el-card class="info-card">
          <template #header>
            <span>🔔 通知设置</span>
          </template>
          <!-- ... -->
        </el-card>
      </el-col>

      <!-- 右侧：快捷操作和客服 (40%) -->
      <el-col :xs="24" :sm="24" :md="10" :lg="10">
        <!-- 快捷操作卡片 -->
        <el-card class="quick-actions-card">
          <template #header>
            <span>🚀 快捷操作</span>
          </template>
          <div class="action-list">
            <div class="action-item" @click="navigate('/proxy/static/buy')">
              <el-icon><ShoppingCart /></el-icon>
              <span>订购静态IP</span>
            </div>
            <!-- ... -->
          </div>
        </el-card>

        <!-- 联系客服卡片 -->
        <el-card class="support-card">
          <template #header>
            <span>💬 联系客服</span>
          </template>
          <div class="support-info">
            <div class="support-item">
              <el-icon><Service /></el-icon>
              <div>
                <div class="label">在线客服</div>
                <div class="value">9:00 - 22:00</div>
              </div>
            </div>
            <!-- ... -->
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
```

**响应式断点：**
```scss
// 桌面端 (≥768px)
.main-content {
  .el-col:first-child { width: 60%; }
  .el-col:last-child { width: 40%; }
}

// 移动端 (<768px)
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    .el-col { width: 100%; }
  }
}
```

### 4.2 仪表盘卡片修复

**问题诊断：**
- 卡片宽度计算错误导致最后一个卡片被截断
- `el-col` span值总和超过24

**修复方案：**
```vue
<el-row :gutter="20" class="stats-cards">
  <el-col :xs="12" :sm="12" :md="6" :lg="6" v-for="stat in stats" :key="stat.label">
    <el-card class="stat-card">
      <div class="stat-content">
        <el-icon :class="`stat-icon ${stat.color}`">
          <component :is="stat.icon" />
        </el-icon>
        <div class="stat-details">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </el-card>
  </el-col>
</el-row>
```

**响应式规则：**
- 桌面端（≥992px）：4列显示（6 + 6 + 6 + 6 = 24）
- 平板端（768-991px）：4列显示
- 手机端（<768px）：2列显示（12 + 12 = 24）

### 4.3 用户价格覆盖对话框

**组件逻辑：**
```typescript
// UserPriceOverrideModal.vue
interface IpPoolItem {
  country: string;
  city: string;
  ipType: string;
  originalPrice: number;
  globalOverridePrice: number | null;
  userOverridePrice: number | null;
  currentPrice: number;
  hasUserOverride: boolean;
}

const loadUserIpPool = async (userId: number) => {
  loading.value = true;
  try {
    const res = await getUserIpPool(userId);
    ipPoolData.value = res.data.map(item => ({
      ...item,
      editablePrice: item.userOverridePrice ?? item.currentPrice
    }));
  } catch (error) {
    ElMessage.error('加载IP池数据失败');
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  const updates = ipPoolData.value
    .filter(item => {
      const hasChanged = item.editablePrice !== (item.userOverridePrice ?? item.currentPrice);
      return hasChanged;
    })
    .map(item => ({
      country: item.country,
      city: item.city,
      ipType: item.ipType,
      overridePrice: item.editablePrice
    }));

  if (updates.length === 0) {
    ElMessage.info('没有变更需要保存');
    return;
  }

  try {
    await updateUserPriceOverrides(userId, { updates });
    ElMessage.success('价格覆盖更新成功');
    emit('success');
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error('保存失败');
  }
};
```

---

## 5. 状态管理

### 5.1 待处理事项状态

**Store: `adminStore`**
```typescript
// stores/admin.ts
interface PendingTasks {
  pendingRecharges: number;
  abnormalOrders: number;
  systemNotifications: number;
  total: number;
}

export const useAdminStore = defineStore('admin', () => {
  const pendingTasks = ref<PendingTasks>({
    pendingRecharges: 0,
    abnormalOrders: 0,
    systemNotifications: 0,
    total: 0
  });

  const fetchPendingTasks = async () => {
    try {
      const res = await getAdminPendingTasks();
      pendingTasks.value = res.data;
    } catch (error) {
      console.error('Failed to fetch pending tasks:', error);
    }
  };

  // 定时刷新
  let refreshInterval: number | null = null;
  const startAutoRefresh = () => {
    fetchPendingTasks(); // 立即执行一次
    refreshInterval = setInterval(fetchPendingTasks, 60000); // 每分钟刷新
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  return {
    pendingTasks,
    fetchPendingTasks,
    startAutoRefresh,
    stopAutoRefresh
  };
});
```

**使用示例：**
```vue
<script setup lang="ts">
import { useAdminStore } from '@/stores/admin';

const adminStore = useAdminStore();

onMounted(() => {
  adminStore.startAutoRefresh();
});

onUnmounted(() => {
  adminStore.stopAutoRefresh();
});
</script>

<template>
  <el-badge :value="adminStore.pendingTasks.total" :hidden="adminStore.pendingTasks.total === 0">
    <el-button>待处理事项</el-button>
  </el-badge>
</template>
```

---

## 6. 样式规范

### 6.1 响应式断点
```scss
$breakpoints: (
  'xs': 0,      // 超小屏幕 (手机)
  'sm': 576px,  // 小屏幕 (手机横屏)
  'md': 768px,  // 中等屏幕 (平板)
  'lg': 992px,  // 大屏幕 (桌面)
  'xl': 1200px, // 超大屏幕 (大桌面)
);

@mixin responsive($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}
```

### 6.2 移动端适配规范
```scss
// 最小点击区域
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
}

// 文字大小
.text-mobile {
  font-size: 14px;
  line-height: 1.6;
}

// 间距
.spacing-mobile {
  padding: 12px;
  margin: 8px 0;
}

// 表格横向滚动
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

---

## 7. 错误处理

### 7.1 API错误处理
```typescript
// utils/request.ts
service.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 400) {
      ElMessage.error('请求参数错误');
    } else if (error.response?.status === 401) {
      ElMessage.error('未授权，请重新登录');
      router.push('/login');
    } else if (error.response?.status === 404) {
      ElMessage.error('请求的资源不存在');
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误');
    } else {
      ElMessage.error(error.message || '请求失败');
    }
    return Promise.reject(error);
  }
);
```

### 7.2 组件错误边界
```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue';

onErrorCaptured((err, instance, info) => {
  console.error('Component error:', err, info);
  ElMessage.error('页面渲染出错，请刷新重试');
  return false; // 阻止错误继续传播
});
</script>
```

---

## 8. 测试策略

### 8.1 单元测试
```typescript
// PricingService.spec.ts
describe('PricingService', () => {
  describe('getUserIpPoolForPriceOverride', () => {
    it('should return IP pool with user overrides', async () => {
      const result = await pricingService.getUserIpPoolForPriceOverride(1);
      expect(result).toHaveProperty('data');
      expect(result.data).toBeArray();
    });
  });

  describe('batchUpdateUserPriceOverrides', () => {
    it('should update multiple price overrides', async () => {
      const updates = [
        { country: '美国', city: '洛杉矶', ipType: 'shared', overridePrice: 4.99 }
      ];
      const result = await pricingService.batchUpdateUserPriceOverrides(1, updates);
      expect(result.success).toBe(true);
    });
  });
});
```

### 8.2 集成测试
```typescript
// api.spec.ts
describe('API Integration', () => {
  it('should connect to 985Proxy API successfully', async () => {
    const res = await request(app.getHttpServer())
      .get('/proxy985/business-list')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeArray();
  });
});
```

### 8.3 E2E测试
```typescript
// account-center.e2e.ts
describe('Account Center Page', () => {
  it('should display in 2-column layout on desktop', async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('/account/center');
    
    const leftCol = await page.$('.el-col:first-child');
    const rightCol = await page.$('.el-col:last-child');
    
    expect(leftCol).toBeTruthy();
    expect(rightCol).toBeTruthy();
  });

  it('should stack vertically on mobile', async () => {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('/account/center');
    
    // 验证垂直堆叠布局
  });
});
```

---

## 9. 性能优化

### 9.1 前端优化
```typescript
// 懒加载组件
const UserPriceOverrideModal = defineAsyncComponent(() =>
  import('@/components/UserPriceOverrideModal.vue')
);

// 防抖搜索
const debouncedSearch = debounce((keyword: string) => {
  fetchData(keyword);
}, 300);

// 虚拟滚动（大数据列表）
<el-table-v2
  :columns="columns"
  :data="largeDataset"
  :width="700"
  :height="400"
  fixed
/>
```

### 9.2 后端优化
```typescript
// 缓存热门业务场景
@Cacheable('business-scenarios', { ttl: 3600 })
async getBusinessList() {
  return this.proxy985Service.getBusinessList();
}

// 数据库查询优化
async getUserIpPoolForPriceOverride(userId: number) {
  return this.priceOverrideRepository
    .createQueryBuilder('po')
    .select([
      'po.country',
      'po.city',
      'po.ipType',
      'po.overridePrice as userOverridePrice'
    ])
    .where('po.userId = :userId', { userId })
    .orWhere('po.userId IS NULL')
    .orderBy('po.country', 'ASC')
    .addOrderBy('po.city', 'ASC')
    .getMany();
}
```

---

## 10. 部署考虑

### 10.1 环境变量
```env
# 985Proxy API
PROXY_985_API_KEY=your_api_key
PROXY_985_ZONE=your_zone

# 数据库
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=proxyhub

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 10.2 Docker配置
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - PROXY_985_API_KEY=${PROXY_985_API_KEY}
      - PROXY_985_ZONE=${PROXY_985_ZONE}
    restart: unless-stopped

  frontend:
    environment:
      - VITE_API_BASE_URL=/api/v1
    restart: unless-stopped
```

---

## 11. 交付清单

### 11.1 代码交付
- ✅ 前端组件（Vue文件）
- ✅ 后端服务（TypeScript文件）
- ✅ API接口文档
- ✅ 数据库迁移脚本

### 11.2 文档交付
- ✅ 技术设计文档（本文档）
- ✅ API接口文档
- ✅ 部署文档
- ✅ 测试报告

### 11.3 测试交付
- ✅ 单元测试覆盖率 > 80%
- ✅ 集成测试通过
- ✅ E2E测试通过
- ✅ 用户验收测试通过

---

**文档版本：** 1.0.0  
**创建日期：** 2025-11-10  
**最后更新：** 2025-11-10

