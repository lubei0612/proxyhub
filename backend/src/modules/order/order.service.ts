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
    const where: any = {};
    
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
      relations: ['user'],
    });

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

