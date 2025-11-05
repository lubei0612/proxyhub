import { IsEmail, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCodeDto {
  @ApiProperty({ description: '邮箱地址', example: 'user@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ description: '验证码类型', example: 'login', enum: ['login', 'register'] })
  @IsIn(['login', 'register'], { message: '验证码类型只能是login或register' })
  @IsNotEmpty({ message: '验证码类型不能为空' })
  type: 'login' | 'register';
}

