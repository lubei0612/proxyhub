import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepo: Repository<Setting>,
  ) {}

  /**
   * 获取所有设置
   */
  async getAllSettings(): Promise<Record<string, string>> {
    const settings = await this.settingRepo.find();
    const result: Record<string, string> = {};
    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });
    return result;
  }

  /**
   * 获取单个设置
   */
  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingRepo.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  /**
   * 获取Telegram客服链接
   */
  async getTelegramLinks(): Promise<Array<{ label: string; username: string }>> {
    const telegram1 = await this.getSetting('telegram_support_1');
    const telegram2 = await this.getSetting('telegram_support_2');
    
    const links = [];
    
    if (telegram1) {
      links.push({
        label: 'Telegram 客服 1',
        username: telegram1,
      });
    }
    
    if (telegram2) {
      links.push({
        label: 'Telegram 客服 2',
        username: telegram2,
      });
    }
    
    // 如果没有配置，返回默认值
    if (links.length === 0) {
      links.push({
        label: 'Telegram 客服',
        username: 'lubei12',
      });
    }
    
    return links;
  }

  /**
   * 更新设置
   */
  async updateSettings(updates: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(updates)) {
      const existingSetting = await this.settingRepo.findOne({ where: { key } });
      if (existingSetting) {
        existingSetting.value = value;
        await this.settingRepo.save(existingSetting);
      } else {
        const newSetting = this.settingRepo.create({ key, value });
        await this.settingRepo.save(newSetting);
      }
    }
  }
}


