import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationService } from './services/notification.service';
import { UpdateSettingsDto, NotificationFiltersDto } from './dto/notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  // 获取通知列表
  @Get()
  async getNotifications(@Request() req, @Query() filters: NotificationFiltersDto) {
    return this.notificationService.getNotifications(req.user.id, filters);
  }

  // 获取未读数量
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  // 获取通知设置
  @Get('settings')
  async getSettings(@Request() req) {
    return this.notificationService.getSettings(req.user.id);
  }

  // 更新通知设置
  @Put('settings')
  async updateSettings(@Request() req, @Body() dto: UpdateSettingsDto) {
    return this.notificationService.updateSettings(req.user.id, dto);
  }

  // 标记单个通知为已读
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationService.markAsRead(parseInt(id), req.user.id);
  }

  // 全部标记为已读
  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.id);
    return { message: '已全部标记为已读' };
  }

  // 删除通知
  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req) {
    await this.notificationService.deleteNotification(parseInt(id), req.user.id);
    return { message: '通知已删除' };
  }

  // 生成Telegram绑定码
  @Post('telegram/bind-code')
  async generateBindCode(@Request() req) {
    const code = this.notificationService.generateTelegramBindCode(req.user.id);
    return {
      code,
      message: '绑定码已生成，10分钟内有效',
      instructions: `请在Telegram中搜索 @${process.env.TELEGRAM_BOT_USERNAME || 'ProxyHubBot'}，然后发送：/start ${code}`,
    };
  }

  // 解绑Telegram
  @Delete('telegram/unbind')
  async unbindTelegram(@Request() req) {
    await this.notificationService.unbindTelegram(req.user.id);
    return { message: 'Telegram已解绑' };
  }
}

