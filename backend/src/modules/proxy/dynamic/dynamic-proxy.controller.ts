import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { DynamicChannelService } from './services/dynamic-channel.service';
import { DynamicUsageService } from './services/dynamic-usage.service';
import {
  CreateChannelDto,
  UpdateChannelDto,
  ChannelFiltersDto,
} from './dto/channel.dto';
import { UsageFiltersDto } from './dto/usage.dto';

@Controller('proxy/dynamic')
@UseGuards(JwtAuthGuard)
export class DynamicProxyController {
  constructor(
    private channelService: DynamicChannelService,
    private usageService: DynamicUsageService,
  ) {}

  // 通道管理
  @Get('channels')
  async getChannels(@Request() req, @Query() filters: ChannelFiltersDto) {
    return this.channelService.getChannels(req.user.id, filters);
  }

  @Post('channels')
  async createChannel(@Request() req, @Body() dto: CreateChannelDto) {
    return this.channelService.createChannel(req.user.id, dto);
  }

  @Put('channels/:id')
  async updateChannel(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateChannelDto,
  ) {
    return this.channelService.updateChannel(parseInt(id), req.user.id, dto);
  }

  @Delete('channels/:id')
  async deleteChannel(@Param('id') id: string, @Request() req) {
    await this.channelService.deleteChannel(parseInt(id), req.user.id);
    return { message: '通道已删除' };
  }

  @Patch('channels/:id/toggle')
  async toggleStatus(@Param('id') id: string, @Request() req) {
    return this.channelService.toggleChannelStatus(parseInt(id), req.user.id);
  }

  @Get('statistics')
  async getStatistics(@Request() req) {
    return this.channelService.getChannelStatistics(req.user.id);
  }

  // 流量使用记录
  @Get('usage')
  async getUsage(@Request() req, @Query() filters: UsageFiltersDto) {
    return this.usageService.getUsageHistory(req.user.id, filters);
  }

  @Get('usage/statistics')
  async getUsageStatistics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.usageService.getUsageStatistics(req.user.id, startDate, endDate);
  }

  // 动态住宅IP提取
  @Post('extract')
  async extractProxy(@Request() req, @Body() dto: any) {
    return this.channelService.extractProxy(req.user.id, dto);
  }

  // 获取城市列表
  @Get('city-list')
  async getCityList() {
    return this.channelService.getCityList();
  }
}

