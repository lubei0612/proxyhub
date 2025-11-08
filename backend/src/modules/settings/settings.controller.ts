import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * 获取所有设置（公开接口，供前端获取配置）
   */
  @Public()
  @Get()
  async getSettings() {
    return this.settingsService.getAllSettings();
  }

  /**
   * 获取Telegram客服链接（公开接口）
   */
  @Public()
  @Get('telegram')
  async getTelegramLinks() {
    return this.settingsService.getTelegramLinks();
  }

  /**
   * 更新设置（仅管理员）
   */
  @Roles('admin')
  @Put()
  async updateSettings(@Body() updates: Record<string, string>) {
    await this.settingsService.updateSettings(updates);
    return { message: '设置已更新' };
  }
}


