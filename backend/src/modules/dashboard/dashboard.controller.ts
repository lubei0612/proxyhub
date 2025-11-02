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
}

