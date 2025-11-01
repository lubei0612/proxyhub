import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

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

    // TODO: 业务模块将在后续添加
    // AuthModule,
    // UserModule,
    // ProxyModule,
    // BillingModule,
    // OrderModule,
    // AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

