import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { StaticProxy, ProxyStatus } from '../proxy/static/entities/static-proxy.entity';
import { Transaction, TransactionType } from '../billing/entities/transaction.entity';
import { TrafficService } from '../traffic/traffic.service';
import { Recharge } from '../billing/entities/recharge.entity';
import { Notification } from '../notification/entities/notification.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(StaticProxy)
    private staticProxyRepo: Repository<StaticProxy>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Recharge)
    private rechargeRepo: Repository<Recharge>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @Inject(forwardRef(() => TrafficService))
    private trafficService: TrafficService,
  ) {}

  /**
   * 获取用户仪表盘概览数据
   */
  async getUserOverview(userId: string) {
    // 获取用户信息
    const user = await this.userRepo.findOne({ where: { id: parseInt(userId) } });

    // 统计代理IP
    const totalProxies = await this.staticProxyRepo.count({ where: { userId: parseInt(userId) } });
    const activeProxies = await this.staticProxyRepo.count({
      where: { userId: parseInt(userId), status: ProxyStatus.ACTIVE },
    });
    const expiredProxies = await this.staticProxyRepo.count({
      where: { userId: parseInt(userId), status: ProxyStatus.EXPIRED },
    });

    // 统计订单
    const totalOrders = await this.orderRepo.count({ where: { userId: parseInt(userId) } });
    const completedOrders = await this.orderRepo.count({
      where: { userId: parseInt(userId), status: OrderStatus.COMPLETED },
    });

    // 统计消费（使用PURCHASE类型）
    const transactions = await this.transactionRepo.find({
      where: { userId: parseInt(userId), type: TransactionType.PURCHASE },
    });
    const totalSpent = transactions.reduce((sum, t) => {
      return sum + Math.abs(parseFloat(t.amount as any));
    }, 0);

    return {
      user: {
        email: user?.email,
        nickname: user?.nickname,
        balance: user?.balance,
        gift_balance: user?.gift_balance,
        role: user?.role,
      },
      proxies: {
        total: totalProxies,
        active: activeProxies,
        expired: expiredProxies,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
      },
      spending: {
        total: totalSpent.toFixed(2),
      },
    };
  }

  /**
   * 获取用户消费趋势（最近7天）
   */
  async getSpendingTrend(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const transactions = await this.transactionRepo
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: 'expense' })
      .andWhere('transaction.createdAt >= :date', { date: sevenDaysAgo })
      .orderBy('transaction.createdAt', 'ASC')
      .getMany();

    // 按日期分组
    const dailySpending: Record<string, number> = {};
    transactions.forEach((t) => {
      const date = t.createdAt.toISOString().split('T')[0];
      const amount = Math.abs(parseFloat(t.amount as any));
      dailySpending[date] = (dailySpending[date] || 0) + amount;
    });

    return Object.entries(dailySpending).map(([date, amount]) => ({
      date,
      amount: amount.toFixed(2),
    }));
  }

  /**
   * 获取用户流量统计（按代理类型）- 条形图数据
   * ✅ 已集成真实流量统计系统
   */
  async getTrafficByType(userId: string) {
    try {
      return await this.trafficService.getTrafficByType(parseInt(userId), 7);
    } catch (error) {
      // 返回空数据避免前端报错
      return [];
    }
  }

  /**
   * 获取网络请求分布 - 饼图数据
   * ✅ 已集成真实请求统计系统
   */
  async getRequestDistribution(userId: string) {
    try {
      return await this.trafficService.getRequestDistribution(parseInt(userId), 7);
    } catch (error) {
      // 返回空数据避免前端报错
      return [];
    }
  }

  /**
   * 获取7天流量趋势 - 折线图数据
   * ✅ 已集成真实流量统计系统
   */
  async getTrafficTrend(userId: string) {
    try {
      return await this.trafficService.getTrafficTrend(parseInt(userId), 7);
    } catch (error) {
      // 返回空数据避免前端报错
      return [];
    }
  }

  /**
   * 获取管理员待处理事项数量
   * ✅ Task 2.3: 实现待处理事项数据动态化
   */
  async getAdminPendingTasks() {
    // 1. 查询待审核充值数量
    const pendingRecharges = await this.rechargeRepo.count({
      where: { status: 'pending' as any },
    });

    // 2. 查询异常订单数量（失败或取消的订单）
    const abnormalOrders = await this.orderRepo.count({
      where: [
        { status: OrderStatus.FAILED },
        { status: OrderStatus.CANCELLED },
      ],
    });

    // 3. 查询未读系统通知数量
    const systemNotifications = await this.notificationRepo.count({
      where: {
        type: 'system',
        read: false,
      },
    });

    const total = pendingRecharges + abnormalOrders + systemNotifications;

    return {
      pendingRecharges,
      abnormalOrders,
      systemNotifications,
      total,
    };
  }
}

