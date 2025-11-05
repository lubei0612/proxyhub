# ProxyHub 全面质量检查和修复 - 设计文档

## 1. 修复策略

### 1.1 修复顺序
按照优先级从高到低修复：
1. **P0问题**：核心功能和数据准确性问题（立即修复）
2. **P1问题**：用户体验问题（优先修复）
3. **P2问题**：优化改进（后续修复）
4. **P3问题**：未来功能（暂不处理）

### 1.2 测试策略
- 使用Chrome DevTools进行前端调试
- 使用Postman或curl进行后端API测试
- 每修复一个问题立即进行端到端测试
- 确保数据一致性

## 2. 问题分析和修复方案

### 2.1 静态住宅管理

#### 问题1：续费功能未扣费

**根本原因分析**：
- 后端续费API未实现扣费逻辑
- 或者前端未正确调用续费API

**修复方案**：
1. 检查后端是否有续费API路由
2. 实现续费逻辑：
   ```typescript
   // backend/src/modules/proxy/static/static-proxy.service.ts
   async renewProxy(userId: number, proxyId: number, duration: number) {
     // 1. 查找代理
     const proxy = await this.staticProxyRepo.findOne({
       where: { id: proxyId, userId },
       relations: ['user']
     });
     
     // 2. 计算续费金额
     const price = await this.pricingService.calculateRenewalPrice(proxy, duration);
     
     // 3. 验证余额
     if (proxy.user.balance < price) {
       throw new BadRequestException('余额不足');
     }
     
     // 4. 扣费
     proxy.user.balance = parseFloat(proxy.user.balance.toString()) - price;
     await this.userRepo.save(proxy.user);
     
     // 5. 更新到期时间
     proxy.expiresAt = new Date(proxy.expiresAt.getTime() + duration * 24 * 60 * 60 * 1000);
     await this.staticProxyRepo.save(proxy);
     
     // 6. 创建订单
     const order = this.orderRepo.create({
       userId,
       orderNo: generateOrderNo(),
       type: OrderType.STATIC_RENEWAL,
       totalAmount: price,
       status: OrderStatus.COMPLETED,
       // ...
     });
     await this.orderRepo.save(order);
     
     // 7. 创建交易记录
     const transaction = this.transactionRepo.create({
       userId,
       type: TransactionType.EXPENSE,
       amount: -price,
       // ...
     });
     await this.transactionRepo.save(transaction);
     
     // 8. 记录事件日志
     await this.eventLogService.log({
       userId,
       type: 'IP续费',
       content: `续费静态IP: ${proxy.ip}, 时长: ${duration}天, 金额: $${price}`
     });
     
     return { success: true, proxy };
   }
   ```

3. 前端调用续费API：
   ```typescript
   // frontend/src/api/modules/proxy.ts
   export const renewStaticProxy = (id: number, duration: number) => {
     return request({
       url: `/proxy/static/${id}/renew`,
       method: 'POST',
       data: { duration }
     });
   };
   ```

4. 前端组件调用后刷新数据：
   ```typescript
   // frontend/src/views/proxy/StaticManage.vue
   const handleRenew = async (row: any, duration: number) => {
     try {
       await renewStaticProxy(row.id, duration);
       ElMessage.success('续费成功');
       await userStore.fetchUserInfo(); // 刷新余额
       await loadProxies(); // 刷新列表
     } catch (error) {
       ElMessage.error('续费失败');
     }
   };
   ```

#### 问题2：释放功能未生效

**根本原因分析**：
- 后端释放API未正确删除或标记代理记录
- 或者前端未刷新列表

**修复方案**：
1. 后端实现释放逻辑：
   ```typescript
   // backend/src/modules/proxy/static/static-proxy.service.ts
   async releaseProxy(userId: number, proxyId: number) {
     const proxy = await this.staticProxyRepo.findOne({
       where: { id: proxyId, userId }
     });
     
     if (!proxy) {
       throw new NotFoundException('代理不存在');
     }
     
     // 标记为已释放或直接删除
     await this.staticProxyRepo.delete(proxyId);
     // 或者：proxy.status = 'released'; await this.staticProxyRepo.save(proxy);
     
     // 记录事件日志
     await this.eventLogService.log({
       userId,
       type: 'IP释放',
       content: `释放静态IP: ${proxy.ip}`
     });
     
     return { success: true };
   }
   ```

2. 前端调用释放API后刷新列表：
   ```typescript
   const handleRelease = async (row: any) => {
     try {
       await releaseStaticProxy(row.id);
       ElMessage.success('释放成功');
       await loadProxies(); // 刷新列表
     } catch (error) {
       ElMessage.error('释放失败');
     }
   };
   ```

### 2.2 价格覆盖管理

#### 问题：原生IP价格修改范围错误

**根本原因分析**：
- 价格覆盖记录的匹配逻辑过于宽泛
- 可能只按IP类型匹配，未按国家/城市匹配

**修复方案**：
1. 检查价格覆盖记录的唯一键：
   ```sql
   -- price_overrides表应该有唯一约束
   UNIQUE(country, city, ip_type)
   ```

2. 后端批量更新逻辑应该准确匹配：
   ```typescript
   // backend/src/modules/pricing/pricing.service.ts
   async batchUpdatePriceOverrides(updates: Array<{country, city, ipType, overridePrice}>) {
     for (const update of updates) {
       const { country, city, ipType, overridePrice } = update;
       
       // 准确匹配
       const existing = await this.priceOverrideRepo.findOne({
         where: {
           country,
           city,
           ipType
         }
       });
       
       if (overridePrice === null) {
         // 删除覆盖
         if (existing) {
           await this.priceOverrideRepo.delete(existing.id);
         }
       } else {
         if (existing) {
           // 更新
           existing.overridePrice = overridePrice;
           await this.priceOverrideRepo.save(existing);
         } else {
           // 创建
           const newOverride = this.priceOverrideRepo.create({
             country,
             city,
             ipType,
             overridePrice,
             productType: ipType === 'premium' ? 'static-residential-native' : 'static-residential'
           });
           await this.priceOverrideRepo.save(newOverride);
         }
       }
     }
     
     // 清除缓存
     this.clearPriceCache();
   }
   ```

### 2.3 余额显示不一致

**根本原因分析**：
- 支付面板的余额可能是从props传入的旧数据
- 没有从userStore获取最新余额

**修复方案**：
1. 统一从userStore获取余额：
   ```typescript
   // frontend/src/views/proxy/StaticBuy.vue
   import { useUserStore } from '@/stores/user';
   
   const userStore = useUserStore();
   
   // 使用计算属性获取余额
   const walletBalance = computed(() => userStore.user?.balance || 0);
   ```

2. 确保支付面板显示的是userStore的余额：
   ```vue
   <div class="balance-info">
     <span>钱包余额</span>
     <span class="balance-amount">${{ walletBalance.toFixed(2) }}</span>
   </div>
   ```

### 2.4 购买扣费金额错误

**根本原因分析**：
- 前端显示的价格和后端计算的价格不一致
- 可能前端显示的是覆盖价格，但后端使用的是基础价格

**修复方案**：
1. 确保前端和后端使用相同的价格计算逻辑
2. 前端显示价格应该从`calculatePrice` API获取
3. 后端扣费应该使用相同的`calculatePrice`逻辑

**调试步骤**：
1. 使用Chrome DevTools查看购买请求的payload
2. 查看后端计算的totalAmount
3. 对比前端显示的价格
4. 确保一致

### 2.5 事件日志未更新

**根本原因分析**：
- 部分操作未调用事件日志服务

**修复方案**：
1. 在所有关键操作中添加事件日志记录：
   - 购买IP：`static-proxy.service.ts` 的 `purchaseStaticProxy`
   - 续费IP：`static-proxy.service.ts` 的 `renewProxy`
   - 释放IP：`static-proxy.service.ts` 的 `releaseProxy`
   - 充值审核：`billing.service.ts` 的 `approveRecharge`

2. 统一事件日志格式：
   ```typescript
   await this.eventLogService.log({
     userId: user.id,
     type: EventType.PURCHASE, // 或 RENEWAL, RELEASE, RECHARGE等
     content: '购买静态IP: 美国-洛杉矶, 数量: 5个, 金额: $25.00'
   });
   ```

### 2.6 数据一致性问题

**根本原因分析**：
- 各个页面可能使用了独立的API调用
- 没有统一的数据更新机制

**修复方案**：
1. 使用Pinia Store统一管理用户状态
2. 任何数据变动后立即调用`userStore.fetchUserInfo()`
3. 列表页面提供手动刷新按钮
4. 关键操作后自动刷新相关数据

**实现模式**：
```typescript
// 操作模板
const handleOperation = async () => {
  try {
    loading.value = true;
    
    // 1. 执行操作
    await operationAPI(...);
    
    // 2. 刷新用户信息（余额等）
    await userStore.fetchUserInfo();
    
    // 3. 刷新当前页面数据
    await loadPageData();
    
    // 4. 提示成功
    ElMessage.success('操作成功');
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    loading.value = false;
  }
};
```

### 2.7 用户管理问题

#### 问题1：角色设置未生效

**修复方案**：
1. 检查后端API：
   ```typescript
   // backend/src/modules/admin/admin.controller.ts
   @Put('users/:id/role')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin')
   async updateUserRole(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
     return this.adminService.updateUserRole(id, dto.role);
   }
   ```

2. 后端服务实现：
   ```typescript
   // backend/src/modules/admin/admin.service.ts
   async updateUserRole(userId: number, newRole: string) {
     const user = await this.userRepo.findOne({ where: { id: userId } });
     if (!user) {
       throw new NotFoundException('用户不存在');
     }
     
     user.role = newRole;
     await this.userRepo.save(user);
     
     // 记录事件日志
     await this.eventLogService.log({
       userId: currentAdminId,
       type: '用户管理',
       content: `修改用户 ${user.email} 的角色为 ${newRole}`
     });
     
     return user;
   }
   ```

3. 前端调用后刷新列表：
   ```typescript
   const handleRoleChange = async (row: any, newRole: string) => {
     try {
       await updateUserRole(row.id, { role: newRole });
       ElMessage.success('角色更新成功');
       await loadUsers(); // 刷新列表
     } catch (error) {
       ElMessage.error('角色更新失败');
     }
   };
   ```

#### 问题2：禁用用户未生效

**修复方案**：
1. 后端实现禁用逻辑：
   ```typescript
   async updateUserStatus(userId: number, status: string) {
     const user = await this.userRepo.findOne({ where: { id: userId } });
     user.status = status;
     await this.userRepo.save(user);
     
     // 如果是禁用，应该撤销用户的Token（可选，需要Redis支持）
     if (status === 'disabled') {
       // await this.authService.revokeUserTokens(userId);
     }
     
     return user;
   }
   ```

2. 登录时验证用户状态：
   ```typescript
   // backend/src/modules/auth/auth.service.ts
   async login(email: string, password: string) {
     const user = await this.userRepo.findOne({ where: { email } });
     
     // 验证用户状态
     if (user.status === 'disabled') {
       throw new UnauthorizedException('账户已被禁用');
     }
     
     // ... 其他登录逻辑
   }
   ```

#### 问题3：筛选功能未生效

**修复方案**：
1. 后端支持筛选参数：
   ```typescript
   // backend/src/modules/admin/admin.controller.ts
   @Get('users')
   async getUsers(@Query() query: GetUsersDto) {
     return this.adminService.getUsers(query);
   }
   ```

2. 后端服务实现筛选：
   ```typescript
   async getUsers(query: GetUsersDto) {
     const { page = 1, limit = 20, role, status, email } = query;
     
     const where: any = {};
     if (role) where.role = role;
     if (status) where.status = status;
     if (email) where.email = Like(`%${email}%`);
     
     const [data, total] = await this.userRepo.findAndCount({
       where,
       skip: (page - 1) * limit,
       take: limit,
       order: { createdAt: 'DESC' }
     });
     
     return { data, total, page, limit };
   }
   ```

3. 前端传递筛选参数：
   ```typescript
   const loadUsers = async () => {
     const params = {
       page: currentPage.value,
       limit: pageSize.value,
       role: selectedRole.value,
       status: selectedStatus.value,
       email: searchEmail.value
     };
     
     const response = await getUsers(params);
     userList.value = response.data;
     total.value = response.total;
   };
   ```

### 2.8 订单管理问题

**修复方案**：
1. 确保订单API返回最新数据（按创建时间倒序）
2. 前端页面加载时获取最新订单
3. 提供手动刷新按钮
4. 订单创建后立即在各个相关页面刷新

### 2.9 系统设置问题

**修复方案**：
1. 检查系统设置的前后端API是否完整配置
2. 实现保存和获取设置的逻辑
3. 确保设置能够影响业务逻辑

## 3. API路由检查清单

### 3.1 用户相关
- [x] `POST /api/v1/auth/register` - 注册
- [x] `POST /api/v1/auth/login` - 登录
- [x] `POST /api/v1/auth/admin-login` - 管理员登录
- [x] `GET /api/v1/users/me` - 获取当前用户信息
- [x] `PUT /api/v1/users/profile` - 更新用户信息
- [x] `POST /api/v1/users/change-password` - 修改密码
- [x] `POST /api/v1/users/api-key/generate` - 生成API密钥
- [x] `POST /api/v1/users/api-key/reset` - 重置API密钥

### 3.2 静态代理相关
- [x] `GET /api/v1/proxy/static/list` - 获取静态代理列表
- [x] `POST /api/v1/proxy/static/purchase` - 购买静态代理
- [ ] `POST /api/v1/proxy/static/:id/renew` - 续费静态代理（需要添加）
- [ ] `DELETE /api/v1/proxy/static/:id/release` - 释放静态代理（需要添加）
- [x] `PUT /api/v1/proxy/static/:id/auto-renew` - 设置自动续费
- [x] `PUT /api/v1/proxy/static/:id/remark` - 设置备注

### 3.3 订单相关
- [x] `GET /api/v1/orders` - 获取用户订单
- [x] `GET /api/v1/orders/:id` - 获取订单详情
- [x] `GET /api/v1/orders/admin/all` - 管理员获取所有订单

### 3.4 账单相关
- [x] `POST /api/v1/billing/recharge` - 提交充值申请
- [x] `GET /api/v1/billing/recharges` - 获取充值记录
- [x] `GET /api/v1/billing/transactions` - 获取交易明细
- [x] `PUT /api/v1/billing/recharge/:id/approve` - 审核充值（管理员）
- [x] `GET /api/v1/billing/admin/recharges` - 获取所有充值记录（管理员）

### 3.5 价格相关
- [x] `POST /api/v1/price/calculate` - 计算价格
- [x] `GET /api/v1/price/configs` - 获取价格配置
- [x] `PUT /api/v1/price/configs/:id` - 更新价格配置
- [x] `GET /api/v1/price/ip-pool` - 获取IP池（管理员）
- [x] `GET /api/v1/price/overrides` - 获取价格覆盖
- [x] `POST /api/v1/price/overrides/batch` - 批量更新价格覆盖
- [x] `POST /api/v1/price/overrides` - 创建价格覆盖
- [x] `PUT /api/v1/price/overrides/:id` - 更新价格覆盖
- [x] `DELETE /api/v1/price/overrides/:id` - 删除价格覆盖

### 3.6 管理员相关
- [x] `GET /api/v1/admin/users` - 获取用户列表
- [x] `GET /api/v1/admin/statistics` - 获取统计数据
- [x] `PUT /api/v1/admin/users/:id/status` - 更新用户状态
- [x] `PUT /api/v1/admin/users/:id/role` - 更新用户角色
- [x] `GET /api/v1/admin/settings` - 获取系统设置
- [x] `PUT /api/v1/admin/settings/:key` - 更新系统设置

### 3.7 事件日志相关
- [x] `GET /api/v1/event-logs/my` - 获取当前用户事件日志
- [x] `GET /api/v1/event-logs` - 获取所有事件日志（管理员）

## 4. 数据流设计

### 4.1 购买IP流程
```
用户选择IP → 前端调用calculatePrice API获取价格 → 显示价格
→ 用户确认购买 → 前端调用purchaseStaticProxy API
→ 后端验证余额 → 计算价格 → 扣费 → 生成IP → 创建订单 → 创建交易记录 → 记录事件日志
→ 返回成功 → 前端刷新余额 → 刷新IP列表 → 刷新订单列表 → 刷新事件日志
```

### 4.2 续费IP流程
```
用户点击续费 → 选择续费时长 → 前端调用renewProxy API
→ 后端验证余额 → 计算价格 → 扣费 → 更新到期时间 → 创建订单 → 创建交易记录 → 记录事件日志
→ 返回成功 → 前端刷新余额 → 刷新IP列表
```

### 4.3 释放IP流程
```
用户点击释放 → 前端调用releaseProxy API
→ 后端删除/标记代理记录 → 记录事件日志
→ 返回成功 → 前端刷新IP列表
```

### 4.4 充值审核流程
```
管理员点击审核通过 → 前端调用approveRecharge API
→ 后端更新余额 → 更新充值状态 → 创建交易记录 → 记录事件日志
→ 返回成功 → 前端刷新充值列表
```

## 5. 测试计划

### 5.1 使用Chrome DevTools测试流程
1. 打开Chrome DevTools Network面板
2. 执行操作（购买、续费、释放等）
3. 查看请求和响应
4. 验证数据正确性

### 5.2 数据一致性验证
1. 购买IP后，检查：
   - 导航栏余额是否更新
   - 支付面板余额是否更新
   - IP列表是否新增
   - 订单列表是否新增
   - 事件日志是否新增
   
2. 续费IP后，检查：
   - 余额是否扣减
   - IP到期时间是否延长
   - 订单列表是否新增续费订单
   - 事件日志是否记录

3. 释放IP后，检查：
   - IP列表是否移除
   - 事件日志是否记录

## 6. 交付标准

1. 所有P0问题必须100%修复
2. 所有P1问题至少90%修复
3. 数据一致性达到100%
4. 所有核心API正常工作
5. 提供完整的测试报告和修复文档


