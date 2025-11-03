import { UnauthorizedException } from '@nestjs/common';

export enum AuthErrorCode {
  USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  INVALID_PASSWORD = 'AUTH_INVALID_PASSWORD',
  INVALID_EMAIL_FORMAT = 'AUTH_INVALID_EMAIL_FORMAT',
  ACCOUNT_DISABLED = 'AUTH_ACCOUNT_DISABLED',
  ADMIN_REQUIRED = 'AUTH_ADMIN_REQUIRED',
}

export class AuthException extends UnauthorizedException {
  constructor(
    public errorCode: AuthErrorCode,
    message: string,
  ) {
    super({
      statusCode: 401,
      message,
      error: 'Unauthorized',
      errorCode,
    });
  }
}

