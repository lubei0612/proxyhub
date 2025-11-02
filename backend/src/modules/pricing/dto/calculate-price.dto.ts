import { IsString, IsArray, IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BuyDataItem {
  @IsString()
  country_code: string;

  @IsString()
  @IsOptional()
  city_name?: string;

  @IsNumber()
  @Min(1)
  count: number;
}

export class CalculatePriceDto {
  @IsString()
  productType: string; // 'static_shared' 或 'static_premium'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuyDataItem)
  buyData: BuyDataItem[];

  @IsNumber()
  @Min(30)
  timePeriod: number; // 天数（30/60/90/180）

  @IsString()
  @IsOptional()
  promoCode?: string;
}

