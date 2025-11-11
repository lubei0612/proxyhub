# Tasks Document

## Phase 1: Foundation (P0 - Critical Security Fixes)

- [x] 1. Create ConfigValidator utility with schema validation
  - Files: `backend/src/common/security/config-validator.ts`, `backend/src/common/security/validation-schemas.ts`
  - Create ConfigValidator class with Joi schema validation for all environment variables
  - Validate JWT_SECRET minimum length (32 chars), required database config, API keys
  - Add graceful warnings for optional missing vars (email, Telegram)
  - _Leverage: `@nestjs/config (ConfigService)`, `joi` package_
  - _Requirements: R1 (Remove Hardcoded Secrets), R10 (Environment Validation)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Engineer with expertise in configuration management and validation | Task: Create a comprehensive ConfigValidator utility following requirements R1 and R10. Implement Joi schema validation for all environment variables, ensuring JWT_SECRET has minimum 32 character length, all required database configs are present, and API keys are validated. Handle optional variables gracefully with warnings. Files: backend/src/common/security/config-validator.ts and backend/src/common/security/validation-schemas.ts | Restrictions: Do not use default values for security-critical variables (JWT_SECRET, API keys), must throw clear error messages indicating which variable is missing or invalid, process must exit with code 1 on critical validation failure, do not bypass validation in any environment | Leverage: Existing @nestjs/config ConfigService, joi package for schema validation | Success: Application refuses to start without required environment variables, JWT_SECRET length is enforced, clear error messages guide operators to fix configuration issues, optional variables log warnings only. After implementation: Edit tasks.md to mark this task as [-] in progress, then implement the code. After completion, use log-implementation tool with detailed artifacts (functions, classes, validation schemas) and mark task as [x] completed._

- [x] 2. Integrate ConfigValidator into application bootstrap
  - Files: `backend/src/main.ts`, `backend/src/app.module.ts`
  - Call ConfigValidator.validateConfig() at the very start of bootstrap() before any other initialization
  - Ensure app terminates with proper error logging if validation fails
  - Add ConfigModule configuration with validated schema
  - _Leverage: Existing ConfigModule setup in app.module.ts, ConfigValidator from task 1_
  - _Requirements: R1 (Remove Hardcoded Secrets), R10 (Environment Validation)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with expertise in NestJS application bootstrapping | Task: Integrate ConfigValidator into application startup following requirements R1 and R10. Add validation call at the very beginning of bootstrap() in main.ts, before creating the app instance. Configure ConfigModule with validated schema. Files: backend/src/main.ts, backend/src/app.module.ts | Restrictions: Validation must happen before ANY other initialization, do not catch and suppress validation errors, ensure process exits cleanly with code 1 on failure, maintain existing ConfigModule configuration | Leverage: ConfigValidator from task 1, existing ConfigModule setup | Success: Application bootstrap validates configuration first, clear error messages on missing/invalid config, process exits properly on validation failure, all existing functionality remains intact. After implementation: Edit tasks.md to mark as [-] in progress, implement, log with artifacts (integration points, bootstrap sequence), mark as [x] complete._

- [x] 3. Remove hardcoded API key from Proxy985Service
  - Files: `backend/src/modules/proxy985/proxy985.service.ts`
  - Remove default value from apiKey initialization: change `|| 'ne_hj06qomI-...'` to throw error if missing
  - Use ConfigService.getOrThrow('PROXY_985_API_KEY') instead
  - Update constructor to inject ConfigService
  - _Leverage: ConfigService from @nestjs/config_
  - _Requirements: R1 (Remove Hardcoded Secrets)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with security focus | Task: Remove hardcoded API key default value from Proxy985Service following requirement R1. Replace `process.env.PROXY_985_API_KEY || 'default...'` with ConfigService.getOrThrow() call. Inject ConfigService via constructor. Files: backend/src/modules/proxy985/proxy985.service.ts | Restrictions: Do NOT provide any default value for API key, must throw clear error if PROXY_985_API_KEY is not configured, maintain all existing functionality, do not change API client behavior | Leverage: @nestjs/config ConfigService | Success: No hardcoded API key remains in code, service throws clear error when key is missing, existing 985Proxy integration works unchanged when key is properly configured. After implementation: Mark task [-] in progress, implement, log with artifacts (modified classes, removed hardcoded values), mark [x] complete._

- [x] 4. Remove default JWT secret from JwtStrategy
  - Files: `backend/src/modules/auth/strategies/jwt.strategy.ts`, `backend/src/modules/auth/auth.module.ts`
  - Remove default value from JWT_SECRET: change `|| 'proxyhub-super-secret-key...'` to ConfigService.getOrThrow
  - Inject ConfigService into JwtStrategy constructor
  - Update JwtModule registration to use ConfigService
  - _Leverage: ConfigService, existing JwtModule configuration_
  - _Requirements: R1 (Remove Hardcoded Secrets)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Security Engineer with JWT expertise | Task: Remove hardcoded JWT secret default value from JwtStrategy following requirement R1. Replace default secret with ConfigService.getOrThrow('JWT_SECRET'). Update JwtStrategy constructor and JwtModule registration in auth.module.ts. Files: backend/src/modules/auth/strategies/jwt.strategy.ts, backend/src/modules/auth/auth.module.ts | Restrictions: Do NOT provide default value for JWT_SECRET, must throw error if not configured, maintain existing authentication flow, ensure token generation and validation still work | Leverage: ConfigService, existing JwtModule configuration | Success: No default JWT secret in code, application requires explicit JWT_SECRET configuration, authentication works correctly when properly configured. After implementation: Mark [-], implement, log with artifacts (strategy modifications, module configuration), mark [x]._

- [x] 5. Create PasswordValidator with strong password requirements
  - Files: `backend/src/common/security/password-validator.ts`, `backend/src/common/security/weak-passwords.ts`
  - Create IsStrongPassword decorator using class-validator
  - Implement validation: minLength 8, at least 1 uppercase, 1 lowercase, 1 number
  - Add weak password blocklist (123456, password, qwerty, etc.)
  - Export validatePasswordStrength() utility function
  - _Leverage: class-validator package_
  - _Requirements: R2 (Strong Password Policy)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Developer with expertise in password validation | Task: Create comprehensive password validation utility following requirement R2. Implement IsStrongPassword decorator with rules: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number. Include blocklist of common weak passwords. Files: backend/src/common/security/password-validator.ts, backend/src/common/security/weak-passwords.ts | Restrictions: Must provide specific error messages for each failed requirement, do not weaken validation rules, blocklist must include at least 100 common weak passwords, validation must be efficient (<10ms) | Leverage: class-validator decorators, existing validation framework | Success: Decorator properly validates password strength, specific error messages guide users, weak passwords are rejected, validation is fast and reliable. After implementation: Mark [-], implement, log with artifacts (functions, decorators, validation rules), mark [x]._

- [x] 6. Apply password validation to authentication DTOs
  - Files: `backend/src/modules/auth/dto/register.dto.ts`, `backend/src/modules/auth/dto/change-password.dto.ts`
  - Replace @MinLength(8) with @IsStrongPassword() decorator
  - Add @IsNotCommonPassword() if available
  - Update error messages to reflect new requirements
  - _Leverage: PasswordValidator from task 5, existing DTO structure_
  - _Requirements: R2 (Strong Password Policy)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with DTO validation expertise | Task: Apply strong password validation to authentication DTOs following requirement R2. Replace simple @MinLength(8) with @IsStrongPassword() decorator in RegisterDto and ChangePasswordDto. Files: backend/src/modules/auth/dto/register.dto.ts, backend/src/modules/auth/dto/change-password.dto.ts (create if not exists) | Restrictions: Must maintain existing DTO structure, do not break existing API contracts, ensure validation errors are user-friendly, apply to ALL password input points | Leverage: PasswordValidator from task 5, existing validation pipe | Success: All password inputs require strong passwords, clear validation messages, registration and password change flows work with new validation. After implementation: Mark [-], implement, log with artifacts (modified DTOs, applied decorators), mark [x]._

- [x] 7. Configure Redis-backed rate limiting with ThrottlerModule
  - Files: `backend/src/app.module.ts`, `backend/src/common/guards/redis-throttler-storage.ts`
  - Create RedisThrottlerStorage implementing ThrottlerStorage interface
  - Update ThrottlerModule configuration to use Redis storage
  - Configure global rate limits: 100 requests per 60 seconds
  - _Leverage: Existing Redis client in app.module.ts, @nestjs/throttler_
  - _Requirements: R3 (Rate Limiting Protection)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with Redis and rate limiting expertise | Task: Configure Redis-backed distributed rate limiting following requirement R3. Create RedisThrottlerStorage implementing ThrottlerStorage interface, integrate with existing Redis client. Update ThrottlerModule configuration. Files: backend/src/app.module.ts, backend/src/common/guards/redis-throttler-storage.ts | Restrictions: Must use existing Redis client from app.module.ts, do not create new Redis connections, ensure rate limits are distributed across instances, maintain sub-5ms overhead | Leverage: Existing Redis client, @nestjs/throttler ThrottlerModule | Success: Rate limiting uses Redis for distributed state, requests are limited globally across all server instances, minimal performance impact (<5ms per request). After implementation: Mark [-], implement, log with artifacts (classes, Redis integration, throttler config), mark [x]._

- [x] 8. Apply strict rate limiting to authentication endpoints
  - Files: `backend/src/modules/auth/auth.controller.ts`
  - Add @Throttle() decorator to login endpoint: 5 requests per 15 minutes
  - Add @Throttle() decorator to send-code endpoint: 3 requests per 60 minutes per email
  - Add @Throttle() decorator to register endpoint: 10 requests per 60 minutes
  - Log rate limit violations with IP and user context
  - _Leverage: ThrottlerGuard, Redis storage from task 7_
  - _Requirements: R3 (Rate Limiting Protection)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Engineer with API protection expertise | Task: Apply strict rate limiting to authentication endpoints following requirement R3. Add @Throttle decorators: login (5/15min), send-code (3/60min), register (10/60min). Add logging for violations. Files: backend/src/modules/auth/auth.controller.ts | Restrictions: Must not break existing authentication flow, rate limits apply per IP address, must track by email for send-code endpoint, ensure rate limit errors include retry-after information | Leverage: ThrottlerGuard from @nestjs/throttler, Redis storage from task 7 | Success: Authentication endpoints have appropriate rate limits, brute force attacks are prevented, users receive clear error messages with retry timeframes, violations are logged. After implementation: Mark [-], implement, log with artifacts (applied guards, rate limit configurations), mark [x]._

## Phase 2: Protection Layers (P1 - High Priority)

- [x] 9. Create AllExceptionsFilter with sensitive data sanitization
  - Files: `backend/src/common/filters/all-exceptions.filter.ts`, `backend/src/common/exceptions/exception-mapper.ts`
  - Create @Catch() filter implementing ExceptionFilter interface
  - Map exceptions to appropriate HTTP status codes and error responses
  - Sanitize error messages (hide stack traces in production, remove sensitive data)
  - Return standardized format: { statusCode, message, errorCode, timestamp, path }
  - _Leverage: Existing error code constants from common/constants/error-codes.ts_
  - _Requirements: R4 (Global Exception Filter)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with exception handling expertise | Task: Create comprehensive global exception filter following requirement R4. Implement AllExceptionsFilter with @Catch() decorator, map all exception types to appropriate responses, sanitize sensitive data. Files: backend/src/common/filters/all-exceptions.filter.ts, backend/src/common/exceptions/exception-mapper.ts | Restrictions: Must catch ALL exception types, hide stack traces in production environment, do not expose internal implementation details, maintain existing error code constants | Leverage: Existing error codes from common/constants/error-codes.ts | Success: All exceptions are caught and formatted consistently, sensitive data is sanitized, stack traces hidden in production, error responses are user-friendly. After implementation: Mark [-], implement, log with artifacts (filter class, exception mapper, response formats), mark [x]._

- [x] 10. Register AllExceptionsFilter globally in main.ts
  - Files: `backend/src/main.ts`
  - Register AllExceptionsFilter using app.useGlobalFilters()
  - Ensure filter is registered after ValidationPipe
  - Test that custom exceptions are properly caught and formatted
  - _Leverage: AllExceptionsFilter from task 9_
  - _Requirements: R4 (Global Exception Filter)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with NestJS application configuration expertise | Task: Register AllExceptionsFilter globally in application bootstrap following requirement R4. Add filter registration after ValidationPipe. Files: backend/src/main.ts | Restrictions: Filter must be registered globally to catch all exceptions, maintain existing middleware order, do not interfere with existing error handling, ensure filter is active for all routes | Leverage: AllExceptionsFilter from task 9, existing application bootstrap | Success: Global exception filter is active for all requests, all exceptions are caught and formatted, existing functionality remains intact, error responses are consistent. After implementation: Mark [-], implement, log with artifacts (global filter registration, bootstrap configuration), mark [x]._

- [x] 11. Add input length validation to all DTOs
  - Files: `backend/src/modules/auth/dto/*.dto.ts`, `backend/src/modules/user/dto/*.dto.ts`, `backend/src/modules/admin/dto/*.dto.ts`
  - Add @MaxLength(255) to all email fields
  - Add @MaxLength(100) to all nickname/name fields
  - Add @MaxLength(1000) to all free-text fields (descriptions, notes)
  - Add @MaxLength(500) to all address fields
  - _Leverage: class-validator @MaxLength decorator_
  - _Requirements: R5 (Input Length Validation)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with data validation expertise | Task: Add maximum length validation to all DTOs following requirement R5. Apply @MaxLength decorators: email (255), nickname (100), free-text (1000), addresses (500). Files: backend/src/modules/auth/dto/*.dto.ts, backend/src/modules/user/dto/*.dto.ts, backend/src/modules/admin/dto/*.dto.ts | Restrictions: Must not break existing API contracts, validation must apply to ALL input fields, error messages must specify which field and limit, maintain backward compatibility | Leverage: class-validator @MaxLength decorator, existing validation pipeline | Success: All text inputs have appropriate length limits, database overflow attacks are prevented, validation errors are clear and specific. After implementation: Mark [-], implement, log with artifacts (modified DTOs, applied length validators), mark [x]._

- [x] 12. Create TransactionWrapper utility for safe database operations
  - Files: `backend/src/common/database/transaction-wrapper.ts`, `backend/src/common/database/transaction-options.ts`
  - Create TransactionWrapper class with execute() method
  - Support configurable isolation levels (READ_COMMITTED, SERIALIZABLE)
  - Auto-rollback on errors with detailed logging
  - Return typed results from transaction
  - _Leverage: TypeORM DataSource and EntityManager_
  - _Requirements: R6 (Database Transaction Safety)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with database transaction expertise | Task: Create comprehensive transaction wrapper utility following requirement R6. Implement TransactionWrapper class with automatic rollback, configurable isolation levels, error logging. Files: backend/src/common/database/transaction-wrapper.ts, backend/src/common/database/transaction-options.ts | Restrictions: Must use existing TypeORM DataSource, automatically rollback on any error, support configurable isolation levels, add <50ms overhead, log transaction context on errors | Leverage: TypeORM DataSource and EntityManager | Success: Transaction wrapper simplifies safe database operations, automatic rollback on errors, configurable isolation levels work correctly, minimal performance overhead. After implementation: Mark [-], implement, log with artifacts (classes, transaction utilities, error handling), mark [x]._

- [x] 13. Apply TransactionWrapper to user balance operations
  - Files: `backend/src/modules/user/user.service.ts`, `backend/src/modules/billing/billing.service.ts`
  - Wrap balance deduction operations in TransactionWrapper.execute()
  - Use SERIALIZABLE isolation level for balance operations
  - Add balance checks within transaction (SELECT FOR UPDATE pattern)
  - Ensure proxy purchase and balance deduction are atomic
  - _Leverage: TransactionWrapper from task 12, existing balance logic_
  - _Requirements: R6 (Database Transaction Safety)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with financial transaction expertise | Task: Apply transaction safety to balance operations following requirement R6. Wrap balance deductions in TransactionWrapper with SERIALIZABLE isolation, implement SELECT FOR UPDATE pattern. Files: backend/src/modules/user/user.service.ts, backend/src/modules/billing/billing.service.ts | Restrictions: Must prevent race conditions, ensure balance never goes negative, maintain atomicity between proxy purchase and payment, add row-level locking, maintain existing API contracts | Leverage: TransactionWrapper from task 12, existing balance deduction logic | Success: Concurrent balance operations are safe, no race conditions occur, balance accuracy is guaranteed, operations are atomic. After implementation: Mark [-], implement, log with artifacts (transactional operations, isolation levels, locking), mark [x]._

- [x] 14. Configure Helmet middleware for security headers
  - Files: `backend/src/main.ts`, `backend/src/common/security/helmet-config.ts`
  - Install helmet package: `npm install helmet`
  - Create HelmetConfigurer.getConfig() with secure defaults
  - Apply helmet middleware in main.ts before CORS
  - Configure: X-Frame-Options, X-Content-Type-Options, HSTS, disable X-Powered-By
  - _Leverage: helmet package_
  - _Requirements: R8 (Security Headers and CORS)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Engineer with web security expertise | Task: Configure Helmet middleware for security headers following requirement R8. Install helmet, create configuration, apply in main.ts. Set secure headers: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), HSTS, disable X-Powered-By. Files: backend/src/main.ts, backend/src/common/security/helmet-config.ts | Restrictions: Must apply helmet before CORS configuration, use secure defaults appropriate for API usage, do not break existing CORS functionality, ensure CSP allows API operations | Leverage: helmet npm package | Success: Security headers are properly set on all responses, X-Powered-By is removed, HSTS is enabled, content type sniffing is prevented. After implementation: Mark [-], implement, log with artifacts (helmet configuration, applied middleware), mark [x]._

- [x] 15. Create environment-based CORS configuration
  - Files: `backend/src/main.ts`, `backend/src/common/security/cors-config.ts`
  - Create EnhancedCorsOptions.getOptions() that reads CORS_ORIGINS from env
  - Development: Allow localhost origins (existing behavior)
  - Production: Read comma-separated CORS_ORIGINS environment variable
  - Add origin validation to prevent configuration errors
  - _Leverage: Existing CORS setup in main.ts, ConfigService_
  - _Requirements: R8 (Security Headers and CORS)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with CORS and security configuration expertise | Task: Create environment-based CORS configuration following requirement R8. Implement EnhancedCorsOptions that uses env vars in production, localhost in dev. Add origin validation. Files: backend/src/main.ts, backend/src/common/security/cors-config.ts | Restrictions: Must not break existing CORS behavior in development, production must require explicit CORS_ORIGINS configuration, validate origin format, maintain credentials support for authenticated endpoints | Leverage: Existing CORS setup, ConfigService for environment detection | Success: CORS is environment-aware, production requires explicit configuration, development remains convenient, origin validation prevents misconfigurations. After implementation: Mark [-], implement, log with artifacts (CORS configuration, environment handling), mark [x]._

## Phase 3: Observability & Quality (P2 - Technical Debt)

- [x] 16. Create LoggingSanitizer utility for sensitive data removal
  - Files: `backend/src/common/security/logging-sanitizer.ts`, `backend/src/common/security/sensitive-fields.ts`
  - Create LoggingSanitizer.sanitize() method that recursively scans objects
  - Redact sensitive fields: password, token, apiKey, creditCard, secret, authorization
  - Mask JWT tokens (show only last 4 characters)
  - Export list of sensitive field names for configuration
  - _Leverage: None (pure utility)_
  - _Requirements: R9 (Sensitive Data Logging Filter)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Developer with logging and data sanitization expertise | Task: Create comprehensive logging sanitizer following requirement R9. Implement recursive object sanitization, redact sensitive fields, mask tokens. Files: backend/src/common/security/logging-sanitizer.ts, backend/src/common/security/sensitive-fields.ts | Restrictions: Must handle nested objects and arrays, sanitization must be non-destructive (return copy), add <2ms overhead per log, handle circular references, mask but don't completely remove JWT tokens | Leverage: None - pure TypeScript utility | Success: Sensitive data is properly redacted from logs, JWT tokens are masked, nested objects are handled, no performance issues. After implementation: Mark [-], implement, log with artifacts (sanitizer functions, field lists, masking strategies), mark [x]._

- [x] 17. Integrate LoggingSanitizer into NestJS Logger
  - Files: `backend/src/common/logger/sanitized-logger.service.ts`
  - Create SanitizedLogger extending NestJS Logger
  - Override log(), error(), warn(), debug() methods to sanitize data
  - Automatically sanitize all logged objects and error messages
  - Export as injectable service for dependency injection
  - _Leverage: NestJS Logger, LoggingSanitizer from task 16_
  - _Requirements: R9 (Sensitive Data Logging Filter)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with NestJS logging expertise | Task: Create SanitizedLogger service that integrates sanitization into logging following requirement R9. Extend NestJS Logger, override methods to use LoggingSanitizer. Files: backend/src/common/logger/sanitized-logger.service.ts | Restrictions: Must maintain same Logger API, sanitize all object parameters, preserve log levels and formatting, do not sanitize simple strings unless they contain sensitive patterns, maintain performance | Leverage: NestJS Logger class, LoggingSanitizer from task 16 | Success: All logs are automatically sanitized, sensitive data never appears in logs, Logger API remains compatible, no breaking changes. After implementation: Mark [-], implement, log with artifacts (logger service, integration with sanitizer), mark [x]._

- [x] 18. Write unit tests for security utilities
  - Files: `backend/src/common/security/__tests__/config-validator.spec.ts`, `backend/src/common/security/__tests__/password-validator.spec.ts`, `backend/src/common/security/__tests__/logging-sanitizer.spec.ts`
  - ConfigValidator tests: valid config, missing JWT_SECRET, weak JWT_SECRET, missing database config
  - PasswordValidator tests: strong password accepted, weak passwords rejected, specific error messages
  - LoggingSanitizer tests: password redaction, JWT masking, nested objects, circular references
  - Target: 80%+ coverage for security module
  - _Leverage: Jest testing framework, existing test patterns_
  - _Requirements: R7 (Unit Tests)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with unit testing expertise | Task: Create comprehensive unit tests for security utilities following requirement R7. Write tests for ConfigValidator, PasswordValidator, LoggingSanitizer covering success and failure scenarios. Files: backend/src/common/security/__tests__/*.spec.ts | Restrictions: Must test both positive and negative cases, achieve 80%+ code coverage for security module, use proper mocking for external dependencies, tests must be isolated and repeatable | Leverage: Jest framework, existing test utilities | Success: All security utilities have comprehensive test coverage, edge cases are covered, tests run fast and reliably, 80%+ coverage achieved. After implementation: Mark [-], implement, log with artifacts (test files, coverage reports, test scenarios), mark [x]._

- [x] 19. Write unit tests for exception filter and guards
  - Files: `backend/src/common/filters/__tests__/all-exceptions.filter.spec.ts`, `backend/src/common/guards/__tests__/redis-throttler-storage.spec.ts`
  - AllExceptionsFilter tests: HttpException formatting, generic Error handling, stack trace hiding in production
  - RedisThrottlerStorage tests: rate limit enforcement, TTL expiry, distributed state management
  - Mock Redis client and exception contexts
  - _Leverage: Jest, NestJS testing utilities_
  - _Requirements: R7 (Unit Tests)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with NestJS testing expertise | Task: Create unit tests for exception filter and rate limiting following requirement R7. Test AllExceptionsFilter exception handling and RedisThrottlerStorage rate limiting. Files: backend/src/common/filters/__tests__/all-exceptions.filter.spec.ts, backend/src/common/guards/__tests__/redis-throttler-storage.spec.ts | Restrictions: Must mock Redis client and execution contexts, test all exception types, verify rate limit state management, ensure tests don't depend on external services | Leverage: Jest, @nestjs/testing utilities, Redis mocks | Success: Exception filter handles all error types correctly, rate limiting logic is verified, Redis integration is properly tested with mocks. After implementation: Mark [-], implement, log with artifacts (test files, mock strategies, test coverage), mark [x]._

- [x] 20. Write integration tests for authentication with rate limiting
  - Files: `backend/test/auth.e2e-spec.ts`
  - Test complete authentication flow: registration with strong password requirement
  - Test login rate limiting: verify 429 response after 5 failed attempts
  - Test verification code rate limiting: verify 429 after 3 requests
  - Test transaction safety: concurrent balance operations
  - _Leverage: Supertest for HTTP testing, existing test database setup_
  - _Requirements: R7 (Unit Tests)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with end-to-end testing expertise | Task: Create integration tests for authentication flows with security features following requirement R7. Test registration with password validation, login rate limiting, verification code limits, transaction safety. Files: backend/test/auth.e2e-spec.ts | Restrictions: Must use test database, clean up test data after each test, tests must be idempotent and isolated, use realistic scenarios, verify actual HTTP responses and rate limit headers | Leverage: Supertest for HTTP requests, existing test database setup | Success: All security features are tested in realistic scenarios, rate limiting is verified end-to-end, password validation is confirmed, transaction safety is validated. After implementation: Mark [-], implement, log with artifacts (test scenarios, integration test patterns), mark [x]._

## Post-Implementation Tasks

- [x] 21. Update .env.example with all required security variables
  - Files: `.env.example`, `docs/ENVIRONMENT_VARIABLES.md`
  - Add comprehensive comments for each security variable
  - Document: JWT_SECRET requirements (32+ chars), API key formats, CORS_ORIGINS format
  - Add example values (clearly marked as examples, not for production)
  - Create documentation file explaining each variable's purpose
  - _Leverage: Existing .env.example_
  - _Requirements: R1 (Remove Hardcoded Secrets), R10 (Environment Validation)_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer with documentation expertise | Task: Update environment variable templates and documentation following requirements R1 and R10. Add comprehensive .env.example with comments, create detailed documentation for each security variable. Files: .env.example, docs/ENVIRONMENT_VARIABLES.md | Restrictions: Must NOT include real secrets even as examples, clearly mark all values as examples, document requirements for each variable (length, format), make it easy for new developers to configure | Leverage: Existing .env.example structure | Success: .env.example is comprehensive and well-documented, every required variable is listed, developers can easily configure new environments, security requirements are clear. After implementation: Mark [-], implement, log with artifacts (documentation files, example configurations), mark [x]._

- [x] 22. Create security configuration migration guide
  - Files: `docs/SECURITY_MIGRATION_GUIDE.md`
  - Document step-by-step migration from current setup to hardened version
  - Include: generating secure JWT_SECRET, configuring rate limits, setting up CORS
  - Add rollback procedures in case of issues
  - Provide troubleshooting section for common configuration errors
  - _Leverage: All previous implementation tasks_
  - _Requirements: All_
  - _Prompt: Implement the task for spec security-hardening, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with security expertise | Task: Create comprehensive migration guide for security hardening covering all requirements. Document migration steps, configuration generation, rollback procedures, troubleshooting. Files: docs/SECURITY_MIGRATION_GUIDE.md | Restrictions: Must cover all security changes, provide concrete examples, include rollback plan, address common pitfalls, make it accessible for DevOps teams | Leverage: Knowledge from all previous implementation tasks | Success: Migration guide is complete and clear, operators can follow it step-by-step, rollback procedures are documented, troubleshooting covers common issues. After implementation: Mark [-], implement, log with artifacts (documentation, migration steps, troubleshooting guides), mark [x]._

## Task Summary

**Total Tasks**: 22

**By Priority:**
- P0 (Critical): Tasks 1-8 (8 tasks)
- P1 (High): Tasks 9-15 (7 tasks)
- P2 (Technical Debt): Tasks 16-20 (5 tasks)
- Documentation: Tasks 21-22 (2 tasks)

**Estimated Total Effort**: 45-50 hours

**Dependencies:**
- Tasks 1-2 must be completed before task 3-4
- Task 5 must be completed before task 6
- Task 7 must be completed before task 8
- Task 9 must be completed before task 10
- Task 12 must be completed before task 13
- Task 16 must be completed before task 17
- All implementation tasks should be completed before tasks 21-22

