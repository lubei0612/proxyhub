import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: '用户邮箱' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ example: 'Password123', description: '密码（至少8位）' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码至少需要8位' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({ example: '张三', description: '用户昵称', required: false })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  nickname?: string;
}

