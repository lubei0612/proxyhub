import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceConfig } from './entities/price-config.entity';
import { PriceOverride } from './entities/price-override.entity';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { Proxy985Module } from '../proxy985/proxy985.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceConfig, PriceOverride, ExchangeRate]),
    forwardRef(() => Proxy985Module),
  ],
  providers: [PricingService],
  controllers: [PricingController],
  exports: [PricingService],
})
export class PricingModule {}

