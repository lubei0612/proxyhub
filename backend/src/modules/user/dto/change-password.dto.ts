import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../../common/security/password-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123', description: '旧密码' })
  @IsString({ message: '旧密码必须是字符串' })
  @MaxLength(128, { message: '旧密码长度不能超过128个字符' })
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string;

  @ApiProperty({ 
    example: 'NewPassword456', 
    description: '新密码（至少8位，包含大写字母、小写字母和数字）' 
  })
  @IsString({ message: '新密码必须是字符串' })
  @MaxLength(128, { message: '新密码长度不能超过128个字符' })
  @IsStrongPassword()
  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string;
}

