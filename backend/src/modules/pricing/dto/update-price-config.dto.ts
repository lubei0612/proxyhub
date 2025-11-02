import { IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdatePriceConfigDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

