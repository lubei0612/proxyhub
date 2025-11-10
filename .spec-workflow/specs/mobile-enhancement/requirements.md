# Requirements Document

## Introduction

This specification defines three critical enhancements to the ProxyHub platform to improve usability, administrative control, and mobile accessibility:

1. **Business Scenario Selector Integration**: Integrate 985Proxy business scenarios (purpose_web) into the static proxy purchase flow
2. **User-Level Price Override Management**: Enable administrators to set custom pricing for individual users through an intuitive UI
3. **Mobile Responsive Improvements**: Ensure all key pages are fully accessible and usable on mobile devices

These enhancements will improve the platform's flexibility for administrators and accessibility for mobile users, particularly for proxy resellers who manage the platform on-the-go.

## Alignment with Product Vision

These features align with the platform's core goals:
- **Administrative Control**: User-level price overrides enable flexible pricing strategies for different customer tiers
- **Integration Excellence**: Business scenario integration leverages the full capabilities of the 985Proxy API
- **Mobile-First Approach**: Responsive design improvements ensure the platform works seamlessly across all devices

## Requirements

### Requirement 1: Business Scenario Selector Integration

**User Story:** As a user purchasing static proxies, I want to filter IPs by business scenario (e.g., TikTok, Instagram, E-commerce), so that I can select proxies optimized for my specific use case.

#### Acceptance Criteria

1. WHEN user navigates to Static Proxy Purchase page THEN system SHALL display a "业务场景" (Business Scenario) selector
2. WHEN user selects a business scenario THEN system SHALL call `GET /res_static/inventory` with `purpose_web` parameter
3. WHEN inventory is filtered by scenario THEN system SHALL display only IP options matching the selected business scenario
4. IF no scenario is selected THEN system SHALL display all available IPs (current behavior)
5. WHEN user selects "全部场景" (All Scenarios) THEN system SHALL reset the filter and show all IPs

### Requirement 2: User-Level Price Override Management

**User Story:** As an administrator, I want to set custom prices for individual users, so that I can offer different pricing tiers to resellers and enterprise clients.

#### Acceptance Criteria

1. WHEN administrator views User Management page THEN system SHALL display a "价格覆盖" (Price Override) button for each user
2. WHEN administrator clicks "价格覆盖" button THEN system SHALL open a modal dialog displaying the 985Proxy IP pool
3. WHEN modal opens THEN system SHALL fetch `GET /api/v1/price/user-ip-pool/:userId` and display IPs as cards (similar to Price Override Management page)
4. WHEN administrator modifies a price for a region THEN system SHALL track the change locally
5. WHEN administrator clicks "Save" THEN system SHALL call `POST /api/v1/price/user-overrides/:userId/batch` with all changes
6. IF user has custom pricing THEN system SHALL use user-specific prices when calculating purchase costs
7. IF user has no custom pricing THEN system SHALL fall back to global price overrides or base prices

### Requirement 3: Mobile Responsive Improvements

**User Story:** As a mobile user, I want to access all platform features on my smartphone, so that I can manage my proxies while traveling or away from my desktop.

#### Acceptance Criteria

1. WHEN user accesses platform on mobile device (viewport < 768px) THEN system SHALL apply responsive CSS classes to all pages
2. WHEN on mobile THEN system SHALL:
   - Stack form elements vertically
   - Make tables horizontally scrollable
   - Enlarge touch targets to minimum 44x44px
   - Hide non-essential columns in tables
   - Display hamburger menu for navigation
3. WHEN user interacts with forms on mobile THEN system SHALL provide appropriate input types (tel, email, number)
4. WHEN user views data tables on mobile THEN system SHALL use card layout for complex data instead of tables
5. WHEN user accesses the following pages on mobile THEN system SHALL render correctly:
   - Dashboard
   - Static Proxy Purchase
   - Static Proxy Management
   - User Management (Admin)
   - Recharge Orders
   - Price Override Management (Admin)

## Non-Functional Requirements

### Code Architecture and Modularity
- **Single Responsibility Principle**: Each component focuses on a single feature
- **Modular Design**: Reuse existing modal components (e.g., PriceOverrides.vue patterns)
- **Dependency Management**: Use existing API services, avoid creating new axios instances
- **Clear Interfaces**: Define TypeScript interfaces for user price override data structures

### Performance
- Business scenario filtering must complete within 500ms
- Price override modal must load IP pool within 2 seconds
- Mobile responsive transitions must be smooth (60fps)
- Minimize bundle size by code-splitting modal components

### Security
- User price override API must require admin role authentication
- Validate all price inputs on both frontend and backend
- Sanitize business scenario parameters to prevent injection

### Reliability
- Handle 985Proxy API failures gracefully with user-friendly error messages
- Cache business scenario list to avoid repeated API calls
- Persist user price overrides to database with transaction safety

### Usability
- Business scenario selector should integrate seamlessly with existing UI
- Price override modal should follow the same card-based layout as global price management
- Mobile UI should be touch-friendly with appropriate spacing
- All interactive elements should have clear visual feedback







