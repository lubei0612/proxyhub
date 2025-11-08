import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Recharge } from '../billing/entities/recharge.entity';
import { Transaction, TransactionType } from '../billing/entities/transaction.entity';
import { StaticProxy } from '../proxy/static/entities/static-proxy.entity';
import { DynamicChannel } from '../proxy/dynamic/entities/dynamic-channel.entity';
import { SystemSettings } from './entities/system-settings.entity';
import { EventLogService } from '../event-log/event-log.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  
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
    @InjectRepository(DynamicChannel)
    private dynamicChannelRepo: Repository<DynamicChannel>,
    @InjectRepository(SystemSettings)
    private systemSettingsRepo: Repository<SystemSettings>,
    private readonly dataSource: DataSource,
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
      select: ['amount']
    });
    const totalIncome = completedOrdersWithAmount.reduce((sum, order) => {
      return sum + (parseFloat(order.amount as any) || 0);
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
      return sum + (parseFloat(order.amount as any) || 0);
    }, 0);

    // 计算最近7天的收入趋势
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setUTCHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = await this.orderRepo.createQueryBuilder('order')
        .where('order.createdAt >= :startDate', { startDate: date })
        .andWhere('order.createdAt < :endDate', { endDate: nextDate })
        .andWhere('order.status = :status', { status: 'completed' })
        .getMany();
      
      const dayIncome = dayOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.amount as any) || 0);
      }, 0);
      
      // 格式化日期为 "MM-DD"
      const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      
      revenueTrend.push({
        date: formattedDate,
        revenue: parseFloat(dayIncome.toFixed(2)),
      });
    }

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
        trend: revenueTrend, // 最近7天收入趋势
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
   * ✅ 删除用户
   */
  async deleteUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 不允许删除管理员账户
    if (user.role === 'admin') {
      throw new Error('不能删除管理员账户');
    }

    // 删除用户（软删除或硬删除，这里使用硬删除）
    await this.userRepo.remove(user);

    this.logger.log(`[Delete User] User deleted: ${user.email} (ID: ${userId})`);

    return { 
      message: '用户已删除', 
      deletedUser: {
        id: userId,
        email: user.email,
      }
    };
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
   * 添加余额给用户（管理员功能）
   * 之前的"赠送余额"功能，现在直接添加到balance字段
   */
  async addBalance(userId: string, amount: number, remark?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: parseInt(userId) } });
      if (!user) {
        throw new Error('用户不存在');
      }

      // 记录余额变化
      const balanceBefore = parseFloat(user.balance as any) || 0;
      const balanceAfter = balanceBefore + amount;

      // 增加用户余额
      user.balance = balanceAfter.toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // 创建交易记录
      const transaction = queryRunner.manager.create(Transaction, {
        userId: parseInt(userId),
        transactionNo: `ADD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: TransactionType.RECHARGE,
        amount: amount,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        remark: `管理员添加余额${remark ? `: ${remark}` : ''}`,
      });
      await queryRunner.manager.save(Transaction, transaction);

      await queryRunner.commitTransaction();

      // 记录事件日志（在事务外）
      await this.eventLogService.createLog(
        user.id,
        'add_balance',
        `管理员添加余额 $${amount.toFixed(2)}${remark ? ` - ${remark}` : ''}`,
      );

      return {
        message: '添加成功',
        user: {
          id: user.id,
          email: user.email,
          balance: user.balance,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 扣除余额（管理员功能）
   */
  async deductBalance(userId: string, amount: number, remark?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: parseInt(userId) } });
      if (!user) {
        throw new Error('用户不存在');
      }

      const currentBalance = parseFloat(user.balance as any) || 0;

      if (currentBalance < amount) {
        throw new Error(`余额不足，当前余额：$${currentBalance.toFixed(2)}，扣除金额：$${amount.toFixed(2)}`);
      }

      const balanceBefore = currentBalance;
      const balanceAfter = currentBalance - amount;

      user.balance = balanceAfter.toFixed(2) as any;
      await queryRunner.manager.save(User, user);

      // 创建交易记录
      const transaction = queryRunner.manager.create(Transaction, {
        userId: parseInt(userId),
        transactionNo: `DEDUCT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: TransactionType.EXPENSE,
        amount: -amount, // 负数表示扣除
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        remark: `管理员扣除余额${remark ? `: ${remark}` : ''}`,
      });
      await queryRunner.manager.save(Transaction, transaction);

      await queryRunner.commitTransaction();

      // 记录事件日志
      await this.eventLogService.createLog(
        user.id,
        'deduct_balance',
        `管理员扣除余额 $${amount.toFixed(2)}${remark ? ` - ${remark}` : ''}`,
      );

      return { 
        message: '扣除成功', 
        user: { 
          id: user.id, 
          email: user.email, 
          balance: user.balance,
        } 
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取用户购买的IP列表（管理员功能）
   */
  async getUserIPs(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 查询静态住宅IP
    const staticProxies = await this.staticProxyRepo.find({
      where: { userId: parseInt(userId) },
      order: { createdAt: 'DESC' },
    });

    // 查询动态住宅通道
    const dynamicChannels = await this.dynamicChannelRepo.find({
      where: { userId: parseInt(userId) },
      order: { createdAt: 'DESC' },
    });

    // 查询最近5笔交易记录
    const recentTransactions = await this.transactionRepo.find({
      where: { userId: parseInt(userId) },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        balance: user.balance,
      },
      staticProxies: staticProxies.map(proxy => ({
        id: proxy.id,
        ip: proxy.ip,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
        country: proxy.countryName,
        city: proxy.cityName,
        expireTimeUtc: proxy.expireTimeUtc,
        channelName: proxy.channelName,
        createdAt: proxy.createdAt,
      })),
      dynamicChannels: dynamicChannels.map(channel => ({
        id: channel.id,
        name: channel.channelName,
        totalTraffic: channel.totalTraffic,
        totalCost: channel.totalCost,
        status: channel.status,
        createdAt: channel.createdAt,
      })),
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balanceBefore: tx.balanceBefore,
        balanceAfter: tx.balanceAfter,
        transactionNo: tx.transactionNo,
        remark: tx.remark,
        createdAt: tx.createdAt,
      })),
    };
  }

  /**
   * 获取收入趋势（用于管理后台图表）
   * @param days 统计天数（默认7天）
   */
  async getRevenueTrend(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    // 查询已批准的充值记录
    const recharges = await this.rechargeRepo
      .createQueryBuilder('recharge')
      .where('recharge.status = :status', { status: 'approved' })
      .andWhere('recharge.createdAt >= :startDate', { startDate })
      .select('DATE(recharge.createdAt)', 'date')
      .addSelect('SUM(recharge.amount)', 'revenue')
      .groupBy('DATE(recharge.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 生成完整的日期范围
    const dates: string[] = [];
    const revenues: number[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);

      // 查找该日期的收入
      const record = recharges.find(r => r.date === dateStr);
      revenues.push(record ? parseFloat(record.revenue) : 0);
    }

    return {
      dates,
      revenues,
      total: revenues.reduce((sum, val) => sum + val, 0),
    };
  }

  /**
   * 创建新用户（管理员功能）
   */
  async createUser(email: string, password: string, role: string, initialBalance: number) {
    // 检查邮箱是否已存在
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('该邮箱已被注册');
    }

    // 验证密码长度
    if (password.length < 8) {
      throw new BadRequestException('密码至少8位');
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      role: role || 'user',
      balance: initialBalance || 0,
      status: 'active',
    });

    await this.userRepo.save(user);

    // 记录事件日志
    await this.eventLogService.createLog(
      user.id,
      'user_created',
      `管理员创建用户 ${email}，初始余额: $${initialBalance || 0}`,
    );

    return {
      message: '用户创建成功',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        balance: user.balance,
        status: user.status,
      },
    };
  }
}

