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
   * Get real-time inventory from 985Proxy with price overrides
   */
  async getInventory(ipType: string, duration: number, businessScenario?: string) {
    this.logger.log(`[Get Inventory] IP Type: ${ipType}, Duration: ${duration}, Business: ${businessScenario || 'all'}`);

    try {
      // 支持前端传递 'native' 或 'premium' 两种格式
      const static_proxy_type = ipType === 'premium' ? 'premium' : 'shared';
      
      // 并行获取库存和价格覆盖
      const [response, priceOverrides] = await Promise.all([
        this.proxy985Service.getInventory({ 
          static_proxy_type,
          purpose_web: businessScenario // 传递业务场景用于筛选
        }),
        this.pricingService.getPriceOverridesForInventory(
          static_proxy_type === 'premium' ? 'static-premium' : 'static-shared'
        ),
      ]);

      if (response.code !== 0) {
        throw new BadRequestException(`获取库存失败: ${response.msg}`);
      }

      // 默认价格
      const defaultPrice = static_proxy_type === 'premium' ? 8 : 5;

      // 构建覆盖价格Map（O(1)查找）
      const overrideMap = new Map<string, number>();
      priceOverrides.forEach((override: any) => {
        const key = override.cityName 
          ? `${override.countryCode}:${override.cityName}`
          : override.countryCode;
        overrideMap.set(key, parseFloat(override.overridePrice));
      });

      const inventory = {
        countries: (response.data || []).map((item: any) => {
          // 查找价格（城市级 > 国家级 > 默认价格）
          const cityKey = item.city_name ? `${item.country_code}:${item.city_name}` : null;
          const countryKey = item.country_code;
          
          const price = 
            (cityKey && overrideMap.get(cityKey)) ||
            overrideMap.get(countryKey) ||
            defaultPrice;

          return {
            countryCode: item.country_code,
            countryName: item.country_code,
            stock: item.number || 0,
            price, // 使用覆盖价格或默认价格
            cities: item.city_name ? [{ cityName: item.city_name, stock: item.number || 0 }] : [],
          };
        }),
      };

      const overrideCount = inventory.countries.filter(c => 
        overrideMap.has(c.countryCode) || 
        c.cities.some((city: any) => overrideMap.has(`${c.countryCode}:${city.cityName}`))
      ).length;

      this.logger.log(`[Get Inventory] Found ${inventory.countries.length} locations (${static_proxy_type}), ${overrideCount} with price overrides`);
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
      const static_proxy_type = dto.ipType === 'premium' ? 'premium' : 'shared';
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

    // Validate items
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('购买项目不能为空');
    }

    const totalQuantity = dto.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity === 0) {
      throw new BadRequestException('购买数量不能为0');
    }

    // Calculate total price using PricingService (with user-specific price overrides)
    // ✅ 修复：使用正确的 productType 值匹配数据库
    const productType = dto.ipType === 'premium' ? 'static-premium' : 'static-shared';
    const buyData = dto.items.map(item => ({
      country_code: item.country,
      city_name: item.city,
      count: item.quantity,
    }));

    const priceResult = await this.pricingService.calculatePrice({
      productType,
      buyData,
      timePeriod: dto.duration,
    }, parseInt(userId));

    const totalPrice = priceResult.totalPrice;

    this.logger.log(`[Purchase] Total Price: $${totalPrice} (${totalQuantity} IPs, ${dto.duration} days)`);

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate user balance (with row lock to prevent race conditions)
      const user = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .where('user.id = :userId', { userId: parseInt(userId) })
        .setLock('pessimistic_write') // FOR UPDATE lock
        .getOne();
        
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const userBalance = parseFloat(user.balance as any) || 0;

      if (userBalance < totalPrice) {
        throw new BadRequestException(
          `余额不足。当前余额: $${userBalance.toFixed(2)}, 需要: $${totalPrice.toFixed(2)}`
        );
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

      // 🚀 生产模式：调用真实985Proxy API
      const zone = process.env.PROXY_985_ZONE || 'your_zone_id_here';
      const proxyType = dto.ipType === 'premium' ? 'premium' : 'shared';
      
      this.logger.log(`💰 [Purchase] 调用985Proxy API购买 ${totalQuantity} 个IP（会扣费）`);
      this.logger.log(`[Purchase] Zone: ${zone}, Type: ${proxyType}, Amount: $${totalPrice}`);
      
      // 调用真实API
      let proxy985Response;
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

      // 解析985Proxy返回的IP数据并保存到数据库
      if (proxy985Response && proxy985Response.data) {
        // 步骤2.1: 获取订单号
        const orderNo985 = proxy985Response.data.order_no;
        
        if (!orderNo985) {
          throw new BadRequestException('985Proxy购买成功但未返回订单号');
        }
        
        this.logger.log(`✅ [Purchase] 985Proxy订单创建成功，订单号: ${orderNo985}`);
        
        // 步骤2.2: 查询订单结果获取IP详情（支持异步订单，带重试机制）
        this.logger.log(`[Purchase] 正在查询订单结果以获取IP详情...`);
        
        let orderResult;
        let ipList = [];
        const maxRetries = 150; // 🔧 修复：增加重试次数到150次（150次 × 2秒 = 300秒总等待时间，5分钟）
        const retryDelay = 2000; // 🔧 修复：增加等待时间到2秒，给供应商更多处理时间
        let orderStatus = 'pending'; // 记录最终订单状态
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            // 第一次立即查询，后续查询前才等待
            if (attempt > 1) {
              await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
            
            this.logger.log(`[Purchase] 尝试 ${attempt}/${maxRetries} 查询订单结果...`);
            orderResult = await this.proxy985Service.getOrderResult(orderNo985);
            
            // 检查订单状态
            if (orderResult && orderResult.data) {
              const status = orderResult.data.status;
              orderStatus = status; // 更新状态
              
              if (status === 'success' || status === 'complete' || status === 'completed') {
                // 订单成功，解析IP列表
                ipList = orderResult.data.info?.result || 
                         orderResult.data.result || 
                         orderResult.data.list || 
                         orderResult.data.ips || 
                         [];
                
                if (Array.isArray(ipList) && ipList.length > 0) {
                  this.logger.log(`✅ [Purchase] 订单处理完成，获取到 ${ipList.length} 个IP（耗时: ${attempt * retryDelay / 1000}秒）`);
                  break; // 立即返回
                }
              } else if (status === 'progress' || status === 'pending') {
                // 订单还在处理中
                this.logger.log(`⏳ [Purchase] 订单还在处理中 (${status})... (${attempt}/${maxRetries})`);
                
                if (attempt >= maxRetries) {
                  // 已达到最大重试次数
                  this.logger.warn(`⚠️ [Purchase] 已达到最大重试次数（${maxRetries}次，${maxRetries * retryDelay / 1000}秒），订单仍在处理中`);
                }
              } else if (status === 'failed') {
                // 订单失败
                this.logger.error(`❌ [Purchase] 供应商订单处理失败: ${JSON.stringify(orderResult)}`);
                throw new BadRequestException(`订单处理失败，请联系客服`);
              }
            }
          } catch (error) {
            // 如果是BadRequestException（订单失败），直接抛出
            if (error instanceof BadRequestException) {
              throw error;
            }
            
            this.logger.error(`❌ [Purchase] 查询订单结果异常 (尝试 ${attempt}/${maxRetries}): ${error.message}`);
            if (attempt === maxRetries) {
              this.logger.warn(`⚠️ [Purchase] 无法获取订单结果，但将继续保存订单记录`);
            }
          }
        }
        
        // 🔧 修复：即使没有立即获取到IP，也要保存订单记录
        // 这样用户可以稍后查看或联系客服
        if (!Array.isArray(ipList) || ipList.length === 0) {
          this.logger.warn(`⚠️ [Purchase] 订单 ${orderNo985} 暂未返回IP列表，状态: ${orderStatus}`);
          this.logger.warn(`⚠️ [Purchase] 将保存订单记录为'处理中'状态，用户可稍后查看`);
          // 不抛出异常，继续执行以保存订单记录
        } else {
          this.logger.log(`✅ [Purchase] 成功获取 ${ipList.length} 个IP详情`);
        }
        
        // 步骤2.4: 保存真实IP到数据库
        for (const apiIP of ipList) {
          const proxyEntity = this.staticProxyRepo.create({
            userId: parseInt(userId),
            channelName: dto.channelName,
            ip: apiIP.ip || apiIP.proxy_ip,
            port: apiIP.port || apiIP.proxy_port || 10000,
            username: apiIP.username || apiIP.user || '',
            password: apiIP.password || apiIP.pass || '',
            country: apiIP.country_code || apiIP.country,
            countryCode: apiIP.country_code || apiIP.country,
            countryName: apiIP.country_name || apiIP.country || apiIP.country_code || 'Unknown',
            cityName: apiIP.city_name || apiIP.city || '',
            ipType: dto.ipType,
            expireTimeUtc: apiIP.expire_time 
              ? new Date(apiIP.expire_time) 
              : new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000),
            status: ProxyStatus.ACTIVE,
            auto_renew: false,
            remark: '', // 备注为空，由客户自己填写
          });

          const savedIP = await queryRunner.manager.save(StaticProxy, proxyEntity);
          allocatedIPs.push(savedIP);
          
          this.logger.log(`✅ [Purchase] 保存IP: ${savedIP.ip}:${savedIP.port}`);
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
        // API调用失败或未返回数据
        throw new BadRequestException('购买失败：未收到985Proxy响应');
      }

      // Step 3: Create order record
      // 🔧 修复：根据是否成功获取到IP来设置订单状态
      const orderStatusToSave = allocatedIPs.length > 0 ? OrderStatus.COMPLETED : OrderStatus.PROCESSING;
      
      const order = queryRunner.manager.create(Order, {
        orderNo,
        userId: parseInt(userId),
        type: OrderType.STATIC,
        status: orderStatusToSave,
        amount: totalPrice,
        remark: `购买${totalQuantity}个${dto.ipType}代理IP - ${dto.channelName} ${allocatedIPs.length === 0 ? '(IP分配中...)' : ''}`,
      });
      const savedOrder = await queryRunner.manager.save(Order, order);
      
      this.logger.log(`✅ [Purchase] 订单记录已保存，状态: ${orderStatusToSave}, 已分配IP: ${allocatedIPs.length}`);

      // Step 4: Deduct user balance
      const balanceBefore = userBalance;
      const balanceAfter = userBalance - totalPrice;
      user.balance = balanceAfter.toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // Step 5: Create billing transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        userId: parseInt(userId),
        transactionNo: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: TransactionType.PURCHASE,
        amount: totalPrice,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        remark: `购买静态住宅代理IP - ${dto.channelName} (${totalQuantity} 个IP, ${dto.duration} 天)`,
      });
      await queryRunner.manager.save(Transaction, transaction);

      // Step 6: 记录事件日志
      await this.eventLogService.createLog(
        parseInt(userId),
        'IP购买',
        `购买${totalQuantity}个静态IP (${dto.ipType === 'premium' ? '原生' : '普通'}), 金额: $${totalPrice.toFixed(2)}, 时长: ${dto.duration}天`
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`[Purchase] Success! Order: ${orderNo}, User: ${userId}, Total: $${totalPrice}`);

      // 🔧 修复：根据是否成功获取到IP返回不同消息
      const successMessage = allocatedIPs.length > 0
        ? `成功购买 ${allocatedIPs.length} 个静态IP`
        : `订单创建成功！IP正在分配中，请稍后在"静态住宅管理"中查看。订单号：${orderNo}`;

      return {
        success: true,
        message: successMessage,
        order: {
          id: savedOrder.id,
          orderNo: savedOrder.orderNo,
          totalPrice,
          totalQuantity: allocatedIPs.length || totalQuantity, // 如果没有IP，显示预期数量
          duration: dto.duration,
          status: orderStatusToSave,
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
        warning: allocatedIPs.length === 0 ? 'IP正在分配中，预计1-3分钟完成。请稍后刷新查看。' : undefined,
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
          autoRenew: proxy.auto_renew || false,
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

      // 3. 计算续费价格（使用PricingService，支持用户特定价格覆盖）
      // ✅ 修复：使用正确的 productType 值匹配数据库
      const productType = proxy.ipType === 'premium' ? 'static-premium' : 'static-shared';
      const priceResult = await this.pricingService.calculatePrice({
        productType,
        buyData: [{ country_code: proxy.country, city_name: proxy.cityName, count: 1 }],
        timePeriod: duration,
      }, parseInt(userId)); // ✅ 传递userId以应用用户特定价格覆盖
      
      const renewalCost = priceResult.totalPrice;
      
      // 准备985Proxy续费所需的zone参数
      const zone = process.env.PROXY_985_ZONE || '';

      // 4. 验证用户余额（支持赠送余额，使用行锁防止并发问题）
      const user = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .where('user.id = :userId', { userId: parseInt(userId) })
        .setLock('pessimistic_write') // FOR UPDATE lock
        .getOne();
      
      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      const renewBalance = parseFloat(user.balance as any) || 0;

      if (renewBalance < renewalCost) {
        throw new BadRequestException(
          `余额不足。当前余额: $${renewBalance.toFixed(2)}, 需要: $${renewalCost.toFixed(2)}`
        );
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
      const balanceBefore = renewBalance;
      const balanceAfter = renewBalance - renewalCost;
      user.balance = balanceAfter.toFixed(2) as any;
      await queryRunner.manager.save(user);

      // 7. 创建交易记录
      const transaction = queryRunner.manager.create(Transaction, {
        userId: parseInt(userId),
        type: TransactionType.RENEWAL,
        amount: renewalCost,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
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
      const response = await this.proxy985Service.getOrderResult(orderNo);

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
   * 🔧 修复：手动同步订单IP
   * 用于处理那些购买时未能立即获取IP的订单
   */
  async syncOrderIPs(userId: string, orderNo: string) {
    this.logger.log(`[Sync Order IPs] User: ${userId}, Order: ${orderNo}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 查找订单并验证
      const order = await queryRunner.manager.findOne(Order, {
        where: { 
          userId: parseInt(userId),
          orderNo: orderNo,
        },
      });

      if (!order) {
        throw new NotFoundException('订单不存在或您无权访问');
      }

      // 2. 检查订单状态，只同步"processing"状态的订单
      if (order.status === OrderStatus.COMPLETED) {
        // 检查是否已经有IP记录
        const existingIPs = await queryRunner.manager.find(StaticProxy, {
          where: { orderId: order.id },
        });

        if (existingIPs.length > 0) {
          this.logger.log(`[Sync Order IPs] Order already has ${existingIPs.length} IPs, no sync needed`);
          await queryRunner.commitTransaction();
          return {
            success: true,
            message: '订单已完成，无需同步',
            ipCount: existingIPs.length,
          };
        }
      }

      // 3. 从订单备注中提取985Proxy订单号
      // 订单备注格式: "购买1个shared代理IP - 默认通道 (IP分配中...)"
      // 需要从数据库或者重新查询985Proxy来获取订单号
      // 简化方案：直接用订单号查询985Proxy（假设存储了）
      
      this.logger.log(`[Sync Order IPs] Querying 985Proxy for order result...`);

      // 尝试查询985Proxy订单结果（使用本地订单号）
      let orderResult;
      try {
        orderResult = await this.proxy985Service.getOrderResult(orderNo);
      } catch (error) {
        this.logger.error(`[Sync Order IPs] Failed to query supplier: ${error.message}`);
        throw new BadRequestException('订单查询失败，请联系客服');
      }

      // 4. 检查订单状态
      if (orderResult.data.status === 'progress' || orderResult.data.status === 'pending') {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: 'IP仍在分配中，请稍后再试',
          status: orderResult.data.status,
        };
      }

      if (orderResult.data.status === 'failed') {
        // 更新订单状态为失败
        order.status = OrderStatus.FAILED;
        await queryRunner.manager.save(Order, order);
        await queryRunner.commitTransaction();
        
        throw new BadRequestException('订单处理失败，请联系客服');
      }

      // 5. 解析IP列表
      const ipList = orderResult.data.info?.result || 
                     orderResult.data.result || 
                     orderResult.data.list || 
                     orderResult.data.ips || 
                     [];

      if (!Array.isArray(ipList) || ipList.length === 0) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: 'IP列表为空，请稍后再试或联系客服',
        };
      }

      this.logger.log(`[Sync Order IPs] Found ${ipList.length} IPs from 985Proxy`);

      // 6. 保存IP到数据库
      const savedIPs = [];
      for (const apiIP of ipList) {
        const proxyEntity = queryRunner.manager.create(StaticProxy, {
          userId: parseInt(userId),
          orderId: order.id,
          channelName: order.remark.match(/- (.*?) \(/)?.[1] || '默认通道',
          ip: apiIP.ip || apiIP.proxy_ip,
          port: apiIP.port || apiIP.proxy_port || 10000,
          username: apiIP.username || apiIP.user || '',
          password: apiIP.password || apiIP.pass || '',
          country: apiIP.country_code || apiIP.country,
          countryCode: apiIP.country_code || apiIP.country,
          countryName: apiIP.country_name || apiIP.country || apiIP.country_code || 'Unknown',
          cityName: apiIP.city_name || apiIP.city || '',
          ipType: (order.remark.includes('premium') || order.remark.includes('原生')) ? 'premium' : 'shared',
          expireTimeUtc: apiIP.expire_time 
            ? new Date(apiIP.expire_time) 
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: ProxyStatus.ACTIVE,
          auto_renew: false,
          remark: '',
        });

        const savedIP = await queryRunner.manager.save(StaticProxy, proxyEntity);
        savedIPs.push(savedIP);
        this.logger.log(`[Sync Order IPs] Saved IP: ${savedIP.ip}:${savedIP.port}`);
      }

      // 7. 更新订单状态为完成
      order.status = OrderStatus.COMPLETED;
      order.remark = order.remark.replace(' (IP分配中...)', '');
      await queryRunner.manager.save(Order, order);

      // 8. 记录事件日志
      await this.eventLogService.createLog(
        parseInt(userId),
        '订单同步',
        `手动同步订单 ${orderNo}，成功获取 ${savedIPs.length} 个IP`
      );

      await queryRunner.commitTransaction();

      this.logger.log(`[Sync Order IPs] Success! Synced ${savedIPs.length} IPs for order ${orderNo}`);

      return {
        success: true,
        message: `成功同步 ${savedIPs.length} 个IP`,
        ipCount: savedIPs.length,
        ips: savedIPs.map(ip => ({
          id: ip.id,
          ip: ip.ip,
          port: ip.port,
          username: ip.username,
          password: ip.password,
          country: ip.countryCode,
          city: ip.cityName,
          expiresAt: ip.expireTimeUtc,
        })),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Sync Order IPs] Failed: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`同步订单IP失败: ${error.message}`);
    } finally {
      await queryRunner.release();
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

      // Step 2: 计算续费金额（使用PricingService，支持用户特定价格覆盖）
      // ✅ 修复：使用正确的 productType 值匹配数据库
      const productType = proxy.ipType === 'premium' ? 'static-premium' : 'static-shared';
      const priceResult = await this.pricingService.calculatePrice({
        productType,
        buyData: [{ country_code: proxy.country, city_name: proxy.cityName, count: 1 }],
        timePeriod: duration,
      }, parseInt(userId)); // ✅ 传递userId以应用用户特定价格覆盖
      const renewalPrice = priceResult.totalPrice;

      this.logger.log(`[Renew] Price: $${renewalPrice} (${duration} days)`);

      // Step 3: 验证用户余额（使用行锁防止并发问题）
      const user = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .where('user.id = :userId', { userId: parseInt(userId) })
        .setLock('pessimistic_write') // FOR UPDATE lock
        .getOne();
        
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const userBalance = parseFloat(user.balance as any) || 0;
      if (userBalance < renewalPrice) {
        throw new BadRequestException(`余额不足。当前余额: $${userBalance.toFixed(2)}, 需要: $${renewalPrice.toFixed(2)}`);
      }

      // Step 4: 调用985Proxy续费API
      this.logger.log(`💰 [Renew] Calling 985Proxy API to renew IP: ${proxy.ip}`);
      
      const zone = process.env.PROXY_985_ZONE || '';
      const renewResponse = await this.proxy985Service.renewStaticProxy({
        zone,
        time_period: duration,
        renew_ip_list: [proxy.ip],
        pay_type: 'balance',
      });

      if (renewResponse.code !== 0) {
        throw new BadRequestException(`985Proxy续费失败: ${renewResponse.msg}`);
      }

      this.logger.log(`✅ [Renew] 985Proxy renewal successful!`);

      // Step 5: 扣费
      user.balance = (userBalance - renewalPrice).toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // Step 6: 更新代理到期时间
      const currentExpiry = new Date(proxy.expireTimeUtc);
      const now = new Date();
      // 如果当前未过期，从到期时间续费；如果已过期，从现在续费
      const baseDate = currentExpiry > now ? currentExpiry : now;
      proxy.expireTimeUtc = new Date(baseDate.getTime() + duration * 24 * 60 * 60 * 1000);
      await queryRunner.manager.save(StaticProxy, proxy);

      // Step 7: 创建订单记录
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

      // Step 8: 创建交易记录
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

      // Step 9: 记录事件日志
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

  /**
   * 获取业务场景列表（从985Proxy API）
   * Get business scenarios list from 985Proxy
   */
  async getBusinessScenarios() {
    this.logger.log('[Get Business Scenarios] Loading from 985Proxy API');

    try {
      const response = await this.proxy985Service.getBusinessList();
      
      if (response.code !== 0) {
        throw new BadRequestException(`获取业务场景失败: ${response.msg}`);
      }

      this.logger.log(`[Get Business Scenarios] Loaded ${response.data?.length || 0} scenarios`);
      
      return {
        scenarios: response.data || []
      };
    } catch (error) {
      this.logger.error(`[Get Business Scenarios] Failed: ${error.message}`);
      throw new BadRequestException(`获取业务场景失败: ${error.message}`);
    }
  }

  /**
   * 获取国家列表（从985Proxy API）
   * Get country list from 985Proxy dynamic proxy city_list API
   */
  async getCountryList() {
    this.logger.log('[Get Country List] Loading from 985Proxy API');

    try {
      const response = await this.proxy985Service.getDynamicCityList();
      
      if (response.code !== 0) {
        throw new BadRequestException(`获取国家列表失败: ${response.msg}`);
      }

      // 提取国家列表（去重）
      const countries = response.data.map(item => ({
        code: item.code,
        name: item.name || item.code, // 如果没有name，使用code
        cityCount: item.state_list?.length || 0
      }));

      this.logger.log(`[Get Country List] Loaded ${countries.length} countries`);
      
      return {
        countries
      };
    } catch (error) {
      this.logger.error(`[Get Country List] Failed: ${error.message}`);
      throw new BadRequestException(`获取国家列表失败: ${error.message}`);
    }
  }

  /**
   * 获取城市列表（从985Proxy API）
   * Get city list for a specific country from 985Proxy
   * @param countryCode 国家代码
   */
  async getCityList(countryCode: string) {
    this.logger.log(`[Get City List] Loading cities for country: ${countryCode}`);

    if (!countryCode) {
      throw new BadRequestException('国家代码不能为空');
    }

    try {
      const response = await this.proxy985Service.getDynamicCityList();
      
      if (response.code !== 0) {
        throw new BadRequestException(`获取城市列表失败: ${response.msg}`);
      }

      // 查找指定国家
      const country = response.data.find(c => c.code === countryCode);
      
      if (!country) {
        return {
          cities: []
        };
      }

      // 提取该国家的所有州/省和城市
      const cities: string[] = [];
      
      if (country.state_list && country.state_list.length > 0) {
        for (const state of country.state_list) {
          if (state.city_list && state.city_list.length > 0) {
            for (const city of state.city_list) {
              // 城市可能只有code，也可能有name
              cities.push(city.name || city.code || city);
            }
          }
        }
      }

      // 去重
      const uniqueCities = [...new Set(cities)];

      this.logger.log(`[Get City List] Loaded ${uniqueCities.length} cities for ${countryCode}`);
      
      return {
        cities: uniqueCities
      };
    } catch (error) {
      this.logger.error(`[Get City List] Failed: ${error.message}`);
      throw new BadRequestException(`获取城市列表失败: ${error.message}`);
    }
  }
}

