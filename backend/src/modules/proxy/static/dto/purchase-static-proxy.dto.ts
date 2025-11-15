import { IsString, IsArray, IsNumber, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { IsMultipleOf30 } from '../../../../common/validators/duration.validator';

class PurchaseItem {
  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsNumber()
  @Min(1, { message: '购买数量至少为1' })
  @Max(1000, { message: '单次购买数量不能超过1000' })
  quantity: number;
}

export class PurchaseStaticProxyDto {
  @IsString()
  channelName: string;

  @IsString()
  @IsOptional()
  scenario?: string;

  @IsString()
  ipType: string; // 'premium' (原生) or 'shared' (普通)

  @IsNumber()
  @Min(30, { message: '购买时长至少为30天' })
  @Max(365, { message: '购买时长不能超过365天' })
  @IsMultipleOf30()
  duration: number; // in days (必须是30的倍数，如：30、60、90、180、360)

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItem)
  items: PurchaseItem[];
}

