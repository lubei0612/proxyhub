import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
    @Query('ip') ip?: string,
    @Query('channel') channel?: string,
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('nodeId') nodeId?: string,
    @Query('ipType') ipType?: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (ip) filters.ip = ip;
    if (channel) filters.channel = channel;
    if (country) filters.country = country;
    if (city) filters.city = city;
    if (nodeId) filters.nodeId = nodeId;
    if (ipType) filters.ipType = ipType;
    
    return this.staticProxyService.getUserProxies(user.id, page, limit, filters);
  }

  /**
   * 购买静态代理
   */
  @Post('purchase')
  async purchaseStaticProxy(
    @CurrentUser() user: any,
    @Body() dto: PurchaseStaticProxyDto,
  ) {
    return this.staticProxyService.purchaseStaticProxy(user.id, dto);
  }

  /**
   * 切换自动续期
   */
  @Put(':id/auto-renew')
  async toggleAutoRenew(
    @CurrentUser() user: any,
    @Param('id') proxyId: string,
  ) {
    return this.staticProxyService.toggleAutoRenew(proxyId, user.id);
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
    return this.staticProxyService.updateRemark(proxyId, user.id, data.remark);
  }

  /**
   * 获取库存信息
   */
  @Get('inventory')
  async getInventory(@Query('ipType') ipType: string = 'shared', @Query('duration') duration: number = 30) {
    return this.staticProxyService.getInventory(ipType, duration);
  }

  /**
   * 续费静态代理
   */
  @Post(':id/renew')
  async renewProxy(
    @CurrentUser() user: any,
    @Param('id') proxyId: string,
    @Body() data: { duration: number },
  ) {
    return this.staticProxyService.renewProxy(user.id, proxyId, data.duration);
  }

  /**
   * 释放静态代理
   */
  @Delete(':id')
  async releaseProxy(
    @CurrentUser() user: any,
    @Param('id') proxyId: string,
  ) {
    return this.staticProxyService.releaseProxy(user.id, proxyId);
  }
}

