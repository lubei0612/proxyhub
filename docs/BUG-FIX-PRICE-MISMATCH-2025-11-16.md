# 🚨 严重Bug修复：价格覆盖导致985Proxy扣费不一致

**发现日期**: 2025-11-16  
**严重程度**: 🔴 Critical（严重）  
**影响**: 用户购买原生IP时，985Proxy扣费但系统未记录IP

---

## 🐛 Bug描述

### 问题现象
用户购买原生IP时：
1. ✅ 前端显示价格：$3（价格覆盖生效）
2. ✅ 985Proxy API调用成功，实际扣费：$8
3. ❌ 系统尝试从用户余额扣$3
4. ❌ 如果用户余额不足$8，事务回滚
5. ❌ **结果**：985Proxy扣了$8，但用户在系统中看不到IP

### 根本原因

**价格覆盖的设计缺陷**：
- 价格覆盖只在我们系统内部有效（用于给特定用户优惠）
- 985Proxy按原价收费（不知道我们的价格覆盖）
- 系统使用覆盖后的价格扣用户余额
- 但985Proxy已经按原价扣费了

**示例**：
```
原生IP原价: $8/月
价格覆盖后: $3/月

购买流程：
1. 用户余额: $5
2. 系统检查：$5 >= $3 ✅ 通过
3. 调用985Proxy API：扣费$8 ✅
4. 等待IP分配：获取到IP ✅
5. 保存IP到数据库：成功 ✅
6. 扣除用户余额：$5 - $3 = $2 ✅
7. 但985Proxy实际扣了$8
8. 用户实际余额应该是：$5 - $8 = -$3（负数！）
9. 系统检测到余额异常，事务回滚 ❌
10. 数据库中的IP记录被删除 ❌
11. 但985Proxy的$8无法退回 ❌
```

---

## 🔧 修复方案

### 方案1：使用985Proxy实际支付金额（已实施）

修改购买逻辑，在获取到985Proxy订单结果后，使用实际支付金额而不是预计金额：

**修改文件**: `backend/src/modules/proxy/static/static-proxy.service.ts`

**修改1**: 允许totalPrice被修改
```typescript
// 第273行
- const totalPrice = priceResult.totalPrice;
+ let totalPrice = priceResult.totalPrice; // 允许后续使用985Proxy实际金额覆盖
```

**修改2**: 获取并使用实际支付金额
```typescript
// 第385-390行（获取IP后）
const actualPayPrice = parseFloat(orderResult.data.info?.pay_price || orderResult.data.info?.total_price || '0');
if (actualPayPrice > 0 && actualPayPrice !== totalPrice) {
  this.logger.warn(`⚠️ [Purchase] 价格不一致！预计: $${totalPrice}, 实际: $${actualPayPrice} - 将使用实际金额`);
  totalPrice = actualPayPrice; // 使用985Proxy实际扣费金额
}
```

### 方案2：价格覆盖的正确使用方式（未来改进）

**选项A**: 购买前先获取准确报价
- 调用985Proxy的`/res_static/calculate_price` API
- 获取实际价格后，再决定是否使用价格覆盖
- 如果使用价格覆盖，差价由平台补贴

**选项B**: 取消价格覆盖功能
- 所有用户按985Proxy原价购买
- 通过充值优惠、赠送余额等方式给用户优惠

**选项C**: 只在充值时应用优惠
- 购买IP按原价
- 给特定用户充值时赠送额外余额

---

## 📊 影响范围

### 受影响的订单
从服务器日志查询：
```sql
SELECT id, order_no, user_id, status, amount, created_at
FROM orders
WHERE status = 'processing' 
  AND remark LIKE '%premium%'
ORDER BY created_at DESC;
```

**服务器结果**：
- 4个订单处于`processing`状态
- 全部是user_id = 5和6的用户
- 全部是原生IP购买
- 金额全部显示为$5

### 需要手动处理的订单

可以使用`syncOrderIPs` API手动同步IP：

```bash
# 对于每个processing状态的订单
curl -X POST http://localhost:3000/api/v1/proxy/static/order/{orderNo}/sync \
  -H "Authorization: Bearer {token}"
```

---

## ✅ 修复后的行为

### 购买流程
1. ✅ 用户看到价格：$3（价格覆盖）
2. ✅ 系统检查余额：需要至少$3
3. ✅ 调用985Proxy API：实际扣费$8
4. ✅ 获取到IP和实际支付金额
5. ✅ **使用实际金额$8扣除用户余额**
6. ✅ 保存IP到数据库
7. ✅ 提交事务

### 用户体验说明
- 用户在选购页面看到优惠价格
- 购买时实际按985Proxy原价扣费
- **注意**：这意味着价格覆盖目前不生效
- 建议暂时移除价格覆盖功能，或改用其他优惠方式

---

## 🔍 测试验证

### 本地测试
1. 设置一个价格覆盖（例如Chicago原生IP $3）
2. 用户余额设为$10
3. 购买Chicago原生IP
4. 查看日志，应该看到价格不一致警告
5. 验证：
   - 用户余额扣除$8（实际金额）而不是$3
   - IP成功保存到数据库
   - 订单状态为`completed`

### 生产环境测试
1. 部署修复后的代码
2. 使用测试账号购买一个便宜的原生IP
3. 验证购买成功
4. 使用`syncOrderIPs` API同步之前的pending订单

---

## 📝 待办事项

- [ ] 部署修复代码到生产环境
- [ ] 手动同步4个pending状态的订单
- [ ] 通知受影响的用户并补偿差价
- [ ] 决定价格覆盖功能的去留：
  - [ ] 选项A：移除价格覆盖功能
  - [ ] 选项B：改为充值赠送
  - [ ] 选项C：平台补贴差价
- [ ] 添加价格一致性检查和告警

---

## 🎯 预防措施

### 代码层面
1. ✅ 使用985Proxy实际支付金额
2. ⚠️ 添加价格差异告警（已在日志中）
3. 📊 监控价格不一致情况

### 业务层面
1. 重新评估价格覆盖功能的实现方式
2. 考虑使用充值优惠代替购买优惠
3. 明确告知用户实际支付金额

---

**修复人员**: AI Assistant  
**审核人员**: 待确认  
**部署状态**: 待部署

