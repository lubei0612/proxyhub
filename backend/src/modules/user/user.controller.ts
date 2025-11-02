import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取当前用户个人信息
   */
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  /**
   * 获取当前用户信息 (/me路由)
   */
  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  /**
   * 更新个人信息
   */
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() data: { nickname?: string; email?: string },
  ) {
    return this.userService.updateProfile(user.userId, data);
  }

  /**
   * 修改密码
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: any,
    @Body() data: { oldPassword: string; newPassword: string },
  ) {
    return this.userService.changePassword(
      user.userId,
      data.oldPassword,
      data.newPassword,
    );
  }

  /**
   * 生成API Key
   */
  @Post('api-key/generate')
  @HttpCode(HttpStatus.OK)
  async generateApiKey(@CurrentUser() user: any) {
    return this.userService.generateApiKey(user.userId);
  }

  /**
   * 重置API Key
   */
  @Post('api-key/reset')
  @HttpCode(HttpStatus.OK)
  async resetApiKey(@CurrentUser() user: any) {
    return this.userService.resetApiKey(user.userId);
  }
}

