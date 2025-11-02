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
  async getUserLogs(userId: number, page = 1, limit = 20) {
    const [logs, total] = await this.eventLogRepo.findAndCount({
      where: { userId },
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

