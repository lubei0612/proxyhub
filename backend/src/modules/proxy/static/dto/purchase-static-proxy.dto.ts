import { IsString, IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseItem {
  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsNumber()
  quantity: number;
}

export class PurchaseStaticProxyDto {
  @IsString()
  channelName: string;

  @IsString()
  @IsOptional()
  scenario?: string;

  @IsString()
  ipType: string; // 'native' or 'shared'

  @IsNumber()
  duration: number; // in days

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItem)
  items: PurchaseItem[];
}

