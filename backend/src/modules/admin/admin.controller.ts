import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
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
   * ✅ 删除用户
   */
  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
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

  /**
   * 获取待处理事项
   */
  @Get('pending-items')
  async getPendingItems() {
    return this.adminService.getPendingItems();
  }

  /**
   * 获取最近订单
   */
  @Get('recent-orders')
  async getRecentOrders(@Query('limit') limit: number = 5) {
    return this.adminService.getRecentOrders(limit);
  }

  /**
   * 添加余额给用户（管理员功能）
   */
  @Post('users/:id/add-balance')
  async addBalance(
    @Param('id') userId: string,
    @Body() data: { amount: number; remark?: string },
  ) {
    return this.adminService.addBalance(userId, data.amount, data.remark);
  }

  /**
   * 扣除用户余额
   */
  @Post('users/:id/deduct-balance')
  async deductBalance(
    @Param('id') userId: string,
    @Body() data: { amount: number; remark?: string },
  ) {
    return this.adminService.deductBalance(userId, data.amount, data.remark);
  }

  /**
   * 获取用户购买的IP列表（用于管理员查看）
   */
  @Get('users/:id/ips')
  async getUserIPs(@Param('id') userId: string) {
    return this.adminService.getUserIPs(userId);
  }

  /**
   * 创建新用户（管理员功能）
   */
  @Post('users')
  async createUser(@Body() data: { email: string; password: string; role: string; initialBalance: number }) {
    return this.adminService.createUser(data.email, data.password, data.role, data.initialBalance);
  }
}

