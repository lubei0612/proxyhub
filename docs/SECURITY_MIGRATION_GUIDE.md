# Security Hardening Migration Guide

This guide walks you through migrating your ProxyHub installation to the security-hardened version.

## Overview

The security hardening includes:
- ✅ Configuration validation on startup
- ✅ Strong password requirements
- ✅ Redis-backed distributed rate limiting
- ✅ Global exception handling with sanitization
- ✅ Security headers (Helmet)
- ✅ Environment-aware CORS
- ✅ Input length validation

## Pre-Migration Checklist

Before starting, ensure you have:
- [ ] Backup of current `.env` file
- [ ] Backup of database
- [ ] Access to server/deployment environment
- [ ] Time window for migration (estimated 30-60 minutes)
- [ ] Rollback plan ready

## Migration Steps

### Step 1: Update Environment Variables

#### 1.1 Generate Secure JWT_SECRET

**Current** (insecure default):
```env
JWT_SECRET=proxyhub-super-secret-key-change-in-production-2025
```

**New** (minimum 32 characters, randomly generated):

```bash
# Method 1: Using OpenSSL (recommended)
openssl rand -base64 48

# Method 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Update `.env`:
```env
JWT_SECRET=<your-generated-48-character-secret>
```

#### 1.2 Configure PROXY_985_API_KEY

**Current** (hardcoded fallback):
```typescript
// OLD: Had fallback in code
this.apiKey = process.env.PROXY_985_API_KEY || 'ne_hj06qomI-...'
```

**New** (required in .env):
```env
PROXY_985_API_KEY=ne_your_actual_api_key_here
PROXY_985_ZONE=your_zone_id
```

⚠️ **Important**: Application will NOT start without these values.

#### 1.3 Configure CORS for Production

**Development**: Auto-configured for localhost (no action needed)

**Production**: Set allowed origins:
```env
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

⚠️ **Security**: Never use `*`. List specific domains only.

#### 1.4 Review All Variables

Copy from `env.example` and update:
```bash
cp env.example .env
# Then edit .env with your actual values
```

See [Environment Variables Documentation](./ENVIRONMENT_VARIABLES.md) for details on each variable.

### Step 2: Update Application Code

#### 2.1 Pull Latest Changes

```bash
git pull origin main
```

#### 2.2 Install New Dependencies

```bash
cd backend
npm install joi @types/joi helmet --save
```

#### 2.3 Rebuild Application

```bash
# Backend
cd backend
npm run build

# Frontend (if changes)
cd ../frontend
npm run build
```

### Step 3: Database Migrations

No database schema changes required for security hardening.

If you have pending migrations:
```bash
cd backend
npm run migration:run
```

### Step 4: Restart Services

#### Docker Compose

```bash
# Stop services
docker-compose down

# Rebuild with new code
docker-compose build --no-cache

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

#### PM2 (Production)

```bash
# Restart backend
pm2 restart backend

# Check logs
pm2 logs backend

# Check status
pm2 status
```

#### Systemd

```bash
# Restart service
sudo systemctl restart proxyhub

# Check status
sudo systemctl status proxyhub

# Check logs
sudo journalctl -u proxyhub -f
```

### Step 5: Verify Configuration

#### 5.1 Check Application Startup

Look for these log messages:

```
✅ Environment configuration validated successfully!
📋 Configuration Summary:
   Environment: production
   Port: 3000
   Database: your-db-host
   Redis: your-redis-host
   985Proxy Test Mode: OFF
```

#### 5.2 Test Rate Limiting

```bash
# Should succeed for first 5 attempts
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# 6th attempt should return 429 Too Many Requests
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
```

Expected response:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

#### 5.3 Test Password Validation

```bash
# Weak password - should fail
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "nickname":"Test User"
  }'
```

Expected error:
```json
{
  "statusCode": 400,
  "message": ["密码必须包含至少一个大写字母"]
}
```

#### 5.4 Test Security Headers

```bash
# Check security headers
curl -I http://localhost:3000/api/v1/auth/login
```

Expected headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Step 6: Update User Passwords (Optional but Recommended)

Existing users with weak passwords should update them:

```sql
-- Identify users with potentially weak passwords
-- (They'll need to change passwords on next login if strong validation is enforced)

-- Option 1: Force password reset for all users
UPDATE users SET password_reset_required = true;

-- Option 2: Notify users via email to update passwords
-- (Implement in your notification system)
```

## Rollback Procedure

If issues occur during migration:

### Quick Rollback

1. **Restore previous code**:
```bash
git checkout <previous-commit-hash>
npm install
npm run build
```

2. **Restore previous .env**:
```bash
cp .env.backup .env
```

3. **Restart services**:
```bash
# Docker
docker-compose restart

# PM2
pm2 restart all

# Systemd
sudo systemctl restart proxyhub
```

### Emergency Rollback (Docker)

```bash
# Stop current containers
docker-compose down

# Restore from previous image
docker-compose pull proxyhub-backend:previous-tag
docker-compose up -d
```

## Troubleshooting

### Application Won't Start

#### Error: "JWT_SECRET is required"

**Cause**: JWT_SECRET not set or too short

**Solution**:
```bash
# Generate new secret
openssl rand -base64 48

# Add to .env
echo "JWT_SECRET=<generated-secret>" >> .env
```

#### Error: "PROXY_985_API_KEY is required"

**Cause**: 985Proxy API key not configured

**Solution**:
```env
# Add to .env
PROXY_985_API_KEY=your_actual_api_key
PROXY_985_ZONE=your_zone_id
```

#### Error: "Database connection failed"

**Cause**: Database credentials incorrect

**Solution**:
1. Verify DATABASE_* variables in .env
2. Test database connection:
```bash
psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME
```

### Rate Limiting Issues

#### Users Getting 429 Errors Frequently

**Cause**: Rate limits too strict or Redis not working

**Solution**:

1. **Check Redis**:
```bash
# Test Redis connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
# Expected: PONG
```

2. **Adjust Rate Limits** (if needed):
Edit `backend/src/app.module.ts`:
```typescript
throttlers: [
  {
    ttl: 60000,  // 60 seconds
    limit: 200,  // Increase from 100 to 200
  },
],
```

### CORS Errors in Production

#### Error: "Access blocked by CORS policy"

**Cause**: CORS_ORIGINS not configured or incorrect

**Solution**:
```env
# Set correct origins in .env
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Verify NODE_ENV
NODE_ENV=production
```

Test:
```bash
curl -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:3000/api/v1/auth/login
```

### Password Validation Issues

#### Users Can't Register with Current Passwords

**Cause**: Existing users have passwords that don't meet new requirements

**Options**:

1. **Grandfather existing users** (allow weak passwords for existing accounts):
   - Only enforce on NEW registrations and password changes
   - Already implemented in code

2. **Force password reset**:
```sql
UPDATE users 
SET password_reset_required = true
WHERE created_at < '2025-11-10';
```

3. **Temporary bypass** (NOT recommended for production):
```typescript
// In backend/src/common/security/password-validator.ts
// Comment out weak password check temporarily
// if (isWeakPassword(password)) {
//   errors.push('该密码过于常见，请使用更强的密码');
// }
```

## Performance Considerations

### Redis Memory Usage

Rate limiting uses Redis. Monitor memory:
```bash
redis-cli info memory
```

**Typical usage**: ~10MB per 10,000 active users

### Request Overhead

Security features add minimal overhead:
- Validation: <1ms per request
- Rate limiting: <5ms per request
- Exception filtering: <2ms per exception
- Total: <10ms per request

Monitor with:
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/v1/auth/login
```

## Post-Migration Checklist

After successful migration:
- [ ] All services are running
- [ ] Application logs show no errors
- [ ] Users can register with strong passwords
- [ ] Rate limiting is working (test with curl)
- [ ] Security headers are present (check with curl -I)
- [ ] CORS is configured correctly (frontend can connect)
- [ ] Redis is connected and functioning
- [ ] 985Proxy integration still works
- [ ] Email notifications still work
- [ ] Old weak passwords still allow login (grandfather clause)
- [ ] New passwords must be strong

## Monitoring

### Key Metrics to Monitor

1. **Rate Limit Violations**:
```bash
# Check logs for rate limit hits
grep "ThrottlerException" logs/app.log | wc -l
```

2. **Failed Login Attempts**:
```bash
# Check for potential brute force
grep "UnauthorizedException.*login" logs/app.log
```

3. **Configuration Errors**:
```bash
# Check startup logs
grep "Configuration validation failed" logs/app.log
```

### Recommended Alerts

Set up alerts for:
- High rate of 429 responses (>1% of requests)
- Configuration validation failures on restart
- Unusual spike in failed login attempts
- Redis connection errors

## Security Best Practices Going Forward

1. **Rotate Secrets Regularly**:
   - Change JWT_SECRET every 90 days
   - Rotate API keys annually

2. **Monitor Logs**:
   - Review security logs weekly
   - Set up automated alerts

3. **Keep Dependencies Updated**:
```bash
cd backend
npm audit
npm update
```

4. **Regular Security Audits**:
   - Review rate limiting effectiveness
   - Check for new security advisories
   - Test authentication flows

5. **Backup Configuration**:
```bash
# Backup .env securely (encrypted)
gpg --encrypt --recipient ops@company.com .env
```

## Need Help?

- Check [Environment Variables Documentation](./ENVIRONMENT_VARIABLES.md)
- Review application logs: `docker-compose logs -f` or `pm2 logs`
- Test configuration: See "Step 5: Verify Configuration" above
- Contact support with:
  - Error messages from logs
  - Your environment (NODE_ENV, deployment method)
  - Steps that reproduce the issue

## Summary

✅ **What Changed**:
- Configuration validation on startup
- No more hardcoded secrets
- Strong password requirements
- Redis-based rate limiting
- Global exception handling
- Security headers with Helmet
- Environment-aware CORS

✅ **What to Do**:
1. Update .env with secure values
2. Install new dependencies
3. Restart services
4. Verify functionality
5. Monitor logs

✅ **Migration Time**: 30-60 minutes

✅ **Downtime**: 5-10 minutes (during restart)

Good luck with your migration! 🎉

