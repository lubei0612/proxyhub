# Environment Variables Documentation

This document explains all environment variables required and optional for ProxyHub.

## Table of Contents

- [Critical Security Variables](#critical-security-variables)
- [Database Configuration](#database-configuration)
- [API Integration](#api-integration)
- [Email Services](#email-services)
- [Optional Services](#optional-services)
- [Production Deployment](#production-deployment)

## Critical Security Variables

### JWT_SECRET (Required)

**Purpose**: Secret key for signing JSON Web Tokens

**Requirements**:
- Minimum 32 characters
- Must be randomly generated
- Never commit to version control

**How to Generate**:
```bash
# Using OpenSSL (recommended)
openssl rand -base64 48

# Using Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

**Example**:
```env
JWT_SECRET=8vZ3kL9mN2pQ5rT7wY1xC4bV6nM8pR0sA3dF5gH7jK9l
```

### JWT_EXPIRES_IN

**Purpose**: Access token expiration time

**Default**: `2h`

**Options**: `15m`, `1h`, `2h`, `24h`, etc.

### JWT_REFRESH_EXPIRES_IN

**Purpose**: Refresh token expiration time

**Default**: `7d`

**Options**: `1d`, `7d`, `30d`, etc.

## Database Configuration

### DATABASE_HOST (Required)

**Purpose**: PostgreSQL server hostname

**Examples**:
- `localhost` (development)
- `db` (Docker Compose service name)
- `your-db.amazonaws.com` (AWS RDS)

### DATABASE_PORT

**Purpose**: PostgreSQL server port

**Default**: `5432`

### DATABASE_USER (Required)

**Purpose**: PostgreSQL username

**Security**: Use strong password, avoid default usernames in production

### DATABASE_PASSWORD (Required)

**Purpose**: PostgreSQL password

**Security**: 
- Use strong passwords (16+ characters)
- Include uppercase, lowercase, numbers, symbols
- Never use default passwords in production

### DATABASE_NAME (Required)

**Purpose**: Database name

**Default**: `proxyhub`

### DATABASE_SYNC

**Purpose**: Auto-sync database schema (TypeORM feature)

**Values**:
- `true`: Auto-sync schema (⚠️ development only)
- `false`: Use migrations (✅ production recommended)

**⚠️ Warning**: NEVER use `true` in production - it can cause data loss!

## API Integration

### PROXY_985_API_KEY (Required)

**Purpose**: API key for 985Proxy service

**Format**: `ne_xxxxxxxx-base64EncodedString==`

**How to Obtain**:
1. Sign up at [985Proxy](https://www.985proxy.com)
2. Navigate to API Settings
3. Generate or copy API Key

### PROXY_985_BASE_URL

**Purpose**: 985Proxy API endpoint

**Default**: `https://open-api.985proxy.com`

**Note**: Usually no need to change

### PROXY_985_ZONE (Required)

**Purpose**: Your 985Proxy zone/channel ID

**Format**: Alphanumeric string (e.g., `6jd4ftbl7kv3`)

**How to Find**:
1. Log in to 985Proxy dashboard
2. Go to "Zones" or "Channels"
3. Copy your Zone ID

### PROXY_985_TEST_MODE

**Purpose**: Enable test mode (no real charges)

**Values**:
- `false`: Production mode (⚠️ real charges apply)
- `true`: Test mode (mock responses, no charges)

**⚠️ Warning**: Always set to `false` in production!

## Email Services

### Primary Email Service

#### MAIL_HOST (Required)

**Purpose**: SMTP server hostname

**Common Values**:
- Outlook: `smtp.office365.com`
- Gmail: `smtp.gmail.com`
- SendGrid: `smtp.sendgrid.net`
- AWS SES: `email-smtp.us-east-1.amazonaws.com`

#### MAIL_PORT

**Purpose**: SMTP port

**Common Values**:
- `587`: TLS (recommended)
- `465`: SSL
- `25`: Unencrypted (not recommended)

#### MAIL_USER (Required)

**Purpose**: SMTP authentication username (usually email address)

#### MAIL_PASSWORD (Required)

**Purpose**: SMTP authentication password

**⚠️ Important**: 
- For Gmail: Use "App Password", not account password
- For Outlook: Use account password or app-specific password
- See [Gmail SMTP Setup Guide](./GMAIL-SMTP-SETUP.md)

#### MAIL_FROM

**Purpose**: Default "From" address for emails

**Format**: `Display Name <email@example.com>`

**Example**: `ProxyHub <noreply@proxyhub.com>`

### Backup Email Service

Same as primary, but with `_BACKUP` suffix:
- `MAIL_HOST_BACKUP`
- `MAIL_PORT_BACKUP`
- `MAIL_USER_BACKUP`
- `MAIL_PASSWORD_BACKUP`

**Purpose**: Automatic fallback if primary email fails

## Optional Services

### Telegram Bot

#### TELEGRAM_BOT_TOKEN

**Purpose**: Telegram Bot API token

**How to Obtain**:
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command
3. Follow instructions
4. Copy the token

**Format**: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

#### TELEGRAM_BOT_USERNAME

**Purpose**: Your bot's username

**Format**: `YourBot_bot` (must end with `_bot`)

**Note**: If not using Telegram, comment out these variables to avoid 404 errors in logs.

## Production Deployment

### CORS_ORIGINS (Required in Production)

**Purpose**: Allowed origins for Cross-Origin Resource Sharing

**Format**: Comma-separated list of URLs (no spaces)

**Example**:
```env
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

**⚠️ Security**: 
- NEVER use `*` (allows all origins)
- Include only your actual frontend domains
- Use HTTPS in production

### NODE_ENV (Required)

**Purpose**: Application environment

**Values**:
- `development`: Development mode (verbose logging, localhost CORS)
- `production`: Production mode (secure settings, restricted CORS)
- `test`: Test mode (for automated testing)

### FRONTEND_URL

**Purpose**: Frontend application URL (for email links)

**Examples**:
- Development: `http://localhost:8080`
- Production: `https://app.yourdomain.com`

### LOG_LEVEL

**Purpose**: Logging verbosity

**Options** (most to least verbose):
- `verbose`: All logs including debug
- `debug`: Debug and higher
- `info`: General information (recommended)
- `warn`: Warnings and errors only
- `error`: Errors only

**Recommendation**: Use `info` in production, `debug` in development

## Security Best Practices

1. **Never Commit Secrets**: Use `.env` file (gitignored)
2. **Rotate Regularly**: Change JWT_SECRET and API keys periodically
3. **Use Strong Passwords**: 16+ characters, mixed case, symbols
4. **Limit Access**: Use environment-specific credentials
5. **Monitor Logs**: Check for unauthorized access attempts
6. **Use HTTPS**: Always use HTTPS in production
7. **Backup Configs**: Store production configs securely (encrypted vault)

## Troubleshooting

### Application Won't Start

**Error**: `JWT_SECRET is required but not set`

**Solution**: Set JWT_SECRET with at least 32 characters

---

**Error**: `PROXY_985_API_KEY is required but not set`

**Solution**: Obtain API key from 985Proxy dashboard and set in .env

---

**Error**: `Database connection failed`

**Solution**: Verify DATABASE_* variables and ensure PostgreSQL is running

---

### Email Not Sending

**Error**: `Authentication failed`

**Solution**: 
- Gmail: Use App Password, not account password
- Verify MAIL_USER and MAIL_PASSWORD are correct
- Check MAIL_HOST and MAIL_PORT

---

**Error**: `Connection timeout`

**Solution**:
- Check firewall allows outbound connections on port 587/465
- Verify MAIL_HOST is correct
- Try backup email service

---

### CORS Errors in Production

**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**:
- Set CORS_ORIGINS with your frontend domain
- Ensure NODE_ENV is set to `production`
- Format: `CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com`

## Examples

### Development Environment

```env
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
JWT_SECRET=dev_secret_at_least_32_chars_long
PROXY_985_TEST_MODE=true
LOG_LEVEL=debug
```

### Production Environment

```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=production-db.example.com
JWT_SECRET=<strong-random-48-char-secret>
PROXY_985_TEST_MODE=false
CORS_ORIGINS=https://proxyhub.com,https://app.proxyhub.com
LOG_LEVEL=info
DATABASE_SYNC=false
```

## Need Help?

- Check logs: Look for specific error messages
- Review [Security Migration Guide](./SECURITY_MIGRATION_GUIDE.md)
- Verify all required variables are set
- Ensure values meet minimum requirements (length, format)

