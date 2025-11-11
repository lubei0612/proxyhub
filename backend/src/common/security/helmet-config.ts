import helmet from 'helmet';

/**
 * Helmet configuration for security headers
 * Provides secure defaults for various HTTP security headers
 */
export class HelmetConfigurer {
  /**
   * Get Helmet configuration with secure defaults
   * @returns Helmet options
   */
  static getConfig(): Parameters<typeof helmet>[0] {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      // Content Security Policy - disabled for API usage
      contentSecurityPolicy: false,
      
      // X-Frame-Options: prevent clickjacking
      frameguard: {
        action: 'deny',
      },
      
      // X-Content-Type-Options: prevent MIME type sniffing
      noSniff: true,
      
      // X-XSS-Protection: enable browser XSS protection
      xssFilter: true,
      
      // Strict-Transport-Security: enforce HTTPS (production only)
      hsts: isProduction
        ? {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
          }
        : false,
      
      // X-DNS-Prefetch-Control: control DNS prefetching
      dnsPrefetchControl: {
        allow: false,
      },
      
      // X-Download-Options: prevent IE from executing downloads
      ieNoOpen: true,
      
      // X-Permitted-Cross-Domain-Policies: control Flash/PDF cross-domain
      permittedCrossDomainPolicies: {
        permittedPolicies: 'none',
      },
      
      // Referrer-Policy: control referrer information
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    };
  }
}

