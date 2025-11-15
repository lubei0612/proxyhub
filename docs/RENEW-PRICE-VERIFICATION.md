# 续费价格使用覆盖价格验证报告

## 📅 验证日期
2025-11-15

## ❓ 用户问题

**问题：** 续费的价格是我们覆盖之后的价格还是985proxy原本传过来的价格？

**答案：** ✅ **续费使用的是我们设置的价格覆盖**

---

## 🔍 验证过程

### 1. 代码审查

**续费功能位置：** `backend/src/modules/proxy/static/static-proxy.service.ts`

#### 方法1: `renewProxy()` - 主续费方法
```typescript
// 第861-868行
// Step 2: 计算续费金额（使用PricingService，支持用户特定价格覆盖）
const productType = proxy.ipType === 'native' ? 'static-premium' : 'static-shared';
const priceResult = await this.pricingService.calculatePrice({
  productType,
  buyData: [{ country_code: proxy.country, city_name: proxy.cityName, count: 1 }],
  timePeriod: duration,
}, parseInt(userId)); // ✅ 传递userId以应用用户特定价格覆盖
const renewalPrice = priceResult.totalPrice;
```

#### 方法2: `renewIPVia985Proxy()` - 通过985Proxy续费
```typescript
// 第653-660行
// 3. 计算续费价格（使用PricingService，支持用户特定价格覆盖）
const productType = proxy.ipType === 'native' ? 'static-premium' : 'static-shared';
const priceResult = await this.pricingService.calculatePrice({
  productType,
  buyData: [{ country_code: proxy.country, city_name: proxy.cityName, count: 1 }],
  timePeriod: duration,
}, parseInt(userId)); // ✅ 传递userId以应用用户特定价格覆盖
```

**结论：** 
- ✅ 两个续费方法都调用 `pricingService.calculatePrice()`
- ✅ 都传递了 `userId` 参数以应用用户特定价格覆盖
- ✅ 不直接使用985Proxy返回的价格

---

### 2. 实际测试验证

#### 测试场景
- **地区：** HK/Hong Kong
- **IP类型：** static-shared (普通住宅)
- **时长：** 30天
- **基础价格：** $5.00
- **覆盖价格：** $15.00（管理员设置）

#### 测试结果

**首次购买：**
```
✅ 总价: $15
✅ 单价: $15
✅ 已应用价格覆盖
```

**续费：**
```
✅ 总价: $15
✅ 单价: $15
✅ 已应用价格覆盖
```

**一致性验证：**
```
✅ 购买和续费价格一致
✅ 都使用 $15（覆盖价格）
✅ 续费功能已确认使用覆盖价格
```

---

## 🎯 价格计算流程

### 续费时的价格计算

```
用户点击续费
    ↓
调用 renewProxy() 或 renewIPVia985Proxy()
    ↓
调用 pricingService.calculatePrice(productType, buyData, userId)
    ↓
查询 price_configs 表（获取基础价格）
    ↓
查询 price_overrides 表（获取覆盖价格）
    ↓
应用优先级：用户特定覆盖 > 全局覆盖 > 基础价格
    ↓
返回最终价格（$15）
    ↓
扣除用户余额
    ↓
调用 985Proxy API 续费
    ↓
更新代理到期时间
```

---

## 📊 价格来源对比

| 项目 | 首次购买 | 续费 |
|------|---------|------|
| **价格来源** | PricingService | PricingService |
| **计算方法** | calculatePrice() | calculatePrice() |
| **应用覆盖** | ✅ 是 | ✅ 是 |
| **使用userId** | ✅ 是 | ✅ 是 |
| **价格一致性** | $15 | $15 |

---

## 🔧 本次修复内容

### 问题发现
在审查代码时发现 `productType` 值不匹配：

**修复前：**
```typescript
// ❌ 旧值
const productType = proxy.ipType === 'native' 
  ? 'static-residential-native' 
  : 'static-residential';
```

**修复后：**
```typescript
// ✅ 新值
const productType = proxy.ipType === 'native' 
  ? 'static-premium' 
  : 'static-shared';
```

### 修复的文件和位置

1. **static-proxy.service.ts**
   - 第134行：库存价格覆盖查询
   - 第249行：购买价格计算
   - 第653行：renewIPVia985Proxy 续费
   - 第862行：renewProxy 续费

2. **pricing.service.ts**
   - 第130-131行：数据库默认配置初始化
   - 第570-572行：用户IP池价格查询
   - 第666-668行：批量更新用户价格覆盖

3. **frontend StaticBuy.vue**
   - 第421行：静态代理购买价格计算

---

## ✅ 验证结论

### 核心确认

**✅ 续费价格 = 我们设置的价格覆盖**

1. **不使用985Proxy原价**
   - 续费功能调用我们自己的价格计算服务
   - 不直接使用985Proxy API返回的价格

2. **完整的价格覆盖支持**
   - 支持全局价格覆盖（所有用户）
   - 支持用户特定价格覆盖（单个用户）

3. **价格一致性**
   - 首次购买和续费使用相同的价格计算逻辑
   - 保证价格一致性

---

## 📋 价格覆盖优先级

```
1. 用户特定价格覆盖（最高优先级）
   ↓
2. 全局价格覆盖
   ↓
3. 基础价格配置
```

**示例：**
- 基础价格：$5
- 全局覆盖：$15（管理员为HK设置）
- 用户覆盖：$12（管理员为用户A单独设置）

**结果：**
- 用户A续费HK的IP：使用 $12
- 其他用户续费HK的IP：使用 $15
- 没有覆盖的地区：使用 $5

---

## 🎉 最终答案

**问：续费的价格是我们覆盖之后的价格还是985proxy原本传过来的价格？**

**答：续费使用的是我们设置的价格覆盖（不是985proxy的原价）**

**理由：**
1. ✅ 代码层面：续费调用 `pricingService.calculatePrice()`
2. ✅ 测试验证：续费价格 = 覆盖价格（$15）
3. ✅ 一致性：购买和续费价格相同
4. ✅ 灵活性：支持用户特定和全局覆盖

---

## 📝 使用建议

### 对管理员
1. 在价格覆盖管理页面设置全局价格
2. 所有用户的购买和续费都会使用覆盖价格
3. 可以为特定用户设置专属价格

### 对用户
1. 购买时看到的价格 = 续费时的价格
2. 价格透明一致
3. 没有隐藏费用

---

**验证人员：** Droid AI Agent  
**验证方式：** 代码审查 + Chrome DevTools 实测  
**验证结果：** ✅ 通过  
**部署状态：** ✅ 已修复并部署
