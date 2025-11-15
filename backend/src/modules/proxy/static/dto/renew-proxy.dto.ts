import { IsNumber, Min, Max } from 'class-validator';
import { IsMultipleOf30 } from '../../../../common/validators/duration.validator';

/**
 * 续费请求DTO
 * 用于 /proxy/static/:id/renew 和 /proxy/static/ip/:ip/renew
 */
export class RenewProxyDto {
  @IsNumber()
  @Min(30, { message: '续费时长至少为30天' })
  @Max(365, { message: '续费时长不能超过365天' })
  @IsMultipleOf30()
  duration: number; // 续费时长（天，必须是30的倍数）
}

