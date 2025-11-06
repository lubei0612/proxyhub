import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LocationPrice {
  @IsString()
  country: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  quantity: number;
}

export class GetRealtimePriceDto {
  @IsString()
  productType: string; // 'static-residential' | 'static-residential-native' | 'dynamic-residential'

  @IsNumber()
  duration: number; // 天数

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationPrice)
  locations: LocationPrice[];
}

