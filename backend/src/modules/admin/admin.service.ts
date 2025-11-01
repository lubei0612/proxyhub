import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Recharge } from '../billing/entities/recharge.entity';
import { Transaction } from '../billing/entities/transaction.entity';
import { StaticProxy } from '../proxy/static/entities/static-proxy.entity';
import { SystemSettings } from './entities/system-settings.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Recharge)
    private rechargeRepo: Repository<Recharge>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(StaticProxy)
    private staticProxyRepo: Repository<StaticProxy>,
    @InjectRepository(SystemSettings)
    private systemSettingsRepo: Repository<SystemSettings>,
  ) {}

  /**
   * 获取所有用户列表
   */
  async getAllUsers(page = 1, limit = 20, filters?: any) {
    const where: any = {};
    
    if (filters?.role) {
      where.role = filters.role;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const [users, total] = await this.userRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // 移除敏感信息
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return {
      data: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取系统统计数据
   */
  async getStatistics() {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { status: 'active' } });
    const totalOrders = await this.orderRepo.count();
    const completedOrders = await this.orderRepo.count({ where: { status: 'completed' } });
    const totalProxies = await this.staticProxyRepo.count();
    const activeProxies = await this.staticProxyRepo.count({ where: { status: 'active' } });
    const pendingRecharges = await this.rechargeRepo.count({ where: { status: 'pending' } });

    // 计算总收入
    const transactions = await this.transactionRepo.find({ where: { type: 'income' } });
    const totalIncome = transactions.reduce((sum, t) => sum + parseFloat(t.amount as any), 0);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
      },
      proxies: {
        total: totalProxies,
        active: activeProxies,
      },
      recharges: {
        pending: pendingRecharges,
      },
      revenue: {
        total: totalIncome.toFixed(2),
      },
    };
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(userId: string, status: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    user.status = status as any;
    await this.userRepo.save(user);

    return { message: '用户状态已更新', user };
  }

  /**
   * 更新用户角色
   */
  async updateUserRole(userId: string, role: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    user.role = role as any;
    await this.userRepo.save(user);

    return { message: '用户角色已更新', user };
  }

  /**
   * 获取系统设置
   */
  async getSystemSettings() {
    const settings = await this.systemSettingsRepo.find();
    const settingsObj: Record<string, any> = {};
    
    for (const setting of settings) {
      settingsObj[setting.key] = setting.value;
    }

    return settingsObj;
  }

  /**
   * 更新系统设置
   */
  async updateSystemSettings(key: string, value: string) {
    let setting = await this.systemSettingsRepo.findOne({ where: { key } });
    
    if (setting) {
      setting.value = value;
    } else {
      setting = this.systemSettingsRepo.create({ key, value });
    }

    await this.systemSettingsRepo.save(setting);

    return { message: '系统设置已更新', setting };
  }
}

