import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  data?: any;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailOnOrder?: boolean;

  @IsOptional()
  @IsBoolean()
  emailOnRecharge?: boolean;

  @IsOptional()
  @IsBoolean()
  emailOnExpiring?: boolean;

  @IsOptional()
  @IsBoolean()
  emailOnBalanceLow?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppOnOrder?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppOnRecharge?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppOnExpiring?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppOnBalanceLow?: boolean;

  @IsOptional()
  @IsBoolean()
  telegramEnabled?: boolean;
}

export class NotificationFiltersDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}


