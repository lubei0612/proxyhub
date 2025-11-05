import { IsNumber, IsDateString, Min, IsOptional } from 'class-validator';

export class RecordUsageDto {
  @IsNumber()
  channelId: number;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  requests: number;

  @IsNumber()
  @Min(0)
  successRate: number;

  @IsNumber()
  @Min(0)
  traffic: number;

  @IsNumber()
  @Min(0)
  cost: number;
}

export class UsageFiltersDto {
  @IsOptional()
  @IsNumber()
  channelId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}


