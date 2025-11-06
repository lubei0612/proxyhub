import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Recharge } from '../billing/entities/recharge.entity';
import { Transaction } from '../billing/entities/transaction.entity';
import { StaticProxy } from '../proxy/static/entities/static-proxy.entity';
import { SystemSettings } from './entities/system-settings.entity';
import { EventLogService } from '../event-log/event-log.service';

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
    private readonly eventLogService: EventLogService,
  ) {}

  /**
   * 获取所有用户列表
   */
  async getAllUsers(page = 1, limit = 20, filters?: any) {
    const queryBuilder = this.userRepo.createQueryBuilder('user');
    
    // 应用筛选条件
    if (filters?.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }
    if (filters?.status) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status });
    }
    if (filters?.email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${filters.email}%` });
    }

    // 分页和排序
    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

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

    // 计算总收入（从所有完成的订单计算）
    const completedOrdersWithAmount = await this.orderRepo.find({ 
      where: { status: 'completed' },
      select: ['totalPrice']
    });
    const totalIncome = completedOrdersWithAmount.reduce((sum, order) => {
      return sum + (parseFloat(order.totalPrice as any) || 0);
    }, 0);

    // 计算今日数据（UTC 0点到现在）
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const todayOrders = await this.orderRepo.createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .getCount();
    
    // 计算今日收入（从今日完成的订单）
    const todayCompletedOrders = await this.orderRepo.createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .andWhere('order.status = :status', { status: 'completed' })
      .getMany();
    
    const todayIncome = todayCompletedOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.totalPrice as any) || 0);
    }, 0);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        today: todayOrders,
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
        today: todayIncome.toFixed(2),
      },
    };
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(userId: string, status: string) {
    const user = await this.userRepo.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const oldStatus = user.status;
    user.status = status as any;
    await this.userRepo.save(user);

    // 记录事件日志
    const statusText = status === 'active' ? '启用' : '禁用';
    await this.eventLogService.createLog(
      parseInt(userId),
      '账户状态变更',
      `账户状态从 ${oldStatus} 变更为 ${status}（${statusText}）`
    );

    return { message: '用户状态已更新', user };
  }

  /**
   * 更新用户角色
   */
  async updateUserRole(userId: string, role: string) {
    const user = await this.userRepo.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const oldRole = user.role;
    user.role = role as any;
    await this.userRepo.save(user);

    // 记录事件日志
    const roleText = role === 'admin' ? '管理员' : '普通用户';
    await this.eventLogService.createLog(
      parseInt(userId),
      '角色变更',
      `角色从 ${oldRole} 变更为 ${role}（${roleText}）`
    );

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

  /**
   * 获取待处理事项
   */
  async getPendingItems() {
    // 1. 待审核充值数量
    const pendingRecharges = await this.rechargeRepo.count({ where: { status: 'pending' } });

    // 2. 异常订单数量（pending状态的订单）
    const abnormalOrders = await this.orderRepo.count({ where: { status: 'pending' } });

    // 3. 系统通知（这里暂时返回0，可以后续对接通知表）
    const systemNotifications = 0;

    return {
      data: [
        {
          id: 1,
          icon: 'DocumentChecked',
          color: '#e6a23c',
          title: '充值审核',
          description: `有${pendingRecharges}笔充值申请待审核`,
          count: pendingRecharges,
          badgeType: 'warning',
          action: '/admin/recharges',
        },
        {
          id: 2,
          icon: 'Warning',
          color: '#f56c6c',
          title: '异常订单',
          description: `有${abnormalOrders}个订单状态异常`,
          count: abnormalOrders,
          badgeType: 'danger',
          action: '/admin/orders',
        },
        {
          id: 3,
          icon: 'Bell',
          color: '#409eff',
          title: '系统通知',
          description: `有${systemNotifications}条系统消息待处理`,
          count: systemNotifications,
          badgeType: 'info',
          action: '/admin/notifications',
        },
      ],
    };
  }

  /**
   * 获取最近订单
   */
  async getRecentOrders(limit = 5) {
    const orders = await this.orderRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      data: orders.map(order => ({
        id: order.id,
        orderNo: order.orderNo,
        userEmail: order.user?.email || 'N/A',
        amount: parseFloat(order.amount as any),
        createdAt: order.createdAt,
      })),
    };
  }

  /**
   * 赠送余额给用户
   */
  async giftBalance(userId: string, amount: number, remark?: string) {
    const user = await this.userRepo.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 增加用户的赠送余额
    user.gift_balance = (parseFloat(user.gift_balance as any) || 0) + amount;
    await this.userRepo.save(user);

    // 记录事件日志
    await this.eventLogService.createLog(
      user.id,
      'gift_balance',
      `管理员赠送余额 $${amount.toFixed(2)}${remark ? ` - ${remark}` : ''}`,
    );

    return {
      message: '赠送成功',
      user: {
        id: user.id,
        email: user.email,
        gift_balance: user.gift_balance,
      },
    };
  }
}

