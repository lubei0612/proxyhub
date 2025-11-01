import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Recharge } from '../billing/entities/recharge.entity';
import { Transaction } from '../billing/entities/transaction.entity';
import { StaticProxy } from '../proxy/static/entities/static-proxy.entity';
import { SystemSettings } from './entities/system-settings.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      Recharge,
      Transaction,
      StaticProxy,
      SystemSettings,
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}

