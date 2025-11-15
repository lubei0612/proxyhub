import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * 自定义验证器：检查数字是否为30的倍数
 * 用于验证购买/续费时长，985Proxy要求时长必须是30的倍数
 */
export function IsMultipleOf30(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMultipleOf30',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'number' && value > 0 && value % 30 === 0;
        },
        defaultMessage(args: ValidationArguments) {
          return '时长必须是30的倍数（30、60、90、180、360天等）';
        },
      },
    });
  };
}

