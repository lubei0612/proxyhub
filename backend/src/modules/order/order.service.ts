import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  /**
   * 获取用户订单列表
   */
  async getUserOrders(userId: string, page = 1, limit = 20, filters?: any) {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.type) {
      where.type = filters.type;
    }

    const [orders, total] = await this.orderRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(orderId: string, userId: string) {
    return this.orderRepo.findOne({
      where: { id: parseInt(orderId), userId: parseInt(userId) },
    });
  }

  /**
   * 获取所有订单（管理员）
   */
  async getAllOrders(page = 1, limit = 20, filters?: any) {
    const queryBuilder = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user');
    
    // 应用筛选条件
    if (filters?.status) {
      queryBuilder.andWhere('order.status = :status', { status: filters.status });
    }
    if (filters?.type) {
      queryBuilder.andWhere('order.type = :type', { type: filters.type });
    }
    if (filters?.orderNo) {
      queryBuilder.andWhere('order.orderNo LIKE :orderNo', { orderNo: `%${filters.orderNo}%` });
    }
    if (filters?.userEmail) {
      queryBuilder.andWhere('user.email LIKE :userEmail', { userEmail: `%${filters.userEmail}%` });
    }

    // 分页和排序
    const [orders, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 取消订单（管理员）
   */
  async cancelOrder(orderId: number) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.status !== 'pending') {
        throw new Error(`只能取消待支付状态的订单，当前状态: ${order.status}`);
      }

      // 更新订单状态为已取消
      order.status = 'cancelled';
      const savedOrder = await this.orderRepo.save(order);

      return savedOrder;
    } catch (error) {
      throw error;
    }
  }
}

