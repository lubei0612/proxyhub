import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recharge, RechargeStatus } from './entities/recharge.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import { EventLogService } from '../event-log/event-log.service';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Recharge)
    private rechargeRepo: Repository<Recharge>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly eventLogService: EventLogService,
  ) {}

  /**
   * 创建充值订单
   */
  async createRecharge(userId: string, amount: number, method: string) {
    const recharge = this.rechargeRepo.create({
      userId: parseInt(userId),
      amount,
      paymentMethod: method,
      method,
      status: RechargeStatus.PENDING,
      orderNo: `RCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });

    const savedRecharge = await this.rechargeRepo.save(recharge);

    // 记录事件日志
    await this.eventLogService.createLog(
      parseInt(userId),
      '充值申请',
      `提交充值申请：金额 $${amount.toFixed(2)}，支付方式：${method}，订单号：${savedRecharge.orderNo}`
    );

    return savedRecharge;
  }

  /**
   * 获取用户充值记录
   */
  async getUserRecharges(userId: string, page = 1, limit = 20) {
    const [recharges, total] = await this.rechargeRepo.findAndCount({
      where: { userId: parseInt(userId) },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: recharges,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取用户交易记录
   */
  async getUserTransactions(userId: string, page = 1, limit = 20, filters?: any) {
    const queryBuilder = this.transactionRepo
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });
    
    // 应用筛选条件
    if (filters?.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }
    if (filters?.category) {
      queryBuilder.andWhere('transaction.category = :category', { category: filters.category });
    }
    if (filters?.startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate: new Date(filters.startDate) });
    }
    if (filters?.endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate: new Date(filters.endDate) });
    }

    // 分页和排序
    const [transactions, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('transaction.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 管理员审核充值
   */
  async approveRecharge(rechargeId: string, approved: boolean, remark?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const recharge = await queryRunner.manager.findOne(Recharge, {
        where: { id: parseInt(rechargeId) },
      });

      if (!recharge) {
        throw new NotFoundException('充值记录不存在');
      }

      if (recharge.status !== RechargeStatus.PENDING) {
        throw new BadRequestException('该充值记录已被处理');
      }

      if (approved) {
        // 批准充值
        recharge.status = RechargeStatus.APPROVED;
        // Note: approved_at column doesn't exist in database, using updated_at instead
        recharge.adminRemark = remark || '审核通过';

        // 更新用户余额
        const user = await queryRunner.manager.findOne(User, {
          where: { id: recharge.userId },
        });

        if (!user) {
          throw new NotFoundException('用户不存在');
        }

        // 确保所有数值都转换为number类型
        const currentBalance = parseFloat(user.balance as any) || 0;
        const rechargeAmount = parseFloat(recharge.amount as any) || 0;
        const newBalance = currentBalance + rechargeAmount;
        
        user.balance = newBalance.toFixed(2) as any;
        await queryRunner.manager.save(User, user);

        // 创建交易记录
        const transaction = queryRunner.manager.create(Transaction, {
          userId: recharge.userId,
          transactionNo: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          type: TransactionType.RECHARGE,
          amount: rechargeAmount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          remark: `充值 - ${recharge.paymentMethod || recharge.method} - 订单号: ${recharge.orderNo}`,
        });
        await queryRunner.manager.save(Transaction, transaction);
      } else {
        // 拒绝充值
        recharge.status = RechargeStatus.REJECTED;
        recharge.remark = remark || '审核未通过';
      }

      await queryRunner.manager.save(Recharge, recharge);
      await queryRunner.commitTransaction();

      // 记录事件日志
      if (approved) {
        await this.eventLogService.createLog(
          recharge.userId,
          '充值审核通过',
          `充值审核通过：金额 $${parseFloat(recharge.amount as any).toFixed(2)} 已到账，订单号：${recharge.orderNo}`
        );
      } else {
        await this.eventLogService.createLog(
          recharge.userId,
          '充值审核拒绝',
          `充值审核拒绝：金额 $${parseFloat(recharge.amount as any).toFixed(2)}，原因：${remark || '未通过审核'}，订单号：${recharge.orderNo}`
        );
      }

      return { message: approved ? '充值已批准' : '充值已拒绝', recharge };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取所有充值记录（管理员）
   */
  async getAllRecharges(page = 1, limit = 20, filters?: any) {
    const queryBuilder = this.rechargeRepo
      .createQueryBuilder('recharge')
      .leftJoinAndSelect('recharge.user', 'user');
    
    // 应用筛选条件
    if (filters?.status) {
      queryBuilder.andWhere('recharge.status = :status', { status: filters.status });
    }
    if (filters?.method) {
      queryBuilder.andWhere('recharge.method = :method', { method: filters.method });
    }
    if (filters?.email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${filters.email}%` });
    }

    // 分页和排序
    const [recharges, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('recharge.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: recharges,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

