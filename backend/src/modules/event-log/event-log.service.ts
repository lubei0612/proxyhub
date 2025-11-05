import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventLog, EventType } from './entities/event-log.entity';

@Injectable()
export class EventLogService {
  private readonly logger = new Logger(EventLogService.name);

  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepo: Repository<EventLog>,
  ) {}

  /**
   * 创建事件日志（无IP和设备信息）
   */
  async createLog(
    userId: number,
    eventType: EventType | string,
    eventContent: string,
  ) {
    const log = this.eventLogRepo.create({
      userId,
      eventType,
      eventContent,
    });

    await this.eventLogRepo.save(log);
    this.logger.log(`[Event Log] User ${userId} - ${eventType}: ${eventContent}`);
    return log;
  }

  /**
   * 获取用户事件日志
   */
  async getUserLogs(userId: number, page = 1, limit = 20, filters?: any) {
    const queryBuilder = this.eventLogRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.userId = :userId', { userId });

    // 应用筛选条件
    if (filters?.eventType) {
      queryBuilder.andWhere('log.eventType = :eventType', { eventType: filters.eventType });
    }
    if (filters?.startTime) {
      queryBuilder.andWhere('log.createdAt >= :startTime', { startTime: new Date(filters.startTime) });
    }
    if (filters?.endTime) {
      queryBuilder.andWhere('log.createdAt <= :endTime', { endTime: new Date(filters.endTime) });
    }

    // 分页和排序
    const [logs, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('log.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: logs.map((log) => ({
        id: log.id,
        accountName: log.user.email,
        eventType: log.eventType,
        eventContent: log.eventContent,
        createdAt: log.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取所有事件日志（管理员）
   */
  async getAllLogs(page = 1, limit = 20, eventType?: string) {
    const where: any = {};
    if (eventType) {
      where.eventType = eventType;
    }

    const [logs, total] = await this.eventLogRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return {
      data: logs.map((log) => ({
        id: log.id,
        accountName: log.user.email,
        eventType: log.eventType,
        eventContent: log.eventContent,
        createdAt: log.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

