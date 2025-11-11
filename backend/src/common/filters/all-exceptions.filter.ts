import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ExceptionMapper,
  StandardErrorResponse,
} from '../exceptions/exception-mapper';

/**
 * Global exception filter that catches all exceptions
 * 
 * Features:
 * - Catches ALL exception types (not just HttpException)
 * - Returns standardized error response format
 * - Sanitizes error messages to remove sensitive data
 * - Hides stack traces in production
 * - Logs all errors with context
 * - Maps exceptions to appropriate HTTP status codes
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');
  private readonly isProduction =
    process.env.NODE_ENV === 'production';

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get status code from exception
    const statusCode = ExceptionMapper.getStatusCode(exception);

    // Get error message
    let message = ExceptionMapper.getErrorMessage(
      exception,
      this.isProduction,
    );

    // Sanitize message to remove sensitive information
    message = ExceptionMapper.sanitizeMessage(message);

    // Get error code
    const errorCode = ExceptionMapper.getErrorCode(exception);

    // Build standard error response
    const errorResponse: StandardErrorResponse = {
      statusCode,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log the error with context
    this.logError(exception, request, statusCode);

    // Send response
    response.status(statusCode).json(errorResponse);
  }

  /**
   * Log error with context
   * @param exception Exception that occurred
   * @param request Request object
   * @param statusCode HTTP status code
   */
  private logError(
    exception: Error,
    request: Request,
    statusCode: number,
  ): void {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';

    // Log level based on status code
    if (statusCode >= 500) {
      // Server errors - log as error with stack trace
      this.logger.error(
        `[${method}] ${url} - ${statusCode} - ${exception.message}`,
        this.isProduction ? undefined : exception.stack,
      );
    } else if (statusCode >= 400) {
      // Client errors - log as warning
      this.logger.warn(
        `[${method}] ${url} - ${statusCode} - ${exception.message} - IP: ${ip} - UA: ${userAgent}`,
      );
    }

    // Always log exception name for debugging
    this.logger.debug(`Exception type: ${exception.name}`);
  }
}

