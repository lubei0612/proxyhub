# Requirements Document

## Introduction

ProxyHub currently has partial integration with 985Proxy API - only the purchase endpoint (`POST /res_static/buy`) is implemented. This results in users receiving mock IP data instead of real proxy information, and missing critical features like IP renewal, real-time inventory display, and order tracking. This spec aims to complete the full integration with all 7 essential 985Proxy APIs to provide users with accurate, real-time proxy management capabilities.

**Value to Users:**
- Receive real, usable proxy IPs instead of mock data
- View accurate inventory and pricing from 985Proxy
- Renew existing proxies without manual intervention
- Track orders and view detailed purchase history
- Access complete business scenario options
- Real-time dashboard statistics synced with 985Proxy

## Alignment with Product Vision

This feature directly supports ProxyHub's core mission of providing a seamless proxy management platform. By fully integrating with 985Proxy's API ecosystem, we enable:
- **Reliability**: Users get real IPs that actually work
- **Transparency**: Accurate inventory and pricing information
- **Self-Service**: Complete proxy lifecycle management (buy, view, renew)
- **Data Integrity**: Dashboard statistics reflect actual 985Proxy data

## Requirements

### Requirement 1: Complete Purchase Flow with Real IP Delivery

**User Story:** As a ProxyHub user, I want to purchase static residential proxies and immediately receive real, working IP credentials, so that I can start using them for my business needs.

#### Acceptance Criteria

1. WHEN user completes a proxy purchase THEN system SHALL call `POST /res_static/buy` to create order
2. WHEN 985Proxy returns order number THEN system SHALL immediately call `POST /res_static/order_result` to retrieve IP details
3. WHEN IP details are retrieved THEN system SHALL save real IP information (address, port, username, password) to database
4. WHEN purchase completes THEN system SHALL display actual proxy credentials to user
5. IF order_result API fails THEN system SHALL retry up to 3 times with exponential backoff
6. IF all retries fail THEN system SHALL log error and notify user to contact support

### Requirement 2: Real-Time Inventory Display

**User Story:** As a ProxyHub user, I want to see accurate proxy inventory and pricing from 985Proxy, so that I can make informed purchasing decisions.

#### Acceptance Criteria

1. WHEN user opens static residential purchase page THEN system SHALL call `GET /res_static/inventory` to fetch current stock
2. WHEN inventory data is received THEN system SHALL display real available quantities for each city
3. WHEN inventory shows zero stock THEN system SHALL mark that location as "Out of Stock" and disable purchase
4. WHEN pricing data is received THEN system SHALL display actual prices including any discounts
5. IF inventory API fails THEN system SHALL show cached data with "Last updated" timestamp
6. WHEN inventory data is older than 10 minutes THEN system SHALL refresh automatically

### Requirement 3: Business Scenario Integration

**User Story:** As a ProxyHub user, I want to select from 985Proxy's complete list of business scenarios, so that my proxy usage is properly categorized and optimized.

#### Acceptance Criteria

1. WHEN application starts THEN system SHALL call `GET /res_static/business_list` to fetch scenarios
2. WHEN business scenarios are loaded THEN system SHALL cache them for 24 hours
3. WHEN user opens purchase page THEN system SHALL display all available business scenarios in dropdown
4. WHEN user selects a scenario THEN system SHALL include it in purchase request
5. IF business_list API fails THEN system SHALL use hardcoded fallback list

### Requirement 4: Accurate Price Calculation

**User Story:** As a ProxyHub user, I want to see the exact price (including discounts and promo codes) before confirming purchase, so that I know exactly what I'll be charged.

#### Acceptance Criteria

1. WHEN user configures purchase (location, quantity, duration) THEN system SHALL call `POST /res_static/calculate` for exact pricing
2. WHEN promo code is entered THEN system SHALL recalculate price with code applied
3. WHEN calculation completes THEN system SHALL display original price, discount, and final amount
4. WHEN user changes any purchase parameter THEN system SHALL recalculate automatically
5. IF calculate API fails THEN system SHALL use client-side estimation with warning message

### Requirement 5: IP Management and Listing

**User Story:** As a ProxyHub user, I want to view all my purchased proxies with their current status, so that I can monitor expiration dates and usage.

#### Acceptance Criteria

1. WHEN user opens "Static Residential Management" page THEN system SHALL call `GET /res_static/ip_list` to fetch current IPs
2. WHEN IP list is retrieved THEN system SHALL display each proxy with status (active/expired), location, and expiration date
3. WHEN user filters by status THEN system SHALL request filtered data from API
4. WHEN user clicks an IP card THEN system SHALL call `GET /res_static/ip_detail` for detailed information
5. WHEN IP status changes on 985Proxy THEN system SHALL reflect updated status (via periodic sync)
6. IF ip_list API fails THEN system SHALL fall back to database with "May not be current" warning

### Requirement 6: Proxy Renewal Functionality

**User Story:** As a ProxyHub user, I want to renew my expiring proxies directly through ProxyHub, so that I can maintain continuous service without manual intervention.

#### Acceptance Criteria

1. WHEN user clicks "Renew" on a proxy THEN system SHALL call `POST /res_static/calculate` with renewal parameters
2. WHEN renewal price is displayed THEN system SHALL show cost for selected duration (30/60/90 days)
3. WHEN user confirms renewal THEN system SHALL call `POST /res_static/renew` with proxy ID and duration
4. WHEN renewal succeeds THEN system SHALL update expiration date in database and notify user
5. WHEN user has multiple expiring proxies THEN system SHALL support batch renewal
6. IF renewal fails due to insufficient funds THEN system SHALL prompt user to add balance

### Requirement 7: Order History and Tracking

**User Story:** As a ProxyHub user, I want to view my complete order history with detailed results, so that I can track purchases and verify IP allocations.

#### Acceptance Criteria

1. WHEN user opens billing/transactions page THEN system SHALL display all orders with order numbers
2. WHEN user clicks "View Details" on an order THEN system SHALL call `POST /res_static/order_result` to fetch complete order info
3. WHEN order details are displayed THEN system SHALL show: order time, completion time, total price, discount, promo code, and allocated IPs
4. WHEN order is still processing THEN system SHALL show "In Progress" status
5. WHEN order completes THEN system SHALL show "Completed" status with full IP list

### Requirement 8: Real-Time Dashboard Statistics

**User Story:** As a ProxyHub user, I want my dashboard to show accurate statistics based on real 985Proxy data, so that I can monitor my proxy usage effectively.

#### Acceptance Criteria

1. WHEN user views dashboard THEN system SHALL call `GET /res_static/ip_list` to count current IPs
2. WHEN statistics are calculated THEN system SHALL show: total IPs, active IPs, expired IPs, and expiring soon (< 7 days)
3. WHEN admin views admin dashboard THEN system SHALL aggregate stats across all users
4. WHEN dashboard loads THEN system SHALL display real-time data with "Last updated" timestamp
5. IF API is unavailable THEN system SHALL show cached statistics with warning

## Non-Functional Requirements

### Code Architecture and Modularity
- **Single Responsibility Principle**: Separate service methods for each 985Proxy API endpoint
- **Modular Design**: Create reusable API client wrapper for 985Proxy interactions
- **Dependency Management**: Centralize 985Proxy configuration in environment variables
- **Clear Interfaces**: Define TypeScript interfaces for all API request/response types
- **Error Handling**: Implement consistent error handling with fallback mechanisms

### Performance
- API response caching for inventory (10 min) and business scenarios (24 hours)
- Implement request debouncing for price calculations (500ms)
- Use pagination for IP list queries (50 items per page)
- Batch renewal operations to minimize API calls
- Database indexing on proxy IPs and user IDs for fast lookups

### Security
- Store 985Proxy API credentials in environment variables only
- Never expose API keys in client-side code
- Validate all API responses before storing in database
- Implement rate limiting on API endpoints (10 req/min per user)
- Log all 985Proxy API calls for audit trail

### Reliability
- Implement retry logic for critical APIs (order_result: 3 retries)
- Fallback to cached/database data when API is unavailable
- Queue failed API calls for retry with exponential backoff
- Monitor API health and alert on consecutive failures
- Transaction rollback on purchase failures (refund user balance)

### Usability
- Display loading states during API calls
- Show clear error messages when operations fail
- Provide "Last updated" timestamps for cached data
- Enable manual refresh button for inventory/IP list
- Display API response times in development mode

