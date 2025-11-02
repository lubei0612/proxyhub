import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceConfig } from './entities/price-config.entity';
import { PriceOverride } from './entities/price-override.entity';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceConfig, PriceOverride, ExchangeRate]),
  ],
  providers: [PricingService],
  controllers: [PricingController],
  exports: [PricingService],
})
export class PricingModule {}

