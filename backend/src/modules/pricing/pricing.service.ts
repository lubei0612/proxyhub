import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceConfig } from './entities/price-config.entity';
import { PriceOverride } from './entities/price-override.entity';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { CreatePriceOverrideDto, UpdatePriceOverrideDto } from './dto/create-price-override.dto';
import { UpdatePriceConfigDto } from './dto/update-price-config.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { GetRealtimePriceDto } from './dto/get-realtime-price.dto';
import { Proxy985Service } from '../proxy985/proxy985.service';

@Injectable()
export class PricingService implements OnModuleInit {
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
    @Inject(forwardRef(() => Proxy985Service))
    private readonly proxy985Service: Proxy985Service,
  ) {}

  /**
   * 模块初始化时执行 - 确保默认价格配置存在
   */
  async onModuleInit() {
    await this.ensureDefaultPriceConfigs();
  }

  /**
   * 获取实时价格（集成985Proxy API）
   * P1-2: 价格显示一致性功能
   */
  async getRealtimePrice(dto: GetRealtimePriceDto) {
    this.logger.log(`[Get Realtime Price] Product: ${dto.productType}, Duration: ${dto.duration} days`);

    // 生成缓存键
    const cacheKey = `realtime_${dto.productType}_${dto.duration}_${JSON.stringify(dto.locations)}`;
    
    // 检查缓存
    const cached = this.priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.log('[Get Realtime Price] Returning cached price');
      return cached.data;
    }

    try {
      // 调用985Proxy calculatePrice API
      const zone = process.env.PROXY_985_ZONE || '';
      const static_proxy_type = dto.productType.includes('native') ? 'premium' : 'shared';
      
      const buyData = dto.locations.map(loc => ({
        country_code: loc.country,
        city_name: loc.city || undefined,
        count: loc.quantity,
      }));

      this.logger.log(`[Get Realtime Price] Calling 985Proxy API with: ${JSON.stringify(buyData)}`);

      const response = await this.proxy985Service.calculatePrice({
        action: 'buy',
        zone,
        time_period: dto.duration,
        static_proxy_type,
        buy_data: buyData,
      });

      if (response.code !== 0) {
        throw new BadRequestException(`985Proxy API错误: ${response.msg}`);
      }

      const priceData = {
        totalPrice: parseFloat(response.data.pay_price || '0'),
        currency: 'USD',
        duration: dto.duration,
        locations: dto.locations.map((loc, index) => ({
          country: loc.country,
          city: loc.city,
          quantity: loc.quantity,
          unitPrice: parseFloat(response.data.pay_price || '0') / dto.locations.reduce((sum, l) => sum + l.quantity, 0),
        })),
        priceBreakdown: response.data.price_breakdown || [],
        source: '985Proxy',
        timestamp: new Date().toISOString(),
      };

      // 缓存结果
      this.priceCache.set(cacheKey, {
        data: priceData,
        timestamp: Date.now(),
      });

      this.logger.log(`[Get Realtime Price] Success: $${priceData.totalPrice}`);
      return priceData;

    } catch (error) {
      this.logger.error(`[Get Realtime Price] Failed: ${error.message}`);
      
      // 如果985Proxy API失败，回退到本地计算
      this.logger.warn('[Get Realtime Price] Falling back to local calculation');
      
      return this.calculatePrice({
        productType: dto.productType,
        buyData: dto.locations.map(loc => ({
          country_code: loc.country,
          city_name: loc.city || '',
          count: loc.quantity,
        })),
        timePeriod: dto.duration,
      });
    }
  }

  /**
   * 确保默认价格配置存在（自动初始化）
   */
  private async ensureDefaultPriceConfigs() {
    try {
      const defaultConfigs = [
        { productType: 'static-residential', basePrice: 5.00 },
        { productType: 'static-residential-native', basePrice: 8.00 }, // 修改为与inventory API一致
      ];

      for (const config of defaultConfigs) {
        const existing = await this.priceConfigRepo.findOne({
          where: { productType: config.productType },
        });

        if (!existing) {
          const newConfig = this.priceConfigRepo.create({
            productType: config.productType,
            basePrice: config.basePrice as any,
            isActive: true,
          });
          await this.priceConfigRepo.save(newConfig);
          this.logger.log(`[Init] Created default price config: ${config.productType} = $${config.basePrice}`);
        }
      }
    } catch (error) {
      this.logger.error('[Init] Failed to ensure default price configs:', error.message);
    }
  }

  /**
   * 计算价格（应用基础价格 + 覆盖价格）- 优化版本（带缓存）
   * @param dto 价格计算参数
   * @param userId 可选：用户ID，用于应用用户特定价格覆盖
   */
  async calculatePrice(dto: CalculatePriceDto, userId?: number) {
    this.logger.log(`[Calculate Price] Product: ${dto.productType}, Time: ${dto.timePeriod} days, User: ${userId || 'N/A'}`);

    // 1. 获取价格配置
    const priceConfig = await this.priceConfigRepo.findOne({
      where: { productType: dto.productType, isActive: true },
    });

    if (!priceConfig) {
      throw new NotFoundException(`Price config not found for ${dto.productType}`);
    }

    // 2. 查询价格覆盖（全局 + 用户特定）
    const whereConditions: any[] = [
      { priceConfigId: priceConfig.id, userId: null, isActive: true }, // 全局覆盖
    ];
    
    if (userId) {
      whereConditions.push({ priceConfigId: priceConfig.id, userId, isActive: true }); // 用户特定覆盖
    }

    const overrides = await this.priceOverrideRepo.find({
      where: whereConditions,
    });

    this.logger.log(`[Calculate Price] Found ${overrides.length} overrides (${overrides.filter(o => o.userId === null).length} global, ${overrides.filter(o => o.userId === userId).length} user-specific)`);

    // 3. 构建覆盖价格Map（优先级：用户特定 > 全局）
    const overrideMap = new Map<string, number>();
    
    // 先添加全局覆盖
    overrides
      .filter((o: any) => o.userId === null)
      .forEach((o: any) => {
        const key = o.cityName 
          ? `${o.countryCode}:${o.cityName}`
          : o.countryCode;
        overrideMap.set(key, parseFloat(o.overridePrice as any));
      });
    
    // 再添加用户特定覆盖（会覆盖全局设置）
    if (userId) {
      overrides
        .filter((o: any) => o.userId === userId)
        .forEach((o: any) => {
          const key = o.cityName 
            ? `${o.countryCode}:${o.cityName}`
            : o.countryCode;
          overrideMap.set(key, parseFloat(o.overridePrice as any));
          this.logger.log(`[Calculate Price] Applied user-specific override: ${key} = $${o.overridePrice}`);
        });
    }

    // 4. 并行计算所有项目价格（性能优化）
    const months = dto.timePeriod / 30;
    const basePrice = parseFloat(priceConfig.basePrice as any);
    
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
   * 获取指定产品类型的价格覆盖（用于inventory API）
   */
  async getPriceOverridesForInventory(productType: string) {
    this.logger.log(`[Get Price Overrides] Product Type: ${productType}`);

    try {
      // 查找价格配置
      const priceConfig = await this.priceConfigRepo.findOne({
        where: { productType, isActive: true },
      });

      if (!priceConfig) {
        this.logger.warn(`[Get Price Overrides] No price config found for ${productType}`);
        return [];
      }

      // 查找所有该产品类型的价格覆盖
      const overrides = await this.priceOverrideRepo.find({
        where: { 
          priceConfigId: priceConfig.id,
          isActive: true 
        },
      });

      this.logger.log(`[Get Price Overrides] Found ${overrides.length} overrides for ${productType}`);
      return overrides;
    } catch (error) {
      this.logger.error(`[Get Price Overrides] Failed: ${error.message}`);
      return [];
    }
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
   * 从985Proxy API动态获取
   */
  async getIpPool() {
    this.logger.log('[Get IP Pool] Loading IP pool data from 985Proxy API');

    try {
      // 从985Proxy API获取shared和premium库存
      const [sharedInventory, premiumInventory] = await Promise.all([
        this.proxy985Service.getInventory({ static_proxy_type: 'shared' }),
        this.proxy985Service.getInventory({ static_proxy_type: 'premium' }),
      ]);

      const ipPool = [];

      // 处理普通IP (shared)
      if (sharedInventory.code === 0 && sharedInventory.data) {
        for (const item of sharedInventory.data) {
          if (item.city_name) {
            ipPool.push({
              country: item.country_code,
              countryName: item.country_code, // 985Proxy只返回国家代码
              city: item.city_name,
              ipType: 'shared',
              ipTypeName: '普通IP',
              stock: item.number || 0,
              continent: this.getContinent(item.country_code),
            });
          }
        }
      }

      // 处理原生IP (premium)
      if (premiumInventory.code === 0 && premiumInventory.data) {
        for (const item of premiumInventory.data) {
          if (item.city_name) {
            ipPool.push({
              country: item.country_code,
              countryName: item.country_code,
              city: item.city_name,
              ipType: 'premium',
              ipTypeName: '原生IP',
              stock: item.number || 0,
              continent: this.getContinent(item.country_code),
            });
          }
        }
      }

      this.logger.log(`[Get IP Pool] Fetched ${ipPool.length} locations from 985Proxy API`);

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
        // 根据IP类型选择正确的价格配置
        const productType = (item.ipType === 'premium' || item.ipType === 'native')
          ? 'static-residential-native'
          : 'static-residential';
        
        const priceConfig = priceConfigs.find(c => c.productType === productType);
        const defaultPrice = priceConfig 
          ? parseFloat(priceConfig.basePrice as any) 
          : (item.ipType === 'premium' ? 8 : 5); // fallback价格

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
    } catch (error) {
      this.logger.error(`[Get IP Pool] Failed to fetch from 985Proxy: ${error.message}`);
      // 返回空数据
      return {
        data: [],
        total: 0,
        statistics: {
          totalRegions: 0,
          overridedCount: 0,
          notOverridedCount: 0,
        },
      };
    }
  }

  /**
   * 根据国家代码判断所属大洲
   */
  private getContinent(countryCode: string): string {
    const continentMap = {
      // 北美洲
      'US': 'north-america', 'CA': 'north-america', 'MX': 'north-america',
      // 南美洲
      'BR': 'south-america', 'AR': 'south-america', 'CL': 'south-america', 
      'CO': 'south-america', 'PE': 'south-america',
      // 欧洲
      'GB': 'europe', 'DE': 'europe', 'FR': 'europe', 'IT': 'europe', 
      'ES': 'europe', 'NL': 'europe', 'SE': 'europe', 'NO': 'europe',
      'PL': 'europe', 'RO': 'europe', 'BE': 'europe', 'AT': 'europe',
      // 亚洲
      'JP': 'asia', 'KR': 'asia', 'CN': 'asia', 'SG': 'asia', 
      'TH': 'asia', 'VN': 'asia', 'MY': 'asia', 'PH': 'asia',
      'IN': 'asia', 'ID': 'asia', 'TW': 'asia', 'HK': 'asia',
      // 大洋洲
      'AU': 'oceania', 'NZ': 'oceania',
      // 中东
      'AE': 'middle-east', 'SA': 'middle-east', 'IL': 'middle-east',
      // 非洲
      'ZA': 'africa', 'EG': 'africa', 'NG': 'africa',
    };

    return continentMap[countryCode] || 'other';
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
        // 根据IP类型确定产品类型
        const productType = (update.ipType === 'premium' || update.ipType === 'native')
          ? 'static-residential-native'
          : 'static-residential';
        
        this.logger.log(`[Batch Update] ${update.country}/${update.city} (${update.ipType}) -> ${productType}`);
        
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

  /**
   * 获取用户级IP池（用于价格覆盖管理）
   * 返回IP池列表，包含基础价格、全局覆盖价格和用户特定覆盖价格
   */
  async getUserIpPoolForPriceOverride(userId: number) {
    this.logger.log(`[Get User IP Pool] Loading IP pool for user ${userId}`);

    // 1. 从985Proxy API获取库存列表
    const sharedInventory = await this.proxy985Service.getInventory({
      static_proxy_type: 'shared',
    });

    const premiumInventory = await this.proxy985Service.getInventory({
      static_proxy_type: 'premium',
    });

    // 2. 获取所有价格覆盖（全局和用户特定）
    const allOverrides = await this.priceOverrideRepo.find({
      where: [
        { userId: null }, // 全局覆盖
        { userId }, // 用户特定覆盖
      ],
    });

    // 3. 构建IP池数据
    const ipPool = [];

    // 处理共享IP
    if (sharedInventory.data && Array.isArray(sharedInventory.data)) {
      for (const item of sharedInventory.data) {
        const globalOverride = allOverrides.find(
          o => o.userId === null && 
               o.countryCode === item.country_code && 
               (o.cityName === item.city_name || (!o.cityName && !item.city_name))
        );
        const userOverride = allOverrides.find(
          o => o.userId === userId && 
               o.countryCode === item.country_code && 
               (o.cityName === item.city_name || (!o.cityName && !item.city_name))
        );

        ipPool.push({
          country: item.country_code,
          countryName: item.country_name || item.country_code,
          city: item.city_name || 'All Cities',
          ipType: 'shared',
          ipTypeName: '普通IP',
          defaultPrice: parseFloat(item.price || item.unit_price || '0'),
          globalOverridePrice: globalOverride ? parseFloat(globalOverride.overridePrice.toString()) : null,
          userOverridePrice: userOverride ? parseFloat(userOverride.overridePrice.toString()) : null,
          stock: parseInt(item.number || item.inventory_num || '0'),
        });
      }
    }

    // 处理原生IP
    if (premiumInventory.data && Array.isArray(premiumInventory.data)) {
      for (const item of premiumInventory.data) {
        const globalOverride = allOverrides.find(
          o => o.userId === null && 
               o.countryCode === item.country_code && 
               (o.cityName === item.city_name || (!o.cityName && !item.city_name))
        );
        const userOverride = allOverrides.find(
          o => o.userId === userId && 
               o.countryCode === item.country_code && 
               (o.cityName === item.city_name || (!o.cityName && !item.city_name))
        );

        ipPool.push({
          country: item.country_code,
          countryName: item.country_name || item.country_code,
          city: item.city_name || 'All Cities',
          ipType: 'premium',
          ipTypeName: '原生IP',
          defaultPrice: parseFloat(item.price || item.unit_price || '0'),
          globalOverridePrice: globalOverride ? parseFloat(globalOverride.overridePrice.toString()) : null,
          userOverridePrice: userOverride ? parseFloat(userOverride.overridePrice.toString()) : null,
          stock: parseInt(item.number || item.inventory_num || '0'),
        });
      }
    }

    this.logger.log(`[Get User IP Pool] Loaded ${ipPool.length} IP regions for user ${userId}`);
    return ipPool;
  }

  /**
   * 批量更新用户级价格覆盖
   * @param userId 用户ID
   * @param updates 更新数组 [{ country, city, ipType, overridePrice }]
   */
  async batchUpdateUserPriceOverrides(
    userId: number,
    updates: Array<{ country: string; city: string; ipType: string; overridePrice: number | null }>
  ) {
    this.logger.log(`[Batch Update User Overrides] Processing ${updates.length} updates for user ${userId}`);

    // 1. 找到static-shared和static-premium配置
    const configs = await this.priceConfigRepo.find({
      where: [
        { productType: 'static-shared' },
        { productType: 'static-premium' },
      ],
    });

    const sharedConfig = configs.find(c => c.productType === 'static-shared');
    const premiumConfig = configs.find(c => c.productType === 'static-premium');

    if (!sharedConfig || !premiumConfig) {
      throw new NotFoundException('Price config not found for static proxies');
    }

    const results = [];

    // 2. 处理每个更新
    for (const update of updates) {
      try {
        const config = update.ipType === 'premium' ? premiumConfig : sharedConfig;
        
        // 查找现有用户覆盖
        const existing = await this.priceOverrideRepo.findOne({
          where: {
            userId,
            priceConfigId: config.id,
            countryCode: update.country,
            cityName: update.city === 'All Cities' ? null : update.city,
          },
        });

        if (update.overridePrice === null) {
          // 删除覆盖
          if (existing) {
            await this.priceOverrideRepo.remove(existing);
            results.push({
              location: `${update.country}/${update.city}`,
              success: true,
              action: 'removed',
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
              userId, // 设置userId，标记为用户特定覆盖
              priceConfigId: config.id,
              countryCode: update.country,
              cityName: update.city === 'All Cities' ? null : update.city,
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

    // 清除价格缓存
    this.clearAllPriceCache();
    this.logger.log(`[Batch Update User Overrides] Completed. Success: ${results.filter(r => r.success).length}/${results.length}`);

    return {
      message: 'User price overrides updated',
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    };
  }
}

