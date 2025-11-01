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
import { StaticProxyService } from './static-proxy.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PurchaseStaticProxyDto } from './dto/purchase-static-proxy.dto';

@Controller('proxy/static')
@UseGuards(JwtAuthGuard)
export class StaticProxyController {
  constructor(private readonly staticProxyService: StaticProxyService) {}

  /**
   * 获取用户的静态代理列表
   */
  @Get('list')
  async getUserProxies(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    const filters = status ? { status } : undefined;
    return this.staticProxyService.getUserProxies(user.userId, page, limit, filters);
  }

  /**
   * 购买静态代理
   */
  @Post('purchase')
  async purchaseStaticProxy(
    @CurrentUser() user: any,
    @Body() dto: PurchaseStaticProxyDto,
  ) {
    return this.staticProxyService.purchaseStaticProxy(user.userId, dto);
  }

  /**
   * 切换自动续期
   */
  @Put(':id/auto-renew')
  async toggleAutoRenew(
    @CurrentUser() user: any,
    @Param('id') proxyId: string,
  ) {
    return this.staticProxyService.toggleAutoRenew(proxyId, user.userId);
  }

  /**
   * 更新备注
   */
  @Put(':id/remark')
  async updateRemark(
    @CurrentUser() user: any,
    @Param('id') proxyId: string,
    @Body() data: { remark: string },
  ) {
    return this.staticProxyService.updateRemark(proxyId, user.userId, data.remark);
  }

  /**
   * 获取库存信息
   */
  @Get('inventory')
  async getInventory() {
    return this.staticProxyService.getInventory();
  }
}

