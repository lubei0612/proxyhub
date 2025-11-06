import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 城市库存信息
 */
export class CityInventoryDto {
  @IsString()
  cityName: string;

  @IsNumber()
  stock: number;
}

/**
 * 国家库存信息
 */
export class CountryInventoryDto {
  @IsString()
  countryCode: string;

  @IsString()
  countryName: string;

  @IsNumber()
  stock: number;

  @IsNumber()
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CityInventoryDto)
  cities: CityInventoryDto[];
}

/**
 * 库存查询请求DTO
 */
export class InventoryQueryDto {
  @IsString()
  ipType: string; // 'shared' | 'native'

  @IsNumber()
  @IsOptional()
  duration?: number; // 时长（天）
}

/**
 * 库存响应DTO
 */
export class InventoryResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryInventoryDto)
  countries: CountryInventoryDto[];

  @IsNumber()
  totalStock: number;
}

