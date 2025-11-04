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

  /**
   * 获取IP池列表（用于价格覆盖管理）
   * 返回所有可用的国家/城市/IP类型组合
   */
  async getIpPool() {
    this.logger.log('[Get IP Pool] Loading IP pool data for price override management');

    // Mock IP池数据 - 26个地区，包含普通IP和原生IP
    const ipPool = [
      // 北美洲
      { country: 'US', countryName: '美国', city: 'Los Angeles', ipType: 'shared', ipTypeName: '普通IP', stock: 150, continent: 'north-america' },
      { country: 'US', countryName: '美国', city: 'New York', ipType: 'shared', ipTypeName: '普通IP', stock: 200, continent: 'north-america' },
      { country: 'US', countryName: '美国', city: 'Chicago', ipType: 'shared', ipTypeName: '普通IP', stock: 120, continent: 'north-america' },
      { country: 'CA', countryName: '加拿大', city: 'Toronto', ipType: 'shared', ipTypeName: '普通IP', stock: 80, continent: 'north-america' },
      
      // 亚洲
      { country: 'JP', countryName: '日本', city: 'Tokyo', ipType: 'shared', ipTypeName: '普通IP', stock: 120, continent: 'asia' },
      { country: 'JP', countryName: '日本', city: 'Tokyo', ipType: 'premium', ipTypeName: '原生IP', stock: 45, continent: 'asia' },
      { country: 'KR', countryName: '韩国', city: 'Seoul', ipType: 'shared', ipTypeName: '普通IP', stock: 150, continent: 'asia' },
      { country: 'KR', countryName: '韩国', city: 'Seoul', ipType: 'premium', ipTypeName: '原生IP', stock: 50, continent: 'asia' },
      { country: 'SG', countryName: '新加坡', city: 'Singapore', ipType: 'shared', ipTypeName: '普通IP', stock: 100, continent: 'asia' },
      { country: 'SG', countryName: '新加坡', city: 'Singapore', ipType: 'premium', ipTypeName: '原生IP', stock: 40, continent: 'asia' },
      { country: 'TH', countryName: '泰国', city: 'Bangkok', ipType: 'shared', ipTypeName: '普通IP', stock: 90, continent: 'asia' },
      { country: 'VN', countryName: '越南', city: 'Ho Chi Minh City', ipType: 'shared', ipTypeName: '普通IP', stock: 70, continent: 'asia' },
      
      // 欧洲
      { country: 'GB', countryName: '英国', city: 'London', ipType: 'shared', ipTypeName: '普通IP', stock: 180, continent: 'europe' },
      { country: 'GB', countryName: '英国', city: 'London', ipType: 'premium', ipTypeName: '原生IP', stock: 60, continent: 'europe' },
      { country: 'DE', countryName: '德国', city: 'Frankfurt', ipType: 'shared', ipTypeName: '普通IP', stock: 160, continent: 'europe' },
      { country: 'FR', countryName: '法国', city: 'Paris', ipType: 'shared', ipTypeName: '普通IP', stock: 140, continent: 'europe' },
      { country: 'NL', countryName: '荷兰', city: 'Amsterdam', ipType: 'shared', ipTypeName: '普通IP', stock: 130, continent: 'europe' },
      { country: 'IT', countryName: '意大利', city: 'Milan', ipType: 'shared', ipTypeName: '普通IP', stock: 85, continent: 'europe' },
      
      // 南美洲
      { country: 'BR', countryName: '巴西', city: 'Sao Paulo', ipType: 'shared', ipTypeName: '普通IP', stock: 110, continent: 'south-america' },
      { country: 'BR', countryName: '巴西', city: 'Sao Paulo', ipType: 'premium', ipTypeName: '原生IP', stock: 35, continent: 'south-america' },
      { country: 'AR', countryName: '阿根廷', city: 'Buenos Aires', ipType: 'shared', ipTypeName: '普通IP', stock: 75, continent: 'south-america' },
      { country: 'CL', countryName: '智利', city: 'Santiago', ipType: 'shared', ipTypeName: '普通IP', stock: 65, continent: 'south-america' },
      
      // 大洋洲
      { country: 'AU', countryName: '澳大利亚', city: 'Sydney', ipType: 'shared', ipTypeName: '普通IP', stock: 95, continent: 'oceania' },
      { country: 'AU', countryName: '澳大利亚', city: 'Melbourne', ipType: 'shared', ipTypeName: '普通IP', stock: 80, continent: 'oceania' },
      { country: 'NZ', countryName: '新西兰', city: 'Auckland', ipType: 'shared', ipTypeName: '普通IP', stock: 55, continent: 'oceania' },
      
      // 中东
      { country: 'AE', countryName: '阿联酋', city: 'Dubai', ipType: 'shared', ipTypeName: '普通IP', stock: 70, continent: 'middle-east' },
    ];

    // 获取所有价格配置（用于显示默认价格）
    const priceConfigs = await this.priceConfigRepo.find({
      where: { isActive: true },
    });

    // 获取所有价格覆盖（用于显示已覆盖价格）
    const overrides = await this.priceOverrideRepo.find({
      where: { isActive: true },
    });

    // 为每个IP池项目匹配默认价格和覆盖价格
    const ipPoolWithPrices = ipPool.map((item) => {
      // Mock环境下所有IP类型使用同一个价格配置
      const productType = 'static-residential';
      const priceConfig = priceConfigs.find(c => c.productType === productType);
      const defaultPrice = priceConfig ? parseFloat(priceConfig.basePrice as any) : 5;

      // 查找是否有价格覆盖
      const override = overrides.find(o => 
        o.priceConfigId === priceConfig?.id &&
        o.countryCode === item.country &&
        (o.cityName === item.city || o.cityName === null)
      );

      return {
        ...item,
        defaultPrice,
        overridePrice: override ? parseFloat(override.overridePrice as any) : null,
        overrideId: override?.id || null,
        priceConfigId: priceConfig?.id || null,
      };
    });

    this.logger.log(`[Get IP Pool] Loaded ${ipPoolWithPrices.length} IP pool items`);

    return {
      data: ipPoolWithPrices,
      total: ipPoolWithPrices.length,
      statistics: {
        totalRegions: ipPoolWithPrices.length,
        overridedCount: ipPoolWithPrices.filter(item => item.overridePrice !== null).length,
        notOverridedCount: ipPoolWithPrices.filter(item => item.overridePrice === null).length,
      },
    };
  }

  /**
   * 批量更新价格覆盖（用于价格覆盖管理页面）
   */
  async batchUpdatePriceOverrides(updates: Array<{
    country: string;
    city: string;
    ipType: string;
    overridePrice: number | null;
  }>) {
    this.logger.log(`[Batch Update] Processing ${updates.length} price override updates`);

    const results = [];

    for (const update of updates) {
      try {
        // Mock环境下所有IP类型使用同一个价格配置
        const productType = 'static-residential';
        
        // 查找价格配置
        const config = await this.priceConfigRepo.findOne({
          where: { productType, isActive: true },
        });

        if (!config) {
          results.push({
            location: `${update.country}/${update.city}`,
            success: false,
            error: 'Price config not found',
          });
          continue;
        }

        // 查找现有的覆盖
        const existing = await this.priceOverrideRepo.findOne({
          where: {
            priceConfigId: config.id,
            countryCode: update.country,
            cityName: update.city,
          },
        });

        if (update.overridePrice === null) {
          // 删除覆盖（恢复默认价格）
          if (existing) {
            await this.priceOverrideRepo.remove(existing);
            results.push({
              location: `${update.country}/${update.city}`,
              success: true,
              action: 'deleted',
            });
          } else {
            results.push({
              location: `${update.country}/${update.city}`,
              success: true,
              action: 'no-change',
            });
          }
        } else {
          // 创建或更新覆盖
          if (existing) {
            existing.overridePrice = update.overridePrice as any;
            await this.priceOverrideRepo.save(existing);
            results.push({
              location: `${update.country}/${update.city}`,
              success: true,
              action: 'updated',
            });
          } else {
            const override = this.priceOverrideRepo.create({
              priceConfigId: config.id,
              countryCode: update.country,
              cityName: update.city,
              overridePrice: update.overridePrice as any,
              isActive: true,
            });
            await this.priceOverrideRepo.save(override);
            results.push({
              location: `${update.country}/${update.city}`,
              success: true,
              action: 'created',
            });
          }
        }
      } catch (error) {
        results.push({
          location: `${update.country}/${update.city}`,
          success: false,
          error: error.message,
        });
      }
    }

    // 清除所有价格缓存
    this.clearAllPriceCache();
    this.logger.log(`[Batch Update] Completed. Success: ${results.filter(r => r.success).length}/${results.length}`);

    return {
      message: 'Batch update completed',
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    };
  }
}

