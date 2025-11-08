import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DynamicChannel } from './entities/dynamic-channel.entity';
import { DynamicUsage } from './entities/dynamic-usage.entity';
import { DynamicChannelService } from './services/dynamic-channel.service';
import { DynamicUsageService } from './services/dynamic-usage.service';
import { DynamicProxyController } from './dynamic-proxy.controller';
import { Proxy985Module } from '../../proxy985/proxy985.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DynamicChannel, DynamicUsage]),
    ScheduleModule.forRoot(), // 启用定时任务
    Proxy985Module, // 导入985Proxy模块以使用API服务
  ],
  controllers: [DynamicProxyController],
  providers: [DynamicChannelService, DynamicUsageService],
  exports: [DynamicChannelService, DynamicUsageService],
})
export class DynamicProxyModule {}


