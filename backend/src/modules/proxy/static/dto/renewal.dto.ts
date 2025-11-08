import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, Min, Max } from 'class-validator';

/**
 * IP续费请求DTO
 */
export class RenewIPDto {
  @IsString()
  ip: string;

  @IsNumber()
  @Min(30, { message: '续费时长至少为30天' })
  @Max(365, { message: '续费时长不能超过365天' })
  duration: number; // 续费时长（天）
}

/**
 * IP续费响应DTO
 */
export class RenewalResultDto {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  orderNo?: string; // 订单号

  @IsDate()
  @IsOptional()
  newExpirationDate?: Date; // 新的到期时间

  @IsNumber()
  @IsOptional()
  amountCharged?: number; // 扣费金额
}

