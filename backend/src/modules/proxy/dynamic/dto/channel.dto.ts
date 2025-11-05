import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  channelName: string;

  @IsNumber()
  @Min(0)
  pricePerGb: number;

  @IsNumber()
  @Min(1)
  concurrentLimit: number;

  @IsEnum(['active', 'paused'])
  status: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  channelName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerGb?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  concurrentLimit?: number;

  @IsOptional()
  @IsEnum(['active', 'paused'])
  status?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class ChannelFiltersDto {
  @IsOptional()
  @IsString()
  channelName?: string;

  @IsOptional()
  @IsEnum(['active', 'paused', 'disabled', ''])
  status?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}


