import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EventLogService } from './event-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('event-logs')
@UseGuards(JwtAuthGuard)
export class EventLogController {
  constructor(private readonly eventLogService: EventLogService) {}

  /**
   * 获取当前用户事件日志
   */
  @Get('my')
  async getMyLogs(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('eventType') eventType?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const filters: any = {};
    if (eventType) filters.eventType = eventType;
    if (startTime) filters.startTime = startTime;
    if (endTime) filters.endTime = endTime;

    return this.eventLogService.getUserLogs(
      user.id,
      parseInt(page) || 1,
      parseInt(limit) || 20,
      filters,
    );
  }

  /**
   * 获取所有事件日志（管理员）
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('eventType') eventType?: string,
  ) {
    return this.eventLogService.getAllLogs(
      parseInt(page) || 1,
      parseInt(limit) || 20,
      eventType,
    );
  }
}

