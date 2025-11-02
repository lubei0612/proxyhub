import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { CreatePriceOverrideDto, UpdatePriceOverrideDto } from './dto/create-price-override.dto';
import { UpdatePriceConfigDto } from './dto/update-price-config.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Controller('price')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  /**
   * 计算价格（用户端）
   */
  @Post('calculate')
  @UseGuards(JwtAuthGuard)
  async calculatePrice(@Body() dto: CalculatePriceDto) {
    return this.pricingService.calculatePrice(dto);
  }

  /**
   * 获取汇率（用户端）
   */
  @Get('exchange-rate')
  async getExchangeRate(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.pricingService.getExchangeRate(from || 'USD', to || 'CNY');
  }

  // ============================================================
  // 管理员API
  // ============================================================

  /**
   * 获取所有价格配置（管理员）
   */
  @Get('configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllPriceConfigs() {
    return this.pricingService.getAllPriceConfigs();
  }

  /**
   * 更新价格配置（管理员）
   */
  @Put('configs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updatePriceConfig(
    @Param('id') id: string,
    @Body() dto: UpdatePriceConfigDto,
  ) {
    return this.pricingService.updatePriceConfig(parseInt(id), dto);
  }

  /**
   * 获取所有价格覆盖（管理员）
   */
  @Get('overrides')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllPriceOverrides(@Query('productType') productType?: string) {
    return this.pricingService.getAllPriceOverrides(productType);
  }

  /**
   * 创建价格覆盖（管理员）
   */
  @Post('overrides')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createPriceOverride(@Body() dto: CreatePriceOverrideDto) {
    return this.pricingService.createPriceOverride(dto);
  }

  /**
   * 更新价格覆盖（管理员）
   */
  @Put('overrides/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updatePriceOverride(
    @Param('id') id: string,
    @Body() dto: UpdatePriceOverrideDto,
  ) {
    return this.pricingService.updatePriceOverride(parseInt(id), dto);
  }

  /**
   * 删除价格覆盖（管理员）
   */
  @Delete('overrides/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePriceOverride(@Param('id') id: string) {
    return this.pricingService.deletePriceOverride(parseInt(id));
  }

  /**
   * 更新汇率（管理员）
   */
  @Post('exchange-rate/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateExchangeRate(@Body() dto: UpdateExchangeRateDto) {
    return this.pricingService.updateExchangeRate(dto);
  }
}

