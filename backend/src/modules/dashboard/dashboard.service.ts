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
   * 注意：当前系统没有真实流量记录，返回全0
   */
  async getTrafficByType(userId: string) {
    // TODO: 集成真实流量统计后替换此方法
    // 当前返回全0，因为没有真实的流量记录表
    const typeStats: Record<string, number> = {
      '数据中心': 0,
      '移动代理': 0,
      '动态住宅': 0,
      '双ISP静态': 0,
    };

    return {
      categories: Object.keys(typeStats),
      data: Object.values(typeStats),
    };
  }

  /**
   * 获取网络请求分布 - 饼图数据
   * 注意：当前系统没有真实请求记录，返回全0
   */
  async getRequestDistribution(userId: string) {
    // TODO: 集成真实请求统计后替换此方法
    // 当前返回全0，因为没有真实的请求记录表
    return [
      { name: 'HTTP请求', value: 0 },
      { name: 'HTTPS请求', value: 0 },
      { name: 'WebSocket', value: 0 },
      { name: '其他', value: 0 },
    ];
  }

  /**
   * 获取7天流量趋势 - 折线图数据
   * 注意：当前系统没有真实流量记录，返回全0
   */
  async getTrafficTrend(userId: string) {
    // TODO: 集成真实流量统计后替换此方法
    // 生成7天日期
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // 返回全0数据，因为没有真实的流量记录表
    const zeroData = dates.map(() => '0.00');
    
    return {
      dates: dates.map(d => {
        const [y, m, day] = d.split('-');
        return `${m}-${day}`;
      }),
      series: [
        {
          name: '数据中心 (DC)',
          data: zeroData,
        },
        {
          name: '移动代理 (Mobile)',
          data: zeroData,
        },
        {
          name: '动态住宅 (Res Rotating)',
          data: zeroData,
        },
        {
          name: '双ISP静态 (Res Static)',
          data: zeroData,
        },
      ],
    };
  }
}

