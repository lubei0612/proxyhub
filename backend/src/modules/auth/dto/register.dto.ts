import { IsEmail, IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../../common/security/password-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: '用户邮箱' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @MaxLength(255, { message: '邮箱长度不能超过255个字符' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ 
    example: 'Password123', 
    description: '密码（至少8位，包含大写字母、小写字母和数字）' 
  })
  @IsString({ message: '密码必须是字符串' })
  @MaxLength(128, { message: '密码长度不能超过128个字符' })
  @IsStrongPassword()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({ example: '张三', description: '用户昵称', required: false })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @MaxLength(100, { message: '昵称长度不能超过100个字符' })
  nickname?: string;
}

