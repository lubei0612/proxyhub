# ProxyHub 代理价格策略文档

## 📋 文档说明

本文档详细描述ProxyHub平台的代理IP价格策略、计算逻辑、汇率换算规则和折扣体系，确保新Cursor能完整理解并正确实现定价功能。

---

## 💰 价格策略概述

### 核心原则
1. **基础价格 + 覆盖价格** - 支持按国家/城市差异化定价
2. **时长折扣** - 购买时长越长，折扣越大
3. **实时汇率** - USD与CNY实时换算
4. **透明计费** - 用户可提前预览价格

---

## 🏷️ 1. 代理类型和基础价格

### 1.1 静态住宅代理（Static Residential）

#### 类型A：共享IP（shared）
```yaml
产品类型: static_shared
基础价格: $5.00 USD / IP / 月
计费单位: 每个IP每30天
最小购买: 1个IP
最短时长: 30天（1个月）
时长倍数: 必须是30天的整数倍（30/60/90/180/360天）
```

**使用场景**：
- 常规业务使用
- 成本敏感型客户
- 中等并发需求

#### 类型B：原生IP（premium）
```yaml
产品类型: static_premium
基础价格: $10.00 USD / IP / 月
计费单位: 每个IP每30天
最小购买: 1个IP
最短时长: 30天（1个月）
时长倍数: 必须是30天的整数倍
```

**使用场景**：
- 需要原生IP的业务（流媒体、社交媒体）
- 高质量要求
- 低封禁率需求

---

### 1.2 动态住宅代理（Dynamic Residential）

```yaml
产品类型: res_rotating
计费方式: 按流量计费（从985Proxy实时获取）
时效: 1-120分钟可选
特点: 
  - IP池轮换
  - 按需提取
  - 不预存库存
```

**价格获取**：
- 动态代理价格直接从985Proxy API获取
- 平台不加价，透传985Proxy的价格
- 用户支付的金额 = 985Proxy返回的价格

---

## 📊 2. 价格计算逻辑

### 2.1 基础价格配置（数据库表：price_configs）

```sql
-- 价格配置表
CREATE TABLE price_configs (
    id UUID PRIMARY KEY,
    product_type VARCHAR(50) UNIQUE NOT NULL,  -- 'static_shared' 或 'static_premium'
    base_price DECIMAL(10, 2) NOT NULL,        -- 基础价格（美元/IP/月）
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 初始数据
INSERT INTO price_configs (product_type, base_price, is_active) VALUES
('static_shared', 5.00, TRUE),
('static_premium', 10.00, TRUE);
```

### 2.2 价格覆盖（数据库表：price_overrides）

支持对特定国家/城市设置不同价格：

```sql
-- 价格覆盖表
CREATE TABLE price_overrides (
    id UUID PRIMARY KEY,
    price_config_id UUID REFERENCES price_configs(id),
    country_code VARCHAR(10) NOT NULL,         -- 国家代码（如：US, CN, JP）
    city_name VARCHAR(100),                    -- 城市名（可选，为空则应用到整个国家）
    override_price DECIMAL(10, 2) NOT NULL,    -- 覆盖价格
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 示例：美国IP更贵
INSERT INTO price_overrides (price_config_id, country_code, city_name, override_price, is_active)
SELECT id, 'US', NULL, 8.00, TRUE FROM price_configs WHERE product_type = 'static_shared';

-- 示例：日本东京的premium IP更贵
INSERT INTO price_overrides (price_config_id, country_code, city_name, override_price, is_active)
SELECT id, 'JP', 'Tokyo', 15.00, TRUE FROM price_configs WHERE product_type = 'static_premium';
```

**优先级规则**：
1. 先查找：国家 + 城市的覆盖价格
2. 再查找：国家的覆盖价格
3. 最后使用：基础价格

---

### 2.3 价格计算公式

#### 静态代理价格计算

```typescript
// 计算公式
totalPrice = unitPrice × quantity × months

其中：
- unitPrice: 单价（美元/IP/月）
  - 优先使用覆盖价格（如果存在）
  - 否则使用基础价格
- quantity: 购买数量（IP个数）
- months: 购买月数（time_period / 30）
- time_period: 购买时长（天数，必须是30的倍数）
```

**计算示例1**：购买5个共享IP，3个月
```
基础价格: $5.00
数量: 5个
时长: 90天 = 3个月
总价: $5.00 × 5 × 3 = $75.00
```

**计算示例2**：购买2个美国共享IP（有覆盖价格），2个月
```
覆盖价格: $8.00（美国IP）
数量: 2个
时长: 60天 = 2个月
总价: $8.00 × 2 × 2 = $32.00
```

**计算示例3**：购买10个不同国家/城市的IP
```
假设购买清单：
- 5个美国洛杉矶 IP（覆盖价: $8.00） × 2个月 = $80.00
- 3个日本东京 IP（覆盖价: $15.00） × 2个月 = $90.00
- 2个英国伦敦 IP（基础价: $10.00） × 2个月 = $40.00
总价: $80.00 + $90.00 + $40.00 = $210.00
```

---

### 2.4 价格计算API实现

```typescript
// POST /api/v1/price/calculate
async calculatePrice(dto: CalculatePriceDto): Promise<PriceResult> {
  const { productType, buyData, timePeriod } = dto;
  
  // 1. 获取基础价格配置
  const priceConfig = await this.priceConfigRepo.findOne({
    where: { product_type: productType, is_active: true }
  });
  
  let totalPrice = 0;
  const months = timePeriod / 30;
  
  // 2. 遍历购买清单，计算每个项目的价格
  for (const item of buyData) {
    // 2.1 查找覆盖价格（国家 + 城市）
    let unitPrice = priceConfig.base_price;
    const override = await this.priceOverrideRepo.findOne({
      where: {
        price_config_id: priceConfig.id,
        country_code: item.country_code,
        city_name: item.city_name || null,
        is_active: true
      }
    });
    
    if (override) {
      unitPrice = override.override_price;
    } else {
      // 2.2 如果没有城市级别覆盖，查找国家级别覆盖
      const countryOverride = await this.priceOverrideRepo.findOne({
        where: {
          price_config_id: priceConfig.id,
          country_code: item.country_code,
          city_name: null,
          is_active: true
        }
      });
      if (countryOverride) {
        unitPrice = countryOverride.override_price;
      }
    }
    
    // 2.3 计算该项目的总价
    const itemTotal = unitPrice * parseInt(item.count) * months;
    totalPrice += itemTotal;
  }
  
  // 3. 应用优惠码（如果有）
  let discountAmount = 0;
  if (dto.promoCode) {
    discountAmount = await this.calculatePromoDiscount(dto.promoCode, totalPrice);
  }
  
  const finalPrice = totalPrice - discountAmount;
  
  return {
    unitPrice: null, // 多国家购买时不返回单价
    totalPrice,      // 总价（折扣前）
    discountAmount,  // 优惠金额
    finalPrice,      // 最终价格（折扣后）
    currency: 'USD'
  };
}
```

---

## 💱 3. 汇率换算策略

### 3.1 汇率配置（数据库表：exchange_rates）

```sql
-- 汇率表
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY,
    from_currency VARCHAR(10) NOT NULL,  -- 源货币（USD）
    to_currency VARCHAR(10) NOT NULL,    -- 目标货币（CNY）
    rate DECIMAL(10, 4) NOT NULL,        -- 汇率
    updated_at TIMESTAMP,
    UNIQUE(from_currency, to_currency)
);

-- 初始汇率
INSERT INTO exchange_rates (from_currency, to_currency, rate, updated_at) VALUES
('USD', 'CNY', 7.25, CURRENT_TIMESTAMP);
```

### 3.2 汇率更新策略

**管理员手动更新**：
```typescript
// POST /api/v1/exchange-rate/update (管理员)
async updateExchangeRate(dto: UpdateRateDto) {
  await this.exchangeRateRepo.upsert({
    from_currency: dto.fromCurrency,
    to_currency: dto.toCurrency,
    rate: dto.rate,
    updated_at: new Date()
  }, ['from_currency', 'to_currency']);
  
  // 清除缓存
  await this.cacheService.del(`exchange_rate:${dto.fromCurrency}:${dto.toCurrency}`);
  
  return { message: 'Exchange rate updated' };
}
```

**汇率缓存策略**：
```typescript
// 缓存时间：1小时
const CACHE_TTL = 3600; // 秒

async getCurrentRate(from: string, to: string): Promise<number> {
  const cacheKey = `exchange_rate:${from}:${to}`;
  
  // 1. 尝试从缓存获取
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    return parseFloat(cached);
  }
  
  // 2. 从数据库获取
  const rate = await this.exchangeRateRepo.findOne({
    where: { from_currency: from, to_currency: to }
  });
  
  if (!rate) {
    throw new NotFoundException('Exchange rate not found');
  }
  
  // 3. 存入缓存
  await this.cacheService.set(cacheKey, rate.rate.toString(), CACHE_TTL);
  
  return rate.rate;
}
```

### 3.3 前端实时换算

**充值页面示例**：
```vue
<template>
  <div class="recharge-form">
    <!-- USD输入 -->
    <el-form-item label="充值金额（USD）">
      <el-input
        v-model.number="amountUSD"
        type="number"
        placeholder="请输入金额"
        @input="handleAmountChange"
      />
    </el-form-item>
    
    <!-- CNY显示（实时换算） -->
    <el-form-item label="人民币金额（CNY）">
      <el-input
        :value="amountCNY"
        readonly
        disabled
      >
        <template #prepend>
          <span>汇率: 1 USD = {{ exchangeRate }} CNY</span>
        </template>
      </el-input>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCurrentRate } from '@/api/exchange-rate';

const amountUSD = ref(0);
const exchangeRate = ref(7.25);

// 计算人民币金额
const amountCNY = computed(() => {
  return (amountUSD.value * exchangeRate.value).toFixed(2);
});

// 获取当前汇率
const fetchRate = async () => {
  try {
    const res = await getCurrentRate('USD', 'CNY');
    exchangeRate.value = res.rate;
  } catch (error) {
    console.error('Failed to fetch exchange rate');
  }
};

onMounted(() => {
  fetchRate();
});
</script>
```

---

## 🎟️ 4. 优惠码系统（可选功能）

### 4.1 优惠码类型

```typescript
enum PromoCodeType {
  PERCENTAGE = 'percentage',  // 百分比折扣（如：10% off）
  FIXED = 'fixed',           // 固定金额折扣（如：$5 off）
  FREE_TRIAL = 'free_trial'  // 免费试用
}
```

### 4.2 优惠码配置（数据库表：promo_codes）

```sql
-- 优惠码表
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,        -- 优惠码（如：WELCOME10）
    type VARCHAR(20) NOT NULL,               -- percentage/fixed/free_trial
    value DECIMAL(10, 2) NOT NULL,           -- 折扣值（10表示10%或$10）
    min_amount DECIMAL(10, 2),               -- 最低消费要求
    max_discount DECIMAL(10, 2),             -- 最大折扣金额
    valid_from TIMESTAMP,                    -- 有效期开始
    valid_until TIMESTAMP,                   -- 有效期结束
    usage_limit INTEGER,                     -- 总使用次数限制
    usage_count INTEGER DEFAULT 0,           -- 已使用次数
    per_user_limit INTEGER DEFAULT 1,        -- 每用户使用次数限制
    is_active BOOLEAN DEFAULT TRUE
);

-- 示例优惠码
INSERT INTO promo_codes (code, type, value, min_amount, max_discount, valid_until, usage_limit, is_active)
VALUES 
('WELCOME10', 'percentage', 10.00, 50.00, 20.00, '2025-12-31', 1000, TRUE),
('SAVE5', 'fixed', 5.00, 20.00, NULL, '2025-12-31', NULL, TRUE);
```

### 4.3 优惠码计算逻辑

```typescript
async calculatePromoDiscount(code: string, totalPrice: number, userId: string): Promise<number> {
  // 1. 查找优惠码
  const promo = await this.promoCodeRepo.findOne({
    where: { code: code.toUpperCase(), is_active: true }
  });
  
  if (!promo) {
    throw new BadRequestException('Invalid promo code');
  }
  
  // 2. 检查有效期
  const now = new Date();
  if (promo.valid_from && now < promo.valid_from) {
    throw new BadRequestException('Promo code not yet valid');
  }
  if (promo.valid_until && now > promo.valid_until) {
    throw new BadRequestException('Promo code expired');
  }
  
  // 3. 检查使用次数
  if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
    throw new BadRequestException('Promo code usage limit reached');
  }
  
  // 4. 检查用户使用次数
  const userUsageCount = await this.promoUsageRepo.count({
    where: { promo_code_id: promo.id, user_id: userId }
  });
  if (promo.per_user_limit && userUsageCount >= promo.per_user_limit) {
    throw new BadRequestException('You have reached the usage limit for this promo code');
  }
  
  // 5. 检查最低消费要求
  if (promo.min_amount && totalPrice < promo.min_amount) {
    throw new BadRequestException(`Minimum purchase amount is $${promo.min_amount}`);
  }
  
  // 6. 计算折扣金额
  let discountAmount = 0;
  
  if (promo.type === 'percentage') {
    // 百分比折扣
    discountAmount = (totalPrice * promo.value) / 100;
    
    // 应用最大折扣限制
    if (promo.max_discount && discountAmount > promo.max_discount) {
      discountAmount = promo.max_discount;
    }
  } else if (promo.type === 'fixed') {
    // 固定金额折扣
    discountAmount = promo.value;
    
    // 折扣不能超过总价
    if (discountAmount > totalPrice) {
      discountAmount = totalPrice;
    }
  }
  
  return discountAmount;
}
```

---

## 💳 5. 支付方式

### 5.1 支持的支付方式

```typescript
enum PaymentMethod {
  BALANCE = 'balance',      // 余额支付（从用户balance扣款）
  GIFT = 'gift',           // 赠送金支付（从用户gift_balance扣款）
  WECHAT = 'wechat',       // 微信支付（充值时）
  USDT = 'usdt'            // USDT支付（充值时）
}
```

### 5.2 支付优先级规则

**购买代理时**：
```typescript
// 用户可以选择支付方式
paymentMethod: 'balance' | 'gift'

// 支付逻辑
if (paymentMethod === 'balance') {
  // 从余额扣款
  if (user.balance < finalPrice) {
    throw new BadRequestException('Insufficient balance');
  }
  user.balance -= finalPrice;
} else if (paymentMethod === 'gift') {
  // 从赠送金扣款
  if (user.gift_balance < finalPrice) {
    throw new BadRequestException('Insufficient gift balance');
  }
  user.gift_balance -= finalPrice;
}
```

**充值时**：
```typescript
// 用户选择充值方式
paymentMethod: 'wechat' | 'usdt'

// 充值后增加余额
if (recharge.status === 'approved') {
  user.balance += recharge.amount_usd;
}
```

---

## 📋 6. 价格展示规则

### 6.1 库存页面价格展示

**API响应格式**（来自985Proxy）：
```json
{
  "code": 0,
  "data": [
    {
      "country_code": "US",
      "city_name": "Los Angeles",
      "number": 150,
      "price": 8.00,           // 实际售价（已应用覆盖价格）
      "origin_price": 10.00,   // 原价（基础价格）
      "discount": 20           // 折扣比例（20%）
    },
    {
      "country_code": "JP",
      "city_name": "Tokyo",
      "number": 80,
      "price": 15.00,
      "origin_price": 15.00,
      "discount": 0
    }
  ]
}
```

**前端展示**：
```vue
<template>
  <div class="proxy-card">
    <div class="location">
      <country-flag :country="item.country_code" />
      <span>{{ item.city_name }}</span>
    </div>
    
    <div class="inventory">
      库存: {{ item.number }}
    </div>
    
    <div class="price">
      <!-- 如果有折扣，显示原价和折扣 -->
      <template v-if="item.discount > 0">
        <span class="original-price">${{ item.origin_price }}/月</span>
        <span class="current-price">${{ item.price }}/月</span>
        <el-tag type="danger" size="small">{{ item.discount }}% OFF</el-tag>
      </template>
      
      <!-- 无折扣，直接显示价格 -->
      <template v-else>
        <span class="current-price">${{ item.price }}/月</span>
      </template>
    </div>
    
    <el-button type="primary" @click="handleAddToCart">
      加入购物车
    </el-button>
  </div>
</template>
```

### 6.2 购物车价格预览

```vue
<template>
  <div class="cart-summary">
    <div class="cart-items">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <span>{{ item.country }} - {{ item.city }}</span>
        <span>× {{ item.quantity }}</span>
        <span>${{ (item.unitPrice * item.quantity * months).toFixed(2) }}</span>
      </div>
    </div>
    
    <div class="price-breakdown">
      <div class="row">
        <span>小计</span>
        <span>${{ totalPrice.toFixed(2) }}</span>
      </div>
      
      <div class="row" v-if="discountAmount > 0">
        <span>优惠码折扣</span>
        <span class="discount">-${{ discountAmount.toFixed(2) }}</span>
      </div>
      
      <div class="row total">
        <span>总计</span>
        <span class="final-price">${{ finalPrice.toFixed(2) }}</span>
      </div>
    </div>
    
    <div class="duration-selector">
      <el-radio-group v-model="duration">
        <el-radio :label="30">1个月 (${{ calculatePrice(30) }})</el-radio>
        <el-radio :label="90">3个月 (${{ calculatePrice(90) }})</el-radio>
        <el-radio :label="180">6个月 (${{ calculatePrice(180) }})</el-radio>
        <el-radio :label="360">12个月 (${{ calculatePrice(360) }})</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>
```

---

## 🔄 7. 价格同步策略

### 7.1 从985Proxy获取库存和价格

```typescript
// GET /api/v1/proxy/static/inventory
async getInventory(staticProxyType: string): Promise<ProxyInventory[]> {
  const cacheKey = `inventory:${staticProxyType}`;
  
  // 1. 尝试从缓存获取（1小时缓存）
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 2. 调用985Proxy API
  const response = await this.proxy985Service.getInventory(staticProxyType);
  
  // 3. 应用平台价格覆盖
  const inventory = await this.applyPriceOverrides(response.data, staticProxyType);
  
  // 4. 存入缓存
  await this.cacheService.set(cacheKey, JSON.stringify(inventory), 3600);
  
  return inventory;
}

// 应用平台价格覆盖
async applyPriceOverrides(items: any[], staticProxyType: string): Promise<ProxyInventory[]> {
  const productType = staticProxyType === 'shared' ? 'static_shared' : 'static_premium';
  
  // 获取基础价格
  const priceConfig = await this.priceConfigRepo.findOne({
    where: { product_type: productType, is_active: true }
  });
  
  // 获取所有覆盖价格
  const overrides = await this.priceOverrideRepo.find({
    where: { price_config_id: priceConfig.id, is_active: true }
  });
  
  // 应用覆盖价格
  return items.map(item => {
    let finalPrice = priceConfig.base_price;
    const originPrice = priceConfig.base_price;
    
    // 查找覆盖价格
    const override = overrides.find(o => 
      o.country_code === item.country_code && 
      (o.city_name === item.city_name || o.city_name === null)
    );
    
    if (override) {
      finalPrice = override.override_price;
    }
    
    // 计算折扣
    const discount = originPrice > finalPrice 
      ? Math.round(((originPrice - finalPrice) / originPrice) * 100)
      : 0;
    
    return {
      country_code: item.country_code,
      city_name: item.city_name,
      number: item.number,
      price: finalPrice,
      origin_price: originPrice,
      discount
    };
  });
}
```

---

## 📊 8. 价格管理后台

### 8.1 管理员功能

**功能列表**：
1. ✅ 查看当前价格配置
2. ✅ 修改基础价格
3. ✅ 添加价格覆盖（按国家/城市）
4. ✅ 删除价格覆盖
5. ✅ 更新汇率
6. ✅ 创建/管理优惠码

### 8.2 价格管理API

```typescript
// ============================================================
// 价格配置管理
// ============================================================

// 获取所有价格配置（管理员）
GET /api/v1/admin/price/configs

// 更新价格配置（管理员）
PUT /api/v1/admin/price/configs/:id
Body: {
  base_price: 6.00,
  is_active: true
}

// ============================================================
// 价格覆盖管理
// ============================================================

// 获取所有价格覆盖（管理员）
GET /api/v1/admin/price/overrides?product_type=static_shared

// 创建价格覆盖（管理员）
POST /api/v1/admin/price/overrides
Body: {
  product_type: "static_shared",
  country_code: "US",
  city_name: "New York",
  override_price: 9.00
}

// 更新价格覆盖（管理员）
PUT /api/v1/admin/price/overrides/:id
Body: {
  override_price: 9.50,
  is_active: true
}

// 删除价格覆盖（管理员）
DELETE /api/v1/admin/price/overrides/:id

// ============================================================
// 汇率管理
// ============================================================

// 更新汇率（管理员）
POST /api/v1/admin/exchange-rate/update
Body: {
  from_currency: "USD",
  to_currency: "CNY",
  rate: 7.30
}
```

---

## 🧪 9. 价格测试用例

### 9.1 基础价格测试

```typescript
describe('Price Calculation', () => {
  it('应该正确计算单个IP的价格', async () => {
    const result = await priceService.calculate({
      productType: 'static_shared',
      quantity: 1,
      timePeriod: 30
    });
    
    expect(result.finalPrice).toBe(5.00);
  });
  
  it('应该正确计算多个IP多个月的价格', async () => {
    const result = await priceService.calculate({
      productType: 'static_shared',
      quantity: 5,
      timePeriod: 90 // 3个月
    });
    
    expect(result.finalPrice).toBe(75.00); // 5 × 5 × 3 = 75
  });
});
```

### 9.2 覆盖价格测试

```typescript
it('应该应用国家级别的覆盖价格', async () => {
  // 假设美国IP覆盖价格为 $8.00
  const result = await priceService.calculate({
    productType: 'static_shared',
    buyData: [
      { country_code: 'US', city_name: 'Los Angeles', count: 2 }
    ],
    timePeriod: 30
  });
  
  expect(result.finalPrice).toBe(16.00); // 8 × 2 × 1 = 16
});

it('应该应用城市级别的覆盖价格（优先级更高）', async () => {
  // 假设日本东京的premium IP覆盖价格为 $15.00
  const result = await priceService.calculate({
    productType: 'static_premium',
    buyData: [
      { country_code: 'JP', city_name: 'Tokyo', count: 1 }
    ],
    timePeriod: 60 // 2个月
  });
  
  expect(result.finalPrice).toBe(30.00); // 15 × 1 × 2 = 30
});
```

### 9.3 优惠码测试

```typescript
it('应该正确应用百分比优惠码', async () => {
  // 10% off优惠码
  const result = await priceService.calculate({
    productType: 'static_shared',
    quantity: 10,
    timePeriod: 30,
    promoCode: 'WELCOME10'
  });
  
  expect(result.totalPrice).toBe(50.00);      // 5 × 10 = 50
  expect(result.discountAmount).toBe(5.00);   // 50 × 10% = 5
  expect(result.finalPrice).toBe(45.00);      // 50 - 5 = 45
});
```

---

## 📝 10. 总结和关键点

### 关键价格策略

1. **基础价格体系**：
   - Shared: $5/IP/月
   - Premium: $10/IP/月
   - 可按国家/城市覆盖

2. **计算公式**：
   ```
   总价 = 单价 × 数量 × 月数
   最终价格 = 总价 - 优惠金额
   ```

3. **汇率策略**：
   - USD ↔ CNY 实时换算
   - 管理员手动更新
   - 缓存1小时

4. **支付方式**：
   - 余额支付（balance）
   - 赠送金支付（gift_balance）
   - 充值：微信/USDT

5. **优惠码（可选）**：
   - 百分比折扣
   - 固定金额折扣
   - 使用限制

### 实现要点

1. ✅ 价格覆盖优先级：城市 > 国家 > 基础价格
2. ✅ 时长必须是30天的整数倍
3. ✅ 库存价格缓存1小时，提高性能
4. ✅ 管理员可实时更新价格和汇率
5. ✅ 前端实时预览价格，用户心中有数

### 给新Cursor的关键提示

```
在实现价格系统时，请注意：

1. 价格计算逻辑要准确，特别是覆盖价格的优先级
2. 汇率换算要实时显示，给用户明确的金额感知
3. 购物车要实时计算总价，支持时长切换
4. 所有价格相关操作要有日志记录（审计）
5. 价格更新后要清除相关缓存
6. 前端展示价格时，保留2位小数
7. 优惠码验证要严格，防止滥用

参考 implementation-guide.md 中的代码示例实现。
```

---

**文档版本**: v1.0  
**创建日期**: 2025-11-02  
**适用范围**: ProxyHub项目完整复刻

