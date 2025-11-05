import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DynamicUsage } from '../entities/dynamic-usage.entity';
import { DynamicChannel } from '../entities/dynamic-channel.entity';
import { RecordUsageDto, UsageFiltersDto } from '../dto/usage.dto';

@Injectable()
export class DynamicUsageService {
  constructor(
    @InjectRepository(DynamicUsage)
    private usageRepo: Repository<DynamicUsage>,
    @InjectRepository(DynamicChannel)
    private channelRepo: Repository<DynamicChannel>,
  ) {}

  async recordUsage(userId: number, dto: RecordUsageDto): Promise<DynamicUsage> {
    // 检查通道是否存在且属于该用户
    const channel = await this.channelRepo.findOne({
      where: { id: dto.channelId, userId },
    });

    if (!channel) {
      throw new Error('通道不存在');
    }

    // 检查该日期是否已有记录
    const existing = await this.usageRepo.findOne({
      where: {
        channelId: dto.channelId,
        date: new Date(dto.date),
      },
    });

    let usage: DynamicUsage;

    if (existing) {
      // 更新现有记录
      Object.assign(existing, dto);
      usage = await this.usageRepo.save(existing);
    } else {
      // 创建新记录
      usage = this.usageRepo.create({
        ...dto,
        userId,
        date: new Date(dto.date),
      });
      usage = await this.usageRepo.save(usage);
    }

    // 更新通道的总流量和总费用
    await this.updateChannelTotals(dto.channelId);

    return usage;
  }

  async getUsageHistory(userId: number, filters: UsageFiltersDto) {
    const { channelId, startDate, endDate, page = 1, limit = 20 } = filters;

    const query = this.usageRepo
      .createQueryBuilder('usage')
      .leftJoinAndSelect('usage.channel', 'channel')
      .where('usage.userId = :userId', { userId });

    if (channelId) {
      query.andWhere('usage.channelId = :channelId', { channelId });
    }

    if (startDate) {
      query.andWhere('usage.date >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      query.andWhere('usage.date <= :endDate', { endDate: new Date(endDate) });
    }

    const [data, total] = await query
      .orderBy('usage.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getUsageStatistics(userId: number, startDate?: string, endDate?: string) {
    const query = this.usageRepo
      .createQueryBuilder('usage')
      .where('usage.userId = :userId', { userId });

    if (startDate) {
      query.andWhere('usage.date >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      query.andWhere('usage.date <= :endDate', { endDate: new Date(endDate) });
    }

    const usages = await query.getMany();

    const totalRequests = usages.reduce((sum, u) => sum + u.requests, 0);
    const totalTraffic = usages.reduce((sum, u) => sum + parseFloat(u.traffic.toString()), 0);
    const totalCost = usages.reduce((sum, u) => sum + parseFloat(u.cost.toString()), 0);
    const avgSuccessRate =
      usages.length > 0
        ? usages.reduce((sum, u) => sum + parseFloat(u.successRate.toString()), 0) / usages.length
        : 0;

    return {
      totalRequests,
      totalTraffic: parseFloat(totalTraffic.toFixed(3)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      avgSuccessRate: parseFloat(avgSuccessRate.toFixed(2)),
    };
  }

  private async updateChannelTotals(channelId: number): Promise<void> {
    const usages = await this.usageRepo.find({
      where: { channelId },
    });

    const totalTraffic = usages.reduce((sum, u) => sum + parseFloat(u.traffic.toString()), 0);
    const totalCost = usages.reduce((sum, u) => sum + parseFloat(u.cost.toString()), 0);

    await this.channelRepo.update(channelId, {
      totalTraffic: parseFloat(totalTraffic.toFixed(3)),
      totalCost: parseFloat(totalCost.toFixed(2)),
    });
  }

  // 定时任务：每天凌晨生成模拟数据（仅开发环境）
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateMockUsage() {
    if (process.env.NODE_ENV === 'production') {
      return; // 生产环境不生成mock数据
    }

    const channels = await this.channelRepo.find({
      where: { status: 'active' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const channel of channels) {
      // 检查今天是否已有数据
      const existing = await this.usageRepo.findOne({
        where: {
          channelId: channel.id,
          date: today,
        },
      });

      if (!existing) {
        // 生成随机数据
        const requests = Math.floor(Math.random() * 6000) + 5000;
        const successRate = parseFloat((Math.random() * 5 + 95).toFixed(2));
        const traffic = parseFloat((Math.random() * 4 + 1).toFixed(3));
        const cost = parseFloat((traffic * parseFloat(channel.pricePerGb.toString())).toFixed(2));

        await this.usageRepo.save({
          channelId: channel.id,
          userId: channel.userId,
          date: today,
          requests,
          successRate,
          traffic,
          cost,
        });

        // 更新通道总计
        await this.updateChannelTotals(channel.id);
      }
    }
  }
}


