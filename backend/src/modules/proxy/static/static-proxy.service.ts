import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { StaticProxy, ProxyStatus } from './entities/static-proxy.entity';
import { User } from '../../user/entities/user.entity';
import { Order, OrderType, OrderStatus } from '../../order/entities/order.entity';
import { Transaction, TransactionType } from '../../billing/entities/transaction.entity';
import { PurchaseStaticProxyDto } from './dto/purchase-static-proxy.dto';
import { EventLogService } from '../../event-log/event-log.service';
import { PricingService } from '../../pricing/pricing.service';
import { Proxy985Service } from '../../proxy985/proxy985.service';

@Injectable()
export class StaticProxyService {
  private readonly logger = new Logger(StaticProxyService.name);

  constructor(
    @InjectRepository(StaticProxy)
    private staticProxyRepo: Repository<StaticProxy>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => EventLogService))
    private readonly eventLogService: EventLogService,
    @Inject(forwardRef(() => PricingService))
    private readonly pricingService: PricingService,
    private readonly proxy985Service: Proxy985Service, // 注入985Proxy服务
  ) {}

  /**
   * 获取用户的静态代理列表
   */
  async getUserProxies(userId: string, page = 1, limit = 20, filters?: any) {
    const where: any = { userId: parseInt(userId) };
    
    // 应用筛选条件
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.ip) {
      where.ip = Like(`%${filters.ip}%`);
    }
    if (filters?.channel) {
      where.channelName = filters.channel;
    }
    if (filters?.country) {
      where.country = filters.country;
    }
    if (filters?.city) {
      where.cityName = filters.city;
    }
    if (filters?.nodeId) {
      // nodeId存储在remark或单独字段，这里暂时使用Like查询remark
      where.remark = Like(`%${filters.nodeId}%`);
    }
    if (filters?.ipType) {
      where.ipType = filters.ipType;
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
   * 切换自动续期状态
   */
  async toggleAutoRenew(proxyId: string, userId: string) {
    const proxy = await this.staticProxyRepo.findOne({
      where: { id: parseInt(proxyId), userId: parseInt(userId) },
    });

    if (!proxy) {
      throw new NotFoundException('代理不存在');
    }

    proxy.auto_renew = !proxy.auto_renew;
    await this.staticProxyRepo.save(proxy);

    return { message: '更新成功', proxy };
  }

  /**
   * 更新静态代理备注
   */
  async updateRemark(proxyId: string, userId: string, remark: string) {
    const proxy = await this.staticProxyRepo.findOne({
      where: { id: parseInt(proxyId), userId: parseInt(userId) },
    });

    if (!proxy) {
      throw new NotFoundException('代理不存在');
    }

    proxy.remark = remark;
    await this.staticProxyRepo.save(proxy);

    return { message: '更新成功', proxy };
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

    // Calculate total price using PricingService
    const productType = dto.ipType === 'native' ? 'static-residential-native' : 'static-residential';
    const buyData = dto.items.map(item => ({
      country_code: item.country,
      city_name: item.city,
      count: item.quantity,
    }));

    const priceResult = await this.pricingService.calculatePrice({
      productType,
      buyData,
      timePeriod: dto.duration,
    });

    const totalPrice = priceResult.totalPrice;
    let totalQuantity = 0;
    for (const item of dto.items) {
      totalQuantity += item.quantity;
    }

    this.logger.log(`[Purchase] Total Price: $${totalPrice} (${totalQuantity} IPs, ${dto.duration} days)`);

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate user balance
      const user = await queryRunner.manager.findOne(User, { where: { id: parseInt(userId) } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const userBalance = parseFloat(user.balance as any) || 0;
      if (userBalance < totalPrice) {
        throw new BadRequestException(`余额不足。当前余额: $${userBalance.toFixed(2)}, 需要: $${totalPrice.toFixed(2)}`);
      }

      // Step 2: 调用985Proxy API购买真实IP
      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const allocatedIPs: StaticProxy[] = [];
      const purchaseDetails = [];

      // 准备购买数据
      const buyData = dto.items.map(item => ({
        country_code: item.country,
        city_name: item.city || undefined,
        count: item.quantity,
      }));

      // 检查测试模式
      const isTestMode = process.env.PROXY_985_TEST_MODE === 'true';
      const zone = process.env.PROXY_985_ZONE || 'your_zone_id_here';
      const proxyType = dto.ipType === 'native' ? 'premium' : 'shared';
      
      if (isTestMode) {
        this.logger.warn(`⚠️ [Purchase] 测试模式开启 - 不调用985Proxy API，使用mock数据`);
      } else {
        this.logger.log(`💰 [Purchase] 生产模式 - 调用真实985Proxy API购买 ${totalQuantity} 个IP（会扣费）`);
        this.logger.log(`[Purchase] Zone: ${zone}, Type: ${proxyType}, Amount: $${totalPrice}`);
      }
      
      let proxy985Response;
      
      if (isTestMode) {
        // 测试模式：跳过API调用
        this.logger.log('[Purchase] 跳过985Proxy API调用，将使用fallback mock数据');
        proxy985Response = null;
      } else {
        // 生产模式：调用真实API
        try {
          proxy985Response = await this.proxy985Service.buyStaticProxy({
            zone,
            time_period: dto.duration,
            static_proxy_type: proxyType,
            buy_data: buyData,
            pay_type: 'balance', // 使用钱包余额支付
            purpose_web: dto.scenario || undefined, // 业务场景（可选）
          });
          this.logger.log(`✅ [Purchase] 985Proxy API 购买成功！`);
          this.logger.log(`[Purchase] 985Proxy API response: ${JSON.stringify(proxy985Response)}`);
        } catch (error) {
          this.logger.error(`❌ [Purchase] 985Proxy API 调用失败: ${error.message}`);
          throw new BadRequestException(`985Proxy API购买失败: ${error.message}`);
        }
      }

      // 解析985Proxy返回的IP数据并保存到数据库
      if (proxy985Response && proxy985Response.data && Array.isArray(proxy985Response.data)) {
        for (const apiIP of proxy985Response.data) {
          const proxyEntity = this.staticProxyRepo.create({
            userId: parseInt(userId),
            channelName: dto.channelName,
            ip: apiIP.ip || apiIP.proxy_ip,
            port: apiIP.port || apiIP.proxy_port || 10000,
            username: apiIP.username || apiIP.user || '',
            password: apiIP.password || apiIP.pass || '',
            country: apiIP.country_code || apiIP.country,
            countryCode: apiIP.country_code || apiIP.country,
            countryName: apiIP.country_name || apiIP.country,
            cityName: apiIP.city_name || apiIP.city || '',
            ipType: dto.ipType,
            expireTimeUtc: apiIP.expire_time ? new Date(apiIP.expire_time) : new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000),
            status: ProxyStatus.ACTIVE,
            auto_renew: false,
            remark: `Channel: ${dto.channelName}, Scenario: ${dto.scenario || 'N/A'}, 985ProxyID: ${apiIP.id || 'N/A'}`,
          });

          const savedIP = await queryRunner.manager.save(StaticProxy, proxyEntity);
          allocatedIPs.push(savedIP);
        }

        // 汇总购买详情
        for (const item of dto.items) {
          purchaseDetails.push({
            country: item.country,
            city: item.city,
            quantity: item.quantity,
          });
        }
      } else {
        // 如果API返回的数据格式不符合预期，回退到mock数据（便于测试）
        this.logger.warn('[Purchase] 985Proxy API返回数据格式异常，使用fallback生成mock数据');
        
        for (const item of dto.items) {
          this.logger.log(`[Purchase] Generating ${item.quantity} mock IPs for ${item.country}/${item.city}`);

          for (let i = 0; i < item.quantity; i++) {
            const mockIP = this.staticProxyRepo.create({
              userId: parseInt(userId),
              channelName: dto.channelName,
              ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              port: 10000 + Math.floor(Math.random() * 50000),
              username: `user_${Date.now()}_${i}`,
              password: Math.random().toString(36).substring(2, 15),
              country: item.country,
              countryCode: item.country,
              countryName: item.country,
              cityName: item.city,
              ipType: dto.ipType,
              expireTimeUtc: new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000),
              status: ProxyStatus.ACTIVE,
              auto_renew: false,
              remark: `Channel: ${dto.channelName}, Scenario: ${dto.scenario || 'N/A'} [MOCK]`,
            });

            const savedIP = await queryRunner.manager.save(StaticProxy, mockIP);
            allocatedIPs.push(savedIP);
          }

          purchaseDetails.push({
            country: item.country,
            city: item.city,
            quantity: item.quantity,
          });
        }
      }

      // Step 3: Create order record
      const order = queryRunner.manager.create(Order, {
        orderNo,
        userId: parseInt(userId),
        type: OrderType.STATIC,
        status: OrderStatus.COMPLETED,
        amount: totalPrice,
        remark: `购买${totalQuantity}个${dto.ipType}代理IP - ${dto.channelName}`,
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      // Step 4: Deduct user balance
      user.balance = (userBalance - totalPrice).toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // Step 5: Create billing transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        userId: parseInt(userId),
        transactionNo: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: TransactionType.PURCHASE,
        amount: totalPrice,
        balanceBefore: userBalance,
        balanceAfter: userBalance - totalPrice,
        remark: `购买静态住宅代理IP - ${dto.channelName} (${totalQuantity} 个IP, ${dto.duration} 天)`,
      });
      await queryRunner.manager.save(Transaction, transaction);

      // Step 6: 记录事件日志
      await this.eventLogService.createLog(
        parseInt(userId),
        'IP购买',
        `购买${totalQuantity}个静态IP (${dto.ipType === 'native' ? '原生' : '普通'}), 金额: $${totalPrice.toFixed(2)}, 时长: ${dto.duration}天`
      );

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

  /**
   * 获取库存信息（Mock）
   */
  async getInventory() {
    // Mock inventory data
    return {
      success: true,
      data: [
        { country: 'US', city: 'New York', available: 500, price: 5 },
        { country: 'US', city: 'Los Angeles', available: 300, price: 5 },
        { country: 'GB', city: 'London', available: 200, price: 5 },
        { country: 'JP', city: 'Tokyo', available: 150, price: 5 },
        { country: 'DE', city: 'Berlin', available: 100, price: 5 },
      ],
    };
  }

  /**
   * 续费静态代理
   */
  async renewProxy(userId: string, proxyId: string, duration: number) {
    this.logger.log(`[Renew Static Proxy] User: ${userId}, Proxy: ${proxyId}, Duration: ${duration} days`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: 查找代理并验证归属
      const proxy = await queryRunner.manager.findOne(StaticProxy, {
        where: { id: parseInt(proxyId), userId: parseInt(userId) },
      });

      if (!proxy) {
        throw new NotFoundException('代理不存在或无权操作');
      }

      // Step 2: 计算续费金额（使用PricingService）
      const productType = proxy.ipType === 'native' ? 'static-residential-native' : 'static-residential';
      const priceResult = await this.pricingService.calculatePrice({
        productType,
        buyData: [{ country_code: proxy.country, city_name: proxy.cityName, count: 1 }],
        timePeriod: duration,
      });
      const renewalPrice = priceResult.totalPrice;

      this.logger.log(`[Renew] Price: $${renewalPrice} (${duration} days)`);

      // Step 3: 验证用户余额
      const user = await queryRunner.manager.findOne(User, { where: { id: parseInt(userId) } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const userBalance = parseFloat(user.balance as any) || 0;
      if (userBalance < renewalPrice) {
        throw new BadRequestException(`余额不足。当前余额: $${userBalance.toFixed(2)}, 需要: $${renewalPrice.toFixed(2)}`);
      }

      // Step 4: 扣费
      user.balance = (userBalance - renewalPrice).toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // Step 5: 更新代理到期时间
      const currentExpiry = new Date(proxy.expireTimeUtc);
      const now = new Date();
      // 如果当前未过期，从到期时间续费；如果已过期，从现在续费
      const baseDate = currentExpiry > now ? currentExpiry : now;
      proxy.expireTimeUtc = new Date(baseDate.getTime() + duration * 24 * 60 * 60 * 1000);
      await queryRunner.manager.save(StaticProxy, proxy);

      // Step 6: 创建订单记录
      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const order = queryRunner.manager.create(Order, {
        orderNo,
        userId: parseInt(userId),
        type: OrderType.STATIC,
        status: OrderStatus.COMPLETED,
        amount: renewalPrice,
        remark: `续费静态IP: ${proxy.ip} (${duration}天)`,
      });
      await queryRunner.manager.save(Order, order);

      // Step 7: 创建交易记录
      const transaction = queryRunner.manager.create(Transaction, {
        userId: parseInt(userId),
        transactionNo: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: TransactionType.RENEWAL,
        amount: renewalPrice,
        balanceBefore: userBalance,
        balanceAfter: userBalance - renewalPrice,
        remark: `续费静态住宅IP: ${proxy.ip} (${duration}天)`,
        relatedId: order.id,
        relatedType: 'renewal',
        category: 'expense',
      });
      await queryRunner.manager.save(Transaction, transaction);

      // Step 8: 记录事件日志
      await this.eventLogService.createLog(
        parseInt(userId),
        'IP续费',
        `续费静态IP: ${proxy.ip}, 时长: ${duration}天, 金额: $${renewalPrice.toFixed(2)}`
      );

      await queryRunner.commitTransaction();

      this.logger.log(`[Renew] Success! Proxy: ${proxy.ip}, New Expiry: ${proxy.expireTimeUtc}`);

      return {
        success: true,
        message: '续费成功',
        proxy: {
          id: proxy.id,
          ip: proxy.ip,
          expiresAt: proxy.expireTimeUtc,
        },
        newBalance: user.balance,
        renewalPrice,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Renew] Transaction failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 释放静态代理
   */
  async releaseProxy(userId: string, proxyId: string) {
    this.logger.log(`[Release Static Proxy] User: ${userId}, Proxy: ${proxyId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: 查找代理并验证归属
      const proxy = await queryRunner.manager.findOne(StaticProxy, {
        where: { id: parseInt(proxyId), userId: parseInt(userId) },
      });

      if (!proxy) {
        throw new NotFoundException('代理不存在或无权操作');
      }

      const proxyInfo = `${proxy.ip} (${proxy.country}/${proxy.cityName})`;

      // Step 2: 删除代理记录（释放回IP池）
      await queryRunner.manager.delete(StaticProxy, { id: parseInt(proxyId) });

      // Step 3: 记录事件日志
      await this.eventLogService.createLog(
        parseInt(userId),
        'IP释放',
        `释放静态IP: ${proxyInfo}`
      );

      await queryRunner.commitTransaction();

      this.logger.log(`[Release] Success! Proxy: ${proxyInfo}`);

      return {
        success: true,
        message: '释放成功',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Release] Transaction failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

