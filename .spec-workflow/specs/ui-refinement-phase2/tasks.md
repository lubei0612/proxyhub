# Tasks Document - UI Refinement Phase 2

## Phase 1: Backend Enhancements

- [ ] 1. Enhance Auth Service Error Handling
  - Files: 
    - `backend/src/modules/auth/auth.service.ts`
    - `backend/src/modules/auth/auth.controller.ts`
  - Purpose: Add detailed error codes for login failures to distinguish between non-existent users and wrong passwords
  - _Leverage: Existing auth service structure, NestJS exception handling_
  - _Requirements: Requirement 5 - Enhanced Authentication Error Messages_
  - _Prompt: Role: Backend Security Developer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Enhance authentication service to return specific error codes (AUTH_USER_NOT_FOUND, AUTH_INVALID_PASSWORD, AUTH_INVALID_EMAIL_FORMAT) in auth.service.ts. Update auth.controller.ts to catch these errors and return standardized responses. First edit tasks.md to mark this task as [-] in-progress, implement the changes, then mark as [x] complete. | Restrictions: Do not expose sensitive information in error messages, maintain existing JWT token generation logic, follow NestJS exception handling patterns | Success: Login endpoint returns specific error codes, frontend can distinguish between user not found and wrong password, no security information leakage_

- [ ] 2. Add Static Proxy Credentials Virtual Field
  - Files:
    - `backend/src/modules/proxy/entities/static-proxy.entity.ts`
    - `backend/src/modules/proxy/proxy.service.ts`
  - Purpose: Add virtual field to StaticProxy entity that returns formatted "IP:Port:Account:Password" string
  - _Leverage: TypeORM virtual columns, existing entity structure_
  - _Requirements: Requirement 3 - Static Proxy Management IP Display Format_
  - _Prompt: Role: Backend Database Developer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Add a @VirtualColumn decorator (or getter method) to StaticProxy entity that returns credentials in format "${ip}:${port}:${username}:${password}". Ensure this field is included in API responses. First edit tasks.md to mark this task as [-] in-progress, implement the changes, then mark as [x] complete. | Restrictions: Do not modify existing database columns, maintain backward compatibility with existing API responses, ensure virtual field is serialized correctly | Success: API response includes credentials field with proper format, no database migration required, field works in list and detail endpoints_

## Phase 2: Frontend Core Utilities

- [ ] 3. Create Export Utility
  - Files:
    - `frontend/src/utils/export.ts` (NEW)
  - Purpose: Provide reusable export functionality for CSV and TXT formats
  - _Leverage: Browser Blob API, download API, existing utility patterns_
  - _Requirements: Requirement 4 - Export Functionality for Static Proxies_
  - _Prompt: Role: Frontend Utility Developer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Create export utility with functions: exportStaticProxies(format: 'csv' | 'txt', data: StaticProxy[]), formatAsTXT(data), formatAsCSV(data), downloadFile(content, filename, mimeType), generateFilename(format). First edit tasks.md to mark this task as [-] in-progress, implement the utility, then mark as [x] complete. | Restrictions: Must handle large datasets (up to 10,000 records), ensure browser compatibility, add proper TypeScript types, handle errors gracefully | Success: Export functions work for both CSV and TXT formats, files download with correct MIME types and filenames, handles edge cases (empty data, special characters)_

## Phase 3: Dynamic Proxy Management UI

- [ ] 4. Refactor DynamicManage.vue to 985Proxy Design
  - Files:
    - `frontend/src/views/proxy/DynamicManage.vue`
  - Purpose: Completely redesign dynamic proxy management page to match 985Proxy layout while keeping ProxyHub colors
  - _Leverage: Existing user store, Element Plus components, existing API integration_
  - _Requirements: Requirement 1 - Dynamic Proxy Management UI Replication_
  - _Prompt: Role: Frontend UI Developer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Refactor DynamicManage.vue to match 图二 (985Proxy design). Create 4 stat cards (套餐类型, 剩余流量, 状态, 流量单价) in a row using el-row and el-col. Add action buttons: "联系客服购买套餐", "升级套餐", "暂停使用", "套餐设置" - all linking to Telegram @lubei12. Display usage statistics table with columns: 日期, 请求数, 成功率, 流量使用, 费用, 备注. Maintain ProxyHub color scheme. First edit tasks.md to mark this task as [-] in-progress, implement the design, then mark as [x] complete. | Restrictions: Must use existing ProxyHub colors (no 985Proxy dark theme), maintain responsive design, use Element Plus components, ensure Telegram links open in new tab | Success: UI matches 985Proxy layout structure, all buttons link correctly to Telegram, table displays properly, ProxyHub colors maintained throughout, responsive on mobile_

## Phase 4: Static Proxy UI Enhancements

- [ ] 5. Add Country Flags to Static Proxy Buy Payment Panel
  - Files:
    - `frontend/src/views/proxy/StaticBuy.vue`
  - Purpose: Display country flags in payment panel using flag-icons library
  - _Leverage: flag-icons library (already installed), existing payment panel structure_
  - _Requirements: Requirement 2 - Static Proxy Selection Payment Panel with Country Flags_
  - _Prompt: Role: Frontend UI Developer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Update payment panel in StaticBuy.vue to display country flags. Replace emoji flags with <span :class="`fi fi-${item.code.toLowerCase()}`" class="flag-icon"></span>. Ensure flags display properly in "支付详情" section with format "[Flag] 国家 - 城市" (e.g., 🇺🇸 美国 - Chicago). Match 图六 (985Proxy payment panel). First edit tasks.md to mark this task as [-] in-progress, implement the flags, then mark as [x] complete. | Restrictions: Must use flag-icons library (not images or emojis), ensure flags scale properly with text, add fallback for missing flags, maintain existing payment panel functionality | Success: Country flags display correctly in payment panel, flags match countries accurately, payment panel matches 985Proxy design, fallback works for countries without flags_

- [ ] 6. Update Static Proxy Management IP Display Format
  - Files:
    - `frontend/src/views/proxy/StaticManage.vue`
  - Purpose: Display IP credentials in "IP:Port:Account:Password" format with one-click copy
  - _Leverage: Clipboard API, existing table structure, new backend credentials field_
  - _Requirements: Requirement 3 - Static Proxy Management IP Display Format_
  - _Prompt: Role: Frontend Developer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Modify StaticManage.vue table to display credentials field (from backend) in format "IP:端口:账号:密码". Add copy button/icon next to credentials field. Implement one-click copy using navigator.clipboard.writeText(). Show success message using ElMessage.success('已复制到剪贴板'). Update table columns to match 图八: 所属通道, IP地址:端口:账号:密码, 国家 (with flag), filter fields. First edit tasks.md to mark this task as [-] in-progress, implement the display and copy, then mark as [x] complete. | Restrictions: Must use new credentials field from backend, handle copy errors gracefully, maintain existing filter functionality, ensure table is horizontally scrollable for 节点ID and 备注 | Success: Credentials display in single field with correct format, copy button works and shows confirmation, table structure matches requirements, filters still work correctly_

- [ ] 7. Implement Export Functionality in Static Proxy Management
  - Files:
    - `frontend/src/views/proxy/StaticManage.vue`
  - Purpose: Add export buttons for CSV and TXT formats using export utility
  - _Leverage: Export utility from task 3, existing proxy data_
  - _Requirements: Requirement 4 - Export Functionality for Static Proxies_
  - _Prompt: Role: Frontend Developer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Add export functionality to StaticManage.vue. Create export dropdown button with options for CSV and TXT. Import exportStaticProxies from '@/utils/export'. Call export function with current proxy list data. Handle export errors with try-catch and show error message. Ensure export matches 图九 format for TXT (one credential per line). First edit tasks.md to mark this task as [-] in-progress, implement export buttons and logic, then mark as [x] complete. | Restrictions: Must use export utility from task 3, handle empty data case (show warning), respect current filters (export only filtered results), maintain UI consistency with existing buttons | Success: Export buttons appear in appropriate location, CSV and TXT exports work correctly, exported files have proper format and filenames, handles edge cases (empty list, special characters)_

## Phase 5: Authentication UI Enhancement

- [ ] 8. Enhance Login Error Messages
  - Files:
    - `frontend/src/views/auth/Login.vue`
  - Purpose: Display specific error messages based on backend error codes
  - _Leverage: Enhanced auth API from task 1, existing login form structure_
  - _Requirements: Requirement 5 - Enhanced Authentication Error Messages_
  - _Prompt: Role: Frontend Developer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Update Login.vue to handle new error codes from backend. Add error message mapping: AUTH_USER_NOT_FOUND -> "该账号不存在，请先注册", AUTH_INVALID_PASSWORD -> "密码错误，请重试", AUTH_INVALID_EMAIL_FORMAT -> "请输入有效的邮箱地址". Update catch block in handleLogin to parse error.response.data.errorCode and display appropriate message using ElMessage.error(). First edit tasks.md to mark this task as [-] in-progress, implement error handling, then mark as [x] complete. | Restrictions: Must maintain existing login logic, handle cases where error code is not provided (use generic message), do not expose sensitive information, ensure error messages are user-friendly | Success: Specific error messages display for each error scenario, generic fallback works for unexpected errors, error messages are clear and actionable, no console errors_

## Phase 6: Comprehensive Testing

- [ ] 9. Test All User Portal Features
  - Files: N/A (Testing phase using Chrome DevTools)
  - Purpose: Verify all user portal menu items work correctly with no errors
  - _Leverage: Chrome DevTools MCP, existing application_
  - _Requirements: Requirement 6 - Comprehensive Testing Coverage_
  - _Prompt: Role: QA Engineer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Use Chrome DevTools MCP (mcp_cursor-playwright tools) to test all user portal features from 图三图四 menu. For each page: 1) Navigate to page 2) Take screenshot 3) Check console for errors 4) Verify network requests 5) Test interactive elements. Test pages: Dashboard, Dynamic Proxy Management (verify 985Proxy design), Dynamic Proxy Buy, Static Proxy Management (verify IP format and export), Static Proxy Buy (verify flags), Mobile Proxy, Wallet Recharge, Order Management, Transaction Details, Settlement Records, Recharge Orders, Account Center, Event Log, Profile, My Proxies, Notification Management. First edit tasks.md to mark this task as [-] in-progress, perform testing, document results, then mark as [x] complete. | Restrictions: Must test in incognito mode, document all errors found, take screenshots of critical pages, verify no console errors, check network tab for failed API calls | Success: All pages load without errors, screenshots confirm UI matches design, network requests succeed, interactive elements work (buttons, forms, filters), comprehensive test report created_

- [ ] 10. Test All Admin Portal Features
  - Files: N/A (Testing phase using Chrome DevTools)
  - Purpose: Verify all admin portal features work correctly
  - _Leverage: Chrome DevTools MCP, admin account_
  - _Requirements: Requirement 6 - Comprehensive Testing Coverage_
  - _Prompt: Role: QA Engineer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Use Chrome DevTools MCP to test all admin portal features. Login as admin (admin@example.com). Test pages: User Management, Recharge Approval, Statistics, Order Management, IP Management, System Settings, Price Override Management. For each page: 1) Navigate and screenshot 2) Test CRUD operations 3) Verify data loads correctly 4) Check console and network. First edit tasks.md to mark this task as [-] in-progress, perform testing, document results, then mark as [x] complete. | Restrictions: Must use admin credentials, test actual functionality (not just page load), document any permission issues, verify admin-specific features, ensure no data corruption during testing | Success: All admin pages load and function correctly, CRUD operations work, no permission errors, admin features verified, test report includes all findings_

## Phase 7: Final Integration and Documentation

- [ ] 11. Fix All P0 Issues Found During Testing
  - Files: Various (based on test results)
  - Purpose: Address all critical bugs discovered during comprehensive testing
  - _Leverage: Test reports from tasks 9 and 10_
  - _Requirements: All requirements_
  - _Prompt: Role: Senior Developer | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Review test reports from tasks 9 and 10. Fix all P0 (critical) issues that prevent core functionality. This may include: fixing broken API calls, correcting UI layout issues, resolving console errors, fixing navigation problems, addressing authentication issues. Prioritize issues that block user workflows. First edit tasks.md to mark this task as [-] in-progress, fix issues, retest, then mark as [x] complete. | Restrictions: Must fix issues in order of priority, retest after each fix, do not introduce new bugs, maintain code quality, follow existing patterns | Success: All P0 issues resolved, affected features retested and working, no new bugs introduced, code changes committed to Git_

- [ ] 12. Create Final Test Report and Deliverable
  - Files:
    - `docs/reports/ui-refinement-phase2-final-report.md` (NEW)
  - Purpose: Document all changes, test results, and confirm deliverable status
  - _Leverage: All previous test results and implementation notes_
  - _Requirements: All requirements_
  - _Prompt: Role: Technical Writer / QA Lead | Task: Implement the task for spec ui-refinement-phase2, first run spec-workflow-guide to get the workflow guide then implement the task: Create comprehensive final report documenting: 1) All implemented features (Requirements 1-6) 2) Test results summary (pass/fail for each feature) 3) Known issues (if any) with severity levels 4) Screenshots of key UI changes 5) Deployment readiness checklist 6) Recommendation for production deployment. First edit tasks.md to mark this task as [-] in-progress, create report, then mark as [x] complete. | Restrictions: Must be objective and accurate, include evidence (screenshots, test data), clearly state any limitations, provide actionable recommendations | Success: Report is comprehensive and professional, all features documented with evidence, test results clearly presented, deployment recommendation is data-driven_

## Testing Checklist

### User Portal Pages (图三图四)
- [ ] 仪表盘 (Dashboard) - Charts load, data displays
- [ ] 动态住宅管理 (Dynamic Proxy Management) - **NEW 985Proxy design**
- [ ] 动态住宅选购 (Dynamic Proxy Buy) - No regressions
- [ ] 静态住宅管理 (Static Proxy Management) - **NEW IP format, export buttons**
- [ ] 静态住宅选购 (Static Proxy Buy) - **NEW country flags in payment panel**
- [ ] 移动代理 (Mobile Proxy) - Loads or shows placeholder
- [ ] 钱包充值 (Wallet Recharge) - No regressions
- [ ] 订单管理 (Order Management) - Filters work
- [ ] 交易明细 (Transaction Details) - Filters work
- [ ] 结算记录 (Settlement Records) - Filters work
- [ ] 充值订单 (Recharge Orders) - Filters work
- [ ] 账户中心 (Account Center) - Responsive, links work
- [ ] 事件日志 (Event Log) - No private data shown
- [ ] 个人中心 (Profile) - Loads and updates
- [ ] 我的代理 (My Proxies) - Displays correctly
- [ ] 通知管理 (Notification Management) - Notifications display

### Admin Portal Pages
- [ ] Admin Login - **NEW error messages**
- [ ] 用户管理 (User Management) - List, CRUD operations
- [ ] 充值审核 (Recharge Approval) - Approve/Reject works
- [ ] 统计数据 (Statistics) - Charts display
- [ ] 订单管理 (Order Management) - Admin view works
- [ ] IP管理 (IP Management) - CRUD operations
- [ ] 系统设置 (System Settings) - Save/Load works
- [ ] 价格覆盖管理 (Price Override Management) - Price cards display and update

### Chrome DevTools Checks (For Each Page)
- [ ] Console: No errors or warnings
- [ ] Network: All API calls return success (200/201)
- [ ] Network: Response times under 1000ms
- [ ] Screenshot: UI matches design specifications
- [ ] Performance: Page load under 3 seconds

