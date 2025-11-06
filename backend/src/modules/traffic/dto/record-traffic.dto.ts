import { IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 记录流量使用DTO
 */
export class RecordTrafficDto {
  @ApiPropertyOptional({ description: '代理ID' })
  @IsOptional()
  @IsNumber()
  proxyId?: number;

  @ApiProperty({ description: '代理类型', example: 'static_residential' })
  @IsString()
  proxyType: string;

  @ApiProperty({ description: '请求数', example: 100 })
  @IsNumber()
  @Min(0)
  requests: number;

  @ApiProperty({ description: '成功请求数', example: 95 })
  @IsNumber()
  @Min(0)
  successRequests: number;

  @ApiProperty({ description: '上传流量（GB）', example: 0.5 })
  @IsNumber()
  @Min(0)
  uploadTraffic: number;

  @ApiProperty({ description: '下载流量（GB）', example: 1.2 })
  @IsNumber()
  @Min(0)
  downloadTraffic: number;

  @ApiPropertyOptional({ description: 'HTTP请求数', example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  httpRequests?: number;

  @ApiPropertyOptional({ description: 'HTTPS请求数', example: 40 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  httpsRequests?: number;

  @ApiPropertyOptional({ description: 'WebSocket请求数', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  websocketRequests?: number;

  @ApiPropertyOptional({ description: '其他协议请求数', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherRequests?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 查询流量统计DTO
 */
export class QueryTrafficDto {
  @ApiPropertyOptional({ description: '开始日期', example: '2025-11-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期', example: '2025-11-07' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '代理类型' })
  @IsOptional()
  @IsString()
  proxyType?: string;

  @ApiPropertyOptional({ description: '代理ID' })
  @IsOptional()
  @IsNumber()
  proxyId?: number;
}

