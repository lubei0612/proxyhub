import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Proxy985Service } from './services/proxy-985.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { PurchaseStaticProxyDto } from './dto/purchase-static-proxy.dto';

@Controller('proxy')
@UseGuards(JwtAuthGuard)
export class ProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly proxy985Service: Proxy985Service,
  ) {}

  // ============ 动态住宅代理 ============

  @Public()
  @Get('rotating/cities')
  async getRotatingCityList() {
    return this.proxy985Service.getRotatingCityList();
  }

  @Post('rotating/extract')
  async extractRotatingProxy(@Body() params: any) {
    return this.proxy985Service.extractRotatingProxy(params);
  }

  // ============ 静态住宅代理 ============

  @Public()
  @Get('static/inventory')
  async getInventory(
    @Query('static_proxy_type') staticProxyType: string,
    @Query('purpose_web') purposeWeb?: string,
  ) {
    return this.proxyService.getInventoryWithMarkup(staticProxyType, purposeWeb);
  }

  @Public()
  @Get('static/business-list')
  async getBusinessList() {
    return this.proxy985Service.getBusinessList();
  }

  @Post('static/calculate')
  async calculatePrice(@Body() params: any) {
    return this.proxyService.calculatePriceWithMarkup(params);
  }

  @Get('static/my-proxies')
  async getMyProxies(
    @Request() req,
    @Query('zone') zone?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('static_proxy_type') staticProxyType?: string,
    @Query('country') country?: string,
    @Query('city') city?: string,
  ) {
    // 如果提供了zone，从985Proxy获取
    if (zone) {
      return this.proxy985Service.getStaticIpList({
        zone,
        static_proxy_type: staticProxyType || 'all',
        page: Number(page),
        limit: Number(limit),
      });
    }
    // 否则从本地数据库获取
    return this.proxyService.getUserProxies(req.user.id, Number(page), Number(limit), {
      staticProxyType,
      countryCode: country,
      city,
    });
  }

  // 新的本地批量续费API
  @Post('static/batch-renew-local')
  async batchRenewLocalProxies(
    @Request() req,
    @Body() body: {
      ipIds: string[];
      duration: number;
    },
  ) {
    return this.proxyService.batchRenewLocal(req.user.id, body.ipIds, body.duration);
  }

  // 本地静态IP购买API
  @Post('static/purchase')
  @HttpCode(HttpStatus.CREATED)
  async purchaseStaticProxies(
    @Request() req,
    @Body() dto: PurchaseStaticProxyDto,
  ) {
    return this.proxyService.purchaseStaticProxy(req.user.id, dto);
  }

  // 原有的985Proxy批量续费API（保留兼容性）
  @Post('static/batch-renew')
  async batchRenewStaticProxies(
    @Request() req,
    @Body() body: {
      zone: string;
      ipIds: string[];
      timePeriod: number;
      promoCode?: string;
    },
  ) {
    const { zone, ipIds, timePeriod, promoCode } = body;
    
    // 调用985Proxy续费API
    const result = await this.proxy985Service.renewStaticProxy({
      zone,
      renew_ip_list: ipIds,
      time_period: timePeriod,
      promo_code: promoCode,
    });
    
    return {
      success: true,
      message: `成功提交续费订单`,
      orderNo: result.data?.order_no,
    };
  }

  @Patch('static/:id/auto-renew')
  async toggleAutoRenew(@Param('id') id: string, @Request() req) {
    return this.proxyService.toggleAutoRenew(id, req.user.id);
  }

  @Patch('static/:id/remark')
  async updateRemark(
    @Param('id') id: string,
    @Request() req,
    @Body('remark') remark: string,
  ) {
    return this.proxyService.updateRemark(id, req.user.id, remark);
  }
}

    @Body() body: {
      ipIds: string[];
      duration: number;
    },
  ) {
    return this.proxyService.batchRenewLocal(req.user.id, body.ipIds, body.duration);
  }

  // 本地静态IP购买API
  @Post('static/purchase')
  @HttpCode(HttpStatus.CREATED)
  async purchaseStaticProxies(
    @Request() req,
    @Body() dto: PurchaseStaticProxyDto,
  ) {
    return this.proxyService.purchaseStaticProxy(req.user.id, dto);
  }

  // 原有的985Proxy批量续费API（保留兼容性）
  @Post('static/batch-renew')
  async batchRenewStaticProxies(
    @Request() req,
    @Body() body: {
      zone: string;
      ipIds: string[];
      timePeriod: number;
      promoCode?: string;
    },
  ) {
    const { zone, ipIds, timePeriod, promoCode } = body;
    
    // 调用985Proxy续费API
    const result = await this.proxy985Service.renewStaticProxy({
      zone,
      renew_ip_list: ipIds,
      time_period: timePeriod,
      promo_code: promoCode,
    });
    
    return {
      success: true,
      message: `成功提交续费订单`,
      orderNo: result.data?.order_no,
    };
  }

  @Patch('static/:id/auto-renew')
  async toggleAutoRenew(@Param('id') id: string, @Request() req) {
    return this.proxyService.toggleAutoRenew(id, req.user.id);
  }

  @Patch('static/:id/remark')
  async updateRemark(
    @Param('id') id: string,
    @Request() req,
    @Body('remark') remark: string,
  ) {
    return this.proxyService.updateRemark(id, req.user.id, remark);
  }
}

    @Body() body: {
      ipIds: string[];
      duration: number;
    },
  ) {
    return this.proxyService.batchRenewLocal(req.user.id, body.ipIds, body.duration);
  }

  // 本地静态IP购买API
  @Post('static/purchase')
  @HttpCode(HttpStatus.CREATED)
  async purchaseStaticProxies(
    @Request() req,
    @Body() dto: PurchaseStaticProxyDto,
  ) {
    return this.proxyService.purchaseStaticProxy(req.user.id, dto);
  }

  // 原有的985Proxy批量续费API（保留兼容性）
  @Post('static/batch-renew')
  async batchRenewStaticProxies(
    @Request() req,
    @Body() body: {
      zone: string;
      ipIds: string[];
      timePeriod: number;
      promoCode?: string;
    },
  ) {
    const { zone, ipIds, timePeriod, promoCode } = body;
    
    // 调用985Proxy续费API
    const result = await this.proxy985Service.renewStaticProxy({
      zone,
      renew_ip_list: ipIds,
      time_period: timePeriod,
      promo_code: promoCode,
    });
    
    return {
      success: true,
      message: `成功提交续费订单`,
      orderNo: result.data?.order_no,
    };
  }

  @Patch('static/:id/auto-renew')
  async toggleAutoRenew(@Param('id') id: string, @Request() req) {
    return this.proxyService.toggleAutoRenew(id, req.user.id);
  }

  @Patch('static/:id/remark')
  async updateRemark(
    @Param('id') id: string,
    @Request() req,
    @Body('remark') remark: string,
  ) {
    return this.proxyService.updateRemark(id, req.user.id, remark);
  }
}

    @Body() body: {
      ipIds: string[];
      duration: number;
    },
  ) {
    return this.proxyService.batchRenewLocal(req.user.id, body.ipIds, body.duration);
  }

  // 本地静态IP购买API
  @Post('static/purchase')
  @HttpCode(HttpStatus.CREATED)
  async purchaseStaticProxies(
    @Request() req,
    @Body() dto: PurchaseStaticProxyDto,
  ) {
    return this.proxyService.purchaseStaticProxy(req.user.id, dto);
  }

  // 原有的985Proxy批量续费API（保留兼容性）
  @Post('static/batch-renew')
  async batchRenewStaticProxies(
    @Request() req,
    @Body() body: {
      zone: string;
      ipIds: string[];
      timePeriod: number;
      promoCode?: string;
    },
  ) {
    const { zone, ipIds, timePeriod, promoCode } = body;
    
    // 调用985Proxy续费API
    const result = await this.proxy985Service.renewStaticProxy({
      zone,
      renew_ip_list: ipIds,
      time_period: timePeriod,
      promo_code: promoCode,
    });
    
    return {
      success: true,
      message: `成功提交续费订单`,
      orderNo: result.data?.order_no,
    };
  }

  @Patch('static/:id/auto-renew')
  async toggleAutoRenew(@Param('id') id: string, @Request() req) {
    return this.proxyService.toggleAutoRenew(id, req.user.id);
  }

  @Patch('static/:id/remark')
  async updateRemark(
    @Param('id') id: string,
    @Request() req,
    @Body('remark') remark: string,
  ) {
    return this.proxyService.updateRemark(id, req.user.id, remark);
  }
}

    @Body() body: {
      ipIds: string[];
      duration: number;
    },
  ) {
    return this.proxyService.batchRenewLocal(req.user.id, body.ipIds, body.duration);
  }

  // 本地静态IP购买API
  @Post('static/purchase')
  @HttpCode(HttpStatus.CREATED)
  async purchaseStaticProxies(
    @Request() req,
    @Body() dto: PurchaseStaticProxyDto,
  ) {
    return this.proxyService.purchaseStaticProxy(req.user.id, dto);
  }

  // 原有的985Proxy批量续费API（保留兼容性）
  @Post('static/batch-renew')
  async batchRenewStaticProxies(
    @Request() req,
    @Body() body: {
      zone: string;
      ipIds: string[];
      timePeriod: number;
      promoCode?: string;
    },
  ) {
    const { zone, ipIds, timePeriod, promoCode } = body;
    
    // 调用985Proxy续费API
    const result = await this.proxy985Service.renewStaticProxy({
      zone,
      renew_ip_list: ipIds,
      time_period: timePeriod,
      promo_code: promoCode,
    });
    
    return {
      success: true,
      message: `成功提交续费订单`,
      orderNo: result.data?.order_no,
    };
  }

  @Patch('static/:id/auto-renew')
  async toggleAutoRenew(@Param('id') id: string, @Request() req) {
    return this.proxyService.toggleAutoRenew(id, req.user.id);
  }

  @Patch('static/:id/remark')
  async updateRemark(
    @Param('id') id: string,
    @Request() req,
    @Body('remark') remark: string,
  ) {
    return this.proxyService.updateRemark(id, req.user.id, remark);
  }
}

    @Body() body: {
      ipIds: string[];
      duration: number;
    },
  ) {
    return this.proxyService.batchRenewLocal(req.user.id, body.ipIds, body.duration);
  }

  // 本地静态IP购买API
  @Post('static/purchase')
  @HttpCode(HttpStatus.CREATED)
  async purchaseStaticProxies(
    @Request() req,
    @Body() dto: PurchaseStaticProxyDto,
  ) {
    return this.proxyService.purchaseStaticProxy(req.user.id, dto);
  }

  // 原有的985Proxy批量续费API（保留兼容性）
  @Post('static/batch-renew')
  async batchRenewStaticProxies(
    @Request() req,
    @Body() body: {
      zone: string;
      ipIds: string[];
      timePeriod: number;
      promoCode?: string;
    },
  ) {
    const { zone, ipIds, timePeriod, promoCode } = body;
    
    // 调用985Proxy续费API
    const result = await this.proxy985Service.renewStaticProxy({
      zone,
      renew_ip_list: ipIds,
      time_period: timePeriod,
      promo_code: promoCode,
    });
    
    return {
      success: true,
      message: `成功提交续费订单`,
      orderNo: result.data?.order_no,
    };
  }

  @Patch('static/:id/auto-renew')
  async toggleAutoRenew(@Param('id') id: string, @Request() req) {
    return this.proxyService.toggleAutoRenew(id, req.user.id);
  }

  @Patch('static/:id/remark')
  async updateRemark(
    @Param('id') id: string,
    @Request() req,
    @Body('remark') remark: string,
  ) {
    return this.proxyService.updateRemark(id, req.user.id, remark);
  }
}
