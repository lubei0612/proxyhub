import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 获取所有用户列表
   */
  @Get('users')
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const filters = { role, status };
    return this.adminService.getAllUsers(page, limit, filters);
  }

  /**
   * 获取系统统计数据
   */
  @Get('statistics')
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  /**
   * 更新用户状态
   */
  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() data: { status: string },
  ) {
    return this.adminService.updateUserStatus(userId, data.status);
  }

  /**
   * 更新用户角色
   */
  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() data: { role: string },
  ) {
    return this.adminService.updateUserRole(userId, data.role);
  }

  /**
   * 获取系统设置
   */
  @Get('settings')
  async getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  /**
   * 更新系统设置
   */
  @Put('settings/:key')
  async updateSystemSettings(
    @Param('key') key: string,
    @Body() data: { value: string },
  ) {
    return this.adminService.updateSystemSettings(key, data.value);
  }
}

