import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreatePriceOverrideDto {
  @IsString()
  productType: string;

  @IsString()
  countryCode: string;

  @IsString()
  @IsOptional()
  cityName?: string;

  @IsNumber()
  @Min(0)
  overridePrice: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePriceOverrideDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  overridePrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

