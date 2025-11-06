import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StaticProxy } from '../proxy/static/entities/static-proxy.entity';

@Controller('admin/clean')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CleanMockController {
  constructor(
    @InjectRepository(StaticProxy)
    private staticProxyRepo: Repository<StaticProxy>,
  ) {}

  @Get('preview')
  async previewMockData() {
    // 查看所有IP
    const allIPs = await this.staticProxyRepo.find({
      order: { id: 'DESC' },
    });

    // 识别mock数据
    const mockIPs = allIPs.filter(
      (ip) =>
        ip.remark?.includes('[MOCK]') || ip.channelName === '默认通道',
    );

    // 真实数据
    const realIPs = allIPs.filter(
      (ip) =>
        !ip.remark?.includes('[MOCK]') && ip.channelName !== '默认通道',
    );

    return {
      total: allIPs.length,
      mockCount: mockIPs.length,
      realCount: realIPs.length,
      mockIPs: mockIPs.map((ip) => ({
        id: ip.id,
        ip: ip.ip,
        channelName: ip.channelName,
        remark: ip.remark,
        createdAt: ip.createdAt,
      })),
      realIPs: realIPs.map((ip) => ({
        id: ip.id,
        ip: ip.ip,
        channelName: ip.channelName,
        remark: ip.remark,
        createdAt: ip.createdAt,
      })),
    };
  }

  @Delete('mock-data')
  async cleanMockData() {
    // 查找所有mock数据
    const mockIPs = await this.staticProxyRepo
      .createQueryBuilder('proxy')
      .where('proxy.remark LIKE :mock', { mock: '%[MOCK]%' })
      .orWhere('proxy.channelName = :channel', { channel: '默认通道' })
      .getMany();

    const count = mockIPs.length;

    if (count === 0) {
      return {
        success: true,
        message: '没有发现mock数据',
        deletedCount: 0,
      };
    }

    // 删除mock数据
    await this.staticProxyRepo.remove(mockIPs);

    // 查看剩余数据
    const remainingIPs = await this.staticProxyRepo.find({
      order: { id: 'DESC' },
    });

    return {
      success: true,
      message: `已删除${count}条mock数据`,
      deletedCount: count,
      remainingCount: remainingIPs.length,
      remainingIPs: remainingIPs.map((ip) => ({
        id: ip.id,
        ip: ip.ip,
        channelName: ip.channelName,
        remark: ip.remark,
        createdAt: ip.createdAt,
      })),
    };
  }
}

