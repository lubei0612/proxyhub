import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TrafficRecord } from './entities/traffic-record.entity';
import { RecordTrafficDto, QueryTrafficDto } from './dto/record-traffic.dto';

@Injectable()
export class TrafficService {
  private readonly logger = new Logger(TrafficService.name);

  constructor(
    @InjectRepository(TrafficRecord)
    private readonly trafficRepo: Repository<TrafficRecord>,
  ) {}

  /**
   * 记录流量使用
   */
  async recordTraffic(userId: number, dto: RecordTrafficDto): Promise<TrafficRecord> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 查找或创建今日记录
    let record = await this.trafficRepo.findOne({
      where: {
        userId,
        proxyId: dto.proxyId || null,
        proxyType: dto.proxyType,
        recordDate: today,
      },
    });

    if (!record) {
      record = this.trafficRepo.create({
        userId,
        proxyId: dto.proxyId,
        proxyType: dto.proxyType,
        recordDate: today,
        requestsTotal: 0,
        requestsSuccess: 0,
        requestsFailed: 0,
        trafficUpload: 0,
        trafficDownload: 0,
        trafficTotal: 0,
        protocolHttp: 0,
        protocolHttps: 0,
        protocolWebsocket: 0,
        protocolOther: 0,
      });
    }

    // 累加数据
    record.requestsTotal += dto.requests;
    record.requestsSuccess += dto.successRequests;
    record.requestsFailed += dto.requests - dto.successRequests;
    record.trafficUpload += dto.uploadTraffic;
    record.trafficDownload += dto.downloadTraffic;
    record.trafficTotal += dto.uploadTraffic + dto.downloadTraffic;
    
    if (dto.httpRequests !== undefined) record.protocolHttp += dto.httpRequests;
    if (dto.httpsRequests !== undefined) record.protocolHttps += dto.httpsRequests;
    if (dto.websocketRequests !== undefined) record.protocolWebsocket += dto.websocketRequests;
    if (dto.otherRequests !== undefined) record.protocolOther += dto.otherRequests;
    
    if (dto.remark) record.remark = dto.remark;

    return await this.trafficRepo.save(record);
  }

  /**
   * 获取用户流量统计（按代理类型）
   */
  async getTrafficByType(userId: number, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);

    const records = await this.trafficRepo
      .createQueryBuilder('traffic')
      .select('traffic.proxyType', 'proxyType')
      .addSelect('SUM(traffic.trafficTotal)', 'totalTraffic')
      .where('traffic.userId = :userId', { userId })
      .andWhere('traffic.recordDate >= :startDate', { startDate })
      .groupBy('traffic.proxyType')
      .getRawMany();

    const typeMap: Record<string, string> = {
      static_residential: '双ISP静态',
      dynamic_residential: '动态住宅',
      datacenter: '数据中心',
      mobile: '移动代理',
    };

    const result: Record<string, number> = {
      '数据中心': 0,
      '移动代理': 0,
      '动态住宅': 0,
      '双ISP静态': 0,
    };

    records.forEach(record => {
      const typeName = typeMap[record.proxyType] || record.proxyType;
      result[typeName] = parseFloat(record.totalTraffic) || 0;
    });

    return {
      categories: Object.keys(result),
      data: Object.values(result),
    };
  }

  /**
   * 获取请求分布
   */
  async getRequestDistribution(userId: number, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);

    const record = await this.trafficRepo
      .createQueryBuilder('traffic')
      .select('SUM(traffic.protocolHttp)', 'http')
      .addSelect('SUM(traffic.protocolHttps)', 'https')
      .addSelect('SUM(traffic.protocolWebsocket)', 'websocket')
      .addSelect('SUM(traffic.protocolOther)', 'other')
      .where('traffic.userId = :userId', { userId })
      .andWhere('traffic.recordDate >= :startDate', { startDate })
      .getRawOne();

    return [
      { name: 'HTTP请求', value: parseInt(record.http) || 0 },
      { name: 'HTTPS请求', value: parseInt(record.https) || 0 },
      { name: 'WebSocket', value: parseInt(record.websocket) || 0 },
      { name: '其他', value: parseInt(record.other) || 0 },
    ];
  }

  /**
   * 获取流量趋势（最近N天）
   */
  async getTrafficTrend(userId: number, days: number = 7): Promise<any> {
    const dates: string[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setUTCHours(0, 0, 0, 0);

    // 生成日期列表
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // 查询数据
    const records = await this.trafficRepo
      .createQueryBuilder('traffic')
      .select('traffic.recordDate', 'date')
      .addSelect('traffic.proxyType', 'proxyType')
      .addSelect('SUM(traffic.trafficTotal)', 'totalTraffic')
      .where('traffic.userId = :userId', { userId })
      .andWhere('traffic.recordDate >= :startDate', { startDate })
      .groupBy('traffic.recordDate')
      .addGroupBy('traffic.proxyType')
      .orderBy('traffic.recordDate', 'ASC')
      .getRawMany();

    // 构建数据结构
    const typeMap: Record<string, string> = {
      static_residential: '双ISP静态 (Res Static)',
      dynamic_residential: '动态住宅 (Res Rotating)',
      datacenter: '数据中心 (DC)',
      mobile: '移动代理 (Mobile)',
    };

    const seriesData: Record<string, number[]> = {
      '数据中心 (DC)': new Array(days).fill(0),
      '移动代理 (Mobile)': new Array(days).fill(0),
      '动态住宅 (Res Rotating)': new Array(days).fill(0),
      '双ISP静态 (Res Static)': new Array(days).fill(0),
    };

    records.forEach(record => {
      const dateStr = new Date(record.date).toISOString().split('T')[0];
      const dayIndex = dates.indexOf(dateStr);
      if (dayIndex >= 0) {
        const typeName = typeMap[record.proxyType] || record.proxyType;
        if (seriesData[typeName]) {
          seriesData[typeName][dayIndex] = parseFloat(record.totalTraffic) || 0;
        }
      }
    });

    return {
      dates: dates.map(d => {
        const [y, m, day] = d.split('-');
        return `${m}-${day}`;
      }),
      series: Object.entries(seriesData).map(([name, data]) => ({
        name,
        data: data.map(v => v.toFixed(2)),
      })),
    };
  }

  /**
   * 获取用户总流量统计
   */
  async getUserTotalStats(userId: number): Promise<any> {
    const record = await this.trafficRepo
      .createQueryBuilder('traffic')
      .select('SUM(traffic.requestsTotal)', 'totalRequests')
      .addSelect('SUM(traffic.requestsSuccess)', 'successRequests')
      .addSelect('SUM(traffic.trafficTotal)', 'totalTraffic')
      .where('traffic.userId = :userId', { userId })
      .getRawOne();

    return {
      totalRequests: parseInt(record.totalRequests) || 0,
      successRequests: parseInt(record.successRequests) || 0,
      totalTraffic: parseFloat(record.totalTraffic) || 0,
      successRate: record.totalRequests > 0 
        ? ((parseInt(record.successRequests) / parseInt(record.totalRequests)) * 100).toFixed(2) 
        : '0.00',
    };
  }

  /**
   * 查询流量记录
   */
  async queryTraffic(userId: number, query: QueryTrafficDto): Promise<TrafficRecord[]> {
    const qb = this.trafficRepo
      .createQueryBuilder('traffic')
      .where('traffic.userId = :userId', { userId });

    if (query.startDate && query.endDate) {
      qb.andWhere('traffic.recordDate BETWEEN :start AND :end', {
        start: query.startDate,
        end: query.endDate,
      });
    }

    if (query.proxyType) {
      qb.andWhere('traffic.proxyType = :proxyType', { proxyType: query.proxyType });
    }

    if (query.proxyId) {
      qb.andWhere('traffic.proxyId = :proxyId', { proxyId: query.proxyId });
    }

    return await qb.orderBy('traffic.recordDate', 'DESC').getMany();
  }
}

