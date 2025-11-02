# ProxyHub UI复刻 - 技术设计文档

## 🏗️ 架构设计

### 1. 前端组件架构

```
frontend/src/
├── views/
│   ├── dashboard/
│   │   ├── Index.vue                    # 仪表盘主页（需重构）
│   │   ├── components/
│   │   │   ├── TrafficBarChart.vue      # 流量条形图
│   │   │   ├── NetworkPieChart.vue      # 网络请求饼图
│   │   │   ├── TrafficTrendLine.vue     # 流量趋势折线图
│   │   │   └── DateRangeFilter.vue      # 日期范围筛选器
│   │   
│   ├── proxy/
│   │   ├── DynamicManage.vue            # 动态住宅管理（需重构）
│   │   ├── DynamicBuy.vue               # 动态住宅选购（需重构）
│   │   ├── StaticManage.vue             # 静态住宅管理（需重构）
│   │   ├── StaticBuy.vue                # 静态住宅选购（需重构）
│   │   └── components/
│   │       ├── ProxyTable.vue           # 代理表格组件
│   │       ├── CountrySelector.vue      # 国家选择器
│   │       ├── PricingCard.vue          # 价格卡片
│   │       └── PaymentPanel.vue         # 支付面板
│   │
│   ├── wallet/
│   │   └── Recharge.vue                 # 钱包充值（需重构）
│   │
│   ├── billing/
│   │   ├── Orders.vue                   # 订单管理（需重构）
│   │   ├── Transactions.vue             # 交易明细（需重构）
│   │   ├── Settlement.vue               # 结算记录（需重构）
│   │   └── RechargeOrders.vue           # 充值订单（需重构）
│   │
│   └── account/
│       ├── Center.vue                   # 账户中心（需重构）
│       ├── EventLog.vue                 # 事件日志（需重构）
│       └── components/
│           ├── NotificationSettings.vue # 通知设置
│           └── QRCodeDisplay.vue        # 二维码显示
│
├── components/
│   ├── common/
│   │   ├── FlagIcon.vue                 # ✅ 已存在
│   │   ├── DataTable.vue                # 通用数据表格（新建）
│   │   ├── SearchFilter.vue             # 通用搜索筛选（新建）
│   │   └── EmptyState.vue               # 空状态组件（新建）
│   │
│   └── charts/
│       ├── BarChart.vue                 # 条形图基础组件（新建）
│       ├── PieChart.vue                 # 饼图基础组件（新建）
│       └── LineChart.vue                # 折线图基础组件（新建）
│
├── composables/
│   ├── useCharts.ts                     # 图表相关hook（新建）
│   ├── useExport.ts                     # 导出功能hook（新建）
│   └── useCurrency.ts                   # 货币转换hook（新建）
│
└── styles/
    ├── variables.scss                   # 颜色变量（更新）
    └── dark-theme.scss                  # 深色主题（新建）
```

---

## 🎨 UI组件设计

### 1. 仪表盘图表组件

#### 1.1 TrafficBarChart.vue
**功能**: 展示流量使用概况的横向条形图

**Props**:
```typescript
interface Props {
  startDate: string;
  endDate: string;
  loading?: boolean;
}
```

**Data Structure**:
```typescript
interface TrafficData {
  dataCenter: number;      // GB
  dualISP: number;         // GB
  dynamic: number;         // GB
  mobile: number;          // GB
}
```

**ECharts配置**:
```typescript
{
  tooltip: { trigger: 'axis' },
  xAxis: { 
    type: 'value',
    axisLabel: { formatter: '{value} GB' }
  },
  yAxis: { 
    type: 'category',
    data: ['数据中心', '双ISP静态住宅', '动态住宅', '移动代理']
  },
  series: [{
    type: 'bar',
    data: [/* 数据 */],
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: '#409eff' },
        { offset: 1, color: '#66b1ff' }
      ])
    }
  }]
}
```

#### 1.2 NetworkPieChart.vue
**功能**: 展示网络请求分布的环形饼图

**Props**:
```typescript
interface Props {
  data: Array<{ name: string; value: number }>;
  loading?: boolean;
}
```

**ECharts配置**:
```typescript
{
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 10 },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '50%'],
    data: [
      { value: 335, name: '数据中心', itemStyle: { color: '#ff4081' } },
      { value: 310, name: '双ISP静态住宅', itemStyle: { color: '#448aff' } },
      { value: 234, name: '动态住宅', itemStyle: { color: '#7c4dff' } },
      { value: 135, name: '移动代理', itemStyle: { color: '#00e676' } }
    ],
    label: { 
      show: true,
      formatter: '{b}: {d}%'
    }
  }]
}
```

#### 1.3 TrafficTrendLine.vue
**功能**: 展示流量使用趋势的多线折线图

**Props**:
```typescript
interface Props {
  dateRange: { start: string; end: string };
  timeUnit: 'day' | 'week' | 'month' | 'year';
  loading?: boolean;
}
```

**Data Structure**:
```typescript
interface TrendData {
  dates: string[];
  dc: number[];
  mobile: number[];
  res_rotating: number[];
  static: number[];
}
```

**ECharts配置**:
```typescript
{
  tooltip: { trigger: 'axis' },
  legend: { data: ['数据中心', '移动代理', '动态住宅', '静态住宅'] },
  xAxis: { type: 'category', data: [/* 日期 */] },
  yAxis: { type: 'value', axisLabel: { formatter: '{value} GB' } },
  series: [
    { name: '数据中心', type: 'line', data: [/* 数据 */], itemStyle: { color: '#00e676' } },
    { name: '移动代理', type: 'line', data: [/* 数据 */], itemStyle: { color: '#448aff' } },
    { name: '动态住宅', type: 'line', data: [/* 数据 */], itemStyle: { color: '#7c4dff' } },
    { name: '静态住宅', type: 'line', data: [/* 数据 */], itemStyle: { color: '#ff4081' } }
  ]
}
```

---

### 2. 静态住宅管理组件

#### 2.1 ProxyTable.vue
**功能**: 展示静态IP列表的表格组件

**Features**:
- 多选功能（批量操作）
- 行内操作按钮
- 自定义列显示
- 排序功能
- 分页功能

**Column Config**:
```typescript
const columns = [
  { type: 'selection' },
  { prop: 'channel', label: '通道', width: 120 },
  { prop: 'credentials', label: 'IP:端口:账号:密码', width: 300 },
  { prop: 'location', label: '国家/城市', width: 150 },
  { 
    prop: 'expireTime', 
    label: '到期时间', 
    width: 180,
    formatter: (row) => `${row.expireTime} ${row.expired ? '已到期' : '未到期'}`
  },
  { 
    prop: 'releaseTime', 
    label: '释放时间', 
    width: 180,
    formatter: (row) => `${row.releaseTime} ${row.released ? '已释放' : '未释放'}`
  },
  { prop: 'nodeId', label: '节点ID', width: 180 },
  { prop: 'remark', label: '备注', width: 150 },
  { prop: 'actions', label: '操作', width: 200, fixed: 'right' }
];
```

#### 2.2 SearchFilter.vue
**功能**: 通用搜索筛选组件

**Props**:
```typescript
interface Props {
  filters: Array<{
    type: 'input' | 'select' | 'date-range' | 'date-picker';
    prop: string;
    label: string;
    options?: Array<{ label: string; value: any }>;
    placeholder?: string;
  }>;
}
```

**Emit Events**:
```typescript
interface Events {
  onSearch: (filters: Record<string, any>) => void;
  onReset: () => void;
}
```

#### 2.3 导出功能
**实现方式**: composable hook

```typescript
// composables/useExport.ts
export function useExport() {
  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToTXT = (data: any[], filename: string) => {
    const txtContent = data
      .map(row => `${row.ip}:${row.port}:${row.username}:${row.password}`)
      .join('\n');
    
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.txt`;
    link.click();
  };

  return { exportToCSV, exportToTXT };
}
```

---

### 3. 静态住宅选购组件

#### 3.1 CountrySelector.vue
**功能**: 国家城市选择组件

**Features**:
- 大洲切换（欧洲、南美洲、亚洲、北美洲）
- 国家卡片网格布局
- 国旗显示
- 库存数量显示
- 价格显示

**Card Structure**:
```vue
<template>
  <div class="country-grid">
    <div 
      v-for="country in filteredCountries" 
      :key="country.code"
      class="country-card"
      @click="selectCountry(country)"
    >
      <FlagIcon :country="country.code" :size="60" />
      <h3>{{ country.name }}</h3>
      <p class="city">{{ country.city }}</p>
      <p class="price">${{ country.price }}/IP</p>
      <p class="stock">数量: {{ country.stock }}</p>
    </div>
  </div>
</template>
```

**Style**:
```scss
.country-card {
  background: #2d3748;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }

  &.selected {
    border-color: #409eff;
    background: rgba(64, 158, 255, 0.1);
  }
}
```

#### 3.2 PaymentPanel.vue
**功能**: 右侧固定支付面板

**Display Info**:
```typescript
interface PaymentInfo {
  totalIPs: number;
  duration: number;      // 天数
  totalCost: number;
  discount: number;
  finalCost: number;
  paymentMethod: 'wallet' | 'alipay' | 'wechat' | 'usdt';
  walletBalance: number;
}
```

**Template**:
```vue
<template>
  <div class="payment-panel">
    <h3>支付详情</h3>
    
    <div class="info-row">
      <span>总IP数</span>
      <span class="value">{{ totalIPs }} IPs</span>
    </div>
    
    <div class="info-row">
      <span>有效期间</span>
      <span class="value">{{ duration }} 天</span>
    </div>
    
    <div class="info-row">
      <span>总计费用</span>
      <span class="value">${{ totalCost.toFixed(2) }}</span>
    </div>
    
    <div class="info-row" v-if="discount > 0">
      <span>总计优惠</span>
      <span class="value discount">使用折扣码: ${{ discount.toFixed(2) }}</span>
    </div>
    
    <div class="info-row total">
      <span>支付费用</span>
      <span class="value">${{ finalCost.toFixed(2) }}</span>
    </div>
    
    <div class="info-row">
      <span>支付方式</span>
      <span class="value">2 钱包余额支付</span>
    </div>
    
    <div class="info-row">
      <span>钱包余额</span>
      <span class="value balance">${{ walletBalance.toFixed(2) }}</span>
    </div>
    
    <el-button 
      type="primary" 
      size="large" 
      class="buy-button"
      :disabled="finalCost > walletBalance"
      @click="handlePurchase"
    >
      立即购买IP
    </el-button>
  </div>
</template>
```

---

### 4. 钱包充值组件

#### 4.1 货币转换Hook
```typescript
// composables/useCurrency.ts
export function useCurrency() {
  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => api.admin.getSystemSettings()
  });

  const usdToCny = computed(() => {
    return parseFloat(settings.value?.usd_to_cny_rate || '7.2');
  });

  const convertUSDToCNY = (usd: number) => {
    return (usd * usdToCny.value).toFixed(2);
  };

  return { usdToCny, convertUSDToCNY };
}
```

#### 4.2 Recharge.vue 重构
**Features**:
- 快捷金额选择（100、200、500、1000）
- 自定义金额输入
- 支付方式选择（微信、支付宝、USDT、美金）
- 实时汇率转换显示
- 优惠券开关
- 温馨提示区域

**Template Structure**:
```vue
<template>
  <div class="recharge-page">
    <!-- 余额卡片 -->
    <div class="balance-card">
      <div class="balance-info">
        <span>钱包余额</span>
        <span class="amount">${{ userBalance }}</span>
      </div>
      <el-button text>
        <el-icon><CreditCard /></el-icon>
        充值卡兑换
      </el-button>
    </div>

    <!-- 充值表单 -->
    <el-card class="recharge-form">
      <!-- 充值金额 -->
      <div class="form-section">
        <h3>充值金额</h3>
        <div class="amount-selector">
          <el-button @click="minus">-</el-button>
          <el-input-number v-model="amount" :min="1" :max="10000" />
          <el-button @click="plus">+</el-button>
        </div>
      </div>

      <!-- 优惠券 -->
      <div class="form-section">
        <h3>优惠券</h3>
        <el-switch v-model="useCoupon" />
      </div>

      <!-- 支付方式 -->
      <div class="form-section">
        <h3>支付方式</h3>
        <div class="payment-methods">
          <div 
            class="method-card"
            :class="{ active: paymentMethod === 'wechat' }"
            @click="paymentMethod = 'wechat'"
          >
            <el-icon><ChatDotRound /></el-icon>
            <span>微信支付</span>
          </div>
          <!-- 其他支付方式... -->
        </div>
      </div>

      <!-- 汇率转换（美金时显示） -->
      <div v-if="paymentMethod === 'usd'" class="currency-conversion">
        <p>充值金额: ${{ amount }}</p>
        <p>人民币约: ¥{{ convertUSDToCNY(amount) }} (汇率: 1 USD = {{ usdToCny }} CNY)</p>
      </div>

      <!-- 温馨提示 -->
      <div class="tips">
        <p><el-icon><InfoFilled /></el-icon> 所有产品都设支持特惠网络环境下使用</p>
        <p><el-icon><InfoFilled /></el-icon> 一次性充值套餐购买套餐，可以根据用户不同需求套餐</p>
        <p><el-icon><InfoFilled /></el-icon> 开通过扣刚套餐享优惠折扣优惠，不使用完余额即刻取，不予退款</p>
      </div>

      <!-- 提交按钮 -->
      <el-button type="primary" size="large" @click="submitRecharge">
        确认并支付
      </el-button>
      <el-button size="large" @click="router.back()">
        明细
      </el-button>
    </el-card>
  </div>
</template>
```

---

### 5. 账单明细组件

#### 5.1 通用表格布局
所有账单页面（费用明细、交易明细、结算记录、充值订单）使用统一的布局：

```vue
<template>
  <div class="billing-page">
    <!-- 顶部筛选栏 -->
    <SearchFilter :filters="filterConfig" @search="handleSearch" @reset="handleReset" />

    <!-- 数据概览卡片（费用明细专用） -->
    <div v-if="showSummary" class="summary-cards">
      <SummaryCard v-for="card in summaryData" :key="card.title" :data="card" />
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" stripe>
      <el-table-column v-for="col in columns" :key="col.prop" v-bind="col" />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next, sizes"
      @current-change="loadData"
      @size-change="loadData"
    />
  </div>
</template>
```

#### 5.2 交易类型标签
```vue
<template>
  <el-tag :type="tagType" size="small">
    {{ tagText }}
  </el-tag>
</template>

<script setup lang="ts">
const tagTypeMap = {
  '租用住宅': 'primary',
  '购买静态IP': 'success',
  '账户充值': 'warning',
  '退款': 'danger',
  '其他': 'info'
};

const tagType = computed(() => tagTypeMap[props.type] || 'info');
</script>
```

---

## 🎯 深色主题配置

### 1. SCSS变量
```scss
// styles/variables.scss
$dark-bg-primary: #1a1a1a;
$dark-bg-secondary: #2a2a2a;
$dark-bg-card: #2d3748;
$dark-border: #4a5568;
$dark-text-primary: #ffffff;
$dark-text-secondary: #a0aec0;
$dark-text-muted: #718096;

$primary-color: #409eff;
$success-color: #00e676;
$warning-color: #ff9800;
$danger-color: #f44336;
$info-color: #448aff;

$gradient-blue: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
$gradient-green: linear-gradient(135deg, #00e676 0%, #69f0ae 100%);
$gradient-purple: linear-gradient(135deg, #7c4dff 0%, #b47cff 100%);
$gradient-pink: linear-gradient(135deg, #ff4081 0%, #ff80ab 100%);
```

### 2. Element Plus主题覆盖
```scss
// styles/dark-theme.scss
:root {
  --el-bg-color: #{$dark-bg-primary};
  --el-bg-color-page: #{$dark-bg-secondary};
  --el-text-color-primary: #{$dark-text-primary};
  --el-text-color-regular: #{$dark-text-secondary};
  --el-border-color: #{$dark-border};
  --el-fill-color-blank: #{$dark-bg-card};
  
  // 表格
  --el-table-bg-color: #{$dark-bg-card};
  --el-table-tr-bg-color: #{$dark-bg-card};
  --el-table-header-bg-color: #{$dark-bg-secondary};
  
  // 卡片
  --el-card-bg-color: #{$dark-bg-card};
  --el-card-border-color: #{$dark-border};
}
```

---

## 📡 API集成设计

### 1. 985Proxy API封装
```typescript
// api/modules/985proxy.ts
import axios from 'axios';

const proxy985API = axios.create({
  baseURL: process.env.VITE_985PROXY_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.VITE_985PROXY_API_KEY}`
  }
});

export const proxy985 = {
  // 获取动态通道列表
  async getChannels() {
    const { data } = await proxy985API.get('/channels');
    return data;
  },

  // 获取静态IP库存
  async getStaticInventory(params: {
    continent?: string;
    country?: string;
    ipType?: 'normal' | 'native';
  }) {
    const { data } = await proxy985API.get('/static/inventory', { params });
    return data;
  },

  // 获取流量统计
  async getTrafficStats(params: {
    startDate: string;
    endDate: string;
    type?: 'dc' | 'mobile' | 'res_rotating' | 'static';
  }) {
    const { data } = await proxy985API.get('/stats/traffic', { params });
    return data;
  }
};
```

### 2. 后端API实现优先级
**Phase 1**: Mock数据实现（快速原型）
**Phase 2**: 对接985Proxy API
**Phase 3**: 完善错误处理和缓存

---

## 🧪 测试策略

### 1. 单元测试
使用Vitest测试核心功能：
- 货币转换计算
- 日期格式化
- 导出功能

### 2. 组件测试
使用Vue Test Utils测试：
- 图表渲染
- 表单验证
- 交互行为

### 3. E2E测试
使用Chrome DevTools MCP：
- 完整购买流程
- 充值申请流程
- 导出功能

---

**设计完成时间**: 2025-11-02  
**版本**: v1.0


