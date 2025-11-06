import { IsString, IsNumber, IsBoolean, IsEnum, IsDate, IsOptional } from 'class-validator';

/**
 * IP状态枚举
 */
export enum IPStatus {
  ACTIVE = 'active',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
}

/**
 * 单个IP详情DTO
 */
export class IPDetailDto {
  @IsNumber()
  id: number;

  @IsString()
  ip: string;

  @IsNumber()
  port: number;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  country: string;

  @IsString()
  countryCode: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  ipType: string; // 'shared' | 'native'

  @IsEnum(IPStatus)
  status: IPStatus;

  @IsString()
  statusType: string; // 状态类型别名

  @IsDate()
  expiresAt: Date;

  @IsString()
  expireTimeUtc: string; // UTC时间字符串

  @IsNumber()
  daysRemaining: number;

  @IsString()
  channel: string;

  @IsString()
  channelName: string;

  @IsString()
  @IsOptional()
  nodeId?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsBoolean()
  autoRenew: boolean;

  @IsDate()
  createdAt: Date;
}

/**
 * 我的IP列表响应DTO
 */
export class MyIPsDto {
  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  perPage: number;

  @IsNumber()
  totalPages: number;

  data: IPDetailDto[];
}

