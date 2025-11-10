# ProxyHub 全面改进任务清单

**规格名称**: proxyhub-comprehensive-improvements  
**创建日期**: 2025-11-08  
**状态**: 准备实施  

---

## 📋 任务概览

共12个主要任务，按优先级和依赖关系排序。

---

## ✅ 已完成任务

### Task 0: 近期交易改为全部交易 ✅
**状态**: 已完成  
**文件**: `frontend/src/components/UserIPModal.vue`  
**说明**: Tab标题已从"近期交易（最后5笔）"改为"全部交易记录"

---

## 📝 待实施任务

### Task 1: 静态住宅管理 - 国家/城市选择优化
**状态**: [ ] Pending  
**优先级**: P0  
**预估时间**: 2小时  
**依赖**: 无

**修改文件**:
- `backend/src/modules/proxy/static/static-proxy.controller.ts`
- `backend/src/modules/proxy/static/static-proxy.service.ts`
- `backend/src/services/proxy-985.service.ts`
- `frontend/src/views/proxy/StaticManage.vue`
- `frontend/src/api/modules/proxy.ts`

**实现要点**:
1. 后端添加两个API端点：
   - `GET /api/v1/proxy/static/country-list`
   - `GET /api/v1/proxy/static/city-list?country=:code`
2. 调用985Proxy API `/res_static/city_list` 获取数据
3. 前端国家下拉菜单添加"所有国家"选项
4. 选择国家后动态加载城市列表
5. 筛选逻辑支持"所有国家"和"所有城市"

**_Prompt**:
```
Role: You are a full-stack developer specializing in NestJS and Vue 3.

Task: Implement country/city selection optimization for static proxy management.

Context:
- Refer to requirements.md US-1 and design.md Module 1.1
- Use 985Proxy API: GET /res_static/city_list?apikey={key}
- Frontend should support "All Countries" and "All Cities" options

Steps:
1. Backend: Add country-list and city-list API endpoints in static-proxy.controller.ts
2. Backend: Call 985Proxy API and parse response in proxy-985.service.ts
3. Frontend: Update StaticManage.vue to load countries on mount
4. Frontend: Add country change handler to load cities dynamically
5. Frontend: Update filtering logic to support "all" value

Restrictions:
- Do NOT hardcode country/city data
- Do NOT break existing filtering logic
- Ensure API error handling

Leverage:
- Existing proxy-985.service.ts methods for API calls
- Existing filter logic in StaticManage.vue

Requirements: US-1

Success Criteria:
- Country dropdown shows "所有国家" + dynamic list from 985Proxy
- City dropdown loads when country is selected
- Filtering works correctly with "all" options
- No console errors
```

---

### Task 2: 修复各页面筛选和搜索功能
**状态**: [ ] Pending  
**优先级**: P0  
**预估时间**: 3小时  
**依赖**: 无

**修改文件**:
- `frontend/src/views/proxy/StaticManage.vue`
- `frontend/src/views/admin/Users.vue`
- `frontend/src/views/admin/RechargeApproval.vue`
- `frontend/src/views/admin/Orders.vue`

**实现要点**:
1. 静态住宅管理：IP搜索、国家筛选、城市筛选、通道筛选
2. 用户管理：邮箱搜索、角色筛选、状态筛选
3. 充值审核：支付方式筛选、状态筛选、用户搜索
4. 订单管理：订单号搜索、状态筛选、日期筛选
5. 所有页面添加"重置"按钮清除筛选

**_Prompt**:
```
Role: You are a Vue 3 frontend developer specializing in Element Plus.

Task: Fix filtering and search functionality across all pages.

Context:
- Refer to requirements.md US-2 and design.md Module 1.2
- Use computed properties for reactive filtering
- Add debounce (300ms) for search inputs

Steps:
1. StaticManage.vue: Implement filteredProxies computed property with IP/country/city/channel filters
2. Users.vue: Implement filteredUsers computed property with email/role/status filters
3. RechargeApproval.vue: Implement filteredRecharges computed property with payment/status/email filters
4. Orders.vue: Implement filteredOrders computed property with orderNo/status/date filters
5. All pages: Add handleReset() function to clear all filters

Restrictions:
- Do NOT call API on every filter change (use local filtering)
- Do NOT break existing pagination
- Use lodash.debounce for search inputs

Leverage:
- Existing filter ref objects
- Element Plus el-input, el-select components

Requirements: US-2

Success Criteria:
- All filters work correctly on each page
- Search input is debounced
- Reset button clears all filters and reloads data
- No performance issues with large datasets
```

---

### Task 3: 修复续费价格覆盖问题
**状态**: [ ] Pending  
**优先级**: P0  
**预估时间**: 1.5小时  
**依赖**: 无

**修改文件**:
- `backend/src/modules/proxy/static/static-proxy.service.ts`
- `backend/src/modules/proxy/static/static-proxy.controller.ts`

**实现要点**:
1. 续费时先查询`price_overrides`表
2. 如存在覆盖价格，使用覆盖价格
3. 如不存在，使用985Proxy默认价格
4. 确保交易记录记录实际扣费金额

**_Prompt**:
```
Role: You are a backend developer specializing in NestJS and TypeORM.

Task: Fix price override not applying during proxy renewal.

Context:
- Refer to requirements.md US-3 and design.md Module 1.3
- Currently renewal uses 985Proxy default price, ignoring price_overrides table
- Need to check price_overrides first, then fall back to 985Proxy API

Steps:
1. Locate renewStaticProxy() method in static-proxy.service.ts
2. Before calculating cost, query price_overrides table with country/city/proxyType
3. If override exists, use override price
4. If not, call proxy-985.service to get default price
5. Create transaction record with actual price used
6. Update proxy expireTimeUtc

Restrictions:
- Do NOT break existing renewal logic
- Ensure transaction integrity (use database transaction)
- Validate user balance before deducting

Leverage:
- Existing priceOverrideService.getOverridePrice() method
- Existing transactionService.createTransaction() method

Requirements: US-3

Success Criteria:
- Renewal uses override price when exists
- Renewal uses default price when no override
- Transaction record shows correct amount
- Balance deducted correctly
```

---

### Task 4: 优化静态IP购买延迟
**状态**: [ ] Pending  
**优先级**: P1  
**预估时间**: 2小时  
**依赖**: 无

**修改文件**:
- `backend/src/modules/proxy/static/static-proxy.service.ts`

**实现要点**:
1. 实现轮询函数`pollOrderResult()`
2. 轮询间隔500ms，最多10次（5秒）
3. 订单状态为`complete`或`success`时立即返回
4. 超时返回"处理中"提示

**_Prompt**:
```
Role: You are a backend developer specializing in async operations and polling.

Task: Optimize static IP purchase latency by implementing fast polling.

Context:
- Refer to requirements.md US-4 and design.md Module 2
- Current implementation may wait too long for 985Proxy order completion
- Need to poll 985Proxy API every 500ms, max 10 times (5 seconds)

Steps:
1. Create private method pollOrderResult(orderNo, options) in static-proxy.service.ts
2. Implement polling loop with 500ms interval
3. Call proxy985Service.getOrderResult(orderNo) on each iteration
4. Check if status is 'complete' or 'success', return IPs immediately
5. If timeout (10 iterations), return null
6. Update purchaseStaticProxy() to use pollOrderResult()
7. If poll returns null, return { success: false, message: '订单处理中...' }

Restrictions:
- Do NOT use setTimeout recursively (use for loop with await)
- Do NOT poll indefinitely (max 10 times)
- Handle API errors gracefully (continue polling)

Leverage:
- Existing proxy985Service.getOrderResult() method
- Create helper method sleep(ms) for delays

Requirements: US-4

Success Criteria:
- Purchase completes within 3-5 seconds (most cases)
- If timeout, user gets clear message
- No infinite loops or memory leaks
```

---

### Task 5: 恢复"查看用户IP"功能
**状态**: [ ] Pending  
**优先级**: P0  
**预估时间**: 2.5小时  
**依赖**: 无

**修改文件**:
- `backend/src/modules/admin/admin.controller.ts`
- `backend/src/modules/admin/admin.service.ts`
- `frontend/src/components/UserIPModal.vue` (已存在，需更新)
- `frontend/src/views/admin/Users.vue`
- `frontend/src/api/modules/admin.ts`

**实现要点**:
1. 后端添加API: `GET /api/v1/admin/users/:id/ips`
2. 返回静态IP、动态通道、全部交易记录
3. 前端UserIPModal.vue添加分页（交易记录可能很多）
4. Users.vue添加"查看IP"按钮和模态框集成

**_Prompt**:
```
Role: You are a full-stack developer specializing in NestJS and Vue 3.

Task: Restore "View User IPs" feature that was lost in GitHub rollback.

Context:
- Refer to requirements.md US-5 and design.md Module 3
- UserIPModal.vue component exists but needs update (Tab title changed to "全部交易记录")
- Need to add pagination for transactions

Steps:
1. Backend: Add GET /admin/users/:id/ips endpoint in admin.controller.ts
2. Backend: Query static_proxies, dynamic_channels, transactions (all records, DESC order)
3. Backend: Return { user, staticProxies, dynamicChannels, recentTransactions }
4. Frontend: Update UserIPModal.vue to add pagination for transactions (page size 20)
5. Frontend: Add "查看IP" button in Users.vue table
6. Frontend: Add UserIPModal component to Users.vue with v-model:visible
7. Frontend: Create API method getUserIPs(userId) in api/modules/admin.ts

Restrictions:
- Do NOT limit transactions to 5 records (return all)
- Do NOT break existing modal tabs
- Ensure only admins can access this endpoint (@Roles('admin'))

Leverage:
- Existing UserIPModal.vue component structure
- Existing admin.controller.ts patterns
- Element Plus el-pagination component

Requirements: US-5

Success Criteria:
- "查看IP" button visible in Users.vue
- Modal shows all three tabs correctly
- Transactions paginated (20 per page)
- Export button works (CSV generation)
- API requires admin role
```

---

### Task 6: 管理后台仪表盘收入趋势去硬编码
**状态**: [ ] Pending  
**优先级**: P1  
**预估时间**: 2小时  
**依赖**: 无

**修改文件**:
- `backend/src/modules/admin/admin.controller.ts`
- `backend/src/modules/admin/admin.service.ts`
- `frontend/src/views/admin/Dashboard.vue`
- `frontend/src/api/modules/admin.ts`

**实现要点**:
1. 后端添加API: `GET /api/v1/admin/dashboard/revenue-trend?period=7天`
2. 查询`transactions`表，按日期分组统计收入和支出
3. 前端移除硬编码数据，从API获取真实数据
4. 更新ECharts配置

**_Prompt**:
```
Role: You are a full-stack developer specializing in data aggregation and visualization.

Task: Remove hardcoded data from admin dashboard revenue trend chart.

Context:
- Refer to requirements.md US-6 and design.md Module 4.1
- Currently revenue trend chart uses hardcoded mock data
- Need to query transactions table and group by date

Steps:
1. Backend: Add GET /admin/dashboard/revenue-trend endpoint
2. Backend: Use query builder to aggregate transactions by DATE(created_at)
3. Backend: Calculate income (SUM where amount > 0) and expense (SUM where amount < 0)
4. Backend: Support period parameter (7天, 30天, 90天)
5. Frontend: Add API method getRevenueTrend(period) in api/modules/admin.ts
6. Frontend: Update Dashboard.vue to load data on mount and on period change
7. Frontend: Update revenueChartOption with real data (xAxis.data, series[0].data, series[1].data)

Restrictions:
- Do NOT use hardcoded data arrays
- Ensure dates are formatted consistently (YYYY-MM-DD)
- Handle empty data gracefully (show "暂无数据")

Leverage:
- TypeORM query builder for date grouping
- Existing ECharts configuration in Dashboard.vue

Requirements: US-6

Success Criteria:
- Chart displays real transaction data
- Period selector works (7天/30天/90天)
- Chart updates when period changes
- No hardcoded data remains
```

---

### Task 7: 管理后台仪表盘待处理事项去硬编码
**状态**: [ ] Pending  
**优先级**: P1  
**预估时间**: 1.5小时  
**依赖**: 无

**修改文件**:
- `backend/src/modules/admin/admin.controller.ts`
- `backend/src/modules/admin/admin.service.ts`
- `frontend/src/views/admin/Dashboard.vue`
- `frontend/src/api/modules/admin.ts`

**实现要点**:
1. 后端添加API: `GET /api/v1/admin/dashboard/pending-items`
2. 查询待审核充值、异常订单、未读通知的数量
3. 前端移除硬编码数字，从API获取真实数量
4. 添加定时刷新（每30秒）

**_Prompt**:
```
Role: You are a full-stack developer specializing in dashboard development.

Task: Remove hardcoded data from admin dashboard pending items section.

Context:
- Refer to requirements.md US-6 and design.md Module 4.2
- Currently pending items show hardcoded numbers (e.g., 3, 5, 2)
- Need to query real counts from database

Steps:
1. Backend: Add GET /admin/dashboard/pending-items endpoint
2. Backend: Count recharge_orders where status='pending'
3. Backend: Count orders where status='failed'
4. Backend: Count notifications where isRead=false and isGlobal=true
5. Frontend: Add API method getPendingItems() in api/modules/admin.ts
6. Frontend: Update Dashboard.vue to load pending items on mount
7. Frontend: Add setInterval(loadPendingItems, 30000) for auto-refresh

Restrictions:
- Do NOT use hardcoded numbers
- Ensure counts update in real-time (30s interval)
- Stop interval when component unmounts (onUnmounted hook)

Leverage:
- TypeORM repository.count() method
- Vue 3 onMounted and onUnmounted lifecycle hooks

Requirements: US-6

Success Criteria:
- Pending items show real counts
- Counts update every 30 seconds
- Clicking items navigates to correct pages
- No hardcoded numbers remain
```

---

### Task 8: 系统设置客服链接修改功能
**状态**: [ ] Pending  
**优先级**: P1  
**预估时间**: 2.5小时  
**依赖**: 无

**修改文件**:
- `backend/src/modules/admin/settings.controller.ts` (或 admin.controller.ts)
- `backend/src/modules/settings/settings.service.ts`
- `frontend/src/views/admin/Settings.vue`
- `frontend/src/api/modules/settings.ts`

**实现要点**:
1. 后端添加CRUD API for Telegram客服链接
2. 前端系统设置页面添加客服链接管理界面
3. 支持编辑、添加、删除客服链接
4. 保存后立即生效

**_Prompt**:
```
Role: You are a full-stack developer specializing in CRUD operations and settings management.

Task: Add Telegram customer service link management in system settings.

Context:
- Refer to requirements.md US-7 and design.md Module 5
- Currently admin can view Telegram links but cannot modify via UI
- Need to add CRUD endpoints and UI

Steps:
1. Backend: Add GET /admin/settings/telegram endpoint (list all telegram_support_* settings)
2. Backend: Add PUT /admin/settings/telegram/:id endpoint (update username)
3. Backend: Add POST /admin/settings/telegram endpoint (create new link with auto-incremented key)
4. Backend: Add DELETE /admin/settings/telegram/:id endpoint
5. Frontend: Update Settings.vue to load telegram links on mount
6. Frontend: Add editable table with edit/save/delete buttons
7. Frontend: Add "添加客服" dialog with label and username inputs
8. Frontend: Create API methods in api/modules/settings.ts

Restrictions:
- Do NOT allow deletion if only 1 link remains (show error)
- Validate username format (no @ symbol, alphanumeric only)
- Ensure changes reflect immediately on frontend pages

Leverage:
- Existing settingsService.findByPrefix('telegram_support_') method
- Element Plus el-table with inline editing pattern

Requirements: US-7

Success Criteria:
- Admin can edit existing Telegram links
- Admin can add new Telegram links
- Admin can delete links (except last one)
- Changes visible immediately on user-facing pages
- Input validation works
```

---

### Task 9: 手机端全局样式和布局框架
**状态**: [ ] Pending  
**优先级**: P0  
**预估时间**: 3小时  
**依赖**: 无

**修改文件**:
- `frontend/src/styles/responsive.scss` (新建)
- `frontend/src/layouts/DashboardLayout.vue`
- `frontend/src/layouts/AdminLayout.vue` (如存在)
- `frontend/src/components/MobileCard.vue` (新建)

**实现要点**:
1. 创建响应式SCSS文件（断点、mixins、工具类）
2. 修改DashboardLayout添加手机版顶部导航和侧边栏抽屉
3. 创建MobileCard通用卡片组件
4. 确保所有页面自动应用响应式样式

**_Prompt**:
```
Role: You are a frontend developer specializing in responsive design and mobile UI.

Task: Create global responsive styles and mobile layout framework.

Context:
- Refer to requirements.md US-8 and design.md Module 6
- Need to support desktop (>= 768px) and mobile (< 768px)
- Use CSS Media Queries, no JavaScript for responsive detection

Steps:
1. Create frontend/src/styles/responsive.scss with breakpoints, mixins, and utility classes
2. Update DashboardLayout.vue to add mobile header (汉堡菜单 + logo + balance + avatar)
3. Add el-drawer for mobile sidebar (80% width, slides from left)
4. Hide desktop sidebar on mobile (@include sm)
5. Create MobileCard.vue component (header, body, footer slots)
6. Import responsive.scss in main.ts or App.vue

Restrictions:
- Do NOT use JavaScript to detect screen size (use CSS only)
- Do NOT break desktop layout
- Ensure touch targets >= 44px on mobile (iOS guidelines)

Leverage:
- SCSS @mixin and @include syntax
- Element Plus el-drawer, el-icon components
- Existing DashboardLayout.vue sidebar structure

Requirements: US-8

Success Criteria:
- Mobile header visible on screens < 768px
- Hamburger menu opens sidebar drawer
- Desktop sidebar hidden on mobile
- MobileCard component renders correctly
- No horizontal scrolling on mobile
```

---

### Task 10: 手机端用户管理、充值审核、订单管理适配
**状态**: [ ] Pending  
**优先级**: P0  
**预估时间**: 4小时  
**依赖**: Task 9

**修改文件**:
- `frontend/src/views/admin/Users.vue`
- `frontend/src/views/admin/RechargeApproval.vue`
- `frontend/src/views/admin/Orders.vue`

**实现要点**:
1. 添加手机版卡片列表（使用MobileCard组件）
2. 桌面版表格添加`.table-responsive`类
3. 手机版卡片添加`.mobile-card-list`类
4. 筛选区域使用`.filter-section-responsive`类

**_Prompt**:
```
Role: You are a Vue 3 frontend developer specializing in responsive component development.

Task: Adapt admin pages (Users, RechargeApproval, Orders) for mobile devices.

Context:
- Refer to requirements.md US-8 and design.md Module 6.4
- Dependency: Task 9 (responsive.scss and MobileCard.vue must be completed)
- Use table-responsive and mobile-card-list classes for show/hide

Steps:
1. Users.vue: Wrap el-table with <el-card class="table-responsive">
2. Users.vue: Add <div class="mobile-card-list"> with MobileCard v-for loop
3. Users.vue: Each card shows email, role, balance, createdAt
4. Users.vue: Card footer has "查看IP", "调整余额", "删除" buttons
5. Repeat steps 1-4 for RechargeApproval.vue (show order details)
6. Repeat steps 1-4 for Orders.vue (show order details)
7. Update filter sections to use filter-section-responsive class

Restrictions:
- Do NOT duplicate data loading logic (reuse existing)
- Ensure buttons have min-height: 44px on mobile
- Do NOT remove desktop table (just hide on mobile)

Leverage:
- MobileCard.vue component from Task 9
- responsive.scss utility classes from Task 9
- Existing data fetching methods

Requirements: US-8

Success Criteria:
- Desktop: table view works as before
- Mobile: card list view displays correctly
- All buttons clickable (min 44px height)
- Tested on Chrome DevTools (iPhone 12 Pro, 390x844)
```

---

### Task 11: 手机端用户仪表盘、代理管理、账户中心适配
**状态**: [ ] Pending  
**优先级**: P0  
**预估时间**: 4小时  
**依赖**: Task 9

**修改文件**:
- `frontend/src/views/dashboard/Index.vue`
- `frontend/src/views/proxy/StaticManage.vue`
- `frontend/src/views/proxy/StaticBuy.vue`
- `frontend/src/views/proxy/DynamicManage.vue`
- `frontend/src/views/account/Center.vue`
- `frontend/src/views/wallet/Recharge.vue`

**实现要点**:
1. 仪表盘统计卡片改为2列（手机端1列）
2. 静态/动态管理添加手机版卡片列表
3. 账户中心使用响应式Descriptions
4. 充值页面表单改为垂直布局（手机端）

**_Prompt**:
```
Role: You are a Vue 3 frontend developer specializing in responsive user interfaces.

Task: Adapt user-facing pages for mobile devices.

Context:
- Refer to requirements.md US-8 and design.md Module 6.4
- Dependency: Task 9 (responsive framework must be completed)
- Focus on user dashboard, proxy management, and account pages

Steps:
1. Dashboard (Index.vue): Update stat cards grid to use grid-responsive class
2. StaticManage.vue: Add mobile-card-list with MobileCard for each IP
3. StaticBuy.vue: Ensure country/package selection works on mobile (vertical layout)
4. DynamicManage.vue: Add mobile-card-list if table exists
5. Center.vue: Use el-descriptions :column="isMobile ? 1 : 2"
6. Recharge.vue: Update form layout to use form-responsive class

Restrictions:
- Do NOT break desktop layout
- Ensure touch targets >= 44px
- Test on iPhone 12 Pro (390x844) in Chrome DevTools

Leverage:
- MobileCard.vue component
- responsive.scss utility classes
- Element Plus responsive props (:xs, :sm, :md)

Requirements: US-8

Success Criteria:
- All 6 pages display correctly on mobile
- Forms are usable (inputs large enough)
- Cards show essential information
- No horizontal scrolling
```

---

### Task 12: Chrome DevTools全面验证和最终优化
**状态**: [ ] Pending  
**优先级**: P0  
**预估时间**: 2小时  
**依赖**: Tasks 1-11

**验证内容**:
1. 所有12个页面在手机端（iPhone 12 Pro, 390x844）测试
2. Console无错误
3. Network所有API返回正确状态码
4. 功能测试（筛选、搜索、续费、购买、审核）
5. 性能测试（Lighthouse Mobile评分 > 90）

**_Prompt**:
```
Role: You are a QA engineer specializing in Chrome DevTools and mobile testing.

Task: Perform comprehensive verification using Chrome DevTools and fix any issues found.

Context:
- Refer to requirements.md Section "验收测试清单"
- All previous tasks (1-11) must be completed
- Use Chrome DevTools Device Mode (iPhone 12 Pro, 390x844)

Steps:
1. Open Chrome DevTools (F12)
2. Enable Device Mode (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" preset
4. Test all 12 pages systematically:
   - Login page
   - Admin dashboard
   - Users management
   - Recharge approval
   - Orders management
   - System settings
   - Price overrides
   - User dashboard
   - Static proxy management/purchase
   - Dynamic proxy management/purchase
   - Account center
   - Recharge page
5. For each page:
   - Check Console tab (no errors)
   - Check Network tab (all API 200/201)
   - Test filtering/searching
   - Test buttons (ensure clickable, min 44px)
   - Test forms (ensure usable)
6. Take screenshots of any issues
7. Fix identified issues
8. Run Lighthouse audit (Mobile)
9. Optimize if score < 90

Restrictions:
- Do NOT skip any page
- Do NOT ignore console warnings (fix if critical)
- Document all issues found in a report

Leverage:
- Chrome DevTools Device Mode
- Chrome DevTools Console/Network/Elements panels
- Lighthouse audit tool

Requirements: All (US-1 through US-8)

Success Criteria:
- All 12 pages tested on mobile
- Console clean (no errors)
- All API calls successful
- All functions work correctly
- Lighthouse Mobile score > 90
- Test report generated
```

---

## 📊 任务统计

- **总任务数**: 13个（含已完成的Task 0）
- **已完成**: 1个
- **待实施**: 12个
- **预估总时间**: 32.5小时

---

## 🎯 实施顺序建议

### Phase 1: 核心功能修复（P0） - 6个任务
1. Task 1: 国家/城市选择优化
2. Task 2: 筛选搜索功能修复
3. Task 3: 续费价格覆盖修复
4. Task 5: 恢复查看用户IP功能
5. Task 9: 手机端全局框架
6. Task 10: 管理后台手机适配

### Phase 2: 数据去硬编码和优化（P1） - 4个任务
7. Task 4: 购买延迟优化
8. Task 6: 收入趋势去硬编码
9. Task 7: 待处理事项去硬编码
10. Task 8: 客服链接修改功能

### Phase 3: 用户端手机适配和验证（P0） - 2个任务
11. Task 11: 用户端手机适配
12. Task 12: Chrome DevTools全面验证

---

## ✅ 完成检查清单

每个任务完成后，执行以下检查：

- [ ] 代码已提交到Git（feat: xxx）
- [ ] 本地测试通过
- [ ] Chrome DevTools Console无错误
- [ ] API响应正确（Postman/Network面板）
- [ ] 手机端测试通过（如适用）
- [ ] 代码已格式化（Prettier）
- [ ] 无TypeScript类型错误
- [ ] 无ESLint错误

---

**文档版本**: 1.0  
**创建者**: AI Assistant  
**最后更新**: 2025-11-08








