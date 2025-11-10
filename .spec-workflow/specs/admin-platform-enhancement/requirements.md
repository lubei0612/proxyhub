# Requirements Document

## Introduction

This specification addresses critical platform improvements and bug fixes to enhance the admin experience and simplify the balance management system. The enhancements focus on:

1. Simplifying balance management by removing the gift balance system
2. Making customer service links dynamic and configurable
3. Fixing admin panel functionality issues
4. Enabling admins to view user-purchased IPs for account reconciliation
5. Enhancing dynamic residential proxy management with 985Proxy API integration
6. Replacing hardcoded settlement data with real database queries

These improvements will streamline admin workflows, improve data accuracy, and provide better operational visibility.

## Alignment with Product Vision

These enhancements align with the project's goals of:
- **Data Consistency**: All data comes from real sources (985Proxy API, database), eliminating mock/hardcoded data
- **Operational Efficiency**: Simplified balance management and better admin tools reduce manual work
- **Flexibility**: Dynamic configuration (customer service links) allows quick operational changes
- **Transparency**: Admins can easily verify user purchases and reconcile accounts

## Requirements

### Requirement 1: Remove Gift Balance System

**User Story:** As a platform administrator, I want all balance operations to use a single balance field, so that balance management is simpler and more transparent.

#### Acceptance Criteria

1. WHEN admin adds balance to user THEN system SHALL directly increase `balance` field
2. WHEN admin deducts balance from user THEN system SHALL directly decrease `balance` field
3. WHEN user purchases IP THEN system SHALL only deduct from `balance` field
4. WHEN displaying user balance in frontend THEN system SHALL only show `balance` (not gift_balance)
5. WHEN displaying admin balance operations THEN system SHALL not show gift_balance option
6. IF user has existing gift_balance THEN system SHALL migrate it to balance field during deployment

### Requirement 2: Dynamic Customer Service Links

**User Story:** As a platform administrator, I want customer service links to be configurable from the admin settings panel, so that I can update contact information without code changes.

#### Acceptance Criteria

1. WHEN admin updates Telegram links in Settings THEN frontend SHALL fetch and display the new links
2. WHEN user clicks "Contact Support" THEN system SHALL open the admin-configured Telegram link
3. WHEN frontend loads user center page THEN system SHALL call `/api/v1/settings` to get current links
4. WHEN settings API is unavailable THEN system SHALL display fallback contact message
5. WHEN admin configures multiple support contacts THEN all SHALL be displayed in user center

### Requirement 3: Fix Add User Button

**User Story:** As an administrator, I want the "Add User" button to open a dialog, so that I can create new user accounts from the admin panel.

#### Acceptance Criteria

1. WHEN admin clicks "Add User" button THEN system SHALL open a user creation dialog
2. WHEN dialog opens THEN system SHALL display fields: email, password, role, initial balance
3. WHEN admin submits valid data THEN system SHALL create user account and close dialog
4. WHEN admin submits invalid data THEN system SHALL display validation errors
5. WHEN user creation succeeds THEN system SHALL refresh user list automatically

### Requirement 4: View User Purchased IPs

**User Story:** As an administrator, I want to view all IPs purchased by a specific user, so that I can reconcile accounts and verify purchases.

#### Acceptance Criteria

1. WHEN admin clicks "View IPs" button for a user THEN system SHALL open a modal displaying user's IP inventory
2. WHEN modal opens THEN system SHALL display:
   - Static residential IPs (IP, port, country, expiry date, order number)
   - Dynamic residential channels (channel name, remaining traffic, package type, order number)
   - Recent transactions (last 5 purchases with date, type, amount, balance, order number)
3. WHEN admin clicks "Export Excel" THEN system SHALL download user's IP data as Excel file
4. WHEN no IPs exist for user THEN system SHALL display "No IPs found" message
5. WHEN loading IP data THEN system SHALL show loading indicator

### Requirement 5: Dynamic Residential Proxy Management Enhancement

**User Story:** As a platform user, I want to manage dynamic residential proxy channels and extract IPs directly from 985Proxy, so that I can use dynamic proxies for my business needs.

#### Acceptance Criteria

1. WHEN user creates a channel THEN system SHALL store channel info (name, package type, traffic limit, zone_id)
2. WHEN user clicks "Extract IP" on a channel THEN system SHALL:
   - Display extraction dialog with country selection, quantity, and proxy lifetime options
   - Show estimated traffic consumption and cost
   - Call 985Proxy `/res_rotating/extract` API
   - Return IP list in format `ip:port:username:password`
3. WHEN extraction succeeds THEN system SHALL:
   - Update channel's traffic_used field
   - Deduct user balance (for personal packages)
   - Record extraction log with IP list, traffic consumed, and cost
4. WHEN user has insufficient traffic (personal package) THEN system SHALL prevent extraction and show error
5. WHEN displaying channel list THEN system SHALL show: channel name, package type, traffic used, cost per GB, status
6. WHEN admin views 985Proxy zone management THEN system SHALL display available zones and allow zone assignment

### Requirement 6: Real Settlement Records

**User Story:** As an administrator, I want settlement records to show real data from the database, so that I can accurately track financial operations.

#### Acceptance Criteria

1. WHEN admin views settlement page THEN system SHALL query database for settlement periods
2. WHEN displaying settlement list THEN system SHALL show:
   - Settlement ID
   - Settlement period (start date - end date)
   - Total amount
   - Order count
   - Status (pending, completed)
   - Creation date, completion date
3. WHEN admin clicks "View Details" on a settlement THEN system SHALL show all orders in that period
4. WHEN no settlements exist THEN system SHALL display "No settlement records" message
5. WHEN creating new settlement THEN system SHALL aggregate orders from specified date range

### Requirement 7: Static Residential IP Management UI Enhancement

**User Story:** As a user, I want the static residential IP list to display all information in a single row with horizontal scrolling (like 985Proxy), so that I can easily view and copy IP credentials.

#### Acceptance Criteria

1. WHEN viewing static IP list THEN system SHALL display all fields in a single row:
   - Channel name (所属通道)
   - IP:Port:Username:Password (IP:端口:账号:密码)
   - Country/City (国家/城市)
   - Expiry time (到期时间)
   - Release time (释放时间)
   - Node ID (节点ID)
   - Remark (备注)
   - Actions (操作: Copy, Renew, Delete)
2. WHEN table width exceeds viewport THEN system SHALL allow horizontal scrolling to view all columns
3. WHEN user clicks copy icon next to "IP:Port:Username:Password" THEN system SHALL:
   - Copy credentials to clipboard in format `ip:port:username:password`
   - Show success toast message "已复制到剪贴板"
   - Highlight the copy icon for 1 second
4. WHEN copy operation fails THEN system SHALL show error message "复制失败，请手动复制"
5. WHEN displaying IP list THEN system SHALL maintain consistent column widths matching 985Proxy layout
6. WHEN user hovers over long text fields THEN system SHALL show full content in tooltip
7. WHEN user clicks "Export TXT" button THEN system SHALL:
   - Generate TXT file with header line "IP:端口:账户:密码"
   - Each subsequent line contains one IP in format `ip:port:username:password`
   - Use LF (\n) line endings (Unix format)
   - Filename format: `static-ips-{username}-{timestamp}.txt`
   - Automatically download file to user's browser

## Non-Functional Requirements

### Code Architecture and Modularity
- **Single Responsibility Principle**: Separate concerns (balance operations, IP queries, API integrations)
- **Modular Design**: Reusable components for IP display, user selection, and export functionality
- **API Abstraction**: All 985Proxy calls go through `proxy985.service.ts`
- **Clear Interfaces**: DTOs for all new endpoints (AddUserDto, ExtractProxyDto, etc.)

### Performance
- IP query for large users (100+ IPs) should complete within 2 seconds
- Excel export should handle up to 1000 IPs without timeout
- Dynamic proxy extraction should complete within 5 seconds
- Settlement aggregation should process up to 10,000 orders efficiently

### Security
- Only admins can view other users' IPs
- All balance operations require admin role
- 985Proxy API key must be stored securely in environment variables
- User password in "Add User" dialog must be validated (min 8 chars)

### Reliability
- If 985Proxy API fails during extraction, user balance must not be deducted
- Database transactions must ensure atomicity for all balance operations
- IP extraction logs must be recorded even if user disconnects

### Usability
- All admin operations should have clear success/error messages
- IP view modal should be responsive and handle large datasets with pagination
- Dynamic proxy extraction UI should match 985Proxy's familiar interface
- Excel export filename should include username and timestamp for easy identification

## Dependencies

### External APIs
- 985Proxy API:
  - `GET /res_rotating/city_list` - Get available countries
  - `GET /res_rotating/extract` - Extract proxy IPs

### Database Tables
- `users` - Remove gift_balance dependency
- `static_proxies` - Query user's static IPs
- `dynamic_channels` - Store user's dynamic proxy channels
- `dynamic_proxy_extractions` - New table for extraction logs
- `orders` - Link IPs to purchase orders
- `transactions` - Balance change history
- `settlements` - New table for settlement records

### Frontend Libraries
- xlsx (SheetJS) - For Excel export functionality
- Element Plus - Consistent UI components for dialogs and tables

