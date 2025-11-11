import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Logger } from '@nestjs/common';

/**
 * Enhanced CORS configuration
 * Provides environment-aware CORS settings
 */
export class EnhancedCorsOptions {
  private static readonly logger = new Logger('CorsConfig');

  /**
   * Get CORS options based on environment
   * @returns CORS options
   */
  static getOptions(): CorsOptions {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isDevelopment) {
      // Development: Allow common localhost origins
      this.logger.log('🔓 CORS: Development mode - allowing localhost origins');
      return {
        origin: [
          'http://localhost:8080',
          'http://127.0.0.1:8080',
          'http://localhost:8081',
          'http://127.0.0.1:8081',
          'http://localhost:3000',
          'http://127.0.0.1:3000',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      };
    }

    // Production: Read from environment variable
    const corsOrigins = process.env.CORS_ORIGINS;
    
    if (!corsOrigins) {
      this.logger.warn(
        '⚠️  CORS_ORIGINS not configured! Defaulting to restrictive settings.',
      );
      return {
        origin: false, // Block all cross-origin requests
        credentials: true,
      };
    }

    // Parse comma-separated origins
    const origins = corsOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    // Validate origins
    const validOrigins = origins.filter((origin) => {
      try {
        new URL(origin);
        return true;
      } catch (error) {
        this.logger.error(`❌ Invalid CORS origin: ${origin}`);
        return false;
      }
    });

    if (validOrigins.length === 0) {
      this.logger.error('❌ No valid CORS origins configured!');
      return {
        origin: false,
        credentials: true,
      };
    }

    this.logger.log(
      `🔒 CORS: Production mode - allowing ${validOrigins.length} origins`,
    );
    validOrigins.forEach((origin) => {
      this.logger.log(`   ✓ ${origin}`);
    });

    return {
      origin: validOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };
  }
}

