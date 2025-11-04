# 用户端价格API集成 - 设计方案

**创建日期**: 2025-11-04  
**方案**: 方案3 - 混合方案（用户体验最佳）  

---

## 🎨 整体设计

### 核心思想
1. **快速首屏**: 立即显示基础价格，避免白屏等待
2. **后台加载**: 异步调用API获取实际价格
3. **无感更新**: 价格更新时平滑过渡，无闪烁
4. **优雅降级**: API失败时保持基础价格可用

---

## 🏗️ 架构设计

### 数据流图

```
用户访问页面
    ↓
立即渲染（使用基础价格）
    ↓
触发后台价格加载
    ↓
调用 POST /api/v1/price/calculate
    ↓
    ├─ 成功 → 更新价格缓存 → 触发响应式更新
    └─ 失败 → 显示错误提示 → 继续使用基础价格
```

### 状态管理

```typescript
// 价格缓存: Map<string, number>
// key: "JP-Tokyo-premium"
// value: 10.00

priceCache = {
  "JP-Tokyo-premium": 10.00,
  "JP-Tokyo-shared": 10.00,
  "KR-Seoul-premium": 5.00,
  ...
}
```

---

## 💻 前端实现设计

### 1. 数据结构

```typescript
// 价格缓存
const priceCache = ref<Map<string, number>>(new Map());

// 加载状态
const priceLoading = ref(false);

// 错误状态
const priceError = ref<string | null>(null);

// 当前IP类型
const ipType = ref<'shared' | 'premium'>('shared');

// 购买时长
const duration = ref(30);
```

### 2. 核心函数设计

#### 2.1 生成缓存Key

```typescript
/**
 * 生成价格缓存的唯一key
 * @param country 国家代码 (e.g., "JP")
 * @param city 城市名称 (e.g., "Tokyo")
 * @param ipType IP类型 ("shared" | "premium")
 * @returns 缓存key (e.g., "JP-Tokyo-premium")
 */
const getPriceCacheKey = (
  country: string, 
  city: string, 
  ipType: string
): string => {
  return `${country}-${city}-${ipType}`;
};
```

#### 2.2 批量加载价格

```typescript
/**
 * 批量加载所有地区的价格
 * - 构造所有地区的价格计算请求
 * - 调用后端API一次性获取
 * - 更新价格缓存
 */
const loadAllPrices = async () => {
  priceLoading.value = true;
  priceError.value = null;
  
  try {
    // 构造请求参数
    const items = mockCountries.value.map(country => ({
      country: country.code,
      city: country.name,
      ipType: ipType.value,
      quantity: 1,
      duration: duration.value
    }));
    
    // 调用API
    const response = await calculatePrice({ items });
    
    // 更新缓存
    response.items.forEach(item => {
      const key = getPriceCacheKey(
        item.country, 
        item.city, 
        item.ipType
      );
      priceCache.value.set(key, item.unitPrice);
    });
    
    console.log('[Price] Loaded prices for', response.items.length, 'regions');
    
  } catch (error) {
    console.error('[Price] Failed to load prices:', error);
    priceError.value = '价格加载失败，显示默认价格';
    ElMessage.warning('价格加载失败，显示默认价格');
  } finally {
    priceLoading.value = false;
  }
};
```

#### 2.3 获取单位价格（带缓存）

```typescript
/**
 * 获取指定地区的单位价格
 * - 优先从缓存读取
 * - 缓存未命中时返回基础价格
 * 
 * @param item 地区信息对象
 * @returns 单位价格（美元/月）
 */
const getUnitPrice = (item: any): number => {
  const key = getPriceCacheKey(
    item.code, 
    item.name, 
    ipType.value
  );
  
  const cachedPrice = priceCache.value.get(key);
  
  if (cachedPrice !== undefined) {
    return cachedPrice;
  }
  
  // 缓存未命中，返回基础价格
  return getBasePrice();
};
```

#### 2.4 基础价格（Fallback）

```typescript
/**
 * 获取基础价格（作为fallback）
 * - 普通IP: $5/月
 * - 原生IP: $8/月
 */
const getBasePrice = (): number => {
  return ipType.value === 'shared' ? 5 : 8;
};
```

### 3. 响应式监听设计

```typescript
/**
 * 监听IP类型和时长变化
 * - 任一参数变化时重新加载价格
 * - immediate: true 表示首次加载时也触发
 */
watch(
  [ipType, duration], 
  () => {
    loadAllPrices();
  }, 
  { immediate: true }
);
```

---

## 🔌 API集成设计

### API调用示例

**请求**:
```typescript
// POST /api/v1/price/calculate
{
  "items": [
    {
      "country": "JP",
      "city": "Tokyo",
      "ipType": "premium",
      "quantity": 1,
      "duration": 30
    },
    {
      "country": "US",
      "city": "New York",
      "ipType": "premium",
      "quantity": 1,
      "duration": 30
    }
    // ... 其他24个地区
  ]
}
```

**响应**:
```typescript
{
  "items": [
    {
      "country": "JP",
      "city": "Tokyo",
      "ipType": "premium",
      "quantity": 1,
      "duration": 30,
      "unitPrice": 10.00,
      "subtotal": 10.00
    },
    {
      "country": "US",
      "city": "New York",
      "ipType": "premium",
      "quantity": 1,
      "duration": 30,
      "unitPrice": 8.00,
      "subtotal": 8.00
    }
    // ...
  ],
  "totalPrice": 18.00,
  "currency": "USD"
}
```

---

## 🎯 UI/UX设计

### 加载状态显示

```html
<!-- 价格显示区域 -->
<div class="card-price">
  <span v-if="!priceLoading">
    ${{ getUnitPrice(item) }}/月
  </span>
  <span v-else class="price-loading">
    <el-icon class="is-loading"><Loading /></el-icon>
  </span>
</div>
```

### 错误提示设计

```typescript
// 顶部全局提示
if (priceError) {
  ElMessage.warning({
    message: '价格加载失败，显示默认价格',
    duration: 3000,
    showClose: true
  });
}
```

---

## 🔄 生命周期设计

### 页面加载流程

```
1. onMounted
   ↓
2. 显示基础价格（立即渲染）
   ↓
3. watch触发（immediate: true）
   ↓
4. loadAllPrices() 异步执行
   ↓
5. API调用中（priceLoading = true）
   ↓
6. API响应成功
   ↓
7. 更新priceCache
   ↓
8. 响应式更新UI（显示实际价格）
   ↓
9. priceLoading = false
```

### IP类型切换流程

```
用户点击"原生"
   ↓
ipType.value = 'premium'
   ↓
watch监听到变化
   ↓
清空旧缓存 (可选优化)
   ↓
loadAllPrices() 重新加载
   ↓
更新UI
```

---

## 📊 性能优化设计

### 1. 批量请求优化
- ✅ 一次API调用获取所有26个地区价格
- ❌ 避免为每个地区单独调用API（26次）

### 2. 缓存策略
- **缓存key**: `${country}-${city}-${ipType}`
- **缓存时机**: API响应成功后立即缓存
- **缓存失效**: IP类型或时长变化时

### 3. 防抖优化（可选）
```typescript
import { debounce } from 'lodash-es';

const debouncedLoadPrices = debounce(loadAllPrices, 300);

watch([ipType, duration], () => {
  debouncedLoadPrices();
}, { immediate: true });
```

---

## 🛡️ 错误处理设计

### 错误类型和处理

| 错误类型 | 处理策略 | 用户体验 |
|----------|----------|----------|
| 网络错误 | 使用基础价格 | 显示警告提示 |
| API 401 | 跳转登录 | 重定向到登录页 |
| API 500 | 使用基础价格 | 显示错误提示 |
| 超时 | 使用基础价格 | 显示加载超时提示 |

### 错误处理代码

```typescript
try {
  const response = await calculatePrice({ items });
  // 成功处理
} catch (error: any) {
  if (error.response?.status === 401) {
    // 未授权，跳转登录
    ElMessage.error('请先登录');
    router.push('/login');
  } else if (error.code === 'ECONNABORTED') {
    // 超时
    priceError.value = '价格加载超时';
    ElMessage.warning('价格加载超时，显示默认价格');
  } else {
    // 其他错误
    priceError.value = '价格加载失败';
    ElMessage.warning('价格加载失败，显示默认价格');
  }
}
```

---

## 🧪 测试设计

### Chrome DevTools验证点

1. **Network面板**
   - ✅ 页面加载时有一次`POST /api/v1/price/calculate`请求
   - ✅ 请求参数包含26个地区的items
   - ✅ 响应包含所有地区的价格

2. **Console面板**
   - ✅ 有`[Price] Loaded prices for 26 regions`日志
   - ❌ 无错误日志

3. **Elements面板**
   - ✅ 日本Tokyo原生IP显示`$10/月`
   - ✅ 其他原生IP显示正确价格
   - ✅ 普通IP价格正确

4. **Application面板**
   - ✅ Vue DevTools中priceCache包含26条记录
   - ✅ 缓存key格式正确

---

## 📝 代码变更清单

### 文件: `frontend/src/views/proxy/StaticBuy.vue`

**变更内容**:
1. ✅ 导入`calculatePrice` API
2. ✅ 添加`priceCache`响应式变量
3. ✅ 添加`priceLoading`和`priceError`状态
4. ✅ 实现`getPriceCacheKey()`函数
5. ✅ 实现`loadAllPrices()`函数
6. ✅ 修改`getUnitPrice()`函数使用缓存
7. ✅ 添加`watch`监听器
8. ✅ 添加加载状态UI

**预计行数**: +80行

---

## 🔍 验收标准

### 功能验收
- [ ] 页面加载时显示基础价格（无白屏）
- [ ] 2秒内价格更新为实际价格
- [ ] 日本Tokyo原生IP显示$10/月
- [ ] 切换IP类型价格正确更新
- [ ] 切换时长价格正确计算

### 性能验收
- [ ] 首屏渲染 < 1秒
- [ ] 价格API调用 < 500ms
- [ ] 无明显的页面闪烁

### 错误处理验收
- [ ] 断网情况下使用基础价格
- [ ] 显示友好的错误提示
- [ ] 不影响其他功能使用

---

## 📅 实施计划

| 步骤 | 任务 | 预计时间 |
|------|------|----------|
| 1 | 导入API和类型定义 | 5分钟 |
| 2 | 添加响应式变量 | 3分钟 |
| 3 | 实现loadAllPrices函数 | 10分钟 |
| 4 | 修改getUnitPrice函数 | 5分钟 |
| 5 | 添加watch监听器 | 3分钟 |
| 6 | 添加加载状态UI | 5分钟 |
| 7 | 测试验证 | 15分钟 |
| 8 | 文档更新 | 5分钟 |

**总计**: 约51分钟

---

**设计完成时间**: 2025-11-04  
**下一步**: 开始代码实现

