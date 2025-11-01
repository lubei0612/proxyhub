import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StaticProxy, ProxyStatus } from './entities/static-proxy.entity';
import { User } from '../../user/entities/user.entity';
import { Order, OrderType, OrderStatus } from '../../order/entities/order.entity';
import { Transaction } from '../../billing/entities/transaction.entity';
import { PurchaseStaticProxyDto } from './dto/purchase-static-proxy.dto';

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
  ) {}

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
    const ipTypePrice = dto.ipType === 'native' ? 8 : 5; // Native: $8, Shared: $5
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

      // Step 2: Generate mock IPs
      // Note: In production, this would call 985Proxy API to purchase real IPs
      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const allocatedIPs: StaticProxy[] = [];
      const purchaseDetails = [];

      for (const item of dto.items) {
        this.logger.log(`[Purchase] Generating ${item.quantity} IPs for ${item.country}/${item.city}`);

        // Generate mock IPs
        for (let i = 0; i < item.quantity; i++) {
          const mockIP = this.staticProxyRepo.create({
            userId,
            orderNo,
            proxy985Id: Math.floor(Math.random() * 1000000),
            zone: dto.channelName,
            purposeWeb: dto.scenario || null,
            staticProxyType: dto.ipType,
            ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            port: 10000 + Math.floor(Math.random() * 50000),
            username: `user_${Date.now()}_${i}`,
            password: Math.random().toString(36).substring(2, 15),
            countryCode: item.country,
            cityName: item.city,
            expireTimeUtc: new Date(Date.now() + dto.duration * 24 * 60 * 60 * 1000),
            status: ProxyStatus.ACTIVE,
            auto_renew: false,
            remark: `Channel: ${dto.channelName}, Scenario: ${dto.scenario || 'N/A'}`,
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
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type: 'expense',
        category: 'proxy_purchase',
        amount: -totalPrice, // Negative for expense
        relatedId: savedOrder.id,
        relatedType: 'order',
        description: `购买静态住宅代理IP - ${dto.channelName} (${totalQuantity} 个IP, ${dto.duration} 天)`,
      });
      await queryRunner.manager.save(Transaction, transaction);

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
}

