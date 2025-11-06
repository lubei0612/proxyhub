import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 价格明细项
 */
export class PriceBreakdownItemDto {
  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  subtotal: number;
}

/**
 * 价格计算响应DTO
 */
export class PriceDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string; // 'USD'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceBreakdownItemDto)
  breakdown: PriceBreakdownItemDto[];

  @IsNumber()
  originalPrice?: number; // 原价（如果有折扣）

  @IsNumber()
  discount?: number; // 折扣金额
}

