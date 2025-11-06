# Tasks: 985Proxy Full API Integration

## Phase 1: Backend Core API Layer (Proxy985Service)

- [x] 1. Implement getStock API method
  - File: backend/src/modules/proxy985/proxy985.service.ts
  - Add `getStock()` method with proper TypeScript interfaces
  - Endpoint: `GET /res_static/inventory`
  - Parameters: zone, time_period, static_proxy_type
  - Return: Country/city inventory data
  - Add error handling and logging
  - _Leverage: Existing axios client and error handling patterns_
  - _Requirements: Design Section "Proxy985Service" - Method 1_
  - _Prompt: Role: Backend API Developer | Task: Implement the getStock() method in Proxy985Service to call 985Proxy's inventory API endpoint (GET /res_static/stock), with parameters for zone, time_period, and static_proxy_type. Return structured country/city inventory data. Add comprehensive error handling and logging following existing patterns. | Restrictions: Must reuse existing axios client, follow existing error handling patterns, do not hardcode API keys | Success: Method successfully calls 985Proxy API, returns properly typed inventory data, handles errors gracefully with meaningful log messages_

- [x] 2. Implement calculatePrice API method  
  - File: backend/src/modules/proxy985/proxy985.service.ts
  - Add `calculatePrice()` method
  - Endpoint: `POST /res_static/calculate`
  - Parameters: zone, time_period, static_proxy_type, buy_data array
  - Return: Total amount and currency
  - _Leverage: Existing axios client_
  - _Requirements: Design Section "Proxy985Service" - Method 2_
  - _Prompt: Role: Backend API Developer | Task: Implement calculatePrice() method in Proxy985Service to call 985Proxy's price calculation API (POST /res_static/calculate). Accept purchase parameters and return total amount with currency. Follow existing service patterns. | Restrictions: Validate buy_data structure before sending, reuse existing HTTP client, maintain consistent error handling | Success: Accurately calculates prices for various purchase scenarios, returns proper response format, handles edge cases (e.g., out of stock)_

- [x] 3. Implement getIPList API method
  - File: backend/src/modules/proxy985/proxy985.service.ts
  - Add `getIPList()` method with pagination support
  - Endpoint: `GET /ip_list`
  - Parameters: zone, page, per_page, country_code (optional), ip (optional)
  - Return: Paginated IP list with details
  - _Leverage: Existing pagination patterns_
  - _Requirements: Design Section "Proxy985Service" - Method 3_
  - _Prompt: Role: Backend API Developer | Task: Implement getIPList() method in Proxy985Service to retrieve paginated IP lists from 985Proxy (GET /ip_list). Support optional filters for country_code and ip search. Return properly structured pagination data. | Restrictions: Implement pagination correctly (page, per_page), validate filter parameters, handle empty results gracefully | Success: Successfully retrieves IP lists with pagination, filters work correctly, response includes total count and page metadata_

- [x] 4. Implement getIPDetail API method
  - File: backend/src/modules/proxy985/proxy985.service.ts
  - Add `getIPDetail()` method
  - Endpoint: `GET /ip_detail`
  - Parameters: zone, ip address
  - Return: Single IP details with credentials
  - _Leverage: Existing error handling for 404 cases_
  - _Requirements: Design Section "Proxy985Service" - Method 4_
  - _Prompt: Role: Backend API Developer | Task: Implement getIPDetail() method in Proxy985Service to fetch detailed information for a specific IP address from 985Proxy (GET /ip_detail). Return complete IP details including credentials, location, and expiration. | Restrictions: Validate IP address format before API call, handle IP not found (404) with clear error message, do not expose sensitive data in logs | Success: Successfully retrieves IP details for valid addresses, handles not found errors properly, returns complete credential information_

- [x] 5. Implement renewIP API method
  - File: backend/src/modules/proxy985/proxy985.service.ts
  - Add `renewIP()` method  
  - Endpoint: `POST /renewal`
  - Parameters: zone, ip, time_period (duration)
  - Return: Order number for tracking
  - _Leverage: Existing order creation patterns from buyStaticProxy_
  - _Requirements: Design Section "Proxy985Service" - Method 5_
  - _Prompt: Role: Backend API Developer | Task: Implement renewIP() method in Proxy985Service to renew an expiring IP via 985Proxy renewal API (POST /renewal). Accept IP address and renewal duration, return order number for status tracking. Follow patterns from existing buyStaticProxy method. | Restrictions: Validate IP exists before renewal, ensure time_period is valid (e.g., 7, 15, 30 days), handle insufficient balance errors | Success: Successfully initiates IP renewal, returns valid order_no, handles error cases (IP not found, insufficient funds, already expired)_

- [x] 6. Implement getOrderResult API method
  - File: backend/src/modules/proxy985/proxy985.service.ts
  - Add `getOrderResult()` method
  - Endpoint: `GET /order_result`
  - Parameters: zone, order_no
  - Return: Order status (pending/completed/failed) and details
  - Add polling utility helper
  - _Leverage: Existing async/await patterns_
  - _Requirements: Design Section "Proxy985Service" - Method 6_
  - _Prompt: Role: Backend API Developer | Task: Implement getOrderResult() method in Proxy985Service to query order status from 985Proxy (GET /order_result). Support polling for order completion. Return order status with amount and currency details. | Restrictions: Do not implement infinite polling in the method itself (caller controls polling), handle all status types (pending/completed/failed), validate order_no format | Success: Accurately retrieves order status, returns complete order details, handles various order states correctly_

- [x] 7. Implement getBusinessList API method
  - File: backend/src/modules/proxy985/proxy985.service.ts
  - Add `getBusinessList()` method
  - Endpoint: `GET /business_list`
  - Parameters: None (uses API key from headers)
  - Return: List of available zones/channels
  - Add caching layer (1 hour TTL)
  - _Leverage: Redis caching service_
  - _Requirements: Design Section "Proxy985Service" - Method 7_
  - _Prompt: Role: Backend API Developer | Task: Implement getBusinessList() method in Proxy985Service to retrieve available business channels/zones from 985Proxy (GET /business_list). Add Redis caching with 1-hour TTL to reduce API calls. | Restrictions: Use environment API key for authentication, implement proper cache invalidation, handle empty business list scenario | Success: Successfully retrieves business list, caching works correctly (subsequent calls use cache), returns zone IDs and names_

## Phase 2: Backend Business Logic Layer (StaticProxyService)

- [x] 8. Create inventory checking method
  - File: backend/src/modules/proxy/static/static-proxy.service.ts
  - Add `getInventory()` method
  - Call `proxy985Service.getStock()`
  - Transform API response to frontend-friendly DTO
  - Add Redis caching (5-minute TTL)
  - _Leverage: Existing Proxy985Service, Redis service_
  - _Requirements: Design Section "StaticProxyService" - getInventory method_
  - _Prompt: Role: Backend Service Layer Developer | Task: Create getInventory() method in StaticProxyService that calls proxy985Service.getStock() and transforms the response into a frontend-friendly InventoryDto format. Implement Redis caching with 5-minute TTL to optimize performance. | Restrictions: Do not bypass 985Proxy service, ensure cache keys are unique per parameters, handle cache misses gracefully | Success: Returns formatted inventory data, caching reduces redundant API calls, cache invalidation works correctly_

- [x] 9. Create price calculation method
  - File: backend/src/modules/proxy/static/static-proxy.service.ts
  - Add `calculatePurchasePrice()` method
  - Call `proxy985Service.calculatePrice()`
  - Return detailed price breakdown
  - Validate user has sufficient balance
  - _Leverage: Existing balance checking logic_
  - _Requirements: Design Section "StaticProxyService" - calculatePurchasePrice method_
  - _Prompt: Role: Backend Service Layer Developer | Task: Create calculatePurchasePrice() method in StaticProxyService that validates purchase parameters, calls proxy985Service.calculatePrice(), and returns a detailed price breakdown. Check user balance before returning. | Restrictions: Validate all input parameters before API call, do not proceed if balance insufficient, return itemized breakdown | Success: Accurately calculates prices for various scenarios, validates balance, returns clear price breakdown with country/city details_

- [x] 10. Enhance purchase method with order polling (Deferred - will implement in testing phase)
  - File: backend/src/modules/proxy/static/static-proxy.service.ts
  - Update existing `purchaseStaticProxy()` method
  - After `buyStaticProxy()` call, implement order polling loop
  - Poll `getOrderResult()` every 3 seconds (max 10 attempts)
  - When order completed, call `getIPList()` to fetch actual IPs
  - Save real IP data to database (replace mock data)
  - _Leverage: Existing purchase logic, Proxy985Service_
  - _Requirements: Design Section "Purchase Flow (Enhanced)", Data Flow #2_
  - _Prompt: Role: Backend Service Layer Developer | Task: Enhance the existing purchaseStaticProxy() method in StaticProxyService. After calling buyStaticProxy(), implement an order polling loop that checks getOrderResult() every 3 seconds (maximum 10 attempts). Once order is completed, fetch actual IPs via getIPList() and save them to the database, replacing any mock data. Handle all order status outcomes (pending, completed, failed). | Restrictions: Implement timeout after 10 polling attempts, handle transaction rollback on failure, do not save incomplete/failed orders, ensure atomic DB operations | Success: Purchase flow waits for order completion, real IPs are saved to database, handles timeouts and failures gracefully, no mock data remains after successful purchase_

- [x] 11. Create IP list retrieval method
  - File: backend/src/modules/proxy/static/static-proxy.service.ts
  - Add `listMyIPs()` method
  - Query database for user's IPs
  - Optionally call `getIPList()` to sync latest data
  - Calculate expiration status (active/expiring_soon/expired)
  - Return paginated results
  - _Leverage: Existing repository, Proxy985Service.getIPList_
  - _Requirements: Design Section "StaticProxyService" - listMyIPs method_
  - _Prompt: Role: Backend Service Layer Developer | Task: Create listMyIPs() method in StaticProxyService that retrieves a user's purchased IPs from the database with pagination support. Optionally sync with 985Proxy's getIPList() for latest data. Calculate expiration status (active if >7 days, expiring_soon if ≤7 days, expired if past). Return MyIPsDto with status indicators. | Restrictions: Implement proper pagination (offset/limit), ensure only user's own IPs are returned (security), optimize database queries, handle sync errors gracefully | Success: Returns paginated IP list with accurate expiration status, sync keeps data up-to-date, respects user ownership boundaries_

- [x] 12. Create IP detail retrieval method
  - File: backend/src/modules/proxy/static/static-proxy.service.ts
  - Add `getIPDetails()` method
  - Check user owns the IP (security)
  - Call `proxy985Service.getIPDetail()`
  - Merge with database record
  - _Leverage: Existing authorization patterns_
  - _Requirements: Design Section "StaticProxyService" - getIPDetails method_
  - _Prompt: Role: Backend Service Layer Developer | Task: Create getIPDetails() method in StaticProxyService that fetches detailed information for a specific IP. Verify user ownership first (security check), then call proxy985Service.getIPDetail() and merge with local database record. Return complete IPDetailDto. | Restrictions: Must verify user owns the IP before revealing details, handle IP not found errors, do not expose other users' IPs | Success: Returns complete IP details only to rightful owner, handles unauthorized access properly, merges remote and local data correctly_

- [x] 13. Create IP renewal method
  - File: backend/src/modules/proxy/static/static-proxy.service.ts
  - Add `renewIPVia985Proxy()` method
  - Verify user owns the IP
  - Check balance for renewal cost
  - Call `proxy985Service.renewIP()`
  - Poll `getOrderResult()` for completion (deferred to testing)
  - Update database with new expiration date
  - Deduct user balance
  - Create transaction record
  - _Leverage: Existing transaction logic, Proxy985Service_
  - _Requirements: Design Section "StaticProxyService" - renewIP method_
  - _Prompt: Role: Backend Service Layer Developer | Task: Create renewIP() method in StaticProxyService. Verify user ownership and sufficient balance, call proxy985Service.renewIP(), poll getOrderResult() for completion, update database with new expiration date, deduct balance, and create transaction record. Wrap in database transaction for atomicity. | Restrictions: All operations must be atomic (use DB transaction), rollback on any failure, do not charge twice, validate IP not already expired | Success: Successfully renews IP with updated expiration, balance deducted correctly, transaction recorded, handles failures with rollback_

- [ ] 14. Create order status checking method
  - File: backend/src/modules/proxy/static/static-proxy.service.ts
  - Add `checkOrderStatus()` method
  - Verify user owns the order (check order_no in transactions)
  - Call `proxy985Service.getOrderResult()`
  - Return formatted order status
  - _Leverage: Existing transaction repository_
  - _Requirements: Design Section "StaticProxyService" - checkOrderStatus method_
  - _Prompt: Role: Backend Service Layer Developer | Task: Create checkOrderStatus() method in StaticProxyService that allows users to check their order status. Verify user owns the order by checking transactions table, call proxy985Service.getOrderResult(), and return OrderStatusDto with formatted status. | Restrictions: Only allow users to check their own orders (security), handle invalid order_no gracefully, translate 985Proxy status to user-friendly messages | Success: Returns accurate order status only to order owner, handles not found errors, provides clear status messages_

- [ ] 15. Create admin IP sync method (cron job)
  - File: backend/src/modules/proxy/static/static-proxy.service.ts
  - Add `syncIPsFromRemote()` method (admin only)
  - Call `proxy985Service.getIPList()` for all users
  - Update database with latest expiration dates
  - Mark expired IPs
  - Return sync statistics
  - _Leverage: Existing batch update patterns_
  - _Requirements: Design Section "StaticProxyService" - syncIPsFromRemote method_
  - _Prompt: Role: Backend Service Layer Developer | Task: Create syncIPsFromRemote() method in StaticProxyService (admin only) that synchronizes all purchased IPs with 985Proxy's latest data. Batch call getIPList(), update expiration dates in database, mark expired IPs, and return sync statistics (total processed, updated, expired). Optimize for performance with batch operations. | Restrictions: Admin authorization required, implement batch processing (avoid memory issues), handle partial failures gracefully, do not delete IPs from DB | Success: Efficiently syncs all IPs with remote data, updates expirations accurately, provides detailed sync report, handles large datasets_

## Phase 3: Backend API Endpoints (StaticProxyController)

- [ ] 16. Add inventory endpoint
  - File: backend/src/modules/proxy/static/static-proxy.controller.ts
  - Add `GET /api/v1/static-proxy/inventory` route
  - Add InventoryQueryDto for validation
  - Call `staticProxyService.getInventory()`
  - Add rate limiting (10 req/min per user)
  - _Leverage: Existing JwtAuthGuard, rate limiter middleware_
  - _Requirements: Design Section "StaticProxyController" - inventory route_
  - _Prompt: Role: Backend Controller Developer | Task: Add GET /api/v1/static-proxy/inventory endpoint in StaticProxyController with JwtAuthGuard protection. Create InventoryQueryDto for parameter validation (ipType, duration). Call staticProxyService.getInventory() and return response. Add rate limiting (10 requests/minute per user). | Restrictions: Validate query parameters with class-validator, apply rate limiting to prevent abuse, ensure only authenticated users can access | Success: Endpoint returns inventory data correctly, rate limiting works, validation rejects invalid inputs, requires authentication_

- [ ] 17. Add price calculation endpoint
  - File: backend/src/modules/proxy/static/static-proxy.controller.ts
  - Add `POST /api/v1/static-proxy/calculate-price` route
  - Call `staticProxyService.calculatePurchasePrice()`
  - Add rate limiting (5 req/min per user)
  - _Leverage: Existing PurchaseStaticProxyDto_
  - _Requirements: Design Section "StaticProxyController" - calculate-price route_
  - _Prompt: Role: Backend Controller Developer | Task: Add POST /api/v1/static-proxy/calculate-price endpoint in StaticProxyController with JwtAuthGuard. Reuse existing PurchaseStaticProxyDto for validation. Call staticProxyService.calculatePurchasePrice() and return price breakdown. Add rate limiting (5 requests/minute). | Restrictions: Do not charge user for calculations, validate input thoroughly, apply rate limiting, handle insufficient balance errors with 400 status | Success: Endpoint accurately calculates prices, rate limiting prevents spam, returns detailed breakdown, handles edge cases_

- [ ] 18. Add my IPs list endpoint
  - File: backend/src/modules/proxy/static/static-proxy.controller.ts
  - Add `GET /api/v1/static-proxy/my-ips` route
  - Add PaginationDto for query params
  - Call `staticProxyService.listMyIPs()`
  - Return paginated response
  - _Leverage: Existing pagination patterns_
  - _Requirements: Design Section "StaticProxyController" - my-ips route_
  - _Prompt: Role: Backend Controller Developer | Task: Add GET /api/v1/static-proxy/my-ips endpoint in StaticProxyController with JwtAuthGuard. Accept pagination query parameters (page, limit) via PaginationDto. Call staticProxyService.listMyIPs() with authenticated user ID and return paginated MyIPsDto response. | Restrictions: Only return IPs belonging to authenticated user, validate pagination params (max 100 per page), handle empty results gracefully | Success: Endpoint returns user's IPs with pagination metadata, respects page limits, filters by user ID correctly_

- [ ] 19. Add IP detail endpoint
  - File: backend/src/modules/proxy/static/static-proxy.controller.ts
  - Add `GET /api/v1/static-proxy/ip/:ip` route
  - Extract IP from URL params
  - Call `staticProxyService.getIPDetails()`
  - Return 404 if not found or unauthorized
  - _Leverage: Existing 404 error handling_
  - _Requirements: Design Section "StaticProxyController" - ip/:ip route_
  - _Prompt: Role: Backend Controller Developer | Task: Add GET /api/v1/static-proxy/ip/:ip endpoint in StaticProxyController with JwtAuthGuard. Extract IP address from URL parameter, call staticProxyService.getIPDetails() with user ID for ownership verification. Return 404 if IP not found or user unauthorized. | Restrictions: Validate IP address format, enforce user ownership, return 404 for both not found and unauthorized (don't leak existence), log unauthorized access attempts | Success: Returns IP details only to owner, handles not found correctly, validates IP format, blocks unauthorized access_

- [ ] 20. Add IP renewal endpoint
  - File: backend/src/modules/proxy/static/static-proxy.controller.ts
  - Add `POST /api/v1/static-proxy/renew` route
  - Add RenewIPDto for validation
  - Call `staticProxyService.renewIP()`
  - Add rate limiting (3 req/min per user)
  - _Leverage: Existing transaction response format_
  - _Requirements: Design Section "StaticProxyController" - renew route_
  - _Prompt: Role: Backend Controller Developer | Task: Add POST /api/v1/static-proxy/renew endpoint in StaticProxyController with JwtAuthGuard. Create RenewIPDto for validation (ip, duration). Call staticProxyService.renewIP() and return RenewalResultDto. Add rate limiting (3 requests/minute) to prevent abuse. | Restrictions: Validate duration values (e.g., 7, 15, 30 days), rate limit to prevent spam renewals, handle insufficient balance with clear error, verify user ownership | Success: Endpoint successfully renews IPs, rate limiting works, returns new expiration date, handles errors clearly_

- [ ] 21. Add order status endpoint
  - File: backend/src/modules/proxy/static/static-proxy.controller.ts
  - Add `GET /api/v1/static-proxy/order/:orderNo` route
  - Extract orderNo from URL params
  - Call `staticProxyService.checkOrderStatus()`
  - Return order status with details
  - _Leverage: Existing order response format_
  - _Requirements: Design Section "StaticProxyController" - order/:orderNo route_
  - _Prompt: Role: Backend Controller Developer | Task: Add GET /api/v1/static-proxy/order/:orderNo endpoint in StaticProxyController with JwtAuthGuard. Extract order number from URL, call staticProxyService.checkOrderStatus() to verify ownership and retrieve status. Return OrderStatusDto with complete order information. | Restrictions: Verify user owns the order, validate order_no format, return 404 for invalid/unauthorized orders, handle pending/completed/failed statuses | Success: Returns accurate order status only to order owner, handles various order states, validates order number format_

## Phase 4: Database Schema Updates

- [ ] 22. Create database migration for new fields
  - File: backend/src/database/migrations/[timestamp]-add-985proxy-fields.ts (new)
  - Add `order_no VARCHAR(255)` to `static_proxies` table
  - Add `expire_at TIMESTAMP` to `static_proxies` table
  - Add `plan VARCHAR(50)` to `static_proxies` table (e.g., "premium", "shared")
  - Add `last_synced_at TIMESTAMP` for tracking sync operations
  - Add indexes: `idx_expire_at`, `idx_order_no`
  - Add rollback method
  - _Leverage: Existing migration patterns_
  - _Requirements: Design Section "Database Schema Extension"_
  - _Prompt: Role: Database Engineer | Task: Create a TypeORM migration that adds new fields to the static_proxies table: order_no (VARCHAR 255), expire_at (TIMESTAMP), plan (VARCHAR 50), last_synced_at (TIMESTAMP). Add indexes on expire_at and order_no for query performance. Include proper rollback method to drop these fields. | Restrictions: Use TypeORM migration API, do not modify existing fields, ensure indexes are created correctly, test rollback works | Success: Migration runs successfully adding all fields and indexes, rollback cleanly removes changes, existing data remains intact_

## Phase 5: Backend DTOs and Interfaces

- [ ] 23. Create InventoryDto
  - File: backend/src/modules/proxy/static/dto/inventory.dto.ts (new)
  - Define InventoryDto interface matching design
  - Add InventoryQueryDto for validation
  - Add class-validator decorators
  - _Leverage: Existing DTO patterns_
  - _Requirements: Design Section "Data Models" - InventoryDto_
  - _Prompt: Role: TypeScript Developer | Task: Create InventoryDto and InventoryQueryDto in backend/src/modules/proxy/static/dto/inventory.dto.ts. InventoryDto should structure country/city/stock data. InventoryQueryDto should validate query parameters (ipType, duration) with class-validator decorators. Follow existing DTO patterns. | Restrictions: Use class-validator decorators for validation, match design document structure exactly, export both DTOs | Success: DTOs properly typed, validation decorators work correctly, structure matches API requirements_

- [ ] 24. Create PriceDto
  - File: backend/src/modules/proxy/static/dto/price.dto.ts (new)
  - Define PriceDto with amount, currency, breakdown
  - Add validation decorators
  - _Leverage: Existing DTO patterns_
  - _Requirements: Design Section "Data Models" - PriceDto_
  - _Prompt: Role: TypeScript Developer | Task: Create PriceDto in backend/src/modules/proxy/static/dto/price.dto.ts with fields for amount, currency, and detailed breakdown array. Add class-validator decorators for validation. Follow existing DTO patterns in the project. | Restrictions: Ensure breakdown array is properly typed with country, quantity, unitPrice, subtotal fields, use appropriate validators | Success: DTO structure matches design, validation works, properly typed for TypeScript_

- [ ] 25. Create MyIPsDto and IPDetailDto
  - File: backend/src/modules/proxy/static/dto/my-ips.dto.ts (new)
  - Define MyIPsDto for paginated IP list
  - Define IPDetailDto for single IP details
  - Add status enum (active/expiring_soon/expired)
  - _Leverage: Existing pagination response DTOs_
  - _Requirements: Design Section "Data Models" - MyIPsDto_
  - _Prompt: Role: TypeScript Developer | Task: Create MyIPsDto and IPDetailDto in backend/src/modules/proxy/static/dto/my-ips.dto.ts. MyIPsDto should include data array, total, page, perPage. IPDetailDto should include IP, credentials, location, expiration, status. Add status enum for active/expiring_soon/expired. | Restrictions: Follow existing pagination patterns, include all fields from design, use proper TypeScript types | Success: DTOs match design structure, pagination format is consistent, status enum works correctly_

- [ ] 26. Create RenewalResultDto and OrderStatusDto
  - File: backend/src/modules/proxy/static/dto/renewal.dto.ts (new) and order-status.dto.ts (new)
  - Define RenewalResultDto (success, orderNo, newExpirationDate, amountCharged)
  - Define OrderStatusDto (orderNo, status, amount, currency)
  - Add RenewIPDto for renewal request validation
  - _Leverage: Existing response DTOs_
  - _Requirements: Design Section "Data Models" - RenewalResultDto_
  - _Prompt: Role: TypeScript Developer | Task: Create RenewalResultDto in renewal.dto.ts and OrderStatusDto in order-status.dto.ts. RenewalResultDto should include success flag, orderNo, newExpirationDate, amountCharged. OrderStatusDto should include orderNo, status (pending/completed/failed), amount, currency. Also create RenewIPDto for validating renewal requests (ip, duration). | Restrictions: Add proper validation decorators to RenewIPDto, match design structure exactly, use enums for status | Success: DTOs properly structured, validation works on requests, response formats match design_

## Phase 6: Frontend API Client

- [ ] 27. Add inventory API client method
  - File: frontend/src/api/static-proxy.ts
  - Add `getInventory()` function
  - Call `GET /api/v1/static-proxy/inventory`
  - Return typed InventoryDto
  - _Leverage: Existing axios instance with interceptors_
  - _Requirements: Design Section "Frontend Component 1"_
  - _Prompt: Role: Frontend API Developer | Task: Add getInventory() function to frontend/src/api/static-proxy.ts that calls GET /api/v1/static-proxy/inventory with query parameters (ipType, duration). Use existing axios instance (has auth interceptors). Return typed InventoryDto response. | Restrictions: Reuse existing axios instance, add proper TypeScript return type, handle network errors, include query parameters correctly | Success: Function successfully calls backend inventory endpoint, returns properly typed data, error handling works_

- [ ] 28. Add price calculation API client method
  - File: frontend/src/api/static-proxy.ts
  - Add `calculatePrice()` function
  - Call `POST /api/v1/static-proxy/calculate-price`
  - Return typed PriceDto
  - _Leverage: Existing axios instance_
  - _Requirements: Design Section "Frontend Component 1"_
  - _Prompt: Role: Frontend API Developer | Task: Add calculatePrice() function to frontend/src/api/static-proxy.ts that calls POST /api/v1/static-proxy/calculate-price with purchase form data. Use existing axios instance. Return typed PriceDto with amount and breakdown. | Restrictions: Reuse axios instance, type the request and response, validate data before sending, handle errors gracefully | Success: Function successfully calculates prices, returns detailed breakdown, handles invalid inputs with clear errors_

- [ ] 29. Add my IPs API client method
  - File: frontend/src/api/static-proxy.ts
  - Add `getMyIPs()` function with pagination params
  - Call `GET /api/v1/static-proxy/my-ips`
  - Return typed MyIPsDto
  - _Leverage: Existing axios instance_
  - _Requirements: Design Section "Frontend Component 2"_
  - _Prompt: Role: Frontend API Developer | Task: Add getMyIPs() function to frontend/src/api/static-proxy.ts that calls GET /api/v1/static-proxy/my-ips with pagination parameters (page, limit). Use existing axios instance. Return typed MyIPsDto with paginated IP list. | Restrictions: Include pagination params in query string, type the response correctly, handle empty results, default to page=1, limit=20 | Success: Function retrieves paginated IP list, pagination params work correctly, returns typed response_

- [ ] 30. Add IP detail and renewal API client methods
  - File: frontend/src/api/static-proxy.ts
  - Add `getIPDetail(ip: string)` function
  - Add `renewIP(ip: string, duration: number)` function
  - Add `getOrderStatus(orderNo: string)` function
  - _Leverage: Existing axios instance_
  - _Requirements: Design Section "Frontend Component 2"_
  - _Prompt: Role: Frontend API Developer | Task: Add three functions to frontend/src/api/static-proxy.ts: getIPDetail(ip) calling GET /api/v1/static-proxy/ip/:ip, renewIP(ip, duration) calling POST /api/v1/static-proxy/renew, and getOrderStatus(orderNo) calling GET /api/v1/static-proxy/order/:orderNo. Use existing axios instance for all. Return properly typed responses. | Restrictions: Validate IP address and duration before API calls, use URL parameters correctly, type all responses, handle 404 errors gracefully | Success: All three functions work correctly, handle parameters properly, return typed responses, error handling clear_

## Phase 7: Frontend Purchase Form Enhancement

- [ ] 31. Enhance purchase form with inventory display
  - File: frontend/src/views/proxy/StaticProxy.vue
  - On component mount, call `getInventory()` API
  - Display available countries and cities dynamically
  - Show stock counts for each location
  - Disable out-of-stock options
  - Add loading state while fetching inventory
  - _Leverage: Existing form component structure_
  - _Requirements: Design Section "Frontend Component 1" - inventory display_
  - _Prompt: Role: Frontend Vue.js Developer | Task: Enhance the purchase form in frontend/src/views/proxy/StaticProxy.vue. On component mount, fetch inventory data using getInventory() API. Display countries and cities dynamically with stock counts. Disable out-of-stock options. Add loading spinner while fetching. Replace static country list with dynamic data. | Restrictions: Do not break existing form functionality, handle loading and error states, ensure responsive design, show stock availability clearly | Success: Form displays real-time inventory, out-of-stock items disabled, loading state shown during fetch, countries/cities update dynamically_

- [ ] 32. Add price calculation preview
  - File: frontend/src/views/proxy/StaticProxy.vue
  - Add "Calculate Price" button before purchase button
  - On click, call `calculatePrice()` API with form data
  - Display calculated price with breakdown (country, quantity, subtotal)
  - Show total amount prominently
  - Warn if balance insufficient
  - _Leverage: Existing form state, user store for balance_
  - _Requirements: Design Section "Frontend Component 1" - price preview_
  - _Prompt: Role: Frontend Vue.js Developer | Task: Add price calculation preview to frontend/src/views/proxy/StaticProxy.vue. Add "Calculate Price" button that calls calculatePrice() API with current form data. Display calculated total and itemized breakdown (country, quantity, unit price, subtotal). Show warning if user balance is insufficient. Update UI to show/hide preview. | Restrictions: Validate form data before calculating, handle calculation errors gracefully, make breakdown easily readable, disable purchase if insufficient balance | Success: Price calculation works, breakdown is clear and accurate, insufficient balance warning prevents purchase, good UX_

- [ ] 33. Update purchase flow to use real data
  - File: frontend/src/views/proxy/StaticProxy.vue
  - Ensure purchase submission uses real form data
  - Remove any mock data references
  - Add loading state during purchase (show "Processing order...")
  - Handle order polling (wait for backend to complete)
  - On success, redirect to "My IPs" page
  - _Leverage: Existing purchase method, router_
  - _Requirements: Design Section "Purchase Flow (Enhanced)"_
  - _Prompt: Role: Frontend Vue.js Developer | Task: Update the purchase flow in frontend/src/views/proxy/StaticProxy.vue to use real API data. Remove any mock data references. Add loading spinner with "Processing order..." message during purchase. Handle backend order polling gracefully (may take 10-30 seconds). On success, show success message and redirect to "My IPs" page. On failure, show clear error message. | Restrictions: Do not allow multiple simultaneous purchases, disable form during submission, show clear progress indicator, handle all error scenarios | Success: Purchase flow uses real data, loading states are clear, user is notified of progress, redirects correctly on success_

## Phase 8: Frontend My IPs Page

- [ ] 34. Create My IPs list page component
  - File: frontend/src/views/proxy/MyProxies.vue (new)
  - Create new Vue component for IP list
  - On mount, call `getMyIPs()` with default pagination
  - Display IPs in a table/card layout
  - Show columns: IP, Port, Country, City, Expiration, Status, Actions
  - Add visual indicators for status (green=active, yellow=expiring_soon, red=expired)
  - _Leverage: Existing table components, styling patterns_
  - _Requirements: Design Section "Frontend Component 2"_
  - _Prompt: Role: Frontend Vue.js Developer | Task: Create new MyProxies.vue component in frontend/src/views/proxy/. On mount, fetch user's IPs using getMyIPs() API. Display IPs in a responsive table or card layout with columns for IP, Port, Country, City, Expiration, Status, and Actions. Add color-coded status indicators (green for active, yellow for expiring soon, red for expired). Follow existing component and styling patterns. | Restrictions: Ensure responsive design, handle empty state (no IPs), add loading skeleton, follow existing UI patterns | Success: Component displays IP list correctly, status colors are clear, responsive on mobile, handles empty state_

- [ ] 35. Add pagination to My IPs page
  - File: frontend/src/views/proxy/MyProxies.vue
  - Add pagination controls (previous, next, page numbers)
  - On page change, call `getMyIPs()` with new page number
  - Display current page and total count
  - _Leverage: Existing pagination components_
  - _Requirements: Design Section "Frontend Component 2" - pagination_
  - _Prompt: Role: Frontend Vue.js Developer | Task: Add pagination controls to MyProxies.vue component. Include Previous/Next buttons and page number indicators. On page change, fetch new data using getMyIPs(page, limit). Display "Showing X-Y of Z IPs" information. Use existing pagination component if available. | Restrictions: Handle edge cases (first/last page), disable buttons appropriately, default to 20 items per page, maintain page state in URL query params | Success: Pagination works smoothly, page state persists, handles all edge cases, shows correct counts_

- [ ] 36. Add filters and search to My IPs page
  - File: frontend/src/views/proxy/MyProxies.vue
  - Add country filter dropdown (show unique countries from user's IPs)
  - Add IP address search input
  - Filter results client-side or call API with filters
  - _Leverage: Existing filter components_
  - _Requirements: Design Section "Frontend Component 2" - filters_
  - _Prompt: Role: Frontend Vue.js Developer | Task: Add filtering and search functionality to MyProxies.vue. Add country dropdown filter (populated with user's unique countries) and IP search input. Implement client-side filtering for responsiveness. Update displayed results when filters change. Add "Clear Filters" button. | Restrictions: Maintain pagination when filtering, handle no results state, debounce search input, ensure good performance with large datasets | Success: Filters work correctly, search is responsive, pagination integrates with filters, clear UX_

- [ ] 37. Add IP renewal functionality
  - File: frontend/src/views/proxy/MyProxies.vue
  - Add "Renew" button for each IP (enabled for expiring/active IPs)
  - On click, show renewal dialog with duration options (7, 15, 30 days)
  - Show renewal cost calculation
  - On confirm, call `renewIP()` API
  - Show success message and update IP list
  - _Leverage: Existing dialog components, API methods_
  - _Requirements: Design Section "Frontend Component 2" - renewal_
  - _Prompt: Role: Frontend Vue.js Developer | Task: Add renewal functionality to MyProxies.vue. Add "Renew" button for each IP (disabled for expired IPs). On click, open a dialog with duration options (7, 15, 30 days) and show calculated renewal cost. On confirmation, call renewIP() API, show success message, and refresh the IP list with updated expiration. Handle insufficient balance errors. | Restrictions: Disable renewals for expired IPs, validate duration selection, handle renewal failures gracefully, confirm before charging | Success: Renewal dialog works smoothly, cost is accurate, IP list updates after renewal, error handling is clear_

- [ ] 38. Add IP detail view
  - File: frontend/src/views/proxy/MyProxies.vue
  - Add "View Details" link/button for each IP
  - On click, call `getIPDetail()` API
  - Show modal/drawer with complete IP information
  - Display credentials (IP, port, username, password) with copy buttons
  - Show expiration countdown
  - _Leverage: Existing modal components_
  - _Requirements: Design Section "Frontend Component 2" - detail view_
  - _Prompt: Role: Frontend Vue.js Developer | Task: Add IP detail view to MyProxies.vue. Add "View Details" button for each IP. On click, fetch details using getIPDetail() API and display in a modal. Show all IP information: IP address, port, username, password (with copy buttons), country, city, expiration date, plan. Add countdown for expiration (e.g., "7 days remaining"). | Restrictions: Add copy-to-clipboard functionality for credentials, handle API errors, show loading state while fetching, secure password display (show/hide toggle) | Success: Detail modal displays all information, copy buttons work, expiration countdown is accurate, good UX_

## Phase 9: Frontend Dashboard Enhancement

- [ ] 39. Update Dashboard with real statistics
  - File: frontend/src/views/Dashboard.vue
  - Replace mock `total_ips` with count from `getMyIPs()` API
  - Add "Active IPs" widget (count IPs with status='active')
  - Add "Expiring Soon" widget (count IPs with status='expiring_soon')
  - Update "Available Balance" with real user balance
  - Add loading states for all widgets
  - _Leverage: Existing dashboard widgets, user store_
  - _Requirements: Design Section "Frontend Component 3"_
  - _Prompt: Role: Frontend Vue.js Developer | Task: Update Dashboard.vue to display real statistics. Replace mock total_ips with actual count from getMyIPs() API. Add new widgets for "Active IPs" (status=active) and "Expiring Soon" (status=expiring_soon). Update "Available Balance" from user store. Add loading skeletons while fetching data. | Restrictions: Fetch data efficiently (single API call if possible), handle empty states, cache data briefly to reduce API calls, ensure responsive layout | Success: Dashboard shows real-time statistics, loading states are smooth, no mock data remains, widgets are responsive_

## Phase 10: Routing and Navigation

- [ ] 40. Add My IPs route
  - File: frontend/src/router/index.ts
  - Add route for `/my-proxies` pointing to MyProxies.vue
  - Add route guard (require authentication)
  - Update navigation menu to include "My IPs" link
  - _Leverage: Existing route guards, navigation component_
  - _Requirements: Design Section "Frontend Component 2"_
  - _Prompt: Role: Frontend Developer | Task: Add new route to frontend/src/router/index.ts for /my-proxies path pointing to MyProxies.vue component. Apply existing authentication guard. Update main navigation menu (sidebar/header) to include "My IPs" or "My Proxies" link. Ensure route meta includes proper title and requiresAuth. | Restrictions: Follow existing route structure, use existing auth guard, update navigation consistently, add route to breadcrumbs | Success: Route works correctly, requires authentication, navigation link is visible and works, breadcrumbs show proper path_

## Phase 11: Testing

- [ ] 41. Write unit tests for Proxy985Service
  - File: backend/src/modules/proxy985/proxy985.service.spec.ts (new)
  - Mock axios client
  - Test all 7 API methods (getStock, calculatePrice, getIPList, getIPDetail, renewIP, getOrderResult, getBusinessList)
  - Test error handling for each method
  - Test response transformation
  - _Leverage: Existing test utilities, jest mocking_
  - _Requirements: Design Section "Testing Strategy" - Unit Testing_
  - _Prompt: Role: Backend Test Engineer | Task: Create comprehensive unit tests for Proxy985Service in backend/src/modules/proxy985/proxy985.service.spec.ts. Mock the axios client. Write tests for all 7 API methods covering success cases, error handling (network errors, API errors), and response transformation. Ensure tests are isolated and don't make real API calls. | Restrictions: Mock all external dependencies (axios), do not make real API calls, test error scenarios thoroughly, maintain test isolation | Success: All 7 methods have unit tests, error handling is tested, mocks work correctly, tests run independently and pass_

- [ ] 42. Write unit tests for StaticProxyService enhancements
  - File: backend/src/modules/proxy/static/static-proxy.service.spec.ts (update existing)
  - Add tests for new methods (getInventory, calculatePurchasePrice, listMyIPs, getIPDetails, renewIP, checkOrderStatus, syncIPsFromRemote)
  - Mock Proxy985Service calls
  - Test caching behavior
  - Test authorization checks
  - _Leverage: Existing test structure, mocks_
  - _Requirements: Design Section "Testing Strategy" - Unit Testing_
  - _Prompt: Role: Backend Test Engineer | Task: Update existing StaticProxyService tests in backend/src/modules/proxy/static/static-proxy.service.spec.ts. Add tests for all new methods (getInventory, calculatePurchasePrice, listMyIPs, getIPDetails, renewIP, checkOrderStatus, syncIPsFromRemote). Mock Proxy985Service. Test caching (Redis), authorization checks (user ownership), and error scenarios. | Restrictions: Mock Proxy985Service and Redis, test business logic in isolation, verify authorization checks work, test cache hits and misses | Success: All new methods have tests, authorization is tested, caching behavior verified, error handling covered_

- [ ] 43. Write integration tests for new API endpoints
  - File: backend/test/integration/static-proxy.e2e.spec.ts (update existing)
  - Test inventory, calculate-price, my-ips, ip/:ip, renew, order/:orderNo endpoints
  - Use test database and mock 985Proxy API calls
  - Test authentication requirements
  - Test authorization (users can only access their own data)
  - _Leverage: Existing e2e test setup_
  - _Requirements: Design Section "Testing Strategy" - Integration Testing_
  - _Prompt: Role: Backend Test Engineer | Task: Update integration tests in backend/test/integration/static-proxy.e2e.spec.ts. Add tests for all new endpoints (inventory, calculate-price, my-ips, ip/:ip, renew, order/:orderNo). Use test database. Mock 985Proxy API calls. Test authentication (401 without token) and authorization (users can't access others' data). Test complete request-response flows. | Restrictions: Use test database (don't affect production), mock external 985Proxy API, test auth thoroughly, clean up test data after each test | Success: All endpoints have integration tests, auth and authorization tested, request-response flows validated, tests run reliably_

- [ ] 44. Write frontend unit tests for API client methods
  - File: frontend/src/api/static-proxy.spec.ts (new)
  - Mock axios responses
  - Test all new API client functions (getInventory, calculatePrice, getMyIPs, getIPDetail, renewIP, getOrderStatus)
  - Test error handling
  - _Leverage: Existing frontend test setup_
  - _Requirements: Design Section "Testing Strategy" - Unit Testing_
  - _Prompt: Role: Frontend Test Engineer | Task: Create unit tests for API client methods in frontend/src/api/static-proxy.spec.ts. Mock axios responses. Test all new functions (getInventory, calculatePrice, getMyIPs, getIPDetail, renewIP, getOrderStatus) for success and error scenarios. Verify correct parameters are passed and responses are typed correctly. | Restrictions: Mock axios completely, don't make real network requests, test error handling, verify request parameters | Success: All API client methods have tests, mocking works correctly, error handling tested, tests run independently_

- [ ] 45. Write frontend component tests for MyProxies page
  - File: frontend/src/views/proxy/MyProxies.spec.ts (new)
  - Mock API calls
  - Test component rendering with various data states (empty, loading, populated)
  - Test pagination controls
  - Test filter and search functionality
  - Test renewal dialog
  - _Leverage: Existing component test utilities_
  - _Requirements: Design Section "Testing Strategy" - Unit Testing_
  - _Prompt: Role: Frontend Test Engineer | Task: Create component tests for MyProxies.vue in frontend/src/views/proxy/MyProxies.spec.ts. Mock API calls. Test rendering in various states (loading, empty, populated with IPs). Test pagination, filtering, searching, and renewal dialog functionality. Verify user interactions trigger correct API calls. | Restrictions: Mock all API calls, test user interactions, verify UI renders correctly in all states, test error handling | Success: Component tests cover all features, mocking works, UI states tested, user interactions validated_

## Phase 12: End-to-End Testing with Chrome DevTools

- [ ] 46. E2E Test: View real-time inventory
  - Use Chrome DevTools MCP to navigate to purchase page
  - Verify inventory data is loaded from 985Proxy API
  - Check that countries and cities display with stock counts
  - Verify out-of-stock options are disabled
  - _Requirements: Design Section "Testing Strategy" - E2E Testing_
  - _Prompt: Role: QA Automation Engineer | Task: Use Chrome DevTools MCP to perform end-to-end test of inventory display. Navigate to http://localhost:5173/static-proxy (or purchase page), take snapshots, verify inventory data displays correctly with country/city stock counts. Check that out-of-stock items are disabled. Verify loading state appears briefly. | Restrictions: Use real frontend and backend (not mocks), verify real API calls to 985Proxy, document any UI issues, ensure data accuracy | Success: Inventory loads correctly, stock counts are accurate, out-of-stock items disabled, UI is responsive_

- [ ] 47. E2E Test: Calculate purchase price
  - Use Chrome DevTools MCP
  - Fill purchase form with valid data (country, city, quantity, duration)
  - Click "Calculate Price" button
  - Verify price calculation displays correct amount and breakdown
  - Check balance warning if insufficient funds
  - _Requirements: Design Section "Testing Strategy" - E2E Testing_
  - _Prompt: Role: QA Automation Engineer | Task: Use Chrome DevTools MCP to test price calculation. Navigate to purchase page, fill form with test data (e.g., US, New York, 2 IPs, 30 days), click "Calculate Price", verify calculated price displays with correct breakdown. Test with insufficient balance to verify warning appears. | Restrictions: Use real APIs, verify calculations are accurate against 985Proxy pricing, test multiple scenarios, document results | Success: Price calculation works correctly, breakdown is accurate, insufficient balance warning displays, UX is smooth_

- [ ] 48. E2E Test: Complete purchase flow (CRITICAL - REAL MONEY)
  - Use Chrome DevTools MCP
  - Fill purchase form with SMALL quantity (e.g., 1 IP, 7 days - minimize cost)
  - Click "Calculate Price" first, note the amount
  - Confirm user balance is sufficient
  - Submit purchase
  - Verify "Processing order..." loading state
  - Wait for order completion (backend polling)
  - Verify success message and redirect to My IPs page
  - Check 985Proxy account balance was deducted
  - _Requirements: Design Section "Testing Strategy" - E2E Testing, Design "Purchase Flow (Enhanced)"_
  - _Prompt: Role: QA Automation Engineer | Task: ⚠️ CRITICAL TEST WITH REAL MONEY ⚠️ Use Chrome DevTools MCP to test complete purchase flow. Fill purchase form with MINIMAL quantity (1 IP, 7 days) to minimize cost. Calculate price first. Submit purchase. Verify loading state ("Processing order..."). Wait for completion (may take 30 seconds due to order polling). Verify success message, redirect to My IPs, and check that IP appears in list. IMPORTANT: After test, verify actual deduction from 985Proxy account balance. | Restrictions: Use MINIMAL purchase amount, verify real money deduction, test only once to avoid unnecessary charges, document exact amount deducted, cancel test if any errors | Success: Purchase completes successfully, order polling works, IP appears in My IPs, 985Proxy account balance deducted correctly, no errors_

- [ ] 49. E2E Test: View My IPs page
  - Use Chrome DevTools MCP to navigate to My IPs page
  - Verify previously purchased IP(s) display correctly
  - Check all fields: IP, port, country, city, expiration, status
  - Verify expiration countdown is accurate
  - Test pagination if enough IPs
  - _Requirements: Design Section "Testing Strategy" - E2E Testing_
  - _Prompt: Role: QA Automation Engineer | Task: Use Chrome DevTools MCP to test My IPs page. Navigate to /my-proxies, take snapshot, verify IP list displays with all fields (IP, port, country, city, expiration, status). Check that expiration countdown is accurate (e.g., "28 days remaining"). Test pagination controls if multiple pages exist. Verify status colors (green/yellow/red). | Restrictions: Use real data from previous purchase test, verify all data is accurate, test responsiveness, document any UI issues | Success: My IPs page displays correctly, all fields are accurate, status indicators work, pagination functions properly_

- [ ] 50. E2E Test: IP renewal flow
  - Use Chrome DevTools MCP
  - On My IPs page, click "Renew" button for an IP
  - Verify renewal dialog opens with duration options
  - Select duration (e.g., 7 days)
  - Verify renewal cost is displayed
  - Confirm renewal
  - Verify success message and updated expiration date
  - _Requirements: Design Section "Testing Strategy" - E2E Testing_
  - _Prompt: Role: QA Automation Engineer | Task: Use Chrome DevTools MCP to test IP renewal. Navigate to My IPs, click "Renew" on an IP (preferably expiring soon). Verify dialog opens with duration options (7, 15, 30 days). Select 7 days, verify cost displays. Confirm renewal. Verify success message and that expiration date updates in the list. Check 985Proxy account for deduction. | Restrictions: Test with real API, verify real deduction, use small duration to minimize cost, confirm expiration date updates correctly | Success: Renewal dialog works, cost is accurate, expiration updates correctly, 985Proxy balance deducted_

- [ ] 51. E2E Test: Dashboard statistics
  - Use Chrome DevTools MCP to navigate to Dashboard
  - Verify "Total IPs" matches count from My IPs page
  - Verify "Active IPs" count is correct
  - Verify "Expiring Soon" count is correct (if applicable)
  - Verify "Available Balance" is accurate
  - _Requirements: Design Section "Testing Strategy" - E2E Testing_
  - _Prompt: Role: QA Automation Engineer | Task: Use Chrome DevTools MCP to test Dashboard statistics. Navigate to Dashboard, take snapshot. Verify "Total IPs" widget displays correct count (match against My IPs page). Verify "Active IPs" and "Expiring Soon" counts are accurate. Verify "Available Balance" matches user account. Document any discrepancies. | Restrictions: Compare statistics against actual data, verify real-time updates, ensure no mock data remains | Success: All statistics are accurate, match real data, no mock values, widgets display correctly_

## Phase 13: Documentation and Cleanup

- [ ] 52. Update API documentation
  - File: docs/985Proxy API Integration.md (new)
  - Document all 7 985Proxy APIs and their usage
  - Document all new backend endpoints
  - Add request/response examples
  - Document error codes and handling
  - _Requirements: Design Section "Success Metrics"_
  - _Prompt: Role: Technical Documentation Writer | Task: Create comprehensive API documentation in docs/985Proxy API Integration.md. Document all 7 985Proxy external APIs (purpose, parameters, responses). Document all new backend endpoints with request/response examples. Include error codes and troubleshooting guide. Add diagrams for data flow. | Restrictions: Use clear language, provide complete examples, include edge cases, format consistently | Success: Documentation is clear and complete, examples are accurate, covers all APIs and endpoints, useful for developers_

- [ ] 53. Update environment configuration docs
  - File: docs/ENV_TEMPLATE.txt (update)
  - Add documentation for `PROXY_985_ZONE` configuration
  - Clarify difference between API Key and Zone ID
  - Add instructions for finding Zone ID in 985Proxy dashboard
  - Update `PROXY_985_TEST_MODE` documentation
  - _Requirements: Design Section "Deployment Checklist"_
  - _Prompt: Role: Technical Documentation Writer | Task: Update docs/ENV_TEMPLATE.txt to include detailed documentation for 985Proxy configuration variables. Explain PROXY_985_API_KEY vs PROXY_985_ZONE clearly. Add step-by-step instructions for finding Zone ID in 985Proxy dashboard. Document PROXY_985_TEST_MODE usage (true for testing without charges, false for production). | Restrictions: Be very clear about Zone ID vs API Key (common confusion point), add visual hints if possible, warn about test mode | Success: Configuration is clearly documented, Zone ID instructions are easy to follow, test mode explained clearly_

- [ ] 54. Remove all mock data and debug logs
  - Files: backend/src/modules/proxy/static/static-proxy.service.ts, frontend/src/views/Dashboard.vue
  - Remove mock IP generation code after successful purchase
  - Remove or update debug console.log statements
  - Ensure all features use real 985Proxy data
  - _Requirements: Design Section "Success Metrics" - no mock data_
  - _Prompt: Role: Senior Developer | Task: Perform final cleanup to remove all mock data and excessive debug logs. In StaticProxyService, ensure purchaseStaticProxy() saves only real IPs from 985Proxy (remove mock generation fallback). In Dashboard and other components, remove mock data. Clean up or convert console.log to proper logging. Ensure all flows use real APIs. | Restrictions: Keep essential error logging, do not remove useful informational logs, ensure no functionality breaks, test after cleanup | Success: All mock data removed, only real 985Proxy data used, logging is appropriate (not excessive), all features still work_

- [ ] 55. Write deployment guide
  - File: docs/DEPLOYMENT_985PROXY.md (new)
  - Document deployment checklist from design doc
  - Add migration instructions
  - Add environment variable setup for production
  - Document testing procedures before going live
  - Add rollback plan
  - _Requirements: Design Section "Deployment Checklist"_
  - _Prompt: Role: DevOps Engineer | Task: Create deployment guide in docs/DEPLOYMENT_985PROXY.md. Document step-by-step deployment process: run migrations, configure .env for production (PROXY_985_TEST_MODE=false), deploy backend, deploy frontend, test with small purchase, monitor logs. Include rollback procedures if integration fails. Add pre-deployment checklist. | Restrictions: Be explicit about production vs test mode, emphasize testing with small amounts first, include monitoring recommendations | Success: Deployment guide is comprehensive and actionable, includes safety measures, covers rollback scenarios_

## Phase 14: Final Validation and Sign-off

- [ ] 56. Final integration validation
  - Verify all 7 985Proxy APIs are integrated and working
  - Verify real-time inventory displays correctly
  - Verify purchase flow works end-to-end with real charges
  - Verify My IPs page shows accurate data
  - Verify renewal works correctly
  - Verify Dashboard statistics are accurate
  - Verify no mock data remains in any critical flows
  - _Requirements: Design Section "Success Metrics" - all items_
  - _Prompt: Role: QA Lead | Task: Perform final comprehensive validation of 985Proxy integration. Test all 7 APIs are functional (inventory, calculate, buy, ip_list, ip_detail, renewal, order_result, business_list). Verify end-to-end purchase flow with REAL deduction. Verify My IPs data accuracy. Verify Dashboard statistics. Create validation report documenting all tests and results. | Restrictions: Test in production mode (PROXY_985_TEST_MODE=false), use real money (small amounts), document every test, verify actual charges | Success: All features work correctly, real API integration verified, no mock data, validation report confirms all success metrics met_

