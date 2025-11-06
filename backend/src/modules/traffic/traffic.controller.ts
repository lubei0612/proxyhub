import { Controller, Post, Get, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TrafficService } from './traffic.service';
import { RecordTrafficDto, QueryTrafficDto } from './dto/record-traffic.dto';

@ApiTags('流量管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('traffic')
export class TrafficController {
  private readonly logger = new Logger(TrafficController.name);

  constructor(private readonly trafficService: TrafficService) {}

  @Post('record')
  @ApiOperation({ summary: '记录流量使用' })
  async recordTraffic(
    @CurrentUser() user: any,
    @Body() dto: RecordTrafficDto,
  ) {
    this.logger.log(`[Record Traffic] User ${user.id} recording traffic for ${dto.proxyType}`);
    return await this.trafficService.recordTraffic(user.id, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取用户总流量统计' })
  async getUserStats(@CurrentUser() user: any) {
    return await this.trafficService.getUserTotalStats(user.id);
  }

  @Get('query')
  @ApiOperation({ summary: '查询流量记录' })
  async queryTraffic(
    @CurrentUser() user: any,
    @Query() query: QueryTrafficDto,
  ) {
    return await this.trafficService.queryTraffic(user.id, query);
  }
}

