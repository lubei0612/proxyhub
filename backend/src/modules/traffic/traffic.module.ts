import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrafficRecord } from './entities/traffic-record.entity';
import { TrafficService } from './traffic.service';
import { TrafficController } from './traffic.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrafficRecord])],
  providers: [TrafficService],
  controllers: [TrafficController],
  exports: [TrafficService],
})
export class TrafficModule {}

