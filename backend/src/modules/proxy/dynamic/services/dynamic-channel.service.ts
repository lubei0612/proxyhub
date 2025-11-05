import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DynamicChannel } from '../entities/dynamic-channel.entity';
import { CreateChannelDto, UpdateChannelDto, ChannelFiltersDto } from '../dto/channel.dto';

@Injectable()
export class DynamicChannelService {
  constructor(
    @InjectRepository(DynamicChannel)
    private channelRepo: Repository<DynamicChannel>,
  ) {}

  async createChannel(userId: number, dto: CreateChannelDto): Promise<DynamicChannel> {
    // 检查通道名是否重复
    const existing = await this.channelRepo.findOne({
      where: { userId, channelName: dto.channelName },
    });

    if (existing) {
      throw new BadRequestException('通道名已存在');
    }

    const channel = this.channelRepo.create({
      ...dto,
      userId,
    });

    return await this.channelRepo.save(channel);
  }

  async updateChannel(id: number, userId: number, dto: UpdateChannelDto): Promise<DynamicChannel> {
    const channel = await this.channelRepo.findOne({
      where: { id, userId },
    });

    if (!channel) {
      throw new NotFoundException('通道不存在');
    }

    // 如果修改通道名，检查是否重复
    if (dto.channelName && dto.channelName !== channel.channelName) {
      const existing = await this.channelRepo.findOne({
        where: { userId, channelName: dto.channelName },
      });

      if (existing) {
        throw new BadRequestException('通道名已存在');
      }
    }

    Object.assign(channel, dto);
    return await this.channelRepo.save(channel);
  }

  async deleteChannel(id: number, userId: number): Promise<void> {
    const channel = await this.channelRepo.findOne({
      where: { id, userId },
    });

    if (!channel) {
      throw new NotFoundException('通道不存在');
    }

    await this.channelRepo.remove(channel);
  }

  async toggleChannelStatus(id: number, userId: number): Promise<DynamicChannel> {
    const channel = await this.channelRepo.findOne({
      where: { id, userId },
    });

    if (!channel) {
      throw new NotFoundException('通道不存在');
    }

    // 切换状态：active <-> paused
    channel.status = channel.status === 'active' ? 'paused' : 'active';

    return await this.channelRepo.save(channel);
  }

  async getChannels(userId: number, filters: ChannelFiltersDto) {
    const { channelName, status, page = 1, limit = 20 } = filters;

    const query = this.channelRepo
      .createQueryBuilder('channel')
      .where('channel.userId = :userId', { userId });

    if (channelName) {
      query.andWhere('channel.channelName LIKE :channelName', {
        channelName: `%${channelName}%`,
      });
    }

    if (status) {
      query.andWhere('channel.status = :status', { status });
    }

    const [data, total] = await query
      .orderBy('channel.createdAt', 'DESC')
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

  async getChannelStatistics(userId: number) {
    const channels = await this.channelRepo.find({
      where: { userId },
    });

    const totalChannels = channels.length;
    const totalTraffic = channels.reduce((sum, c) => sum + parseFloat(c.totalTraffic.toString()), 0);
    const totalCost = channels.reduce((sum, c) => sum + parseFloat(c.totalCost.toString()), 0);

    return {
      totalChannels,
      totalTraffic: parseFloat(totalTraffic.toFixed(3)),
      totalCost: parseFloat(totalCost.toFixed(2)),
    };
  }
}


