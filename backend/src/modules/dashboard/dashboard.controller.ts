import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * 获取用户仪表盘概览数据
   */
  @Get('overview')
  async getUserOverview(@CurrentUser() user: any) {
    return this.dashboardService.getUserOverview(user.id.toString());
  }

  /**
   * 获取用户消费趋势
   */
  @Get('spending-trend')
  async getSpendingTrend(@CurrentUser() user: any) {
    return this.dashboardService.getSpendingTrend(user.id);
  }

  /**
   * 获取流量统计（按类型）- 条形图
   */
  @Get('traffic-by-type')
  async getTrafficByType(@CurrentUser() user: any) {
    return this.dashboardService.getTrafficByType(user.id.toString());
  }

  /**
   * 获取网络请求分布 - 饼图
   */
  @Get('request-distribution')
  async getRequestDistribution(@CurrentUser() user: any) {
    return this.dashboardService.getRequestDistribution(user.id.toString());
  }

  /**
   * 获取7天流量趋势 - 折线图
   */
  @Get('traffic-trend')
  async getTrafficTrend(@CurrentUser() user: any) {
    return this.dashboardService.getTrafficTrend(user.id.toString());
  }
}

