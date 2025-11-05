import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaticProxy } from './entities/static-proxy.entity';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../order/entities/order.entity';
import { Transaction } from '../../billing/entities/transaction.entity';
import { StaticProxyService } from './static-proxy.service';
import { StaticProxyController } from './static-proxy.controller';
import { EventLogModule } from '../../event-log/event-log.module';
import { PricingModule } from '../../pricing/pricing.module';
import { Proxy985Module } from '../../proxy985/proxy985.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaticProxy, User, Order, Transaction]),
    forwardRef(() => EventLogModule),
    forwardRef(() => PricingModule),
    Proxy985Module, // 导入985Proxy服务
  ],
  providers: [StaticProxyService],
  controllers: [StaticProxyController],
  exports: [StaticProxyService],
})
export class StaticProxyModule {}

