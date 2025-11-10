# Tasks Document

## Phase 1: Critical Fixes (P0)

- [ ] 1. Create database migration to merge gift_balance into balance
  - Files: `backend/src/database/migrations/XXXXXX-MergeGiftBalanceToBalance.ts`
  - Create TypeORM migration to safely merge gift_balance into balance field
  - _Leverage: Existing TypeORM migration pattern_
  - _Requirements: 1_
  - _Prompt: Role: Database Administrator with TypeORM expertise | Task: Create a TypeORM migration (XXXXXX-MergeGiftBalanceToBalance.ts) that merges existing gift_balance into balance for all users following requirement 1. Use UPDATE query to add gift_balance to balance where gift_balance > 0, then set gift_balance to 0. | Restrictions: Must be reversible (down migration), must not cause data loss, must handle NULL values safely | Success: Migration runs successfully, all users' gift_balance merged into balance, reversible down migration works, no data loss_

- [ ] 2. Remove gift_balance from User entity and DTOs
  - Files: `backend/src/modules/user/entities/user.entity.ts`, `backend/src/modules/user/dto/*.ts`
  - Remove gift_balance field from User entity, update all DTOs
  - Update serialization to exclude gift_balance
  - _Leverage: Existing User entity structure_
  - _Requirements: 1_
  - _Prompt: Role: Backend Developer with NestJS expertise | Task: Remove gift_balance field from User entity (backend/src/modules/user/entities/user.entity.ts) and all related DTOs per requirement 1. Update @Exclude decorators if needed. | Restrictions: Do not remove the database column (keep for rollback safety), only remove from TypeScript definitions | Success: gift_balance not exposed in API responses, TypeScript compilation successful, no breaking changes to existing API contracts_

- [ ] 3. Update admin balance operations to only use balance field
  - Files: `backend/src/modules/admin/admin.service.ts`, `backend/src/modules/admin/admin.controller.ts`
  - Remove giftBalance() method
  - Update deductBalance() to only affect balance field
  - Remove gift_balance from getStatistics()
  - _Leverage: Existing balance operation patterns_
  - _Requirements: 1_
  - _Prompt: Role: Backend Developer with transaction management expertise | Task: Refactor admin balance operations in admin.service.ts per requirement 1. Remove giftBalance() method completely. Update deductBalance() to only operate on balance field. Remove gift_balance from getStatistics() response. | Restrictions: Must maintain transaction integrity, do not change API endpoint names (backward compatibility), must update transaction remark to clarify which balance is affected | Success: All balance operations only affect balance field, transaction records are clear, no gift_balance in API responses_

- [ ] 4. Remove gift_balance logic from proxy purchase/renewal
  - Files: `backend/src/modules/proxy/static/static-proxy.service.ts`
  - Update purchaseStaticProxy() and renewIP() to only deduct from balance
  - Remove gift_balance prioritization logic
  - _Leverage: Existing purchase transaction management_
  - _Requirements: 1_
  - _Prompt: Role: Backend Developer with payment processing expertise | Task: Update purchaseStaticProxy() and renewIP() methods in static-proxy.service.ts per requirement 1. Remove all logic that deducts from gift_balance. Only deduct from balance field. Update transaction remarks to reflect this change. | Restrictions: Must maintain transaction atomicity, do not change pricing logic, ensure balance checks are still accurate | Success: Purchases only deduct from balance, transaction records are accurate, no references to gift_balance in purchase flow_

- [ ] 5. Remove gift_balance from frontend user display
  - Files: `frontend/src/views/account/Center.vue`, `frontend/src/views/admin/Users.vue`, `frontend/src/views/admin/Dashboard.vue`
  - Remove gift_balance display components
  - Update balance display to only show balance field
  - Remove "赠送余额" UI elements
  - _Leverage: Existing Element Plus component patterns_
  - _Requirements: 1_
  - _Prompt: Role: Frontend Developer with Vue 3 expertise | Task: Remove all gift_balance UI elements from Center.vue, Users.vue, and Dashboard.vue per requirement 1. Remove "赠送余额" display cards/columns. Update balance display to only show balance. | Restrictions: Do not change overall layout significantly, maintain responsive design, ensure all balance displays are updated | Success: No gift_balance displayed anywhere, balance displays are clear and prominent, UI remains visually balanced_

- [ ] 6. Create Settings module (backend)
  - Files: `backend/src/modules/settings/settings.module.ts`, `backend/src/modules/settings/settings.service.ts`, `backend/src/modules/settings/settings.controller.ts`, `backend/src/modules/settings/entities/setting.entity.ts`
  - Create Settings entity with key-value structure
  - Implement getSettings(), updateSettings(), getTelegramLinks()
  - Add admin-only authorization
  - _Leverage: Existing module structure pattern_
  - _Requirements: 2_
  - _Prompt: Role: Backend Developer with NestJS module creation expertise | Task: Create complete Settings module per requirement 2. Create setting.entity.ts with key/value fields. Implement settings.service.ts with CRUD methods. Create settings.controller.ts with GET /settings and PUT /settings endpoints. Add @Roles('admin') to update endpoint. | Restrictions: Must follow existing module patterns, key names must be prefixed (e.g., 'telegram_support_1'), values stored as TEXT | Success: Module compiles and integrates, settings can be queried and updated, admin authorization works, GET endpoint is public for frontend use_

- [ ] 7. Create settings database migration
  - Files: `backend/src/database/migrations/XXXXXX-CreateSettingsTable.ts`
  - Create settings table with key, value, updated_at fields
  - Insert default Telegram links
  - _Leverage: Existing TypeORM migration pattern_
  - _Requirements: 2_
  - _Prompt: Role: Database Administrator with SQL expertise | Task: Create TypeORM migration (XXXXXX-CreateSettingsTable.ts) per requirement 2. CREATE TABLE settings with columns: key VARCHAR(100) PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP DEFAULT NOW(). INSERT default values for telegram_support_1 and telegram_support_2. | Restrictions: Key must be unique, value must not be nullable, include down migration to drop table | Success: Migration runs successfully, table created with correct schema, default values inserted, reversible_

- [ ] 8. Update frontend to fetch customer service links from API
  - Files: `frontend/src/views/account/Center.vue`, `frontend/src/api/modules/settings.ts`
  - Create settings.ts API module with getSettings() and getTelegramLinks()
  - Update Center.vue to fetch links on mount
  - Replace hardcoded 'lubei12' with dynamic links
  - _Leverage: Existing API service pattern_
  - _Requirements: 2_
  - _Prompt: Role: Frontend Developer with Vue 3 and API integration expertise | Task: Update Center.vue per requirement 2. Create settings.ts API module with getTelegramLinks() method calling GET /api/v1/settings/telegram. In Center.vue onMounted, fetch links and update telegramSupport1/2 refs. Replace openTelegram('lubei12') calls with dynamic refs. | Restrictions: Must handle API errors gracefully (show fallback message), maintain loading states, do not break existing Telegram link functionality | Success: Links are fetched from API on page load, clicking contact buttons opens correct Telegram links, fallback works if API fails_

- [ ] 9. Add Telegram links configuration to admin Settings page
  - Files: `frontend/src/views/admin/Settings.vue`, `frontend/src/api/modules/settings.ts`
  - Add form fields for telegram_support_1 and telegram_support_2
  - Implement save functionality calling PUT /api/v1/settings
  - _Leverage: Existing admin settings UI pattern_
  - _Requirements: 2_
  - _Prompt: Role: Frontend Developer with form handling expertise | Task: Enhance Settings.vue per requirement 2. Add two el-input fields for "Telegram 客服 1" and "Telegram 客服 2". Add updateSettings() API call in settings.ts. On save, call PUT /api/v1/settings with new values. Show success/error toast. | Restrictions: Must validate input (non-empty), maintain existing settings fields, use Element Plus form validation | Success: Admin can update Telegram links, changes are saved to database, success message shown, users see new links immediately_

- [ ] 10. Fix "Add User" button functionality
  - Files: `frontend/src/views/admin/Users.vue`
  - Create Add User dialog with form (email, password, role, initialBalance)
  - Implement form validation
  - Call POST /api/v1/admin/users API
  - _Leverage: Existing admin dialog patterns_
  - _Requirements: 3_
  - _Prompt: Role: Frontend Developer with form handling and validation expertise | Task: Fix "Add User" button in Users.vue per requirement 3. Create dialog with el-form containing fields: email (required, email validation), password (required, min 8 chars), role (select: user/admin), initialBalance (number, default 0). On submit, call createUser() API. Show success toast and reload user list. | Restrictions: Must validate all fields before submission, password must meet security requirements, handle API errors gracefully | Success: Clicking "Add User" opens dialog, form validates correctly, user created successfully, list refreshes automatically_

- [ ] 11. Implement createUser API endpoint
  - Files: `backend/src/modules/admin/admin.controller.ts`, `backend/src/modules/admin/admin.service.ts`, `backend/src/modules/admin/dto/create-user.dto.ts`
  - Create CreateUserDto with validation
  - Implement createUser() in admin.service.ts
  - Hash password using bcrypt
  - Add admin authorization
  - _Leverage: Existing user creation pattern from auth module_
  - _Requirements: 3_
  - _Prompt: Role: Backend Developer with authentication and authorization expertise | Task: Implement POST /api/v1/admin/users endpoint per requirement 3. Create create-user.dto.ts with @IsEmail, @IsString @MinLength(8), @IsEnum, @IsNumber @Min(0) validation. In admin.service.ts createUser(), hash password using bcrypt (same as auth module), create user with role and balance. Add @Roles('admin') to controller endpoint. | Restrictions: Must validate all inputs with class-validator, password must be hashed before saving, must check if email already exists | Success: Admin can create users via API, passwords are hashed, validation prevents invalid data, duplicate email rejected with clear error_

## Phase 2: Admin Tools (P1)

- [ ] 12. Create getUserIPs endpoint
  - Files: `backend/src/modules/admin/admin.controller.ts`, `backend/src/modules/admin/admin.service.ts`
  - Implement GET /api/v1/admin/users/:id/ips
  - Query static_proxies, dynamic_channels, transactions tables
  - Return combined data structure
  - _Leverage: Existing repository queries_
  - _Requirements: 4_
  - _Prompt: Role: Backend Developer with database query optimization expertise | Task: Implement GET /api/v1/admin/users/:id/ips per requirement 4. In admin.service.ts create getUserIPs() method that queries: 1) static_proxies WHERE user_id = :id, 2) dynamic_channels WHERE user_id = :id, 3) transactions WHERE user_id = :id ORDER BY created_at DESC LIMIT 5. Return { staticProxies: [], dynamicChannels: [], recentTransactions: [] }. Add @Roles('admin') to controller. | Restrictions: Must use TypeORM relations, optimize queries with eager loading where appropriate, handle user not found case | Success: Endpoint returns user's IPs and transactions, query is optimized (< 2 seconds for 100+ IPs), admin authorization works_

- [ ] 13. Create User IP Modal component
  - Files: `frontend/src/components/UserIPModal.vue`
  - Create modal with tabs (Static IPs / Dynamic Channels / Transactions)
  - Display data in tables
  - Add "Export Excel" button
  - _Leverage: Element Plus ElDialog, ElTabs, ElTable components_
  - _Requirements: 4_
  - _Prompt: Role: Frontend Developer with Vue 3 Composition API expertise | Task: Create UserIPModal.vue per requirement 4. Props: userId, userName, visible. Use el-dialog with el-tabs. Tab 1: Static IPs table (IP, port, country, expiry, order #). Tab 2: Dynamic Channels table (name, traffic, package, order #). Tab 3: Transactions table (date, type, amount, balance, order #). Add "Export Excel" and "Close" buttons. Fetch data from GET /api/v1/admin/users/:id/ips on mount. | Restrictions: Must handle loading states, show empty state if no data, tables must be paginated if > 20 rows | Success: Modal displays all user data correctly, tabs work smoothly, loading and empty states handled, responsive design_

- [ ] 14. Implement Excel export functionality for user IPs
  - Files: `frontend/src/components/UserIPModal.vue`, `frontend/src/utils/export.ts`
  - Create export.ts utility using xlsx library
  - Implement exportUserIPsToExcel() function
  - Generate filename with username and timestamp
  - _Leverage: SheetJS (xlsx) library_
  - _Requirements: 4_
  - _Prompt: Role: Frontend Developer with file export expertise | Task: Create export.ts utility per requirement 4. Install xlsx library. Implement exportUserIPsToExcel(data, username) that creates Excel workbook with 3 sheets: "Static IPs", "Dynamic Channels", "Transactions". Each sheet has appropriate headers and data. Filename format: `user-ips-{username}-{timestamp}.xlsx`. In UserIPModal, wire "Export Excel" button to call this function with current data. | Restrictions: Must handle large datasets (1000+ rows) efficiently, Excel must be properly formatted with headers, date fields must be human-readable | Success: Clicking export downloads Excel file, all data included, filename is descriptive, file opens correctly in Excel/LibreOffice_

- [ ] 15. Add "View IPs" button to Users admin page
  - Files: `frontend/src/views/admin/Users.vue`
  - Add "查看IP" button to user list actions
  - Open UserIPModal when clicked
  - Pass userId and userName as props
  - _Leverage: Existing action button pattern_
  - _Requirements: 4_
  - _Prompt: Role: Frontend Developer with Vue 3 expertise | Task: Add "View IPs" button to Users.vue per requirement 4. In user list table actions column, add el-button with "查看IP" label. On click, set selectedUserId and selectedUserName refs, then set modalVisible to true. Import UserIPModal component and add to template with v-model:visible. | Restrictions: Button must be styled consistently with other action buttons, modal must be conditionally rendered, must handle modal close event | Success: Button appears in user list, clicking opens modal with correct user data, modal closes properly, no memory leaks_

- [ ] 16. Create settlements table migration
  - Files: `backend/src/database/migrations/XXXXXX-CreateSettlementsTable.ts`
  - Create settlements table schema
  - Add appropriate indexes
  - _Leverage: Existing TypeORM migration pattern_
  - _Requirements: 6_
  - _Prompt: Role: Database Administrator with schema design expertise | Task: Create TypeORM migration (XXXXXX-CreateSettlementsTable.ts) per requirement 6. CREATE TABLE settlements with columns: id SERIAL PRIMARY KEY, settlement_no VARCHAR(50) UNIQUE NOT NULL, start_date TIMESTAMP NOT NULL, end_date TIMESTAMP NOT NULL, total_amount DECIMAL(10,2) NOT NULL, order_count INTEGER DEFAULT 0, status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW(), completed_at TIMESTAMP. Add indexes on status and date range. | Restrictions: settlement_no must be unique, status must have CHECK constraint or enum, include down migration | Success: Migration runs successfully, table created with indexes, constraints enforced, reversible_

- [ ] 17. Implement settlement backend logic
  - Files: `backend/src/modules/admin/admin.service.ts`, `backend/src/modules/admin/dto/settlement.dto.ts`
  - Create Settlement entity
  - Implement getSettlements() and createSettlement()
  - Aggregate orders for date range
  - _Leverage: Existing order repository_
  - _Requirements: 6_
  - _Prompt: Role: Backend Developer with financial systems expertise | Task: Implement settlement logic per requirement 6. Create settlement.entity.ts. In admin.service.ts add getSettlements() to query settlements with pagination. Add createSettlement(dto: CreateSettlementDto) that: 1) Queries orders WHERE created_at BETWEEN start_date AND end_date AND status = 'completed', 2) Calculates SUM(amount) and COUNT(*), 3) Creates settlement record with generated settlement_no (format: SETT-YYYYMMDD-XXXX). | Restrictions: Must use database transactions, settlement_no must be unique, must validate date range (start < end) | Success: Settlements can be created for any date range, aggregation is accurate, duplicate settlement prevention works, query performance is good_

- [ ] 18. Update Settlement admin frontend
  - Files: `frontend/src/views/admin/Settlement.vue`
  - Replace hardcoded data with API calls
  - Implement "Create Settlement" functionality
  - Add date range picker for settlement creation
  - _Leverage: Existing Element Plus date picker and table_
  - _Requirements: 6_
  - _Prompt: Role: Frontend Developer with admin UI expertise | Task: Update Settlement.vue per requirement 6. Replace mock data with API call to GET /api/v1/admin/settlements. Add "Create Settlement" dialog with el-date-picker for start/end dates. On submit, call POST /api/v1/admin/settlements with date range. Show success message and refresh list. Display: settlement ID, period, amount, order count, status, dates. | Restrictions: Must validate date range (start < end, not in future), handle loading states, show empty state if no settlements | Success: Settlement list shows real data, admin can create new settlements, date validation works, list refreshes after creation_

## Phase 3: Proxy Enhancements (P2)

- [ ] 19. Add dynamic proxy extraction table migration
  - Files: `backend/src/database/migrations/XXXXXX-CreateDynamicProxyExtractionsTable.ts`
  - Create dynamic_proxy_extractions table
  - Add foreign keys and indexes
  - _Leverage: Existing TypeORM migration pattern_
  - _Requirements: 5_
  - _Prompt: Role: Database Administrator with relational database expertise | Task: Create migration (XXXXXX-CreateDynamicProxyExtractionsTable.ts) per requirement 5. CREATE TABLE dynamic_proxy_extractions with: id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, channel_id INT REFERENCES dynamic_channels(id) ON DELETE CASCADE, extracted_count INT NOT NULL, country_code VARCHAR(10), ip_list JSONB NOT NULL, traffic_consumed DECIMAL(10,2) DEFAULT 0, cost DECIMAL(10,2) DEFAULT 0, created_at TIMESTAMP DEFAULT NOW(). Add indexes on user_id and channel_id. | Restrictions: Must have foreign key constraints, ip_list must store array of IP strings as JSON, include down migration | Success: Table created with proper relationships, indexes improve query performance, JSONB type works correctly_

- [ ] 20. Enhance dynamic_channels table schema
  - Files: `backend/src/database/migrations/XXXXXX-EnhanceDynamicChannelsTable.ts`
  - Add zone_id, package_type, traffic_limit, traffic_used, price_per_gb, monthly_fee columns
  - _Leverage: Existing TypeORM ALTER TABLE pattern_
  - _Requirements: 5_
  - _Prompt: Role: Database Administrator with migration expertise | Task: Create migration (XXXXXX-EnhanceDynamicChannelsTable.ts) per requirement 5. ALTER TABLE dynamic_channels ADD COLUMN zone_id VARCHAR(100), package_type VARCHAR(20) DEFAULT 'personal', traffic_limit DECIMAL(10,2), traffic_used DECIMAL(10,2) DEFAULT 0, price_per_gb DECIMAL(10,2) DEFAULT 4.5, monthly_fee DECIMAL(10,2). All columns nullable for backward compatibility. | Restrictions: Must not break existing data, use ALTER TABLE ADD COLUMN IF NOT EXISTS syntax, include down migration that drops columns | Success: Columns added successfully, existing channels still work, new channels can use enhanced fields_

- [ ] 21. Implement 985Proxy dynamic residential API integration
  - Files: `backend/src/modules/proxy985/proxy985.service.ts`
  - Add getCityList() method (GET /res_rotating/city_list)
  - Add extractProxy() method (GET /res_rotating/extract)
  - _Leverage: Existing proxy985 HTTP client_
  - _Requirements: 5_
  - _Prompt: Role: Backend Developer with third-party API integration expertise | Task: Add dynamic residential methods to proxy985.service.ts per requirement 5. Implement getCityList() calling GET /res_rotating/city_list with apikey param. Implement extractProxy(params: { zone, num, area?, life?, format? }) calling GET /res_rotating/extract. Return typed responses. Add error handling and logging. | Restrictions: Must reuse existing HTTP client instance, must handle API errors gracefully (timeout, 4xx, 5xx), must log request/response for debugging | Success: Both methods call 985Proxy API correctly, responses are typed, errors are caught and logged, apikey is included in all requests_

- [ ] 22. Create DynamicProxyService with extraction logic
  - Files: `backend/src/modules/proxy/dynamic/dynamic-proxy.service.ts`, `backend/src/modules/proxy/dynamic/dto/extract-proxy.dto.ts`
  - Implement extractProxy() business logic
  - Check traffic limits, calculate cost, deduct balance
  - Save extraction log
  - _Leverage: Existing transaction pattern from static-proxy.service.ts_
  - _Requirements: 5_
  - _Prompt: Role: Backend Developer with transaction management expertise | Task: Create dynamic-proxy.service.ts per requirement 5. Implement extractProxy(userId, channelId, dto: ExtractProxyDto) that: 1) Validates channel belongs to user, 2) Checks traffic limit (personal package), 3) Calls proxy985Service.extractProxy(), 4) Calculates traffic consumed (quantity * 0.1 GB), 5) Calculates cost (personal: traffic * price_per_gb, unlimited: 0), 6) Deducts user balance (if cost > 0), 7) Updates channel.traffic_used, 8) Saves extraction log to dynamic_proxy_extractions table. Use database transaction. | Restrictions: Must be atomic (all or nothing), must check balance before API call, must not charge unlimited package users per-extraction | Success: IPs extracted successfully, balance deducted accurately, traffic tracked, log saved, rollback works on API failure_

- [ ] 23. Create dynamic proxy extraction endpoints
  - Files: `backend/src/modules/proxy/dynamic/dynamic-proxy.controller.ts`
  - Implement GET /proxy/dynamic/countries
  - Implement POST /proxy/dynamic/:channelId/extract
  - Implement GET /proxy/dynamic/:channelId/history
  - _Leverage: Existing controller pattern_
  - _Requirements: 5_
  - _Prompt: Role: Backend Developer with RESTful API design expertise | Task: Create dynamic-proxy.controller.ts per requirement 5. Add @Controller('proxy/dynamic'). Implement: GET /countries (calls proxy985Service.getCityList()), POST /:channelId/extract (calls dynamicProxyService.extractProxy() with @Body ExtractProxyDto), GET /:channelId/history (queries extractions for channel). Add authentication and user ownership validation. | Restrictions: Must validate channelId exists, must verify channel belongs to authenticated user, must use DTO validation | Success: All endpoints work correctly, authorization prevents unauthorized access, DTOs validate input, responses are properly formatted_

- [ ] 24. Create Dynamic Proxy Extract Dialog component
  - Files: `frontend/src/components/DynamicExtractDialog.vue`
  - Create dialog with form (country, quantity, lifetime, format)
  - Fetch country list from API
  - Show estimated traffic and cost
  - Display extracted IPs on success
  - _Leverage: Element Plus components_
  - _Requirements: 5_
  - _Prompt: Role: Frontend Developer with Vue 3 and form handling expertise | Task: Create DynamicExtractDialog.vue per requirement 5. Props: channel (DynamicChannel), visible. Form fields: el-select for country (load from GET /proxy/dynamic/countries), el-input-number for quantity (1-100), el-select for lifetime (30/60/120 min), el-select for format (TXT/JSON). Display computed: estimatedTraffic = quantity * 0.1 GB, estimatedCost = channel.package_type === 'personal' ? estimatedTraffic * channel.price_per_gb : 0. On submit, call POST /proxy/dynamic/:channelId/extract. Show IP list in result area with copy buttons. | Restrictions: Must validate quantity > 0, must show loading state during extraction, must handle API errors with clear messages | Success: Dialog opens with pre-loaded countries, form validates correctly, extraction works, IPs displayed with copy functionality, cost calculation accurate_

- [ ] 25. Integrate extract dialog into Dynamic Manage page
  - Files: `frontend/src/views/proxy/DynamicManage.vue`
  - Add "Extract IP" button to channel list
  - Open DynamicExtractDialog when clicked
  - Refresh channel data after extraction
  - _Leverage: Existing dynamic management UI_
  - _Requirements: 5_
  - _Prompt: Role: Frontend Developer with Vue 3 expertise | Task: Update DynamicManage.vue per requirement 5. Add "提取IP" button to each channel in the list. On click, set selectedChannel ref and open DynamicExtractDialog. After successful extraction, fetch updated channel data to show new traffic_used value. Handle dialog close event. | Restrictions: Button should be disabled if channel status is not 'active', must show channel's current traffic usage prominently | Success: Extract button appears for each channel, clicking opens dialog, extraction updates traffic display, user can see traffic consumption in real-time_

- [ ] 26. Fix static IP table horizontal scrolling
  - Files: `frontend/src/views/proxy/StaticManage.vue`
  - Update table to display all columns in one row
  - Add horizontal scroll with CSS
  - Maintain consistent column widths
  - _Leverage: Element Plus ElTable with fixed layout_
  - _Requirements: 7_
  - _Prompt: Role: Frontend Developer with CSS and table layout expertise | Task: Update StaticManage.vue table per requirement 7. Remove any wrapped or multi-row cell layouts. Set el-table :table-layout="'fixed'" and add CSS: .el-table__body-wrapper { overflow-x: auto; white-space: nowrap; }. Set min-width for each column: channel (120px), IP:Port:User:Pass (300px), country (120px), expiry (180px), release (180px), node ID (100px), remark (150px), actions (200px). | Restrictions: Must not break responsive design, must maintain Element Plus styling, must work on all screen sizes | Success: All columns visible in one row, table scrolls horizontally on narrow screens, column widths match 985Proxy layout, no layout breaking_

- [ ] 27. Fix copy button functionality for IP credentials
  - Files: `frontend/src/views/proxy/StaticManage.vue`
  - Implement working clipboard copy using Clipboard API
  - Add visual feedback (icon highlight, success toast)
  - Handle copy failures gracefully
  - _Leverage: Navigator Clipboard API_
  - _Requirements: 7_
  - _Prompt: Role: Frontend Developer with browser API expertise | Task: Fix copy button in StaticManage.vue per requirement 7. In IP:Port:User:Pass column, add el-icon DocumentCopy button next to credentials. On click, call navigator.clipboard.writeText(`${ip}:${port}:${username}:${password}`). On success: show ElMessage.success('已复制到剪贴板'), highlight icon for 1 second. On error: show ElMessage.error('复制失败，请手动复制'). | Restrictions: Must check if Clipboard API is available, must handle HTTPS requirement, must request permission if needed | Success: Clicking copy button copies credentials to clipboard, success message shown, icon highlights briefly, fallback error message shown if copy fails_

- [ ] 28. Add tooltip for long text fields in static IP table
  - Files: `frontend/src/views/proxy/StaticManage.vue`
  - Add el-tooltip to cells with potentially long content
  - Display full content on hover
  - _Leverage: Element Plus ElTooltip_
  - _Requirements: 7_
  - _Prompt: Role: Frontend Developer with UX design awareness | Task: Add tooltips to StaticManage.vue table per requirement 7. Wrap long text fields (IP:Port:User:Pass, remark) with el-tooltip. Set :content to full field value. Apply text-overflow: ellipsis; overflow: hidden; to cell content. User can hover to see full text. | Restrictions: Tooltips should only appear if text is actually truncated, must not affect table layout, must use consistent styling | Success: Long text is truncated with ellipsis, hovering shows full text in tooltip, tooltip disappears when not hovering, works for all relevant columns_

- [ ] 29. Implement TXT export for static IPs
  - Files: `frontend/src/views/proxy/StaticManage.vue`, `frontend/src/utils/export.ts`
  - Add exportIPsAsTXT() function
  - Generate TXT with header line "IP:端口:账户:密码"
  - Each line: ip:port:username:password
  - _Leverage: Existing export utility pattern_
  - _Requirements: 7_
  - _Prompt: Role: Frontend Developer with file generation expertise | Task: Add TXT export function to export.ts per requirement 7. Implement exportIPsAsTXT(ips: StaticProxy[], username: string) that creates text content: first line "IP:端口:账户:密码\n", then each IP as "ip:port:username:password\n". Create Blob with type 'text/plain;charset=utf-8'. Generate download with filename `static-ips-{username}-{timestamp}.txt`. In StaticManage.vue, add "导出TXT" button that calls this function with current user's IPs. | Restrictions: Must use LF (\n) line endings (Unix format), must handle special characters in passwords, filename must be valid on all OSes | Success: Clicking export downloads TXT file, file format matches requirement exactly (header + data lines), file opens correctly in text editors, filename is descriptive_

- [ ] 30. Add "Export TXT" button to static IP management page
  - Files: `frontend/src/views/proxy/StaticManage.vue`
  - Add button next to other action buttons
  - Wire to exportIPsAsTXT() function
  - Show loading state during export generation
  - _Leverage: Element Plus ElButton_
  - _Requirements: 7_
  - _Prompt: Role: Frontend Developer with Vue 3 expertise | Task: Add "导出TXT" button to StaticManage.vue per requirement 7. Place button in action bar next to refresh/filter buttons. On click, show loading indicator, call exportIPsAsTXT with current filtered IP list and current user's username. Handle export completion/error. | Restrictions: Button should be disabled if no IPs to export, must show loading state, must handle errors with toast message | Success: Button appears in action bar, clicking exports current IP list as TXT, loading state shown, works with filtered results, disabled when appropriate_

## Post-Implementation Tasks

- [ ] 31. Test all endpoints with Chrome DevTools
  - Verify API responses in Network tab
  - Check for console errors
  - Test responsive design on different screen sizes
  - _Requirements: All_
  - _Prompt: Role: QA Engineer with browser testing expertise | Task: Comprehensive testing using Chrome DevTools per user's development habits. Open DevTools Network tab and test all new/modified endpoints. Check Console for JavaScript errors. Test responsive design (mobile/tablet/desktop). Verify clipboard operations in Application tab. Test with different user roles (admin/user). | Restrictions: Must test on multiple browsers (Chrome, Firefox, Safari), must test edge cases (empty data, large datasets, network errors) | Success: All APIs return correct data, no console errors, responsive design works, all features functional across browsers_

- [ ] 32. Run database migrations in production
  - Execute migrations in correct order
  - Verify data integrity after migrations
  - _Requirements: 1, 2, 5, 6_
  - _Prompt: Role: DevOps Engineer with production deployment expertise | Task: Deploy database migrations to production. Run migrations in order: MergeGiftBalanceToBalance, CreateSettingsTable, CreateSettlementsTable, EnhanceDynamicChannelsTable, CreateDynamicProxyExtractionsTable. Verify each migration succeeds before proceeding. Check data integrity with SELECT queries. | Restrictions: Must backup database before migrations, must be reversible, must not cause downtime | Success: All migrations run successfully, no data loss, application works with new schema, rollback plan tested_

- [ ] 33. Update API documentation
  - Document all new endpoints
  - Update affected endpoint documentation
  - _Requirements: All_
  - _Prompt: Role: Technical Writer with API documentation expertise | Task: Update API documentation for all new/modified endpoints. Document request/response formats, authentication requirements, error codes. Include example requests using curl/Postman. Update affected existing endpoint docs (balance operations, user endpoints). | Restrictions: Must follow existing documentation format, must include all edge cases and error scenarios | Success: All new endpoints documented, examples work correctly, documentation is clear and comprehensive_



