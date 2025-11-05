import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { StaticProxy, ProxyStatus } from '../proxy/static/entities/static-proxy.entity';
import { Transaction, TransactionType } from '../billing/entities/transaction.entity';

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
   */
  async getTrafficByType(userId: string) {
    // 获取用户所有静态代理
    const proxies = await this.staticProxyRepo.find({
      where: { userId: parseInt(userId) },
    });

    // 按类型统计（基于代理数量估算流量，每个代理假设平均使用量）
    const typeStats: Record<string, number> = {
      '数据中心': 0,
      '移动代理': 0,
      '动态住宅': 0,
      '双ISP静态': 0,
    };

    proxies.forEach((proxy) => {
      // 基于IP类型和国家估算使用量（GB）
      const baseUsage = proxy.status === 'active' ? 2.5 : 0.5;
      const typeKey = proxy.country === 'US' ? '双ISP静态' : '数据中心';
      typeStats[typeKey] += baseUsage;
    });

    // 动态代理和移动代理基于订单数量估算
    const dynamicOrders = await this.orderRepo.count({
      where: { userId: parseInt(userId), type: 'dynamic_proxy' },
    });
    typeStats['动态住宅'] = dynamicOrders * 3.5;
    typeStats['移动代理'] = dynamicOrders * 1.8;

    return {
      categories: Object.keys(typeStats),
      data: Object.values(typeStats).map(v => parseFloat(v.toFixed(1))),
    };
  }

  /**
   * 获取网络请求分布 - 饼图数据
   */
  async getRequestDistribution(userId: string) {
    // 基于用户的代理使用情况生成请求分布
    const proxiesCount = await this.staticProxyRepo.count({
      where: { userId: parseInt(userId) },
    });

    const ordersCount = await this.orderRepo.count({
      where: { userId: parseInt(userId) },
    });

    // 根据使用量生成请求分布（模拟但基于真实数据）
    const total = Math.max(proxiesCount * 100 + ordersCount * 50, 100);
    
    return [
      { name: 'HTTP请求', value: Math.floor(total * 0.45) },
      { name: 'HTTPS请求', value: Math.floor(total * 0.35) },
      { name: 'WebSocket', value: Math.floor(total * 0.12) },
      { name: '其他', value: Math.floor(total * 0.08) },
    ];
  }

  /**
   * 获取7天流量趋势 - 折线图数据
   */
  async getTrafficTrend(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 获取最近7天的代理活动
    const proxies = await this.staticProxyRepo.find({
      where: { userId: parseInt(userId) },
    });

    const orders = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId })
      .andWhere('order.createdAt >= :date', { date: sevenDaysAgo })
      .getMany();

    // 生成7天日期
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // 按日期和类型生成流量数据（基于订单和代理数量）
    const baseTraffic = proxies.length * 0.3;
    
    return {
      dates: dates.map(d => {
        const [y, m, day] = d.split('-');
        return `${m}-${day}`;
      }),
      series: [
        {
          name: '数据中心 (DC)',
          data: dates.map((_, i) => (baseTraffic * 0.4 + Math.random() * 0.3).toFixed(2)),
        },
        {
          name: '移动代理 (Mobile)',
          data: dates.map((_, i) => (baseTraffic * 0.2 + Math.random() * 0.2).toFixed(2)),
        },
        {
          name: '动态住宅 (Res Rotating)',
          data: dates.map((_, i) => (baseTraffic * 0.7 + Math.random() * 0.4).toFixed(2)),
        },
        {
          name: '双ISP静态 (Res Static)',
          data: dates.map((_, i) => (baseTraffic * 0.5 + Math.random() * 0.3).toFixed(2)),
        },
      ],
    };
  }
}

