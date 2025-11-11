import * as Joi from 'joi';

/**
 * Joi schema for environment variable validation
 * Ensures all critical configuration is properly set before application starts
 */
export const environmentSchema = Joi.object({
  // Node Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Server Configuration
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('/api/v1'),

  // Database Configuration (Required)
  DATABASE_HOST: Joi.string().required().messages({
    'any.required': 'DATABASE_HOST is required. Please set this environment variable.',
    'string.empty': 'DATABASE_HOST cannot be empty.',
  }),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USER: Joi.string().required().messages({
    'any.required': 'DATABASE_USER is required. Please set this environment variable.',
    'string.empty': 'DATABASE_USER cannot be empty.',
  }),
  DATABASE_PASSWORD: Joi.string().required().messages({
    'any.required': 'DATABASE_PASSWORD is required. Please set this environment variable.',
    'string.empty': 'DATABASE_PASSWORD cannot be empty.',
  }),
  DATABASE_NAME: Joi.string().required().messages({
    'any.required': 'DATABASE_NAME is required. Please set this environment variable.',
    'string.empty': 'DATABASE_NAME cannot be empty.',
  }),
  DATABASE_SYNC: Joi.boolean().default(false),

  // Redis Configuration (Required)
  REDIS_HOST: Joi.string().required().messages({
    'any.required': 'REDIS_HOST is required. Please set this environment variable.',
    'string.empty': 'REDIS_HOST cannot be empty.',
  }),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  // JWT Configuration (Critical - Must be strong)
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'any.required':
        'JWT_SECRET is required for authentication. Generate a strong secret (32+ characters).',
      'string.empty': 'JWT_SECRET cannot be empty.',
      'string.min':
        'JWT_SECRET must be at least 32 characters long for security. Current: {#limit}',
    }),
  JWT_EXPIRES_IN: Joi.string().default('2h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // 985Proxy API Configuration (Critical)
  PROXY_985_API_KEY: Joi.string().required().messages({
    'any.required':
      'PROXY_985_API_KEY is required. Please obtain API key from 985Proxy dashboard.',
    'string.empty': 'PROXY_985_API_KEY cannot be empty.',
  }),
  PROXY_985_BASE_URL: Joi.string()
    .uri()
    .default('https://open-api.985proxy.com'),
  PROXY_985_ZONE: Joi.string().required().messages({
    'any.required': 'PROXY_985_ZONE is required. Please set your 985Proxy zone ID.',
    'string.empty': 'PROXY_985_ZONE cannot be empty.',
  }),
  PROXY_985_TEST_MODE: Joi.boolean().default(false),

  // Email Configuration (Optional - with warnings if missing)
  MAIL_HOST: Joi.string().optional(),
  MAIL_PORT: Joi.number().port().optional(),
  MAIL_USER: Joi.string().optional(),
  MAIL_PASSWORD: Joi.string().allow('').optional(),
  MAIL_FROM: Joi.string().optional(),

  // Backup Email Configuration (Optional)
  MAIL_HOST_BACKUP: Joi.string().optional(),
  MAIL_PORT_BACKUP: Joi.number().port().optional(),
  MAIL_USER_BACKUP: Joi.string().optional(),
  MAIL_PASSWORD_BACKUP: Joi.string().allow('').optional(),

  // Telegram Configuration (Optional)
  TELEGRAM_BOT_TOKEN: Joi.string().optional(),
  TELEGRAM_BOT_USERNAME: Joi.string().optional(),

  // Frontend Configuration
  FRONTEND_URL: Joi.string().uri().default('http://localhost:8080'),

  // CORS Configuration (Production should specify allowed origins)
  CORS_ORIGINS: Joi.string().optional(),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
}).unknown(true); // Allow other environment variables

/**
 * Optional configuration fields that should log warnings if missing
 */
export const optionalConfigWarnings = {
  email: ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASSWORD'],
  emailBackup: [
    'MAIL_HOST_BACKUP',
    'MAIL_PORT_BACKUP',
    'MAIL_USER_BACKUP',
    'MAIL_PASSWORD_BACKUP',
  ],
  telegram: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_USERNAME'],
};

