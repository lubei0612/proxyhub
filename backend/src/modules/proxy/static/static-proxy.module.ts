import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaticProxy } from './entities/static-proxy.entity';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../order/entities/order.entity';
import { Transaction } from '../../billing/entities/transaction.entity';
import { StaticProxyService } from './static-proxy.service';
import { StaticProxyController } from './static-proxy.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaticProxy, User, Order, Transaction]),
  ],
  providers: [StaticProxyService],
  controllers: [StaticProxyController],
  exports: [StaticProxyService],
})
export class StaticProxyModule {}

