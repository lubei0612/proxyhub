import {
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

/**
 * Standard error response format
 */
export interface StandardErrorResponse {
  statusCode: number;
  message: string | string[];
  errorCode?: string;
  timestamp: string;
  path: string;
}

/**
 * Exception mapper utility
 * Maps various exception types to appropriate HTTP status codes and error responses
 */
export class ExceptionMapper {
  /**
   * Map exception to HTTP status code
   * @param exception Exception to map
   * @returns HTTP status code
   */
  static getStatusCode(exception: Error): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    // TypeORM errors
    if (exception.name === 'QueryFailedError') {
      return HttpStatus.BAD_REQUEST;
    }

    // Validation errors
    if (exception.name === 'ValidationError') {
      return HttpStatus.BAD_REQUEST;
    }

    // Default to internal server error
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Extract error message from exception
   * @param exception Exception to extract message from
   * @param isProduction Whether running in production mode
   * @returns Error message or messages array
   */
  static getErrorMessage(
    exception: Error,
    isProduction: boolean,
  ): string | string[] {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      
      if (typeof response === 'string') {
        return response;
      }
      
      if (typeof response === 'object' && 'message' in response) {
        return (response as any).message;
      }
    }

    // In production, hide internal error details
    if (isProduction) {
      return '服务器内部错误，请稍后重试';
    }

    // In development, return actual error message
    return exception.message || '未知错误';
  }

  /**
   * Get error code from exception
   * @param exception Exception to extract code from
   * @returns Error code string
   */
  static getErrorCode(exception: Error): string | undefined {
    // Map common exception types to error codes
    if (exception instanceof BadRequestException) {
      return 'BAD_REQUEST';
    }
    if (exception instanceof UnauthorizedException) {
      return 'UNAUTHORIZED';
    }
    if (exception instanceof ForbiddenException) {
      return 'FORBIDDEN';
    }
    if (exception instanceof NotFoundException) {
      return 'NOT_FOUND';
    }
    if (exception instanceof ConflictException) {
      return 'CONFLICT';
    }
    if (exception instanceof InternalServerErrorException) {
      return 'INTERNAL_SERVER_ERROR';
    }

    // TypeORM errors
    if (exception.name === 'QueryFailedError') {
      return 'DATABASE_ERROR';
    }

    // Generic error code for other exceptions
    if (exception instanceof HttpException) {
      return 'HTTP_EXCEPTION';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Sanitize error message to remove sensitive information
   * @param message Error message to sanitize
   * @returns Sanitized message
   */
  static sanitizeMessage(message: string | string[]): string | string[] {
    const sensitivePatterns = [
      /password/gi,
      /token/gi,
      /secret/gi,
      /apikey/gi,
      /api_key/gi,
      /authorization/gi,
      /credit.*card/gi,
      /ssn/gi,
    ];

    const sanitize = (msg: string): string => {
      let sanitized = msg;
      
      // Replace sensitive patterns with redacted placeholder
      sensitivePatterns.forEach((pattern) => {
        if (pattern.test(sanitized)) {
          sanitized = sanitized.replace(/:\s*[^\s,}]+/g, ': [REDACTED]');
        }
      });

      return sanitized;
    };

    if (Array.isArray(message)) {
      return message.map(sanitize);
    }

    return sanitize(message);
  }
}

