import { IsString, IsNumber, Min } from 'class-validator';

export class UpdateExchangeRateDto {
  @IsString()
  fromCurrency: string;

  @IsString()
  toCurrency: string;

  @IsNumber()
  @Min(0)
  rate: number;
}

