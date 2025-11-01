import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { StaticProxy, ProxyStatus } from '../proxy/static/entities/static-proxy.entity';
import { Transaction } from '../billing/entities/transaction.entity';

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
    const user = await this.userRepo.findOne({ where: { id: userId } });

    // 统计代理IP
    const totalProxies = await this.staticProxyRepo.count({ where: { userId } });
    const activeProxies = await this.staticProxyRepo.count({
      where: { userId, status: ProxyStatus.ACTIVE },
    });
    const expiredProxies = await this.staticProxyRepo.count({
      where: { userId, status: ProxyStatus.EXPIRED },
    });

    // 统计订单
    const totalOrders = await this.orderRepo.count({ where: { userId } });
    const completedOrders = await this.orderRepo.count({
      where: { userId, status: OrderStatus.COMPLETED },
    });

    // 统计消费
    const transactions = await this.transactionRepo.find({
      where: { userId, type: 'expense' },
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
}

