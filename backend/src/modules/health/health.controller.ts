import { Controller, Get, Head, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '健康检查 - GET' })
  @ApiResponse({ status: 200, description: '服务正常运行' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Head()
  @HttpCode(200)
  @ApiOperation({ summary: '健康检查 - HEAD' })
  @ApiResponse({ status: 200, description: '服务正常运行' })
  checkHead() {
    // HEAD 请求不返回 body
    return;
  }
}
