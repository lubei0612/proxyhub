# Tasks Document

## Overview

This tasks document breaks down the implementation of three major features:
1. Business Scenario Selector Integration (StaticBuy.vue)
2. User-Level Price Override Management (UserPriceOverrideModal.vue + Users.vue)
3. Mobile Responsive Improvements (7 pages)

Each task includes file locations, leveraged components, and success criteria.

---

## Phase 1: Backend API & Database

### Task 1.1: Add user_id column to price_override table
- [ ] 1.1 Add user_id column to price_override table
  - File: `backend/src/migrations/[timestamp]-AddUserIdToPriceOverride.ts`
  - Create TypeORM migration to add `user_id` column (nullable) to `price_override` table
  - Add index on `user_id` for query performance
  - Purpose: Enable user-specific price overrides alongside global overrides
  - _Leverage: Existing migration patterns in `backend/src/migrations/`_
  - _Requirements: Requirement 2 (User-Level Price Override Management)_
  - _Prompt: Role: Database Administrator with TypeORM expertise | Task: Create TypeORM migration to add nullable user_id column to price_override table with index following requirement 2, using existing migration patterns | Restrictions: Must not break existing data, ensure backward compatibility, use TypeORM query builder | Success: Migration runs successfully up and down, user_id column added with index, no data loss_

### Task 1.2: Add business list endpoint to Proxy985Controller
- [ ] 1.2 Add business list endpoint to Proxy985Controller
  - File: `backend/src/modules/proxy985/proxy985.controller.ts`
  - Add `GET /api/v1/proxy985/business-list` endpoint
  - Call `Proxy985Service.getBusinessList()` (already implemented)
  - Add JWT auth guard
  - Purpose: Expose 985Proxy business scenarios to frontend
  - _Leverage: `proxy985.service.ts` already has `getBusinessList()` method (line 275)_
  - _Requirements: Requirement 1 (Business Scenario Selector Integration)_
  - _Prompt: Role: Backend Developer with NestJS expertise | Task: Add GET /business-list endpoint to Proxy985Controller following requirement 1, calling existing getBusinessList() method from Proxy985Service with JWT authentication | Restrictions: Must use existing service method, add proper guards, follow controller patterns | Success: Endpoint returns business scenarios correctly, authenticated users can access, returns proper error for unauthorized requests_

### Task 1.3: Verify getUserIpPool endpoint includes user-specific overrides
- [ ] 1.3 Verify getUserIpPool endpoint includes user-specific overrides
  - File: `backend/src/modules/pricing/pricing.service.ts`
  - Review `getUserIpPoolForPriceOverride(userId)` method
  - Ensure it queries `price_override` table with `WHERE user_id = :userId OR user_id IS NULL`
  - Priority logic: user-specific override > global override > base price
  - Purpose: Ensure user IP pool API returns correct prices
  - _Leverage: Existing `getUserIpPoolForPriceOverride()` method, may only need query adjustment_
  - _Requirements: Requirement 2 (User-Level Price Override Management)_
  - _Prompt: Role: Backend Developer with TypeORM and pricing logic expertise | Task: Review and enhance getUserIpPoolForPriceOverride method in PricingService to query both user-specific and global price overrides following requirement 2, implementing priority logic | Restrictions: Must maintain existing API contract, ensure correct price priority, optimize query performance | Success: Method returns IP pool with correct pricing priority, user-specific prices override global prices, API response format unchanged_

### Task 1.4: Verify batchUpdateUserPriceOverrides method
- [ ] 1.4 Verify batchUpdateUserPriceOverrides method
  - File: `backend/src/modules/pricing/pricing.service.ts`
  - Review `batchUpdateUserPriceOverrides(userId, updates)` method
  - Ensure upserts include `userId` in WHERE clause and INSERT data
  - Add transaction handling for atomic batch updates
  - Purpose: Ensure batch updates correctly save user-specific overrides
  - _Leverage: Existing `batchUpdateUserPriceOverrides()` method (controller already exists)_
  - _Requirements: Requirement 2 (User-Level Price Override Management)_
  - _Prompt: Role: Backend Developer with database transaction expertise | Task: Review and enhance batchUpdateUserPriceOverrides method to correctly handle user-specific price overrides with transaction safety following requirement 2 | Restrictions: Must maintain atomic operations, ensure userId is properly filtered, handle concurrent updates | Success: Method saves user-specific overrides correctly, transactions rollback on error, no race conditions in concurrent updates_

---

## Phase 2: Frontend - Business Scenario Selector

### Task 2.1: Add business scenario state to StaticBuy.vue
- [ ] 2.1 Add business scenario state to StaticBuy.vue
  - File: `frontend/src/views/proxy/StaticBuy.vue`
  - Add reactive state: `selectedScenario = ref('')`, `businessScenarios = ref([])`
  - Create `loadBusinessScenarios()` function to call API
  - Call `loadBusinessScenarios()` in `onMounted` hook
  - Purpose: Prepare state management for business scenario selector
  - _Leverage: Existing Vue 3 Composition API patterns in StaticBuy.vue_
  - _Requirements: Requirement 1.1 (Business Scenario Selector)_
  - _Prompt: Role: Frontend Developer with Vue 3 Composition API expertise | Task: Add business scenario state management to StaticBuy.vue following requirement 1.1, creating reactive state and API loading function using existing patterns | Restrictions: Must use Composition API, handle loading and error states, maintain existing functionality | Success: State properly initialized, scenarios load on component mount, error handling in place, no existing features broken_

### Task 2.2: Add business scenario el-select component
- [ ] 2.2 Add business scenario el-select component
  - File: `frontend/src/views/proxy/StaticBuy.vue` (template section)
  - Add `<el-select>` above IP selection grid
  - Bind to `selectedScenario` with `v-model`
  - Add "全部场景" (All Scenarios) option with empty value
  - Add scenario change handler: `@change="handleScenarioChange"`
  - Purpose: Provide UI for users to select business scenarios
  - _Leverage: Existing Element Plus select components in the codebase_
  - _Requirements: Requirement 1.1 (Business Scenario Selector)_
  - _Prompt: Role: Frontend Developer with Element Plus expertise | Task: Add business scenario selector UI to StaticBuy.vue following requirement 1.1, using Element Plus select component with proper bindings and change handlers | Restrictions: Must follow existing UI patterns, ensure mobile-friendly sizing, maintain consistent styling | Success: Selector displays correctly, scenarios populate from state, change event triggers properly, "All Scenarios" option works_

### Task 2.3: Implement scenario filtering in loadInventory
- [ ] 2.3 Implement scenario filtering in loadInventory
  - File: `frontend/src/views/proxy/StaticBuy.vue` (script section)
  - Modify `loadInventory()` function to pass `purpose_web` parameter when `selectedScenario` is set
  - Call `proxy985.getInventory({ static_proxy_type, purpose_web: selectedScenario.value })`
  - Update inventory display after filtering
  - Purpose: Filter IP inventory based on selected business scenario
  - _Leverage: Existing `loadInventory()` function and `proxy985.getInventory()` API call_
  - _Requirements: Requirement 1.2 (Inventory filtering by scenario)_
  - _Prompt: Role: Frontend Developer with API integration expertise | Task: Enhance loadInventory function to pass purpose_web parameter for scenario filtering following requirement 1.2, modifying existing API call | Restrictions: Must maintain existing functionality when no scenario selected, handle API errors gracefully, update UI properly | Success: Inventory filtered correctly when scenario selected, all scenarios option shows full inventory, API errors handled with user-friendly messages_

### Task 2.4: Add loading state and error handling
- [ ] 2.4 Add loading state and error handling
  - File: `frontend/src/views/proxy/StaticBuy.vue`
  - Add loading state for business scenario fetch
  - Add error handling with `ElMessage.error()` for API failures
  - Disable selector during loading
  - Purpose: Provide user feedback during API operations
  - _Leverage: Existing loading patterns with `v-loading` directive_
  - _Requirements: Non-Functional Requirement (Error Handling)_
  - _Prompt: Role: Frontend Developer with UX focus | Task: Implement loading states and error handling for business scenario selector following non-functional requirements, using existing loading patterns | Restrictions: Must use Element Plus loading directive, provide clear error messages, do not block user from continuing | Success: Loading indicator displays during API calls, error messages are clear and actionable, selector disabled during loading_

---

## Phase 3: Frontend - User Price Override Modal

### Task 3.1: Create UserPriceOverrideModal.vue component file
- [ ] 3.1 Create UserPriceOverrideModal.vue component file
  - File: `frontend/src/components/UserPriceOverrideModal.vue` (new file)
  - Create basic component structure with `<template>`, `<script setup>`, `<style scoped>`
  - Define props: `userId`, `userName`, `visible`
  - Define emits: `update:visible`, `saved`
  - Purpose: Create reusable modal component for user price overrides
  - _Leverage: Modal patterns from existing components_
  - _Requirements: Requirement 2 (User-Level Price Override Management)_
  - _Prompt: Role: Vue.js Component Developer | Task: Create new UserPriceOverrideModal.vue component with proper structure following requirement 2, defining props and emits for modal behavior | Restrictions: Must use Vue 3 Composition API with script setup, follow existing component patterns, ensure proper TypeScript types | Success: Component file created with correct structure, props and emits properly defined, TypeScript types correct_

### Task 3.2: Implement el-dialog wrapper and header
- [ ] 3.2 Implement el-dialog wrapper and header
  - File: `frontend/src/components/UserPriceOverrideModal.vue` (template)
  - Add `<el-dialog>` with `v-model="visible"`, `@close` handler
  - Add dialog title: "价格覆盖 - {userName}"
  - Set dialog width: `90%` (mobile-friendly)
  - Add footer with "取消" and "保存" buttons
  - Purpose: Create modal dialog wrapper with proper controls
  - _Leverage: Element Plus dialog component, similar to patterns in existing modals_
  - _Requirements: Requirement 2.2 (Modal dialog display)_
  - _Prompt: Role: Frontend Developer with Element Plus expertise | Task: Implement dialog wrapper and header for UserPriceOverrideModal following requirement 2.2, using Element Plus dialog component | Restrictions: Must handle close events properly, ensure responsive width, follow existing modal patterns | Success: Dialog opens and closes correctly, header displays username, buttons trigger proper actions, responsive on mobile_

### Task 3.3: Copy IP card grid layout from PriceOverrides.vue
- [ ] 3.3 Copy IP card grid layout from PriceOverrides.vue
  - File: `frontend/src/components/UserPriceOverrideModal.vue` (template + style)
  - Copy `.ip-cards-grid` structure from `PriceOverrides.vue` (lines 96-170)
  - Copy card styles (`.ip-card`, `.card-header-section`, `.price-section`)
  - Adapt for modal context (smaller padding, mobile optimization)
  - Purpose: Reuse proven card-based IP display pattern
  - _Leverage: `frontend/src/views/admin/PriceOverrides.vue` lines 96-170 and styles_
  - _Requirements: Requirement 2.3 (Display IP pool as cards)_
  - _Prompt: Role: Frontend Developer with CSS expertise | Task: Copy and adapt IP card grid layout from PriceOverrides.vue to UserPriceOverrideModal following requirement 2.3, maintaining visual consistency | Restrictions: Must adapt styles for modal context, ensure mobile responsiveness, maintain flag images and card structure | Success: Cards display correctly in modal, layout matches PriceOverrides design, responsive on mobile devices_

### Task 3.4: Implement loadUserIpPool function
- [ ] 3.4 Implement loadUserIpPool function
  - File: `frontend/src/components/UserPriceOverrideModal.vue` (script)
  - Create `loadUserIpPool()` async function
  - Call `admin.getUserIpPool(props.userId)` API
  - Store response in `ipPoolData` reactive array
  - Add loading state and error handling
  - Purpose: Fetch user-specific IP pool with pricing data
  - _Leverage: `frontend/src/api/modules/admin.ts` (API call already exists)_
  - _Requirements: Requirement 2.3 (Load user IP pool)_
  - _Prompt: Role: Frontend Developer with API integration expertise | Task: Implement loadUserIpPool function to fetch user-specific price data following requirement 2.3, using existing admin API module | Restrictions: Must handle loading states, catch and display errors, call API only when modal opens | Success: IP pool data loads correctly when modal opens, loading state displayed, errors handled gracefully with user-friendly messages_

### Task 3.5: Implement price change tracking
- [ ] 3.5 Implement price change tracking
  - File: `frontend/src/components/UserPriceOverrideModal.vue` (script)
  - Create `changes` reactive Map to track modifications: `Map<string, number | null>`
  - Implement `handlePriceChange(item, newPrice)` function to update `changes`
  - Implement `hasChange(item)` computed function to check if item has unsaved changes
  - Create `hasChanges` computed property: `changes.size > 0`
  - Purpose: Track user modifications before saving
  - _Leverage: Same pattern as `PriceOverrides.vue` uses for tracking changes_
  - _Requirements: Requirement 2.4 (Track price modifications)_
  - _Prompt: Role: Frontend Developer with state management expertise | Task: Implement price change tracking system following requirement 2.4, using reactive Map and computed properties like PriceOverrides.vue pattern | Restrictions: Must track changes without modifying original data, enable save button only when changes exist, maintain change state until saved or discarded | Success: Changes tracked correctly in Map, UI reflects modified items visually, save button enabled only when changes present_

### Task 3.6: Implement filters (IP type, continent, status, search)
- [ ] 3.6 Implement filters (IP type, continent, status, search)
  - File: `frontend/src/components/UserPriceOverrideModal.vue`
  - Copy filter structure from `PriceOverrides.vue` (lines 46-89)
  - Implement `filteredIpPool` computed property with filter logic
  - Add filter state: `ipType`, `continent`, `status`, `search`
  - Purpose: Allow admin to quickly find specific IP regions
  - _Leverage: Filter implementation from `PriceOverrides.vue` lines 46-89_
  - _Requirements: Non-Functional Requirement (Usability)_
  - _Prompt: Role: Frontend Developer with filtering logic expertise | Task: Implement IP pool filtering system following PriceOverrides.vue pattern, creating filter UI and computed filtered list | Restrictions: Must match existing filter patterns, ensure performant filtering for large lists, maintain filter state on re-render | Success: All filters work correctly (IP type, continent, status, search), filtering is instant and performant, UI updates smoothly_

### Task 3.7: Implement saveChanges function
- [ ] 3.7 Implement saveChanges function
  - File: `frontend/src/components/UserPriceOverrideModal.vue` (script)
  - Create `saveChanges()` async function
  - Convert `changes` Map to updates array: `[{ country, city, ipType, overridePrice }]`
  - Call `admin.updateUserPriceOverrides(props.userId, { updates })`
  - Emit `@saved` event on success, show success message
  - Handle errors with error message, keep modal open
  - Purpose: Save user-specific price overrides to backend
  - _Leverage: `admin.updateUserPriceOverrides()` API call (already exists in backend)_
  - _Requirements: Requirement 2.5 (Save price overrides)_
  - _Prompt: Role: Frontend Developer with API integration expertise | Task: Implement saveChanges function to persist user price overrides following requirement 2.5, calling existing batch update API | Restrictions: Must validate changes before sending, handle API errors gracefully, clear changes map on success | Success: Changes save correctly to backend, success/error messages displayed, modal closes on success, errors keep modal open for retry_

---

## Phase 4: Frontend - Users.vue Integration

### Task 4.1: Import UserPriceOverrideModal component
- [ ] 4.1 Import UserPriceOverrideModal component
  - File: `frontend/src/views/admin/Users.vue` (script)
  - Import `UserPriceOverrideModal` component
  - Add component state: `priceOverrideModalVisible`, `selectedUserId`, `selectedUserName`
  - Purpose: Prepare Users.vue to use the price override modal
  - _Leverage: Newly created `UserPriceOverrideModal.vue` component_
  - _Requirements: Requirement 2.1 (Display price override button)_
  - _Prompt: Role: Vue.js Developer | Task: Import UserPriceOverrideModal component into Users.vue and set up necessary state following requirement 2.1 | Restrictions: Must register component properly, initialize state with correct types, follow existing component import patterns | Success: Component imported correctly, state initialized, no TypeScript errors_

### Task 4.2: Add "价格覆盖" button to users table actions
- [ ] 4.2 Add "价格覆盖" button to users table actions
  - File: `frontend/src/views/admin/Users.vue` (template)
  - Add "价格覆盖" button to the actions column in users table
  - Use `<el-button>` with `Money` icon from Element Plus icons
  - Add click handler: `@click="openPriceOverrideModal(row)"`
  - Purpose: Provide UI trigger for opening price override modal
  - _Leverage: Existing action buttons in Users table (Edit, Block, etc.)_
  - _Requirements: Requirement 2.1 (Display price override button)_
  - _Prompt: Role: Frontend Developer with Element Plus table expertise | Task: Add price override button to users table actions column following requirement 2.1, using existing action button patterns | Restrictions: Must maintain table layout, ensure button sizing consistent with other actions, use proper icon | Success: Button displays in table for all users, icon correct, click event triggers properly, layout not broken_

### Task 4.3: Implement openPriceOverrideModal function
- [ ] 4.3 Implement openPriceOverrideModal function
  - File: `frontend/src/views/admin/Users.vue` (script)
  - Create `openPriceOverrideModal(user)` function
  - Set `selectedUserId` and `selectedUserName` from user object
  - Set `priceOverrideModalVisible = true`
  - Purpose: Handle modal opening with user context
  - _Leverage: Similar patterns for opening modals in Users.vue (e.g., edit modal)_
  - _Requirements: Requirement 2.2 (Open modal on button click)_
  - _Prompt: Role: Frontend Developer | Task: Implement modal opening function following requirement 2.2, passing user context to modal | Restrictions: Must extract correct user data, handle missing data gracefully, follow existing modal opening patterns | Success: Modal opens with correct user ID and name, modal loads user data correctly, no errors if user data incomplete_

### Task 4.4: Add UserPriceOverrideModal to template
- [ ] 4.4 Add UserPriceOverrideModal to template
  - File: `frontend/src/views/admin/Users.vue` (template)
  - Add `<UserPriceOverrideModal>` component at end of template
  - Bind props: `:user-id="selectedUserId"`, `:user-name="selectedUserName"`, `v-model:visible="priceOverrideModalVisible"`
  - Add `@saved` handler to refresh users table if needed
  - Purpose: Integrate modal into Users page
  - _Leverage: `UserPriceOverrideModal` component_
  - _Requirements: Requirement 2 (Complete integration)_
  - _Prompt: Role: Vue.js Developer | Task: Integrate UserPriceOverrideModal component into Users.vue template following requirement 2, binding all necessary props and events | Restrictions: Must bind all props correctly, handle saved event appropriately, maintain existing page structure | Success: Modal renders correctly, props passed properly, saved event triggers table refresh (if needed), no layout issues_

---

## Phase 5: Mobile Responsive Styles

### Task 5.1: Apply responsive styles to Dashboard.vue
- [ ] 5.1 Apply responsive styles to Dashboard.vue
  - File: `frontend/src/views/dashboard/Index.vue` (style section)
  - Add `@mixin mobile { @media (max-width: 768px) { @content; } }`
  - Apply to `.statistics-cards`: single column layout on mobile
  - Apply to `.chart-wrapper`: ensure charts resize correctly
  - Reduce padding/margins for mobile
  - Purpose: Make dashboard mobile-friendly
  - _Leverage: Existing responsive patterns in codebase_
  - _Requirements: Requirement 3 (Mobile Responsive Improvements)_
  - _Prompt: Role: Frontend Developer with responsive design expertise | Task: Apply mobile responsive styles to Dashboard.vue following requirement 3, using media queries and responsive layout patterns | Restrictions: Must not break desktop layout, ensure charts remain readable, maintain visual hierarchy | Success: Dashboard displays correctly on mobile (tested at 375px width), statistics cards stack vertically, charts resize smoothly, all content accessible_

### Task 5.2: Apply responsive styles to StaticBuy.vue
- [ ] 5.2 Apply responsive styles to StaticBuy.vue
  - File: `frontend/src/views/proxy/StaticBuy.vue` (style section)
  - Stack form elements vertically on mobile
  - Make IP selection cards single-column
  - Enlarge touch targets to 44x44px minimum
  - Make action buttons full-width on mobile
  - Purpose: Optimize proxy purchase flow for mobile users
  - _Leverage: Mobile mixin pattern_
  - _Requirements: Requirement 3.2 (Mobile form optimization)_
  - _Prompt: Role: Frontend Developer with mobile UX expertise | Task: Apply responsive styles to StaticBuy.vue following requirement 3.2, optimizing form layout and touch targets for mobile | Restrictions: Must maintain form functionality, ensure all inputs accessible, test on real mobile devices | Success: Form elements stack correctly on mobile, touch targets adequate for mobile use, purchase flow works smoothly on touchscreens_

### Task 5.3: Apply responsive styles to StaticManage.vue
- [ ] 5.3 Apply responsive styles to StaticManage.vue
  - File: `frontend/src/views/proxy/StaticManage.vue` (style section)
  - Make table horizontally scrollable on mobile: `overflow-x: auto`
  - Hide non-essential columns with `.hidden-mobile` class
  - Transform filter section to vertical stack
  - Purpose: Make proxy management table usable on mobile
  - _Leverage: Table responsive patterns_
  - _Requirements: Requirement 3.2 (Mobile table optimization)_
  - _Prompt: Role: Frontend Developer with table responsive design expertise | Task: Apply responsive styles to StaticManage.vue table following requirement 3.2, making table scrollable and hiding non-critical columns | Restrictions: Must keep essential columns visible, ensure horizontal scroll smooth, maintain row actions accessible | Success: Table scrolls horizontally on mobile, essential data visible, row actions work correctly, no layout overflow_

### Task 5.4: Apply responsive styles to Users.vue (Admin)
- [ ] 5.4 Apply responsive styles to Users.vue (Admin)
  - File: `frontend/src/views/admin/Users.vue` (style section)
  - Apply same table responsive patterns as StaticManage.vue
  - Stack filter section vertically on mobile
  - Ensure action buttons remain accessible
  - Purpose: Make user management accessible on mobile
  - _Leverage: Table responsive patterns from StaticManage.vue_
  - _Requirements: Requirement 3.5 (Admin page mobile optimization)_
  - _Prompt: Role: Frontend Developer | Task: Apply responsive styles to Users.vue admin page following requirement 3.5, using table patterns from StaticManage.vue | Restrictions: Must maintain admin functionality, ensure all actions accessible on mobile, test table scroll | Success: User table usable on mobile, filters work correctly, all admin actions (edit, block, price override) accessible_

### Task 5.5: Apply responsive styles to RechargeApproval.vue (Admin)
- [ ] 5.5 Apply responsive styles to RechargeApproval.vue (Admin)
  - File: `frontend/src/views/admin/RechargeApproval.vue` (style section)
  - Make recharge table horizontally scrollable
  - Stack approval actions vertically on mobile
  - Optimize filter section for mobile
  - Purpose: Allow admins to approve recharges on mobile
  - _Leverage: Table responsive patterns_
  - _Requirements: Requirement 3.5 (Admin page mobile optimization)_
  - _Prompt: Role: Frontend Developer | Task: Apply responsive styles to RechargeApproval.vue following requirement 3.5, optimizing table and approval actions for mobile | Restrictions: Must maintain approval workflow, ensure image preview works on mobile, test touch interactions | Success: Recharge table displays correctly, admins can approve/reject on mobile, receipt images viewable on mobile_

### Task 5.6: Apply responsive styles to PriceOverrides.vue (Admin)
- [ ] 5.6 Apply responsive styles to PriceOverrides.vue (Admin)
  - File: `frontend/src/views/admin/PriceOverrides.vue` (style section)
  - Transform card grid to single column on mobile: `grid-template-columns: 1fr`
  - Stack filter section vertically
  - Ensure input-number controls are touch-friendly
  - Purpose: Allow admins to manage price overrides on mobile
  - _Leverage: Card grid responsive patterns_
  - _Requirements: Requirement 3.5 (Admin page mobile optimization)_
  - _Prompt: Role: Frontend Developer with responsive grid expertise | Task: Apply responsive styles to PriceOverrides.vue card grid following requirement 3.5, transforming multi-column to single-column on mobile | Restrictions: Must maintain card styling, ensure touch-friendly inputs, test number input on mobile keyboards | Success: Cards display single-column on mobile, filters work correctly, price inputs easy to use on touchscreen_

### Task 5.7: Apply responsive styles to Orders.vue (Admin)
- [ ] 5.7 Apply responsive styles to Orders.vue (Admin)
  - File: `frontend/src/views/admin/Orders.vue` (style section)
  - Make orders table horizontally scrollable
  - Hide non-critical columns on mobile (`.hidden-mobile`)
  - Stack date filters vertically
  - Purpose: Allow admins to view orders on mobile
  - _Leverage: Table responsive patterns_
  - _Requirements: Requirement 3.5 (Admin page mobile optimization)_
  - _Prompt: Role: Frontend Developer | Task: Apply responsive styles to Orders.vue table following requirement 3.5, using consistent table responsive patterns | Restrictions: Must show order ID and status on mobile, hide less critical data, test horizontal scroll | Success: Orders table usable on mobile, key information visible, table scrolls smoothly, filters work correctly_

---

## Phase 6: Testing & Bug Fixes

### Task 6.1: Manual testing of business scenario selector
- [ ] 6.1 Manual testing of business scenario selector
  - Test: Navigate to Static Proxy Purchase page
  - Test: Select different business scenarios (TikTok, Instagram, etc.)
  - Test: Verify inventory filters correctly
  - Test: Verify "All Scenarios" resets filter
  - Test: Verify purchase completes with scenario tag
  - Purpose: Validate business scenario feature works end-to-end
  - _Requirements: Requirement 1 (Business Scenario Selector)_
  - _Prompt: Role: QA Tester | Task: Perform comprehensive manual testing of business scenario selector following requirement 1 test scenarios | Restrictions: Must test all scenarios, verify API responses, check error handling | Success: All scenarios filter correctly, purchase flow completes successfully, no console errors, API calls correct_

### Task 6.2: Manual testing of user price override modal
- [ ] 6.2 Manual testing of user price override modal
  - Test: Open Users page as admin
  - Test: Click "价格覆盖" button for a user
  - Test: Modal opens with user's current prices
  - Test: Modify prices for multiple regions
  - Test: Save changes successfully
  - Test: User sees custom pricing when logged in
  - Purpose: Validate user price override feature works end-to-end
  - _Requirements: Requirement 2 (User-Level Price Override)_
  - _Prompt: Role: QA Tester | Task: Perform comprehensive manual testing of user price override modal following requirement 2 test scenarios | Restrictions: Must test save/cancel flows, verify database persistence, test multiple users | Success: Modal opens correctly, prices save successfully, user sees custom pricing, admin can clear overrides_

### Task 6.3: Mobile device testing (iOS)
- [ ] 6.3 Mobile device testing (iOS)
  - Test: Access platform on iPhone Safari (real device or simulator)
  - Test: Navigate through all pages (Dashboard, StaticBuy, StaticManage, Users, etc.)
  - Test: Verify touch interactions work correctly
  - Test: Check for layout issues or overflow
  - Test: Test form inputs with iOS keyboard
  - Purpose: Ensure iOS compatibility and usability
  - _Requirements: Requirement 3 (Mobile Responsive)_
  - _Prompt: Role: Mobile QA Tester with iOS expertise | Task: Perform comprehensive mobile testing on iOS Safari following requirement 3 mobile test scenarios | Restrictions: Must test on real device if possible, check all touch interactions, verify keyboard behavior | Success: All pages display correctly on iOS, no layout issues, touch interactions smooth, forms submit correctly_

### Task 6.4: Mobile device testing (Android)
- [ ] 6.4 Mobile device testing (Android)
  - Test: Access platform on Android Chrome (real device or emulator)
  - Test: Navigate through all pages
  - Test: Verify responsive layouts
  - Test: Test forms with Android keyboard
  - Purpose: Ensure Android compatibility
  - _Requirements: Requirement 3 (Mobile Responsive)_
  - _Prompt: Role: Mobile QA Tester with Android expertise | Task: Perform comprehensive mobile testing on Android Chrome following requirement 3 mobile test scenarios | Restrictions: Must test on real device if possible, verify keyboard and input behavior, check performance | Success: All pages work on Android, responsive layouts correct, no performance issues, forms work correctly_

### Task 6.5: Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] 6.5 Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Test: Open platform in Chrome, Firefox, Safari, Edge
  - Test: Verify all three features work in each browser
  - Test: Check for CSS rendering differences
  - Test: Verify API calls work correctly
  - Purpose: Ensure cross-browser compatibility
  - _Requirements: All Requirements_
  - _Prompt: Role: QA Tester with cross-browser testing expertise | Task: Perform cross-browser compatibility testing covering all features across Chrome, Firefox, Safari, and Edge | Restrictions: Must test desktop versions, check for CSS bugs, verify JavaScript compatibility | Success: All features work in all browsers, no visual regressions, API calls successful, no console errors_

### Task 6.6: Bug fixes and polish
- [ ] 6.6 Bug fixes and polish
  - Fix any bugs discovered during testing
  - Polish UI/UX based on feedback
  - Optimize performance if needed
  - Address any accessibility issues
  - Purpose: Ensure production-ready quality
  - _Requirements: All Requirements_
  - _Prompt: Role: Senior Developer | Task: Review and fix all bugs discovered during testing, polish UI/UX, and optimize performance to meet production quality standards | Restrictions: Must not introduce new bugs, maintain code quality, test all fixes thoroughly | Success: All bugs fixed and verified, UI polished, performance acceptable, no accessibility issues_

---

## Phase 7: Documentation & Deployment

### Task 7.1: Update API documentation
- [ ] 7.1 Update API documentation
  - Document: `GET /api/v1/proxy985/business-list` endpoint
  - Document: User price override workflow
  - Update Postman collection or OpenAPI spec
  - Purpose: Keep API documentation current
  - _Requirements: All Backend Requirements_
  - _Prompt: Role: Technical Writer with API documentation expertise | Task: Document new API endpoints and workflows, updating OpenAPI spec or Postman collection | Restrictions: Must document request/response formats, include examples, maintain documentation standards | Success: API documentation complete and accurate, examples provided, easy to understand for developers_

### Task 7.2: Update user guide for admins
- [ ] 7.2 Update user guide for admins
  - Document: How to set user-specific price overrides
  - Add screenshots of modal interface
  - Explain pricing priority logic
  - Purpose: Help admins use new feature
  - _Requirements: Requirement 2 (User-Level Price Override)_
  - _Prompt: Role: Technical Writer | Task: Create user guide documentation for admin user price override feature with screenshots and step-by-step instructions | Restrictions: Must be clear for non-technical users, include visual aids, explain all options | Success: Admin guide complete with screenshots, step-by-step instructions clear, pricing logic explained_

### Task 7.3: Create deployment checklist
- [ ] 7.3 Create deployment checklist
  - Checklist: Run database migration
  - Checklist: Update environment variables if needed
  - Checklist: Build frontend with `npm run build`
  - Checklist: Restart backend service
  - Checklist: Clear CDN cache
  - Checklist: Smoke test in production
  - Purpose: Ensure smooth deployment
  - _Requirements: All Requirements_
  - _Prompt: Role: DevOps Engineer | Task: Create comprehensive deployment checklist covering database migration, environment setup, build, and deployment verification | Restrictions: Must include rollback steps, verify all dependencies, test critical paths post-deployment | Success: Checklist complete and tested, deployment succeeds without issues, all features work in production_

### Task 7.4: Deploy to staging environment
- [ ] 7.4 Deploy to staging environment
  - Run database migration on staging DB
  - Deploy backend and frontend code
  - Verify all features work in staging
  - Perform UAT (User Acceptance Testing)
  - Purpose: Validate deployment before production
  - _Requirements: All Requirements_
  - _Prompt: Role: DevOps Engineer with deployment automation expertise | Task: Deploy all changes to staging environment and perform comprehensive validation before production deployment | Restrictions: Must follow deployment checklist, verify database migration, test all features thoroughly | Success: Staging deployment successful, all features work correctly, UAT completed, no blocking issues found_

### Task 7.5: Deploy to production
- [ ] 7.5 Deploy to production
  - Schedule deployment window (communicate to users if needed)
  - Run production database migration
  - Deploy backend and frontend to production
  - Monitor for errors in first 24 hours
  - Purpose: Release features to production users
  - _Requirements: All Requirements_
  - _Prompt: Role: DevOps Engineer | Task: Execute production deployment following staging success, with proper monitoring and rollback plan ready | Restrictions: Must have rollback plan ready, monitor error rates closely, communicate with team during deployment | Success: Production deployment successful, no critical errors, monitoring confirms stable operation, features available to users_

---

## Summary

**Total Tasks:** 54 tasks across 7 phases

**Estimated Time:**
- Phase 1 (Backend): 4-6 hours
- Phase 2 (Business Scenario): 3-4 hours
- Phase 3 (User Price Override Modal): 6-8 hours
- Phase 4 (Users.vue Integration): 2-3 hours
- Phase 5 (Mobile Responsive): 8-10 hours
- Phase 6 (Testing & Bug Fixes): 6-8 hours
- Phase 7 (Documentation & Deployment): 3-4 hours

**Total Estimated Time:** 32-43 hours

**Priority:**
1. **High Priority**: Phases 1-4 (Core features)
2. **Medium Priority**: Phase 5 (Mobile responsive)
3. **Low Priority but Essential**: Phases 6-7 (Testing and deployment)

**Dependencies:**
- Phase 2 depends on Phase 1 (Task 1.2 - business list endpoint)
- Phase 3 depends on Phase 1 (Task 1.3, 1.4 - user override API)
- Phase 4 depends on Phase 3 (UserPriceOverrideModal component)
- Phase 6 depends on all previous phases being complete
- Phase 7 depends on Phase 6 (testing) being complete




