import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { LoginWithCodeDto } from './dto/login-with-code.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 requests per 60 minutes
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '邮箱已被注册' })
  @ApiResponse({ status: 429, description: '请求过于频繁，请稍后再试' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '邮箱或密码错误' })
  @ApiResponse({ status: 429, description: '登录尝试过于频繁，请15分钟后再试' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('admin-login')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '邮箱或密码错误或无管理员权限' })
  @ApiResponse({ status: 429, description: '登录尝试过于频繁，请15分钟后再试' })
  async adminLogin(@Body() loginDto: LoginDto) {
    return await this.authService.adminLogin(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新Token' })
  @ApiResponse({ status: 200, description: 'Token刷新成功' })
  @ApiResponse({ status: 401, description: 'Token无效或已过期' })
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('send-code')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 requests per 60 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送验证码' })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  @ApiResponse({ status: 400, description: '邮箱格式错误或发送频繁' })
  @ApiResponse({ status: 429, description: '验证码请求过于频繁，请1小时后再试' })
  async sendCode(@Body() sendCodeDto: SendCodeDto) {
    return await this.authService.sendVerificationCode(sendCodeDto);
  }

  @Post('login-with-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证码登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 400, description: '验证码错误或已过期' })
  async loginWithCode(@Body() loginWithCodeDto: LoginWithCodeDto) {
    return await this.authService.loginWithCode(loginWithCodeDto);
  }
}

