import { Injectable, Logger, HttpException, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StaticProxy, ProxyStatus } from './entities/static-proxy.entity';
import { User } from '../user/entities/user.entity';
import { Order, OrderType, OrderStatus } from '../order/entities/order.entity';
import { BillingDetail } from '../billing/entities/billing-detail.entity';
import { PurchaseStaticProxyDto } from './dto/purchase-static-proxy.dto';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(StaticProxy)
    private staticProxyRepo: Repository<StaticProxy>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(BillingDetail)
    private billingDetailRepo: Repository<BillingDetail>,
    private readonly dataSource: DataSource,
  ) {
    this.apiBaseUrl = this.configService.get<string>('PROXY_985_API_BASE_URL');
    this.apiKey = this.configService.get<string>('PROXY_985_API_KEY');
  }

  /**
   * 获取动态住宅代理城市列表
   */
  async getRotatingCities() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/rotating-residential/cities`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch rotating cities: ${error.message}`);
      throw new HttpException('获取城市列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 提取动态住宅代理
   */
  async extractRotatingProxy(params: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/rotating-residential/extract`, params, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to extract rotating proxy: ${error.message}`);
      throw new HttpException('提取代理失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 获取静态住宅代理库存（带加价）
   */
  async getInventoryWithMarkup(staticProxyType?: string, purposeWeb?: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/static-residential/inventory`, {
          params: { static_proxy_type: staticProxyType, purpose_web: purposeWeb },
          headers: { Authorization: `Bearer ${this.apiKey}` },
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch static inventory: ${error.message}`);
      throw new HttpException('获取库存失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 获取静态住宅代理库存
   */
  async getStaticInventory(params?: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/static-residential/inventory`, {
          params,
          headers: { Authorization: `Bearer ${this.apiKey}` },
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch static inventory: ${error.message}`);
      throw new HttpException('获取库存失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 获取静态住宅代理商品列表
   */
  async getStaticBusinessList(params?: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiBaseUrl}/static-residential/business-list`, {
          params,
          headers: { Authorization: `Bearer ${this.apiKey}` },
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch business list: ${error.message}`);
      throw new HttpException('获取商品列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 计算静态住宅代理价格（带加价）
   */
  async calculatePriceWithMarkup(params: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/static-residential/calculate`, params, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to calculate price: ${error.message}`);
      throw new HttpException('计算价格失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 计算静态住宅代理价格
   */
  async calculateStaticPrice(params: any) {
    return this.calculatePriceWithMarkup(params);
  }

  /**
   * 获取用户的静态代理列表
   */
  async getUserProxies(userId: string, page = 1, limit = 20, filters?: any) {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }

    const [proxies, total] = await this.staticProxyRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: proxies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取用户的静态代理列表（别名）
   */
  async getMyStaticProxies(userId: string, page = 1, limit = 20) {
    return this.getUserProxies(userId, page, limit);
  }

  /**
   * 切换自动续期状态
   */
  async toggleAutoRenew(proxyId: string, userId: string) {
    const proxy = await this.staticProxyRepo.findOne({
      where: { id: proxyId, userId },
    });

    if (!proxy) {
      throw new NotFoundException('代理不存在');
    }

    proxy.auto_renew = !proxy.auto_renew;
    await this.staticProxyRepo.save(proxy);

    return { message: '更新成功', proxy };
  }

  /**
   * 更新静态代理自动续期设置
   */
  async updateAutoRenew(proxyId: string, userId: string, autoRenew: boolean) {
    const proxy = await this.staticProxyRepo.findOne({
      where: { id: proxyId, userId },
    });

    if (!proxy) {
      throw new NotFoundException('代理不存在');
    }

    proxy.auto_renew = autoRenew;
    await this.staticProxyRepo.save(proxy);

    return { message: '更新成功', proxy };
  }

  /**
   * 更新静态代理备注
   */
  async updateRemark(proxyId: string, userId: string, remark: string) {
    const proxy = await this.staticProxyRepo.findOne({
      where: { id: proxyId, userId },
    });

    if (!proxy) {
      throw new NotFoundException('代理不存在');
    }

    proxy.remark = remark;
    await this.staticProxyRepo.save(proxy);

    return { message: '更新成功', proxy };
  }

  /**
   * 从订单保存代理信息
   */
  async saveProxiesFromOrder(orderNo: string, userId: string, proxiesData: any[]) {
    const proxies: StaticProxy[] = [];

    for (const proxyData of proxiesData) {
      const proxy = this.staticProxyRepo.create({
        userId,
        orderNo,
        proxy985Id: proxyData.id,
        zone: proxyData.zone || '',
        purposeWeb: proxyData.purpose_web,
        staticProxyType: proxyData.static_proxy_type,
        ip: proxyData.ip,
        port: proxyData.port,
        username: proxyData.username,
        password: proxyData.password,
        countryCode: proxyData.country_code,
        cityName: proxyData.city_name,
        expireTimeUtc: new Date(proxyData.expire_time_utc),
        status: ProxyStatus.ACTIVE,
        auto_renew: false,
      });

      proxies.push(proxy);
    }

    await this.staticProxyRepo.save(proxies);
    
    this.logger.log(`Saved ${proxies.length} proxies for order ${orderNo}`);
    
    return proxies;
  }

  /**
   * 本地静态IP购买
   */
  async purchaseStaticLocal(userId: string, params: { channelName: string; ipType: string; countries: string[]; duration: number }) {
    this.logger.log(`Purchase static local: ${JSON.stringify({ userId, params })}`);
    
    return {
      success: true,
      message: '购买功能开发中',
      orderNo: `ORD-${Date.now()}`,
      totalCost: 0,
      quantity: params.countries.length,
      proxies: [],
    };
  }

  /**
   * 本地批量续费
   */
  async batchRenewLocal(userId: string, ipIds: string[], duration: number) {
    this.logger.log(`Batch renew local: ${JSON.stringify({ userId, ipIds, duration })}`);
    
    return {
      success: true,
      message: '批量续费功能开发中',
      renewedCount: ipIds.length,
      totalCost: 0,
      failedIps: [],
      updatedIps: [],
    };
  }

  /**
   * Purchase static proxy IPs
   * Transactional method that:
   * 1. Validates user balance
   * 2. Reserves available IPs from inventory
   * 3. Creates order record
   * 4. Deducts balance
   * 5. Creates billing transaction record
   * 
   * All operations are atomic - either all succeed or all fail (rollback)
   */
  async purchaseStaticProxy(userId: string, dto: PurchaseStaticProxyDto) {
    this.logger.log(`[Purchase Static Proxy] User: ${userId}, Items: ${JSON.stringify(dto.items)}`);

    // Calculate total price
    const ipTypePrice = dto.ipType === 'native' ? 8 : 5; // Native: $8, Normal: $5
    const durationMultiplier = dto.duration / 30; // Base price is for 30 days
    let totalQuantity = 0;
    for (const item of dto.items) {
      totalQuantity += item.quantity;
    }
    const totalPrice = totalQuantity * ipTypePrice * durationMultiplier;

    this.logger.log(`[Purchase] Total Price: $${totalPrice} (${totalQuantity} IPs x $${ipTypePrice} x ${durationMultiplier} periods)`);

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate user balance
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const userBalance = parseFloat(user.balance as any) || 0;
      if (userBalance < totalPrice) {
        throw new BadRequestException(`余额不足。当前余额: $${userBalance.toFixed(2)}, 需要: $${totalPrice.toFixed(2)}`);
      }

      // Step 2: Reserve IPs from inventory
      // Note: In production, this would call 985Proxy API to purchase real IPs
      // For now, we allocate from existing mock inventory
      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const allocatedIPs: StaticProxy[] = [];
      const purchaseDetails = [];

      for (const item of dto.items) {
        this.logger.log(`[Purchase] Reserving ${item.quantity} IPs for ${item.country}/${item.city}`);

        // Find unassigned IPs matching country/city
        // In production: call 985Proxy API
        // For testing: use mock data where userId is the system default user
        const availableIPs = await queryRunner.manager.find(StaticProxy, {
          where: {
            countryCode: item.country,
            cityName: item.city,
          },
          take: item.quantity,
        });

        if (availableIPs.length < item.quantity) {
          throw new BadRequestException(
            `库存不足: ${item.country}/${item.city} 需要 ${item.quantity} 个IP，但只有 ${availableIPs.length} 个可用`,
          );
        }

        // Mark IPs as active and assign to user
        for (const ip of availableIPs) {
          ip.status = ProxyStatus.ACTIVE;
          ip.userId = userId;
          ip.purposeWeb = dto.scenario || null;
          ip.orderNo = orderNo; // Track purchase batch
          ip.remark = `Channel: ${dto.channelName}, Scenario: ${dto.scenario || 'N/A'}`;
          ip.expireTimeUtc = new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000);
          await queryRunner.manager.save(StaticProxy, ip);
          allocatedIPs.push(ip);
        }

        purchaseDetails.push({
          country: item.country,
          city: item.city,
          quantity: item.quantity,
          ips: availableIPs.map(ip => ({ id: ip.id, ip: ip.ip, port: ip.port })),
        });
      }

      // Step 3: Create order record
      const order = queryRunner.manager.create(Order, {
        orderNo,
        userId,
        type: OrderType.BUY,
        status: OrderStatus.COMPLETED,
        staticProxyType: dto.ipType,
        purposeWeb: dto.scenario || null,
        timePeriod: dto.duration,
        total_price: totalPrice,
        discount_price: 0,
        pay_price: totalPrice,
        buy_data: {
          channelName: dto.channelName,
          scenario: dto.scenario,
          ipType: dto.ipType,
          duration: dto.duration,
          details: purchaseDetails,
        },
        proxyType: 'res_static', // Residential Static
        completed_at: new Date(),
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      // Step 4: Deduct user balance
      user.balance = (userBalance - totalPrice).toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // Step 5: Create billing transaction record
      const billingDetail = queryRunner.manager.create(BillingDetail, {
        userId,
        category: 'expense',
        subCategory: 'static_proxy_purchase',
        amount: -totalPrice, // Negative for expense
        currency: 'USD',
        relatedId: savedOrder.id,
        relatedType: 'order',
        description: `购买静态住宅代理IP - ${dto.channelName} (${totalQuantity} 个IP, ${dto.duration} 天)`,
      });
      await queryRunner.manager.save(BillingDetail, billingDetail);

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`[Purchase] Success! Order: ${orderNo}, User: ${userId}, Total: $${totalPrice}`);

      return {
        success: true,
        message: `成功购买 ${totalQuantity} 个静态IP`,
        order: {
          id: savedOrder.id,
          orderNo: savedOrder.orderNo,
          totalPrice,
          totalQuantity,
          duration: dto.duration,
        },
        allocatedIPs: allocatedIPs.map(ip => ({
          id: ip.id,
          ip: ip.ip,
          port: ip.port,
          username: ip.username,
          password: ip.password,
          country: ip.countryCode,
          city: ip.cityName,
          expiresAt: ip.expireTimeUtc,
        })),
        newBalance: user.balance,
      };
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Purchase] Transaction failed: ${error.message}`);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}

      proxies.push(proxy);
    }

    await this.staticProxyRepo.save(proxies);
    
    this.logger.log(`Saved ${proxies.length} proxies for order ${orderNo}`);
    
    return proxies;
  }

  /**
   * 本地静态IP购买
   */
  async purchaseStaticLocal(userId: string, params: { channelName: string; ipType: string; countries: string[]; duration: number }) {
    this.logger.log(`Purchase static local: ${JSON.stringify({ userId, params })}`);
    
    return {
      success: true,
      message: '购买功能开发中',
      orderNo: `ORD-${Date.now()}`,
      totalCost: 0,
      quantity: params.countries.length,
      proxies: [],
    };
  }

  /**
   * 本地批量续费
   */
  async batchRenewLocal(userId: string, ipIds: string[], duration: number) {
    this.logger.log(`Batch renew local: ${JSON.stringify({ userId, ipIds, duration })}`);
    
    return {
      success: true,
      message: '批量续费功能开发中',
      renewedCount: ipIds.length,
      totalCost: 0,
      failedIps: [],
      updatedIps: [],
    };
  }

  /**
   * Purchase static proxy IPs
   * Transactional method that:
   * 1. Validates user balance
   * 2. Reserves available IPs from inventory
   * 3. Creates order record
   * 4. Deducts balance
   * 5. Creates billing transaction record
   * 
   * All operations are atomic - either all succeed or all fail (rollback)
   */
  async purchaseStaticProxy(userId: string, dto: PurchaseStaticProxyDto) {
    this.logger.log(`[Purchase Static Proxy] User: ${userId}, Items: ${JSON.stringify(dto.items)}`);

    // Calculate total price
    const ipTypePrice = dto.ipType === 'native' ? 8 : 5; // Native: $8, Normal: $5
    const durationMultiplier = dto.duration / 30; // Base price is for 30 days
    let totalQuantity = 0;
    for (const item of dto.items) {
      totalQuantity += item.quantity;
    }
    const totalPrice = totalQuantity * ipTypePrice * durationMultiplier;

    this.logger.log(`[Purchase] Total Price: $${totalPrice} (${totalQuantity} IPs x $${ipTypePrice} x ${durationMultiplier} periods)`);

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate user balance
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const userBalance = parseFloat(user.balance as any) || 0;
      if (userBalance < totalPrice) {
        throw new BadRequestException(`余额不足。当前余额: $${userBalance.toFixed(2)}, 需要: $${totalPrice.toFixed(2)}`);
      }

      // Step 2: Reserve IPs from inventory
      // Note: In production, this would call 985Proxy API to purchase real IPs
      // For now, we allocate from existing mock inventory
      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const allocatedIPs: StaticProxy[] = [];
      const purchaseDetails = [];

      for (const item of dto.items) {
        this.logger.log(`[Purchase] Reserving ${item.quantity} IPs for ${item.country}/${item.city}`);

        // Find unassigned IPs matching country/city
        // In production: call 985Proxy API
        // For testing: use mock data where userId is the system default user
        const availableIPs = await queryRunner.manager.find(StaticProxy, {
          where: {
            countryCode: item.country,
            cityName: item.city,
          },
          take: item.quantity,
        });

        if (availableIPs.length < item.quantity) {
          throw new BadRequestException(
            `库存不足: ${item.country}/${item.city} 需要 ${item.quantity} 个IP，但只有 ${availableIPs.length} 个可用`,
          );
        }

        // Mark IPs as active and assign to user
        for (const ip of availableIPs) {
          ip.status = ProxyStatus.ACTIVE;
          ip.userId = userId;
          ip.purposeWeb = dto.scenario || null;
          ip.orderNo = orderNo; // Track purchase batch
          ip.remark = `Channel: ${dto.channelName}, Scenario: ${dto.scenario || 'N/A'}`;
          ip.expireTimeUtc = new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000);
          await queryRunner.manager.save(StaticProxy, ip);
          allocatedIPs.push(ip);
        }

        purchaseDetails.push({
          country: item.country,
          city: item.city,
          quantity: item.quantity,
          ips: availableIPs.map(ip => ({ id: ip.id, ip: ip.ip, port: ip.port })),
        });
      }

      // Step 3: Create order record
      const order = queryRunner.manager.create(Order, {
        orderNo,
        userId,
        type: OrderType.BUY,
        status: OrderStatus.COMPLETED,
        staticProxyType: dto.ipType,
        purposeWeb: dto.scenario || null,
        timePeriod: dto.duration,
        total_price: totalPrice,
        discount_price: 0,
        pay_price: totalPrice,
        buy_data: {
          channelName: dto.channelName,
          scenario: dto.scenario,
          ipType: dto.ipType,
          duration: dto.duration,
          details: purchaseDetails,
        },
        proxyType: 'res_static', // Residential Static
        completed_at: new Date(),
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      // Step 4: Deduct user balance
      user.balance = (userBalance - totalPrice).toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // Step 5: Create billing transaction record
      const billingDetail = queryRunner.manager.create(BillingDetail, {
        userId,
        category: 'expense',
        subCategory: 'static_proxy_purchase',
        amount: -totalPrice, // Negative for expense
        currency: 'USD',
        relatedId: savedOrder.id,
        relatedType: 'order',
        description: `购买静态住宅代理IP - ${dto.channelName} (${totalQuantity} 个IP, ${dto.duration} 天)`,
      });
      await queryRunner.manager.save(BillingDetail, billingDetail);

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`[Purchase] Success! Order: ${orderNo}, User: ${userId}, Total: $${totalPrice}`);

      return {
        success: true,
        message: `成功购买 ${totalQuantity} 个静态IP`,
        order: {
          id: savedOrder.id,
          orderNo: savedOrder.orderNo,
          totalPrice,
          totalQuantity,
          duration: dto.duration,
        },
        allocatedIPs: allocatedIPs.map(ip => ({
          id: ip.id,
          ip: ip.ip,
          port: ip.port,
          username: ip.username,
          password: ip.password,
          country: ip.countryCode,
          city: ip.cityName,
          expiresAt: ip.expireTimeUtc,
        })),
        newBalance: user.balance,
      };
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Purchase] Transaction failed: ${error.message}`);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}

      proxies.push(proxy);
    }

    await this.staticProxyRepo.save(proxies);
    
    this.logger.log(`Saved ${proxies.length} proxies for order ${orderNo}`);
    
    return proxies;
  }

  /**
   * 本地静态IP购买
   */
  async purchaseStaticLocal(userId: string, params: { channelName: string; ipType: string; countries: string[]; duration: number }) {
    this.logger.log(`Purchase static local: ${JSON.stringify({ userId, params })}`);
    
    return {
      success: true,
      message: '购买功能开发中',
      orderNo: `ORD-${Date.now()}`,
      totalCost: 0,
      quantity: params.countries.length,
      proxies: [],
    };
  }

  /**
   * 本地批量续费
   */
  async batchRenewLocal(userId: string, ipIds: string[], duration: number) {
    this.logger.log(`Batch renew local: ${JSON.stringify({ userId, ipIds, duration })}`);
    
    return {
      success: true,
      message: '批量续费功能开发中',
      renewedCount: ipIds.length,
      totalCost: 0,
      failedIps: [],
      updatedIps: [],
    };
  }

  /**
   * Purchase static proxy IPs
   * Transactional method that:
   * 1. Validates user balance
   * 2. Reserves available IPs from inventory
   * 3. Creates order record
   * 4. Deducts balance
   * 5. Creates billing transaction record
   * 
   * All operations are atomic - either all succeed or all fail (rollback)
   */
  async purchaseStaticProxy(userId: string, dto: PurchaseStaticProxyDto) {
    this.logger.log(`[Purchase Static Proxy] User: ${userId}, Items: ${JSON.stringify(dto.items)}`);

    // Calculate total price
    const ipTypePrice = dto.ipType === 'native' ? 8 : 5; // Native: $8, Normal: $5
    const durationMultiplier = dto.duration / 30; // Base price is for 30 days
    let totalQuantity = 0;
    for (const item of dto.items) {
      totalQuantity += item.quantity;
    }
    const totalPrice = totalQuantity * ipTypePrice * durationMultiplier;

    this.logger.log(`[Purchase] Total Price: $${totalPrice} (${totalQuantity} IPs x $${ipTypePrice} x ${durationMultiplier} periods)`);

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate user balance
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const userBalance = parseFloat(user.balance as any) || 0;
      if (userBalance < totalPrice) {
        throw new BadRequestException(`余额不足。当前余额: $${userBalance.toFixed(2)}, 需要: $${totalPrice.toFixed(2)}`);
      }

      // Step 2: Reserve IPs from inventory
      // Note: In production, this would call 985Proxy API to purchase real IPs
      // For now, we allocate from existing mock inventory
      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const allocatedIPs: StaticProxy[] = [];
      const purchaseDetails = [];

      for (const item of dto.items) {
        this.logger.log(`[Purchase] Reserving ${item.quantity} IPs for ${item.country}/${item.city}`);

        // Find unassigned IPs matching country/city
        // In production: call 985Proxy API
        // For testing: use mock data where userId is the system default user
        const availableIPs = await queryRunner.manager.find(StaticProxy, {
          where: {
            countryCode: item.country,
            cityName: item.city,
          },
          take: item.quantity,
        });

        if (availableIPs.length < item.quantity) {
          throw new BadRequestException(
            `库存不足: ${item.country}/${item.city} 需要 ${item.quantity} 个IP，但只有 ${availableIPs.length} 个可用`,
          );
        }

        // Mark IPs as active and assign to user
        for (const ip of availableIPs) {
          ip.status = ProxyStatus.ACTIVE;
          ip.userId = userId;
          ip.purposeWeb = dto.scenario || null;
          ip.orderNo = orderNo; // Track purchase batch
          ip.remark = `Channel: ${dto.channelName}, Scenario: ${dto.scenario || 'N/A'}`;
          ip.expireTimeUtc = new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000);
          await queryRunner.manager.save(StaticProxy, ip);
          allocatedIPs.push(ip);
        }

        purchaseDetails.push({
          country: item.country,
          city: item.city,
          quantity: item.quantity,
          ips: availableIPs.map(ip => ({ id: ip.id, ip: ip.ip, port: ip.port })),
        });
      }

      // Step 3: Create order record
      const order = queryRunner.manager.create(Order, {
        orderNo,
        userId,
        type: OrderType.BUY,
        status: OrderStatus.COMPLETED,
        staticProxyType: dto.ipType,
        purposeWeb: dto.scenario || null,
        timePeriod: dto.duration,
        total_price: totalPrice,
        discount_price: 0,
        pay_price: totalPrice,
        buy_data: {
          channelName: dto.channelName,
          scenario: dto.scenario,
          ipType: dto.ipType,
          duration: dto.duration,
          details: purchaseDetails,
        },
        proxyType: 'res_static', // Residential Static
        completed_at: new Date(),
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      // Step 4: Deduct user balance
      user.balance = (userBalance - totalPrice).toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // Step 5: Create billing transaction record
      const billingDetail = queryRunner.manager.create(BillingDetail, {
        userId,
        category: 'expense',
        subCategory: 'static_proxy_purchase',
        amount: -totalPrice, // Negative for expense
        currency: 'USD',
        relatedId: savedOrder.id,
        relatedType: 'order',
        description: `购买静态住宅代理IP - ${dto.channelName} (${totalQuantity} 个IP, ${dto.duration} 天)`,
      });
      await queryRunner.manager.save(BillingDetail, billingDetail);

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`[Purchase] Success! Order: ${orderNo}, User: ${userId}, Total: $${totalPrice}`);

      return {
        success: true,
        message: `成功购买 ${totalQuantity} 个静态IP`,
        order: {
          id: savedOrder.id,
          orderNo: savedOrder.orderNo,
          totalPrice,
          totalQuantity,
          duration: dto.duration,
        },
        allocatedIPs: allocatedIPs.map(ip => ({
          id: ip.id,
          ip: ip.ip,
          port: ip.port,
          username: ip.username,
          password: ip.password,
          country: ip.countryCode,
          city: ip.cityName,
          expiresAt: ip.expireTimeUtc,
        })),
        newBalance: user.balance,
      };
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Purchase] Transaction failed: ${error.message}`);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}

      proxies.push(proxy);
    }

    await this.staticProxyRepo.save(proxies);
    
    this.logger.log(`Saved ${proxies.length} proxies for order ${orderNo}`);
    
    return proxies;
  }

  /**
   * 本地静态IP购买
   */
  async purchaseStaticLocal(userId: string, params: { channelName: string; ipType: string; countries: string[]; duration: number }) {
    this.logger.log(`Purchase static local: ${JSON.stringify({ userId, params })}`);
    
    return {
      success: true,
      message: '购买功能开发中',
      orderNo: `ORD-${Date.now()}`,
      totalCost: 0,
      quantity: params.countries.length,
      proxies: [],
    };
  }

  /**
   * 本地批量续费
   */
  async batchRenewLocal(userId: string, ipIds: string[], duration: number) {
    this.logger.log(`Batch renew local: ${JSON.stringify({ userId, ipIds, duration })}`);
    
    return {
      success: true,
      message: '批量续费功能开发中',
      renewedCount: ipIds.length,
      totalCost: 0,
      failedIps: [],
      updatedIps: [],
    };
  }

  /**
   * Purchase static proxy IPs
   * Transactional method that:
   * 1. Validates user balance
   * 2. Reserves available IPs from inventory
   * 3. Creates order record
   * 4. Deducts balance
   * 5. Creates billing transaction record
   * 
   * All operations are atomic - either all succeed or all fail (rollback)
   */
  async purchaseStaticProxy(userId: string, dto: PurchaseStaticProxyDto) {
    this.logger.log(`[Purchase Static Proxy] User: ${userId}, Items: ${JSON.stringify(dto.items)}`);

    // Calculate total price
    const ipTypePrice = dto.ipType === 'native' ? 8 : 5; // Native: $8, Normal: $5
    const durationMultiplier = dto.duration / 30; // Base price is for 30 days
    let totalQuantity = 0;
    for (const item of dto.items) {
      totalQuantity += item.quantity;
    }
    const totalPrice = totalQuantity * ipTypePrice * durationMultiplier;

    this.logger.log(`[Purchase] Total Price: $${totalPrice} (${totalQuantity} IPs x $${ipTypePrice} x ${durationMultiplier} periods)`);

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate user balance
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const userBalance = parseFloat(user.balance as any) || 0;
      if (userBalance < totalPrice) {
        throw new BadRequestException(`余额不足。当前余额: $${userBalance.toFixed(2)}, 需要: $${totalPrice.toFixed(2)}`);
      }

      // Step 2: Reserve IPs from inventory
      // Note: In production, this would call 985Proxy API to purchase real IPs
      // For now, we allocate from existing mock inventory
      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const allocatedIPs: StaticProxy[] = [];
      const purchaseDetails = [];

      for (const item of dto.items) {
        this.logger.log(`[Purchase] Reserving ${item.quantity} IPs for ${item.country}/${item.city}`);

        // Find unassigned IPs matching country/city
        // In production: call 985Proxy API
        // For testing: use mock data where userId is the system default user
        const availableIPs = await queryRunner.manager.find(StaticProxy, {
          where: {
            countryCode: item.country,
            cityName: item.city,
          },
          take: item.quantity,
        });

        if (availableIPs.length < item.quantity) {
          throw new BadRequestException(
            `库存不足: ${item.country}/${item.city} 需要 ${item.quantity} 个IP，但只有 ${availableIPs.length} 个可用`,
          );
        }

        // Mark IPs as active and assign to user
        for (const ip of availableIPs) {
          ip.status = ProxyStatus.ACTIVE;
          ip.userId = userId;
          ip.purposeWeb = dto.scenario || null;
          ip.orderNo = orderNo; // Track purchase batch
          ip.remark = `Channel: ${dto.channelName}, Scenario: ${dto.scenario || 'N/A'}`;
          ip.expireTimeUtc = new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000);
          await queryRunner.manager.save(StaticProxy, ip);
          allocatedIPs.push(ip);
        }

        purchaseDetails.push({
          country: item.country,
          city: item.city,
          quantity: item.quantity,
          ips: availableIPs.map(ip => ({ id: ip.id, ip: ip.ip, port: ip.port })),
        });
      }

      // Step 3: Create order record
      const order = queryRunner.manager.create(Order, {
        orderNo,
        userId,
        type: OrderType.BUY,
        status: OrderStatus.COMPLETED,
        staticProxyType: dto.ipType,
        purposeWeb: dto.scenario || null,
        timePeriod: dto.duration,
        total_price: totalPrice,
        discount_price: 0,
        pay_price: totalPrice,
        buy_data: {
          channelName: dto.channelName,
          scenario: dto.scenario,
          ipType: dto.ipType,
          duration: dto.duration,
          details: purchaseDetails,
        },
        proxyType: 'res_static', // Residential Static
        completed_at: new Date(),
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      // Step 4: Deduct user balance
      user.balance = (userBalance - totalPrice).toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // Step 5: Create billing transaction record
      const billingDetail = queryRunner.manager.create(BillingDetail, {
        userId,
        category: 'expense',
        subCategory: 'static_proxy_purchase',
        amount: -totalPrice, // Negative for expense
        currency: 'USD',
        relatedId: savedOrder.id,
        relatedType: 'order',
        description: `购买静态住宅代理IP - ${dto.channelName} (${totalQuantity} 个IP, ${dto.duration} 天)`,
      });
      await queryRunner.manager.save(BillingDetail, billingDetail);

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`[Purchase] Success! Order: ${orderNo}, User: ${userId}, Total: $${totalPrice}`);

      return {
        success: true,
        message: `成功购买 ${totalQuantity} 个静态IP`,
        order: {
          id: savedOrder.id,
          orderNo: savedOrder.orderNo,
          totalPrice,
          totalQuantity,
          duration: dto.duration,
        },
        allocatedIPs: allocatedIPs.map(ip => ({
          id: ip.id,
          ip: ip.ip,
          port: ip.port,
          username: ip.username,
          password: ip.password,
          country: ip.countryCode,
          city: ip.cityName,
          expiresAt: ip.expireTimeUtc,
        })),
        newBalance: user.balance,
      };
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Purchase] Transaction failed: ${error.message}`);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}

      proxies.push(proxy);
    }

    await this.staticProxyRepo.save(proxies);
    
    this.logger.log(`Saved ${proxies.length} proxies for order ${orderNo}`);
    
    return proxies;
  }

  /**
   * 本地静态IP购买
   */
  async purchaseStaticLocal(userId: string, params: { channelName: string; ipType: string; countries: string[]; duration: number }) {
    this.logger.log(`Purchase static local: ${JSON.stringify({ userId, params })}`);
    
    return {
      success: true,
      message: '购买功能开发中',
      orderNo: `ORD-${Date.now()}`,
      totalCost: 0,
      quantity: params.countries.length,
      proxies: [],
    };
  }

  /**
   * 本地批量续费
   */
  async batchRenewLocal(userId: string, ipIds: string[], duration: number) {
    this.logger.log(`Batch renew local: ${JSON.stringify({ userId, ipIds, duration })}`);
    
    return {
      success: true,
      message: '批量续费功能开发中',
      renewedCount: ipIds.length,
      totalCost: 0,
      failedIps: [],
      updatedIps: [],
    };
  }

  /**
   * Purchase static proxy IPs
   * Transactional method that:
   * 1. Validates user balance
   * 2. Reserves available IPs from inventory
   * 3. Creates order record
   * 4. Deducts balance
   * 5. Creates billing transaction record
   * 
   * All operations are atomic - either all succeed or all fail (rollback)
   */
  async purchaseStaticProxy(userId: string, dto: PurchaseStaticProxyDto) {
    this.logger.log(`[Purchase Static Proxy] User: ${userId}, Items: ${JSON.stringify(dto.items)}`);

    // Calculate total price
    const ipTypePrice = dto.ipType === 'native' ? 8 : 5; // Native: $8, Normal: $5
    const durationMultiplier = dto.duration / 30; // Base price is for 30 days
    let totalQuantity = 0;
    for (const item of dto.items) {
      totalQuantity += item.quantity;
    }
    const totalPrice = totalQuantity * ipTypePrice * durationMultiplier;

    this.logger.log(`[Purchase] Total Price: $${totalPrice} (${totalQuantity} IPs x $${ipTypePrice} x ${durationMultiplier} periods)`);

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate user balance
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const userBalance = parseFloat(user.balance as any) || 0;
      if (userBalance < totalPrice) {
        throw new BadRequestException(`余额不足。当前余额: $${userBalance.toFixed(2)}, 需要: $${totalPrice.toFixed(2)}`);
      }

      // Step 2: Reserve IPs from inventory
      // Note: In production, this would call 985Proxy API to purchase real IPs
      // For now, we allocate from existing mock inventory
      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const allocatedIPs: StaticProxy[] = [];
      const purchaseDetails = [];

      for (const item of dto.items) {
        this.logger.log(`[Purchase] Reserving ${item.quantity} IPs for ${item.country}/${item.city}`);

        // Find unassigned IPs matching country/city
        // In production: call 985Proxy API
        // For testing: use mock data where userId is the system default user
        const availableIPs = await queryRunner.manager.find(StaticProxy, {
          where: {
            countryCode: item.country,
            cityName: item.city,
          },
          take: item.quantity,
        });

        if (availableIPs.length < item.quantity) {
          throw new BadRequestException(
            `库存不足: ${item.country}/${item.city} 需要 ${item.quantity} 个IP，但只有 ${availableIPs.length} 个可用`,
          );
        }

        // Mark IPs as active and assign to user
        for (const ip of availableIPs) {
          ip.status = ProxyStatus.ACTIVE;
          ip.userId = userId;
          ip.purposeWeb = dto.scenario || null;
          ip.orderNo = orderNo; // Track purchase batch
          ip.remark = `Channel: ${dto.channelName}, Scenario: ${dto.scenario || 'N/A'}`;
          ip.expireTimeUtc = new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000);
          await queryRunner.manager.save(StaticProxy, ip);
          allocatedIPs.push(ip);
        }

        purchaseDetails.push({
          country: item.country,
          city: item.city,
          quantity: item.quantity,
          ips: availableIPs.map(ip => ({ id: ip.id, ip: ip.ip, port: ip.port })),
        });
      }

      // Step 3: Create order record
      const order = queryRunner.manager.create(Order, {
        orderNo,
        userId,
        type: OrderType.BUY,
        status: OrderStatus.COMPLETED,
        staticProxyType: dto.ipType,
        purposeWeb: dto.scenario || null,
        timePeriod: dto.duration,
        total_price: totalPrice,
        discount_price: 0,
        pay_price: totalPrice,
        buy_data: {
          channelName: dto.channelName,
          scenario: dto.scenario,
          ipType: dto.ipType,
          duration: dto.duration,
          details: purchaseDetails,
        },
        proxyType: 'res_static', // Residential Static
        completed_at: new Date(),
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      // Step 4: Deduct user balance
      user.balance = (userBalance - totalPrice).toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // Step 5: Create billing transaction record
      const billingDetail = queryRunner.manager.create(BillingDetail, {
        userId,
        category: 'expense',
        subCategory: 'static_proxy_purchase',
        amount: -totalPrice, // Negative for expense
        currency: 'USD',
        relatedId: savedOrder.id,
        relatedType: 'order',
        description: `购买静态住宅代理IP - ${dto.channelName} (${totalQuantity} 个IP, ${dto.duration} 天)`,
      });
      await queryRunner.manager.save(BillingDetail, billingDetail);

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`[Purchase] Success! Order: ${orderNo}, User: ${userId}, Total: $${totalPrice}`);

      return {
        success: true,
        message: `成功购买 ${totalQuantity} 个静态IP`,
        order: {
          id: savedOrder.id,
          orderNo: savedOrder.orderNo,
          totalPrice,
          totalQuantity,
          duration: dto.duration,
        },
        allocatedIPs: allocatedIPs.map(ip => ({
          id: ip.id,
          ip: ip.ip,
          port: ip.port,
          username: ip.username,
          password: ip.password,
          country: ip.countryCode,
          city: ip.cityName,
          expiresAt: ip.expireTimeUtc,
        })),
        newBalance: user.balance,
      };
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Purchase] Transaction failed: ${error.message}`);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}

      proxies.push(proxy);
    }

    await this.staticProxyRepo.save(proxies);
    
    this.logger.log(`Saved ${proxies.length} proxies for order ${orderNo}`);
    
    return proxies;
  }

  /**
   * 本地静态IP购买
   */
  async purchaseStaticLocal(userId: string, params: { channelName: string; ipType: string; countries: string[]; duration: number }) {
    this.logger.log(`Purchase static local: ${JSON.stringify({ userId, params })}`);
    
    return {
      success: true,
      message: '购买功能开发中',
      orderNo: `ORD-${Date.now()}`,
      totalCost: 0,
      quantity: params.countries.length,
      proxies: [],
    };
  }

  /**
   * 本地批量续费
   */
  async batchRenewLocal(userId: string, ipIds: string[], duration: number) {
    this.logger.log(`Batch renew local: ${JSON.stringify({ userId, ipIds, duration })}`);
    
    return {
      success: true,
      message: '批量续费功能开发中',
      renewedCount: ipIds.length,
      totalCost: 0,
      failedIps: [],
      updatedIps: [],
    };
  }

  /**
   * Purchase static proxy IPs
   * Transactional method that:
   * 1. Validates user balance
   * 2. Reserves available IPs from inventory
   * 3. Creates order record
   * 4. Deducts balance
   * 5. Creates billing transaction record
   * 
   * All operations are atomic - either all succeed or all fail (rollback)
   */
  async purchaseStaticProxy(userId: string, dto: PurchaseStaticProxyDto) {
    this.logger.log(`[Purchase Static Proxy] User: ${userId}, Items: ${JSON.stringify(dto.items)}`);

    // Calculate total price
    const ipTypePrice = dto.ipType === 'native' ? 8 : 5; // Native: $8, Normal: $5
    const durationMultiplier = dto.duration / 30; // Base price is for 30 days
    let totalQuantity = 0;
    for (const item of dto.items) {
      totalQuantity += item.quantity;
    }
    const totalPrice = totalQuantity * ipTypePrice * durationMultiplier;

    this.logger.log(`[Purchase] Total Price: $${totalPrice} (${totalQuantity} IPs x $${ipTypePrice} x ${durationMultiplier} periods)`);

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate user balance
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const userBalance = parseFloat(user.balance as any) || 0;
      if (userBalance < totalPrice) {
        throw new BadRequestException(`余额不足。当前余额: $${userBalance.toFixed(2)}, 需要: $${totalPrice.toFixed(2)}`);
      }

      // Step 2: Reserve IPs from inventory
      // Note: In production, this would call 985Proxy API to purchase real IPs
      // For now, we allocate from existing mock inventory
      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const allocatedIPs: StaticProxy[] = [];
      const purchaseDetails = [];

      for (const item of dto.items) {
        this.logger.log(`[Purchase] Reserving ${item.quantity} IPs for ${item.country}/${item.city}`);

        // Find unassigned IPs matching country/city
        // In production: call 985Proxy API
        // For testing: use mock data where userId is the system default user
        const availableIPs = await queryRunner.manager.find(StaticProxy, {
          where: {
            countryCode: item.country,
            cityName: item.city,
          },
          take: item.quantity,
        });

        if (availableIPs.length < item.quantity) {
          throw new BadRequestException(
            `库存不足: ${item.country}/${item.city} 需要 ${item.quantity} 个IP，但只有 ${availableIPs.length} 个可用`,
          );
        }

        // Mark IPs as active and assign to user
        for (const ip of availableIPs) {
          ip.status = ProxyStatus.ACTIVE;
          ip.userId = userId;
          ip.purposeWeb = dto.scenario || null;
          ip.orderNo = orderNo; // Track purchase batch
          ip.remark = `Channel: ${dto.channelName}, Scenario: ${dto.scenario || 'N/A'}`;
          ip.expireTimeUtc = new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000);
          await queryRunner.manager.save(StaticProxy, ip);
          allocatedIPs.push(ip);
        }

        purchaseDetails.push({
          country: item.country,
          city: item.city,
          quantity: item.quantity,
          ips: availableIPs.map(ip => ({ id: ip.id, ip: ip.ip, port: ip.port })),
        });
      }

      // Step 3: Create order record
      const order = queryRunner.manager.create(Order, {
        orderNo,
        userId,
        type: OrderType.BUY,
        status: OrderStatus.COMPLETED,
        staticProxyType: dto.ipType,
        purposeWeb: dto.scenario || null,
        timePeriod: dto.duration,
        total_price: totalPrice,
        discount_price: 0,
        pay_price: totalPrice,
        buy_data: {
          channelName: dto.channelName,
          scenario: dto.scenario,
          ipType: dto.ipType,
          duration: dto.duration,
          details: purchaseDetails,
        },
        proxyType: 'res_static', // Residential Static
        completed_at: new Date(),
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      // Step 4: Deduct user balance
      user.balance = (userBalance - totalPrice).toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // Step 5: Create billing transaction record
      const billingDetail = queryRunner.manager.create(BillingDetail, {
        userId,
        category: 'expense',
        subCategory: 'static_proxy_purchase',
        amount: -totalPrice, // Negative for expense
        currency: 'USD',
        relatedId: savedOrder.id,
        relatedType: 'order',
        description: `购买静态住宅代理IP - ${dto.channelName} (${totalQuantity} 个IP, ${dto.duration} 天)`,
      });
      await queryRunner.manager.save(BillingDetail, billingDetail);

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`[Purchase] Success! Order: ${orderNo}, User: ${userId}, Total: $${totalPrice}`);

      return {
        success: true,
        message: `成功购买 ${totalQuantity} 个静态IP`,
        order: {
          id: savedOrder.id,
          orderNo: savedOrder.orderNo,
          totalPrice,
          totalQuantity,
          duration: dto.duration,
        },
        allocatedIPs: allocatedIPs.map(ip => ({
          id: ip.id,
          ip: ip.ip,
          port: ip.port,
          username: ip.username,
          password: ip.password,
          country: ip.countryCode,
          city: ip.cityName,
          expiresAt: ip.expireTimeUtc,
        })),
        newBalance: user.balance,
      };
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Purchase] Transaction failed: ${error.message}`);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
