import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import Redis from 'ioredis';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { StaticProxyModule } from './modules/proxy/static/static-proxy.module';
import { BillingModule } from './modules/billing/billing.module';
import { OrderModule } from './modules/order/order.module';
import { AdminModule } from './modules/admin/admin.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { Proxy985Module } from './modules/proxy985/proxy985.module';
import { EventLogModule } from './modules/event-log/event-log.module';
import { DynamicProxyModule } from './modules/proxy/dynamic/dynamic-proxy.module';
import { NotificationModule } from './modules/notification/notification.module';
import { TrafficModule } from './modules/traffic/traffic.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 数据库配置
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres123',
      database: process.env.DATABASE_NAME || 'proxyhub',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // 生产环境禁用
      logging: process.env.NODE_ENV === 'development',
    }),

    // API限流
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60秒
        limit: 100, // 100次请求
      },
    ]),

    // 定时任务
    ScheduleModule.forRoot(),

    // 业务模块
    AuthModule,
    UserModule,
    StaticProxyModule,
    BillingModule,
    OrderModule,
    AdminModule,
    DashboardModule,
    PricingModule,
    Proxy985Module,
    EventLogModule,
    DynamicProxyModule,
    NotificationModule,
    TrafficModule,
  ],
  controllers: [],
  providers: [
    // Redis客户端（全局可用）
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'], // 导出以便其他模块使用
})
export class AppModule {}

