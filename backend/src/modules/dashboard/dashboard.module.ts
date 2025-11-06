import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { StaticProxy } from '../proxy/static/entities/static-proxy.entity';
import { Transaction } from '../billing/entities/transaction.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TrafficModule } from '../traffic/traffic.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, StaticProxy, Transaction]),
    forwardRef(() => TrafficModule),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}

