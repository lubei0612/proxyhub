import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceConfig } from './entities/price-config.entity';
import { PriceOverride } from './entities/price-override.entity';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { CreatePriceOverrideDto, UpdatePriceOverrideDto } from './dto/create-price-override.dto';
import { UpdatePriceConfigDto } from './dto/update-price-config.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);
  
  // 价格缓存（内存缓存）
  private priceCache = new Map<string, any>();
  private readonly CACHE_TTL = 3600000; // 1小时（毫秒）

  constructor(
    @InjectRepository(PriceConfig)
    private readonly priceConfigRepo: Repository<PriceConfig>,
    @InjectRepository(PriceOverride)
    private readonly priceOverrideRepo: Repository<PriceOverride>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepo: Repository<ExchangeRate>,
  ) {}

  /**
   * 计算价格（应用基础价格 + 覆盖价格）- 优化版本（带缓存）
   */
  async calculatePrice(dto: CalculatePriceDto) {
    this.logger.log(`[Calculate Price] Product: ${dto.productType}, Time: ${dto.timePeriod} days`);

    // 1. 尝试从缓存获取价格配置
    const cacheKey = `price:${dto.productType}`;
    let priceData = this.priceCache.get(cacheKey);
    
    if (!priceData || Date.now() - priceData.timestamp > this.CACHE_TTL) {
      this.logger.log(`[Cache Miss] Loading price data for ${dto.productType}`);
      
      // 2. 并行查询基础价格和覆盖价格（性能优化）
      const [priceConfig, overrides] = await Promise.all([
        this.priceConfigRepo.findOne({
          where: { productType: dto.productType, isActive: true },
        }),
        this.priceOverrideRepo.find({
          where: { isActive: true },
        }),
      ]);

      if (!priceConfig) {
        throw new NotFoundException(`Price config not found for ${dto.productType}`);
      }

      priceData = {
        priceConfig,
        overrides,
        timestamp: Date.now(),
      };
      
      this.priceCache.set(cacheKey, priceData);
      this.logger.log(`[Cache Updated] Price data cached for ${dto.productType}`);
    } else {
      this.logger.log(`[Cache Hit] Using cached price data for ${dto.productType}`);
    }

    // 3. 构建覆盖价格Map（O(1)查找，性能优化）
    const overrideMap = new Map<string, number>();
    priceData.overrides
      .filter((o: any) => o.priceConfigId === priceData.priceConfig.id)
      .forEach((o: any) => {
        const key = o.cityName 
          ? `${o.countryCode}:${o.cityName}`
          : o.countryCode;
        overrideMap.set(key, parseFloat(o.overridePrice as any));
      });

    // 4. 并行计算所有项目价格（性能优化）
    const months = dto.timePeriod / 30;
    const basePrice = parseFloat(priceData.priceConfig.basePrice as any);
    
    const breakdown = dto.buyData.map((item) => {
      // 查找价格（城市级 > 国家级 > 基础价格）
      const cityKey = item.city_name ? `${item.country_code}:${item.city_name}` : null;
      const countryKey = item.country_code;
      
      const unitPrice = 
        (cityKey && overrideMap.get(cityKey)) ||
        overrideMap.get(countryKey) ||
        basePrice;

      const subtotal = unitPrice * item.count * months;

      return {
        location: item.city_name
          ? `${item.country_code}/${item.city_name}`
          : item.country_code,
        quantity: item.count,
        unitPrice,
        subtotal: parseFloat(subtotal.toFixed(2)),
      };
    });

    // 5. 计算总价
    const totalPrice = breakdown.reduce((sum, item) => sum + item.subtotal, 0);

    // 6. 应用优惠码（如果有）
    let discountAmount = 0;
    // TODO: 实现优惠码逻辑

    const finalPrice = totalPrice - discountAmount;

    return {
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalPrice: parseFloat(finalPrice.toFixed(2)),
      breakdown,
      currency: 'USD',
    };
  }

  /**
   * 获取所有价格配置
   */
  async getAllPriceConfigs() {
    return this.priceConfigRepo.find({
      order: { productType: 'ASC' },
    });
  }

  /**
   * 更新价格配置
   */
  async updatePriceConfig(id: number, dto: UpdatePriceConfigDto) {
    const config = await this.priceConfigRepo.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException('Price config not found');
    }

    if (dto.basePrice !== undefined) {
      config.basePrice = dto.basePrice as any;
    }
    if (dto.isActive !== undefined) {
      config.isActive = dto.isActive;
    }

    await this.priceConfigRepo.save(config);
    
    // 清除相关缓存
    this.clearPriceCache(config.productType);
    this.logger.log(`[Cache Cleared] Price cache cleared for ${config.productType}`);
    
    return { message: 'Price config updated', config };
  }

  /**
   * 获取所有价格覆盖
   */
  async getAllPriceOverrides(productType?: string) {
    const query: any = { isActive: true };
    
    if (productType) {
      const config = await this.priceConfigRepo.findOne({
        where: { productType, isActive: true },
      });
      if (config) {
        query.priceConfigId = config.id;
      }
    }

    return this.priceOverrideRepo.find({
      where: query,
      order: { countryCode: 'ASC', cityName: 'ASC' },
    });
  }

  /**
   * 创建价格覆盖
   */
  async createPriceOverride(dto: CreatePriceOverrideDto) {
    // 查找价格配置
    const config = await this.priceConfigRepo.findOne({
      where: { productType: dto.productType, isActive: true },
    });

    if (!config) {
      throw new NotFoundException(`Price config not found for ${dto.productType}`);
    }

    // 检查是否已存在相同的覆盖
    const existing = await this.priceOverrideRepo.findOne({
      where: {
        priceConfigId: config.id,
        countryCode: dto.countryCode,
        cityName: dto.cityName || null,
      },
    });

    if (existing) {
      throw new BadRequestException('Price override already exists for this location');
    }

    const override = this.priceOverrideRepo.create({
      priceConfigId: config.id,
      countryCode: dto.countryCode,
      cityName: dto.cityName,
      overridePrice: dto.overridePrice as any,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    await this.priceOverrideRepo.save(override);
    
    // 清除相关缓存
    this.clearPriceCache(dto.productType);
    this.logger.log(`[Cache Cleared] Price cache cleared for ${dto.productType} after creating override`);
    
    return { message: 'Price override created', override };
  }

  /**
   * 更新价格覆盖
   */
  async updatePriceOverride(id: number, dto: UpdatePriceOverrideDto) {
    const override = await this.priceOverrideRepo.findOne({ 
      where: { id },
      relations: ['priceConfig'],
    });
    if (!override) {
      throw new NotFoundException('Price override not found');
    }

    if (dto.overridePrice !== undefined) {
      override.overridePrice = dto.overridePrice as any;
    }
    if (dto.isActive !== undefined) {
      override.isActive = dto.isActive;
    }

    await this.priceOverrideRepo.save(override);
    
    // 清除所有价格缓存（因为覆盖可能影响所有产品类型）
    this.clearAllPriceCache();
    this.logger.log(`[Cache Cleared] All price cache cleared after updating override #${id}`);
    
    return { message: 'Price override updated', override };
  }

  /**
   * 删除价格覆盖
   */
  async deletePriceOverride(id: number) {
    const override = await this.priceOverrideRepo.findOne({ 
      where: { id },
      relations: ['priceConfig'],
    });
    if (!override) {
      throw new NotFoundException('Price override not found');
    }

    await this.priceOverrideRepo.remove(override);
    
    // 清除所有价格缓存
    this.clearAllPriceCache();
    this.logger.log(`[Cache Cleared] All price cache cleared after deleting override #${id}`);
    
    return { message: 'Price override deleted' };
  }

  /**
   * 获取汇率
   */
  async getExchangeRate(from: string, to: string) {
    const rate = await this.exchangeRateRepo.findOne({
      where: { fromCurrency: from, toCurrency: to },
    });

    if (!rate) {
      throw new NotFoundException(`Exchange rate not found for ${from} -> ${to}`);
    }

    return {
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: parseFloat(rate.rate as any),
      updatedAt: rate.updatedAt,
    };
  }

  /**
   * 更新汇率
   */
  async updateExchangeRate(dto: UpdateExchangeRateDto) {
    let rate = await this.exchangeRateRepo.findOne({
      where: { fromCurrency: dto.fromCurrency, toCurrency: dto.toCurrency },
    });

    if (!rate) {
      rate = this.exchangeRateRepo.create({
        fromCurrency: dto.fromCurrency,
        toCurrency: dto.toCurrency,
        rate: dto.rate as any,
      });
    } else {
      rate.rate = dto.rate as any;
    }

    await this.exchangeRateRepo.save(rate);
    return { message: 'Exchange rate updated', rate };
  }

  /**
   * 清除指定产品类型的价格缓存
   */
  private clearPriceCache(productType: string) {
    const cacheKey = `price:${productType}`;
    this.priceCache.delete(cacheKey);
  }

  /**
   * 清除所有价格缓存
   */
  private clearAllPriceCache() {
    this.priceCache.clear();
  }

  /**
   * 获取缓存统计信息（用于监控）
   */
  getCacheStats() {
    return {
      size: this.priceCache.size,
      ttl: this.CACHE_TTL,
      keys: Array.from(this.priceCache.keys()),
    };
  }
}

