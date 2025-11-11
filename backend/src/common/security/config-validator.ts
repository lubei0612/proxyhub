import * as Joi from 'joi';
import { Logger } from '@nestjs/common';
import { environmentSchema, optionalConfigWarnings } from './validation-schemas';

/**
 * ConfigValidator
 * 
 * Validates environment configuration before application startup.
 * Ensures all critical configuration is present and properly formatted.
 * 
 * Features:
 * - Validates required configuration (Database, Redis, JWT, API keys)
 * - Enforces security requirements (JWT_SECRET length, etc.)
 * - Logs warnings for optional missing configuration
 * - Prevents application startup on critical validation failures
 */
export class ConfigValidator {
  private static readonly logger = new Logger('ConfigValidator');

  /**
   * Validate the current environment configuration
   * @throws {Error} If critical validation fails
   */
  static validateConfig(): void {
    this.logger.log('🔍 Validating environment configuration...');

    const { error, value, warning } = environmentSchema.validate(
      process.env,
      {
        abortEarly: false, // Collect all errors, not just first
        allowUnknown: true, // Allow extra env vars
      },
    );

    // Critical validation failure - application cannot start
    if (error) {
      this.logger.error('❌ Configuration validation failed!');
      this.logger.error('');
      this.logger.error('The following configuration errors must be fixed:');
      this.logger.error('');

      error.details.forEach((detail, index) => {
        this.logger.error(`  ${index + 1}. ${detail.message}`);
      });

      this.logger.error('');
      this.logger.error('💡 Please check your .env file or environment variables.');
      this.logger.error(
        '💡 Refer to .env.example for required configuration.',
      );
      this.logger.error('');

      // Exit with code 1 to indicate configuration error
      process.exit(1);
    }

    // Log warnings for optional missing configuration
    this.logOptionalConfigWarnings();

    this.logger.log('✅ Environment configuration validated successfully!');
    this.logger.log('');

    // Log important configuration (non-sensitive)
    this.logConfigSummary();
  }

  /**
   * Log warnings for optional configuration that's missing
   */
  private static logOptionalConfigWarnings(): void {
    // Check email configuration
    const emailConfigMissing = optionalConfigWarnings.email.some(
      (key) => !process.env[key],
    );
    if (emailConfigMissing) {
      this.logger.warn(
        '⚠️  Email service is not fully configured. Email notifications will not work.',
      );
      this.logger.warn(
        '   Missing: ' +
          optionalConfigWarnings.email
            .filter((key) => !process.env[key])
            .join(', '),
      );
    }

    // Check backup email configuration
    const emailBackupConfigMissing = optionalConfigWarnings.emailBackup.some(
      (key) => !process.env[key],
    );
    if (emailBackupConfigMissing) {
      this.logger.warn(
        '⚠️  Backup email service is not configured. Fallback email will not work.',
      );
    }

    // Check Telegram configuration
    const telegramConfigMissing = optionalConfigWarnings.telegram.some(
      (key) => !process.env[key],
    );
    if (telegramConfigMissing) {
      this.logger.warn(
        '⚠️  Telegram bot is not configured. Telegram notifications will not work.',
      );
    }

    if (
      emailConfigMissing ||
      emailBackupConfigMissing ||
      telegramConfigMissing
    ) {
      this.logger.warn('');
    }
  }

  /**
   * Log non-sensitive configuration summary
   */
  private static logConfigSummary(): void {
    const env = process.env.NODE_ENV || 'development';
    const port = process.env.PORT || 3000;
    const apiPrefix = process.env.API_PREFIX || '/api/v1';
    const dbHost = process.env.DATABASE_HOST;
    const redisHost = process.env.REDIS_HOST;
    const testMode = process.env.PROXY_985_TEST_MODE === 'true';

    this.logger.log('📋 Configuration Summary:');
    this.logger.log(`   Environment: ${env}`);
    this.logger.log(`   Port: ${port}`);
    this.logger.log(`   API Prefix: ${apiPrefix}`);
    this.logger.log(`   Database: ${dbHost}`);
    this.logger.log(`   Redis: ${redisHost}`);
    this.logger.log(`   985Proxy Test Mode: ${testMode ? 'ON ⚠️' : 'OFF'}`);
    this.logger.log('');
  }

  /**
   * Get validated environment value
   * @param key Environment variable key
   * @returns Value or undefined if not set
   */
  static getEnv(key: string): string | undefined {
    return process.env[key];
  }

  /**
   * Get validated environment value or throw error
   * @param key Environment variable key
   * @returns Value
   * @throws {Error} If value is not set
   */
  static getEnvOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(
        `Environment variable ${key} is required but not set. Application cannot start.`,
      );
    }
    return value;
  }
}

