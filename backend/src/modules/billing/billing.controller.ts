import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * 创建充值订单
   */
  @Post('recharge')
  async createRecharge(
    @CurrentUser() user: any,
    @Body() data: { amount: number; method: string; remark?: string },
  ) {
    return this.billingService.createRecharge(user.id, data.amount, data.method, data.remark);
  }

  /**
   * 获取用户充值记录
   */
  @Get('recharges')
  async getUserRecharges(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.billingService.getUserRecharges(user.id, page, limit);
  }

  /**
   * 获取用户交易记录
   */
  @Get('transactions')
  async getUserTransactions(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type?: string,
    @Query('category') category?: string,
  ) {
    const filters = { type, category };
    return this.billingService.getUserTransactions(user.id, page, limit, filters);
  }

  /**
   * 管理员审核充值
   */
  @Put('recharge/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async approveRecharge(
    @Param('id') rechargeId: string,
    @Body() data: { approved: boolean; remark?: string },
  ) {
    return this.billingService.approveRecharge(rechargeId, data.approved, data.remark);
  }

  /**
   * 获取所有充值记录（管理员）
   */
  @Get('admin/recharges')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllRecharges(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    const filters = status ? { status } : undefined;
    return this.billingService.getAllRecharges(page, limit, filters);
  }
}

