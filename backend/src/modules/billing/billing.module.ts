import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recharge } from './entities/recharge.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { EventLogModule } from '../event-log/event-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recharge, Transaction, User]),
    forwardRef(() => EventLogModule),
  ],
  providers: [BillingService],
  controllers: [BillingController],
  exports: [BillingService],
})
export class BillingModule {}

