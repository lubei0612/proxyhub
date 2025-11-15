import { Controller, Get, UseGuards } from '@nestjs/common';
import { Proxy985Service } from './proxy985.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('proxy985')
export class Proxy985Controller {
  constructor(private readonly proxy985Service: Proxy985Service) {}

  /**
   * 获取业务场景列表（公开接口，无需登录）
   * GET /api/v1/proxy985/business-list
   * 用于静态代理购买页面的业务场景筛选
   */
  @Get('business-list')
  async getBusinessList() {
    return this.proxy985Service.getBusinessList();
  }
}

