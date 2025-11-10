# Production QA Verification - Tasks

## Task Status Legend
- `[ ]` = Pending
- `[-]` = In Progress
- `[x]` = Completed

---

## Task 1: 环境准备和配置验证
**Status**: `[x]`  
**Files**: Docker配置, 环境变量  
**Requirements**: TR-2  
**Estimated Time**: 15分钟

### Description
验证Docker环境和985Proxy API配置

### Subtasks
1. 检查Docker容器状态
2. 验证环境变量配置
3. 测试数据库连接
4. 确认服务端口可访问

### _Prompt
```
Role: QA Engineer with Docker and API configuration expertise

Task: Verify the ProxyHub production environment is properly configured before testing
- Check all Docker containers are running and healthy
- Verify PROXY_985_API_KEY and PROXY_985_ZONE are configured
- Test database connectivity
- Confirm frontend (port 8080) and backend (port 3000) are accessible

Restrictions:
- Do not modify any configuration files
- Do not restart services unless necessary
- Report any missing configurations

Success Criteria:
- All 4 Docker containers are healthy
- 985Proxy API credentials are configured
- Both frontend and backend ports are accessible
- Database connection is successful

Instructions:
1. Run `docker ps` to check container status
2. Check environment variables are set
3. Test `http://localhost:8080` accessibility
4. Test `http://localhost:3000/api/v1/health` if available
5. Record all findings
```

---

## Task 2: 认证流程测试
**Status**: `[x]`  
**Files**: 登录页面, 认证API  
**Requirements**: US-2  
**Estimated Time**: 10分钟

### Description
使用Chrome DevTools测试登录和注销流程

### Subtasks
1. 访问登录页面
2. 验证登录API调用
3. 检查JWT token存储
4. 测试注销功能

### _Prompt
```
Role: QA Engineer with authentication testing expertise

Task: Test the authentication flow using Chrome DevTools MCP
- Navigate to http://localhost:8080
- Verify login page loads correctly
- Check authentication API calls
- Validate JWT token handling
- Test logout functionality

Restrictions:
- Use Chrome DevTools MCP tools only
- Do not attempt complex form interactions (Element Plus limitation)
- Focus on API call verification

Success Criteria:
- Login page loads without errors
- No 404/500 errors in network requests
- No console errors
- Authentication flow can be verified through API calls

Instructions:
1. Use `navigate_page` to access http://localhost:8080
2. Use `take_snapshot` to verify page content
3. Use `list_network_requests` to check API calls
4. Use `list_console_messages` to capture any errors
5. Record findings in test report
```

---

## Task 3: 用户仪表盘测试
**Status**: `[ ]`  
**Files**: Dashboard页面  
**Requirements**: US-2  
**Estimated Time**: 10分钟

### Description
测试用户仪表盘页面的所有功能

### Subtasks
1. 访问仪表盘页面
2. 验证统计数据加载
3. 检查图表渲染
4. 验证API调用

### _Prompt
```
Role: QA Engineer testing dashboard functionality

Task: Verify the user dashboard loads correctly with real data
- Navigate to /dashboard
- Verify statistics are loaded from API
- Check for hardcoded data
- Validate all network requests succeed

Restrictions:
- Do not interact with charts directly
- Focus on data loading verification
- Check API response formats

Success Criteria:
- Dashboard page loads successfully
- All API calls return 200 status
- No hardcoded statistics visible
- No console errors

Instructions:
1. Navigate to http://localhost:8080/dashboard
2. Take snapshot of page content
3. List all network requests (filter: xhr, fetch)
4. Check console for errors
5. Verify statistics show real data (not mock values like 0/0/0)
```

---

## Task 4: 静态IP选购页面测试
**Status**: `[ ]`  
**Files**: StaticBuy页面, 985Proxy API  
**Requirements**: US-2, US-3  
**Estimated Time**: 15分钟

### Description
测试静态IP选购页面和985Proxy库存API集成

### Subtasks
1. 访问静态IP选购页面
2. 验证库存API调用
3. 检查业务场景API
4. 验证IP列表显示

### _Prompt
```
Role: QA Engineer testing 985Proxy integration

Task: Verify static IP purchase page and 985Proxy API integration
- Navigate to /proxy/static/buy
- Verify inventory API call succeeds
- Check business scenarios API
- Validate real IP data is displayed

Restrictions:
- Cannot test actual purchase flow (complex Element Plus interactions)
- Focus on API integration and data display
- Verify no mock data is shown

Success Criteria:
- Page loads successfully
- GET /api/v1/proxy/static/inventory returns 200
- Response contains real IP inventory (not mock data)
- Business scenarios dropdown has real categories
- No console errors

Instructions:
1. Navigate to http://localhost:8080/proxy/static/buy
2. Capture page snapshot
3. List network requests and find inventory API call
4. Get network request details for inventory API
5. Verify response contains countries array with real stock numbers
6. Check for "[985Proxy]" warnings in console
7. Record IP count and verify it's not hardcoded
```

---

## Task 5: 静态IP管理页面测试
**Status**: `[ ]`  
**Files**: StaticManage页面  
**Requirements**: US-2  
**Estimated Time**: 10分钟

### Description
测试静态IP管理页面功能

### Subtasks
1. 访问静态IP管理页面
2. 验证IP列表加载
3. 检查导出功能可用性
4. 验证复制功能

### _Prompt
```
Role: QA Engineer testing IP management features

Task: Verify static IP management page loads and displays user's IPs
- Navigate to /proxy/static/manage
- Verify IP list API call
- Check page renders correctly
- Validate no hardcoded IPs

Success Criteria:
- Page loads successfully
- API call to fetch user IPs succeeds
- Table renders (even if empty)
- No console errors

Instructions:
1. Navigate to http://localhost:8080/proxy/static/manage
2. Take page snapshot
3. List network requests
4. Check for API calls fetching static proxies
5. Verify table structure exists
6. Record any console messages
```

---

## Task 6: 动态住宅管理页面测试
**Status**: `[ ]`  
**Files**: DynamicManage页面  
**Requirements**: US-2, US-3  
**Estimated Time**: 10分钟

### Description
测试动态住宅代理管理页面

### Subtasks
1. 访问动态管理页面
2. 验证通道列表加载
3. 检查城市列表API
4. 验证统计数据

### _Prompt
```
Role: QA Engineer testing dynamic proxy management

Task: Verify dynamic residential proxy management page
- Navigate to /proxy/dynamic/manage
- Check channel list API
- Verify city list API integration
- Validate statistics display

Success Criteria:
- Page loads successfully
- Channel API call succeeds
- City list API (985Proxy) works
- No hardcoded data
- No console errors

Instructions:
1. Navigate to http://localhost:8080/proxy/dynamic/manage
2. Take snapshot
3. List network requests
4. Find /api/v1/proxy/dynamic/channels request
5. Find /api/v1/proxy/dynamic/city-list request
6. Verify both return 200 status
7. Check console for errors
```

---

## Task 7: 钱包充值页面测试
**Status**: `[ ]`  
**Files**: Recharge页面  
**Requirements**: US-2  
**Estimated Time**: 10分钟

### Description
测试钱包充值页面功能

### Subtasks
1. 访问充值页面
2. 验证充值配置加载
3. 检查支付方式显示
4. 验证表单渲染

### _Prompt
```
Role: QA Engineer testing wallet recharge functionality

Task: Verify wallet recharge page loads correctly
- Navigate to /wallet/recharge
- Check recharge configuration API
- Verify payment methods display
- Validate form renders properly

Success Criteria:
- Page loads successfully
- Configuration API returns settings
- Payment options are visible
- No console errors

Instructions:
1. Navigate to http://localhost:8080/wallet/recharge
2. Take snapshot
3. List network requests
4. Check for settings/configuration API calls
5. Verify page structure
6. Record console messages
```

---

## Task 8: 账单明细页面测试
**Status**: `[ ]`  
**Files**: Orders, Transactions, Expenses页面  
**Requirements**: US-2, US-4  
**Estimated Time**: 15分钟

### Description
测试账单相关页面（订单、交易、消费记录）

### Subtasks
1. 测试订单列表页面
2. 测试交易记录页面
3. 测试消费记录页面
4. 验证分页功能

### _Prompt
```
Role: QA Engineer testing billing features

Task: Verify all billing-related pages load correctly
- Test /billing/orders
- Test /billing/transactions  
- Test /billing/expenses
- Check API calls for each page

Success Criteria:
- All 3 pages load successfully
- Each page makes correct API calls
- Data tables render (even if empty)
- No hardcoded transaction data
- No console errors

Instructions:
1. Navigate to each billing page
2. Take snapshot for each
3. List network requests for each
4. Verify API endpoints return 200
5. Check for hardcoded data in tables
6. Record all findings
```

---

## Task 9: 账户中心页面测试
**Status**: `[ ]`  
**Files**: Center页面, Settings API  
**Requirements**: US-2, US-4  
**Estimated Time**: 15分钟

### Description
测试账户中心页面，特别验证赠送余额已移除和客服链接动态加载

### Subtasks
1. 访问账户中心页面
2. 验证余额显示（确认无赠送余额）
3. 检查客服链接API
4. 验证用户信息加载

### _Prompt
```
Role: QA Engineer testing account center with focus on data consistency

Task: Verify account center page and confirm gift balance removal
- Navigate to /account/center
- Verify "赠送余额" is NOT displayed
- Check Telegram links API integration
- Validate user profile data

Success Criteria:
- Page loads successfully
- Only shows "账户余额" (not "赠送余额")
- GET /api/v1/settings/telegram succeeds
- User profile API returns correct data
- No gift_balance field in API response
- No console errors

Instructions:
1. Navigate to http://localhost:8080/account/center
2. Take detailed snapshot
3. Verify "赠送余额" text does NOT appear
4. List network requests
5. Get details of /settings/telegram request
6. Verify response format
7. Check user profile API response
8. Confirm no gift_balance field
9. Record all findings
```

---

## Task 10: 管理后台仪表盘测试
**Status**: `[ ]`  
**Files**: Admin Dashboard  
**Requirements**: US-1, US-4  
**Estimated Time**: 15分钟

### Description
测试管理后台仪表盘，验证所有统计数据从API加载

### Subtasks
1. 访问管理仪表盘
2. 验证统计数据API
3. 检查待处理事项
4. 验证收入趋势图表

### _Prompt
```
Role: QA Engineer testing admin dashboard with focus on real data

Task: Verify admin dashboard loads with real data (no hardcoded values)
- Navigate to /admin/dashboard
- Check all statistics API calls
- Verify pending items count is correct
- Validate revenue trend data

Success Criteria:
- Page loads successfully
- Statistics API returns real data
- Pending items match actual counts
- Revenue trend uses real transaction data
- No hardcoded statistics
- No console errors

Instructions:
1. Navigate to http://localhost:8080/admin/dashboard
2. Take snapshot
3. List all network requests
4. Find statistics/overview API calls
5. Get pending items API response
6. Verify counts are not hardcoded (e.g., not showing 3,3,3)
7. Check revenue trend data source
8. Record all API responses
```

---

## Task 11: 用户管理页面测试
**Status**: `[ ]`  
**Files**: Users管理页面  
**Requirements**: US-1  
**Estimated Time**: 15分钟

### Description
测试用户管理功能，包括添加用户和查看用户IP

### Subtasks
1. 访问用户管理页面
2. 验证用户列表加载
3. 检查添加用户功能可用性
4. 测试查看用户IP功能

### _Prompt
```
Role: QA Engineer testing user management features

Task: Verify user management page and admin features
- Navigate to /admin/users
- Check user list API
- Verify "添加用户" button exists
- Check "查看IP" functionality (API)

Success Criteria:
- Page loads successfully
- User list API returns data
- Add user dialog can be triggered
- View user IPs API exists and works
- No console errors

Instructions:
1. Navigate to http://localhost:8080/admin/users
2. Take snapshot
3. List network requests
4. Verify GET /api/v1/admin/users succeeds
5. Check if add user button is visible
6. If possible, verify /api/v1/admin/users/:id/ips endpoint exists
7. Record findings
```

---

## Task 12: 订单管理页面测试
**Status**: `[ ]`  
**Files**: Orders管理页面  
**Requirements**: US-1  
**Estimated Time**: 10分钟

### Description
测试管理后台订单管理功能

### Subtasks
1. 访问订单管理页面
2. 验证订单列表加载
3. 检查筛选功能
4. 验证订单详情

### _Prompt
```
Role: QA Engineer testing order management

Task: Verify admin order management page
- Navigate to /admin/orders
- Check order list API
- Verify filtering works (via API)
- Validate order data display

Success Criteria:
- Page loads successfully
- Order list API returns data
- Pagination works
- No console errors

Instructions:
1. Navigate to http://localhost:8080/admin/orders
2. Take snapshot
3. List network requests
4. Find GET /api/v1/admin/orders request
5. Verify response format
6. Check pagination parameters
7. Record findings
```

---

## Task 13: 价格管理页面测试
**Status**: `[ ]`  
**Files**: PriceOverrides页面  
**Requirements**: US-1  
**Estimated Time**: 15分钟

### Description
测试价格覆盖管理功能

### Subtasks
1. 访问价格管理页面
2. 验证价格列表加载
3. 检查985Proxy价格同步
4. 验证覆盖价格功能

### _Prompt
```
Role: QA Engineer testing price management

Task: Verify price override management page
- Navigate to /admin/price-overrides
- Check IP pool API with prices
- Verify price override functionality
- Validate 985Proxy integration

Success Criteria:
- Page loads successfully
- IP pool API returns inventory with prices
- Override functionality accessible
- No console errors

Instructions:
1. Navigate to http://localhost:8080/admin/price-overrides
2. Take snapshot
3. List network requests
4. Find price/inventory related APIs
5. Verify response contains price data
6. Check for override API endpoints
7. Record findings
```

---

## Task 14: 系统设置页面测试
**Status**: `[ ]`  
**Files**: Settings页面  
**Requirements**: US-1, US-4  
**Estimated Time**: 15分钟

### Description
测试系统设置页面，验证动态配置

### Subtasks
1. 访问系统设置页面
2. 验证设置加载
3. 检查客服链接配置
4. 验证价格配置

### _Prompt
```
Role: QA Engineer testing system settings

Task: Verify system settings page and dynamic configuration
- Navigate to /admin/settings
- Check settings API
- Verify Telegram links configuration
- Validate price settings

Success Criteria:
- Page loads successfully
- Settings API returns all configurations
- Telegram links can be configured
- Price settings are editable
- No hardcoded configuration values
- No console errors

Instructions:
1. Navigate to http://localhost:8080/admin/settings
2. Take snapshot
3. List network requests
4. Find GET /api/v1/settings or similar
5. Verify response contains telegram1, telegram2 etc.
6. Check for price configuration fields
7. Confirm no hardcoded values in form
8. Record findings
```

---

## Task 15: 充值审核页面测试
**Status**: `[ ]`  
**Files**: RechargeApproval页面  
**Requirements**: US-1  
**Estimated Time**: 10分钟

### Description
测试充值审核管理功能

### Subtasks
1. 访问充值审核页面
2. 验证待审核列表加载
3. 检查审核操作可用性
4. 验证状态更新

### _Prompt
```
Role: QA Engineer testing recharge approval

Task: Verify recharge approval management page
- Navigate to /admin/recharge-approval
- Check pending recharge list API
- Verify approval actions available
- Validate status display

Success Criteria:
- Page loads successfully
- Recharge list API returns data
- Approval/reject buttons visible
- No console errors

Instructions:
1. Navigate to http://localhost:8080/admin/recharge-approval
2. Take snapshot
3. List network requests
4. Find recharge list API
5. Check for approval action endpoints
6. Verify table renders correctly
7. Record findings
```

---

## Task 16: 985Proxy API完整集成测试
**Status**: `[ ]`  
**Files**: 所有985Proxy相关API  
**Requirements**: US-3, TR-2  
**Estimated Time**: 20分钟

### Description
全面测试所有985Proxy API集成

### Subtasks
1. 验证IP库存API
2. 验证业务场景API
3. 验证城市列表API
4. 检查API认证配置

### _Prompt
```
Role: QA Engineer specializing in API integration testing

Task: Comprehensively test all 985Proxy API integrations
- Verify all 985Proxy API endpoints work
- Check authentication configuration
- Validate response formats
- Test error handling

APIs to test:
- /api/v1/proxy/static/inventory (uses 985Proxy)
- /api/v1/proxy/static/business-scenarios (uses 985Proxy)
- /api/v1/proxy/dynamic/city-list (uses 985Proxy)

Success Criteria:
- All 985Proxy APIs return 200 status
- Responses contain real data (not mock)
- API keys are properly configured
- Error messages are informative
- No authentication failures

Instructions:
1. Check environment variables:
   - PROXY_985_API_KEY is set
   - PROXY_985_ZONE is set
2. Test each API endpoint:
   - Navigate to a page that calls the API
   - Capture network request
   - Get request details
   - Verify response structure
3. Check backend logs for 985Proxy API calls
4. Verify no mock/fallback data is used
5. Record all API responses and any errors
```

---

## Task 17: 数据一致性全面检查
**Status**: `[ ]`  
**Files**: 所有页面  
**Requirements**: US-4  
**Estimated Time**: 20分钟

### Description
检查所有页面的数据一致性，确保无硬编码数据

### Subtasks
1. 检查所有余额显示
2. 验证统计数据来源
3. 确认客服链接动态性
4. 检查赠送余额完全移除

### _Prompt
```
Role: QA Engineer conducting data consistency audit

Task: Verify no hardcoded data exists across the entire application
- Check all pages for hardcoded values
- Verify gift balance is completely removed
- Confirm all statistics use real data
- Validate dynamic configuration loading

Hardcoded patterns to look for:
- 固定余额数字 (e.g., always showing $50.00)
- 固定统计 (e.g., always 0/0/0 or 3/3/3)
- 写死的Telegram链接 (t.me/lubei12)
- gift_balance字段出现

Success Criteria:
- No hardcoded balance values found
- No hardcoded statistics found
- All Telegram links from API
- Zero mentions of "赠送余额" or "gift_balance"
- All data loads dynamically

Instructions:
1. Revisit key pages:
   - /dashboard (check statistics)
   - /account/center (check balance, Telegram)
   - /admin/dashboard (check pending items, revenue)
2. For each page:
   - Take snapshot and search for suspicious patterns
   - List network requests
   - Verify data comes from API
3. Check for gift_balance in API responses
4. Search page content for "赠送余额"
5. Compile list of any hardcoded data found
6. Record all findings with evidence
```

---

## Task 18: 生成最终测试报告
**Status**: `[ ]`  
**Files**: 测试报告  
**Requirements**: All  
**Estimated Time**: 15分钟

### Description
汇总所有测试结果，生成最终报告

### Subtasks
1. 统计测试结果
2. 标记关键问题
3. 提供修复建议
4. 生成交付清单

### _Prompt
```
Role: QA Lead generating final test report

Task: Compile all test results into comprehensive report
- Summarize all page tests
- List all issues found (critical/warning/info)
- Provide fix recommendations
- Generate delivery checklist

Report Structure:
1. Executive Summary
   - Total pages tested
   - Pass/Fail/Warning counts
   - Critical issues count
2. Detailed Results
   - Per-page test results
   - API integration status
   - Data consistency findings
3. Issues Found
   - Critical issues (blockers)
   - Warnings (should fix)
   - Info (nice to have)
4. 985Proxy Integration Status
5. Recommendations
6. Delivery Readiness Assessment

Success Criteria:
- Report is comprehensive and clear
- All issues are documented with evidence
- Recommendations are actionable
- Delivery decision is justified

Instructions:
1. Review all previous task results
2. Categorize all findings
3. Calculate success metrics
4. Determine if system is production-ready
5. Create detailed markdown report
6. Highlight any blockers
7. Provide go/no-go recommendation
```

---

## Summary

**Total Tasks**: 18
**Estimated Total Time**: 4-5 hours
**Test Coverage**: 15+ pages, 多个API端点, 数据一致性检查

**Execution Order**: Sequential (1→18)
**Tools Required**: Chrome DevTools MCP, Docker, 985Proxy API credentials

