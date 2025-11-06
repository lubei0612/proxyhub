import { IsString, IsNumber, IsEnum, IsDate, IsOptional } from 'class-validator';

/**
 * 订单状态枚举
 */
export enum OrderStatusEnum {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * 订单状态查询响应DTO
 */
export class OrderStatusDto {
  @IsString()
  orderNo: string;

  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;

  @IsString()
  statusMessage: string; // 状态描述

  @IsNumber()
  amount: number;

  @IsString()
  currency: string; // 'USD'

  @IsString()
  @IsOptional()
  details?: string; // 订单详情

  @IsDate()
  createdAt: Date;

  @IsDate()
  @IsOptional()
  completedAt?: Date;
}

