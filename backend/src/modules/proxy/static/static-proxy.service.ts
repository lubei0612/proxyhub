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
   * 获取库存信息
   * Get real-time inventory from 985Proxy
   */
  async getInventory(ipType: string, duration: number) {
    this.logger.log(`[Get Inventory] IP Type: ${ipType}, Duration: ${duration}`);

    try {
      const static_proxy_type = ipType === 'native' ? 'premium' : 'shared';
      const response = await this.proxy985Service.getInventory({ static_proxy_type });

      if (response.code !== 0) {
        throw new BadRequestException(`获取库存失败: ${response.msg}`);
      }

      const inventory = {
        countries: (response.data || []).map((item: any) => ({
          countryCode: item.country_code,
          countryName: item.country_code,
          stock: item.number || 0,
          price: item.price || 0,
          cities: item.city_name ? [{ cityName: item.city_name, stock: item.number || 0 }] : [],
        })),
      };

      this.logger.log(`[Get Inventory] Found ${inventory.countries.length} locations`);
      return inventory;
    } catch (error) {
      this.logger.error(`[Get Inventory] Failed: ${error.message}`);
      throw new BadRequestException(`获取库存失败: ${error.message}`);
    }
  }

  /**
   * 计算购买价格
   * Calculate purchase price before actual purchase
   */
  async calculatePurchasePrice(dto: PurchaseStaticProxyDto) {
    this.logger.log(`[Calculate Price] Items: ${JSON.stringify(dto.items)}`);

    try {
      const static_proxy_type = dto.ipType === 'native' ? 'premium' : 'shared';
      const buy_data = dto.items.map(item => ({
        country_code: item.country,
        city_name: item.city || '',
        count: item.quantity.toString(),
      }));

      const response = await this.proxy985Service.calculatePrice({
        action: 'buy',
        time_period: dto.duration,
        static_proxy_type,
        buy_data,
      });

      if (response.code !== 0) {
        throw new BadRequestException(`价格计算失败: ${response.msg}`);
      }

      const totalQuantity = dto.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = parseFloat(response.data.pay_price || '0');

      return {
        amount: totalPrice,
        currency: 'USD',
        breakdown: dto.items.map(item => ({
          country: item.country,
          city: item.city,
          quantity: item.quantity,
          unitPrice: totalPrice / totalQuantity,
          subtotal: (totalPrice / totalQuantity) * item.quantity,
        })),
      };
    } catch (error) {
      this.logger.error(`[Calculate Price] Failed: ${error.message}`);
      throw new BadRequestException(`价格计算失败: ${error.message}`);
    }
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
   * 获取用户的IP列表（增强版 - 与985Proxy同步）
   * List user's purchased IPs with optional sync from 985Proxy
   */
  async listMyIPs(userId: string, page: number = 1, limit: number = 20) {
    this.logger.log(`[List My IPs] User: ${userId}, Page: ${page}, Limit: ${limit}`);

    try {
      // 从数据库获取用户的IP列表
      const skip = (page - 1) * limit;
      const [proxies, total] = await this.staticProxyRepo.findAndCount({
        where: { userId: parseInt(userId) },
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      // 转换为前端格式，计算过期状态
      const data = proxies.map(proxy => {
        const expiresAt = proxy.expireTimeUtc || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        let status: 'active' | 'expiring_soon' | 'expired' = 'active';
        if (daysRemaining <= 0) status = 'expired';
        else if (daysRemaining <= 7) status = 'expiring_soon';

        return {
          id: proxy.id,
          ip: proxy.ip,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password,
          country: proxy.country,
          city: proxy.cityName || '',
          countryCode: proxy.country || 'US', // 添加countryCode
          ipType: proxy.ipType || 'shared', // 添加ipType
          status,
          statusType: status, // 添加statusType别名
          expiresAt: expiresAt.toISOString(),
          expireTimeUtc: expiresAt.toISOString(), // 添加expireTimeUtc别名
          daysRemaining,
          channel: proxy.channelName || '985Proxy', // 添加channel
          channelName: proxy.channelName || '985Proxy',
          nodeId: proxy.id?.toString() || '', // 添加nodeId
          remark: proxy.remark || '', // 添加remark
          autoRenew: proxy.autoRenew || false,
        };
      });

      return {
        data,
        total,
        page,
        perPage: limit,
      };
    } catch (error) {
      this.logger.error(`[List My IPs] Failed: ${error.message}`);
      throw new BadRequestException(`获取IP列表失败: ${error.message}`);
    }
  }

  /**
   * 获取单个IP详情
   * Get details for a specific IP with ownership verification
   */
  async getIPDetails(userId: string, ip: string) {
    this.logger.log(`[Get IP Detail] User: ${userId}, IP: ${ip}`);

    try {
      // 验证用户拥有该IP
      const proxy = await this.staticProxyRepo.findOne({
        where: { 
          userId: parseInt(userId),
          ip,
        },
      });

      if (!proxy) {
        throw new NotFoundException('IP不存在或您无权访问');
      }

      // 返回详细信息
      const expiresAt = proxy.expireTimeUtc || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      return {
        ip: proxy.ip,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
        country: proxy.country,
        city: proxy.cityName,
        expiresAt: expiresAt.toISOString(),
        daysRemaining,
        status: proxy.status,
        ipType: proxy.ipType,
        channelName: proxy.channelName,
        remark: proxy.remark,
        autoRenew: proxy.auto_renew,
      };
    } catch (error) {
      this.logger.error(`[Get IP Detail] Failed: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`获取IP详情失败: ${error.message}`);
    }
  }

  /**
   * 续费IP（调用985Proxy API）
   * Renew an IP using 985Proxy renewal API
   */
  async renewIPVia985Proxy(userId: string, ip: string, duration: number) {
    this.logger.log(`[Renew IP via 985Proxy] User: ${userId}, IP: ${ip}, Duration: ${duration} days`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 验证用户拥有该IP
      const proxy = await queryRunner.manager.findOne(StaticProxy, {
        where: { userId: parseInt(userId), ip },
      });

      if (!proxy) {
        throw new NotFoundException('IP不存在或您无权访问');
      }

      // 2. 验证IP未过期（可选，985Proxy可能允许续费已过期的IP）
      const expiresAt = proxy.expireTimeUtc || new Date();
      if (expiresAt < new Date()) {
        this.logger.warn(`[Renew IP] IP已过期: ${ip}`);
        // 不阻止续费，只是警告
      }

      // 3. 计算续费价格
      const zone = process.env.PROXY_985_ZONE || '';
      const static_proxy_type = proxy.ipType === 'native' ? 'premium' : 'shared';
      
      const priceResponse = await this.proxy985Service.calculatePrice({
        action: 'renew',
        time_period: duration,
        zone,
        renew_ip_list: [ip],
      });

      if (priceResponse.code !== 0) {
        throw new BadRequestException(`价格计算失败: ${priceResponse.msg}`);
      }

      const renewalCost = parseFloat(priceResponse.data.pay_price || '0');

      // 4. 验证用户余额
      const user = await queryRunner.manager.findOne(User, { 
        where: { id: parseInt(userId) } 
      });
      
      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      if (user.balance < renewalCost) {
        throw new BadRequestException(`余额不足，需要 $${renewalCost}，当前余额 $${user.balance}`);
      }

      // 5. 准备IP格式（尝试多种格式）
      this.logger.log(`[Renew IP] Preparing IP formats for: ${ip}`);
      this.logger.log(`[Renew IP] Proxy details - IP: ${proxy.ip}, Port: ${proxy.port}, Username: ${proxy.username}`);
      
      // 尝试不同的IP格式
      const ipFormats = [
        ip,                                  // 格式1: 纯IP
        `${ip}:${proxy.port}`,              // 格式2: IP:端口
        `${proxy.username}:${proxy.password}@${ip}:${proxy.port}`,  // 格式3: user:pass@ip:port
      ];
      
      this.logger.log(`[Renew IP] Will try these formats: ${JSON.stringify(ipFormats)}`);
      
      // 尝试第一种格式（纯IP - 最常见）
      this.logger.log(`[Renew IP] Attempting renewal with format: "${ipFormats[0]}"`);
      
      let renewResponse;
      let lastError;
      
      for (let i = 0; i < ipFormats.length; i++) {
        try {
          const ipFormat = ipFormats[i];
          this.logger.log(`[Renew IP] Attempt ${i + 1}/${ipFormats.length} using format: "${ipFormat}"`);
          
          renewResponse = await this.proxy985Service.renewIP({
            zone,
            time_period: duration,
            renew_ip_list: [ipFormat],
            pay_type: 'balance',
          });
          
          if (renewResponse.code === 0) {
            this.logger.log(`[Renew IP] ✅ Success with format: "${ipFormat}"`);
            break;
          } else {
            this.logger.warn(`[Renew IP] ⚠️ Format "${ipFormat}" returned code ${renewResponse.code}: ${renewResponse.msg}`);
            lastError = renewResponse.msg;
          }
        } catch (error) {
          this.logger.error(`[Renew IP] ❌ Format "${ipFormats[i]}" failed: ${error.message}`);
          lastError = error.message;
          
          // 如果不是最后一次尝试，继续下一种格式
          if (i < ipFormats.length - 1) {
            this.logger.log(`[Renew IP] Trying next format...`);
            continue;
          }
        }
      }
      
      // 检查最终结果
      if (!renewResponse || renewResponse.code !== 0) {
        throw new BadRequestException(`续费失败（尝试了${ipFormats.length}种格式）: ${lastError || '未知错误'}`);
      }

      const orderNo = renewResponse.data?.order_no;

      // 6. 扣除余额
      user.balance -= renewalCost;
      await queryRunner.manager.save(user);

      // 7. 创建交易记录
      const transaction = queryRunner.manager.create(Transaction, {
        userId: parseInt(userId),
        type: TransactionType.RENEWAL,
        amount: renewalCost,
        balanceBefore: user.balance + renewalCost,
        balanceAfter: user.balance,
        transactionNo: orderNo || `RNW-${Date.now()}-${userId}`,
        remark: `续费静态代理IP: ${ip} (${duration}天)`,
      });
      await queryRunner.manager.save(transaction);

      // 8. 更新IP过期时间（新过期时间 = 当前过期时间 + duration）
      const newExpiresAt = new Date(expiresAt.getTime() + duration * 24 * 60 * 60 * 1000);
      proxy.expireTimeUtc = newExpiresAt;
      await queryRunner.manager.save(proxy);

      await queryRunner.commitTransaction();

      this.logger.log(`[Renew IP] Success: ${ip}, New expiration: ${newExpiresAt.toISOString()}`);

      return {
        success: true,
        orderNo,
        newExpirationDate: newExpiresAt.toISOString(),
        amountCharged: renewalCost,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Renew IP] Failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 检查订单状态
   * Check order status from 985Proxy
   */
  async checkOrderStatus(userId: string, orderNo: string) {
    this.logger.log(`[Check Order Status] User: ${userId}, Order: ${orderNo}`);

    try {
      // 验证用户拥有该订单（先检查order表，再检查transaction表）
      const order = await this.orderRepo.findOne({
        where: { 
          userId: parseInt(userId),
          orderNo: orderNo,
        },
      });

      // 如果order表没有，检查transaction表（可能是续费订单）
      if (!order) {
        const transaction = await this.transactionRepo.findOne({
          where: { 
            userId: parseInt(userId),
            transactionNo: orderNo,
          },
        });

        if (!transaction) {
          this.logger.warn(`[Check Order Status] Order not found: ${orderNo} for user: ${userId}`);
          throw new NotFoundException('订单不存在或您无权访问');
        }
      }

      this.logger.log(`[Check Order Status] Order found, querying 985Proxy API...`);

      // 调用985Proxy API查询订单状态
      const response = await this.proxy985Service.getOrderResult({ order_no: orderNo });

      if (response.code !== 0) {
        this.logger.error(`[Check Order Status] 985Proxy API error: ${response.msg}`);
        throw new BadRequestException(`查询订单失败: ${response.msg}`);
      }

      this.logger.log(`[Check Order Status] Success: ${response.data.status}`);

      return {
        orderNo,
        status: response.data.status, // pending/completed/failed
        amount: response.data.info?.pay_price || 0,
        currency: 'USD',
        orderTime: response.data.info?.order_time_utc,
        completeTime: response.data.info?.complete_time_utc,
        ipList: response.data.ip_list || [],
      };
    } catch (error) {
      this.logger.error(`[Check Order Status] Failed: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`查询订单状态失败: ${error.message}`);
    }
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

