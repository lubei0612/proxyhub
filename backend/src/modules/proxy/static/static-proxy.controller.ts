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
   * 获取库存信息（985Proxy实时库存）
   */
  @Get('inventory')
  async getInventory(
    @Query('ipType') ipType: string = 'shared', 
    @Query('duration') duration: number = 30,
    @Query('businessScenario') businessScenario?: string
  ) {
    return this.staticProxyService.getInventory(ipType, duration, businessScenario);
  }

  /**
   * 获取业务场景列表（985Proxy）
   */
  @Get('business-scenarios')
  async getBusinessScenarios() {
    return this.staticProxyService.getBusinessScenarios();
  }

  /**
   * 获取国家列表（985Proxy）
   */
  @Get('country-list')
  async getCountryList() {
    return this.staticProxyService.getCountryList();
  }

  /**
   * 获取城市列表（985Proxy）
   * @param country 国家代码
   */
  @Get('city-list')
  async getCityList(@Query('country') country: string) {
    return this.staticProxyService.getCityList(country);
  }

  /**
   * 计算购买价格（调用985Proxy API）
   */
  @Post('calculate-price')
  async calculatePrice(
    @CurrentUser() user: any,
    @Body() dto: PurchaseStaticProxyDto,
  ) {
    return this.staticProxyService.calculatePurchasePrice(dto);
  }

  /**
   * 获取我的IP列表（增强版 - 含过期状态）
   */
  @Get('my-ips')
  async getMyIPs(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.staticProxyService.listMyIPs(user.id, page, limit);
  }

  /**
   * 获取单个IP详情
   */
  @Get('ip/:ip')
  async getIPDetail(
    @CurrentUser() user: any,
    @Param('ip') ip: string,
  ) {
    return this.staticProxyService.getIPDetails(user.id, ip);
  }

  /**
   * 续费IP（通过985Proxy API）
   */
  @Post('ip/:ip/renew')
  async renewIPVia985(
    @CurrentUser() user: any,
    @Param('ip') ip: string,
    @Body() data: { duration: number },
  ) {
    return this.staticProxyService.renewIPVia985Proxy(user.id, ip, data.duration);
  }

  /**
   * 查询订单状态（985Proxy订单）
   */
  @Get('order/:orderNo/status')
  async checkOrderStatus(
    @CurrentUser() user: any,
    @Param('orderNo') orderNo: string,
  ) {
    return this.staticProxyService.checkOrderStatus(user.id, orderNo);
  }

  /**
   * 🔧 修复：手动同步订单IP
   * 用于处理那些购买时未能立即获取IP的订单
   */
  @Post('order/:orderNo/sync')
  async syncOrderIPs(
    @CurrentUser() user: any,
    @Param('orderNo') orderNo: string,
  ) {
    return this.staticProxyService.syncOrderIPs(user.id, orderNo);
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

