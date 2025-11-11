import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isWeakPassword } from './weak-passwords';

/**
 * Password strength validation results
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - Not in weak password list
 *
 * @param password Password to validate
 * @returns Validation result with errors if any
 */
export function validatePasswordStrength(
  password: string,
): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (!password || password.length < 8) {
    errors.push('密码长度至少为8个字符');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  }

  // Check against weak password list
  if (isWeakPassword(password)) {
    errors.push('该密码过于常见，请使用更强的密码');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Custom validator constraint for strong password validation
 */
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string, args: ValidationArguments) {
    const result = validatePasswordStrength(password);
    return result.isValid;
  }

  defaultMessage(args: ValidationArguments) {
    const password = args.value as string;
    const result = validatePasswordStrength(password);
    
    if (result.errors.length > 0) {
      return result.errors.join('; ');
    }
    
    return '密码强度不足';
  }
}

/**
 * Decorator for validating strong passwords
 * 
 * @example
 * ```typescript
 * class RegisterDto {
 *   @IsStrongPassword()
 *   password: string;
 * }
 * ```
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

/**
 * Decorator for validating that password is not common/weak
 * 
 * @example
 * ```typescript
 * class ChangePasswordDto {
 *   @IsNotCommonPassword()
 *   newPassword: string;
 * }
 * ```
 */
@ValidatorConstraint({ name: 'isNotCommonPassword', async: false })
export class IsNotCommonPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string, args: ValidationArguments) {
    return !isWeakPassword(password);
  }

  defaultMessage(args: ValidationArguments) {
    return '该密码过于常见，请使用更强的密码';
  }
}

export function IsNotCommonPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotCommonPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotCommonPasswordConstraint,
    });
  };
}

