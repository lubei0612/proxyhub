# Requirements Document - UI Refinement Phase 2

## Introduction

This specification addresses critical UI/UX improvements and functional enhancements identified during user testing. The primary focus is on replicating the 985Proxy interface design patterns while maintaining the existing ProxyHub color scheme, improving authentication error messages, implementing proper export functionality, and ensuring comprehensive testing coverage across all user and admin portal features.

## Alignment with Product Vision

These improvements directly support the core product goal of providing a professional, user-friendly proxy management platform that matches industry standards (985Proxy) while maintaining brand identity through custom styling. Enhanced error messages improve user experience, proper export functionality enables data portability, and comprehensive testing ensures production readiness.

## Requirements

### Requirement 1: Dynamic Proxy Management UI Replication

**User Story:** As a user managing dynamic proxies, I want an interface that matches the 985Proxy design pattern with ProxyHub's color scheme, so that I have a familiar, professional experience.

#### Acceptance Criteria

1. WHEN user navigates to "动态住宅管理" THEN system SHALL display an interface matching 985Proxy layout (图二) with ProxyHub color scheme
2. WHEN user views the page THEN system SHALL display:
   - Package type card (e.g., "个人套餐")
   - Remaining traffic display (e.g., "50.5 GB")
   - Status indicator (e.g., "运行中")
   - Unit price display (e.g., "$4.5/GB")
3. WHEN user views action buttons THEN system SHALL provide:
   - "联系客服购买套餐" button linking to Telegram (@lubei12)
   - "升级套餐" button linking to Telegram
   - "暂停使用" button
   - "套餐设置" button
4. WHEN user views usage statistics THEN system SHALL display a table with columns:
   - 日期 (Date)
   - 请求数 (Request Count)
   - 成功率 (Success Rate)
   - 流量使用 (Traffic Usage)
   - 费用 (Cost)
   - 备注 (Notes)

### Requirement 2: Static Proxy Selection Payment Panel with Country Flags

**User Story:** As a user selecting static proxies, I want to see country flags in the payment panel, so that I can visually identify the countries I'm purchasing IPs from.

#### Acceptance Criteria

1. WHEN user selects IPs from different countries THEN system SHALL display country flags using flag-icons library in the payment panel
2. WHEN displaying selected IPs THEN system SHALL show format: "[Flag Icon] 国家 - 城市" (e.g., "🇺🇸 美国 - Chicago")
3. WHEN payment panel renders THEN system SHALL match 985Proxy payment panel design (图六) with:
   - "支付详情" section showing selected countries with flags
   - Total IP count
   - Valid duration
   - Total cost
   - Promo code option
4. WHEN no IPs are selected THEN system SHALL display "请先选择IP" message

### Requirement 3: Static Proxy Management IP Display Format

**User Story:** As a user managing static proxies, I want to see IP information in a consolidated "IP:Port:Account:Password" format, so that I can easily copy and use the credentials.

#### Acceptance Criteria

1. WHEN user views static proxy list THEN system SHALL display IP information as "IP:端口:账号:密码" in a single field (图八格式)
2. WHEN user clicks on IP field THEN system SHALL allow one-click copy of the entire credential string
3. WHEN table renders THEN system SHALL show columns:
   - 所属通道 (Channel)
   - IP地址:端口:账号:密码 (combined field)
   - 国家 (Country with flag)
   - 选择国家和选择城市 (Country and City selectors)
   - 书签ID和IP类型 (Bookmark ID and IP Type filters with radio buttons: 普通/原生)
4. WHEN table contains many columns THEN system SHALL support horizontal scrolling for 节点ID (Node ID) and 备注 (Remarks)

### Requirement 4: Export Functionality for Static Proxies

**User Story:** As a user managing multiple proxies, I want to export my IP list in "IP:Port:Account:Password" format, so that I can use them in external tools.

#### Acceptance Criteria

1. WHEN user clicks export button THEN system SHALL provide options for:
   - CSV format
   - TXT format (图九样式)
2. WHEN exporting to TXT THEN system SHALL format each line as:
   ```
   IP:Port:Account:Password
   ```
3. WHEN exporting to CSV THEN system SHALL include headers:
   ```
   IP地址:端口:账号:密码,国家/城市,IP类型,所属通道,到期时间,释放时间,节点ID,备注
   ```
4. WHEN export completes THEN system SHALL download file with timestamp in filename (e.g., `static-proxies-20251103.txt`)

### Requirement 5: Enhanced Authentication Error Messages

**User Story:** As a user attempting to log in, I want clear error messages that distinguish between wrong password and non-existent account, so that I know exactly what went wrong.

#### Acceptance Criteria

1. WHEN user enters correct email but wrong password THEN system SHALL display "密码错误，请重试"
2. WHEN user enters an email not in the system THEN system SHALL display "该账号不存在，请先注册"
3. WHEN user enters invalid email format THEN system SHALL display "请输入有效的邮箱地址"
4. WHEN backend returns authentication error THEN frontend SHALL parse error code and display appropriate message
5. IF backend provides error message THEN system SHALL display it, ELSE system SHALL use default error messages

### Requirement 6: Comprehensive Testing Coverage

**User Story:** As a developer, I want comprehensive testing of all user and admin portal features using Chrome DevTools, so that I can ensure the application is production-ready.

#### Acceptance Criteria

1. WHEN testing user portal THEN system SHALL verify all menu items from 图三图四:
   - 仪表盘 (Dashboard)
   - 动态住宅管理 (Dynamic Proxy Management)
   - 动态住宅选购 (Dynamic Proxy Buy)
   - 静态住宅管理 (Static Proxy Management)
   - 静态住宅选购 (Static Proxy Buy)
   - 移动代理 (Mobile Proxy) - if applicable
   - 钱包充值 (Wallet Recharge)
   - 订单管理 (Order Management)
   - 交易明细 (Transaction Details)
   - 结算记录 (Settlement Records)
   - 充值订单 (Recharge Orders)
   - 账户中心 (Account Center)
   - 事件日志 (Event Log)
   - 个人中心 (Profile)
   - 我的代理 (My Proxies)
   - 通知管理 (Notification Management)
2. WHEN testing admin portal THEN system SHALL verify all admin features:
   - 用户管理 (User Management)
   - 充值审核 (Recharge Approval)
   - 统计数据 (Statistics)
   - 订单管理 (Order Management)
   - IP管理 (IP Management)
   - 系统设置 (System Settings)
   - 价格覆盖管理 (Price Override Management)
3. WHEN testing THEN system SHALL use Chrome DevTools to:
   - Verify console for errors
   - Check network requests for failed API calls
   - Take screenshots of each page
   - Verify data loading and display
4. WHEN all tests pass THEN system SHALL document results in test report

## Non-Functional Requirements

### Code Architecture and Modularity
- **Single Responsibility Principle**: Each Vue component should handle one specific UI concern
- **Modular Design**: Reusable components for common UI elements (flags, export buttons, error messages)
- **Dependency Management**: Minimize coupling between components
- **Clear Interfaces**: Well-defined props and events for component communication

### Performance
- Flag icons SHALL load efficiently using CSS sprites
- Export functionality SHALL handle up to 10,000 IP records without browser freeze
- UI updates SHALL reflect within 100ms of user interaction

### Security
- Export functionality SHALL only export IPs owned by the authenticated user
- Error messages SHALL NOT leak sensitive information (e.g., don't reveal which emails exist)

### Reliability
- Export SHALL handle network failures gracefully
- UI SHALL maintain state during navigation
- All API calls SHALL have proper error handling

### Usability
- UI SHALL maintain consistent color scheme across all pages
- Interactive elements SHALL have hover states
- Error messages SHALL be clear and actionable
- Export files SHALL be named descriptively with timestamps

